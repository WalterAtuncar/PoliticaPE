from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import FastAPI, Request, Response
from fastapi.responses import PlainTextResponse
import time
from typing import Callable

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Number of active connections'
)

SCRAPING_TASKS = Counter(
    'scraping_tasks_total',
    'Total scraping tasks',
    ['source', 'status']
)

DATABASE_CONNECTIONS = Gauge(
    'database_connections_active',
    'Number of active database connections'
)

def setup_metrics(app: FastAPI):
    """Setup Prometheus metrics for FastAPI app"""
    
    @app.get("/metrics", response_class=PlainTextResponse)
    async def get_metrics():
        """Prometheus metrics endpoint"""
        return generate_latest()

async def metrics_middleware(request: Request, call_next: Callable) -> Response:
    """Middleware to collect HTTP metrics"""
    
    start_time = time.time()
    ACTIVE_CONNECTIONS.inc()
    
    try:
        response = await call_next(request)
        
        # Record metrics
        duration = time.time() - start_time
        
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status_code=response.status_code
        ).inc()
        
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        return response
        
    finally:
        ACTIVE_CONNECTIONS.dec()

def record_scraping_task(source: str, status: str):
    """Record scraping task metrics"""
    SCRAPING_TASKS.labels(source=source, status=status).inc()

def update_database_connections(count: int):
    """Update database connection count"""
    DATABASE_CONNECTIONS.set(count)