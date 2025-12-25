from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import CompetitorCampaign
from app.schemas import CompetitorCampaignCreate, CompetitorCampaignResponse

router = APIRouter()

@router.get("/", response_model=List[CompetitorCampaignResponse])
async def list_competitors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(CompetitorCampaign).offset(skip).limit(limit).all()

@router.post("/", response_model=CompetitorCampaignResponse)
async def create_competitor(competitor: CompetitorCampaignCreate, db: Session = Depends(get_db)):
    db_competitor = CompetitorCampaign(**competitor.dict())
    db.add(db_competitor)
    db.commit()
    db.refresh(db_competitor)
    return db_competitor

@router.get("/{competitor_id}", response_model=CompetitorCampaignResponse)
async def get_competitor(competitor_id: str, db: Session = Depends(get_db)):
    competitor = db.query(CompetitorCampaign).filter(CompetitorCampaign.id == competitor_id).first()
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor campaign not found")
    return competitor
