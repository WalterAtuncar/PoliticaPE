# Plan de Trabajo - PoliticaPE

## Plataforma de Análisis Político para Perú

**Fecha de Inicio:** 2024-12-11  
**Estado General:** EN PROGRESO

---

## Fase 1: Infraestructura Base

### 1.1 Base de Datos PostgreSQL
| ID | Tarea | Estado |
|----|-------|--------|
| 1.1.1 | Crear base de datos PostgreSQL en Replit | POR_INICIAR |
| 1.1.2 | Ejecutar script DDL para crear esquemas (public, realtime_data, identity, organization) | POR_INICIAR |
| 1.1.3 | Verificar creación de todas las tablas e índices | POR_INICIAR |
| 1.1.4 | Insertar datos semilla (regiones del Perú, roles base, tenant inicial) | POR_INICIAR |

### 1.2 Variables de Entorno y Secrets
| ID | Tarea | Estado |
|----|-------|--------|
| 1.2.1 | Configurar DATABASE_URL como variable de entorno compartida | POR_INICIAR |
| 1.2.2 | Solicitar TWITTER_BEARER_TOKEN (opcional para scraping Twitter) | POR_INICIAR |
| 1.2.3 | Solicitar YOUTUBE_API_KEY (opcional para scraping YouTube) | POR_INICIAR |
| 1.2.4 | Solicitar FACEBOOK_ACCESS_TOKEN (opcional para scraping Facebook) | POR_INICIAR |
| 1.2.5 | Solicitar INSTAGRAM_ACCESS_TOKEN (opcional para scraping Instagram) | POR_INICIAR |

---

## Fase 2: Backend - project-scrapping (Microservicio de Scraping)

### 2.1 Configuración del Entorno Python
| ID | Tarea | Estado |
|----|-------|--------|
| 2.1.1 | Instalar Python 3.11 en el proyecto | POR_INICIAR |
| 2.1.2 | Instalar dependencias de requirements.txt | POR_INICIAR |
| 2.1.3 | Configurar archivo .env con variables de conexión | POR_INICIAR |
| 2.1.4 | Actualizar config.py para usar DATABASE_URL de Replit | POR_INICIAR |

### 2.2 Adaptación para Replit (Sin Docker/Redis/Celery)
| ID | Tarea | Estado |
|----|-------|--------|
| 2.2.1 | Modificar arquitectura para funcionar sin Redis (usar almacenamiento local) | POR_INICIAR |
| 2.2.2 | Reemplazar Celery por tareas síncronas o APScheduler en proceso | POR_INICIAR |
| 2.2.3 | Adaptar scrapers para modo standalone | POR_INICIAR |
| 2.2.4 | Simplificar configuración de rate limiting | POR_INICIAR |

### 2.3 API FastAPI
| ID | Tarea | Estado |
|----|-------|--------|
| 2.3.1 | Configurar servidor FastAPI en puerto 8000 | POR_INICIAR |
| 2.3.2 | Verificar endpoints de datos (/api/v1/news, /api/v1/social, /api/v1/government) | POR_INICIAR |
| 2.3.3 | Verificar endpoints de análisis (/api/v1/analysis/*) | POR_INICIAR |
| 2.3.4 | Verificar endpoints de scraping (/api/v1/scraping/*) | POR_INICIAR |
| 2.3.5 | Agregar endpoint de health check (/health) | POR_INICIAR |
| 2.3.6 | Configurar CORS para permitir llamadas desde frontend | POR_INICIAR |

### 2.4 Scrapers Funcionales
| ID | Tarea | Estado |
|----|-------|--------|
| 2.4.1 | Probar scraper de El Comercio | POR_INICIAR |
| 2.4.2 | Probar scraper de RPP | POR_INICIAR |
| 2.4.3 | Probar scraper de Gestión | POR_INICIAR |
| 2.4.4 | Probar scraper de ONPE (datos electorales) | POR_INICIAR |
| 2.4.5 | Probar scraper de INEI (estadísticas) | POR_INICIAR |
| 2.4.6 | Configurar scraper de Twitter (requiere API key) | POR_INICIAR |
| 2.4.7 | Configurar scraper de YouTube (requiere API key) | POR_INICIAR |

### 2.5 Servicios de Análisis
| ID | Tarea | Estado |
|----|-------|--------|
| 2.5.1 | Verificar servicio de análisis de sentimiento | POR_INICIAR |
| 2.5.2 | Verificar servicio de detección geográfica | POR_INICIAR |
| 2.5.3 | Verificar servicio de limpieza de datos | POR_INICIAR |

### 2.6 Workflow y Deployment
| ID | Tarea | Estado |
|----|-------|--------|
| 2.6.1 | Crear workflow "Backend-Scrapping" en puerto 8000 | POR_INICIAR |
| 2.6.2 | Verificar que el servidor inicia correctamente | POR_INICIAR |
| 2.6.3 | Configurar deployment para producción | POR_INICIAR |

---

## Fase 3: Backend - project-sniffing (Microservicio de Tiempo Real)

### 3.1 Configuración del Entorno Python
| ID | Tarea | Estado |
|----|-------|--------|
| 3.1.1 | Instalar dependencias de requirements.txt | POR_INICIAR |
| 3.1.2 | Configurar conexión a base de datos PostgreSQL | POR_INICIAR |
| 3.1.3 | Adaptar configuración para entorno Replit | POR_INICIAR |

### 3.2 Adaptación para Replit
| ID | Tarea | Estado |
|----|-------|--------|
| 3.2.1 | Eliminar dependencia de Kafka (usar simulación o polling) | POR_INICIAR |
| 3.2.2 | Simplificar pipeline NLP para funcionar sin modelos pesados | POR_INICIAR |
| 3.2.3 | Adaptar WebSocket manager para producción | POR_INICIAR |

### 3.3 API FastAPI con WebSocket
| ID | Tarea | Estado |
|----|-------|--------|
| 3.3.1 | Configurar servidor FastAPI en puerto 8001 | POR_INICIAR |
| 3.3.2 | Verificar endpoint WebSocket (/ws) | POR_INICIAR |
| 3.3.3 | Verificar endpoint de estadísticas (/api/stats) | POR_INICIAR |
| 3.3.4 | Verificar endpoint de métricas (/metrics) | POR_INICIAR |
| 3.3.5 | Verificar health check (/health) | POR_INICIAR |
| 3.3.6 | Configurar CORS para frontend | POR_INICIAR |

### 3.4 Análisis en Tiempo Real
| ID | Tarea | Estado |
|----|-------|--------|
| 3.4.1 | Verificar analizador de sentimiento | POR_INICIAR |
| 3.4.2 | Verificar detector de crisis | POR_INICIAR |
| 3.4.3 | Verificar detector de oportunidades | POR_INICIAR |
| 3.4.4 | Verificar extractor de entidades políticas | POR_INICIAR |
| 3.4.5 | Verificar detector de región geográfica | POR_INICIAR |

### 3.5 Persistencia y Broadcasting
| ID | Tarea | Estado |
|----|-------|--------|
| 3.5.1 | Verificar guardado en tabla realtime_data.live_streams | POR_INICIAR |
| 3.5.2 | Verificar broadcasting por WebSocket | POR_INICIAR |
| 3.5.3 | Implementar generador de datos demo (para pruebas) | POR_INICIAR |

### 3.6 Workflow y Deployment
| ID | Tarea | Estado |
|----|-------|--------|
| 3.6.1 | Crear workflow "Backend-Sniffing" en puerto 8001 | POR_INICIAR |
| 3.6.2 | Verificar que el servidor inicia correctamente | POR_INICIAR |
| 3.6.3 | Configurar deployment para producción | POR_INICIAR |

---

## Fase 4: Frontend - project-react (Dashboard Principal)

### 4.1 Configuración Base
| ID | Tarea | Estado |
|----|-------|--------|
| 4.1.1 | Configurar Vite para puerto 5000 y hosts permitidos | CULMINADO |
| 4.1.2 | Instalar dependencias npm | CULMINADO |
| 4.1.3 | Remover dependencias incompatibles (react-instagram-embed, etc.) | CULMINADO |
| 4.1.4 | Verificar que el servidor de desarrollo funciona | CULMINADO |

### 4.2 Integración con Backend Scrapping
| ID | Tarea | Estado |
|----|-------|--------|
| 4.2.1 | Crear servicio API client para conectar con backend scrapping | POR_INICIAR |
| 4.2.2 | Reemplazar mock data de noticias por datos reales | POR_INICIAR |
| 4.2.3 | Reemplazar mock data de redes sociales por datos reales | POR_INICIAR |
| 4.2.4 | Reemplazar mock data gubernamental por datos reales | POR_INICIAR |
| 4.2.5 | Integrar análisis de sentimiento real | POR_INICIAR |

### 4.3 Integración con Backend Sniffing (Tiempo Real)
| ID | Tarea | Estado |
|----|-------|--------|
| 4.3.1 | Actualizar hook useWebSocket para conectar con backend real | POR_INICIAR |
| 4.3.2 | Actualizar hook useRealtimeData para datos reales | POR_INICIAR |
| 4.3.3 | Conectar MonitoringPage con WebSocket real | POR_INICIAR |
| 4.3.4 | Conectar AlertsPanel con datos reales de crisis | POR_INICIAR |
| 4.3.5 | Conectar TrendingHashtags con datos reales | POR_INICIAR |

### 4.4 Módulos del Dashboard
| ID | Tarea | Estado |
|----|-------|--------|
| 4.4.1 | Verificar Dashboard principal con datos reales | POR_INICIAR |
| 4.4.2 | Verificar Analytics con datos reales | POR_INICIAR |
| 4.4.3 | Verificar Análisis Geográfico con mapas funcionales | POR_INICIAR |
| 4.4.4 | Verificar Monitoreo en Tiempo Real | POR_INICIAR |
| 4.4.5 | Verificar Recomendaciones IA | POR_INICIAR |
| 4.4.6 | Verificar Gestión de Campañas | POR_INICIAR |
| 4.4.7 | Verificar Demografía | POR_INICIAR |
| 4.4.8 | Verificar Redes Sociales | POR_INICIAR |
| 4.4.9 | Verificar Gestión de Datos | POR_INICIAR |
| 4.4.10 | Verificar Configuración y Settings | POR_INICIAR |

### 4.5 Autenticación
| ID | Tarea | Estado |
|----|-------|--------|
| 4.5.1 | Implementar autenticación real (no mock) | POR_INICIAR |
| 4.5.2 | Conectar login con tabla identity.users | POR_INICIAR |
| 4.5.3 | Implementar registro de usuarios | POR_INICIAR |
| 4.5.4 | Implementar recuperación de contraseña | POR_INICIAR |
| 4.5.5 | Implementar manejo de sesiones | POR_INICIAR |

### 4.6 Workflow y Deployment
| ID | Tarea | Estado |
|----|-------|--------|
| 4.6.1 | Workflow "Frontend" funcionando | CULMINADO |
| 4.6.2 | Configurar build de producción | POR_INICIAR |
| 4.6.3 | Configurar deployment para producción | POR_INICIAR |

---

## Fase 5: Frontend - project-sniffing (Dashboard de Monitoreo)

### 5.1 Configuración Base
| ID | Tarea | Estado |
|----|-------|--------|
| 5.1.1 | Configurar Vite para puerto diferente (5001 o integrar) | POR_INICIAR |
| 5.1.2 | Instalar dependencias npm | POR_INICIAR |
| 5.1.3 | Verificar que el servidor funciona | POR_INICIAR |

### 5.2 Integración WebSocket
| ID | Tarea | Estado |
|----|-------|--------|
| 5.2.1 | Conectar con backend sniffing vía WebSocket | POR_INICIAR |
| 5.2.2 | Implementar reconexión automática | POR_INICIAR |
| 5.2.3 | Mostrar estado de conexión en UI | POR_INICIAR |

### 5.3 Componentes de Tiempo Real
| ID | Tarea | Estado |
|----|-------|--------|
| 5.3.1 | Verificar Dashboard con métricas reales | POR_INICIAR |
| 5.3.2 | Verificar StreamMonitor con datos reales | POR_INICIAR |
| 5.3.3 | Verificar SentimentAnalysis en tiempo real | POR_INICIAR |
| 5.3.4 | Verificar CrisisAlerts con alertas reales | POR_INICIAR |
| 5.3.5 | Verificar SystemHealth con métricas del servidor | POR_INICIAR |
| 5.3.6 | Verificar LiveChart con datos en vivo | POR_INICIAR |

### 5.4 Workflow y Deployment
| ID | Tarea | Estado |
|----|-------|--------|
| 5.4.1 | Decidir: integrar en project-react o mantener separado | POR_INICIAR |
| 5.4.2 | Configurar deployment si es proyecto separado | POR_INICIAR |

---

## Fase 6: Integración y Testing

### 6.1 Testing End-to-End
| ID | Tarea | Estado |
|----|-------|--------|
| 6.1.1 | Test: Scraping de noticias → API → Frontend | POR_INICIAR |
| 6.1.2 | Test: Datos en tiempo real → WebSocket → Dashboard | POR_INICIAR |
| 6.1.3 | Test: Autenticación completa (login/logout/registro) | POR_INICIAR |
| 6.1.4 | Test: Gestión de campañas CRUD completo | POR_INICIAR |
| 6.1.5 | Test: Análisis geográfico con datos reales | POR_INICIAR |

### 6.2 Optimización
| ID | Tarea | Estado |
|----|-------|--------|
| 6.2.1 | Optimizar queries de base de datos | POR_INICIAR |
| 6.2.2 | Implementar caché donde sea necesario | POR_INICIAR |
| 6.2.3 | Optimizar bundle size del frontend | POR_INICIAR |
| 6.2.4 | Verificar rendimiento de WebSocket con múltiples clientes | POR_INICIAR |

---

## Fase 7: Deployment y Publicación

### 7.1 Preparación para Producción
| ID | Tarea | Estado |
|----|-------|--------|
| 7.1.1 | Revisar todas las variables de entorno de producción | POR_INICIAR |
| 7.1.2 | Configurar logging para producción | POR_INICIAR |
| 7.1.3 | Verificar manejo de errores en todos los servicios | POR_INICIAR |
| 7.1.4 | Documentar APIs con OpenAPI/Swagger | POR_INICIAR |

### 7.2 Deployment en Replit
| ID | Tarea | Estado |
|----|-------|--------|
| 7.2.1 | Publicar project-react (Frontend principal) | POR_INICIAR |
| 7.2.2 | Publicar project-scrapping (Backend de datos) | POR_INICIAR |
| 7.2.3 | Publicar project-sniffing (Backend tiempo real) | POR_INICIAR |
| 7.2.4 | Verificar URLs de producción funcionando | POR_INICIAR |
| 7.2.5 | Actualizar URLs de API en frontend para producción | POR_INICIAR |

### 7.3 Documentación Final
| ID | Tarea | Estado |
|----|-------|--------|
| 7.3.1 | Actualizar README principal del proyecto | POR_INICIAR |
| 7.3.2 | Documentar arquitectura final | POR_INICIAR |
| 7.3.3 | Documentar guía de usuario | POR_INICIAR |
| 7.3.4 | Documentar guía de administración | POR_INICIAR |

---

## Resumen de Progreso

| Fase | Total Tareas | Culminadas | En Progreso | Por Iniciar |
|------|--------------|------------|-------------|-------------|
| Fase 1: Infraestructura | 9 | 0 | 0 | 9 |
| Fase 2: Backend Scrapping | 24 | 0 | 0 | 24 |
| Fase 3: Backend Sniffing | 20 | 0 | 0 | 20 |
| Fase 4: Frontend React | 25 | 4 | 0 | 21 |
| Fase 5: Frontend Sniffing | 12 | 0 | 0 | 12 |
| Fase 6: Testing | 9 | 0 | 0 | 9 |
| Fase 7: Deployment | 13 | 0 | 0 | 13 |
| **TOTAL** | **112** | **4** | **0** | **108** |

---

## Notas Importantes

### Dependencias Externas Opcionales
Las siguientes API keys son **opcionales** pero habilitan funcionalidades adicionales:
- **TWITTER_BEARER_TOKEN**: Scraping de Twitter/X
- **YOUTUBE_API_KEY**: Scraping de YouTube
- **FACEBOOK_ACCESS_TOKEN**: Scraping de Facebook
- **INSTAGRAM_ACCESS_TOKEN**: Scraping de Instagram

Sin estas keys, los scrapers de redes sociales no funcionarán, pero el resto del sistema sí.

### Limitaciones de Replit
- No se puede usar Docker ni contenedores
- Redis no está disponible nativamente (se usará alternativa)
- Celery requiere Redis, se reemplazará por APScheduler
- Los modelos de ML pesados (BERT) pueden requerir optimización

### Orden de Ejecución Recomendado
1. **Fase 1** → Base de datos (requerido para todo)
2. **Fase 2** → Backend scrapping (provee datos)
3. **Fase 3** → Backend sniffing (provee tiempo real)
4. **Fase 4** → Frontend principal (consume ambos backends)
5. **Fase 5** → Frontend sniffing (opcional, puede integrarse en Fase 4)
6. **Fase 6** → Testing
7. **Fase 7** → Deployment final
