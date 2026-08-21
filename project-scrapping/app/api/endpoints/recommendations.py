from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.database import get_db
from app.api.deps import get_current_user
from app.models import AIRecommendationRecord, PoliticalFigure
from app.schemas import (
    AIRecommendationResponse,
    AIRecommendationUpdate,
    GenerateRecommendationsRequest,
)
from app.services.ai_recommendations import (
    generate_recommendations_for_figures,
    gather_figure_context,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=List[AIRecommendationResponse])
def list_recommendations(
    figure_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(AIRecommendationRecord)
    if figure_id:
        query = query.filter(AIRecommendationRecord.figure_id == figure_id)
    if category:
        query = query.filter(AIRecommendationRecord.category == category)
    if status:
        query = query.filter(AIRecommendationRecord.status == status)
    recs = query.order_by(AIRecommendationRecord.created_at.desc()).limit(limit).all()
    return recs


@router.post("/generate")
async def generate_recommendations(
    data: GenerateRecommendationsRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        results = await generate_recommendations_for_figures(
            db=db,
            figure_ids=data.figure_ids,
            focus_areas=data.focus_areas,
        )
        return {"recommendations": results, "count": len(results)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando recomendaciones: {str(e)}")


@router.get("/context/{figure_id}")
def get_figure_context(figure_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    figure = db.query(PoliticalFigure).filter(PoliticalFigure.id == figure_id).first()
    if not figure:
        raise HTTPException(status_code=404, detail="Figura política no encontrada")
    context = gather_figure_context(db, figure)
    return context


@router.put("/{recommendation_id}", response_model=AIRecommendationResponse)
def update_recommendation(
    recommendation_id: str,
    data: AIRecommendationUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = db.query(AIRecommendationRecord).filter(
        AIRecommendationRecord.id == recommendation_id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recomendación no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(rec, key, value)

    db.commit()
    db.refresh(rec)
    return rec


@router.delete("/{recommendation_id}")
def delete_recommendation(recommendation_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rec = db.query(AIRecommendationRecord).filter(
        AIRecommendationRecord.id == recommendation_id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recomendación no encontrada")
    db.delete(rec)
    db.commit()
    return {"detail": "Recomendación eliminada"}
