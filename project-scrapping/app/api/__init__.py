from fastapi import APIRouter
from app.api.endpoints import data, scraping, analysis, auth, campaigns, competitors, settings, political_figures, recommendations, electoral, territory, race, alerts, events

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(data.router, prefix="/data", tags=["data"])
api_router.include_router(scraping.router, prefix="/scraping", tags=["scraping"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(competitors.router, prefix="/competitors", tags=["competitors"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(political_figures.router, prefix="/political-figures", tags=["political-figures"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(electoral.router, prefix="/electoral", tags=["electoral"])
api_router.include_router(territory.router, prefix="/territory", tags=["territory"])
api_router.include_router(race.router, prefix="/race", tags=["race"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(events.router, prefix="/events", tags=["events"])