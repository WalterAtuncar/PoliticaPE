from celery import current_task
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging
from typing import Dict, List

from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import NewsArticle, RawSocialPost
from app.services.analysis import AnalysisService

@celery_app.task(bind=True)
def generate_daily_sentiment_report(self):
    """Generate daily sentiment analysis report"""
    db = SessionLocal()
    
    try:
        analysis_service = AnalysisService(db)
        
        # Get data from last 24 hours
        end_date = datetime.now()
        start_date = end_date - timedelta(days=1)
        
        # Analyze news sentiment
        news_sentiment = analysis_service.analyze_news_sentiment(start_date, end_date)
        
        # Analyze social media sentiment
        social_sentiment = analysis_service.analyze_social_sentiment(start_date, end_date)
        
        # Generate report
        report = {
            "date": end_date.strftime("%Y-%m-%d"),
            "news_sentiment": news_sentiment,
            "social_sentiment": social_sentiment,
            "generated_at": datetime.now().isoformat()
        }
        
        logging.info(f"Generated daily sentiment report for {end_date.strftime('%Y-%m-%d')}")
        return report
        
    except Exception as exc:
        logging.error(f"Error generating sentiment report: {exc}")
        raise
    finally:
        db.close()

@celery_app.task(bind=True)
def analyze_trending_topics(self):
    """Analyze trending topics across all data sources"""
    db = SessionLocal()
    
    try:
        analysis_service = AnalysisService(db)
        
        # Get data from last 7 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # Extract trending topics
        trending_topics = analysis_service.extract_trending_topics(start_date, end_date)
        
        logging.info(f"Analyzed trending topics: {len(trending_topics)} topics found")
        return {"trending_topics": trending_topics, "period": "7_days"}
        
    except Exception as exc:
        logging.error(f"Error analyzing trending topics: {exc}")
        raise
    finally:
        db.close()

@celery_app.task(bind=True)
def calculate_engagement_metrics(self):
    """Calculate engagement metrics for social media posts"""
    db = SessionLocal()
    
    try:
        analysis_service = AnalysisService(db)
        
        # Get data from last 24 hours
        end_date = datetime.now()
        start_date = end_date - timedelta(days=1)
        
        # Calculate metrics by platform
        platforms = ["twitter", "facebook", "instagram", "youtube"]
        metrics = {}
        
        for platform in platforms:
            platform_metrics = analysis_service.analyze_engagement_metrics(
                start_date, end_date, platform
            )
            metrics[platform] = platform_metrics
        
        logging.info("Calculated engagement metrics for all platforms")
        return {"engagement_metrics": metrics, "period": "24_hours"}
        
    except Exception as exc:
        logging.error(f"Error calculating engagement metrics: {exc}")
        raise
    finally:
        db.close()