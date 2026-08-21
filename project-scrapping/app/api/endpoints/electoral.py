from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app import electoral_config

router = APIRouter()


@router.get("/config")
def get_electoral_config(current_user: dict = Depends(get_current_user)):
    return electoral_config.as_dict()
