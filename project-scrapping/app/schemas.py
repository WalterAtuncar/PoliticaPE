from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date

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

# --- CAMPAIGN SCHEMAS ---

class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    election: str
    start_date: date
    end_date: Optional[date] = None
    status: str = "active"
    region_code: Optional[str] = None
    objective: Optional[str] = None
    target_demographics: Optional[Dict[str, Any]] = None
    budget_details: Optional[Dict[str, Any]] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    crisis_protocol: Optional[Dict[str, Any]] = None
    budget: float = 0.0

class CampaignCreate(CampaignBase):
    tenant_id: str
    party_id: str

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    end_date: Optional[date] = None
    budget_details: Optional[Dict[str, Any]] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    crisis_protocol: Optional[Dict[str, Any]] = None

class CampaignResponse(CampaignBase):
    id: str
    tenant_id: str
    party_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CampaignTeamMemberBase(BaseModel):
    name: str
    email: Optional[str] = None
    role: str
    permissions: Optional[Dict[str, Any]] = None

class CampaignTeamMemberCreate(CampaignTeamMemberBase):
    user_id: Optional[str] = None

class CampaignTeamMemberResponse(CampaignTeamMemberBase):
    id: str
    campaign_id: str
    user_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CampaignAssetBase(BaseModel):
    name: str
    type: str
    url: str
    size_bytes: Optional[int] = None
    tags: Optional[List[str]] = None

class CampaignAssetCreate(CampaignAssetBase):
    pass

class CampaignAssetResponse(CampaignAssetBase):
    id: str
    campaign_id: str
    approval_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ABTestBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "draft"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_regions: Optional[List[str]] = None

class ABTestCreate(ABTestBase):
    pass

class ABTestResponse(ABTestBase):
    id: str
    campaign_id: str
    results_summary: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CompetitorCampaignBase(BaseModel):
    competitor_name: str
    campaign_name: str
    regions: Optional[List[str]] = None
    estimated_budget: Optional[float] = None
    sentiment_score: Optional[float] = None
    key_messages: Optional[List[str]] = None
    platforms: Optional[List[str]] = None

class CompetitorCampaignCreate(CompetitorCampaignBase):
    tenant_id: str

class CompetitorCampaignResponse(CompetitorCampaignBase):
    id: str
    tenant_id: str
    detected_at: datetime
    
    class Config:
        from_attributes = True