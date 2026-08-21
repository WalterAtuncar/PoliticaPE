# S1-10 — Tablero de carrera y brief diario

**Objetivo:** la pantalla que el equipo mira cada mañana (promedio de encuestas con banda, share of voice, sentimiento neto por zona, tema del día) y el brief automático de las 07:00 por Telegram/correo.

**Precondiciones:** S0-05 (encuestas municipales), S1-08, S1-09 (clasificaciones). Telegram: `[WALTER]` crea un bot con @BotFather, obtiene `TELEGRAM_BOT_TOKEN`, crea un grupo con el equipo, añade el bot y obtiene `TELEGRAM_CHAT_ID` (enviar un mensaje al grupo y leer `https://api.telegram.org/bot<token>/getUpdates`).

**Archivos a tocar:**
- nuevo `db/migrations/lima2026/004_daily_briefs.sql`
- nuevos `app/services/race.py`, `app/services/notify.py`, `app/services/daily_brief.py`, `app/api/endpoints/race.py`
- `app/models.py` (+ `DailyBrief`), `app/api/__init__.py`, `app/services/scheduler.py` (+ `daily_brief_loop`)
- `app/api/endpoints/analysis.py` (share-of-voice: reemplazar diccionarios hardcodeados, H7)
- frontend: `config/api.ts`, nuevos `hooks/useRace.ts`, `components/race/RacePage.tsx`, `PollAverageChart.tsx`, `PollsTable.tsx`, `ShareOfVoiceBars.tsx`, `ZoneSentimentGrid.tsx`, `TopicsToday.tsx`, `BriefPanel.tsx`; `Sidebar.tsx`, `Header.tsx`, `MainApp.tsx`
- `.env.example` (bloque `# S1-10`)

## Pasos — backend

1. Migración 004 (copiar y aplicar). Modelo `DailyBrief` en `models.py` con las columnas de la tabla.
2. `app/services/race.py`:
   - `polls(db, base="validos", days=120)`: filas de `scraped_surveys` con `results->>'ambito' = 'lima_metropolitana'` y `results->>'base' = base`, `published_at >= hoy - days`, ordenadas desc. Serializar cada una: `{id, pollster, source, field_dates, published_at, sample_size, margin_error, base, candidates:[{name, figure_id, pct}], undecided, blank}` donde `figure_id` se resuelve por `display_name` (dict de figuras activas; `None` si no existe, p. ej. Luis Rubio).
   - `poll_average(polls, half_life_days=14)`: por candidato, sobre las encuestas de los **últimos 35 días** que lo incluyan con `pct` no nulo: `w = sqrt(sample_size or 400) * 0.5 ** (age_days / half_life_days)`; `pct = Σ(w·pct)/Σw`; banda: `low/high = pct ∓ 1.96 * sqrt(pct*(100-pct)/n_eff)` con `n_eff = (Σw)² / Σw²` escalado a muestra (`n_eff_sample = n_eff * mean(sample_size)` → usar `n_eff_sample`); `n_polls`. Devolver ordenado por `pct` desc.
   - `share_of_voice(db, days)`: por figura activa (`figure_role in ('candidate','incumbent')`), `news_mentions` = `count(distinct content_id)` en `content_classifications` con `content_type='news'`, `social_mentions` idem `'social'`, en `content_published_at >= since`; `share_pct` sobre el total de figuras; `trend_pct` = variación vs. el periodo anterior de igual longitud. Incluir `name`, `color`, `party_name`.
   - `sentiment(db, days, zone=None)`: por figura, `positive/neutral/negative` (conteo por `stance_label`), `net_sentiment = (pos - neg) / total`; `by_zone` = mismo cálculo agrupado por `zone` (las 5 zonas, `n` y `net`).
   - `topics(db, days)`: `count(distinct content_id)` por `topic` en el periodo, `share_pct`, `delta_vs_prev_pct` (periodo anterior), `net_sentiment` medio (`stance` de filas con figura), `top_figure` (figura con más menciones en ese tema). Etiquetas desde un dict `TOPIC_LABELS` en `classifier.py`.
3. `app/api/endpoints/race.py`: `GET /polls?base=validos&days=120` → `{polls, average, publishable: ec.polls_publishable(), blackout_from}`; `GET /share-of-voice?days=7`; `GET /sentiment?days=7&zone=`; `GET /topics?days=1`; `GET /brief/latest`; `POST /brief/generate` (llama `daily_brief.generate_and_send(db, send=True)`, devuelve la fila). Registrar con prefijo `/race`.
4. `analysis.py` `get_share_of_voice` (l. 211-305): sustituir los dicts `parties` y `figures` por datos de `political_figures` activas (`keywords = search_keywords + [nickname]`, `color` de la figura; partidos = `party_name` agrupado). El resto de la lógica (conteo por `combined_text.count`) se conserva como fallback cuando no hay clasificaciones.
5. `app/services/notify.py`:
   ```python
   import os, smtplib, httpx
   from email.mime.text import MIMEText

   def send_telegram(text: str) -> bool:
       token, chat = os.getenv("TELEGRAM_BOT_TOKEN"), os.getenv("TELEGRAM_CHAT_ID")
       if not token or not chat:
           return False
       for chunk in [text[i:i+3900] for i in range(0, len(text), 3900)]:
           r = httpx.post(f"https://api.telegram.org/bot{token}/sendMessage",
                          json={"chat_id": chat, "text": chunk, "parse_mode": "Markdown", "disable_web_page_preview": True}, timeout=20)
           if r.status_code != 200:
               r = httpx.post(f"https://api.telegram.org/bot{token}/sendMessage", json={"chat_id": chat, "text": chunk}, timeout=20)
               if r.status_code != 200:
                   return False
       return True

   def send_email(subject: str, body_markdown: str) -> bool:
       host, user, pwd, to = os.getenv("BRIEF_SMTP_HOST"), os.getenv("BRIEF_SMTP_USER"), os.getenv("BRIEF_SMTP_PASS"), os.getenv("BRIEF_RECIPIENTS")
       if not all([host, user, pwd, to]):
           return False
       msg = MIMEText(body_markdown, "plain", "utf-8")
       msg["Subject"], msg["From"], msg["To"] = subject, user, to
       with smtplib.SMTP(host, int(os.getenv("BRIEF_SMTP_PORT", "587"))) as s:
           s.starttls(); s.login(user, pwd); s.sendmail(user, to.split(","), msg.as_string())
       return True
   ```
6. `app/services/daily_brief.py`:
   - `collect_data(db, brief_date)`: construye el dict con las claves exactas de `referencia/prompts/brief-diario.md` usando `race.*`, `territory.district_stats`, `content_classifications` (top_items y attacks_1d), `alerts` (si la tabla existe; antes de S2-11 devuelve `[]`) y `organization.events` (si hay modelo; antes de S2-12 `[]`).
   - `generate(db, brief_date=None, send=False)`: si ya existe brief para la fecha y `send=False`, devolverlo; si no, llamar a Claude con SYSTEM/USER del prompt (`output_config={"effort":"high"}`, `max_tokens=4000`), guardar `headline` (primera línea sin `# `), `body_markdown`, `data`, `model`; si `send`, `send_telegram(body)` y `send_email(f"Brief Lima 2026 — {fecha}", body)`, guardar `sent_channels` y `status`.
   - Ventana de datos: de ayer 07:00 a hoy 07:00 hora Lima (`ZoneInfo("America/Lima")`), convertida a UTC para las consultas.
7. `scheduler.py`: `daily_brief_loop()` que calcula el próximo `BRIEF_HOUR_LIMA` (default 7) en `America/Lima`, duerme hasta entonces, ejecuta `daily_brief.generate(db, send=True)` en `to_thread`, y repite. Arrancar en `start_scheduler()` solo si `ANTHROPIC_API_KEY` existe.

## Pasos — frontend

8. `config/api.ts`: `RACE_POLLS`, `RACE_SOV`, `RACE_SENTIMENT`, `RACE_TOPICS`, `RACE_BRIEF_LATEST`, `RACE_BRIEF_GENERATE`.
9. `hooks/useRace.ts`: `useRace({days})` → `{polls, average, publishable, sov, sentiment, topics, brief, isLoading, refetch, generateBrief}`.
10. `components/race/`:
    - `RacePage.tsx`: cabecera "Carrera — Alcaldía de Lima 2026" + countdown compacto (reutilizar `useElectoralConfig`); si `!publishable` banner ámbar "Veda de encuestas: las cifras de encuestas son de uso interno; no publicar". Grid: `PollAverageChart` (ancho completo), `PollsTable`, `ShareOfVoiceBars`, `ZoneSentimentGrid`, `TopicsToday`, `BriefPanel`.
    - `PollAverageChart.tsx`: Recharts `ComposedChart`: una `Line` por candidato (top 7 por promedio, color de la figura) con puntos = encuestas individuales (`Scatter`) y la línea = promedio móvil por fecha (calcular en cliente el promedio ponderado para cada fecha de encuesta usando la misma fórmula, half-life 14 días); `Area` translúcida `low–high` solo para el líder y el segundo. Eje X fechas `es-PE`, eje Y 0–40.
    - `PollsTable.tsx`: encuestadora, fechas de campo, muestra, base, top 5 candidatos con %, indecisos; toggle `válidos / total`.
    - `ShareOfVoiceBars.tsx`: barras horizontales por figura, dos segmentos (prensa/redes), % y flecha de tendencia.
    - `ZoneSentimentGrid.tsx`: tabla figuras × 5 zonas, celda con color por neto (misma escala que el mapa) y `n` pequeño.
    - `TopicsToday.tsx`: barras por tema (etiquetas `TOPIC_LABELS`), delta vs. semana, chip con `top_figure`.
    - `BriefPanel.tsx`: render Markdown simple (usar un conversor mínimo propio: encabezados `#`, listas `-`/`1.`, negrita `**`; no añadir dependencias) del último brief, fecha, botón "Generar ahora" (`POST /race/brief/generate`) con spinner.
11. `Sidebar.tsx`: reemplazar `surveys` por `{ id: 'race', label: 'Carrera', icon: Flag }`; `Header.tsx` `race: 'Carrera — Alcaldía de Lima 2026'`; `MainApp.tsx` `case 'race'` y eliminar `SurveysPage` del switch (archivo se conserva).

## Criterios de aceptación

1. `/race/polls?base=validos` → `average[0].name == "Rafael López Aliaga"`, `average[0].pct` entre 18 y 30, `low < pct < high`, `n_polls >= 3`; `publishable: true` (antes del 28-sep).
2. `/race/share-of-voice?days=30` → figuras con `total > 0` y `share_pct` sumando 100 ± 0,5.
3. `/race/sentiment?days=30` → cada figura trae `by_zone` con las 5 claves.
4. `/race/topics?days=7` → `topics[0].share_pct > 0` y etiquetas en español.
5. `POST /race/brief/generate` → fila con `headline` no vacío, `body_markdown` con los 7 encabezados obligatorios (`grep -c "^## " ≥ 6`), y si hay Telegram configurado `sent_channels.telegram == true` (mensaje recibido en el grupo).
6. Log: `[Brief] próximo envío <fecha> 07:00 America/Lima`.
7. `npx tsc --noEmit && npm run build` OK; la página Carrera renderiza las 6 piezas con datos reales.

## Commit

`feat(lima2026): S1-10 tablero de carrera (/race), promedio de encuestas, brief diario 07:00 por Telegram/correo`
