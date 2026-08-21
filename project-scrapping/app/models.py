from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean, Float, Index, Date, ForeignKey, Numeric
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
    extra_metadata = Column('metadata', JSON, nullable=True)
    processed = Column(Boolean, default=False)
    sentiment_score = Column(Float, nullable=True)
    geographic_location = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    
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
    extra_metadata = Column('metadata', JSON, nullable=True)
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

class SearchTag(Base):
    __tablename__ = "search_tags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tag = Column(String(200), nullable=False, unique=True)
    platforms = Column(JSON, nullable=False, default=lambda: ["twitter", "youtube", "instagram"])
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_used_at = Column(DateTime, nullable=True)
    results_count = Column(Integer, default=0)

    __table_args__ = (
        Index('idx_search_tag_active', 'is_active'),
    )


class PoliticalFigure(Base):
    __tablename__ = "political_figures"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(300), nullable=False)
    display_name = Column(String(200), nullable=False)
    nickname = Column(String(200), nullable=True)
    photo_url = Column(String(1000), nullable=True)
    party_name = Column(String(200), nullable=True)
    current_position = Column(String(300), nullable=True)
    region = Column(String(100), nullable=True)
    search_keywords = Column(JSON, nullable=False, default=list)
    social_accounts = Column(JSON, nullable=False, default=list)
    is_active = Column(Boolean, default=True)
    monitoring_priority = Column(String(20), default='medium')
    notes = Column(Text, nullable=True)
    figure_role = Column(String(30), default='candidate')
    is_own_candidate = Column(Boolean, default=False)
    list_name = Column(String(200), nullable=True)
    color = Column(String(20), nullable=True)
    zone_strength = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_political_figure_active', 'is_active'),
        Index('idx_political_figure_party', 'party_name'),
    )


class AIRecommendationRecord(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    figure_id = Column(String, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    priority = Column(String(20), nullable=False)
    status = Column(String(30), default='generated')
    target_region = Column(String(100), nullable=True)
    target_demographic = Column(String(100), nullable=True)
    identified_weakness = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    estimated_budget = Column(JSON, nullable=True)
    expected_timeline = Column(String(100), nullable=True)
    projected_roi = Column(Float, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    resources_needed = Column(JSON, nullable=True)
    success_kpis = Column(JSON, nullable=True)
    risk_factors = Column(JSON, nullable=True)
    user_rating = Column(Integer, nullable=True)
    implementation_progress = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_recommendation_figure', 'figure_id'),
        Index('idx_recommendation_status', 'status'),
        Index('idx_recommendation_category', 'category'),
    )


class SocialApiToken(Base):
    __tablename__ = "social_api_tokens"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    platform = Column(String(50), nullable=False)
    label = Column(String(200), nullable=False)
    credentials = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    status = Column(String(20), default='active')
    last_used_at = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_token_platform_active', 'platform', 'is_active'),
        Index('idx_token_status', 'status'),
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
    extra_metadata = Column('metadata', JSON, nullable=True)
    
    __table_args__ = (
        Index('idx_source_type', 'source', 'scraping_type'),
        Index('idx_started_at', 'started_at'),
        Index('idx_status', 'status'),
    )

# --- ORGANIZATION Models ---

class Campaign(Base):
    __tablename__ = "campaigns"
    __table_args__ = {'schema': 'organization'}
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=False)
    party_id = Column(String, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    election = Column(String, nullable=False) # Enum in DB
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String(20), default='active')
    region_code = Column(String(10), nullable=True)
    
    objective = Column(String(50), nullable=True)
    target_demographics = Column(JSON, nullable=True)
    budget_details = Column(JSON, nullable=True)
    performance_metrics = Column(JSON, nullable=True)
    crisis_protocol = Column(JSON, nullable=True)
    budget = Column(Numeric(14,2), default=0)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class CampaignTeamMember(Base):
    __tablename__ = "campaign_team_members"
    __table_args__ = {'schema': 'organization'}
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=False)
    campaign_id = Column(String, ForeignKey("organization.campaigns.id"), nullable=False)
    user_id = Column(String, nullable=True)
    name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False)
    permissions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=func.now())

class CampaignAsset(Base):
    __tablename__ = "campaign_assets"
    __table_args__ = {'schema': 'organization'}
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=False)
    campaign_id = Column(String, ForeignKey("organization.campaigns.id"), nullable=False)
    name = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)
    url = Column(String(1000), nullable=False)
    size_bytes = Column(Integer, nullable=True)
    tags = Column(JSON, nullable=True)
    approval_status = Column(String(20), default='pending')
    uploaded_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())

class ABTest(Base):
    __tablename__ = "ab_tests"
    __table_args__ = {'schema': 'organization'}
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=False)
    campaign_id = Column(String, ForeignKey("organization.campaigns.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default='draft')
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    target_regions = Column(JSON, nullable=True)
    results_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=func.now())

class ABTestVariant(Base):
    __tablename__ = "ab_test_variants"
    __table_args__ = {'schema': 'organization'}
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    test_id = Column(String, ForeignKey("organization.ab_tests.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    creative_url = Column(String(1000), nullable=True)
    message_copy = Column(Text, nullable=True)
    traffic_allocation = Column(Integer, default=50)
    metrics = Column(JSON, nullable=True)

class CompetitorCampaign(Base):
    __tablename__ = "competitor_campaigns"
    __table_args__ = {'schema': 'organization'}
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, nullable=False)
    competitor_name = Column(String(200), nullable=False)
    campaign_name = Column(String(200), nullable=False)
    detected_at = Column(DateTime, default=func.now())
    regions = Column(JSON, nullable=True)
    estimated_budget = Column(Numeric(14,2), nullable=True)
    sentiment_score = Column(Numeric(4,3), nullable=True)
    key_messages = Column(JSON, nullable=True)
    platforms = Column(JSON, nullable=True)
