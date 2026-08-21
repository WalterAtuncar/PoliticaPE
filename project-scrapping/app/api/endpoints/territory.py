from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.services import lima_geo, territory

router = APIRouter()


@router.get("/districts")
def districts(
    days: int = Query(7, ge=1, le=365),
    figure_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"period_days": days, "districts": territory.district_stats(db, days, figure_id)}


@router.get("/zones")
def zones(
    days: int = Query(7, ge=1, le=365),
    figure_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"period_days": days, "zones": territory.zone_stats(db, days, figure_id)}


@router.get("/opportunity")
def opportunity(
    figure_id: Optional[str] = None,
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models import PoliticalFigure

    if not figure_id:
        own = db.query(PoliticalFigure).filter(PoliticalFigure.is_own_candidate == True).first()
        if not own:
            raise HTTPException(
                status_code=400,
                detail="Define OWN_CANDIDATE (y vuelve a correr el seed) o pasa figure_id",
            )
        figure_id = own.id

    rows = territory.opportunity(db, figure_id, days)
    if not rows:
        raise HTTPException(status_code=404, detail="Figura no encontrada")
    return {"figure_id": figure_id, "period_days": days, "districts": rows}


@router.get("/catalog")
def catalog(current_user: dict = Depends(get_current_user)):
    return {
        "zones": lima_geo.ZONES,
        "total_electors": sum(d["electors_approx"] for d in lima_geo.all_districts()),
        "districts": [
            {"ubigeo": d["ubigeo"], "name": d["display"], "zone": d["zone"], "electors": d["electors_approx"]}
            for d in lima_geo.all_districts()
        ],
    }
