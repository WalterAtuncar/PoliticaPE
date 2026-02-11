from fastapi import FastAPI, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
from loguru import logger
import sys
import os
import httpx
import websockets
import asyncio

from app.config import settings
from app.database import init_db
from app.api import api_router
from app.monitoring import setup_metrics, metrics_middleware
from app.utils.logging import setup_logging

FRONTEND_DIST_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "project-react", "dist")
SNIFFING_URL = os.getenv("SNIFFING_URL", "http://localhost:8080")
SNIFFING_WS_URL = os.getenv("SNIFFING_WS_URL", "ws://localhost:8080")
SERVE_FRONTEND = os.getenv("SERVE_FRONTEND", "false").lower() == "true"

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

def init_identity_schema():
    """Create identity schema and tables if they don't exist"""
    from sqlalchemy import text
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        db.execute(text("CREATE SCHEMA IF NOT EXISTS identity"))
        db.commit()
        
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS identity.tenants (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """))
        db.commit()
        
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS identity.users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255),
                password_hash VARCHAR(255) NOT NULL,
                tenant_id UUID REFERENCES identity.tenants(id),
                is_active BOOLEAN DEFAULT TRUE,
                last_login_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """))
        db.commit()
        
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS identity.roles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """))
        db.commit()
        
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS identity.user_roles (
                user_id UUID REFERENCES identity.users(id),
                role_id UUID REFERENCES identity.roles(id),
                tenant_id UUID REFERENCES identity.tenants(id),
                PRIMARY KEY (user_id, role_id)
            )
        """))
        db.commit()
        
        logger.info("Identity schema initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing identity schema: {e}")
        db.rollback()
    finally:
        db.close()

def create_demo_user():
    """Create demo user if it doesn't exist"""
    import bcrypt
    from sqlalchemy import text
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        existing = db.execute(
            text("SELECT id FROM identity.users WHERE email = 'admin@politica.pe'")
        ).fetchone()
        
        if not existing:
            password_hash = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            tenant = db.execute(text("SELECT id FROM identity.tenants LIMIT 1")).fetchone()
            tenant_id = tenant[0] if tenant else None
            
            if not tenant_id:
                has_status = db.execute(text("""
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_schema='identity' AND table_name='tenants' AND column_name='status'
                """)).fetchone()
                
                if has_status:
                    db.execute(text("""
                        INSERT INTO identity.tenants (name, slug, status, created_at)
                        VALUES ('PoliticaPE', 'politicape', 'active', NOW())
                    """))
                else:
                    db.execute(text("""
                        INSERT INTO identity.tenants (name, slug, is_active, created_at)
                        VALUES ('PoliticaPE', 'politicape', true, NOW())
                    """))
                db.commit()
                tenant = db.execute(text("SELECT id FROM identity.tenants LIMIT 1")).fetchone()
                tenant_id = tenant[0] if tenant else None
            
            if not tenant_id:
                logger.error("Could not create tenant for demo user")
                return
            
            has_role_tenant = db.execute(text("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_schema='identity' AND table_name='roles' AND column_name='tenant_id'
            """)).fetchone()
            
            admin_role = db.execute(text("SELECT id FROM identity.roles WHERE name = 'admin' LIMIT 1")).fetchone()
            if not admin_role:
                if has_role_tenant:
                    db.execute(text("INSERT INTO identity.roles (name, description, tenant_id) VALUES ('admin', 'Administrator', :tid)"), {"tid": tenant_id})
                    db.execute(text("INSERT INTO identity.roles (name, description, tenant_id) VALUES ('analyst', 'Analyst', :tid)"), {"tid": tenant_id})
                else:
                    db.execute(text("INSERT INTO identity.roles (name, description) VALUES ('admin', 'Administrator')"))
                    db.execute(text("INSERT INTO identity.roles (name, description) VALUES ('analyst', 'Analyst')"))
                db.commit()
                admin_role = db.execute(text("SELECT id FROM identity.roles WHERE name = 'admin' LIMIT 1")).fetchone()
            
            result = db.execute(
                text("""
                    INSERT INTO identity.users (email, name, password_hash, tenant_id, is_active, created_at)
                    VALUES ('admin@politica.pe', 'Administrador', :password_hash, :tenant_id, true, NOW())
                    RETURNING id
                """),
                {"password_hash": password_hash, "tenant_id": tenant_id}
            ).fetchone()
            
            if result and admin_role and tenant_id:
                db.execute(
                    text("INSERT INTO identity.user_roles (user_id, role_id, tenant_id) VALUES (:user_id, :role_id, :tenant_id)"),
                    {"user_id": result[0], "role_id": admin_role[0], "tenant_id": tenant_id}
                )
            
            db.commit()
            logger.info("Demo user created: admin@politica.pe")
        else:
            logger.info("Demo user already exists")
    except Exception as e:
        logger.error(f"Error creating demo user: {e}")
        db.rollback()
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Initialize database
    init_db()
    logger.info("Database initialized")
    
    init_identity_schema()
    create_demo_user()
    
    from app.services.scheduler import start_scheduler
    start_scheduler()
    logger.info("Scheduled scraping enabled")
    
    logger.info("Application startup completed")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    from app.services.scheduler import stop_scheduler
    stop_scheduler()
    logger.info("Shutting down application")

@app.get("/healthz")
async def healthz():
    """Health check endpoint for deployment"""
    return {"status": "ok"}

@app.get("/")
async def root():
    """Root endpoint - serves SPA in production or service info in dev"""
    if SERVE_FRONTEND and os.path.exists(os.path.join(FRONTEND_DIST_PATH, "index.html")):
        return FileResponse(os.path.join(FRONTEND_DIST_PATH, "index.html"))
    
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
    return HTMLResponse(content=html_content)

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

@app.api_route("/api/metrics", methods=["GET"])
async def proxy_metrics():
    """Proxy to sniffing service metrics"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SNIFFING_URL}/api/metrics", timeout=10.0)
            return JSONResponse(content=response.json(), status_code=response.status_code)
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        logger.error(f"Sniffing service unavailable: {e}")
        return JSONResponse(content={"active_streams": 0, "processed_count": 0, "avg_sentiment": 0.0, "crisis_alerts": 0, "trending_topics": 0, "processing_rate": 0.0}, status_code=200)
    except Exception as e:
        logger.error(f"Error proxying to sniffing: {e}")
        return JSONResponse(content={"error": "Proxy error"}, status_code=502)

@app.api_route("/api/analyze", methods=["POST"])
async def proxy_analyze(request: Request):
    """Proxy to sniffing service analyze"""
    try:
        body = await request.json()
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{SNIFFING_URL}/api/analyze", json=body, timeout=10.0)
            return JSONResponse(content=response.json(), status_code=response.status_code)
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        logger.error(f"Sniffing service unavailable: {e}")
        raise HTTPException(status_code=503, detail="Sniffing service unavailable")
    except Exception as e:
        logger.error(f"Error proxying to sniffing: {e}")
        raise HTTPException(status_code=502, detail="Proxy error")

@app.api_route("/api/recent", methods=["GET"])
async def proxy_recent(request: Request):
    """Proxy to sniffing service recent items"""
    try:
        params = dict(request.query_params)
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SNIFFING_URL}/api/recent", params=params, timeout=10.0)
            return JSONResponse(content=response.json(), status_code=response.status_code)
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        logger.error(f"Sniffing service unavailable: {e}")
        return JSONResponse(content={"recent_items": [], "total": 0}, status_code=200)
    except Exception as e:
        logger.error(f"Error proxying to sniffing: {e}")
        return JSONResponse(content={"error": "Proxy error"}, status_code=502)

@app.api_route("/api/crisis-alerts", methods=["GET"])
async def proxy_crisis_alerts():
    """Proxy to sniffing service crisis alerts"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SNIFFING_URL}/api/crisis-alerts", timeout=10.0)
            return JSONResponse(content=response.json(), status_code=response.status_code)
    except (httpx.ConnectError, httpx.TimeoutException) as e:
        logger.error(f"Sniffing service unavailable: {e}")
        return JSONResponse(content={"crisis_alerts": [], "total": 0}, status_code=200)
    except Exception as e:
        logger.error(f"Error proxying to sniffing: {e}")
        return JSONResponse(content={"error": "Proxy error"}, status_code=502)

@app.websocket("/ws/stream")
async def proxy_websocket(websocket: WebSocket):
    """Proxy WebSocket to sniffing service"""
    await websocket.accept()
    try:
        async with websockets.connect(f"{SNIFFING_WS_URL}/ws/stream") as ws_upstream:
            async def receive_from_client():
                while True:
                    try:
                        data = await websocket.receive_text()
                        await ws_upstream.send(data)
                    except WebSocketDisconnect:
                        break
                    except Exception:
                        break
            
            async def receive_from_upstream():
                while True:
                    try:
                        data = await ws_upstream.recv()
                        await websocket.send_text(data)
                    except Exception:
                        break
            
            await asyncio.gather(receive_from_client(), receive_from_upstream())
    except Exception as e:
        logger.error(f"WebSocket proxy error: {e}")
        try:
            await websocket.close()
        except:
            pass

if SERVE_FRONTEND and os.path.exists(FRONTEND_DIST_PATH):
    assets_path = os.path.join(FRONTEND_DIST_PATH, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve SPA for all non-API routes"""
        if full_path.startswith("api/") or full_path.startswith("ws/"):
            raise HTTPException(status_code=404, detail="Not found")
        file_path = os.path.join(FRONTEND_DIST_PATH, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST_PATH, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
