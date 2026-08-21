# 99 — Verificación integral y merge

Ejecutar al terminar el Sprint 3 (o al cierre de cada sprint, las secciones que apliquen).

## A. Integridad del repo

- [ ] `git status` limpio en `lima-2026`; 15 commits `feat(lima2026): S..` (+ `chore(mvp)`), uno por trabajo.
- [ ] `git ls-files | grep -cE '__pycache__|/dist/|\.env$'` = 0.
- [ ] `.env.example` contiene todas las variables de `03-DISENO-OBJETIVO.md`.
- [ ] `db/migrations/lima2026/` tiene 001–007 y `SELECT filename FROM schema_migrations` las lista todas.

## B. Backend

- [ ] `curl -s localhost:8000/openapi.json | python -c "import sys,json;p=json.load(sys.stdin)['paths'];print([k for k in p if any(s in k for s in ('/electoral','/race','/territory','/alerts','/events','/results'))])"` lista ≥ 20 rutas nuevas.
- [ ] `grep -rn "2026-04\|abril de 2026\|claude-sonnet-4-20250514\|httpx.AsyncClient" project-scrapping/app/services/ai_recommendations.py` → nada.
- [ ] Scheduler: en el log aparecen `[Scheduler] Noticias`, `[Classifier]`, `[Brief] próximo envío`, `[Alerts]` en los primeros 3 minutos tras el arranque.
- [ ] Neon, últimas 24 h: `news_articles` > 50 nuevos, `raw_social_posts` > 50 nuevos (si hay claves), `content_classifications` > 100 nuevas, `daily_briefs` 1 fila de hoy.
- [ ] `political_figures` 24 activas, 21 `candidate`, una con `is_own_candidate = true` si `OWN_CANDIDATE` está definido.

## C. Frontend

- [ ] `cd project-react && npx tsc --noEmit && npm run build` sin errores.
- [ ] Sidebar: Panel · Prensa · Redes · Carrera · Territorio · Recomendaciones IA · Configuración (7 entradas).
- [ ] Ninguna pantalla enrutada importa `mockGeographicMetrics`, `peruGeoData` ni `generate*Data` de ejemplo: `grep -rln "mock" project-react/src/components/{dashboard,monitoring,social,race,territory,recommendations,settings,layout}` → solo archivos no enrutados (o nada).
- [ ] Carrera muestra promedio con banda, tabla de encuestas, SoV, sentimiento por zona, temas y brief.
- [ ] Territorio muestra el mapa real, oportunidad y eventos; Panel muestra alertas.

## D. Producción (Railway)

- [ ] `railway variables --service politicape-web` incluye todas las claves y fechas; `SCRAPING_INTERVAL_HOURS=1` desde el 13-sep.
- [ ] `https://<dominio>/health` OK; login OK; `/api/v1/electoral/config` OK; `/api/metrics` OK (sniffing por red privada).
- [ ] Telegram recibe el brief a las 07:00 hora Lima (verificar dos días seguidos).
- [ ] Backup: `pg_dump` del Neon (o snapshot de Neon) tomado el 26-sep y el 3-oct; guardar fuera del repo (`D:\Documentos\GitHub\PoliticaPE\backup_lima2026_<fecha>.dump`).

## E. Legal y operación

- [ ] Fechas `POLL_BLACKOUT_FROM`, `PROPAGANDA_DEADLINE`, `RALLY_DEADLINE` confirmadas contra resolución JNE ERM 2026.
- [ ] `DEBATE_DATE` fijada cuando el JNE publique; `DEBATE_MODE=true` solo la noche del debate y vuelto a `false` después.
- [ ] `social_api_tokens.credentials` no contiene claves en texto plano visibles en la UI (`credentials_masked` ya existe); las claves reales viven en variables de entorno.
- [ ] Prueba de resultados (S3-15) ejecutada y filas de prueba borradas.

## F. Merge

```bash
git checkout main
git merge --no-ff lima-2026 -m "chore(lima2026): merge plan Lima 2026 (sprints 0-3)"
git push origin main
git checkout lima-2026
```

Railway sigue desplegando desde `railway up` (CLI), no depende de la rama; si se configuró GitHub deploy, apuntar el servicio a `main` tras el merge.

## G. Reporte final a Walter

Una tabla con los 15 trabajos: estado, commit, criterios OK/total, notas; más la lista de acciones `[WALTER]` que quedaron pendientes y el costo estimado diario de Claude (tokens × precio) observado en los logs del clasificador y del brief.
