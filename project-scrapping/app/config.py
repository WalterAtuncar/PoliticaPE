from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Political Data Scraper"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database - Use Replit's DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://localhost:5432/politiscope_db")
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # API Keys
    TWITTER_BEARER_TOKEN: Optional[str] = None
    FACEBOOK_ACCESS_TOKEN: Optional[str] = None
    INSTAGRAM_ACCESS_TOKEN: Optional[str] = None
    YOUTUBE_API_KEY: Optional[str] = None
    
    # Scraping Configuration
    SCRAPING_DELAY: float = 1.0
    CONCURRENT_REQUESTS: int = 8
    USER_AGENT: str = "PoliticalDataBot/1.0"
    REQUEST_TIMEOUT: int = 30
    
    # Rate Limiting
    RATE_LIMIT_CALLS: int = 100
    RATE_LIMIT_PERIOD: int = 60
    
    # Proxies
    PROXY_LIST: List[str] = []
    ROTATE_PROXIES: bool = False
    
    # Celery Configuration
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # Scheduling
    NEWS_SCRAPING_INTERVAL: int = 900  # 15 minutes
    SOCIAL_SCRAPING_INTERVAL: int = 300  # 5 minutes
    GOVERNMENT_SCRAPING_INTERVAL: int = 3600  # 1 hour
    
    # Sentiment Analysis
    SENTIMENT_MODEL: str = "bert-base-multilingual-uncased-sentiment"
    BATCH_SIZE: int = 32
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/scraper.log"
    
    # Monitoring
    METRICS_PORT: int = 8001
    PROMETHEUS_ENABLED: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()