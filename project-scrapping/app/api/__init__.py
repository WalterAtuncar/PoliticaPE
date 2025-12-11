from fastapi import APIRouter
from app.api.endpoints import data, scraping, analysis, auth

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(data.router, prefix="/data", tags=["data"])
api_router.include_router(scraping.router, prefix="/scraping", tags=["scraping"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])