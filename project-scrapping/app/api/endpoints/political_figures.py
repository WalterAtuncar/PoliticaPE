from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.api.deps import get_current_user
from app.models import PoliticalFigure, SearchTag
from app.schemas import (
    PoliticalFigureCreate,
    PoliticalFigureUpdate,
    PoliticalFigureResponse,
)

router = APIRouter()


def sync_keywords_to_tags(db: Session, keywords: list, platforms: list = None):
    if platforms is None:
        platforms = ["twitter", "youtube", "instagram"]
    for keyword in keywords:
        existing = db.query(SearchTag).filter(SearchTag.tag == keyword).first()
        if not existing:
            tag = SearchTag(
                id=str(uuid.uuid4()),
                tag=keyword,
                platforms=platforms,
                is_active=True,
            )
            db.add(tag)
    db.commit()


@router.get("", response_model=List[PoliticalFigureResponse])
def list_figures(
    active_only: bool = False,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(PoliticalFigure)
    if active_only:
        query = query.filter(PoliticalFigure.is_active == True)
    figures = query.order_by(PoliticalFigure.created_at.desc()).all()
    return figures


@router.get("/{figure_id}", response_model=PoliticalFigureResponse)
def get_figure(figure_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    figure = db.query(PoliticalFigure).filter(PoliticalFigure.id == figure_id).first()
    if not figure:
        raise HTTPException(status_code=404, detail="Figura política no encontrada")
    return figure


@router.post("", response_model=PoliticalFigureResponse)
def create_figure(data: PoliticalFigureCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    figure = PoliticalFigure(
        id=str(uuid.uuid4()),
        full_name=data.full_name,
        display_name=data.display_name,
        nickname=data.nickname,
        photo_url=data.photo_url,
        party_name=data.party_name,
        current_position=data.current_position,
        region=data.region,
        search_keywords=data.search_keywords,
        social_accounts=data.social_accounts,
        is_active=data.is_active,
        monitoring_priority=data.monitoring_priority,
        notes=data.notes,
        figure_role=data.figure_role,
        is_own_candidate=data.is_own_candidate,
        list_name=data.list_name,
        color=data.color,
        zone_strength=data.zone_strength,
    )
    db.add(figure)
    db.commit()
    db.refresh(figure)

    if data.search_keywords:
        sync_keywords_to_tags(db, data.search_keywords)

    return figure


@router.put("/{figure_id}", response_model=PoliticalFigureResponse)
def update_figure(
    figure_id: str,
    data: PoliticalFigureUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    figure = db.query(PoliticalFigure).filter(PoliticalFigure.id == figure_id).first()
    if not figure:
        raise HTTPException(status_code=404, detail="Figura política no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(figure, key, value)

    db.commit()
    db.refresh(figure)

    if "search_keywords" in update_data and update_data["search_keywords"]:
        sync_keywords_to_tags(db, update_data["search_keywords"])

    return figure


@router.delete("/{figure_id}")
def delete_figure(figure_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    figure = db.query(PoliticalFigure).filter(PoliticalFigure.id == figure_id).first()
    if not figure:
        raise HTTPException(status_code=404, detail="Figura política no encontrada")
    db.delete(figure)
    db.commit()
    return {"detail": "Figura política eliminada"}
