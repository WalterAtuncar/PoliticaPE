from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
import uuid

from app.database import get_db
from app.api.deps import get_current_user
from app.models import SocialApiToken, SearchTag
from app.schemas import (
    SocialApiTokenCreate,
    SocialApiTokenUpdate,
    SocialApiTokenResponse,
    PlatformInfo,
    PLATFORM_CREDENTIAL_FIELDS,
    SearchTagCreate,
    SearchTagUpdate,
    SearchTagResponse,
)

router = APIRouter()

PLATFORM_DISPLAY_NAMES = {
    "twitter": "Twitter / X",
    "youtube": "YouTube",
    "instagram": "Instagram",
    "facebook": "Facebook",
    "tiktok": "TikTok",
}


def mask_credentials(creds: dict) -> dict:
    masked = {}
    for key, value in creds.items():
        if isinstance(value, str) and len(value) > 8:
            masked[key] = value[:4] + "****" + value[-4:]
        elif isinstance(value, str) and len(value) > 0:
            masked[key] = "****"
        else:
            masked[key] = ""
    return masked


def token_to_response(token: SocialApiToken) -> dict:
    creds = token.credentials if isinstance(token.credentials, dict) else {}
    return {
        "id": token.id,
        "platform": token.platform,
        "label": token.label,
        "credentials_masked": mask_credentials(creds),
        "is_active": token.is_active,
        "status": token.status or "active",
        "last_used_at": token.last_used_at,
        "last_error": token.last_error,
        "created_at": token.created_at,
        "updated_at": token.updated_at,
    }


@router.get("/platforms", response_model=List[PlatformInfo])
def get_platforms(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    platforms = []
    for platform, fields in PLATFORM_CREDENTIAL_FIELDS.items():
        total = db.query(func.count(SocialApiToken.id)).filter(
            SocialApiToken.platform == platform
        ).scalar() or 0
        active = db.query(func.count(SocialApiToken.id)).filter(
            SocialApiToken.platform == platform,
            SocialApiToken.is_active == True
        ).scalar() or 0
        platforms.append(PlatformInfo(
            platform=platform,
            display_name=PLATFORM_DISPLAY_NAMES.get(platform, platform),
            credential_fields=fields,
            token_count=total,
            active_count=active,
        ))
    return platforms


@router.get("/tokens", response_model=List[SocialApiTokenResponse])
def list_tokens(platform: str = None, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(SocialApiToken).order_by(SocialApiToken.created_at.desc())
    if platform:
        query = query.filter(SocialApiToken.platform == platform)
    tokens = query.all()
    return [token_to_response(t) for t in tokens]


@router.post("/tokens", response_model=SocialApiTokenResponse)
def create_token(data: SocialApiTokenCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.platform not in PLATFORM_CREDENTIAL_FIELDS:
        raise HTTPException(status_code=400, detail=f"Plataforma no soportada: {data.platform}")

    required_fields = PLATFORM_CREDENTIAL_FIELDS[data.platform]
    for field_key, field_label in required_fields.items():
        if "opcional" not in field_label.lower():
            if not data.credentials.get(field_key):
                raise HTTPException(
                    status_code=400,
                    detail=f"Campo requerido: {field_label} ({field_key})"
                )

    token = SocialApiToken(
        id=str(uuid.uuid4()),
        platform=data.platform,
        label=data.label,
        credentials=data.credentials,
        is_active=data.is_active,
        status="active",
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token_to_response(token)


@router.put("/tokens/{token_id}", response_model=SocialApiTokenResponse)
def update_token(token_id: str, data: SocialApiTokenUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    token = db.query(SocialApiToken).filter(SocialApiToken.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token no encontrado")

    if data.label is not None:
        token.label = data.label
    if data.credentials is not None:
        token.credentials = data.credentials
    if data.is_active is not None:
        token.is_active = data.is_active
    token.updated_at = datetime.now()

    db.commit()
    db.refresh(token)
    return token_to_response(token)


@router.delete("/tokens/{token_id}")
def delete_token(token_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    token = db.query(SocialApiToken).filter(SocialApiToken.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token no encontrado")
    db.delete(token)
    db.commit()
    return {"message": "Token eliminado correctamente"}


@router.post("/tokens/{token_id}/test")
async def test_token(token_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    token = db.query(SocialApiToken).filter(SocialApiToken.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token no encontrado")

    creds = token.credentials if isinstance(token.credentials, dict) else {}
    result = {"success": False, "message": "Plataforma no soportada para prueba"}

    try:
        if token.platform == "twitter":
            from app.services.scrapers.twitterapi_io_scraper import TwitterAPIioScraper
            scraper = TwitterAPIioScraper(api_key=creds.get("api_key"))
            test_result = await scraper.test_connection()
            result = test_result

        elif token.platform == "youtube":
            from app.services.scrapers.youtube_scraper import YouTubeScraper
            scraper = YouTubeScraper(api_key=creds.get("api_key"))
            test_result = await scraper.test_connection()
            result = test_result

        elif token.platform == "instagram":
            from app.services.scrapers.instagram_scraper import InstagramScraper
            scraper = InstagramScraper(access_token=creds.get("access_token"))
            test_result = await scraper.test_connection()
            result = test_result

        elif token.platform == "facebook":
            import httpx
            access_token = creds.get("access_token", "")
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://graph.facebook.com/v18.0/me?access_token={access_token}",
                    timeout=10.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    result = {"success": True, "message": f"Conectado como: {data.get('name', 'OK')}"}
                else:
                    result = {"success": False, "message": f"Error: {resp.status_code}"}

        elif token.platform == "tiktok":
            result = {"success": True, "message": "TikTok: validación básica OK (credenciales guardadas)"}

    except Exception as e:
        result = {"success": False, "message": str(e)}

    token.last_used_at = datetime.now()
    if result.get("success"):
        token.status = "active"
        token.last_error = None
    else:
        token.status = "error"
        token.last_error = result.get("message", "Error desconocido")
    
    db.commit()
    return result


@router.get("/tags", response_model=List[SearchTagResponse])
def list_tags(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    tags = db.query(SearchTag).order_by(SearchTag.created_at.desc()).all()
    return tags


@router.post("/tags", response_model=SearchTagResponse)
def create_tag(data: SearchTagCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    tag_text = data.tag.strip().lower()
    if not tag_text:
        raise HTTPException(status_code=400, detail="El tag no puede estar vacío")

    existing = db.query(SearchTag).filter(SearchTag.tag == tag_text).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"El tag '{tag_text}' ya existe")

    valid_platforms = ["twitter", "youtube", "instagram", "facebook", "tiktok"]
    platforms = [p for p in data.platforms if p in valid_platforms]
    if not platforms:
        platforms = ["twitter", "youtube", "instagram"]

    tag = SearchTag(
        id=str(uuid.uuid4()),
        tag=tag_text,
        platforms=platforms,
        is_active=data.is_active,
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.put("/tags/{tag_id}", response_model=SearchTagResponse)
def update_tag(tag_id: str, data: SearchTagUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    tag = db.query(SearchTag).filter(SearchTag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag no encontrado")

    if data.tag is not None:
        new_tag = data.tag.strip().lower()
        if not new_tag:
            raise HTTPException(status_code=400, detail="El tag no puede estar vacío")
        existing = db.query(SearchTag).filter(SearchTag.tag == new_tag, SearchTag.id != tag_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"El tag '{new_tag}' ya existe")
        tag.tag = new_tag
    if data.platforms is not None:
        valid_platforms = ["twitter", "youtube", "instagram", "facebook", "tiktok"]
        tag.platforms = [p for p in data.platforms if p in valid_platforms]
    if data.is_active is not None:
        tag.is_active = data.is_active
    tag.updated_at = datetime.now()

    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/tags/{tag_id}")
def delete_tag(tag_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    tag = db.query(SearchTag).filter(SearchTag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag no encontrado")
    db.delete(tag)
    db.commit()
    return {"message": "Tag eliminado correctamente"}
