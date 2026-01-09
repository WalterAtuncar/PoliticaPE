# Tareas Pendientes - PoliticaPE

**Fecha de Creación:** 2025-12-26  
**Total de Tareas Pendientes:** 44  
**Prioridad:** Alta → Media → Baja

---

## Resumen Ejecutivo

| Área | Tareas Pendientes | Prioridad |
|------|-------------------|-----------|
| Backend Scrapping | 8 | Media |
| Frontend React | 16 | Alta |
| Testing | 8 | Media |
| Deployment | 11 | Alta |
| Datos Políticos | 1 | Baja |

---

## 1. BACKEND SCRAPPING (8 tareas)

### 1.1 Scrapers de Noticias (5 tareas) - Prioridad: Media
Scrapers para obtener noticias de medios peruanos.

| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 2.4.1 | Probar scraper de El Comercio | - Verificar selectores CSS<br>- Probar extracción de título, contenido, fecha<br>- Manejar paginación<br>- Guardar en BD | 2h |
| 2.4.2 | Probar scraper de RPP | - Verificar selectores CSS<br>- Probar extracción de datos<br>- Manejar errores de conexión | 2h |
| 2.4.3 | Probar scraper de Gestión | - Verificar selectores CSS<br>- Probar extracción de noticias económicas/políticas | 2h |
| 2.4.4 | Probar scraper de ONPE | - Obtener datos electorales públicos<br>- Parsear resultados de elecciones | 3h |
| 2.4.5 | Probar scraper de INEI | - Obtener estadísticas demográficas<br>- Parsear datos regionales | 3h |

### 1.2 Redes Sociales (1 tarea) - Prioridad: Baja
| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 2.4.10 | Completar scraper de TikTok | - Esperar aprobación de API (2-5 días)<br>- Probar conexión<br>- Verificar extracción de videos | 2h |

### 1.3 Deployment Backend (2 tareas) - Prioridad: Alta
| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 2.6.3 | Configurar deployment scrapping | - Configurar variables de producción<br>- Optimizar para autoscale<br>- Verificar health checks | 1h |
| 3.6.3 | Configurar deployment sniffing | - Configurar WebSocket en producción<br>- Verificar conexiones persistentes | 1h |

---

## 2. FRONTEND REACT (16 tareas)

### 2.1 Integración con Backend Scrapping (4 tareas) - Prioridad: Alta
Reemplazar datos mock por datos reales del backend.

| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 4.2.2 | Integrar noticias reales | - Crear hook useNewsData<br>- Conectar con /api/v1/data/news<br>- Mostrar en NewsPanel<br>- Manejar estados de carga/error | 2h |
| 4.2.3 | Integrar redes sociales reales | - Actualizar useSocialData<br>- Conectar con /api/v1/data/social<br>- Filtrar por plataforma<br>- Mostrar métricas reales | 2h |
| 4.2.4 | Integrar datos gubernamentales | - Crear hook useGovernmentData<br>- Conectar con /api/v1/data/government<br>- Mostrar en componentes relevantes | 2h |
| 4.2.5 | Integrar análisis de sentimiento | - Usar datos de /api/v1/analysis/sentiment<br>- Actualizar gráficos de sentimiento<br>- Mostrar tendencias reales | 2h |

### 2.2 Integración Tiempo Real (4 tareas) - Prioridad: Alta
Conectar el frontend con el microservicio de streaming.

| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 4.3.2 | Actualizar useRealtimeData | - Consumir datos de /api/metrics<br>- Sincronizar con WebSocket<br>- Manejar reconexiones | 2h |
| 4.3.3 | Conectar MonitoringPage | - Mostrar posts en tiempo real<br>- Actualizar métricas en vivo<br>- Indicador de conexión WS | 2h |
| 4.3.4 | Conectar AlertsPanel | - Consumir /api/crisis-alerts<br>- Mostrar alertas de crisis<br>- Notificaciones visuales | 2h |
| 4.3.5 | Conectar TrendingHashtags | - Obtener hashtags de /api/recent<br>- Actualizar en tiempo real<br>- Mostrar tendencias | 1h |

### 2.3 Verificación de Módulos (5 tareas) - Prioridad: Media
Verificar que cada módulo funcione con datos reales.

| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 4.4.1 | Verificar Dashboard principal | - Revisar todas las métricas<br>- Verificar gráficos<br>- Probar responsividad | 1h |
| 4.4.2 | Verificar Analytics | - Verificar tendencias<br>- Probar filtros de fecha<br>- Revisar exportación | 1h |
| 4.4.3 | Verificar Análisis Geográfico | - Probar mapa de Perú<br>- Verificar datos por región<br>- Revisar zoom y tooltips | 2h |
| 4.4.4 | Verificar Monitoreo en Tiempo Real | - Probar conexión WebSocket<br>- Verificar actualización automática<br>- Probar alertas | 1h |
| 4.4.5-10 | Verificar módulos restantes | - IA Recomendaciones<br>- Gestión de Campañas<br>- Demografía<br>- Redes Sociales<br>- Gestión de Datos<br>- Configuración | 4h |

### 2.4 Autenticación Avanzada (3 tareas) - Prioridad: Media
Completar el sistema de autenticación.

| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 4.5.4 | Implementar registro de usuarios | - Crear formulario de registro<br>- Endpoint POST /api/v1/auth/register<br>- Validaciones de email/password<br>- Confirmación de registro | 3h |
| 4.5.5 | Implementar recuperación de contraseña | - Formulario "Olvidé mi contraseña"<br>- Endpoint de reset token<br>- Email de recuperación (opcional)<br>- Formulario de nueva contraseña | 3h |
| 4.5.6 | Implementar manejo de sesiones/tokens | - Generar JWT tokens<br>- Refresh tokens<br>- Logout seguro<br>- Expiración de sesión | 3h |

### 2.5 Build de Producción (2 tareas) - Prioridad: Alta
| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 4.6.2 | Configurar build de producción | - Optimizar bundle size<br>- Minificar assets<br>- Configurar variables de entorno | 1h |
| 4.6.3 | Configurar deployment frontend | - Build estático o autoscale<br>- Configurar dominio<br>- Verificar HTTPS | 1h |

---

## 3. TESTING (8 tareas)

### 3.1 Tests End-to-End (4 tareas) - Prioridad: Media
| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 6.1.1 | Test: Scraping → API → Frontend | - Ejecutar scraper<br>- Verificar datos en API<br>- Verificar visualización en frontend | 2h |
| 6.1.2 | Test: Tiempo real → WebSocket → Dashboard | - Enviar dato de prueba<br>- Verificar broadcast WS<br>- Verificar actualización UI | 2h |
| 6.1.4 | Test: Gestión de campañas CRUD | - Crear campaña<br>- Editar campaña<br>- Eliminar campaña<br>- Verificar permisos | 2h |
| 6.1.5 | Test: Análisis geográfico | - Verificar datos por región<br>- Probar filtros<br>- Verificar mapa interactivo | 1h |

### 3.2 Optimización (4 tareas) - Prioridad: Baja
| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 6.2.1 | Optimizar queries de BD | - Analizar queries lentas<br>- Agregar índices faltantes<br>- Implementar paginación | 3h |
| 6.2.2 | Implementar caché | - Cache de API responses<br>- Cache de datos estáticos<br>- Invalidación de cache | 3h |
| 6.2.3 | Optimizar bundle frontend | - Code splitting<br>- Lazy loading de rutas<br>- Tree shaking | 2h |
| 6.2.4 | Test de carga WebSocket | - Simular múltiples clientes<br>- Medir latencia<br>- Identificar cuellos de botella | 2h |

---

## 4. DEPLOYMENT Y PUBLICACIÓN (11 tareas)

### 4.1 Preparación para Producción (3 tareas) - Prioridad: Alta
| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 7.1.1 | Revisar variables de entorno | - Listar todas las variables necesarias<br>- Verificar secrets en producción<br>- Documentar configuración | 1h |
| 7.1.2 | Configurar logging producción | - Nivel de log apropiado<br>- Rotación de logs<br>- Alertas de errores | 1h |
| 7.1.3 | Verificar manejo de errores | - Páginas de error amigables<br>- Mensajes de error en español<br>- Fallbacks para APIs | 2h |

### 4.2 Publicación en Replit (5 tareas) - Prioridad: Alta
| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 7.2.1 | Publicar Frontend | - Configurar autoscale<br>- Verificar build<br>- Probar URL pública | 30min |
| 7.2.2 | Publicar Backend Scrapping | - Configurar autoscale<br>- Verificar health check<br>- Probar endpoints | 30min |
| 7.2.3 | Publicar Backend Sniffing | - Configurar VM (para WebSocket)<br>- Verificar conexiones WS | 30min |
| 7.2.4 | Verificar URLs producción | - Probar cada servicio<br>- Verificar CORS<br>- Probar flujo completo | 1h |
| 7.2.5 | Actualizar URLs en frontend | - Cambiar a URLs de producción<br>- Variables de entorno<br>- Rebuild y redeploy | 30min |

### 4.3 Documentación (3 tareas) - Prioridad: Baja
| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 7.3.1 | Actualizar README | - Descripción del proyecto<br>- Instrucciones de instalación<br>- Credenciales demo | 1h |
| 7.3.3 | Guía de usuario | - Cómo usar el dashboard<br>- Explicación de módulos<br>- FAQ | 2h |
| 7.3.4 | Guía de administración | - Gestión de usuarios<br>- Configuración del sistema<br>- Mantenimiento | 2h |

---

## 5. DATOS POLÍTICOS (1 tarea)

| ID | Tarea | Subtareas | Estimado |
|----|-------|-----------|----------|
| 8.2.2 | Validar datos de partidos | - Verificar 9 partidos cargados<br>- Revisar logos y colores<br>- Verificar en frontend | 1h |

---

## Planificación Sugerida

### Semana 1 - Integración Frontend (Prioridad Alta)
| Día | Tareas | Horas |
|-----|--------|-------|
| Lunes | 4.2.2, 4.2.3 - Integrar noticias y redes sociales | 4h |
| Martes | 4.2.4, 4.2.5 - Integrar gobierno y sentimiento | 4h |
| Miércoles | 4.3.2, 4.3.3 - Conectar tiempo real | 4h |
| Jueves | 4.3.4, 4.3.5 - Alertas y hashtags | 3h |
| Viernes | 4.4.1-4.4.4 - Verificar módulos principales | 5h |

### Semana 2 - Autenticación y Testing
| Día | Tareas | Horas |
|-----|--------|-------|
| Lunes | 4.5.4 - Registro de usuarios | 3h |
| Martes | 4.5.5 - Recuperación de contraseña | 3h |
| Miércoles | 4.5.6 - Manejo de sesiones/tokens | 3h |
| Jueves | 6.1.1, 6.1.2 - Tests E2E principales | 4h |
| Viernes | 4.4.5-10 - Verificar módulos restantes | 4h |

### Semana 3 - Deployment y Producción
| Día | Tareas | Horas |
|-----|--------|-------|
| Lunes | 7.1.1-7.1.3 - Preparar producción | 4h |
| Martes | 4.6.2, 4.6.3 - Build de producción | 2h |
| Miércoles | 7.2.1-7.2.3 - Publicar servicios | 2h |
| Jueves | 7.2.4, 7.2.5 - Verificar y actualizar URLs | 2h |
| Viernes | 6.1.4, 6.1.5, 8.2.2 - Tests finales | 4h |

### Semana 4 - Scrapers y Optimización (Opcional)
| Día | Tareas | Horas |
|-----|--------|-------|
| Lunes | 2.4.1, 2.4.2 - Scrapers El Comercio, RPP | 4h |
| Martes | 2.4.3, 2.4.4 - Scrapers Gestión, ONPE | 5h |
| Miércoles | 2.4.5 - Scraper INEI | 3h |
| Jueves | 6.2.1, 6.2.2 - Optimización BD y cache | 6h |
| Viernes | 6.2.3, 6.2.4 - Optimización frontend y WS | 4h |

---

## Estimación Total

| Categoría | Horas Estimadas |
|-----------|-----------------|
| Backend Scrapping | 18h |
| Frontend React | 35h |
| Testing | 17h |
| Deployment | 13h |
| Datos Políticos | 1h |
| **TOTAL** | **84 horas** |

**Tiempo estimado:** 3-4 semanas de trabajo (4-5 horas/día)

---

## Notas Importantes

1. **Prioridad Alta**: Integración frontend + Deployment (necesario para MVP funcional)
2. **Prioridad Media**: Testing + Autenticación avanzada (mejora la experiencia)
3. **Prioridad Baja**: Scrapers de noticias + Optimización (pueden hacerse después)

4. **Dependencias**:
   - Antes de publicar → Completar integración frontend
   - Antes de testing E2E → Tener datos reales en frontend
   - TikTok → Esperar aprobación de API
