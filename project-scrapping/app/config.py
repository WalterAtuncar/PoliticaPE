from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Political Data Scraper"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://localhost:5432/politiscope_db")
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # API Keys
    TWITTER_BEARER_TOKEN: Optional[str] = None
    FACEBOOK_ACCESS_TOKEN: Optional[str] = None
    INSTAGRAM_ACCESS_TOKEN: Optional[str] = None
    YOUTUBE_API_KEY: Optional[str] = None
    TWITTERAPI_IO_KEY: Optional[str] = None
    FACEBOOK_GRAPH_TOKEN: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    # Servicio de streaming
    SNIFFING_URL: str = os.getenv("SNIFFING_URL", "http://localhost:8080")
    
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
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        case_sensitive = True
        extra = "ignore"

# Global settings instance
settings = Settings()