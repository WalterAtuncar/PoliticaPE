from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db

router = APIRouter()

VALID_STATUS = ("open", "acknowledged", "dismissed", "responded")


class AlertUpdate(BaseModel):
    status: str


@router.get("")
def list_alerts(
    status: Optional[str] = Query("open"),
    figure_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    where = []
    params = {"limit": limit}
    if status and status != "all":
        where.append("a.status = :status")
        params["status"] = status
    if figure_id:
        where.append("a.figure_id = :fid")
        params["fid"] = figure_id
    clause = ("WHERE " + " AND ".join(where)) if where else ""

    rows = db.execute(text(f"""
        SELECT a.*, f.display_name AS figure_name, f.color AS figure_color
        FROM alerts a
        LEFT JOIN political_figures f ON f.id = a.figure_id
        {clause}
        ORDER BY a.created_at DESC
        LIMIT :limit
    """), params).fetchall()
    return {"alerts": [dict(r._mapping) for r in rows]}


@router.put("/{alert_id}")
def update_alert(
    alert_id: str,
    data: AlertUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.status not in VALID_STATUS:
        raise HTTPException(status_code=400, detail=f"Estado invalido. Validos: {', '.join(VALID_STATUS)}")

    row = db.execute(text("""
        UPDATE alerts
        SET status = :status,
            acknowledged_at = CASE WHEN :status <> 'open' THEN NOW() ELSE NULL END,
            acknowledged_by = CASE WHEN :status <> 'open' THEN :user ELSE NULL END
        WHERE id = :id
        RETURNING id, status
    """), {"status": data.status, "user": current_user.get("email"), "id": alert_id}).fetchone()
    db.commit()
    if not row:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return {"id": row[0], "status": row[1]}
