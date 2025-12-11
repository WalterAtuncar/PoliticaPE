from celery import current_task
from sqlalchemy.orm import Session
from datetime import datetime
import logging
from typing import List

from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import ScrapingLog
from app.scrapers.news_scrapers import ElComercioScraper, RPPScraper, GestionScraper
from app.scrapers.social_scrapers import TwitterScraper, FacebookScraper, InstagramScraper, YouTubeScraper
from app.scrapers.government_scrapers import ONPEScraper, INEIScraper, MEFScraper
from app.utils.retry import with_exponential_backoff

@celery_app.task(bind=True, max_retries=3)
def scrape_news_task(self, source: str):
    """Scrape news from specified source"""
    db = SessionLocal()
    
    # Create scraping log
    log = ScrapingLog(
        source=source,
        scraping_type="news",
        status="running"
    )
    db.add(log)
    db.commit()
    
    try:
        # Select appropriate scraper
        scrapers = {
            "elcomercio": ElComercioScraper(),
            "rpp": RPPScraper(),
            "gestion": GestionScraper()
        }
        
        if source not in scrapers:
            raise ValueError(f"Unknown news source: {source}")
        
        scraper = scrapers[source]
        
        # Run scraping with exponential backoff
        items_scraped = with_exponential_backoff(scraper.scrape, db)
        
        # Update log
        log.status = "completed"
        log.items_scraped = items_scraped
        log.completed_at = datetime.now()
        db.commit()
        
        logging.info(f"Successfully scraped {items_scraped} items from {source}")
        return {"source": source, "items_scraped": items_scraped}
        
    except Exception as exc:
        log.status = "failed"
        log.error_message = str(exc)
        log.completed_at = datetime.now()
        db.commit()
        
        logging.error(f"Failed to scrape {source}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
        
    finally:
        db.close()

@celery_app.task(bind=True, max_retries=3)
def scrape_social_task(self, platform: str):
    """Scrape social media from specified platform"""
    db = SessionLocal()
    
    log = ScrapingLog(
        source=platform,
        scraping_type="social",
        status="running"
    )
    db.add(log)
    db.commit()
    
    try:
        scrapers = {
            "twitter": TwitterScraper(),
            "facebook": FacebookScraper(),
            "instagram": InstagramScraper(),
            "youtube": YouTubeScraper()
        }
        
        if platform not in scrapers:
            raise ValueError(f"Unknown social platform: {platform}")
        
        scraper = scrapers[platform]
        items_scraped = with_exponential_backoff(scraper.scrape, db)
        
        log.status = "completed"
        log.items_scraped = items_scraped
        log.completed_at = datetime.now()
        db.commit()
        
        logging.info(f"Successfully scraped {items_scraped} items from {platform}")
        return {"platform": platform, "items_scraped": items_scraped}
        
    except Exception as exc:
        log.status = "failed"
        log.error_message = str(exc)
        log.completed_at = datetime.now()
        db.commit()
        
        logging.error(f"Failed to scrape {platform}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
        
    finally:
        db.close()

@celery_app.task(bind=True, max_retries=3)
def scrape_government_task(self, source: str):
    """Scrape government data from specified source"""
    db = SessionLocal()
    
    log = ScrapingLog(
        source=source,
        scraping_type="government",
        status="running"
    )
    db.add(log)
    db.commit()
    
    try:
        scrapers = {
            "onpe": ONPEScraper(),
            "inei": INEIScraper(),
            "mef": MEFScraper()
        }
        
        if source not in scrapers:
            raise ValueError(f"Unknown government source: {source}")
        
        scraper = scrapers[source]
        items_scraped = with_exponential_backoff(scraper.scrape, db)
        
        log.status = "completed"
        log.items_scraped = items_scraped
        log.completed_at = datetime.now()
        db.commit()
        
        logging.info(f"Successfully scraped {items_scraped} items from {source}")
        return {"source": source, "items_scraped": items_scraped}
        
    except Exception as exc:
        log.status = "failed"
        log.error_message = str(exc)
        log.completed_at = datetime.now()
        db.commit()
        
        logging.error(f"Failed to scrape {source}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
        
    finally:
        db.close()

@celery_app.task
def scrape_all_news():
    """Scrape all news sources"""
    sources = ["elcomercio", "rpp", "gestion"]
    for source in sources:
        scrape_news_task.delay(source)

@celery_app.task
def scrape_all_social():
    """Scrape all social media platforms"""
    platforms = ["twitter", "facebook", "instagram", "youtube"]
    for platform in platforms:
        scrape_social_task.delay(platform)

@celery_app.task
def scrape_all_government():
    """Scrape all government sources"""
    sources = ["onpe", "inei", "mef"]
    for source in sources:
        scrape_government_task.delay(source)