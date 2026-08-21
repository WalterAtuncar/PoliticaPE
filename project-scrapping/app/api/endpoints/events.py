import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models import Event, Task, Venue, Volunteer
from app.services import lima_geo, territory

router = APIRouter()

CAMPAIGN_NAME = "Lima Metropolitana 2026"
EVENT_TYPES = ("tour", "rally", "debate", "press", "fundraising", "meeting")
TASK_STATUS = ("todo", "in_progress", "done", "blocked")
TASK_PRIORITY = ("low", "medium", "high", "critical")


class EventCreate(BaseModel):
    title: str
    event_type: str = "tour"
    start_at: datetime
    end_at: Optional[datetime] = None
    district_ubigeo: Optional[str] = None
    venue_name: Optional[str] = None
    description: Optional[str] = None
    expected_attendance: Optional[int] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    event_type: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    district_ubigeo: Optional[str] = None
    description: Optional[str] = None
    expected_attendance: Optional[int] = None
    actual_attendance: Optional[int] = None
    status: Optional[str] = None


class TaskCreate(BaseModel):
    title: str
    priority: str = "medium"
    due_date: Optional[datetime] = None
    description: Optional[str] = None
    assigned_user_id: Optional[str] = None


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    title: Optional[str] = None


class VolunteerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    district_ubigeo: Optional[str] = None


def _context(db: Session):
    tenant = db.execute(text("SELECT id FROM identity.tenants LIMIT 1")).fetchone()
    if not tenant:
        raise HTTPException(status_code=500, detail="No hay tenant configurado")
    campaign = db.execute(
        text("SELECT id FROM organization.campaigns WHERE name = :n"), {"n": CAMPAIGN_NAME}
    ).fetchone()
    if not campaign:
        raise HTTPException(status_code=500, detail=f"No existe la campana '{CAMPAIGN_NAME}'. Aplica la migracion 006.")
    return str(tenant[0]), str(campaign[0])


def _validate_district(ubigeo: Optional[str]) -> Optional[str]:
    if ubigeo and not lima_geo.district_by_ubigeo(ubigeo):
        raise HTTPException(status_code=400, detail=f"Ubigeo desconocido: {ubigeo}")
    return ubigeo


def _serialize_event(e: Event) -> dict:
    d = lima_geo.district_by_ubigeo(e.region_code) if e.region_code else None
    return {
        "id": e.id, "title": e.title, "event_type": e.event_type,
        "start_at": e.start_at.isoformat() if e.start_at else None,
        "end_at": e.end_at.isoformat() if e.end_at else None,
        "district_ubigeo": e.region_code,
        "district_name": d["display"] if d else None,
        "zone": d["zone"] if d else None,
        "description": e.description,
        "expected_attendance": e.expected_attendance,
        "actual_attendance": e.actual_attendance,
        "status": e.status,
    }


@router.get("")
def list_events(
    district: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Event)
    if district:
        q = q.filter(Event.region_code == district)
    events = q.order_by(Event.start_at.desc()).limit(limit).all()
    return {"events": [_serialize_event(e) for e in events]}


@router.post("")
def create_event(
    data: EventCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.event_type not in EVENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Tipo invalido. Validos: {', '.join(EVENT_TYPES)}")
    tenant_id, campaign_id = _context(db)
    _validate_district(data.district_ubigeo)

    venue_id = None
    if data.venue_name:
        venue = db.query(Venue).filter(Venue.name == data.venue_name).first()
        if not venue:
            venue = Venue(id=str(uuid.uuid4()), tenant_id=tenant_id, name=data.venue_name,
                          region_code=data.district_ubigeo)
            db.add(venue)
            db.flush()
        venue_id = venue.id

    event = Event(
        id=str(uuid.uuid4()), tenant_id=tenant_id, campaign_id=campaign_id, venue_id=venue_id,
        event_type=data.event_type, title=data.title, description=data.description,
        start_at=data.start_at, end_at=data.end_at, region_code=data.district_ubigeo,
        expected_attendance=data.expected_attendance, status="scheduled",
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return _serialize_event(event)


@router.put("/{event_id}")
def update_event(
    event_id: str,
    data: EventUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    payload = data.model_dump(exclude_unset=True)
    if "district_ubigeo" in payload:
        payload["region_code"] = _validate_district(payload.pop("district_ubigeo"))
    for k, v in payload.items():
        setattr(event, k, v)
    db.commit()
    db.refresh(event)
    return _serialize_event(event)


@router.delete("/{event_id}")
def delete_event(event_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    db.query(Task).filter(Task.event_id == event_id).delete()
    db.delete(event)
    db.commit()
    return {"detail": "Evento eliminado"}


@router.get("/volunteers")
def list_volunteers(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Volunteer).order_by(Volunteer.created_at.desc()).limit(500).all()
    return {"volunteers": [{
        "id": v.id, "name": v.name, "phone": v.phone, "email": v.email,
        "district_ubigeo": v.region_code, "status": v.status,
    } for v in rows]}


@router.post("/volunteers")
def create_volunteer(
    data: VolunteerCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tenant_id, _ = _context(db)
    _validate_district(data.district_ubigeo)
    v = Volunteer(id=str(uuid.uuid4()), tenant_id=tenant_id, name=data.name, phone=data.phone,
                  email=data.email, region_code=data.district_ubigeo, status="active")
    db.add(v)
    db.commit()
    return {"id": v.id, "name": v.name}


@router.put("/tasks/{task_id}")
def update_task(
    task_id: str,
    data: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    payload = data.model_dump(exclude_unset=True)
    if payload.get("status") and payload["status"] not in TASK_STATUS:
        raise HTTPException(status_code=400, detail=f"Estado invalido. Validos: {', '.join(TASK_STATUS)}")
    if payload.get("priority") and payload["priority"] not in TASK_PRIORITY:
        raise HTTPException(status_code=400, detail=f"Prioridad invalida. Validas: {', '.join(TASK_PRIORITY)}")
    for k, v in payload.items():
        setattr(task, k, v)
    db.commit()
    return {"id": task.id, "status": task.status, "priority": task.priority, "title": task.title}


@router.get("/{event_id}/tasks")
def list_tasks(event_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Task).filter(Task.event_id == event_id).order_by(Task.created_at).all()
    return {"tasks": [{
        "id": t.id, "title": t.title, "status": t.status, "priority": t.priority,
        "due_date": t.due_date.isoformat() if t.due_date else None, "description": t.description,
    } for t in rows]}


@router.post("/{event_id}/tasks")
def create_task(
    event_id: str,
    data: TaskCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if data.priority not in TASK_PRIORITY:
        raise HTTPException(status_code=400, detail=f"Prioridad invalida. Validas: {', '.join(TASK_PRIORITY)}")
    tenant_id, campaign_id = _context(db)
    t = Task(id=str(uuid.uuid4()), tenant_id=tenant_id, campaign_id=campaign_id, event_id=event_id,
             title=data.title, status="todo", priority=data.priority, due_date=data.due_date,
             description=data.description, assigned_user_id=data.assigned_user_id)
    db.add(t)
    db.commit()
    return {"id": t.id, "title": t.title, "status": t.status}


@router.get("/{event_id}/impact")
def get_event_impact(
    event_id: str,
    figure_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if not event.region_code:
        raise HTTPException(status_code=400, detail="El evento no tiene distrito asignado")
    return territory.event_impact(db, event, figure_id)
