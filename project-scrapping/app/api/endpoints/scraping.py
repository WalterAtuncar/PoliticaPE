from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime
import asyncio
import logging

from app.database import get_db
from app.models import ScrapingLog, RawSocialPost
from app.schemas import ScrapingLogResponse, ScrapingTaskRequest, ScrapingTaskResponse
from app.services.sentiment_analyzer import SentimentAnalyzer

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/logs", response_model=List[ScrapingLogResponse])
async def get_scraping_logs(
    source: str = None,
    status: str = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(ScrapingLog)
    
    if source:
        query = query.filter(ScrapingLog.source == source)
    if status:
        query = query.filter(ScrapingLog.status == status)
    
    logs = query.order_by(ScrapingLog.started_at.desc()).limit(limit).all()
    return logs

async def run_twitter_scraping(db_url: str, query: str = None, max_results: int = 100):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.services.scrapers.twitter_scraper import TwitterScraper
    
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source="twitter",
        scraping_type="social",
        status="running"
    )
    db.add(log)
    db.commit()
    
    try:
        scraper = TwitterScraper()
        
        if query:
            tweets = await scraper.search_tweets(query=query, max_results=max_results)
        else:
            tweets = await scraper.search_political_content(max_results=max_results)
        
        sentiment_analyzer = SentimentAnalyzer()
        items_added = 0
        
        for tweet in tweets:
            existing = db.query(RawSocialPost).filter(
                RawSocialPost.platform == "twitter",
                RawSocialPost.post_id == tweet["post_id"]
            ).first()
            
            if existing:
                continue
            
            sentiment_score = sentiment_analyzer.analyze(tweet.get("content", ""))
            
            post = RawSocialPost(
                id=str(uuid.uuid4()),
                platform=tweet["platform"],
                post_id=tweet["post_id"],
                author=tweet["author"],
                content=tweet["content"],
                created_at=datetime.fromisoformat(tweet["created_at"].replace("Z", "+00:00")) if tweet.get("created_at") else None,
                engagement_metrics=tweet["engagement_metrics"],
                extra_metadata=tweet.get("metadata"),
                geographic_location=tweet.get("geographic_location"),
                sentiment_score=sentiment_score,
                processed=True
            )
            db.add(post)
            items_added += 1
        
        db.commit()
        
        log.status = "completed"
        log.items_scraped = items_added
        log.completed_at = datetime.now()
        log.extra_metadata = {"total_fetched": len(tweets), "duplicates_skipped": len(tweets) - items_added}
        db.commit()
        
        logger.info(f"Twitter scraping completado: {items_added} items agregados")
        
    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
        logger.error(f"Error en Twitter scraping: {str(e)}")
    finally:
        db.close()

async def run_youtube_scraping(db_url: str, query: str = None, max_results: int = 50):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.services.scrapers.youtube_scraper import YouTubeScraper
    
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source="youtube",
        scraping_type="social",
        status="running"
    )
    db.add(log)
    db.commit()
    
    try:
        scraper = YouTubeScraper()
        
        if query:
            videos = await scraper.search_videos(query=query, max_results=max_results)
        else:
            videos = await scraper.search_political_content(max_results=max_results)
        
        sentiment_analyzer = SentimentAnalyzer()
        items_added = 0
        
        for video in videos:
            existing = db.query(RawSocialPost).filter(
                RawSocialPost.platform == "youtube",
                RawSocialPost.post_id == video["post_id"]
            ).first()
            
            if existing:
                continue
            
            sentiment_score = sentiment_analyzer.analyze(video.get("content", ""))
            
            post = RawSocialPost(
                id=str(uuid.uuid4()),
                platform=video["platform"],
                post_id=video["post_id"],
                author=video["author"],
                content=video["content"],
                created_at=datetime.fromisoformat(video["created_at"].replace("Z", "+00:00")) if video.get("created_at") else None,
                engagement_metrics=video["engagement_metrics"],
                extra_metadata=video.get("metadata"),
                geographic_location=video.get("geographic_location"),
                region=video.get("region", "Nacional"),
                sentiment_score=sentiment_score,
                processed=True
            )
            db.add(post)
            items_added += 1
        
        db.commit()
        
        log.status = "completed"
        log.items_scraped = items_added
        log.completed_at = datetime.now()
        log.extra_metadata = {"total_fetched": len(videos), "duplicates_skipped": len(videos) - items_added}
        db.commit()
        
        logger.info(f"YouTube scraping completado: {items_added} items agregados")
        
    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
        logger.error(f"Error en YouTube scraping: {str(e)}")
    finally:
        db.close()

@router.post("/trigger/twitter")
async def trigger_twitter_scraping(
    background_tasks: BackgroundTasks,
    query: Optional[str] = Query(None, description="Búsqueda personalizada"),
    max_results: int = Query(100, description="Máximo de resultados", le=500)
):
    from app.config import settings
    
    task_id = str(uuid.uuid4())
    background_tasks.add_task(
        lambda: asyncio.run(run_twitter_scraping(settings.DATABASE_URL, query, max_results))
    )
    
    return {
        "message": "Scraping de Twitter iniciado",
        "task_id": task_id,
        "platform": "twitter",
        "query": query or "Contenido político peruano",
        "max_results": max_results
    }

@router.post("/trigger/youtube")
async def trigger_youtube_scraping(
    background_tasks: BackgroundTasks,
    query: Optional[str] = Query(None, description="Búsqueda personalizada"),
    max_results: int = Query(50, description="Máximo de resultados", le=200)
):
    from app.config import settings
    
    task_id = str(uuid.uuid4())
    background_tasks.add_task(
        lambda: asyncio.run(run_youtube_scraping(settings.DATABASE_URL, query, max_results))
    )
    
    return {
        "message": "Scraping de YouTube iniciado",
        "task_id": task_id,
        "platform": "youtube",
        "query": query or "Contenido político peruano",
        "max_results": max_results
    }

@router.post("/trigger/social", response_model=ScrapingTaskResponse)
async def trigger_social_scraping(
    request: ScrapingTaskRequest,
    background_tasks: BackgroundTasks
):
    from app.config import settings
    
    platforms = request.sources or ["twitter", "youtube"]
    task_ids = []
    
    for platform in platforms:
        task_id = str(uuid.uuid4())
        task_ids.append(task_id)
        
        if platform == "twitter":
            background_tasks.add_task(
                lambda: asyncio.run(run_twitter_scraping(settings.DATABASE_URL))
            )
        elif platform == "youtube":
            background_tasks.add_task(
                lambda: asyncio.run(run_youtube_scraping(settings.DATABASE_URL))
            )
    
    return ScrapingTaskResponse(
        message="Scraping de redes sociales iniciado",
        task_ids=task_ids,
        sources=platforms
    )

@router.post("/trigger/news", response_model=ScrapingTaskResponse)
async def trigger_news_scraping(
    request: ScrapingTaskRequest,
    background_tasks: BackgroundTasks
):
    sources = request.sources or ["elcomercio", "rpp", "gestion"]
    task_ids = [str(uuid.uuid4()) for _ in sources]
    
    return ScrapingTaskResponse(
        message="News scraping no implementado aún - requiere implementar scrapers de noticias",
        task_ids=task_ids,
        sources=sources
    )

@router.post("/trigger/government", response_model=ScrapingTaskResponse)
async def trigger_government_scraping(
    request: ScrapingTaskRequest,
    background_tasks: BackgroundTasks
):
    sources = request.sources or ["onpe", "inei", "mef"]
    task_ids = [str(uuid.uuid4()) for _ in sources]
    
    return ScrapingTaskResponse(
        message="Government scraping no implementado aún - requiere implementar scrapers gubernamentales",
        task_ids=task_ids,
        sources=sources
    )

@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    return {
        "task_id": task_id,
        "status": "Background task running",
        "result": None,
        "traceback": None
    }

@router.get("/test/twitter")
async def test_twitter_api():
    from app.services.scrapers.twitter_scraper import TwitterScraper
    import os
    
    bearer_token = os.environ.get("X_BEARER_TOKEN")
    
    if not bearer_token:
        return {
            "status": "error",
            "message": "X_BEARER_TOKEN no está configurado",
            "api_configured": False
        }
    
    try:
        scraper = TwitterScraper()
        tweets = await scraper.search_tweets(query="Perú política", max_results=5)
        
        return {
            "status": "success",
            "message": "Conexión a Twitter API exitosa",
            "api_configured": True,
            "tweets_found": len(tweets),
            "sample_tweets": [
                {
                    "id": t.get("post_id"),
                    "author": t.get("author"),
                    "content": t.get("content", "")[:100] + "..." if len(t.get("content", "")) > 100 else t.get("content", ""),
                    "engagement": t.get("engagement_metrics")
                }
                for t in tweets[:3]
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al conectar con Twitter API: {str(e)}",
            "api_configured": True
        }

@router.get("/test/twitterapi-io")
async def test_twitterapi_io():
    from app.services.scrapers.twitterapi_io_scraper import TwitterAPIioScraper
    
    scraper = TwitterAPIioScraper()
    result = await scraper.test_connection()
    return result

async def run_twitterapi_io_scraping(db_url: str, query: str = None, max_results: int = 100):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.services.scrapers.twitterapi_io_scraper import TwitterAPIioScraper
    
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source="twitter",
        scraping_type="social",
        status="running"
    )
    db.add(log)
    db.commit()
    
    try:
        scraper = TwitterAPIioScraper()
        search_query = query or "Peru politica OR congreso peru OR presidente peru"
        tweets = await scraper.search_tweets(query=search_query, max_results=max_results)
        
        sentiment_analyzer = SentimentAnalyzer()
        items_added = 0
        
        for tweet in tweets:
            transformed = scraper.transform_tweet(tweet)
            
            existing = db.query(RawSocialPost).filter(
                RawSocialPost.platform == "twitter",
                RawSocialPost.post_id == transformed["post_id"]
            ).first()
            
            if existing:
                continue
            
            sentiment_score = sentiment_analyzer.analyze(transformed.get("content", ""))
            
            post = RawSocialPost(
                id=str(uuid.uuid4()),
                platform=transformed["platform"],
                post_id=transformed["post_id"],
                author=transformed["author"],
                content=transformed["content"],
                created_at=transformed["created_at"],
                engagement_metrics=transformed["engagement_metrics"],
                geographic_location=transformed.get("geographic_location"),
                region=transformed.get("region", "Nacional"),
                sentiment_score=sentiment_score,
                processed=True
            )
            db.add(post)
            items_added += 1
        
        db.commit()
        
        log.status = "completed"
        log.items_scraped = items_added
        log.completed_at = datetime.now()
        log.extra_metadata = {"total_fetched": len(tweets), "duplicates_skipped": len(tweets) - items_added, "source": "twitterapi.io"}
        db.commit()
        
        logger.info(f"TwitterAPI.io scraping completado: {items_added} tweets agregados")
        
    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
        logger.error(f"Error en TwitterAPI.io scraping: {str(e)}")
    finally:
        db.close()

@router.post("/trigger/twitterapi-io")
async def trigger_twitterapi_io_scraping(
    background_tasks: BackgroundTasks,
    query: Optional[str] = Query(None, description="Búsqueda personalizada"),
    max_results: int = Query(50, description="Máximo de resultados", le=200)
):
    from app.config import settings
    
    task_id = str(uuid.uuid4())
    background_tasks.add_task(
        lambda: asyncio.run(run_twitterapi_io_scraping(settings.DATABASE_URL, query, max_results))
    )
    
    return {
        "message": "Scraping de Twitter (via TwitterAPI.io) iniciado",
        "task_id": task_id,
        "platform": "twitter",
        "source": "twitterapi.io",
        "query": query or "Peru politica OR congreso peru OR presidente peru",
        "max_results": max_results
    }

@router.get("/test/youtube")
async def test_youtube_api():
    from app.services.scrapers.youtube_scraper import YouTubeScraper
    import os
    
    api_key = os.environ.get("YOUTUBE_API_KEY")
    
    if not api_key:
        return {
            "status": "error",
            "message": "YOUTUBE_API_KEY no está configurado",
            "api_configured": False
        }
    
    try:
        scraper = YouTubeScraper()
        videos = await scraper.search_videos(query="política perú", max_results=5)
        
        return {
            "status": "success",
            "message": "Conexión a YouTube API exitosa",
            "api_configured": True,
            "videos_found": len(videos),
            "sample_videos": [
                {
                    "id": v.get("post_id"),
                    "author": v.get("author"),
                    "content": v.get("content", "")[:100] + "..." if len(v.get("content", "")) > 100 else v.get("content", ""),
                    "engagement": v.get("engagement_metrics")
                }
                for v in videos[:3]
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al conectar con YouTube API: {str(e)}",
            "api_configured": True
        }


@router.get("/test/instagram")
async def test_instagram_api():
    from app.services.scrapers.instagram_scraper import InstagramScraper
    import os
    
    access_token = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
    
    if not access_token:
        return {
            "status": "error",
            "message": "INSTAGRAM_ACCESS_TOKEN no está configurado",
            "api_configured": False
        }
    
    try:
        scraper = InstagramScraper()
        result = await scraper.test_connection()
        
        if result.get("success"):
            accounts = await scraper.get_instagram_accounts()
            return {
                "status": "success",
                "message": result.get("message"),
                "api_configured": True,
                "user_name": result.get("name"),
                "instagram_accounts": len(accounts),
                "accounts": accounts
            }
        else:
            return {
                "status": "error",
                "message": result.get("error"),
                "api_configured": True
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al conectar con Instagram API: {str(e)}",
            "api_configured": True
        }


async def run_instagram_scraping(db_url: str, ig_user_id: str, max_results: int = 100):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.services.scrapers.instagram_scraper import InstagramScraper
    
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source="instagram",
        scraping_type="social",
        status="running"
    )
    db.add(log)
    db.commit()
    
    try:
        scraper = InstagramScraper()
        
        if not scraper.is_configured():
            raise Exception("INSTAGRAM_ACCESS_TOKEN no está configurado")
        
        posts = await scraper.scrape_political_content(ig_user_id, max_per_hashtag=max_results // 6)
        
        sentiment_analyzer = SentimentAnalyzer()
        items_added = 0
        
        for post in posts:
            existing = db.query(RawSocialPost).filter(
                RawSocialPost.platform == "instagram",
                RawSocialPost.post_id == post["post_id"]
            ).first()
            
            if existing:
                continue
            
            sentiment_score = sentiment_analyzer.analyze(post.get("content", ""))
            
            db_post = RawSocialPost(
                id=str(uuid.uuid4()),
                platform="instagram",
                post_id=post["post_id"],
                author=post.get("author", ""),
                content=post.get("content", ""),
                engagement_metrics={
                    "likes": post.get("likes", 0),
                    "shares": 0,
                    "comments": post.get("comments", 0),
                    "views": 0
                },
                scraped_at=datetime.now(),
                region="Nacional",
                sentiment_score=sentiment_score
            )
            db.add(db_post)
            items_added += 1
        
        db.commit()
        
        log.status = "completed"
        log.items_scraped = items_added
        log.completed_at = datetime.now()
        db.commit()
        
        logger.info(f"Instagram scraping completado: {items_added} posts añadidos")
        
    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
        logger.error(f"Error en Instagram scraping: {str(e)}")
    finally:
        db.close()


@router.post("/trigger/instagram")
async def trigger_instagram_scraping(
    background_tasks: BackgroundTasks,
    ig_user_id: str = Query(..., description="ID de cuenta Instagram Business"),
    max_results: int = Query(50, description="Máximo de resultados por hashtag", le=200),
    db: Session = Depends(get_db)
):
    from app.config import settings
    from app.services.scrapers.instagram_scraper import InstagramScraper
    
    scraper = InstagramScraper()
    if not scraper.is_configured():
        raise HTTPException(status_code=400, detail="INSTAGRAM_ACCESS_TOKEN no está configurado")
    
    task_id = str(uuid.uuid4())
    background_tasks.add_task(
        lambda: asyncio.run(run_instagram_scraping(settings.DATABASE_URL, ig_user_id, max_results))
    )
    
    return {
        "message": "Scraping de Instagram iniciado",
        "task_id": task_id,
        "platform": "instagram",
        "ig_user_id": ig_user_id,
        "max_results": max_results,
        "hashtags": ["politicaperu", "perupolitico", "congresoperu", "gobiernoperu", "eleccionesperu", "peru2026"]
    }
