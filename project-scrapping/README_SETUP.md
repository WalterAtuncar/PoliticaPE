# 🚀 Guía de Configuración Rápida

## Configuración de Base de Datos

Tu base de datos está configurada con:
- **Host**: localhost (PostgreSQL 17)
- **Base de datos**: `politiscope_db`
- **Usuario**: `postgres`
- **Contraseña**: `123456`

## 📋 Pasos de Instalación

### 1. Inicializar Base de Datos

```bash
# Ejecutar script de inicialización
python init_database.py
```

Este script:
- ✅ Verifica si la base de datos `politiscope_db` existe
- ✅ Crea la base de datos si no existe
- ✅ Crea todas las tablas necesarias
- ✅ Configura índices para mejor rendimiento
- ✅ Instala extensiones de PostgreSQL necesarias

### 2. Configurar Variables de Entorno

El archivo `.env` ya está configurado con tu base de datos. Solo necesitas agregar las claves API:

```bash
# Editar .env y agregar tus claves API
TWITTER_BEARER_TOKEN=tu_token_aqui
FACEBOOK_ACCESS_TOKEN=tu_token_aqui
INSTAGRAM_ACCESS_TOKEN=tu_token_aqui
YOUTUBE_API_KEY=tu_clave_aqui
```

### 3. Iniciar Servicios

```bash
# Iniciar con Docker (recomendado)
docker-compose up -d

# O manualmente
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 4. Verificar Instalación

```bash
# Verificar estado del sistema
docker-compose exec app python cli.py monitor status

# Ver estadísticas de base de datos
docker-compose exec app python cli.py db stats

# Probar scraping manual
docker-compose exec app python cli.py scrape news --source elcomercio
```

## 🔗 URLs de Acceso

- **API Principal**: http://localhost:8000
- **Documentación**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Métricas**: http://localhost:9090

## 🛠️ Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Ejecutar comandos dentro del contenedor
docker-compose exec app python cli.py --help

# Reiniciar servicios
docker-compose restart app celery

# Ver estado de contenedores
docker-compose ps
```

## 📊 Estructura de Base de Datos

Las siguientes tablas se crearán automáticamente:

- `news_articles` - Artículos de noticias
- `raw_social_posts` - Posts de redes sociales
- `government_data` - Datos gubernamentales
- `scraped_surveys` - Encuestas recopiladas
- `scraping_logs` - Logs de scraping

## 🔧 Solución de Problemas

### Error de Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté corriendo
pg_isready -h localhost -p 5432

# Verificar conexión desde Docker
docker-compose exec app python -c "from app.database import engine; print(engine.execute('SELECT 1').scalar())"
```

### Error de Permisos
```bash
# Asegurar que el usuario postgres tenga permisos
psql -h localhost -U postgres -d politiscope_db -c "SELECT current_user;"
```

¡Tu configuración está lista para usar! 🎉