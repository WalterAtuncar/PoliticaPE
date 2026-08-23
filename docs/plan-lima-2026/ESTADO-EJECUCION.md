# Estado de ejecución del plan Lima 2026

**Última actualización: 2026-08-21** (ejecución completa del plan en una sesión).
Empieza por aquí si retomas el proyecto.

## Resumen

Los 15 trabajos del plan (`sprint-0/` a `sprint-3/`) están **ejecutados, commiteados y desplegados**.
Rama `lima-2026` mergeada a `main` (merge `785a0a1`). Producción viva en
https://politicape-web-production.up.railway.app

| Sprint | Trabajos | Commits |
|---|---|---|
| 0 · Encender y apuntar a Lima | S0-01 … S0-07 | `da55a13`, `4bd9c92`, `3d044ff`, `d12be91`, `bfd497a`, `90b4aba`, `9eb1aef` |
| 1 · Resolución de distrito | S1-08 … S1-10 | `55d64be`, `68d3d7d`, `7d3bfff` |
| 2 · Operar la campaña | S2-11 … S2-13 | `d9c738b`, `df5b494`, `efd9798` |
| 3 · Veda y día D | S3-14, S3-15 | `d46fba7`, `7b22dc3` |

El commit `d714a36` (`chore(mvp)`) rescató el sprint de mayo que llevaba tres meses sin commitear.

## Qué quedó funcionando

- **26 endpoints nuevos**: `/electoral/config`, `/race/*` (encuestas, promedio, share of voice,
  sentimiento, temas, brief), `/territory/*` (distritos, zonas, oportunidad, catálogo),
  `/alerts`, `/events/*` (eventos, tareas, voluntarios, impacto), `/results/*`.
- **5 loops automáticos** en el scheduler (ver `CLAUDE.md`).
- **Frontend de 7 pantallas**: Panel · Prensa · Redes · Carrera · Territorio · Recomendaciones IA ·
  Configuración. Se retiraron las pantallas con datos de ejemplo.
- **7 migraciones** aplicadas en Neon (`schema_migrations` lo registra).

### Datos al cierre de la sesión

| Tabla | Filas | De Lima |
|---|---|---|
| `news_articles` | 1 502 | 121 |
| `raw_social_posts` | 1 408 | 183 |
| `scraped_surveys` | 180 | 54 municipales (24 base válidos + 30 base total) |
| `political_figures` | 24 activas | 21 candidatos + Reggiardo + MML + Presidencia |
| `organization.regions` | 43 distritos con `parent_code='LIM'` | — |
| `content_classifications`, `alerts`, `daily_briefs`, `election_results` | 0 | esperan `ANTHROPIC_API_KEY` |

El promedio ponderado de encuestas funciona con datos reales: **López Aliaga 27,8 [25,4–30,2]** con
3 encuestas (Ipsos 28, CIT 32, Datum 21,4 · semivida 14 días).

## Bloqueado: requiere acción de Walter

Sin esto el sistema recolecta y muestra, pero no razona ni avisa.

| # | Qué falta | Qué desbloquea | Cómo se aplica |
|---|---|---|---|
| 1 | `ANTHROPIC_API_KEY` | **La llave grande.** Clasificación IA → share of voice, sentimiento por zona, temas, brief diario, recomendaciones, respuestas sugeridas de alertas | `railway variables --service politicape-web --set "ANTHROPIC_API_KEY=..."` y en `.env` local |
| 2 | `TWITTERAPI_IO_KEY`, `YOUTUBE_API_KEY` | Scraping de redes (la prensa ya corre sola) | igual |
| 3 | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Que alertas y brief lleguen al equipo | @BotFather → grupo → `getUpdates` para el chat_id |
| 4 | `OWN_CANDIDATE`, `OWN_PARTY_SLUG` | Personaliza oportunidad territorial y recomendaciones (hoy corren en modo observador) | variable + `python scripts/seed_lima_2026.py --own "Nombre Exacto"` |
| 5 | `ONPE_RESULTS_URL` | Carga automática de resultados | **solo el 4-oct**: abrir el portal de ONPE, ver en la pestaña de red qué URL JSON da resultados por ubigeo |

Nada de esto exige tocar código: el sistema los toma en el siguiente ciclo.

## Primeros pasos al retomar

1. `git pull` y confirmar que `main` está en `785a0a1` o posterior.
2. Comprobar que producción sigue viva: `curl -s https://politicape-web-production.up.railway.app/health`
3. Revisar cuánto creció la base (el scheduler lleva días corriendo):
   ```sql
   SELECT scope, count(*) FROM news_articles GROUP BY 1;
   SELECT count(*) FROM content_classifications;
   ```
4. Si ya hay `ANTHROPIC_API_KEY`: `python scripts/classify_backlog.py --max 600` y verificar que
   `/race/share-of-voice`, `/race/topics` y `/territory/districts` dejan de salir en cero.

## Verificado con datos reales durante la ejecución

- `lima_geo.detect_scope`: 7/7 casos de precisión (Arequipa ≠ Lima, Callao excluido, Sedapal/ATU/Metro sí).
- Scraper de encuestas: 54 filas, dos bases, sin duplicados al re-ejecutar, fechas de campo correctas.
- Motor de alertas con 20 clasificaciones sintéticas: crisis crítica, dedup por hora, 10 evidencias.
- Oportunidad territorial: los 7 distritos más poblados quedan en el top 12.
- Resultados: 43 distritos × 3 listas ficticias, Spearman 0,501, datos de prueba borrados después.
- Persistencia del clasificador probada sin API: mapeo de figuras/distritos desconocidos y upsert idempotente.

## Panel de campaña (23-ago-2026)

El Panel (pantalla de inicio) se reescribió para la demo a Renovación Popular. Plan y trabajos en
`docs/plan-demo-panel/`; commits `547bbe5` (P-01) a `bc3850c` (P-07).

Qué hay ahora: cabecera con candidato, fase legal y hitos; 4 KPI (intención de voto, share of voice,
presión mediática, tema dominante); evolución de encuestas; alertas abiertas con respuesta sugerida;
mapa de oportunidad y top 5 distritos; temas de la semana; brief diario; últimas noticias de Lima
clasificadas; top 3 recomendaciones. Todo con datos reales vía `useDashboard`, que compone los
endpoints existentes (no hay agregador nuevo en el backend).

Qué se borró, por ser de la etapa presidencial: `useDashboardData`, `TrendChart`, `GeographicMap`,
`MetricCard`, `RealtimeAlerts`.

**Rutina de la mañana antes de una demo** (detalle en `docs/plan-demo-panel/jobs/P-06...`):

```bash
TOK=$(curl -s -X POST $B/auth/login -H "Content-Type: application/json"   -d '{"email":"admin@politica.pe","password":"password123"}' | python -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s -X POST -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" -d '{}' $B/scraping/trigger/news
cd project-scrapping && python scripts/classify_backlog.py --max 300
curl -s -X POST -H "Authorization: Bearer $TOK" "$B/race/brief/generate?send=false&force=true"
```

## Deuda conocida (no bloquea)

- El motor de alertas corre en **modo prensa** (`ALERT_WINDOW_MINUTES=1440`, `ALERT_MIN_MENTIONS=3`,
  `ALERT_ATTACK_MIN=2`). Con la ventana de 60 min original nunca disparaba: el candidato recibe 2-7 notas
  al día, no por hora. Cuando se activen `TWITTERAPI_IO_KEY`/`YOUTUBE_API_KEY`, volver a 60 / 15 / 5.

- Bundle del frontend en ~1,3 MB: falta *code splitting*.
- `analysis.py` sigue leyendo ventanas con `datetime.now()` (hora local) mientras el resto escribe en UTC.
  Con ventanas de 7–30 días el desfase de 5 h es ruido, pero conviene unificar.
- `app/tasks/` y `app/celery_app.py` son código muerto (Celery); `pandas` y `celery` no están en
  `requirements.txt` a propósito.
- `Docs/09-ESTADO-ROADMAP.md` (carpeta antigua, fuera de `docs/`) quedó obsoleto: describe la etapa presidencial.
- El debate del JNE para Lima no tenía fecha publicada al 21-ago: `DEBATE_DATE` está vacío.
