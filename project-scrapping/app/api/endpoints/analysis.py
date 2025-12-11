from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.database import get_db
from app.models import NewsArticle, RawSocialPost
from app.schemas import SentimentAnalysisResponse, TrendAnalysisResponse
from app.services.analysis import AnalysisService

router = APIRouter()

@router.get("/sentiment", response_model=SentimentAnalysisResponse)
async def get_sentiment_analysis(
    source_type: str = Query(..., description="news, social, or government"),
    source: str = Query(None, description="Specific source to analyze"),
    days: int = Query(7, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get sentiment analysis for specified data source"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    analysis_service = AnalysisService(db)
    
    if source_type == "news":
        result = analysis_service.analyze_news_sentiment(start_date, end_date, source)
    elif source_type == "social":
        result = analysis_service.analyze_social_sentiment(start_date, end_date, source)
    else:
        raise HTTPException(status_code=400, detail="Invalid source_type")
    
    return result

@router.get("/trends", response_model=TrendAnalysisResponse)
async def get_trend_analysis(
    keywords: str = Query(..., description="Comma-separated keywords to analyze"),
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get trend analysis for specified keywords"""
    keyword_list = [k.strip() for k in keywords.split(",")]
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    analysis_service = AnalysisService(db)
    result = analysis_service.analyze_trends(keyword_list, start_date, end_date)
    
    return result

@router.get("/geographic")
async def get_geographic_analysis(
    days: int = Query(7, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get geographic distribution of social media posts"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    analysis_service = AnalysisService(db)
    result = analysis_service.analyze_geographic_distribution(start_date, end_date)
    
    return {"geographic_distribution": result}

@router.get("/engagement")
async def get_engagement_metrics(
    platform: str = Query(None, description="Social media platform"),
    days: int = Query(7, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get engagement metrics for social media posts"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    analysis_service = AnalysisService(db)
    result = analysis_service.analyze_engagement_metrics(start_date, end_date, platform)
    
    return result