from celery import current_task
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
import logging

from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import NewsArticle, RawSocialPost, GovernmentData, ScrapingLog
from app.services.sentiment_analyzer import SentimentAnalyzer
from app.services.geographic_detector import GeographicDetector
from app.services.data_cleaner import DataCleaner

@celery_app.task(bind=True)
def process_unprocessed_data(self):
    """Process all unprocessed data"""
    db = SessionLocal()
    
    try:
        # Initialize services
        sentiment_analyzer = SentimentAnalyzer()
        geo_detector = GeographicDetector()
        data_cleaner = DataCleaner()
        
        processed_count = 0
        
        # Process unprocessed news articles
        news_articles = db.query(NewsArticle).filter(NewsArticle.processed == False).limit(100).all()
        for article in news_articles:
            try:
                # Clean content
                if article.content:
                    article.content = data_cleaner.clean_text(article.content)
                
                # Analyze sentiment
                if article.content:
                    article.sentiment_score = sentiment_analyzer.analyze_text(article.content)
                
                # Extract political entities
                if article.content:
                    article.political_entities = data_cleaner.extract_political_entities(article.content)
                
                article.processed = True
                processed_count += 1
                
            except Exception as e:
                logging.error(f"Error processing article {article.id}: {e}")
        
        # Process unprocessed social posts
        social_posts = db.query(RawSocialPost).filter(RawSocialPost.processed == False).limit(100).all()
        for post in social_posts:
            try:
                # Clean content
                if post.content:
                    post.content = data_cleaner.clean_text(post.content)
                
                # Analyze sentiment
                if post.content:
                    post.sentiment_score = sentiment_analyzer.analyze_text(post.content)
                
                # Detect geographic location
                if post.content:
                    post.geographic_location = geo_detector.detect_location(post.content)
                
                post.processed = True
                processed_count += 1
                
            except Exception as e:
                logging.error(f"Error processing post {post.id}: {e}")
        
        # Process unprocessed government data
        gov_data = db.query(GovernmentData).filter(GovernmentData.processed == False).limit(50).all()
        for data in gov_data:
            try:
                # Clean and structure content
                if data.content:
                    data.content = data_cleaner.clean_government_data(data.content)
                
                data.processed = True
                processed_count += 1
                
            except Exception as e:
                logging.error(f"Error processing government data {data.id}: {e}")
        
        db.commit()
        logging.info(f"Processed {processed_count} items")
        return {"processed_count": processed_count}
        
    except Exception as exc:
        db.rollback()
        logging.error(f"Error in processing task: {exc}")
        raise
    finally:
        db.close()

@celery_app.task
def cleanup_old_logs():
    """Clean up old scraping logs (older than 30 days)"""
    db = SessionLocal()
    
    try:
        cutoff_date = datetime.now() - timedelta(days=30)
        deleted_count = db.query(ScrapingLog).filter(
            ScrapingLog.started_at < cutoff_date
        ).delete()
        
        db.commit()
        logging.info(f"Cleaned up {deleted_count} old scraping logs")
        return {"deleted_count": deleted_count}
        
    except Exception as exc:
        db.rollback()
        logging.error(f"Error cleaning up logs: {exc}")
        raise
    finally:
        db.close()

@celery_app.task(bind=True)
def deduplicate_data(self):
    """Remove duplicate entries from database"""
    db = SessionLocal()
    
    try:
        # Deduplicate news articles by URL
        news_duplicates = db.execute("""
            DELETE FROM news_articles a USING news_articles b 
            WHERE a.id < b.id AND a.url = b.url
        """).rowcount
        
        # Deduplicate social posts by platform and post_id
        social_duplicates = db.execute("""
            DELETE FROM raw_social_posts a USING raw_social_posts b 
            WHERE a.id < b.id AND a.platform = b.platform AND a.post_id = b.post_id
        """).rowcount
        
        # Deduplicate government data by URL
        gov_duplicates = db.execute("""
            DELETE FROM government_data a USING government_data b 
            WHERE a.id < b.id AND a.url = b.url
        """).rowcount
        
        db.commit()
        
        total_removed = news_duplicates + social_duplicates + gov_duplicates
        logging.info(f"Removed {total_removed} duplicate entries")
        
        return {
            "news_duplicates_removed": news_duplicates,
            "social_duplicates_removed": social_duplicates,
            "government_duplicates_removed": gov_duplicates,
            "total_removed": total_removed
        }
        
    except Exception as exc:
        db.rollback()
        logging.error(f"Error in deduplication task: {exc}")
        raise
    finally:
        db.close()