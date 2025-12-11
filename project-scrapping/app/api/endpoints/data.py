from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models import NewsArticle, RawSocialPost, GovernmentData, ScrapedSurvey
from app.schemas import (
    NewsArticleResponse, SocialPostResponse, 
    GovernmentDataResponse, SurveyResponse, StatsResponse
)

router = APIRouter()

@router.get("/news", response_model=List[NewsArticleResponse])
async def get_news_articles(
    source: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get news articles with optional filtering"""
    query = db.query(NewsArticle)
    
    if source:
        query = query.filter(NewsArticle.source == source)
    if category:
        query = query.filter(NewsArticle.category == category)
    
    articles = query.order_by(NewsArticle.published_at.desc()).offset(offset).limit(limit).all()
    return articles

@router.get("/social", response_model=List[SocialPostResponse])
async def get_social_posts(
    platform: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get social media posts with optional filtering"""
    query = db.query(RawSocialPost)
    
    if platform:
        query = query.filter(RawSocialPost.platform == platform)
    if location:
        query = query.filter(RawSocialPost.geographic_location == location)
    
    posts = query.order_by(RawSocialPost.created_at.desc()).offset(offset).limit(limit).all()
    return posts

@router.get("/government", response_model=List[GovernmentDataResponse])
async def get_government_data(
    source: Optional[str] = None,
    data_type: Optional[str] = None,
    department: Optional[str] = None,
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get government data with optional filtering"""
    query = db.query(GovernmentData)
    
    if source:
        query = query.filter(GovernmentData.source == source)
    if data_type:
        query = query.filter(GovernmentData.data_type == data_type)
    if department:
        query = query.filter(GovernmentData.department == department)
    
    data = query.order_by(GovernmentData.published_at.desc()).offset(offset).limit(limit).all()
    return data

@router.get("/surveys", response_model=List[SurveyResponse])
async def get_surveys(
    source: Optional[str] = None,
    pollster: Optional[str] = None,
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get survey data with optional filtering"""
    query = db.query(ScrapedSurvey)
    
    if source:
        query = query.filter(ScrapedSurvey.source == source)
    if pollster:
        query = query.filter(ScrapedSurvey.pollster == pollster)
    
    surveys = query.order_by(ScrapedSurvey.published_at.desc()).offset(offset).limit(limit).all()
    return surveys

@router.get("/stats", response_model=StatsResponse)
async def get_statistics(db: Session = Depends(get_db)):
    """Get overall statistics"""
    news_count = db.query(NewsArticle).count()
    social_count = db.query(RawSocialPost).count()
    government_count = db.query(GovernmentData).count()
    survey_count = db.query(ScrapedSurvey).count()
    
    # Get recent activity (last 24 hours)
    yesterday = datetime.now() - timedelta(days=1)
    recent_news = db.query(NewsArticle).filter(NewsArticle.scraped_at >= yesterday).count()
    recent_social = db.query(RawSocialPost).filter(RawSocialPost.scraped_at >= yesterday).count()
    recent_government = db.query(GovernmentData).filter(GovernmentData.scraped_at >= yesterday).count()
    
    return StatsResponse(
        total_news_articles=news_count,
        total_social_posts=social_count,
        total_government_data=government_count,
        total_surveys=survey_count,
        recent_news_24h=recent_news,
        recent_social_24h=recent_social,
        recent_government_24h=recent_government
    )