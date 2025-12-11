# Faltantes para 100% Funcionalidad

## Resumen

Este documento lista los componentes y tareas necesarias para que la plataforma PoliticaPE funcione de extremo a extremo en producción, sin mocks y con observabilidad, seguridad y resiliencia completas.

## Backend — Scraping y Análisis (project-scrapping)

- Variables de entorno reales
  - Configurar `TWITTER_BEARER_TOKEN`, `FACEBOOK_ACCESS_TOKEN`, `INSTAGRAM_ACCESS_TOKEN`, `YOUTUBE_API_KEY` en `.env`.
  - Ver plantilla: `project-scrapping/.env.example:13-18`.
- Broker y workers
  - Asegurar Redis en ejecución y workers Celery + Celery Beat activos para tareas periódicas. Ver `project-scrapping/docker-compose.yml:20-49`.
- Políticas de scraping
  - Completar listas de páginas/ID público para Facebook; actualmente vacío: `project-scrapping/app/scrapers/social_scrapers.py:147-155`.
  - Ajustar selectores y parseo para cambios de HTML en medios (El Comercio/RPP/Gestión). Ver funciones `_parse_content` y `_extract_article_data`: `project-scrapping/app/scrapers/news_scrapers.py:48-66,178-206,269-286`.
- Robustez
  - Implementar rotación de proxies si se requiere (`settings.ROTATE_PROXIES`), manejar captchas y bloqueos.
  - Completar manejo de errores y reintentos donde aplique (existe `with_exponential_backoff` en tareas: `project-scrapping/app/tasks/scraping.py:42-44,91-92,137-138`).
- Persistencia y limpieza
  - Validar índices y mantenimiento en tablas públicas (`db/ddl_postgres.sql:30-103`).
  - Programar limpieza de logs y datos antiguos (ya tiene `cleanup_old_logs`): `project-scrapping/app/tasks/processing.py:96-110`.

## Backend — Streaming y WebSocket (project-sniffing/microservice)

- Conexión a BD
  - Confirmar disponibilidad de `POSTGRES_URL` con acceso a `politiscope_db`. Ver `project-sniffing/microservice/main.py:355-371`.
- WebSocket en producción
  - Servir por `wss://` con TLS (reverse proxy Nginx/Caddy). Endpoint: `project-sniffing/microservice/main.py:850-865`.
- Fuentes en tiempo real
  - Integrar cliente de Twitter real (ahora simulado si no hay token): `project-sniffing/microservice/main.py:569-581,591-599`.
  - Opcional: incorporar Kafka para ingesta/producción real (importado pero no usado aún). Docker Compose listo: `project-sniffing/microservice/docker-compose.yml:30-51`.
- Observabilidad
  - Integrar Prometheus scrape del endpoint `/metrics`: `project-sniffing/microservice/main.py:810-814`.
  - Añadir dashboards (Grafana) y alertas si se requiere.

## Frontend — React (project-react)

- Sustituir mocks por datos reales
  - Monitoreo en tiempo real: reemplazar `useRealtimeData` por WebSocket. Ver guía: `docs/websocket_integration.md` y mocks en `project-react/src/hooks/useRealtimeData.ts:222-321`.
  - Consumo REST para analytics: conectar pestañas a endpoints FastAPI:
    - Sentimiento: `GET /api/v1/analysis/sentiment` (`project-scrapping/app/api/endpoints/analysis.py:13-33`).
    - Tendencias: `GET /api/v1/analysis/trends` (`project-scrapping/app/api/endpoints/analysis.py:35-49`).
    - Geográfico: `GET /api/v1/analysis/geographic` (`project-scrapping/app/api/endpoints/analysis.py:51-63`).
    - Engagement: `GET /api/v1/analysis/engagement` (`project-scrapping/app/api/endpoints/analysis.py:65-78`).
- Autenticación real
  - Integrar backend de identidad (tokens/sesiones). El frontend usa credenciales simuladas: `project-react/src/contexts/AuthContext.tsx:49-73`.
  - Backend aún no expone endpoints de `identity.*`; implementar servicio de auth (registro/login/sesiones) y enlazar con tablas `identity.users` y `identity.sessions` (`db/ddl_postgres.sql:206-221,261-272`).
- Configuración y seguridad
  - Añadir configuración de entorno para URLs (`API_BASE_URL`, `WS_URL`) según entorno.
  - Habilitar manejo de errores y estados de carga en cada módulo al consumir APIs.

## Datos y Modelo

- Migraciones y consistencia
  - Alinear modelos ORM con DDL SQL (tipos, índices, columnas). Ver `project-scrapping/app/models.py` y `db/ddl_postgres.sql`.
  - Considerar UUID vs BIGSERIAL en tablas de tiempo real (ya definido en DDL; streaming crea tabla si falta: `project-sniffing/microservice/main.py:387-446`).
- Validaciones
  - Añadir validaciones en APIs para parámetros (fuente, plataforma, límites). Revisar Query params actuales: `project-scrapping/app/api/endpoints/data.py:15-33,35-52,53-74,75-92`.

## Despliegue y Operación

- Orquestación
  - Unificar `docker-compose` para ejecutar: scrapping API, Celery, Redis, streaming, Prometheus y frontend.
  - Declarar `extra_hosts` para acceso a BD externa en cada servicio donde aplique.
- Seguridad
  - TLS/HTTPS en API y WebSocket. Gestión de secretos con `.env` no versionado (mantener `!.env.example` en `.gitignore`: `/.gitignore:39-41`).
  - Rate limiting ya configurado en scrapping: `project-scrapping/app/main.py:33-45`.

## Pruebas y Calidad

- Tests
  - Agregar tests unitarios para scrapers, servicios de análisis y APIs.
  - Pruebas de integración para flujo WebSocket y persistencia en `realtime_data.live_streams`.
- Linting/Typecheck
  - Frontend: ejecutar `npm run lint` (`project-react/package.json:10-15`). Añadir typecheck si aplica.
  - Backend: flake8/ruff y mypy opcional.

## Roadmap Sugerido

1) Implementar hook WebSocket y sustituir mocks en Monitoreo.
2) Conectar pestañas de Analytics a endpoints REST.
3) Configurar Redis/Celery y tareas periódicas activas en entorno.
4) Integrar autenticación real (servicio de identidad) y proteger endpoints.
5) Unificar despliegue con Docker Compose y TLS.
6) Añadir tests, métricas y dashboards.

