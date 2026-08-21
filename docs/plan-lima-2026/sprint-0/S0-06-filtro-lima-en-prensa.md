# S0-06 — Ámbito Lima, distritos en el guardado y noticias en el scheduler

**Objetivo:** que cada noticia y post nuevo lleve `scope` (`lima_metropolitana` | `nacional`) y `districts` detectados; que los scrapers lean las secciones Lima de los medios; que el scheduler ejecute prensa (hoy no lo hace, H5); y que Monitoreo tenga el filtro "Solo Lima".

**Precondiciones:** S0-04 (runner de migraciones).

**Archivos a tocar:**
- nuevo `db/migrations/lima2026/002_scope_and_districts.sql` (copiar de referencia)
- nuevo `project-scrapping/app/services/lima_geo.py`
- nuevo `project-scrapping/app/data/lima_districts.json` (copia de `referencia/distritos-lima.json`) + `project-scrapping/app/data/__init__.py` vacío
- `project-scrapping/app/models.py` (`NewsArticle`, `RawSocialPost`)
- `project-scrapping/app/scrapers/news_scrapers.py` (`_save_articles`, `sections` de cada scraper)
- `project-scrapping/app/services/scheduler.py` (`run_all_scrapers`, nueva `run_scheduled_news_scraping`; `run_twitter_with_token` y `run_youtube_with_token` al crear `RawSocialPost`)
- `project-scrapping/app/api/endpoints/data.py` (`/news` y `/social`: parámetro `scope`)
- `project-scrapping/app/api/endpoints/scraping.py` (líneas 990-994: lista `sources` del trigger all — cosmético)
- nuevo `project-scrapping/scripts/backfill_scope.py`
- `project-react/src/hooks/useNewsData.ts`, `project-react/src/components/monitoring/MonitoringPage.tsx` (toggle), `project-react/src/config/api.ts` (sin cambio de clave; `NEWS` ya existe)

## Pasos

1. Copiar migración 002 y aplicar: `cp docs/plan-lima-2026/referencia/migraciones/002_scope_and_districts.sql db/migrations/lima2026/ && cd project-scrapping && python scripts/apply_migrations.py`.
2. `models.py`: en `NewsArticle` y en `RawSocialPost` añadir
   ```python
   scope = Column(String(30), nullable=True)
   districts = Column(JSON, nullable=True)
   topics = Column(JSON, nullable=True)
   classified = Column(Boolean, default=False)
   ```
3. `mkdir -p project-scrapping/app/data && cp docs/plan-lima-2026/referencia/distritos-lima.json project-scrapping/app/data/lima_districts.json`. Añadir `app/data/*.json` al `Dockerfile.web`? No hace falta: `COPY project-scrapping/ ./` ya lo incluye.
4. Crear `app/services/lima_geo.py`:
   ```python
   import json
   import re
   import unicodedata
   from functools import lru_cache
   from pathlib import Path
   from typing import Dict, List, Optional, Tuple

   DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "lima_districts.json"
   ZONES = ["Lima Norte", "Lima Este", "Lima Centro", "Lima Moderna", "Lima Sur"]


   def normalize(text: str) -> str:
       text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode()
       return re.sub(r"\s+", " ", text).strip().lower()


   @lru_cache(maxsize=1)
   def _load():
       data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
       districts = data["districts"]
       by_ubigeo = {d["ubigeo"]: d for d in districts}
       by_name = {}
       patterns = []  # (compiled_regex, ubigeo, is_short_alias)
       for d in districts:
           by_name[normalize(d["name"])] = d
           by_name[normalize(d["display"])] = d
           terms = [] if d["name"] == "Lima" else [d["name"], d["display"]]
           for alias in d.get("aliases", []):
               by_name[normalize(alias)] = d
               terms.append(alias)
           for t in set(terms):
               short = t.isupper() and len(t) <= 4
               pat = re.compile(r"(?<![\w])" + re.escape(t if short else normalize(t)) + r"(?![\w])")
               patterns.append((pat, d["ubigeo"], short))
       patterns.sort(key=lambda p: -len(p[0].pattern))
       city_terms = [normalize(t) for t in data["city_level_terms"]["terms"]]
       exclude = [normalize(t) for t in data["exclude_terms"]]
       return districts, by_ubigeo, by_name, patterns, city_terms, exclude


   def all_districts() -> List[dict]:
       return _load()[0]


   def district_by_ubigeo(ubigeo: str) -> Optional[dict]:
       return _load()[1].get(ubigeo)


   def district_by_name(name: str) -> Optional[dict]:
       return _load()[2].get(normalize(name))


   def detect_districts(text: str) -> List[Dict[str, str]]:
       """Devuelve [{'ubigeo','name','zone'}] únicos, en orden de aparición. Ignora Callao."""
       if not text:
           return []
       _, by_ubigeo, _, patterns, _, exclude = _load()
       norm = normalize(text)
       if any(re.search(r"(?<![\w])" + re.escape(e) + r"(?![\w])", norm) for e in exclude) and "lima" not in norm:
           return []
       found, seen = [], set()
       for pat, ubigeo, short in patterns:
           target = text if short else norm
           m = pat.search(target)
           if m and ubigeo not in seen:
               seen.add(ubigeo)
               d = by_ubigeo[ubigeo]
               found.append({"ubigeo": ubigeo, "name": d["display"], "zone": d["zone"], "pos": m.start()})
       found.sort(key=lambda f: f["pos"])
       return [{k: v for k, v in f.items() if k != "pos"} for f in found]


   def detect_scope(title: str, content: str = "", extra_terms: Optional[List[str]] = None) -> Tuple[str, List[Dict[str, str]]]:
       """('lima_metropolitana'|'nacional', districts). extra_terms: keywords de figuras activas (normalizados o no)."""
       text = f"{title or ''} {content or ''}"
       districts = detect_districts(text)
       if districts:
           return "lima_metropolitana", districts
       norm = normalize(text)
       _, _, _, _, city_terms, _ = _load()
       if any(re.search(r"(?<![\w])" + re.escape(t) + r"(?![\w])", norm) for t in city_terms):
           return "lima_metropolitana", []
       for kw in extra_terms or []:
           if kw and re.search(r"(?<![\w])" + re.escape(normalize(kw)) + r"(?![\w])", norm):
               return "lima_metropolitana", []
       return "nacional", []


   def zone_of(districts: List[Dict[str, str]]) -> Optional[str]:
       return districts[0]["zone"] if districts else None
   ```
5. `news_scrapers.py`:
   - Importar `from app.services.lima_geo import detect_scope`.
   - En `_save_articles`, antes de construir `NewsArticle`: `scope, districts = detect_scope(item.get('title', ''), item.get('content', ''), figure_keywords)` donde `figure_keywords` se calcula **una vez** al inicio de `_save_articles`:
     ```python
     from app.models import PoliticalFigure
     figure_keywords = [kw for (kws,) in db.query(PoliticalFigure.search_keywords).filter(PoliticalFigure.is_active == True).all() for kw in (kws or [])]
     ```
     y pasar `scope=scope, districts=districts or None` al constructor.
   - Secciones (añadir, no reemplazar; verificar cada URL con `curl -sI -A "Mozilla/5.0" <url> | head -1` → 200 antes de dejarla):
     | Scraper | añadir a `self.sections` |
     |---|---|
     | ElComercio (l.180) | `"/lima/"` |
     | RPP (l.221) | `"/lima"` |
     | LaRepublica (l.285) | (ya tiene `/sociedad`) — nada |
     | Peru21 (l.323) | `"/lima/"` |
     | Gestion (l.362) | nada |
     | Infobae (l.396) | nada (`/peru/` cubre) |
     | Andina (l.436) | buscar en `https://andina.pe/agencia/` el enlace de sección "Locales"; si existe, añadir su ruta `/agencia/seccion-locales-<id>.aspx` |
     | CanalN (l.479) | nada |
     | AmericaTV (l.551) | nada |
     | Panamericana (l.612) | `"/locales"` si responde 200 |
     | TVPeru (l.650) | `"/noticias/seccion/locales"` si responde 200 |
     | Exitosa (l.717) | nada |
6. `scheduler.py`:
   - Nueva función (colocar antes de `run_all_scrapers`):
     ```python
     async def run_scheduled_news_scraping(db_url: str) -> int:
         from sqlalchemy import create_engine
         from sqlalchemy.orm import sessionmaker
         from app.models import ScrapingLog
         from app.scrapers.news_scrapers import run_news_scraping

         engine = create_engine(db_url)
         db = sessionmaker(bind=engine)()
         log = ScrapingLog(id=str(uuid.uuid4()), source="news", scraping_type="news", status="running")
         db.add(log)
         db.commit()
         try:
             results = await asyncio.to_thread(run_news_scraping, db, None)
             total = sum(results.values())
             log.status, log.items_scraped, log.completed_at = "completed", total, datetime.now()
             log.extra_metadata = {"triggered_by": "scheduler", "sources": results}
             db.commit()
             logger.info(f"[Scheduler] Noticias: {total} artículos nuevos")
             return total
         except Exception as e:
             log.status, log.error_message, log.completed_at = "failed", str(e)[:500], datetime.now()
             db.commit()
             logger.error(f"[Scheduler] Error noticias: {e}")
             return 0
         finally:
             db.close()
     ```
   - En `run_all_scrapers`, **antes** del bucle de plataformas sociales:
     ```python
     try:
         total += await run_scheduled_news_scraping(db_url)
     except Exception as e:
         logger.error(f"[Scheduler] Error en news scraping: {e}")
     ```
   - En `run_twitter_with_token` (bloque que construye `RawSocialPost`, l. ~120-135) y en `run_youtube_with_token` (equivalente): antes del constructor, `scope, districts = detect_scope("", transformed.get("content", ""), figure_keywords)` (con `figure_keywords` calculado una vez por función igual que en prensa) y pasar `scope=scope, districts=districts or None`. Si hay distrito, sobreescribir `region="Lima Metropolitana"` y `geographic_location=districts[0]["name"]`.
   - Reducir el `await asyncio.sleep(120)` inicial de `scheduler_loop` a `30`.
7. `data.py`: en `get_news_articles` y `get_social_posts` añadir parámetro `scope: Optional[str] = None` y `if scope: query = query.filter(Model.scope == scope)`. Añadir `scope` y `districts` a `NewsArticleResponse` y `SocialPostResponse` en `schemas.py` como `Optional`.
8. `scraping.py` líneas 990-994: `"sources": ["Prensa (12 medios)", "X (twitterapi.io)", "YouTube", "Instagram", "Facebook", "Wikipedia", "IEP", "Ipsos", "Datum", "CPI", "Congreso", "Datos Abiertos"]`. Además en `_run_all` el scheduler ya incluye noticias tras el paso 6.
9. Crear `scripts/backfill_scope.py` que recorre `news_articles` y `raw_social_posts` con `scope IS NULL` en lotes de 500, aplica `detect_scope` y guarda. Ejecutarlo una vez.
10. Frontend: en `useNewsData.ts` añadir `scope?: 'all' | 'lima_metropolitana' | 'nacional'` a `NewsFilters` y `if (filters.scope && filters.scope !== 'all') params.set('scope', filters.scope)`. En `MonitoringPage.tsx` añadir un toggle "Solo Lima" (default ON → `scope: 'lima_metropolitana'`) junto a los filtros existentes, y mostrar los `districts` como chips en cada tarjeta de `NewsStream` si existen.

## Criterios de aceptación

1. `python -c "from app.services.lima_geo import detect_scope, detect_districts; print(detect_districts('Extorsionan a transportistas en SJL y Comas; vecinos de Villa El Salvador protestan')); print(detect_scope('Gobierno anuncia medidas', 'El Congreso aprobó...'))"` → tres distritos (San Juan de Lurigancho, Comas, Villa El Salvador) y `('nacional', [])`.
2. `detect_districts('Alcalde del Callao se reunió con vecinos de Bellavista')` → `[]`.
3. Tras `backfill_scope.py`: `SELECT scope, count(*) FROM news_articles GROUP BY 1` muestra ambos valores y `lima_metropolitana` > 100.
4. `curl -s -H "Authorization: Bearer $TOKEN" 'localhost:8000/api/v1/data/news?scope=lima_metropolitana&limit=5'` devuelve artículos con `scope` y `districts`.
5. Trigger manual de noticias y luego `SELECT count(*) FROM news_articles WHERE scraped_at > now() - interval '10 minutes'` > 0 (los medios están vivos; si un scraper da 0, verificar selectores de ese medio y anotarlo — no es bloqueante si ≥ 8 de 12 traen artículos).
6. En el log del backend, tras 30 s del arranque, aparece `[Scheduler] Noticias: N artículos nuevos`.
7. `npx tsc --noEmit` OK; el toggle "Solo Lima" filtra en la UI.

## Commit

`feat(lima2026): S0-06 ámbito Lima y distritos en noticias/redes, secciones locales, noticias en scheduler`
