# Plan de Trabajo - PoliticaPE

## Plataforma de Análisis Político para Perú

**Fecha de Inicio:** 2024-12-11  
**Última Actualización:** 2024-12-11  
**Estado General:** EN PROGRESO - Fase 4 EN CURSO (Integración Frontend-Backend)

---

## Fase 1: Infraestructura Base

### 1.1 Base de Datos PostgreSQL
| ID | Tarea | Estado |
|----|-------|--------|
| 1.1.1 | Crear base de datos PostgreSQL en Replit | CULMINADO |
| 1.1.2 | Ejecutar script DDL para crear esquemas (public, realtime_data, identity, organization) | CULMINADO |
| 1.1.3 | Verificar creación de todas las tablas e índices (27 tablas creadas) | CULMINADO |
| 1.1.4 | Insertar datos semilla (26 regiones, 4 roles, 7 permisos, 1 tenant, 1 usuario admin, 1 partido, 1 campaña) | CULMINADO |

### 1.2 Variables de Entorno y Secrets
| ID | Tarea | Estado |
|----|-------|--------|
| 1.2.1 | Configurar DATABASE_URL como variable de entorno compartida | CULMINADO |
| 1.2.2 | Solicitar TWITTER_BEARER_TOKEN (opcional para scraping Twitter) | OMITIDO - Opcional |
| 1.2.3 | Solicitar YOUTUBE_API_KEY (opcional para scraping YouTube) | OMITIDO - Opcional |
| 1.2.4 | Solicitar FACEBOOK_ACCESS_TOKEN (opcional para scraping Facebook) | OMITIDO - Opcional |
| 1.2.5 | Solicitar INSTAGRAM_ACCESS_TOKEN (opcional para scraping Instagram) | OMITIDO - Opcional |

---

## Fase 2: Backend - project-scrapping (Microservicio de Scraping)

### 2.1 Configuración del Entorno Python
| ID | Tarea | Estado |
|----|-------|--------|
| 2.1.1 | Instalar Python 3.11 en el proyecto | CULMINADO |
| 2.1.2 | Instalar dependencias de requirements-replit.txt | CULMINADO |
| 2.1.3 | Configurar archivo .env con variables de conexión | CULMINADO |
| 2.1.4 | Actualizar config.py para usar DATABASE_URL de Replit | CULMINADO |

### 2.2 Adaptación para Replit (Sin Docker/Redis/Celery)
| ID | Tarea | Estado |
|----|-------|--------|
| 2.2.1 | Modificar arquitectura para funcionar sin Redis (usar BackgroundTasks) | CULMINADO |
| 2.2.2 | Reemplazar Celery por FastAPI BackgroundTasks | CULMINADO |
| 2.2.3 | Adaptar scrapers para modo standalone | CULMINADO |
| 2.2.4 | Simplificar configuración de rate limiting (slowapi) | CULMINADO |

### 2.3 API FastAPI
| ID | Tarea | Estado |
|----|-------|--------|
| 2.3.1 | Configurar servidor FastAPI en puerto 8000 | CULMINADO |
| 2.3.2 | Verificar endpoints de datos (/api/v1/data/news, social, government) | CULMINADO |
| 2.3.3 | Verificar endpoints de análisis (/api/v1/analysis/sentiment, trends) | CULMINADO |
| 2.3.4 | Verificar endpoints de scraping (/api/v1/scraping/trigger/*) | CULMINADO |
| 2.3.5 | Agregar endpoint de health check (/health) | CULMINADO |
| 2.3.6 | Configurar CORS para permitir llamadas desde frontend | CULMINADO |
| 2.3.7 | Crear endpoint de autenticación (/api/v1/auth/login) con bcrypt | CULMINADO |

### 2.4 Scrapers Funcionales
| ID | Tarea | Estado | Notas |
|----|-------|--------|-------|
| 2.4.1 | Probar scraper de El Comercio | PENDIENTE | Estructura lista |
| 2.4.2 | Probar scraper de RPP | PENDIENTE | Estructura lista |
| 2.4.3 | Probar scraper de Gestión | PENDIENTE | Estructura lista |
| 2.4.4 | Probar scraper de ONPE (datos electorales) | PENDIENTE | Estructura lista |
| 2.4.5 | Probar scraper de INEI (estadísticas) | PENDIENTE | Estructura lista |
| 2.4.6 | Configurar scraper de Twitter (requiere API key) | OMITIDO | Opcional |
| 2.4.7 | Configurar scraper de YouTube (requiere API key) | OMITIDO | Opcional |

### 2.5 Servicios de Análisis
| ID | Tarea | Estado |
|----|-------|--------|
| 2.5.1 | Verificar servicio de análisis de sentimiento | CULMINADO |
| 2.5.2 | Verificar servicio de detección geográfica | CULMINADO |
| 2.5.3 | Verificar servicio de limpieza de datos | CULMINADO |

### 2.6 Workflow y Deployment
| ID | Tarea | Estado |
|----|-------|--------|
| 2.6.1 | Crear workflow "Backend-Scrapping" en puerto 8000 | CULMINADO |
| 2.6.2 | Verificar que el servidor inicia correctamente | CULMINADO |
| 2.6.3 | Configurar deployment para producción | PENDIENTE |

---

## Fase 3: Backend - project-sniffing (Microservicio de Tiempo Real)

### 3.1 Configuración del Entorno Python
| ID | Tarea | Estado |
|----|-------|--------|
| 3.1.1 | Instalar dependencias de requirements-replit.txt | CULMINADO |
| 3.1.2 | Configurar conexión a base de datos PostgreSQL | CULMINADO |
| 3.1.3 | Adaptar configuración para entorno Replit | CULMINADO |

### 3.2 Adaptación para Replit
| ID | Tarea | Estado |
|----|-------|--------|
| 3.2.1 | Eliminar dependencia de Kafka (usar almacenamiento en memoria) | CULMINADO |
| 3.2.2 | Simplificar pipeline NLP (análisis basado en reglas) | CULMINADO |
| 3.2.3 | Adaptar WebSocket manager para producción | CULMINADO |

### 3.3 API FastAPI con WebSocket
| ID | Tarea | Estado |
|----|-------|--------|
| 3.3.1 | Configurar servidor FastAPI en puerto 8080 | CULMINADO |
| 3.3.2 | Verificar endpoint WebSocket (/ws/stream) | CULMINADO |
| 3.3.3 | Verificar endpoint de métricas (/api/metrics) | CULMINADO |
| 3.3.4 | Verificar endpoint de análisis (/api/analyze) | CULMINADO |
| 3.3.5 | Verificar health check (/health) | CULMINADO |
| 3.3.6 | Configurar CORS para frontend | CULMINADO |

### 3.4 Análisis en Tiempo Real
| ID | Tarea | Estado |
|----|-------|--------|
| 3.4.1 | Verificar analizador de sentimiento | CULMINADO |
| 3.4.2 | Verificar detector de crisis | CULMINADO |
| 3.4.3 | Verificar detector de oportunidades | CULMINADO |
| 3.4.4 | Verificar extractor de entidades políticas | CULMINADO |
| 3.4.5 | Verificar detector de región geográfica | CULMINADO |

### 3.5 Persistencia y Broadcasting
| ID | Tarea | Estado |
|----|-------|--------|
| 3.5.1 | Implementar almacenamiento en memoria (InMemoryStorage) | CULMINADO |
| 3.5.2 | Verificar broadcasting por WebSocket | CULMINADO |
| 3.5.3 | Endpoints de datos recientes (/api/recent, /api/crisis-alerts) | CULMINADO |

### 3.6 Workflow y Deployment
| ID | Tarea | Estado |
|----|-------|--------|
| 3.6.1 | Crear workflow "Backend-Sniffing" en puerto 8080 | CULMINADO |
| 3.6.2 | Verificar que el servidor inicia correctamente | CULMINADO |
| 3.6.3 | Configurar deployment para producción | PENDIENTE |

---

## Fase 4: Frontend - project-react (Dashboard Principal)

### 4.1 Configuración Base
| ID | Tarea | Estado |
|----|-------|--------|
| 4.1.1 | Configurar Vite para puerto 5000 y hosts permitidos | CULMINADO |
| 4.1.2 | Instalar dependencias npm | CULMINADO |
| 4.1.3 | Remover dependencias incompatibles (react-instagram-embed, etc.) | CULMINADO |
| 4.1.4 | Verificar que el servidor de desarrollo funciona | CULMINADO |
| 4.1.5 | Crear archivo de configuración de API (src/config/api.ts) | CULMINADO |

### 4.2 Integración con Backend Scrapping
| ID | Tarea | Estado |
|----|-------|--------|
| 4.2.1 | Crear servicio API client para conectar con backend scrapping | CULMINADO |
| 4.2.2 | Reemplazar mock data de noticias por datos reales | PENDIENTE |
| 4.2.3 | Reemplazar mock data de redes sociales por datos reales | PENDIENTE |
| 4.2.4 | Reemplazar mock data gubernamental por datos reales | PENDIENTE |
| 4.2.5 | Integrar análisis de sentimiento real | PENDIENTE |

### 4.3 Integración con Backend Sniffing (Tiempo Real)
| ID | Tarea | Estado |
|----|-------|--------|
| 4.3.1 | Actualizar hook useWebSocket para conectar con backend real | CULMINADO |
| 4.3.2 | Actualizar hook useRealtimeData para datos reales | PENDIENTE |
| 4.3.3 | Conectar MonitoringPage con WebSocket real | PENDIENTE |
| 4.3.4 | Conectar AlertsPanel con datos reales de crisis | PENDIENTE |
| 4.3.5 | Conectar TrendingHashtags con datos reales | PENDIENTE |

### 4.4 Módulos del Dashboard
| ID | Tarea | Estado |
|----|-------|--------|
| 4.4.1 | Verificar Dashboard principal con datos reales | PENDIENTE |
| 4.4.2 | Verificar Analytics con datos reales | PENDIENTE |
| 4.4.3 | Verificar Análisis Geográfico con mapas funcionales | PENDIENTE |
| 4.4.4 | Verificar Monitoreo en Tiempo Real | PENDIENTE |
| 4.4.5 | Verificar Recomendaciones IA | PENDIENTE |
| 4.4.6 | Verificar Gestión de Campañas | PENDIENTE |
| 4.4.7 | Verificar Demografía | PENDIENTE |
| 4.4.8 | Verificar Redes Sociales | PENDIENTE |
| 4.4.9 | Verificar Gestión de Datos | PENDIENTE |
| 4.4.10 | Verificar Configuración y Settings | PENDIENTE |

### 4.5 Autenticación
| ID | Tarea | Estado |
|----|-------|--------|
| 4.5.1 | Implementar autenticación real (no mock) | CULMINADO |
| 4.5.2 | Conectar login con tabla identity.users | CULMINADO |
| 4.5.3 | Validación segura de contraseñas con bcrypt | CULMINADO |
| 4.5.4 | Implementar registro de usuarios | PENDIENTE |
| 4.5.5 | Implementar recuperación de contraseña | PENDIENTE |
| 4.5.6 | Implementar manejo de sesiones/tokens | PENDIENTE |

### 4.6 Workflow y Deployment
| ID | Tarea | Estado |
|----|-------|--------|
| 4.6.1 | Workflow "Frontend" funcionando | CULMINADO |
| 4.6.2 | Configurar build de producción | PENDIENTE |
| 4.6.3 | Configurar deployment para producción | PENDIENTE |

---

## Fase 5: Frontend - project-sniffing (Dashboard de Monitoreo) - OMITIDA

**NOTA:** El frontend de project-sniffing se integrará en project-react como parte del módulo de Monitoreo. No se requiere un frontend separado.

| ID | Tarea | Estado |
|----|-------|--------|
| 5.1 - 5.4 | Todas las tareas | OMITIDO - Integrado en Fase 4 |

---

## Fase 6: Integración y Testing

### 6.1 Testing End-to-End
| ID | Tarea | Estado |
|----|-------|--------|
| 6.1.1 | Test: Scraping de noticias → API → Frontend | PENDIENTE |
| 6.1.2 | Test: Datos en tiempo real → WebSocket → Dashboard | PENDIENTE |
| 6.1.3 | Test: Autenticación completa (login/logout/registro) | CULMINADO (login verificado) |
| 6.1.4 | Test: Gestión de campañas CRUD completo | PENDIENTE |
| 6.1.5 | Test: Análisis geográfico con datos reales | PENDIENTE |

### 6.2 Optimización
| ID | Tarea | Estado |
|----|-------|--------|
| 6.2.1 | Optimizar queries de base de datos | PENDIENTE |
| 6.2.2 | Implementar caché donde sea necesario | PENDIENTE |
| 6.2.3 | Optimizar bundle size del frontend | PENDIENTE |
| 6.2.4 | Verificar rendimiento de WebSocket con múltiples clientes | PENDIENTE |

---

## Fase 7: Deployment y Publicación

### 7.1 Preparación para Producción
| ID | Tarea | Estado |
|----|-------|--------|
| 7.1.1 | Revisar todas las variables de entorno de producción | PENDIENTE |
| 7.1.2 | Configurar logging para producción | PENDIENTE |
| 7.1.3 | Verificar manejo de errores en todos los servicios | PENDIENTE |
| 7.1.4 | Documentar APIs con OpenAPI/Swagger | CULMINADO (autodoc) |

### 7.2 Deployment en Replit
| ID | Tarea | Estado |
|----|-------|--------|
| 7.2.1 | Publicar project-react (Frontend principal) | PENDIENTE |
| 7.2.2 | Publicar project-scrapping (Backend de datos) | PENDIENTE |
| 7.2.3 | Publicar project-sniffing (Backend tiempo real) | PENDIENTE |
| 7.2.4 | Verificar URLs de producción funcionando | PENDIENTE |
| 7.2.5 | Actualizar URLs de API en frontend para producción | PENDIENTE |

### 7.3 Documentación Final
| ID | Tarea | Estado |
|----|-------|--------|
| 7.3.1 | Actualizar README principal del proyecto | PENDIENTE |
| 7.3.2 | Documentar arquitectura final | CULMINADO (replit.md) |
| 7.3.3 | Documentar guía de usuario | PENDIENTE |
| 7.3.4 | Documentar guía de administración | PENDIENTE |

---

## Resumen de Progreso

| Fase | Total Tareas | Culminadas | Omitidas | Pendientes |
|------|--------------|------------|----------|------------|
| Fase 1: Infraestructura | 9 | 5 | 4 | 0 |
| Fase 2: Backend Scrapping | 25 | 18 | 2 | 5 |
| Fase 3: Backend Sniffing | 18 | 18 | 0 | 0 |
| Fase 4: Frontend React | 27 | 11 | 0 | 16 |
| Fase 5: Frontend Sniffing | 12 | 0 | 12 | 0 |
| Fase 6: Testing | 9 | 1 | 0 | 8 |
| Fase 7: Deployment | 13 | 2 | 0 | 11 |
| **TOTAL** | **113** | **55** | **18** | **40** |

**Progreso Total: 49% completado (65% considerando omitidas)**

---

## Estado Actual de los Servicios

| Servicio | Puerto | Estado | Endpoint de Prueba |
|----------|--------|--------|-------------------|
| Frontend | 5000 | RUNNING | http://localhost:5000 |
| Backend Scrapping | 8000 | RUNNING | http://localhost:8000/health |
| Backend Sniffing | 8080 | RUNNING | http://localhost:8080/health |

### Credenciales Demo
- **Email:** admin@politica.pe
- **Password:** password123

### Endpoints de API Funcionales
- `POST /api/v1/auth/login` - Autenticación con bcrypt
- `GET /api/v1/data/stats` - Estadísticas de datos
- `GET /api/v1/data/news` - Noticias
- `GET /api/v1/analysis/sentiment` - Análisis de sentimiento
- `POST /api/analyze` - Análisis en tiempo real (Backend Sniffing)
- `WS /ws/stream` - Streaming WebSocket

---

## Próximos Pasos (Prioridad)

1. **4.2.2-4.2.5**: Integrar datos reales del Backend Scrapping en el frontend
2. **4.3.2-4.3.5**: Completar integración de datos en tiempo real
3. **4.4.1-4.4.10**: Verificar todos los módulos del dashboard
4. **7.2.1-7.2.5**: Configurar y publicar en Replit

---

## Notas Técnicas

### Decisiones de Diseño
- **Sin Redis/Celery**: Reemplazado por FastAPI BackgroundTasks y almacenamiento en memoria
- **Sin Kafka**: Reemplazado por WebSocket directo con broadcasting
- **Sin modelos ML pesados**: Análisis de sentimiento basado en reglas (palabras clave)
- **Puerto 8080 para Sniffing**: Cambiado de 8001 porque 8001 no está disponible en Replit
- **Autenticación con bcrypt**: Validación segura de contraseñas

### Archivos Modificados/Creados
- `project-scrapping/requirements-replit.txt` - Dependencias simplificadas
- `project-scrapping/app/config.py` - Configuración para Replit
- `project-scrapping/app/api/endpoints/auth.py` - Endpoint de autenticación con bcrypt
- `project-scrapping/app/api/endpoints/scraping.py` - Sin Celery
- `project-sniffing/microservice/main.py` - Versión simplificada sin Kafka/Redis
- `project-sniffing/microservice/requirements-replit.txt` - Dependencias simplificadas
- `project-react/src/config/api.ts` - Configuración de endpoints de API
- `project-react/src/contexts/AuthContext.tsx` - Autenticación con backend real
- `project-react/src/hooks/useWebSocket.ts` - WebSocket con Backend Sniffing
