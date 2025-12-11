# Microservicio de Scraping de Datos Políticos

Un microservicio integral basado en Python para el scraping, procesamiento y análisis de datos políticos de sitios web de noticias, plataformas de redes sociales y fuentes gubernamentales en Perú.

## 🚀 Características

### Fuentes de Datos
- **Sitios Web de Noticias**: El Comercio, RPP, Gestión
- **Redes Sociales**: Twitter, Facebook, Instagram, YouTube
- **Sitios Gubernamentales**: ONPE, INEI, MEF

### Capacidades Principales
- **Web Scraping**: Scrapers modulares usando Scrapy y Beautiful Soup
- **Integración de APIs**: APIs oficiales para plataformas de redes sociales
- **Análisis de Sentimientos**: Análisis de sentimientos multilingüe basado en BERT
- **Detección Geográfica**: Reconocimiento de códigos ubigeo de Perú
- **Procesamiento de Datos**: Limpieza automatizada y eliminación de duplicados
- **Análisis en Tiempo Real**: Análisis de tendencias y métricas de engagement

### Stack Tecnológico
- **Framework**: FastAPI con soporte asíncrono
- **Base de Datos**: PostgreSQL con SQLAlchemy ORM
- **Cola de Tareas**: Celery con broker Redis
- **Monitoreo**: Métricas de Prometheus y health checks
- **Containerización**: Docker con builds multi-etapa

## 📋 Prerrequisitos

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recomendado)

## 🛠️ Instalación

### Usando Docker (Recomendado)

1. **Clonar y configurar**:
```bash
git clone <repositorio>
cd political-data-scraper
cp .env.example .env
```

2. **Configurar variables de entorno** en `.env`:
```bash
# Claves API requeridas para scraping de redes sociales
TWITTER_BEARER_TOKEN=tu_twitter_bearer_token
FACEBOOK_ACCESS_TOKEN=tu_facebook_access_token
INSTAGRAM_ACCESS_TOKEN=tu_instagram_access_token
YOUTUBE_API_KEY=tu_youtube_api_key
```

3. **Iniciar servicios**:
```bash
docker-compose up -d
```

4. **Inicializar base de datos**:
```bash
docker-compose exec app python cli.py db init
```

### Instalación Manual

1. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

2. **Configurar base de datos**:
```bash
createdb political_data
python cli.py db init
```

3. **Iniciar servicios**:
```bash
# Servidor API
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Worker de Celery
celery -A app.celery_app worker --loglevel=info

# Programador de Celery
celery -A app.celery_app beat --loglevel=info
```

## 🔧 Configuración

### Configuración de Claves API

#### Twitter API v2
1. Crear una cuenta de Twitter Developer
2. Crear una nueva app y generar Bearer Token
3. Agregar a `.env`: `TWITTER_BEARER_TOKEN=tu_token`

#### Facebook Graph API
1. Crear cuenta de Facebook Developer
2. Crear app y obtener Access Token
3. Agregar a `.env`: `FACEBOOK_ACCESS_TOKEN=tu_token`

#### Instagram Basic Display API
1. Crear app de Instagram en Facebook Developers
2. Obtener Access Token para Basic Display API
3. Agregar a `.env`: `INSTAGRAM_ACCESS_TOKEN=tu_token`

#### YouTube Data API v3
1. Crear proyecto en Google Cloud
2. Habilitar YouTube Data API v3
3. Crear clave API
4. Agregar a `.env`: `YOUTUBE_API_KEY=tu_clave`

## 📊 Uso

### Interfaz Web
- **Documentación API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Métricas**: http://localhost:8000/metrics
- **Estadísticas**: http://localhost:8000/api/v1/stats

### Gestión CLI

```bash
# Operaciones de base de datos
python cli.py db init          # Inicializar base de datos
python cli.py db stats         # Mostrar estadísticas

# Scraping manual
python cli.py scrape news --source elcomercio
python cli.py scrape social --platform twitter
python cli.py scrape government --source onpe

# Procesamiento de datos
python cli.py process unprocessed    # Procesar datos no procesados
python cli.py process deduplicate    # Eliminar duplicados

# Monitoreo
python cli.py monitor status    # Estado del sistema
python cli.py monitor logs      # Logs recientes
```

### Endpoints de API

#### Recuperación de Datos
```bash
# Obtener artículos de noticias
GET /api/v1/data/news?source=elcomercio&limit=100

# Obtener posts de redes sociales
GET /api/v1/data/social?platform=twitter&limit=100

# Obtener datos gubernamentales
GET /api/v1/data/government?source=onpe&limit=100

# Obtener encuestas
GET /api/v1/data/surveys?pollster=ipsos&limit=100
```

#### Análisis
```bash
# Análisis de sentimientos
GET /api/v1/analysis/sentiment?source_type=news&days=7

# Análisis de tendencias
GET /api/v1/analysis/trends?keywords=gobierno,congreso&days=30

# Distribución geográfica
GET /api/v1/analysis/geographic?days=7

# Métricas de engagement
GET /api/v1/analysis/engagement?platform=twitter&days=7
```

#### Scraping Manual
```bash
# Activar scraping de noticias
POST /api/v1/scraping/trigger/news
{
  "sources": ["elcomercio", "rpp"]
}

# Activar scraping de redes sociales
POST /api/v1/scraping/trigger/social
{
  "sources": ["twitter", "facebook"]
}
```

## 🔄 Programación Automatizada

El sistema automáticamente hace scraping de datos según el siguiente cronograma:
- **Redes Sociales**: Cada 5 minutos
- **Fuentes de Noticias**: Cada 15 minutos  
- **Datos Gubernamentales**: Cada hora
- **Procesamiento de Datos**: Cada 10 minutos
- **Limpieza de Logs**: Diariamente a las 2 AM

## 📈 Monitoreo

### Métricas de Prometheus
- Métricas de peticiones HTTP
- Contadores de tareas de scraping
- Estado de conexión a base de datos
- Medidores de conexiones activas

### Health Checks
- Conectividad de base de datos
- Conectividad de Redis
- Validación de claves API
- Estado del servicio de scraping

### Logging
- Logging estructurado con Loguru
- Archivos de log rotativos
- Seguimiento de errores y alertas
- Monitoreo de rendimiento

## 🛡️ Seguridad y Cumplimiento

### Cumplimiento de Robots.txt
- Verificación automática de robots.txt
- Delays respetuosos en scraping
- Implementación de rate limiting

### Privacidad de Datos
- No recolección de datos personales
- Solo contenido público
- Manejo de datos compatible con GDPR

### Manejo de Errores
- Retry con backoff exponencial
- Patrones de circuit breaker
- Degradación elegante

## 🔧 Desarrollo

### Estructura del Proyecto
```
app/
├── api/                 # Rutas de FastAPI
├── models.py           # Modelos de base de datos
├── schemas.py          # Esquemas de Pydantic
├── services/           # Lógica de negocio
├── scrapers/           # Web scrapers
├── tasks/              # Tareas de Celery
└── utils/              # Utilidades

cli.py                  # CLI de gestión
docker-compose.yml      # Servicios de Docker
requirements.txt        # Dependencias
```

### Agregar Nuevos Scrapers
1. Crear clase scraper heredando de `BaseScraper`
2. Implementar métodos `scrape()` y `_parse_content()`
3. Agregar al módulo de scraper apropiado
4. Registrar en definiciones de tareas

### Migraciones de Base de Datos
```bash
# Crear migración
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head
```

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para detalles.

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/caracteristica-increible`)
3. Commit de cambios (`git commit -m 'Agregar característica increíble'`)
4. Push a la rama (`git push origin feature/caracteristica-increible`)
5. Abrir Pull Request

## 📞 Soporte

Para soporte y preguntas:
- Crear un issue en el repositorio
- Revisar la documentación en `/docs`
- Revisar logs con `python cli.py monitor logs`

---

**Nota**: Este microservicio está diseñado para propósitos educativos y de investigación. Asegúrate de cumplir con todas las leyes aplicables y términos de servicio al hacer scraping de datos.