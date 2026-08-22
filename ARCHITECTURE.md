# PoliticaPE — Arquitectura

Plataforma de inteligencia electoral orientada a la **elección municipal de Lima Metropolitana del
4 de octubre de 2026**. Convierte prensa, redes sociales y encuestas públicas en decisiones para un
equipo de campaña: dónde ir, qué decir, a qué responder.

Para empezar a trabajar lee primero `CLAUDE.md` (resumen operativo) y
`docs/plan-lima-2026/ESTADO-EJECUCION.md` (estado y bloqueos).

## Los tres servicios

| Servicio | Rol | Puerto local |
|---|---|---|
| `project-scrapping` | FastAPI: scrapers, API REST, scheduler, servicios de análisis. En producción también sirve el frontend compilado | 8000 |
| `project-sniffing` | FastAPI: difusión en vivo por WebSocket de los ítems ya clasificados | 8080 |
| `project-react` | React 18 + Vite + TypeScript + Tailwind | 5000 |

En producción (Railway) son dos servicios: `politicape-web` (scrapping + frontend) y
`politicape-sniffing`, que se comunican por la red privada de Railway.

## Flujo de datos

```
12 medios de prensa ─┐
X / YouTube ─────────┼─► scrapers ─► lima_geo.detect_scope ─► scope + districts
Wikipedia municipal ─┘                    (¿es de Lima? ¿qué distrito?)
                                                   │
                                    classifier (Claude, lotes de 20)
                                                   │
                            content_classifications: figura, sentimiento HACIA ella,
                            tema municipal, ataque→atacado, distritos, relevancia
                                                   │
        ┌──────────────────┬───────────────────────┼──────────────────┬─────────────────┐
        ▼                  ▼                       ▼                  ▼                 ▼
  race (encuestas,   territory (distritos,   alert_engine        daily_brief      ai_recommendations
  SoV, sentimiento,   zonas, oportunidad)    (crisis/ataque/     (07:00 Lima,     (estratega municipal)
  temas)                                      oportunidad)        Telegram+correo)
                                                   │
                                        sniffing /api/ingest ─► WebSocket ─► frontend
```

## Decisiones de diseño

- **El calendario electoral es configuración, no código.** `app/electoral_config.py` lee las fechas de
  variables de entorno y expone `campaign_phase()`: `pre | campaign | poll_blackout | closing |
  election_day | post`. Recomendaciones, brief, alertas y UI cambian de comportamiento según la fase
  (en veda no se publican encuestas; cerrada la propaganda se filtran los focos de calle y pauta).
- **El sentimiento es hacia una figura, no del texto.** Una noticia donde A denuncia a B es negativa
  para B y neutra para A. Eso lo resuelve el clasificador con Claude, no un léxico de palabras.
- **La unidad territorial es el distrito.** 43 distritos con ubigeo real, agrupados en las 5 zonas que
  usan las encuestadoras (Norte, Este, Centro, Moderna, Sur). El padrón es el de Reniec 2026
  (7 901 379 electores).
- **Infraestructura simple a propósito**: sin Redis, sin Celery, sin Alembic. El scheduler son tareas
  asyncio dentro del proceso de FastAPI; las migraciones son SQL idempotente con un runner de 50 líneas.
- **Degradación limpia**: sin `ANTHROPIC_API_KEY` el sistema recolecta y muestra igual; los loops de IA
  lo registran en el log y siguen. Nada revienta.

## API (`/api/v1`)

| Prefijo | Qué expone |
|---|---|
| `/auth` | login, registro, perfil (JWT HS256) |
| `/data` | noticias, posts, gobierno, encuestas, estadísticas — con filtro `scope` |
| `/scraping` | disparadores manuales y logs de scraping |
| `/analysis` | sentimiento, tendencias, geografía, engagement (etapa anterior) |
| `/electoral` | `config`: fechas, fase y días restantes |
| `/race` | encuestas, promedio ponderado, share of voice, sentimiento por zona, temas, brief |
| `/territory` | distritos, zonas, catálogo, score de oportunidad |
| `/alerts` | listar y cambiar estado de alertas |
| `/events` | eventos de campaña, tareas, voluntarios, impacto de evento |
| `/results` | carga CSV/ONPE, resumen y comparación oportunidad vs. resultado |
| `/political-figures`, `/recommendations`, `/settings`, `/campaigns`, `/competitors` | CRUD y configuración |

Todos exigen `Authorization: Bearer <jwt>` salvo login y registro.

## Base de datos (Neon PostgreSQL)

Cuatro esquemas: `public` (datos scrapeados y análisis), `realtime_data` (streaming),
`identity` (usuarios, roles, tenants), `organization` (campañas, eventos, tareas, partidos, regiones).

Tablas propias de esta etapa: `content_classifications`, `daily_briefs`, `alerts`, `election_results`,
más las columnas `scope`, `districts`, `topics`, `classified` en `news_articles` y `raw_social_posts`,
y `figure_role`, `is_own_candidate`, `list_name`, `color`, `zone_strength` en `political_figures`.

Las trampas de tipos (columnas `uuid`, `text[]`, JSON null) están documentadas en `CLAUDE.md`.

## Dependencias externas

- **Neon PostgreSQL** — base de datos.
- **Anthropic Claude** (`claude-opus-5` por defecto, SDK `anthropic` 1.0.0) — clasificación, brief,
  recomendaciones y respuestas sugeridas.
- **TwitterAPI.io** y **YouTube Data API v3** — redes sociales.
- **Telegram Bot API** y SMTP — entrega de alertas y brief.
- **Railway** — despliegue.
- Prensa y encuestas: 12 medios peruanos, Wikipedia (tablas de encuestas municipales), IEP, Ipsos,
  Datum, CPI.
