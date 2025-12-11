#!/usr/bin/env python3
"""
Script para inicializar la base de datos con las tablas necesarias
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.config import settings
from app.database import Base
from app.models import *  # Importar todos los modelos
import logging

def create_database_if_not_exists():
    """Crear la base de datos si no existe"""
    try:
        # Conectar sin especificar la base de datos
        base_url = settings.DATABASE_URL.rsplit('/', 1)[0]
        engine = create_engine(f"{base_url}/postgres")
        
        with engine.connect() as conn:
            # Verificar si la base de datos existe
            result = conn.execute(text(
                "SELECT 1 FROM pg_database WHERE datname = 'politiscope_db'"
            ))
            
            if not result.fetchone():
                # Crear la base de datos
                conn.execute(text("COMMIT"))  # Salir de la transacción actual
                conn.execute(text("CREATE DATABASE politiscope_db"))
                print("✅ Base de datos 'politiscope_db' creada exitosamente")
            else:
                print("ℹ️  Base de datos 'politiscope_db' ya existe")
                
    except Exception as e:
        print(f"❌ Error al crear la base de datos: {e}")
        return False
    
    return True

def create_tables():
    """Crear todas las tablas"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        # Crear extensiones necesarias
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""))
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"pg_trgm\""))
            conn.commit()
        
        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente")
        
        # Crear índices adicionales para mejor rendimiento
        with engine.connect() as conn:
            # Índices de texto completo
            conn.execute(text("""
                CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_content_fts 
                ON news_articles USING gin(to_tsvector('spanish', content))
            """))
            
            conn.execute(text("""
                CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_content_fts 
                ON raw_social_posts USING gin(to_tsvector('spanish', content))
            """))
            
            # Índices para búsqueda geográfica
            conn.execute(text("""
                CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_geo_trgm 
                ON raw_social_posts USING gin(geographic_location gin_trgm_ops)
            """))
            
            # Índices JSON
            conn.execute(text("""
                CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_political_entities 
                ON news_articles USING gin(political_entities)
            """))
            
            conn.execute(text("""
                CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_engagement 
                ON raw_social_posts USING gin(engagement_metrics)
            """))
            
            conn.commit()
            print("✅ Índices adicionales creados exitosamente")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al crear las tablas: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Inicializando base de datos para Political Data Scraper")
    print("=" * 60)
    
    print(f"📊 Conectando a: {settings.DATABASE_URL}")
    
    # Paso 1: Crear base de datos si no existe
    if not create_database_if_not_exists():
        sys.exit(1)
    
    # Paso 2: Crear tablas
    if not create_tables():
        sys.exit(1)
    
    print("\n🎉 ¡Inicialización completada exitosamente!")
    print("\nPróximos pasos:")
    print("1. Configurar las claves API en el archivo .env")
    print("2. Ejecutar: docker-compose up -d")
    print("3. Verificar estado: docker-compose exec app python cli.py monitor status")

if __name__ == "__main__":
    main()