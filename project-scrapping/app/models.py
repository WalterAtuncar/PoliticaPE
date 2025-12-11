from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean, Float, Index
from sqlalchemy.sql import func
from app.database import Base
import uuid

class RawSocialPost(Base):
    __tablename__ = "raw_social_posts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    platform = Column(String(50), nullable=False)
    post_id = Column(String(255), nullable=False)
    author = Column(String(255), nullable=True)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=True)
    scraped_at = Column(DateTime, default=func.now())
    engagement_metrics = Column(JSON, nullable=True)
    metadata = Column(JSON, nullable=True)
    processed = Column(Boolean, default=False)
    sentiment_score = Column(Float, nullable=True)
    geographic_location = Column(String(100), nullable=True)
    
    __table_args__ = (
        Index('idx_platform_post_id', 'platform', 'post_id'),
        Index('idx_scraped_at', 'scraped_at'),
        Index('idx_processed', 'processed'),
        Index('idx_geographic_location', 'geographic_location'),
    )

class NewsArticle(Base):
    __tablename__ = "news_articles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String(100), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    author = Column(String(255), nullable=True)
    published_at = Column(DateTime, nullable=True)
    scraped_at = Column(DateTime, default=func.now())
    url = Column(String(1000), nullable=False)
    category = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    political_entities = Column(JSON, nullable=True)
    processed = Column(Boolean, default=False)
    
    __table_args__ = (
        Index('idx_source_published', 'source', 'published_at'),
        Index('idx_scraped_at', 'scraped_at'),
        Index('idx_processed', 'processed'),
        Index('idx_category', 'category'),
    )

class GovernmentData(Base):
    __tablename__ = "government_data"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String(100), nullable=False)
    data_type = Column(String(100), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(JSON, nullable=True)
    published_at = Column(DateTime, nullable=True)
    scraped_at = Column(DateTime, default=func.now())
    url = Column(String(1000), nullable=False)
    department = Column(String(200), nullable=True)
    metadata = Column(JSON, nullable=True)
    processed = Column(Boolean, default=False)
    
    __table_args__ = (
        Index('idx_source_type', 'source', 'data_type'),
        Index('idx_scraped_at', 'scraped_at'),
        Index('idx_processed', 'processed'),
        Index('idx_department', 'department'),
    )

class ScrapedSurvey(Base):
    __tablename__ = "scraped_surveys"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String(100), nullable=False)
    title = Column(String(500), nullable=False)
    methodology = Column(Text, nullable=True)
    sample_size = Column(Integer, nullable=True)
    margin_error = Column(Float, nullable=True)
    field_dates = Column(String(200), nullable=True)
    results = Column(JSON, nullable=False)
    published_at = Column(DateTime, nullable=True)
    scraped_at = Column(DateTime, default=func.now())
    url = Column(String(1000), nullable=False)
    pollster = Column(String(200), nullable=True)
    processed = Column(Boolean, default=False)
    
    __table_args__ = (
        Index('idx_source_published', 'source', 'published_at'),
        Index('idx_scraped_at', 'scraped_at'),
        Index('idx_processed', 'processed'),
        Index('idx_pollster', 'pollster'),
    )

class ScrapingLog(Base):
    __tablename__ = "scraping_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source = Column(String(100), nullable=False)
    scraping_type = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False)
    items_scraped = Column(Integer, default=0)
    errors_count = Column(Integer, default=0)
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    metadata = Column(JSON, nullable=True)
    
    __table_args__ = (
        Index('idx_source_type', 'source', 'scraping_type'),
        Index('idx_started_at', 'started_at'),
        Index('idx_status', 'status'),
    )