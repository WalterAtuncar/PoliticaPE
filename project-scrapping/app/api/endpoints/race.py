import uuid
from datetime import date, datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import electoral_config as ec
from app.api.deps import get_current_user
from app.database import get_db
from app.services import daily_brief, race

router = APIRouter()


class ManualPollCandidate(BaseModel):
    name: str
    pct: Optional[float] = None


class ManualPollCreate(BaseModel):
    pollster: str
    field_dates: str
    sample_size: Optional[int] = None
    base: str = "validos"
    candidates: List[ManualPollCandidate]
    undecided: Optional[float] = None
    blank: Optional[float] = None
    published_at: Optional[date] = None


@router.get("/polls")
def get_polls(
    base: str = Query("validos", pattern="^(validos|total)$"),
    days: int = Query(120, ge=1, le=730),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = race.polls(db, base=base, days=days)
    publishable = ec.polls_publishable()
    blackout = ec.POLL_BLACKOUT_FROM
    for p in rows:
        pub = p.get("published_at")
        p["internal_only"] = bool(
            blackout and pub and datetime.fromisoformat(pub).date() >= blackout
        )
    return {
        "base": base,
        "polls": rows,
        "average": race.poll_average(rows),
        "publishable": publishable,
        "blackout_from": blackout.isoformat() if blackout else None,
    }


@router.post("/polls/manual")
def create_manual_poll(
    data: ManualPollCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Carga de una encuesta privada del equipo (util durante la veda)."""
    candidates = [{"candidato": c.name, "porcentaje": c.pct} for c in data.candidates]
    ranked = sorted([c for c in candidates if c["porcentaje"] is not None],
                    key=lambda c: -c["porcentaje"])
    if not ranked:
        raise HTTPException(status_code=400, detail="Se necesita al menos un candidato con porcentaje")

    results = {
        "tipo": "Intencion de voto municipal",
        "ambito": "lima_metropolitana",
        "base": data.base,
        "manual": True,
        "candidatos": candidates,
        "ranking": ranked,
        "total_candidatos": len(ranked),
        "lider": ranked[0]["candidato"],
        "lider_porcentaje": ranked[0]["porcentaje"],
        "segundo": ranked[1]["candidato"] if len(ranked) > 1 else None,
        "segundo_porcentaje": ranked[1]["porcentaje"] if len(ranked) > 1 else None,
        "diferencia_1_2": round(ranked[0]["porcentaje"] - ranked[1]["porcentaje"], 1) if len(ranked) > 1 else None,
        "indecisos": data.undecided,
        "blanco_viciado": data.blank,
    }
    db.execute(text("""
        INSERT INTO scraped_surveys (id, source, title, methodology, sample_size, field_dates,
                                     results, published_at, scraped_at, url, pollster, processed)
        VALUES (CAST(:id AS uuid), :source, :title, :methodology, :sample, :fd,
                CAST(:results AS jsonb), :pub, NOW(), '', :pollster, TRUE)
    """), {
        "id": str(uuid.uuid4()),
        "source": data.pollster,
        "title": f"Lima 2026 (interna): {ranked[0]['candidato']} {ranked[0]['porcentaje']}%"[:500],
        "methodology": f"Encuesta interna cargada por el equipo - base: {data.base}",
        "sample": data.sample_size,
        "fd": data.field_dates,
        "results": __import__("json").dumps(results, ensure_ascii=False),
        "pub": data.published_at or date.today(),
        "pollster": data.pollster,
    })
    db.commit()
    return {"detail": "Encuesta interna registrada", "results": results}


@router.get("/share-of-voice")
def get_share_of_voice(
    days: int = Query(7, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"period_days": days, "figures": race.share_of_voice(db, days)}


@router.get("/sentiment")
def get_sentiment(
    days: int = Query(7, ge=1, le=365),
    zone: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"period_days": days, "zone": zone, "figures": race.sentiment(db, days, zone)}


@router.get("/topics")
def get_topics(
    days: int = Query(1, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"period_days": days, "topics": race.topics(db, days)}


@router.get("/brief/latest")
def get_latest_brief(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    brief = daily_brief.latest(db)
    if not brief:
        return {"brief": None}
    return {"brief": brief}


@router.post("/brief/generate")
def post_generate_brief(
    send: bool = Query(False, description="enviar por Telegram y correo"),
    force: bool = Query(True, description="regenerar aunque ya exista el de hoy"),
    kind: str = Query("daily", pattern="^(daily|postelectoral)$"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return {"brief": daily_brief.generate(db, send=send, force=force, kind=kind)}
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando el brief: {e}")
