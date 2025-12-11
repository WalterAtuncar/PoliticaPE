# PoliticaPE — Documentación Técnica

## Resumen

Plataforma integrada de analítica política para Perú compuesta por tres proyectos:

- `project-scrapping`: microservicio FastAPI con scraping modular, análisis batch y API REST.
- `project-sniffing`: microservicio de streaming y WebSocket para análisis en tiempo real y broadcasting.
- `project-react`: frontend de analítica y monitoreo con módulos ejecutivos.

Objetivo: unificar señales de medios, redes y gobierno para detección de eventos, crisis y oportunidades, y habilitar decisiones de campaña basadas en datos.

## Arquitectura

- Ingesta y procesamiento batch:
  - Scrapers de noticias, redes y gobierno con validación de `robots.txt`, backoff y logging estructurado.
  - Persistencia en tablas normalizadas: `public.news_articles`, `public.raw_social_posts`, `public.government_data`, `public.scraped_surveys`.
  - Endpoints REST para recuperación y análisis.
- Streaming en tiempo real:
  - Pipeline de análisis, almacenamiento en `realtime_data.live_streams` y broadcasting por WebSocket (`/ws`).
  - Métricas y health checks.
- Visualización y gestión:
  - Dashboard, analítica avanzada, monitoreo, demografía, campañas, datos y configuración.

Referencias de código:

- API de datos: `project-scrapping/app/api/endpoints/data.py:15-33,35-52,53-74,75-92,94-116`.
- API de análisis: `project-scrapping/app/api/endpoints/analysis.py:13-33,35-49,51-63,65-78`.
- Trigger de scraping: `project-scrapping/app/api/endpoints/scraping.py:30-47,49-66,68-85`.
- Inicialización FastAPI: `project-scrapping/app/main.py:24-53,54-65,71-120`.
- Tareas Celery: `project-scrapping/app/tasks/scraping.py:15-65,66-112,113-158,159-178`.
- Tabla de tiempo real: `db/ddl_postgres.sql:104-139`.
- Navegación frontend: `project-react/src/pages/MainApp.tsx:21-44`, `project-react/src/components/layout/Sidebar.tsx:24-35`.

## Flujo de Datos

1) Batch (Noticias/Redes/Gobierno)

- Celery agenda tareas: `scrape_all_news`, `scrape_all_social`, `scrape_all_government`.
- Scrapers modulares extraen y normalizan registros; guardan en tablas `public.*`.
- Servicios de análisis calculan sentimiento, tendencias, distribución geográfica y engagement.
- FastAPI expone endpoints para consulta y análisis.

2) Streaming (WebSocket)

- Microservicio genera/consume mensajes en tiempo real.
- Aplica pipeline NLP y enriquece con señales (sentiment, relevancia, urgencia, región).
- Persiste en `realtime_data.live_streams` y emite por `WebSocket /ws`.
- Frontend se suscribe y actualiza widgets de monitoreo.

Consulta el diagrama en `docs/diagrams/architecture.mmd`.

## Dependencias y Servicios

- Backend (Python): FastAPI, SQLAlchemy, Celery, Redis, Loguru, SlowAPI (rate limiting), BeautifulSoup, Requests, Transformers (modelo BERT configurable).
- Streaming: FastAPI/WebSocket, Prometheus para métricas.
- Frontend (Node/React): Vite, React, TypeScript, TailwindCSS, Framer Motion, Lucide React.
- Base de datos: PostgreSQL con esquemas `public`, `realtime_data`, `identity`, `organization`. Índices por timestamp, plataforma, sentimiento, etc.

## Observabilidad

- Métricas: `GET /metrics` (Prometheus).
- Health checks: `GET /health` y `GET /api/v1/stats`.
- Logs y auditoría de scraping: `project-scrapping/app/api/endpoints/scraping.py:12-28` y tablas `public.scraping_logs`.

## Seguridad y Cumplimiento

- Respeto de `robots.txt` y rate limiting: `project-scrapping/app/main.py:33-45`.
- Privacidad: solo contenido público, sin datos personales.
- Gestión de identidad y permisos: tablas en `identity.*` y relaciones en `organization.*` para campañas y operaciones.

## Integración Frontend

- Módulos principales: Dashboard, Analytics, Monitoreo, Demografía, Campañas, Datos y Configuración.
- Monitoreo en tiempo real usa actualmente mocks: `project-react/src/hooks/useRealtimeData.ts:222-321`.
- Sustituir mocks por WebSocket del microservicio (`/ws`). Ver guía: `docs/websocket_integration.md`.

## Diagramas

- Flujo de datos y dependencias: `docs/diagrams/architecture.mmd` (Mermaid).

