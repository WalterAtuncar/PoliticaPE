from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.database import get_db
from app.models import ScrapingLog
from app.schemas import ScrapingLogResponse, ScrapingTaskRequest, ScrapingTaskResponse

router = APIRouter()

@router.get("/logs", response_model=List[ScrapingLogResponse])
async def get_scraping_logs(
    source: str = None,
    status: str = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get scraping logs with optional filtering"""
    query = db.query(ScrapingLog)
    
    if source:
        query = query.filter(ScrapingLog.source == source)
    if status:
        query = query.filter(ScrapingLog.status == status)
    
    logs = query.order_by(ScrapingLog.started_at.desc()).limit(limit).all()
    return logs

def run_scraping_task(source: str, scraping_type: str, db_url: str):
    """Background task to run scraping (simplified for Replit)"""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    log = ScrapingLog(
        id=str(uuid.uuid4()),
        source=source,
        scraping_type=scraping_type,
        status="running"
    )
    db.add(log)
    db.commit()
    
    try:
        log.status = "completed"
        log.items_scraped = 0
        log.completed_at = datetime.now()
        db.commit()
    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.now()
        db.commit()
    finally:
        db.close()

@router.post("/trigger/news", response_model=ScrapingTaskResponse)
async def trigger_news_scraping(
    request: ScrapingTaskRequest,
    background_tasks: BackgroundTasks
):
    """Manually trigger news scraping"""
    from app.config import settings
    
    sources = request.sources or ["elcomercio", "rpp", "gestion"]
    task_ids = []
    
    for source in sources:
        task_id = str(uuid.uuid4())
        task_ids.append(task_id)
        background_tasks.add_task(run_scraping_task, source, "news", settings.DATABASE_URL)
    
    return ScrapingTaskResponse(
        message="News scraping tasks initiated",
        task_ids=task_ids,
        sources=sources
    )

@router.post("/trigger/social", response_model=ScrapingTaskResponse)
async def trigger_social_scraping(
    request: ScrapingTaskRequest,
    background_tasks: BackgroundTasks
):
    """Manually trigger social media scraping"""
    from app.config import settings
    
    platforms = request.sources or ["twitter", "facebook", "instagram", "youtube"]
    task_ids = []
    
    for platform in platforms:
        task_id = str(uuid.uuid4())
        task_ids.append(task_id)
        background_tasks.add_task(run_scraping_task, platform, "social", settings.DATABASE_URL)
    
    return ScrapingTaskResponse(
        message="Social media scraping tasks initiated",
        task_ids=task_ids,
        sources=platforms
    )

@router.post("/trigger/government", response_model=ScrapingTaskResponse)
async def trigger_government_scraping(
    request: ScrapingTaskRequest,
    background_tasks: BackgroundTasks
):
    """Manually trigger government data scraping"""
    from app.config import settings
    
    sources = request.sources or ["onpe", "inei", "mef"]
    task_ids = []
    
    for source in sources:
        task_id = str(uuid.uuid4())
        task_ids.append(task_id)
        background_tasks.add_task(run_scraping_task, source, "government", settings.DATABASE_URL)
    
    return ScrapingTaskResponse(
        message="Government data scraping tasks initiated",
        task_ids=task_ids,
        sources=sources
    )

@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """Get status of a specific scraping task"""
    return {
        "task_id": task_id,
        "status": "Background task running (no Celery)",
        "result": None,
        "traceback": None
    }

@router.get("/test/youtube")
async def test_youtube_api():
    """Test YouTube API connection and search"""
    from app.scrapers.social_scrapers import YouTubeScraper
    
    scraper = YouTubeScraper()
    
    if not scraper.api_key:
        return {
            "status": "error",
            "message": "YOUTUBE_API_KEY no está configurado",
            "api_key_configured": False
        }
    
    try:
        videos = scraper._search_videos("política perú", max_results=5)
        
        return {
            "status": "success",
            "message": "Conexión a YouTube API exitosa",
            "api_key_configured": True,
            "videos_found": len(videos),
            "sample_videos": [
                {
                    "id": v.get("post_id"),
                    "author": v.get("author"),
                    "content": v.get("content", "")[:100] + "..." if len(v.get("content", "")) > 100 else v.get("content", ""),
                    "created_at": str(v.get("created_at"))
                }
                for v in videos[:3]
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al conectar con YouTube API: {str(e)}",
            "api_key_configured": True
        }
