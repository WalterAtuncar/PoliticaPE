# S3-15 — Día de la elección y resultados

**Objetivo:** la noche del 4 de octubre la plataforma carga resultados por distrito (ONPE o CSV manual), los pinta en el mapa, los cruza con el score de oportunidad y genera el informe post-electoral. Nada de esto se despliega después del 30-sep salvo hotfix: el trabajo se termina y prueba **antes**.

**Precondiciones:** S2-12 (opportunity), S3-14.

**Archivos a tocar:**
- nuevo `db/migrations/lima2026/007_election_results.sql`
- nuevos `app/services/results.py`, `app/api/endpoints/results.py`, `app/scrapers/onpe_results.py`, `scripts/load_results_csv.py`
- `app/models.py` (+ `ElectionResult`), `app/api/__init__.py`, `app/services/scheduler.py` (+ `results_loop` solo en `election_day`/`post` durante 72 h)
- frontend: `config/api.ts`, `LimaMap.tsx` (métrica `resultado`), nuevo `components/territory/ResultsPanel.tsx`, `TerritoryPage.tsx` (pestaña "Resultados" visible desde `election_day`), `RacePage.tsx` (bloque "Resultados" desde `election_day`)

## Pasos

1. Migración 007 + modelo `ElectionResult`.
2. `app/services/results.py`:
   - `upsert_results(db, rows, source)`: `rows = [{ubigeo, district_name, list_name, votes, pct_valid, actas_pct}]`; `figure_id` por `list_name` → figura con ese `list_name` (o `party_name`); `ON CONFLICT (ubigeo, list_name, source) DO UPDATE`.
   - `summary(db, source)`: total por lista (suma de votos y % sobre válidos), por zona y por distrito; `actas_pct` mínimo/medio.
   - `vs_opportunity(db, figure_id, source)`: junta `territory.opportunity` con el resultado propio por distrito: `{ubigeo, name, score_rank, own_pct, rival_pct, won: bool}` + correlación de Spearman entre `score` y `own_pct` (implementar a mano: ranks y fórmula 1 - 6Σd²/(n(n²-1))). Es el "¿acertamos dónde invertir?".
3. `app/scrapers/onpe_results.py`: **la URL de resultados ERM 2026 no se conoce al escribir este plan**. Implementar `OnpeResultsScraper` con `base_url = os.getenv("ONPE_RESULTS_URL", "")`, método `fetch_lima_districts() -> rows` que:
   1. si `ONPE_RESULTS_URL` está vacío, loguea y devuelve `[]`;
   2. intenta un endpoint JSON (los portales ONPE recientes exponen `.../ubigeo/<código>` con JSON); el ejecutor debe, **el 4-oct desde las 16:00**, abrir el portal de resultados ERM 2026 de ONPE, inspeccionar con las herramientas de red qué URL JSON devuelve los resultados por distrito de Lima (ubigeo `1501xx`) y fijar `ONPE_RESULTS_URL` + adaptar el parser en `_parse(json)` (mapear nombres de lista a `list_name`). Mientras tanto el CSV manual es el camino garantizado.
4. `app/api/endpoints/results.py` (prefijo `/results`): `POST /upload` (multipart CSV con columnas `ubigeo,distrito,lista,votos,pct_validos,actas_pct`; `source` query default `manual`), `GET /?source=` (summary), `GET /districts?source=`, `GET /vs-opportunity?figure_id=&source=`, `POST /fetch-onpe` (dispara el scraper una vez).
5. `scripts/load_results_csv.py --file resultados.csv --source manual`.
6. `scheduler.py`: `results_loop()` que solo corre cuando `ec.campaign_phase() in ('election_day','post')` y `now < ELECTION_DATE + 3 días`, cada 15 min, llamando al scraper ONPE si `ONPE_RESULTS_URL` existe.
7. Informe post-electoral: `POST /race/brief/generate?kind=postelectoral` → reutiliza `daily_brief` con un system alternativo (`referencia/prompts/brief-diario.md` + instrucción: "Es el informe post-electoral. Secciones: Resultado global · Resultado por zona · Dónde acertamos y dónde no (usa vs_opportunity) · Qué explicó la diferencia (temas, ataques, alertas de la última semana) · Lecciones para la gestión o la oposición") guardado con `brief_date = ELECTION_DATE + 1` y `data.kind = 'postelectoral'`.
8. Frontend:
   - `LimaMap.tsx`: métrica `resultado` (color del ganador por distrito; leyenda con listas) y `resultado_propio` (% propio, escala teal).
   - `ResultsPanel.tsx`: tabla global por lista, por zona, y "Oportunidad vs. resultado" (rank, score, % propio, ganó sí/no, Spearman arriba). Botón "Cargar CSV" (input file → `POST /results/upload`).
   - `TerritoryPage.tsx`: pestaña "Resultados" visible si `config.phase in ('election_day','post')`.
   - `RacePage.tsx`: bloque superior "Resultados ONPE (actas X %)" en las mismas fases.

## Prueba obligatoria antes del 30-sep

Crear `docs/plan-lima-2026/referencia/resultados-prueba.csv` con 43 filas × 3 listas ficticias (`Lista A/B/C`, votos inventados, `actas_pct=35.0`) y:

1. `python scripts/load_results_csv.py --file docs/plan-lima-2026/referencia/resultados-prueba.csv --source prueba`.
2. `GET /results?source=prueba` → totales coherentes (Σ votos por lista = suma de las 43 filas).
3. `GET /results/vs-opportunity?figure_id=<propio>&source=prueba` → 43 filas y un `spearman` entre -1 y 1 (con datos ficticios no importa el valor).
4. Mapa con métrica `resultado` coloreado bajo `source=prueba` (añadir selector de `source` en `ResultsPanel`).
5. Borrar las filas de prueba: `DELETE FROM election_results WHERE source='prueba'`.
6. `POST /race/brief/generate?kind=postelectoral` genera un informe (con datos vacíos dirá "sin datos", es suficiente).

## Criterios de aceptación

Los seis puntos de la prueba obligatoria, más `npx tsc --noEmit && npm run build` OK y el commit hecho antes del 30-sep.

## Commit

`feat(lima2026): S3-15 resultados por distrito (ONPE/CSV), comparación con oportunidad e informe post-electoral`
