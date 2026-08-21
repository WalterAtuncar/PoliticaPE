from typing import Optional

from fastapi import APIRouter, Depends, Query
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
