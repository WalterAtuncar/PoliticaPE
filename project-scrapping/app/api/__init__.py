from fastapi import APIRouter
from app.api.endpoints import data, scraping, analysis, auth, campaigns, competitors, settings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(data.router, prefix="/data", tags=["data"])
api_router.include_router(scraping.router, prefix="/scraping", tags=["scraping"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(competitors.router, prefix="/competitors", tags=["competitors"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])