# PLAN LIMA 2026 — Instrucciones para el ejecutor

> Este plan reorienta PoliticaPE desde la elección presidencial (abril 2026) hacia la **elección municipal de Lima Metropolitana del domingo 4 de octubre de 2026**, para que un equipo electoral tome decisiones con datos. Fue escrito el 21-ago-2026 tras leer el código, la base Neon y las fuentes públicas. **No re-planifiques. Ejecuta.**

## Regla cero

1. Lee este archivo completo, luego `01`, `02`, `03`, `04`. Después ejecuta los trabajos **en el orden exacto** de la tabla de abajo. Cada trabajo tiene precondiciones que dependen del anterior.
2. Cada trabajo termina con **criterios de aceptación verificables por comando**. No marques un trabajo como hecho si un criterio falla. Si un criterio falla y no está cubierto por la sección "Si falla", detente y reporta; no improvises arquitectura.
3. Cada trabajo se cierra con **un commit** con el mensaje indicado en el trabajo. Nunca mezcles dos trabajos en un commit.
4. No toques nada fuera de "Archivos a tocar" de cada trabajo. Si necesitas tocar otro archivo para que compile, hazlo mínimo y anótalo en el reporte del trabajo.
5. Los datos de referencia (candidatos, distritos, temas, prompts, migraciones SQL) están en `referencia/`. Son la fuente de verdad; no los reescribas desde memoria.
6. Todo texto visible al usuario va en **español**. Código y nombres de variables en inglés, como el resto del repo.
7. Tres cosas requieren acción humana de Walter y están marcadas `[WALTER]`: `railway login`, claves de API, y la decisión de **para qué candidatura trabaja el equipo** (`OWN_CANDIDATE`). Si no tienes la respuesta, usa los valores por defecto indicados y deja la nota en el reporte.

## Directorio de trabajo

- Raíz del repo git: `D:\Documentos\GitHub\PoliticaPE\PoliticaPE`  (todas las rutas de este plan son relativas a esa raíz, salvo que empiecen con una unidad).
- Shell: Git Bash. Python 3.11.9, Node 22, npm 10, Railway CLI 5.23.3 instalados.
- Walter tiene `PORT=3010` global: **siempre** pasa `PORT=` explícito al levantar servicios.
- Base de datos: Neon PostgreSQL. Cadena en `.env` (`DATABASE_URL`). Es la base real, no hay copia local. Las migraciones son idempotentes (`IF NOT EXISTS`) y aditivas; nunca borres tablas ni columnas.

## Orden de ejecución

| # | Archivo | Trabajo | Commit esperado |
|---|---|---|---|
| 1 | `sprint-0/S0-01-commit-y-deploy.md` | Commit del sprint MVP, rama `lima-2026`, deploy en Railway | `chore(mvp): ...` + `feat(lima2026): S0-01 ...` |
| 2 | `sprint-0/S0-02-api-keys-y-tokens.md` | Claves de API unificadas (env y tabla de tokens) | `feat(lima2026): S0-02 ...` |
| 3 | `sprint-0/S0-03-fechas-y-reglas-a-config.md` | Calendario electoral a configuración, countdown y prompt | `feat(lima2026): S0-03 ...` |
| 4 | `sprint-0/S0-04-migraciones-y-seed-candidatos.md` | Runner de migraciones, columnas nuevas, 24 figuras políticas | `feat(lima2026): S0-04 ...` |
| 5 | `sprint-0/S0-05-scraper-encuestas-lima.md` | Scraper de Wikipedia → página municipal de Lima, filas completas | `feat(lima2026): S0-05 ...` |
| 6 | `sprint-0/S0-06-filtro-lima-en-prensa.md` | Detector de ámbito Lima y distritos, secciones locales, news en scheduler | `feat(lima2026): S0-06 ...` |
| 7 | `sprint-0/S0-07-recorte-de-sidebar.md` | Menú a 6 pantallas, ocultar mocks | `feat(lima2026): S0-07 ...` |
| 8 | `sprint-1/S1-08-capa-territorial.md` | 43 distritos, GeoJSON real, endpoints `/territory`, página Territorio | `feat(lima2026): S1-08 ...` |
| 9 | `sprint-1/S1-09-clasificacion-ia.md` | Clasificación en lote con Claude: candidato, sentimiento, tema, ataque | `feat(lima2026): S1-09 ...` |
| 10 | `sprint-1/S1-10-tablero-de-carrera-y-brief.md` | Endpoints `/race`, promedio de encuestas, brief diario 07:00, página Carrera | `feat(lima2026): S1-10 ...` |
| 11 | `sprint-2/S2-11-alertas.md` | Motor de alertas por candidato, Telegram, sniffing conectado | `feat(lima2026): S2-11 ...` |
| 12 | `sprint-2/S2-12-oportunidad-territorial-y-eventos.md` | Score de oportunidad por distrito, eventos/tareas, impacto de evento | `feat(lima2026): S2-12 ...` |
| 13 | `sprint-2/S2-13-prompt-municipal.md` | Recomendaciones IA en clave municipal, focos nuevos | `feat(lima2026): S2-13 ...` |
| 14 | `sprint-3/S3-14-modo-veda-y-cierre.md` | Fases legales: veda de encuestas, cierre de propaganda | `feat(lima2026): S3-14 ...` |
| 15 | `sprint-3/S3-15-dia-d-y-resultados.md` | Carga de resultados ONPE, comparación con oportunidad, informe | `feat(lima2026): S3-15 ...` |
| 16 | `99-CHECKLIST-FINAL.md` | Verificación integral y merge a `main` | `chore(lima2026): merge` |

Fechas objetivo (si el plan arranca el 21-ago): Sprint 0 hasta el 28-ago · Sprint 1 hasta el 11-sep · Sprint 2 hasta el 25-sep · Sprint 3 hasta el 4-oct. Si arrancas más tarde, comprime los sprints pero **no alteres el orden**: los trabajos 1–7 son precondición de todo lo demás.

## Formato del reporte por trabajo

Al terminar cada trabajo escribe (en el mensaje final al usuario, no en un archivo) exactamente:

```
[S0-03] HECHO
Archivos: app/electoral_config.py (nuevo), app/services/ai_recommendations.py (líneas 633-660), ...
Criterios: 5/5 OK
Commit: <hash> feat(lima2026): S0-03 ...
Notas: <solo si hubo desviación, pregunta abierta o acción [WALTER] pendiente>
```

## Qué NO hacer

- No migrar a Alembic, no añadir Redis/Celery, no cambiar de framework, no reescribir el frontend.
- No borrar datos existentes en Neon (las 892 noticias y 1 408 posts son historial útil).
- No publicar cifras de encuestas después del 27-sep fuera de la plataforma (ver S3-14).
- No inventar candidatos, cifras ni cuentas de redes: si un dato de `referencia/` está marcado `"verify": true`, verifícalo antes de usarlo.
- No usar el `AgentTool`/workflows salvo que Walter lo pida; trabaja secuencialmente.
