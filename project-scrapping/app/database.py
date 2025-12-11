from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from app.config import settings
import logging

# Database engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

# Metadata for migrations
metadata = MetaData()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logging.error(f"Database error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    """Initialize database"""
    Base.metadata.create_all(bind=engine)
    logging.info("Database initialized successfully")

def close_db():
    """Close database connections"""
    engine.dispose()
    logging.info("Database connections closed")