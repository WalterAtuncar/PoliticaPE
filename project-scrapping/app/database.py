from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import logging

Base = declarative_base()
metadata = MetaData()

_engine = None
_session_factory = None


def _get_engine():
    global _engine
    if _engine is None:
        from app.config import settings
        _engine = create_engine(
            settings.DATABASE_URL,
            poolclass=QueuePool,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False
        )
    return _engine


def _get_session_factory():
    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
    return _session_factory


class _SessionLocalCallable:
    def __call__(self):
        return _get_session_factory()()


SessionLocal = _SessionLocalCallable()


def get_db():
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
    Base.metadata.create_all(bind=_get_engine())
    logging.info("Database initialized successfully")


def close_db():
    global _engine
    if _engine:
        _engine.dispose()
        logging.info("Database connections closed")
