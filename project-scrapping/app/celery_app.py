from celery import Celery
from celery.schedules import crontab
from app.config import settings

# Initialize Celery
celery_app = Celery(
    "political_scraper",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=['app.tasks.scraping', 'app.tasks.processing', 'app.tasks.analysis']
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_reject_on_worker_lost=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        'app.tasks.scraping.*': {'queue': 'scraping'},
        'app.tasks.processing.*': {'queue': 'processing'},
        'app.tasks.analysis.*': {'queue': 'analysis'},
    }
)

# Periodic tasks schedule
celery_app.conf.beat_schedule = {
    'scrape-news-every-15-minutes': {
        'task': 'app.tasks.scraping.scrape_all_news',
        'schedule': crontab(minute='*/15'),
    },
    'scrape-social-every-5-minutes': {
        'task': 'app.tasks.scraping.scrape_all_social',
        'schedule': crontab(minute='*/5'),
    },
    'scrape-government-hourly': {
        'task': 'app.tasks.scraping.scrape_all_government',
        'schedule': crontab(minute=0),
    },
    'process-unprocessed-data': {
        'task': 'app.tasks.processing.process_unprocessed_data',
        'schedule': crontab(minute='*/10'),
    },
    'cleanup-old-logs': {
        'task': 'app.tasks.processing.cleanup_old_logs',
        'schedule': crontab(hour=2, minute=0),
    },
}

# Import tasks to register them
from app.tasks.scraping import *
from app.tasks.processing import *
from app.tasks.analysis import *