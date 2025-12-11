from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class NewsArticleResponse(BaseModel):
    id: str
    source: str
    title: str
    content: Optional[str]
    author: Optional[str]
    published_at: Optional[datetime]
    scraped_at: datetime
    url: str
    category: Optional[str]
    tags: Optional[List[str]]
    sentiment_score: Optional[float]
    political_entities: Optional[Dict[str, Any]]
    
    class Config:
        from_attributes = True

class SocialPostResponse(BaseModel):
    id: str
    platform: str
    post_id: str
    author: Optional[str]
    content: Optional[str]
    created_at: Optional[datetime]
    scraped_at: datetime
    engagement_metrics: Optional[Dict[str, Any]]
    sentiment_score: Optional[float]
    geographic_location: Optional[str]
    
    class Config:
        from_attributes = True

class GovernmentDataResponse(BaseModel):
    id: str
    source: str
    data_type: str
    title: str
    content: Optional[Dict[str, Any]]
    published_at: Optional[datetime]
    scraped_at: datetime
    url: str
    department: Optional[str]
    
    class Config:
        from_attributes = True

class SurveyResponse(BaseModel):
    id: str
    source: str
    title: str
    methodology: Optional[str]
    sample_size: Optional[int]
    margin_error: Optional[float]
    field_dates: Optional[str]
    results: Dict[str, Any]
    published_at: Optional[datetime]
    scraped_at: datetime
    url: str
    pollster: Optional[str]
    
    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    total_news_articles: int
    total_social_posts: int
    total_government_data: int
    total_surveys: int
    recent_news_24h: int
    recent_social_24h: int
    recent_government_24h: int

class ScrapingLogResponse(BaseModel):
    id: str
    source: str
    scraping_type: str
    status: str
    items_scraped: int
    errors_count: int
    started_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
    
    class Config:
        from_attributes = True

class ScrapingTaskRequest(BaseModel):
    sources: Optional[List[str]] = None

class ScrapingTaskResponse(BaseModel):
    message: str
    task_ids: List[str]
    sources: List[str]

class SentimentAnalysisResponse(BaseModel):
    source_type: str
    source: Optional[str]
    period_days: int
    total_items: int
    sentiment_distribution: Dict[str, float]
    average_sentiment: float
    sentiment_trend: List[Dict[str, Any]]

class TrendAnalysisResponse(BaseModel):
    keywords: List[str]
    period_days: int
    keyword_trends: Dict[str, List[Dict[str, Any]]]
    correlation_matrix: Dict[str, Dict[str, float]]