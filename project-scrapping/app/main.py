from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import asyncio

FRONTEND_DIST_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "project-react", "dist")
SNIFFING_URL = os.getenv("SNIFFING_URL", "http://localhost:8080")
SNIFFING_WS_URL = os.getenv("SNIFFING_WS_URL", "ws://localhost:8080")
SERVE_FRONTEND = os.getenv("SERVE_FRONTEND", "false").lower() == "true"

app = FastAPI(
    title="Political Data Scraper",
    description="Comprehensive political data scraping and analysis microservice",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    if SERVE_FRONTEND:
        index_path = os.path.join(FRONTEND_DIST_PATH, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
    return JSONResponse(content={"status": "ok", "service": "Political Data Scraper", "version": "1.0.0"}, status_code=200)


@app.get("/healthz")
async def healthz():
    return JSONResponse(content={"status": "ok"}, status_code=200)


@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "healthy", "service": "Political Data Scraper", "version": "1.0.0"}, status_code=200)


_initialized = False


def _sync_heavy_init():
    global _initialized
    if _initialized:
        return

    from loguru import logger
    from app.config import settings
    from app.database import init_db

    try:
        init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"DB init error: {e}")

    try:
        _init_identity_schema()
        _create_demo_user()
    except Exception as e:
        logger.error(f"Identity init error: {e}")

    _initialized = True


def _init_identity_schema():
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
    except Exception as e:
        db.rollback()
        from loguru import logger
        logger.error(f"Error initializing identity schema: {e}")
    finally:
        db.close()


def _create_demo_user():
    import bcrypt
    from sqlalchemy import text
    from app.database import SessionLocal
    from loguru import logger

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


async def _deferred_init():
    await asyncio.sleep(1)
    from loguru import logger

    try:
        await asyncio.to_thread(_sync_heavy_init)
        logger.info("Heavy initialization completed")
    except Exception as e:
        logger.error(f"Deferred init error: {e}")

    try:
        from slowapi import Limiter, _rate_limit_exceeded_handler
        from slowapi.util import get_remote_address
        from slowapi.errors import RateLimitExceeded
        limiter = Limiter(key_func=get_remote_address)
        app.state.limiter = limiter
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    except Exception as e:
        logger.error(f"Rate limiter error: {e}")

    try:
        from app.api import api_router
        app.include_router(api_router, prefix="/api/v1")
        logger.info("API routes loaded")
    except Exception as e:
        logger.error(f"API router error: {e}")

    try:
        from app.monitoring import setup_metrics, metrics_middleware
        from app.config import settings
        if settings.PROMETHEUS_ENABLED:
            setup_metrics(app)
        logger.info("Monitoring configured")
    except Exception as e:
        logger.error(f"Monitoring error: {e}")

    if SERVE_FRONTEND and os.path.exists(FRONTEND_DIST_PATH):
        try:
            assets_path = os.path.join(FRONTEND_DIST_PATH, "assets")
            if os.path.exists(assets_path):
                app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
            logger.info("Frontend static files mounted")
        except Exception as e:
            logger.error(f"Static files error: {e}")

    try:
        from app.services.scheduler import start_scheduler
        start_scheduler()
        logger.info("Scheduled scraping enabled")
    except Exception as e:
        logger.error(f"Scheduler error: {e}")

    _setup_proxy_routes()
    logger.info("Application fully initialized")


def _setup_proxy_routes():
    import httpx
    import websockets
    from loguru import logger

    @app.api_route("/api/metrics", methods=["GET"])
    async def proxy_metrics():
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{SNIFFING_URL}/api/metrics", timeout=10.0)
                return JSONResponse(content=response.json(), status_code=response.status_code)
        except (httpx.ConnectError, httpx.TimeoutException):
            return JSONResponse(content={"active_streams": 0, "processed_count": 0, "avg_sentiment": 0.0, "crisis_alerts": 0, "trending_topics": 0, "processing_rate": 0.0}, status_code=200)
        except Exception:
            return JSONResponse(content={"error": "Proxy error"}, status_code=502)

    @app.api_route("/api/analyze", methods=["POST"])
    async def proxy_analyze(request: Request):
        try:
            body = await request.json()
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{SNIFFING_URL}/api/analyze", json=body, timeout=10.0)
                return JSONResponse(content=response.json(), status_code=response.status_code)
        except (httpx.ConnectError, httpx.TimeoutException):
            raise HTTPException(status_code=503, detail="Sniffing service unavailable")
        except Exception:
            raise HTTPException(status_code=502, detail="Proxy error")

    @app.api_route("/api/recent", methods=["GET"])
    async def proxy_recent(request: Request):
        try:
            params = dict(request.query_params)
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{SNIFFING_URL}/api/recent", params=params, timeout=10.0)
                return JSONResponse(content=response.json(), status_code=response.status_code)
        except (httpx.ConnectError, httpx.TimeoutException):
            return JSONResponse(content={"recent_items": [], "total": 0}, status_code=200)
        except Exception:
            return JSONResponse(content={"error": "Proxy error"}, status_code=502)

    @app.api_route("/api/crisis-alerts", methods=["GET"])
    async def proxy_crisis_alerts():
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{SNIFFING_URL}/api/crisis-alerts", timeout=10.0)
                return JSONResponse(content=response.json(), status_code=response.status_code)
        except (httpx.ConnectError, httpx.TimeoutException):
            return JSONResponse(content={"crisis_alerts": [], "total": 0}, status_code=200)
        except Exception:
            return JSONResponse(content={"error": "Proxy error"}, status_code=502)

    @app.websocket("/ws/stream")
    async def proxy_websocket(websocket: WebSocket):
        await websocket.accept()
        try:
            async with websockets.connect(f"{SNIFFING_WS_URL}/ws/stream") as ws_upstream:
                async def receive_from_client():
                    while True:
                        try:
                            data = await websocket.receive_text()
                            await ws_upstream.send(data)
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
            except Exception:
                pass

    @app.get("/rapidoc", response_class=HTMLResponse)
    async def rapidoc():
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Political Data Scraper API Explorer</title>
            <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
        </head>
        <body>
            <rapi-doc spec-url="/openapi.json" theme="light" render-style="read"
              show-header="true" heading-text="Political Data Scraper"
              allow-authentication="true" use-path-in-nav-bar="true"></rapi-doc>
        </body>
        </html>
        """


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(_deferred_init())


@app.on_event("shutdown")
async def shutdown_event():
    try:
        from app.services.scheduler import stop_scheduler
        stop_scheduler()
    except Exception:
        pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
