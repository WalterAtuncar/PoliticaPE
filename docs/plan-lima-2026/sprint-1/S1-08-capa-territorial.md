# S1-08 — Capa territorial de Lima Metropolitana

**Objetivo:** mapa real de 43 distritos con menciones y sentimiento por distrito/zona, endpoints `/territory`, y la página **Territorio** que reemplaza a "Geográfico y Demográfico".

**Precondiciones:** S0-06 (columnas `scope`/`districts`, `lima_geo.py`). Los agregados por candidato/sentimiento se enriquecen en S1-09 con `content_classifications`; aquí se implementan con fallback a `sentiment_score` del lexicón y se actualizan en S1-09 (ver nota al final).

**Archivos a tocar:**
- nuevo `project-scrapping/app/services/territory.py`
- nuevo `project-scrapping/app/api/endpoints/territory.py`; `app/api/__init__.py`
- nuevo `project-react/src/data/lima-distritos.geo.json`, `project-react/src/data/limaDistricts.ts`
- nuevos `project-react/src/hooks/useTerritory.ts`, `project-react/src/components/territory/TerritoryPage.tsx`, `LimaMap.tsx`, `DistrictPanel.tsx`, `ZoneSummary.tsx`
- `project-react/src/config/api.ts`, `Sidebar.tsx`, `Header.tsx`, `MainApp.tsx`
- `project-scrapping/app/data/lima_districts.json` (actualizar `electors_approx` si consigues el padrón ERM 2026)

## Pasos — backend

1. Padrón: intentar obtener el padrón ERM 2026 por distrito de Lima (buscar "padrón electoral ERM 2026 Lima Metropolitana por distrito" en `onpe.gob.pe`, `plataformaelectoral.jne.gob.pe` o prensa). Si lo consigues, actualiza `electors_approx` en `app/data/lima_districts.json` **y** en `docs/plan-lima-2026/referencia/distritos-lima.json`, y cambia `_meta.electors_source`. Si no en 15 minutos, sigue con los aproximados.
2. `app/services/territory.py`:
   ```python
   from collections import defaultdict
   from datetime import datetime, timedelta
   from typing import Dict, List, Optional
   from sqlalchemy import text
   from sqlalchemy.orm import Session
   from app.services import lima_geo

   def _has_classifications(db: Session) -> bool:
       return db.execute(text("SELECT to_regclass('public.content_classifications') IS NOT NULL")).scalar()

   def district_stats(db: Session, days: int = 7, figure_id: Optional[str] = None) -> List[dict]:
       since = datetime.utcnow() - timedelta(days=days)
       stats = {d["ubigeo"]: {"ubigeo": d["ubigeo"], "name": d["display"], "zone": d["zone"], "electors": d["electors_approx"],
                              "mentions": 0, "sent_sum": 0.0, "sent_n": 0, "topics": defaultdict(int), "figures": defaultdict(lambda: {"mentions": 0, "sent_sum": 0.0, "sent_n": 0})}
                for d in lima_geo.all_districts()}
       if _has_classifications(db):
           rows = db.execute(text("""
               SELECT c.districts, c.figure_id, c.stance, c.topic
               FROM content_classifications c
               WHERE c.content_published_at >= :since AND c.districts IS NOT NULL AND jsonb_array_length(c.districts::jsonb) > 0
                 AND (:fid IS NULL OR c.figure_id = :fid OR c.figure_id IS NULL)
           """), {"since": since, "fid": figure_id}).fetchall()
           for districts, fid, stance, topic in rows:
               for d in districts or []:
                   s = stats.get(d.get("ubigeo"))
                   if not s: continue
                   s["mentions"] += 1
                   if topic: s["topics"][topic] += 1
                   if stance is not None:
                       s["sent_sum"] += float(stance); s["sent_n"] += 1
                   if fid:
                       f = s["figures"][fid]; f["mentions"] += 1
                       if stance is not None: f["sent_sum"] += float(stance); f["sent_n"] += 1
       else:
           for table, date_col in (("news_articles", "published_at"), ("raw_social_posts", "created_at")):
               rows = db.execute(text(f"""
                   SELECT districts, sentiment_score FROM {table}
                   WHERE {date_col} >= :since AND districts IS NOT NULL AND jsonb_array_length(districts::jsonb) > 0
               """), {"since": since}).fetchall()
               for districts, score in rows:
                   for d in districts or []:
                       s = stats.get(d.get("ubigeo"))
                       if not s: continue
                       s["mentions"] += 1
                       if score is not None: s["sent_sum"] += float(score); s["sent_n"] += 1
       out = []
       for s in stats.values():
           top_topic = max(s["topics"].items(), key=lambda kv: kv[1])[0] if s["topics"] else None
           out.append({
               "ubigeo": s["ubigeo"], "name": s["name"], "zone": s["zone"], "electors": s["electors"],
               "mentions": s["mentions"],
               "net_sentiment": round(s["sent_sum"] / s["sent_n"], 3) if s["sent_n"] else None,
               "top_topic": top_topic,
               "figures": {fid: {"mentions": f["mentions"], "net": round(f["sent_sum"] / f["sent_n"], 3) if f["sent_n"] else None} for fid, f in s["figures"].items()},
           })
       out.sort(key=lambda x: -x["mentions"])
       return out

   def zone_stats(db: Session, days: int = 7, figure_id: Optional[str] = None) -> List[dict]:
       agg = {z: {"zone": z, "electors": 0, "mentions": 0, "sent_sum": 0.0, "sent_n": 0, "districts": 0} for z in lima_geo.ZONES}
       for d in district_stats(db, days, figure_id):
           a = agg[d["zone"]]
           a["electors"] += d["electors"]; a["mentions"] += d["mentions"]; a["districts"] += 1
           if d["net_sentiment"] is not None and d["mentions"]:
               a["sent_sum"] += d["net_sentiment"] * d["mentions"]; a["sent_n"] += d["mentions"]
       return [{"zone": a["zone"], "electors": a["electors"], "mentions": a["mentions"], "districts": a["districts"],
                "net_sentiment": round(a["sent_sum"] / a["sent_n"], 3) if a["sent_n"] else None} for a in agg.values()]
   ```
   (`opportunity()` e `event_impact()` se añaden en S2-12 a este mismo archivo.)
3. `app/api/endpoints/territory.py`:
   ```python
   from fastapi import APIRouter, Depends, Query
   from sqlalchemy.orm import Session
   from typing import Optional
   from app.database import get_db
   from app.api.deps import get_current_user
   from app.services import territory, lima_geo

   router = APIRouter()

   @router.get("/districts")
   def districts(days: int = Query(7, ge=1, le=120), figure_id: Optional[str] = None,
                 current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
       return {"period_days": days, "districts": territory.district_stats(db, days, figure_id)}

   @router.get("/zones")
   def zones(days: int = Query(7, ge=1, le=120), figure_id: Optional[str] = None,
             current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
       return {"period_days": days, "zones": territory.zone_stats(db, days, figure_id)}

   @router.get("/catalog")
   def catalog(current_user: dict = Depends(get_current_user)):
       return {"zones": lima_geo.ZONES, "districts": [{"ubigeo": d["ubigeo"], "name": d["display"], "zone": d["zone"], "electors": d["electors_approx"]} for d in lima_geo.all_districts()]}
   ```
   Registrar en `app/api/__init__.py` con prefijo `/territory`.

## Pasos — frontend

4. GeoJSON real. Descargar `https://raw.githubusercontent.com/juaneladio/peru-geojson/master/peru_distrital_simple.geojson` (si la ruta cambió, buscar en el repo `juaneladio/peru-geojson` el archivo distrital simplificado). Filtrar features cuyo `properties.IDDIST` / `UBIGEO` (revisar el nombre real de la propiedad) empiece por `1501`, normalizar a `properties: { UBIGEO, NOMBRE }` y guardar como `project-react/src/data/lima-distritos.geo.json` (< 600 KB; si pesa más, simplificar con `npx mapshaper -i in.geojson -simplify 10% -o out.geojson`). Deben quedar **43 features**. Si la descarga falla, usar cualquier otra fuente pública de GeoJSON distrital del Perú y anotar la fuente en el reporte; nunca cuadrados ficticios.
5. `src/data/limaDistricts.ts`: exportar `LIMA_DISTRICTS` (array tipado `{ubigeo, name, zone, electors}`) y `ZONES` generados desde `referencia/distritos-lima.json` (copiar valores), y `TOPIC_LABELS` se crea en S1-09.
6. `config/api.ts`: `TERRITORY_DISTRICTS: '/api/v1/territory/districts'`, `TERRITORY_ZONES: '/api/v1/territory/zones'`, `TERRITORY_CATALOG: '/api/v1/territory/catalog'`.
7. `hooks/useTerritory.ts`: `useTerritory({days, figureId})` → `{districts, zones, isLoading, error, refetch}`; fetch paralelo con `Promise.all`.
8. Componentes en `components/territory/`:
   - `TerritoryPage.tsx`: cabecera "Territorio — Lima Metropolitana"; controles: periodo (1/7/30 días), métrica (`menciones` | `sentimiento neto` | `share de figura` cuando hay `figureId`), selector de figura (de `usePoliticalFigures`, solo `figure_role in ('candidate','incumbent')`); layout: mapa (2/3) + panel lateral (1/3) con `ZoneSummary` arriba y `DistrictPanel` al seleccionar distrito.
   - `LimaMap.tsx`: `MapContainer` centrado en `[-12.05, -76.95]`, zoom 10, `TileLayer` OSM (ya se usa en `GeographicPage`), `GeoJSON` con `style` por métrica (escala de 5 pasos; para sentimiento: rojo `#B4322B` → gris → verde `#2E7D4F`; para menciones: blanco → `#1F6B73`), `onEachFeature` con tooltip `NOMBRE · menciones · sentimiento` y `click` → `onSelect(ubigeo)`. Usar `key={metric+days}` para forzar re-estilo (patrón ya usado en `GeographicPage.tsx:196`).
   - `DistrictPanel.tsx`: nombre, zona, electores, menciones, sentimiento neto, tema principal, tabla de figuras (menciones, neto) ordenada por menciones.
   - `ZoneSummary.tsx`: 5 filas (zona, electores, menciones, neto) con barra horizontal proporcional.
   - Estados vacíos: "Sin menciones con distrito en el periodo" (no datos de ejemplo).
9. Reemplazar en `Sidebar.tsx` la entrada `geo-demographics` por `{ id: 'territory', label: 'Territorio', icon: MapPin }`; en `Header.tsx` `territory: 'Territorio — Lima Metropolitana'`; en `MainApp.tsx` `case 'territory': return <TerritoryPage />` y eliminar el import de `GeoDemographicsPage`. `Dashboard.tsx`: reemplazar el `GeographicMap` del dashboard por `<LimaMap days={7} metric="mentions" compact />` (prop `compact` = sin controles, altura 320 px).

## Criterios de aceptación

1. `curl -s -H "Authorization: Bearer $TOKEN" 'localhost:8000/api/v1/territory/districts?days=30' | python -c "import sys,json;d=json.load(sys.stdin)['districts'];print(len(d), d[0])"` → 43 y el primero con `mentions > 0`.
2. `/territory/zones?days=30` devuelve 5 zonas con `electors` sumando entre 7,0 M y 8,2 M.
3. `python -c "import json;g=json.load(open('project-react/src/data/lima-distritos.geo.json'));print(len(g['features']), sorted(f['properties']['UBIGEO'] for f in g['features'])[:3])"` → `43 ['150101', '150102', '150103']`.
4. `npx tsc --noEmit && npm run build` OK; `grep -rn "mockGeographicMetrics\|peruGeoData" project-react/src --include=*.tsx` → solo en `components/geographic/` (archivos que ya no se enrutan) o ninguno.
5. En la UI, Territorio muestra el mapa coloreado y al hacer clic en San Juan de Lurigancho el panel muestra sus datos.

## Nota para S1-09

`district_stats` ya consulta `content_classifications` si existe. Al terminar S1-09 no hay que tocar este archivo; solo verificar que las cifras cambian de lexicón a clasificación (criterio 6 de S1-09).

## Commit

`feat(lima2026): S1-08 capa territorial de Lima (43 distritos, /territory, página Territorio con mapa real)`
