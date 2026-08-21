# 02 — Estado real del código (working tree del 24-may-2026 sobre commit `8535f1c`)

Inventario verificado leyendo archivos y consultando Neon. Úsalo para ubicarte; las líneas citadas son del estado actual y se mueven al editar.

## Git

- Último commit: `8535f1c Published your App` (2026-02-28, era Replit). Remotes: `origin` = `https://github.com/WalterAtuncar/PoliticaPE`, `gitsafe-backup` (ignorar).
- Working tree **sin commitear**: 49 modificados, 85 borrados (limpieza Replit), 8 sin trackear: `.agents/`, `.config/`, `.local/`, `.dockerignore`, `.env.example`, `ARCHITECTURE.md`, `Dockerfile.sniffing`, `Dockerfile.web`, `project-scrapping/app/api/deps.py` (**toda la capa JWT**).
- Trackeados indebidamente: `project-react/dist/index.html` y `**/__pycache__/*.pyc` (aparecen como modificados). `.gitignore` ya excluye `dist/` y `__pycache__/` pero los archivos quedaron del pasado.

## Servicios

| Servicio | Entrada | Puerto local | Notas |
|---|---|---|---|
| Backend scrapping (FastAPI) | `project-scrapping/app/main.py` → ASGI wrapper `app()` que construye FastAPI en background (`_build_fastapi_app`) | 8000 | `serve.py` arranca con health-socket previo. Routers en `app/api/__init__.py` bajo `/api/v1`. Proxy a sniffing en `_setup_proxy_routes`. Scheduler se arranca en `_build_fastapi_app`. |
| Sniffing (FastAPI) | `project-sniffing/microservice/main.py` | 8080 | Lexicón de ~30 palabras, entidades Boluarte/Castillo, persiste en `realtime_data.live_streams` (0 filas). Endpoints: `/api/analyze`, `/api/recent`, `/api/crisis-alerts`, `/api/trending`, `WS /ws/stream`. |
| Frontend (Vite/React 18/TS) | `project-react/src/main.tsx` → `pages/MainApp.tsx` | 5000 | Navegación por `activeSection` string en `MainApp.tsx` + `components/layout/Sidebar.tsx` (`menuItems`) + `Header.tsx` (títulos líneas 32-39). Proxy Vite: `/api/v1`→8000, `/api/analyze|metrics|recent|crisis-alerts`→8080, `/ws`→8080. |

Auth: JWT HS256 en `app/api/deps.py` (`JWT_SECRET_KEY` env, default inseguro). Login `POST /api/v1/auth/login {email,password}` → `{token,user}`. Usuario demo `admin@politica.pe` / `password123` (creado por `_create_demo_user`). Frontend guarda `auth_token` en localStorage; `config/api.ts` expone `getAuthHeaders()`, `ENDPOINTS`, `fetchFromScrapping`, `postToScrapping`.

## Base de datos Neon (conteos al 21-ago-2026)

| Tabla | Filas | Estado |
|---|---|---|
| `public.news_articles` | 892 | Último scrape 2026-05-24. Columnas: source,title,content,author,published_at,scraped_at,url,category,tags,sentiment_score,political_entities,processed |
| `public.raw_social_posts` | 1 408 | youtube 1 282 (may-24), twitter 78 (ene), instagram 48 (ene). `geographic_location`: 1 268 NULL, 8 "Lima, Perú". Columnas incluyen `region` |
| `public.scraped_surveys` | 96 | Todas presidenciales. `results` JSON con `tipo`, `candidatos[]` (solo el líder), `lider`, etc. |
| `public.government_data` | 13 | |
| `public.political_figures` | **0** | Columnas: full_name, display_name, nickname, photo_url, party_name, current_position, region, search_keywords JSON, social_accounts JSON, is_active, monitoring_priority, notes |
| `public.search_tags` | 10 | `Boluarte, Dina Boluarte, acuña, carlos álvarez, forsyth, keiko fujimori, lópez aliaga, lópez chau, presidenta Peru, test` — todos activos |
| `public.ai_recommendations` | 0 | |
| `public.social_api_tokens` | 0 | |
| `public.scraping_logs` | 406 | |
| `realtime_data.live_streams` | 0 | |
| `organization.campaigns` | 1 | "Campaña Nacional 2026", election=`presidential` |
| `organization.parties` | 10 | Incluye Renovación Popular, Somos Perú, Avanza País, FP, APP, AP, JPP, PL, Morado, PPC? (ver seed_parties.py: 9 definidos + 1) |
| `organization.regions` | 26 | 25 departamentos + 1 |
| `organization.events/tasks/volunteers/venues/donations/attendance/programs/projects` | 0 | Tablas existen (DDL en `db/ddl_postgres_final.sql` 407-520), **sin modelos SQLAlchemy ni endpoints** |
| `identity.users` | 2 | |

Enums existentes: `election_type ('presidential','congressional','regional','municipal')`, `event_type ('tour','rally','debate','press','fundraising','meeting')`, `task_status`, `task_priority`.

No hay Alembic. `db/align_schema.sql` es el precedente de migración manual idempotente.

## Hallazgos que el plan corrige (con ubicación exacta)

| # | Hallazgo | Dónde | Trabajo |
|---|---|---|---|
| H1 | Fechas presidenciales hardcodeadas: `campaign_deadline = date(2026, 4, 10)` y texto "12 de abril de 2026" | `app/services/ai_recommendations.py` 641-660, 711, 713, 729 | S0-03 |
| H2 | Countdown hardcodeado `2026-04-12` / `2026-04-10` | `project-react/src/components/recommendations/ElectoralCountdown.tsx` 6-7, 56, 72 | S0-03 |
| H3 | `political_figures` vacía; tags presidenciales | Neon | S0-04 |
| H4 | Scraper de encuestas apunta a `Elecciones_generales_de_Per%C3%BA_de_2026`; `_parse_poll_row` guarda `tipo: "Intención de voto presidencial"`; dedup por `source+field_dates` (impediría guardar las 2 tablas de la página municipal) | `app/scrapers/survey_scrapers.py` 17-227 | S0-05 |
| H5 | El scheduler **no ejecuta noticias**: `run_all_scrapers()` solo social+gobierno+encuestas; noticias solo por `POST /api/v1/scraping/trigger/news` | `app/services/scheduler.py` 773-798 | S0-06 |
| H6 | Sin noción de Lima/distrito: `GeographicDetector` (25 dptos + 20 ciudades); `_detect_category` solo etiqueta "Regiones"; `parse_peru_region` en twitterapi_io | `app/services/geographic_detector.py`, `news_scrapers.py` 77-92 | S0-06, S1-08 |
| H7 | Share of voice con diccionarios hardcodeados (Castillo, Boluarte, Keiko, Acuña, RLA) | `app/api/endpoints/analysis.py` 236-287 | S1-10 |
| H8 | Nombres de env inconsistentes: scheduler lee `TWITTERAPI_IO_KEY` y `FACEBOOK_GRAPH_TOKEN`; `.env`/`.env.example`/`config.py` definen `TWITTER_BEARER_TOKEN` y `FACEBOOK_ACCESS_TOKEN` | `scheduler.py` 424-436 vs `config.py` 19-23 | S0-02 |
| H9 | Claude por httpx crudo con modelo `claude-sonnet-4-20250514` | `ai_recommendations.py` 505-525 | S1-09 (SDK + config) |
| H10 | Sentimiento por lexicón sin entidad objetivo | `app/services/sentiment_analyzer.py`, sniffing `main.py` 196-330 | S1-09 |
| H11 | Sniffing nunca recibe el flujo real; frontend de crisis/alertas depende de WS vacío | `RealtimeAlerts.tsx` usa `useWebSocket`; `useSocialData.ts` 176 lee `/api/crisis-alerts` | S2-11 |
| H12 | Frontend geográfico usa `peruGeoData` (cuadrados ficticios) y `mockGeographicMetrics` | `project-react/src/data/geographicData.ts`, `components/geographic/GeographicPage.tsx` 11, 32-33 | S1-08 |
| H13 | Páginas con datos de ejemplo en el menú: Demografía (pirámide 2021), Data Gubernamental; tabs sociales con mocks (Calendario, Audiencia, Fake News, Listening, Viral, Competencia) | `Sidebar.tsx` 23-32, `SocialTabs.tsx` 26-37, `SettingsTabs.tsx` | S0-07 |
| H14 | `trigger/all` devuelve `sources` con ONPE/INEI/MEF (scrapers vacíos) | `scraping.py` 967-995 | S0-06 (cosmético) |
| H15 | `tasks/scraping.py` importa Celery (muerto); no se usa | `app/tasks/` | no tocar |

## Lo que se conserva tal cual

JWT (`deps.py`), `database.py`, los 12 scrapers de prensa (`news_scrapers.py` 175-742), `BaseScraper`, sistema de tokens múltiples (`settings.py` + `SocialApiToken`), `political_figures.py` con `sync_keywords_to_tags`, `AIRecommendationRecord` y su endpoint, el proxy de Vite, `Dockerfile.web`/`Dockerfile.sniffing`, hooks del frontend con `getAuthHeaders()`.

## Firmas que vas a reutilizar

```python
# app/api/endpoints/political_figures.py
def sync_keywords_to_tags(db: Session, keywords: list, platforms: list = None)  # crea SearchTag si no existe

# app/services/scheduler.py
def get_active_tags(db, platform: str) -> List[str]      # tags activos + keywords de figuras activas
async def run_scheduled_social_scraping(db_url: str, platform: str, days_back: int = 7) -> int
async def run_scheduled_survey_scraping(db_url: str)
async def run_all_scrapers()                              # llamado por scheduler_loop cada SCRAPING_INTERVAL_HOURS
def start_scheduler() / def stop_scheduler()

# app/scrapers/news_scrapers.py
class PeruvianNewsScraper(BaseScraper):  # .scrape(db) → _save_articles(db, items); items: dict(source,title,content,url,category,published_at,...)
def run_news_scraping(db: Session, sources: Optional[List[str]] = None) -> Dict[str, int]
ALL_NEWS_SCRAPERS: dict[str, type]

# app/scrapers/base.py
class BaseScraper: _make_request(url) -> Response|None; _save_items(db, items, model_class) -> int; _item_exists(db, item_data, model_class) -> bool

# app/services/ai_recommendations.py
def gather_figure_context(db, figure) -> dict
async def generate_recommendations_for_figures(db, figure_ids, focus_areas) -> list[dict]
def build_claude_prompt(contexts, focus_areas) -> str
def parse_claude_response(text, figures) -> list[dict]

# app/api/endpoints/scraping.py
def register_task(task_id, task_type) / def update_task(task_id, status, result=None, error=None)   # registro en memoria
```

```ts
// project-react/src/config/api.ts
export const ENDPOINTS = { ... }            // añadir claves nuevas aquí
export function getAuthHeaders()
export async function fetchFromScrapping(endpoint)   // GET con auth
export async function postToScrapping(endpoint, body?)
```
