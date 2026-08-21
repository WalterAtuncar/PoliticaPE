# S3-14 — Modo veda de encuestas y modo cierre

**Objetivo:** que la plataforma cambie de comportamiento sola en las fechas legales: desde `POLL_BLACKOUT_FROM` las encuestas son de uso interno y no publicables; desde `PROPAGANDA_DEADLINE` las recomendaciones excluyen propaganda y mítines; y que el equipo tenga una lista de verificación de cierre.

**Precondiciones:** S0-03, S1-10, S2-13. Antes de empezar, **confirmar fechas**: buscar "JNE resolución ERM 2026 encuestas publicación último día" y "JNE ERM 2026 propaganda electoral 24 horas antes". Si el JNE fijó otras fechas, actualizar `POLL_BLACKOUT_FROM` / `PROPAGANDA_DEADLINE` / `RALLY_DEADLINE` en `.env` y Railway. No cambies código por esto.

**Archivos a tocar:** `app/services/race.py`, `app/api/endpoints/race.py`, `app/services/daily_brief.py`, `app/services/ai_recommendations.py` (system prompt ya lee fase: verificar), `app/services/alert_engine.py` (mensajes), frontend `RacePage.tsx`, `PollAverageChart.tsx`, `ElectoralCountdown.tsx`, `RecommendationsPage.tsx`, nuevo `components/race/ClosingChecklist.tsx`.

## Pasos

1. `race.py`/`race.py` endpoint: cuando `not ec.polls_publishable()`:
   - `/race/polls` responde igual pero con `publishable: false` y cada encuesta con `published_at >= POLL_BLACKOUT_FROM` marcada `internal_only: true` (las encuestadoras pueden seguir haciendo encuestas privadas; si el equipo las carga a mano se guardan con `source` del pollster y `url` vacía).
   - Añadir `POST /race/polls/manual` (auth) para cargar una encuesta privada: `{pollster, field_dates, sample_size, base, candidates:[{name,pct}], undecided, blank}` → fila en `scraped_surveys` con `results.ambito='lima_metropolitana'`, `results.manual=true`.
2. `daily_brief.py`: en fase `poll_blackout` o `closing`, el prompt ya lo indica por `{phase}`; además, prefijar el brief con la línea `> VEDA DE ENCUESTAS — uso interno. No difundir cifras.` y omitir el envío por email de la sección "Carrera" si `BRIEF_EMAIL_STRIP_POLLS=true` (default true): implementar recortando el bloque `## Carrera` hasta el siguiente `## ` antes de `send_email`; Telegram recibe el brief completo (grupo interno).
3. `ai_recommendations.py`: verificar que el system prompt recibe `phase`, `propaganda_allowed`, `rallies_allowed`; añadir al final del system, solo cuando `not ec.propaganda_allowed()`: `"RESTRICCIÓN VIGENTE: está prohibida toda propaganda electoral. Solo recomienda respuesta de prensa, gestión de crisis, defensa legal, logística del día de la elección y personeros."`; cuando `not ec.rallies_allowed()`: `"RESTRICCIÓN: prohibidas reuniones y manifestaciones públicas."`. Cambiar el default de `Category` permitido en esas fases (filtrar en post-proceso las categorías `ground_game` y `digital_push` si `not propaganda_allowed`).
4. `alert_engine.py`: en fase `closing`/`election_day`, la respuesta sugerida usa el mismo prompt pero el `user` añade "Fase: cierre — no se puede hacer propaganda; solo declaraciones de prensa y acciones legales".
5. Frontend:
   - `RacePage.tsx`: banner de veda (ya existe el `publishable` de S1-10) + botón "Cargar encuesta interna" (formulario → `POST /race/polls/manual`) visible solo en veda.
   - `PollAverageChart.tsx`: marcar con una línea vertical punteada la fecha `poll_blackout_from` y sombrear el tramo posterior.
   - `ElectoralCountdown.tsx`: en `closing` mostrar "Propaganda cerrada desde {propaganda_deadline}"; en `election_day` "Día de la elección".
   - `RecommendationsPage.tsx`: en `closing` ocultar los focos `ground_game` y `digital_push` del selector.
   - `ClosingChecklist.tsx` (en Carrera, visible desde 7 días antes de la elección): lista estática con checkboxes persistidos en `localStorage`:
     1. Retirar propaganda física y pauta digital antes del cierre (`propaganda_deadline` 23:59).
     2. Suspender publicaciones pagadas; programar solo contenido informativo (local de votación, horario).
     3. Acreditar personeros de mesa y de local (plazo JNE/ONPE).
     4. Ley seca: desde el sábado 3-oct 08:00 hasta el domingo 16:00 (recordatorio al equipo).
     5. Centro de acopio de incidencias: canal Telegram + teléfono de legal.
     6. Plan de comunicaciones para la noche electoral: 3 escenarios (gana / pierde / ajustado).
     7. Verificar que el scraper de resultados (S3-15) está configurado.
   - Las fechas del checklist se leen de `useElectoralConfig()`; no hardcodear.

## Criterios de aceptación

1. Prueba de fechas sin esperar: levantar el backend con `POLL_BLACKOUT_FROM=2026-08-01 PROPAGANDA_DEADLINE=2026-08-01 RALLY_DEADLINE=2026-08-01` (solo en local) y comprobar: `/electoral/config` → `phase: "closing"`, `/race/polls` → `publishable: false`; una generación de recomendaciones no devuelve `ground_game` ni `digital_push` y menciona la restricción en `legal_check`; el brief generado empieza con la línea de veda.
2. Restaurar las fechas reales en `.env` y volver a comprobar `phase` correcto.
3. `POST /race/polls/manual` guarda y aparece en `/race/polls` con `internal_only: true` si la fecha está en veda.
4. UI: banner, línea de veda en el gráfico y checklist visibles bajo las fechas simuladas.
5. `npx tsc --noEmit && npm run build` OK.

## Commit

`feat(lima2026): S3-14 modo veda de encuestas, modo cierre de propaganda y checklist de cierre`
