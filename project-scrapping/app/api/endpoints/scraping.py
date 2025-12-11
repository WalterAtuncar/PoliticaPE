from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import ScrapingLog
from app.schemas import ScrapingLogResponse, ScrapingTaskRequest, ScrapingTaskResponse
from app.celery_app import scrape_news_task, scrape_social_task, scrape_government_task

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

@router.post("/trigger/news", response_model=ScrapingTaskResponse)
async def trigger_news_scraping(
    request: ScrapingTaskRequest,
    background_tasks: BackgroundTasks
):
    """Manually trigger news scraping"""
    sources = request.sources or ["elcomercio", "rpp", "gestion"]
    
    task_ids = []
    for source in sources:
        task = scrape_news_task.delay(source)
        task_ids.append(task.id)
    
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
    platforms = request.sources or ["twitter", "facebook", "instagram", "youtube"]
    
    task_ids = []
    for platform in platforms:
        task = scrape_social_task.delay(platform)
        task_ids.append(task.id)
    
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
    sources = request.sources or ["onpe", "inei", "mef"]
    
    task_ids = []
    for source in sources:
        task = scrape_government_task.delay(source)
        task_ids.append(task.id)
    
    return ScrapingTaskResponse(
        message="Government data scraping tasks initiated",
        task_ids=task_ids,
        sources=sources
    )

@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """Get status of a specific scraping task"""
    from app.celery_app import celery_app
    
    result = celery_app.AsyncResult(task_id)
    
    return {
        "task_id": task_id,
        "status": result.status,
        "result": result.result if result.ready() else None,
        "traceback": result.traceback if result.failed() else None
    }