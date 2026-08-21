# S2-12 — Score de oportunidad por distrito y módulo de eventos

**Objetivo:** ordenar los 43 distritos por dónde conviene invertir la siguiente caminata/mitin/pauta, registrar eventos y tareas del equipo de calle, y medir si cada evento movió la conversación en su distrito.

**Precondiciones:** S1-08, S1-09, S1-10. `[WALTER]` `OWN_CANDIDATE` (display_name) y `OWN_PARTY_SLUG` (slug en `organization.parties`, p. ej. `renovacion-popular`, `somos-peru`, `avanza-pais`). Sin `OWN_CANDIDATE` el endpoint exige `figure_id` explícito.

**Archivos a tocar:**
- nuevo `db/migrations/lima2026/006_organization_lima.sql` (ejecutar con `OWN_PARTY_SLUG` en env)
- `app/services/territory.py` (+ `opportunity`, `event_impact`, `TOPIC_WEIGHTS`)
- `app/models.py` (+ `Event`, `Task`, `Volunteer`, `Venue` con `schema='organization'`)
- nuevos `app/api/endpoints/events.py`; `app/api/endpoints/territory.py` (+ `/opportunity`); `app/schemas.py` (+ Event/Task/Volunteer schemas); `app/api/__init__.py`
- frontend: `config/api.ts`, nuevos `hooks/useEvents.ts`, `components/territory/OpportunityList.tsx`, `components/territory/EventsPanel.tsx`; `TerritoryPage.tsx`, `LimaMap.tsx` (métrica `oportunidad`)

## Fórmula de oportunidad (fijada; no la cambies)

Para la figura propia `F` y cada distrito `d` (zona `z`):

```
electors_d           = padrón del distrito (normalizado a 0..1 dividiendo por el máximo, SJL)
undecided_z          = indecisos + blanco/viciado de la última encuesta con segmentación por zona si existe en results (clave opcional 'por_zona'); si no, 0.30 para todas las zonas
own_strength_z       = % de F en la zona según la última encuesta con 'por_zona'; si no existe, pct promedio de F (race.poll_average) × factor_zona, donde factor_zona = (1 + net_sentiment_F_z) si hay ≥ 20 menciones de F en z en 30 días, si no 1.0
rival_strength_z     = máximo de own_strength análogo entre las otras figuras candidate (rival_name = quién lo alcanza)
gap_z                = max(0, rival_strength_z - own_strength_z) / 100
topic_weight_d       = TOPIC_WEIGHTS[top_topic_d] (tabla en referencia/temas-municipales.md); 0.3 si no hay tema
presence_penalty_d   = 1 - min(1, mentions_F_d_30d / 50)        # donde ya hay mucha conversación propia, menos prioridad

score_d = 100 * electors_d * undecided_z * (0.5 + gap_z) * (0.5 + topic_weight_d) * (0.5 + 0.5 * presence_penalty_d)
```

`why` = frase con los factores: "SJL: 770 mil electores · 32 % indecisos en Lima Este · rival Urresti +6 pts · tema: extorsión · presencia propia baja (3 menciones)".

## Pasos

1. Migración 006: `OWN_PARTY_SLUG=<slug> python scripts/apply_migrations.py`. Verificar `SELECT name, election, region_code FROM organization.campaigns` incluye "Lima Metropolitana 2026".
2. `models.py`: modelos `Venue`, `Event`, `Task`, `Volunteer` mapeando exactamente las columnas del DDL (`db/ddl_postgres_final.sql` 407-491); `event_type`/`status`/`priority` como `String` (los enums de PG aceptan strings válidos; no declarar `Enum` de SQLAlchemy para no chocar con los tipos existentes). `id` con `default=lambda: str(uuid.uuid4())`; `tenant_id` se resuelve en el endpoint desde `identity.tenants LIMIT 1`; `campaign_id` = id de "Lima Metropolitana 2026".
3. `schemas.py`: `EventCreate(title, event_type, start_at, end_at?, district_ubigeo, venue_name?, description?, expected_attendance?)`, `EventUpdate(... , actual_attendance?, status?)`, `EventResponse`, `TaskCreate(title, priority='medium', due_date?, description?, assigned_user_id?)`, `TaskResponse`, `VolunteerCreate(name, phone?, email?, district_ubigeo?)`. `district_ubigeo` se guarda en `events.region_code` / `volunteers.region_code`.
4. `app/api/endpoints/events.py` (prefijo `/events`): `GET /` (filtros `from`, `to`, `district`), `POST /`, `PUT /{id}`, `DELETE /{id}`, `GET /{id}/impact`, `GET /{id}/tasks`, `POST /{id}/tasks`, `PUT /tasks/{task_id}`, `GET /volunteers`, `POST /volunteers`. Todos con auth. Al crear un evento con `venue_name`, crear/buscar `organization.venues` por nombre.
5. `territory.py`:
   - `TOPIC_WEIGHTS` (copiar de referencia).
   - `opportunity(db, figure_id) -> List[dict]` con la fórmula; usa `race.polls`, `race.poll_average`, `race.sentiment(zone=...)` y `district_stats(days=30)`. Salida ordenada por `score` desc con `rank`.
   - `event_impact(db, event) -> dict`: ventana `[start_at - 48h, start_at)` vs `[start_at, start_at + 48h]`, filtrando `content_classifications` por `districts @> [{"ubigeo": region_code}]` y, si `OWN_CANDIDATE`, `figure_id` propio; devuelve `{before:{mentions, net}, after:{mentions, net}, delta_mentions_pct, delta_net}`; si el evento es futuro o `after` tiene < 48 h, `partial: true`.
6. `territory.py` endpoint `GET /territory/opportunity?figure_id=` (si falta `figure_id`, usar la figura con `is_own_candidate = true`; si no hay, 400 con mensaje "Define OWN_CANDIDATE o pasa figure_id").
7. Frontend:
   - `config/api.ts`: `TERRITORY_OPPORTUNITY`, `EVENTS`, `VOLUNTEERS`.
   - `LimaMap.tsx`: nueva métrica `opportunity` (escala blanco → `#B8741A`).
   - `OpportunityList.tsx`: top 15 distritos con rank, score (barra), `why`, botón "Programar evento aquí" que abre `EventsPanel` con el distrito preseleccionado.
   - `EventsPanel.tsx`: lista de próximos eventos (tipo, título, distrito, fecha, asistencia esperada/real, impacto si existe con Δ menciones y Δ neto) + formulario de alta (título, tipo — select con `tour|rally|debate|press|fundraising|meeting` y etiquetas en español —, distrito — select de 43 —, fecha/hora, lugar, asistencia esperada) + tareas por evento (título, prioridad, fecha, estado con toggle).
   - `TerritoryPage.tsx`: pestañas internas "Mapa" (existente), "Oportunidad", "Eventos".

## Criterios de aceptación

1. `GET /territory/opportunity` (con `OWN_CANDIDATE`) → 43 filas, `score` descendente, SJL/SMP/Ate/Comas/VMT/VES/SJM en el top 12, cada fila con `why` legible.
2. `POST /events` con `{title:"Caminata Canto Grande", event_type:"tour", start_at:"2026-09-14T09:00:00-05:00", district_ubigeo:"150132", expected_attendance:200}` → 201/200; `GET /events` lo lista; `GET /events/{id}/impact` devuelve `partial: true`.
3. `POST /events/{id}/tasks` y `PUT /events/tasks/{task_id} {status:"done"}` funcionan; `SELECT count(*) FROM organization.tasks` > 0.
4. `SELECT count(*) FROM organization.regions WHERE parent_code='LIM'` = 43.
5. UI: pestaña Oportunidad muestra el ranking y el mapa en métrica "oportunidad"; crear un evento desde la lista funciona.
6. `npx tsc --noEmit && npm run build` OK.

## Commit

`feat(lima2026): S2-12 score de oportunidad territorial, eventos/tareas/voluntarios e impacto de evento`
