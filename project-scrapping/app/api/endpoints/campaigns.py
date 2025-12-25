from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models import Campaign, CampaignTeamMember, CampaignAsset, ABTest, ABTestVariant
from app.schemas import (
    CampaignCreate, CampaignUpdate, CampaignResponse,
    CampaignTeamMemberCreate, CampaignTeamMemberResponse,
    CampaignAssetCreate, CampaignAssetResponse,
    ABTestCreate, ABTestResponse
)

router = APIRouter()

# --- CAMPAIGNS ---

@router.get("/", response_model=List[CampaignResponse])
async def list_campaigns(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Campaign)
    if status:
        query = query.filter(Campaign.status == status)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=CampaignResponse)
async def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
    db_campaign = Campaign(**campaign.dict())
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(campaign_id: str, campaign_in: CampaignUpdate, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    update_data = campaign_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)
    
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@router.delete("/{campaign_id}")
async def delete_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    db.delete(campaign)
    db.commit()
    return {"message": "Campaign deleted successfully"}

# --- TEAM MEMBERS ---

@router.get("/{campaign_id}/team", response_model=List[CampaignTeamMemberResponse])
async def list_team_members(campaign_id: str, db: Session = Depends(get_db)):
    return db.query(CampaignTeamMember).filter(CampaignTeamMember.campaign_id == campaign_id).all()

@router.post("/{campaign_id}/team", response_model=CampaignTeamMemberResponse)
async def add_team_member(campaign_id: str, member: CampaignTeamMemberCreate, db: Session = Depends(get_db)):
    # Verify campaign exists
    if not db.query(Campaign).filter(Campaign.id == campaign_id).first():
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Needs tenant_id from campaign or request. For simplicity using campaign's tenant via simple query if needed, 
    # but schema requires tenant_id. Assuming passed in member or we derive it.
    # CampaignTeamMemberCreate doesn't have tenant_id in schema I defined? Let's check.
    # Actually I defined CampaignTeamMemberBase with name/email/role. Create inherits it.
    # I should update schema or logic to get tenant_id.
    
    # Fetch campaign tenant_id
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    db_member = CampaignTeamMember(
        **member.dict(),
        campaign_id=campaign_id,
        tenant_id=campaign.tenant_id
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

# --- ASSETS ---

@router.get("/{campaign_id}/assets", response_model=List[CampaignAssetResponse])
async def list_assets(campaign_id: str, db: Session = Depends(get_db)):
    return db.query(CampaignAsset).filter(CampaignAsset.campaign_id == campaign_id).all()

@router.post("/{campaign_id}/assets", response_model=CampaignAssetResponse)
async def add_asset(campaign_id: str, asset: CampaignAssetCreate, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    db_asset = CampaignAsset(
        **asset.dict(),
        campaign_id=campaign_id,
        tenant_id=campaign.tenant_id
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

# --- A/B TESTS ---

@router.get("/{campaign_id}/ab-tests", response_model=List[ABTestResponse])
async def list_ab_tests(campaign_id: str, db: Session = Depends(get_db)):
    return db.query(ABTest).filter(ABTest.campaign_id == campaign_id).all()

@router.post("/{campaign_id}/ab-tests", response_model=ABTestResponse)
async def create_ab_test(campaign_id: str, test: ABTestCreate, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    db_test = ABTest(
        **test.dict(),
        campaign_id=campaign_id,
        tenant_id=campaign.tenant_id
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test
