from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
from loguru import logger
import sys

from app.config import settings
from app.database import init_db
from app.api import api_router
from app.monitoring import setup_metrics, metrics_middleware
from app.utils.logging import setup_logging

# Setup logging
setup_logging()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Comprehensive political data scraping and analysis microservice",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Setup rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Metrics middleware
if settings.PROMETHEUS_ENABLED:
    setup_metrics(app)
    app.middleware("http")(metrics_middleware)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/rapidoc", response_class=HTMLResponse)
async def rapidoc():
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset=\"utf-8\" />
        <title>{settings.APP_NAME} API Explorer</title>
        <script type=\"module\" src=\"https://unpkg.com/rapidoc/dist/rapidoc-min.js\"></script>
        <style> body {{ margin: 0; font-family: Arial, sans-serif; }} </style>
    </head>
    <body>
        <rapi-doc
          spec-url=\"/openapi.json\"
          theme=\"light\"
          render-style=\"read\"
          show-header=\"true\"
          heading-text=\"{settings.APP_NAME}\" 
          allow-authentication=\"true\"
          use-path-in-nav-bar=\"true\"
        ></rapi-doc>
    </body>
    </html>
    """
    return html_content

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Initialize database
    init_db()
    logger.info("Database initialized")
    
    logger.info("Application startup completed")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("Shutting down application")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with service information"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{settings.APP_NAME}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }}
            .container {{ background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
            .header {{ color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 20px; }}
            .status {{ background: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; }}
            .links {{ display: flex; gap: 20px; margin-top: 20px; }}
            .link {{ background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }}
            .link:hover {{ background: #2980b9; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{settings.APP_NAME}</h1>
                <p>Version {settings.VERSION} | Environment: {settings.ENVIRONMENT}</p>
            </div>
            <div class="status">
                <h3>🟢 Service Status: Active</h3>
                <p>Political data scraping and analysis microservice is running</p>
            </div>
            <div class="links">
                <a href="/docs" class="link">📚 API Documentation</a>
                <a href="/health" class="link">🔍 Health Check</a>
                <a href="/api/v1/stats" class="link">📊 Statistics</a>
                <a href="/metrics" class="link">📈 Metrics</a>
            </div>
        </div>
    </body>
    </html>
    """
    return html_content

@app.get("/health")
@limiter.limit(f"{settings.RATE_LIMIT_CALLS}/minute")
async def health_check(request: Request):
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
