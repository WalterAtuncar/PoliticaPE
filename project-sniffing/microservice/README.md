# Microservicio de Análisis de Datos Políticos

## Descripción
Microservicio de alto rendimiento para análisis de datos políticos en tiempo real usando FastAPI, WebSockets, y análisis de sentimiento con NLP. Los datos se guardan automáticamente en la tabla `realtime_data.live_streams` de tu base de datos PostgreSQL.

## Configuración de Base de Datos

### Conexión a PostgreSQL
El microservicio está configurado para conectarse a tu base de datos PostgreSQL:

```
Host: localhost
Puerto: 5432
Base de datos: politiscope_db
Usuario: postgres
Contraseña: 123456
```

### Tabla de Destino
Los datos se guardan en la tabla `realtime_data.live_streams` con la estructura exacta que especificaste:

- ✅ **Identificación del stream**: `stream_id`, `platform`, `stream_type`
- ✅ **Contenido**: `content`, `content_type`, `author_handle`, `author_name`
- ✅ **Engagement**: `immediate_likes`, `immediate_shares`, `immediate_comments`
- ✅ **Análisis en tiempo real**: `realtime_sentiment`, `sentiment_confidence`, `political_relevance_score`, `urgency_score`
- ✅ **Detección de eventos**: `is_trending`, `is_crisis_indicator`, `is_opportunity`
- ✅ **Geográfico**: `detected_region`, `location_confidence`, `latitude`, `longitude`
- ✅ **Keywords y entidades**: `detected_keywords`, `political_entities`, `hashtags`
- ✅ **Metadata técnica**: `raw_message`, `processing_latency_ms`
- ✅ **Timestamps**: `message_timestamp`, `received_at`, `processed_at`, `expires_at`

## Variables de Entorno

Crea un archivo `.env` en el directorio `microservice/` con la siguiente configuración:

```env
# Base de datos (YA CONFIGURADA)
POSTGRES_URL=postgresql://postgres:123456@localhost:5432/politiscope_db

# APIs externas (opcional para desarrollo)
TWITTER_BEARER_TOKEN=tu_token_aqui
TWITTER_API_KEY=tu_api_key_aqui
TWITTER_API_SECRET=tu_api_secret_aqui

# Configuración de procesamiento
BATCH_SIZE=100
PROCESSING_INTERVAL=5
MAX_RETRIES=3
LOG_LEVEL=INFO
PORT=8000
```

## Instalación y Ejecución

### Opción 1: Ejecución Local
```bash
cd microservice
pip install -r requirements.txt
python main.py
```

### Opción 2: Docker Compose
```bash
cd microservice
docker-compose up -d
```

## Endpoints Disponibles

- `GET /health` - Verificación de salud del servicio y BD
- `GET /api/stats` - Estadísticas en tiempo real desde la BD
- `GET /api/recent-data` - Datos recientes de la tabla live_streams
- `POST /api/test-alert` - Enviar alerta de prueba (se guarda en BD)
- `WebSocket /ws` - Conexión en tiempo real
- `GET /metrics` - Métricas de Prometheus

## Características Implementadas

### ✅ Análisis Completo de Datos
- **Análisis de Sentimiento**: Puntuación de -1.000 a 1.000
- **Relevancia Política**: Puntuación de 0.000 a 1.000 basada en términos políticos
- **Urgencia**: Detección de contenido urgente o de crisis
- **Detección de Entidades**: Políticos, instituciones, lugares
- **Extracción de Keywords**: Términos políticos relevantes
- **Detección de Hashtags**: Hashtags del contenido
- **Detección Geográfica**: Regiones mencionadas en el texto

### ✅ Detección de Eventos
- **Trending**: Contenido que puede volverse viral
- **Crisis**: Indicadores de crisis política o social  
- **Oportunidades**: Contenido con potencial político positivo

### ✅ Almacenamiento en Base de Datos
- **Inserción Automática**: Todos los datos se guardan en `realtime_data.live_streams`
- **Validación de Datos**: Checks de integridad según tu esquema
- **Índices Optimizados**: Para consultas rápidas por timestamp, plataforma, sentimiento
- **TTL Automático**: Los registros expiran automáticamente después de 7 días

### ✅ Monitoreo y Métricas
- **Métricas en Tiempo Real**: Conteo de procesados, sentimiento promedio, alertas
- **WebSocket Broadcasting**: Actualizaciones en vivo al dashboard
- **Logging Estructurado**: Logs detallados de todas las operaciones
- **Circuit Breaker**: Patrón de resiliencia para fallos de BD

## Flujo de Datos

1. **Captura**: El sistema simula tweets políticos cada 5 segundos
2. **Análisis**: Cada mensaje pasa por el pipeline de NLP completo
3. **Almacenamiento**: Los datos se insertan en `realtime_data.live_streams`
4. **Broadcasting**: Se envían actualizaciones en tiempo real vía WebSocket
5. **Dashboard**: El frontend recibe y muestra los datos procesados

## Datos de Ejemplo

El sistema procesa contenido como:
- Debates del Congreso
- Declaraciones presidenciales  
- Protestas y manifestaciones
- Análisis económicos
- Elecciones regionales

Cada mensaje se analiza para:
- Sentimiento político
- Relevancia para la política peruana
- Nivel de urgencia
- Entidades políticas mencionadas
- Potencial de crisis o oportunidad

## Desarrollo

Para desarrollo local:
1. Asegúrate de que PostgreSQL esté ejecutándose
2. La tabla `realtime_data.live_streams` se crea automáticamente
3. Ejecuta `python main.py`
4. El servicio estará disponible en `http://localhost:8000`
5. Los datos se guardarán automáticamente en tu base de datos

## Verificación

Puedes verificar que los datos se están guardando ejecutando:

```sql
SELECT COUNT(*) FROM realtime_data.live_streams;
SELECT * FROM realtime_data.live_streams ORDER BY message_timestamp DESC LIMIT 5;
```

¡El microservicio está completamente configurado para trabajar con tu tabla específica!