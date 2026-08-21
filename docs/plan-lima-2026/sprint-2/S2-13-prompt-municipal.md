# S2-13 — Recomendaciones IA en clave municipal

**Objetivo:** que el generador de recomendaciones razone como estratega de campaña municipal: candidato propio vs. rivales, zona y distrito objetivo, tema del día, ventana legal, presupuesto en soles y KPIs verificables por el propio sistema. Focos nuevos en backend y frontend.

**Precondiciones:** S1-09 (SDK), S1-10 (`race`), S2-12 (`opportunity`), S2-11 (`alerts`). `OWN_CANDIDATE` `[WALTER]` (si vacío, funciona en modo observador: cada figura seleccionada se analiza como "propia").

**Archivos a tocar:**
- `app/services/ai_recommendations.py` (`build_claude_prompt`, `generate_recommendations_for_figures`, `parse_claude_response` → Pydantic; `gather_figure_context` + bloques territoriales)
- `app/schemas.py` (`GenerateRecommendationsRequest.focus_areas` default)
- frontend: `components/recommendations/RecommendationsPage.tsx` (`focusAreaOptions` l. 30), `types/recommendations.ts` (`AIRecommendation.category`), `components/recommendations/RecommendationCard.tsx` y `RecommendationsTabs.tsx` si filtran por categoría antigua, `hooks/useAIRecommendations.ts` (default focos)
- `.env.example` (`APIFY_TOKEN` opcional)

## Pasos

1. `ai_recommendations.py`:
   - Añadir modelos `Recommendation`, `RecommendationBatch` y `Category` de `referencia/prompts/recomendaciones-municipales.md`.
   - `gather_figure_context(db, figure)`: conservar lo existente y añadir claves `territory` (`territory.district_stats(db, 30, figure.id)` top 10 + `zone_stats`), `opportunity` (`territory.opportunity(db, figure.id)[:10]` solo si la figura es candidata), `topics_7d` (`race.topics(db, 7)`), `attacks_7d` (filas `is_attack` donde la figura es atacada o atacante, agregadas por par), `open_alerts` (`alerts` abiertas de la figura).
   - `build_claude_prompt(contexts, focus_areas) -> tuple[str, str]` devuelve `(system, user)` con los textos exactos del prompt de referencia; `{own_candidate_block}` = ficha de la figura con `is_own_candidate` (o de cada figura seleccionada en modo observador); `{rivals_block}` = top 3 de `race.poll_average` distintos de la propia con pct y zonas fuertes (del `by_zone` de `race.sentiment`).
   - `generate_recommendations_for_figures`: reemplazar `messages.create` por `messages.parse(..., system=system, messages=[{"role":"user","content":user}], output_format=RecommendationBatch, thinking={"type":"adaptive"}, output_config={"effort":"high"}, max_tokens=16000)`; eliminar `parse_claude_response` (o dejarla sin uso → eliminarla) y mapear `response.parsed_output.recommendations` a `AIRecommendationRecord` según el mapeo de la referencia. `figure_id` por `display_name` con el mismo `figure_map` actual.
   - `focus_descriptions` → las seis claves nuevas con sus descripciones de la tabla de la referencia.
2. `schemas.py`: `focus_areas: List[str] = ["territorial_priority", "message_of_day", "crisis_response", "rival_contrast", "ground_game", "digital_push"]`.
3. Frontend:
   - `types/recommendations.ts`: `category: 'territorial_priority' | 'message_of_day' | 'crisis_response' | 'rival_contrast' | 'ground_game' | 'digital_push'`.
   - `RecommendationsPage.tsx` `focusAreaOptions`: seis entradas `{id, label, description, icon}` con las etiquetas de la tabla (iconos lucide: `MapPin`, `Megaphone`, `ShieldAlert`, `Swords` → si no existe usar `GitCompare`, `Footprints`, `Smartphone`).
   - `useAIRecommendations.ts`: default `focusAreas` = las seis claves.
   - `RecommendationsTabs.tsx` / `RecommendationCard.tsx`: donde haya mapas `category → label/color`, actualizar a las seis claves; `targetRegion` ahora contiene "Zona, distrito1, distrito2" — mostrar tal cual.
   - Limpiar recomendaciones antiguas no aplica (no hay; `ai_recommendations` está vacía).
4. (Opcional, solo si `APIFY_TOKEN` está definido) TikTok: en `scheduler.py` añadir `run_tiktok_with_apify(db, days_back)` que llama al actor `clockworks/tiktok-scraper` vía `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=...` con `{"searchQueries": <tags activos>, "resultsPerPage": 30}` y guarda `RawSocialPost(platform='tiktok', post_id=id, author=authorMeta.name, content=text, created_at=createTime, engagement_metrics={likes: diggCount, comments: commentCount, shares: shareCount, views: playCount})`; añadir `"tiktok"` a la lista de plataformas de `run_all_scrapers` y a `PLATFORMS` del seed. Si no hay token, no tocar.

## Criterios de aceptación

1. `POST /recommendations/generate {"figure_ids":[<id propio o RLA>], "focus_areas":["territorial_priority","message_of_day"]}` → `count >= 4`; cada recomendación tiene `category` en las seis claves, `target_region` con una zona de Lima, `recommended_action` con "Paso 1", `expected_timeline` con una fecha ≤ `2026-10-02`, `estimated_budget.min <= max`, y `identified_weakness` cita un dato (`len > 40`).
2. Ninguna recomendación menciona "abril", "segunda vuelta" ni "presidencial".
3. Con `DEBATE_DATE` vacío no aparece "debate del JNE" como fecha concreta (solo "por confirmar").
4. UI: Recomendaciones muestra los seis focos, genera y pinta tarjetas con zona/distritos; filtros por categoría funcionan.
5. `npx tsc --noEmit` OK.

## Commit

`feat(lima2026): S2-13 recomendaciones IA municipales (propio vs rivales, zona/distrito, ventana legal, focos nuevos)`
