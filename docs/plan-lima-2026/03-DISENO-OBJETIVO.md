# 03 — Diseño objetivo

Arquitectura final al terminar el Sprint 3. Los trabajos la construyen por capas; este documento fija nombres, rutas, tablas y contratos para que no haya que decidirlos sobre la marcha.

## Flujo de datos

```
12 medios ──► news_scrapers ──┐
X / YouTube / (FB, IG, TikTok) ──► scheduler social ──┤
Wikipedia (página municipal Lima) / IEP / Ipsos / Datum / CPI ──► survey_scrapers ──┤
                                                                │
                                      lima_geo.detect_districts ◄┘  (ámbito + distritos en el guardado)
                                                                │
                                              classifier (Claude, lote de 20) ──► content_classifications
                                                                │                   (candidato, sentimiento hacia, tema, ataque→atacado, distritos)
                    ┌───────────────────────────────────────────┼──────────────────────────────┐
                    ▼                                           ▼                              ▼
             race (encuestas, SoV, sentimiento, temas)    alert_engine (cada 10 min)     territory (distritos, oportunidad)
                    │                                           │                              │
             daily_brief 07:00 ──► Telegram/Email         Telegram + sniffing /api/ingest ──► WS ──► frontend
                    │
             ai_recommendations (prompt municipal)
```

## Backend: módulos nuevos y modificados (`project-scrapping/app/`)

| Archivo | Sprint | Responsabilidad |
|---|---|---|
| `electoral_config.py` (nuevo) | S0-03 | Fechas, fase de campaña, `days_to()`, `campaign_phase()`; lee env. |
| `api/endpoints/electoral.py` (nuevo) | S0-03 | `GET /api/v1/electoral/config` |
| `services/lima_geo.py` (nuevo) | S0-06 / S1-08 | Gazetteer de 43 distritos + alias + barrios/avenidas; `detect_districts(text)`, `detect_scope(title, content)`, `ZONES`, `district_by_ubigeo` |
| `scrapers/survey_scrapers.py` → `WikipediaPollScraper` | S0-05 | Reescrito para la página municipal |
| `scrapers/news_scrapers.py` | S0-06 | Secciones Lima; `scope`/`districts` al guardar |
| `services/scheduler.py` | S0-06, S1-09, S1-10, S2-11 | + `run_scheduled_news_scraping`, + `classification_loop`, + `daily_brief_loop`, + `alert_loop` |
| `services/claude_client.py` (nuevo) | S1-09 | Único punto de creación del cliente `anthropic` + modelo por config |
| `services/classifier.py` (nuevo) | S1-09 | Clasificación estructurada en lote + persistencia |
| `services/race.py` (nuevo) | S1-10 | Promedio de encuestas, SoV, sentimiento neto, temas |
| `services/daily_brief.py` (nuevo) | S1-10 | Genera/guarda/envía el brief |
| `services/notify.py` (nuevo) | S1-10 | `send_telegram(text)`, `send_email(subject, html)` |
| `services/alert_engine.py` (nuevo) | S2-11 | Detección de picos/crisis/oportunidad/ataques |
| `services/territory.py` (nuevo) | S1-08 / S2-12 | Agregados por distrito/zona; score de oportunidad; impacto de evento |
| `api/endpoints/race.py`, `territory.py`, `alerts.py`, `events.py`, `results.py` (nuevos) | S1–S3 | Routers nuevos bajo `/api/v1/...` |
| `models.py` | S0-04, S1-09, S1-10, S2-11, S2-12, S3-15 | Columnas y modelos nuevos (ver tablas) |
| `scripts/apply_migrations.py`, `scripts/seed_lima_2026.py`, `scripts/backfill_scope.py`, `scripts/classify_backlog.py` (nuevos) | S0–S1 | Utilidades de operación |

Routers nuevos registrados en `app/api/__init__.py` con prefijos: `/electoral`, `/race`, `/territory`, `/alerts`, `/events`, `/results`.

## Esquema: cambios (todas las migraciones en `db/migrations/lima2026/NNN_*.sql`, runner `scripts/apply_migrations.py`, tabla de control `public.schema_migrations`)

| Migración | Sprint | Contenido |
|---|---|---|
| `001_political_figures_lima.sql` | S0-04 | `political_figures`: +`figure_role VARCHAR(30) DEFAULT 'candidate'`, +`is_own_candidate BOOLEAN DEFAULT FALSE`, +`list_name VARCHAR(200)`, +`color VARCHAR(20)`, +`zone_strength JSONB`. `scraped_surveys` antiguas: `results = results || '{"ambito":"presidencial_2026"}'`. |
| `002_scope_and_districts.sql` | S0-06 | `news_articles`: +`scope VARCHAR(30)`, +`districts JSONB`, +`topics JSONB`, +`classified BOOLEAN DEFAULT FALSE`; índice en `scope`. `raw_social_posts`: +`scope`, +`districts`, +`topics`, +`classified`. |
| `003_content_classifications.sql` | S1-09 | Tabla `public.content_classifications` (ver abajo). |
| `004_daily_briefs.sql` | S1-10 | Tabla `public.daily_briefs`. |
| `005_alerts.sql` | S2-11 | Tabla `public.alerts`. |
| `006_organization_lima.sql` | S2-12 | 43 filas en `organization.regions` (code = ubigeo, parent_code = 'LIM'); campaña "Lima Metropolitana 2026" (`election='municipal'`, `region_code='1501'`). |
| `007_election_results.sql` | S3-15 | Tabla `public.election_results`. |

### `content_classifications`
```
id UUID PK, content_type VARCHAR(10) ('news'|'social'), content_id VARCHAR NOT NULL,
figure_id VARCHAR NULL (FK lógica a political_figures.id), stance NUMERIC(4,3) (-1..1, sentimiento HACIA la figura),
stance_label VARCHAR(10) ('positivo'|'neutro'|'negativo'), topic VARCHAR(40), secondary_topics JSONB,
is_attack BOOLEAN DEFAULT FALSE, attacker_figure_id VARCHAR NULL, attacked_figure_id VARCHAR NULL,
districts JSONB, zone VARCHAR(20), summary VARCHAR(300), relevance NUMERIC(3,2) (0..1),
model VARCHAR(60), classified_at TIMESTAMP DEFAULT NOW(),
UNIQUE (content_type, content_id, COALESCE(figure_id,'')) — implementar como índice único sobre expresión
```
Una fila por (contenido, figura mencionada). Contenido sin figura → una fila con `figure_id NULL` (sirve para temas por zona).

### `daily_briefs`
```
id UUID PK, brief_date DATE UNIQUE, generated_at TIMESTAMP, model VARCHAR(60),
headline VARCHAR(300), body_markdown TEXT, data JSONB (métricas usadas), sent_channels JSONB, status VARCHAR(20)
```

### `alerts`
```
id UUID PK, figure_id VARCHAR NULL, kind VARCHAR(20) ('crisis'|'opportunity'|'attack'|'spike'),
severity VARCHAR(10) ('low'|'medium'|'high'|'critical'), title VARCHAR(300), detail TEXT,
metrics JSONB ({mentions_1h, baseline_1h, neg_share, velocity}), evidence JSONB ([{content_type, content_id, url, snippet}]),
suggested_response TEXT, status VARCHAR(20) DEFAULT 'open' ('open'|'acknowledged'|'dismissed'|'responded'),
created_at TIMESTAMP DEFAULT NOW(), acknowledged_at TIMESTAMP NULL, acknowledged_by VARCHAR NULL
```

### `election_results`
```
id UUID PK, ubigeo VARCHAR(6), district_name VARCHAR(100), figure_id VARCHAR NULL, list_name VARCHAR(200),
votes INTEGER, pct_valid NUMERIC(5,2), actas_pct NUMERIC(5,2), source VARCHAR(50), loaded_at TIMESTAMP DEFAULT NOW(),
UNIQUE (ubigeo, list_name, source)
```

## Contratos de API nuevos (todos con `Depends(get_current_user)`)

| Endpoint | Respuesta (forma) |
|---|---|
| `GET /api/v1/electoral/config` | `{election_name, election_type, election_date, candidacy_final_date, poll_blackout_from, rally_deadline, propaganda_deadline, debate_date, rounds, district, own_candidate, today, phase, days_to_election, days_to_propaganda_deadline, days_to_poll_blackout}` |
| `GET /api/v1/race/polls?base=validos&days=120` | `{polls:[{id, pollster, source, field_dates, published_at, sample_size, margin_error, base, candidates:[{name, figure_id, pct}], undecided, blank}], average:[{name, figure_id, pct, low, high, n_polls}], publishable: bool, blackout_from}` |
| `GET /api/v1/race/share-of-voice?days=7` | `{period_days, figures:[{figure_id, name, color, news_mentions, social_mentions, total, share_pct, trend_pct}]}` |
| `GET /api/v1/race/sentiment?days=7&zone=` | `{figures:[{figure_id, name, net_sentiment, positive, neutral, negative, by_zone:{Norte:{net,n},...}}]}` |
| `GET /api/v1/race/topics?days=1` | `{topics:[{topic, label, mentions, share_pct, delta_vs_prev_pct, net_sentiment, top_figure}]}` |
| `GET /api/v1/race/brief/latest` · `POST /api/v1/race/brief/generate` | fila de `daily_briefs` |
| `GET /api/v1/territory/districts?days=7&figure_id=` | `{districts:[{ubigeo, name, zone, electors, mentions, net_sentiment, top_topic, figures:{<figure_id>:{mentions, net}}}]}` |
| `GET /api/v1/territory/zones?days=7` | igual agregado por zona |
| `GET /api/v1/territory/opportunity?figure_id=` | `{figure_id, districts:[{ubigeo, name, zone, electors, undecided_share, own_strength, rival_strength, rival_name, topic_weight, score, rank, why}]}` |
| `GET /api/v1/alerts?status=open&limit=50` · `PUT /api/v1/alerts/{id}` `{status}` | filas de `alerts` |
| `GET/POST /api/v1/events` · `PUT/DELETE /api/v1/events/{id}` · `GET /api/v1/events/{id}/impact` | filas de `organization.events`; impacto `{before:{mentions,net}, after:{mentions,net}, delta_mentions_pct, delta_net}` |
| `GET/POST /api/v1/events/{id}/tasks` · `GET/POST /api/v1/volunteers` | CRUD simple |
| `POST /api/v1/results/upload` (CSV) · `GET /api/v1/results?source=` · `GET /api/v1/results/vs-opportunity?figure_id=` | S3-15 |

## Frontend: pantallas finales (`project-react/src/`)

| `activeSection` | Componente | Sprint |
|---|---|---|
| `dashboard` | `components/dashboard/Dashboard.tsx` (métricas reales + `AlertsPanel`) | S0-07, S2-11 |
| `monitoring` | `components/monitoring/MonitoringPage.tsx` (filtro "Solo Lima") | S0-06 |
| `social` | `components/social/SocialPage.tsx` con 5 tabs | S0-07 |
| `race` | `components/race/RacePage.tsx` (reemplaza `surveys`) | S1-10 |
| `territory` | `components/territory/TerritoryPage.tsx` (reemplaza `geo-demographics`) | S1-08, S2-12 |
| `recommendations` | existente + countdown por config + focos municipales | S0-03, S2-13 |
| `settings` | existente, tabs reducidos | S0-07 |

Hooks nuevos: `hooks/useElectoralConfig.ts`, `hooks/useRace.ts`, `hooks/useTerritory.ts`, `hooks/useAlerts.ts`, `hooks/useEvents.ts`. Datos estáticos nuevos: `data/lima-distritos.geo.json`, `data/limaDistricts.ts` (generado desde `referencia/distritos-lima.json`).

## Variables de entorno nuevas (añadir a `.env.example` en el trabajo que las introduce)

```
# S0-02
TWITTERAPI_IO_KEY=            # lo lee scheduler.py; TWITTER_BEARER_TOKEN queda como legado
FACEBOOK_GRAPH_TOKEN=         # alias aceptado: FACEBOOK_ACCESS_TOKEN
JWT_SECRET_KEY=
# S0-03
ELECTION_NAME=Elecciones Municipales de Lima Metropolitana 2026
ELECTION_TYPE=municipal
ELECTION_DATE=2026-10-04
CANDIDACY_FINAL_DATE=2026-09-05
POLL_BLACKOUT_FROM=2026-09-28
RALLY_DEADLINE=2026-10-01
PROPAGANDA_DEADLINE=2026-10-02
DEBATE_DATE=
ELECTION_ROUNDS=1
ELECTORAL_DISTRICT=Lima Metropolitana
OWN_CANDIDATE=
# S0-05
WIKIPEDIA_POLLS_URL=https://es.wikipedia.org/wiki/Elecciones_municipales_de_Lima_de_2026
# S1-09
CLAUDE_MODEL=claude-opus-5
CLAUDE_MODEL_CLASSIFIER=claude-opus-5
CLASSIFY_BATCH_SIZE=20
CLASSIFY_INTERVAL_MINUTES=15
CLASSIFY_DAILY_LIMIT=3000
# S1-10
BRIEF_HOUR_LIMA=7
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
BRIEF_SMTP_HOST=  BRIEF_SMTP_PORT=587  BRIEF_SMTP_USER=  BRIEF_SMTP_PASS=  BRIEF_RECIPIENTS=
# S2-11
ALERT_INTERVAL_MINUTES=10
ALERT_SPIKE_FACTOR=3.0
ALERT_MIN_MENTIONS=15
ALERT_NEG_SHARE=0.6
DEBATE_MODE=false
# S2-13 (opcional)
APIFY_TOKEN=
```
