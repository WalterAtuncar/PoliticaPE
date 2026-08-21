import csv
import io
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.services import results as results_service

router = APIRouter()

REQUIRED_COLUMNS = {"ubigeo", "lista", "votos"}


@router.post("/upload")
async def upload_results(
    file: UploadFile = File(...),
    source: str = Query("manual"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """CSV con columnas: ubigeo, distrito, lista, votos, pct_validos, actas_pct."""
    raw = (await file.read()).decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(raw))
    cols = {c.strip().lower() for c in (reader.fieldnames or [])}
    missing = REQUIRED_COLUMNS - cols
    if missing:
        raise HTTPException(status_code=400, detail=f"Faltan columnas en el CSV: {', '.join(sorted(missing))}")

    def num(v):
        v = (v or "").strip().replace(",", ".")
        try:
            return float(v) if v else None
        except ValueError:
            return None

    rows = []
    for r in reader:
        low = {k.strip().lower(): (v or "").strip() for k, v in r.items() if k}
        votes = num(low.get("votos"))
        rows.append({
            "ubigeo": low.get("ubigeo"),
            "district_name": low.get("distrito"),
            "list_name": low.get("lista"),
            "votes": int(votes) if votes is not None else None,
            "pct_valid": num(low.get("pct_validos")),
            "actas_pct": num(low.get("actas_pct")),
        })

    saved = results_service.upsert_results(db, rows, source)
    return {"detail": f"{saved} filas cargadas", "source": source, "rows": saved}


@router.get("")
def get_results(
    source: str = Query("manual"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return results_service.summary(db, source)


@router.get("/districts")
def get_results_districts(
    source: str = Query("manual"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"districts": results_service.summary(db, source)["districts"]}


@router.get("/sources")
def list_sources(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    from sqlalchemy import text
    rows = db.execute(text("""
        SELECT source, count(*) AS n, max(loaded_at) AS last_load
        FROM election_results GROUP BY 1 ORDER BY 3 DESC
    """)).fetchall()
    return {"sources": [{"source": r[0], "rows": r[1], "last_load": r[2].isoformat() if r[2] else None} for r in rows]}


@router.get("/vs-opportunity")
def get_vs_opportunity(
    figure_id: Optional[str] = None,
    source: str = Query("manual"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models import PoliticalFigure

    if not figure_id:
        own = db.query(PoliticalFigure).filter(PoliticalFigure.is_own_candidate == True).first()
        if not own:
            raise HTTPException(status_code=400, detail="Define OWN_CANDIDATE o pasa figure_id")
        figure_id = own.id
    return results_service.vs_opportunity(db, figure_id, source)


@router.post("/fetch-onpe")
def fetch_onpe(
    source: str = Query("onpe"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.scrapers.onpe_results import OnpeResultsScraper

    scraper = OnpeResultsScraper()
    if not scraper.is_configured():
        raise HTTPException(
            status_code=400,
            detail="ONPE_RESULTS_URL no esta configurada. Fijala el dia de la eleccion tras inspeccionar el portal de ONPE.",
        )
    try:
        rows = scraper.fetch_lima_districts()
        saved = results_service.upsert_results(db, rows, source)
        return {"detail": f"{saved} filas cargadas desde ONPE", "rows": saved}
    finally:
        scraper.close()
