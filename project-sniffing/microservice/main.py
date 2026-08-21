"""
Microservicio de Análisis de Datos Políticos en Tiempo Real
Versión simplificada sin dependencias pesadas (Kafka, Redis, ML)
"""

import asyncio
import json
import logging
import os
import uuid
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine, Column, String, Float, Boolean, Integer, DateTime, Text, JSON, text
from sqlalchemy.orm import sessionmaker, declarative_base
import uvicorn

# Configuración
class Settings(BaseSettings):
    """Configuración de la aplicación usando variables de entorno"""
    database_url: str = os.getenv("DATABASE_URL", "postgresql://localhost:5432/politiscope_db")
    log_level: str = "INFO"
    port: int = int(os.getenv("PORT", "8080"))
    batch_size: int = 100
    processing_interval: int = 5

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        extra="ignore"
    )

settings = Settings()

# Database setup
DATABASE_URL = settings.database_url
if DATABASE_URL.startswith("postgresql://"):
    # SQLAlchemy needs postgresql+psycopg2://
    pass  # psycopg2 handles postgresql:// fine

engine = create_engine(DATABASE_URL, pool_size=5, max_overflow=10, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Configurar logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Métricas

# Metrics - Try/Except to prevent duplication errors on reload
from prometheus_client import REGISTRY


# Metrics - Try/Except to prevent duplication errors on reload
from prometheus_client import REGISTRY


# Metrics - Unregister first to allow reload
from prometheus_client import REGISTRY

def unregister_if_exists(name):
    if name in REGISTRY._names_to_collectors:
        REGISTRY.unregister(REGISTRY._names_to_collectors[name])

unregister_if_exists('political_streams_total')
stream_counter = Counter('political_streams_total', 'Total de flujos de datos políticos procesados')

unregister_if_exists('political_sentiment_current')
sentiment_gauge = Gauge('political_sentiment_current', 'Sentimiento político actual', ['entity'])

unregister_if_exists('political_processing_seconds')
processing_time = Histogram('political_processing_seconds', 'Tiempo de procesamiento de datos')

unregister_if_exists('sentiment_analysis_duration_seconds')
sentiment_histogram = Histogram('sentiment_analysis_duration_seconds', 'Tiempo empleado en análisis de sentimiento')

unregister_if_exists('websocket_connections_active')
active_connections = Gauge('websocket_connections_active', 'Conexiones WebSocket activas')



# Database Model
class LiveStreamRecord(Base):
    __tablename__ = "live_streams"
    __table_args__ = {"schema": "realtime_data"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    stream_id = Column(String, nullable=False, index=True)
    platform = Column(String, nullable=False)
    stream_type = Column(String)
    content = Column(Text)
    author_handle = Column(String)
    author_name = Column(String)
    realtime_sentiment = Column(Float)
    sentiment_confidence = Column(Float)
    political_relevance_score = Column(Float)
    urgency_score = Column(Float)
    is_trending = Column(Boolean, default=False)
    is_crisis_indicator = Column(Boolean, default=False)
    is_opportunity = Column(Boolean, default=False)
    detected_region = Column(String)
    detected_keywords = Column(JSON)
    political_entities = Column(JSON)
    hashtags = Column(JSON)
    processing_latency_ms = Column(Integer)
    message_timestamp = Column(DateTime)
    created_at = Column(DateTime, server_default=text("NOW()"))

# Modelos
class LiveStreamData(BaseModel):
    stream_id: str
    platform: str
    stream_type: str
    content: str
    content_type: str = 'text'
    author_handle: Optional[str] = None
    author_name: Optional[str] = None
    immediate_likes: int = 0
    immediate_shares: int = 0
    immediate_comments: int = 0
    realtime_sentiment: float
    sentiment_confidence: float
    political_relevance_score: float
    urgency_score: float
    is_trending: bool = False
    is_crisis_indicator: bool = False
    is_opportunity: bool = False
    detected_region: Optional[str] = None
    location_confidence: Optional[float] = None
    detected_keywords: List[str] = []
    political_entities: List[str] = []
    hashtags: List[str] = []
    processing_latency_ms: int
    message_timestamp: datetime

class StreamMetrics(BaseModel):
    active_streams: int
    processed_count: int
    avg_sentiment: float
    crisis_alerts: int
    trending_topics: int
    processing_rate: float

class AnalyzeRequest(BaseModel):
    text: str
    platform: str = "manual"

# Gestor de Conexiones WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        active_connections.inc()
        logger.info(f"Nueva conexión WebSocket. Total: {len(self.active_connections)}")
        
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        active_connections.dec()
        logger.info(f"Conexión WebSocket cerrada. Total: {len(self.active_connections)}")
        
    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
            
        disconnected = set()
        for connection in self.active_connections.copy():
            try:
                await connection.send_text(json.dumps(message, default=str))
            except Exception as e:
                logger.warning(f"Error enviando mensaje WebSocket: {e}")
                disconnected.add(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

# Analizador de Sentimiento Simplificado
class SentimentAnalyzer:
    def __init__(self):
        self.positive_words = [
            'progreso', 'desarrollo', 'mejora', 'éxito', 'crecimiento', 
            'esperanza', 'futuro', 'oportunidad', 'logro', 'avance',
            'bien', 'bueno', 'excelente', 'positivo', 'ganancia'
        ]
        self.negative_words = [
            'crisis', 'corrupción', 'problema', 'conflicto', 'protesta', 
            'violencia', 'caos', 'fracaso', 'mal', 'malo',
            'pérdida', 'negativo', 'escándalo', 'renuncia', 'derrota'
        ]
        self.political_terms = [
            'congreso', 'presidente', 'gobierno', 'elecciones', 'política', 'ministro',
            'dina boluarte', 'castillo', 'keiko', 'antauro', 'reforma', 'ley',
            'parlamento', 'senado', 'diputado', 'alcalde', 'gobernador', 'sunat',
            'onpe', 'jne', 'poder judicial', 'fiscalía', 'contraloría'
        ]
        self.urgent_terms = [
            'urgente', 'inmediato', 'ahora', 'crisis', 'emergencia', 'alerta',
            'breaking', 'último momento', 'importante', 'grave', 'atención'
        ]
        self.political_entities = [
            'Dina Boluarte', 'Pedro Castillo', 'Keiko Fujimori', 'Antauro Humala',
            'Congreso', 'PCM', 'Mininter', 'Sunat', 'BCR', 'ONPE', 'JNE',
            'Fuerza Popular', 'Perú Libre', 'Acción Popular', 'APP'
        ]
        self.regions = {
            'lima': 'LIM', 'arequipa': 'ARE', 'cusco': 'CUS', 'trujillo': 'LAL',
            'piura': 'PIU', 'iquitos': 'LOR', 'huancayo': 'JUN', 'chiclayo': 'LAM',
            'puno': 'PUN', 'tacna': 'TAC', 'ayacucho': 'AYA', 'cajamarca': 'CAJ'
        }
        
    @sentiment_histogram.time()
    async def analyze_content(self, text: str) -> Dict:
        """Analizar contenido completo"""
        start_time = datetime.now()
        
        text_lower = text.lower()
        
        # Análisis de sentimiento
        sentiment_score = self._calculate_sentiment(text_lower)
        sentiment_confidence = 0.7 + (abs(sentiment_score) * 0.3)
        
        # Análisis de relevancia política
        political_relevance = self._calculate_political_relevance(text_lower)
        
        # Análisis de urgencia
        urgency_score = self._calculate_urgency(text_lower)
        
        # Detección de entidades políticas
        political_entities = self._extract_political_entities(text)
        
        # Extracción de palabras clave
        keywords = self._extract_keywords(text_lower)
        
        # Extracción de hashtags
        hashtags = self._extract_hashtags(text)
        
        # Detección de eventos
        is_trending = len(keywords) >= 3
        is_crisis = self._detect_crisis(text_lower, sentiment_score, urgency_score)
        is_opportunity = self._detect_opportunity(text_lower, sentiment_score, political_relevance)
        
        # Detección geográfica
        detected_region = self._detect_region(text_lower)
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            "realtime_sentiment": sentiment_score,
            "sentiment_confidence": sentiment_confidence,
            "political_relevance_score": political_relevance,
            "urgency_score": urgency_score,
            "is_trending": is_trending,
            "is_crisis_indicator": is_crisis,
            "is_opportunity": is_opportunity,
            "detected_region": detected_region,
            "location_confidence": 0.6 if detected_region else None,
            "detected_keywords": keywords,
            "political_entities": political_entities,
            "hashtags": hashtags,
            "processing_latency_ms": int(processing_time)
        }
    
    def _calculate_sentiment(self, text: str) -> float:
        positive_count = sum(1 for word in self.positive_words if word in text)
        negative_count = sum(1 for word in self.negative_words if word in text)
        
        if positive_count + negative_count == 0:
            return 0.0
        
        sentiment = (positive_count - negative_count) / (positive_count + negative_count)
        return max(-1.0, min(1.0, sentiment))
    
    def _calculate_political_relevance(self, text: str) -> float:
        matches = sum(1 for term in self.political_terms if term in text)
        return min(1.0, matches / 3.0)
    
    def _calculate_urgency(self, text: str) -> float:
        matches = sum(1 for term in self.urgent_terms if term in text)
        return min(1.0, matches / 2.0)
    
    def _extract_political_entities(self, text: str) -> List[str]:
        text_lower = text.lower()
        return [entity for entity in self.political_entities if entity.lower() in text_lower]
    
    def _extract_keywords(self, text: str) -> List[str]:
        keywords = [term for term in self.political_terms if term in text]
        return keywords[:10]
    
    def _extract_hashtags(self, text: str) -> List[str]:
        hashtags = re.findall(r'#\w+', text)
        return [tag.lower() for tag in hashtags]
    
    def _detect_crisis(self, text: str, sentiment: float, urgency: float) -> bool:
        crisis_terms = ['crisis', 'emergencia', 'violencia', 'disturbios', 'caos']
        has_crisis_terms = any(term in text for term in crisis_terms)
        return has_crisis_terms or (sentiment < -0.5 and urgency > 0.7)
    
    def _detect_opportunity(self, text: str, sentiment: float, political_relevance: float) -> bool:
        opportunity_terms = ['oportunidad', 'propuesta', 'solución', 'plan', 'iniciativa']
        has_opportunity_terms = any(term in text for term in opportunity_terms)
        return has_opportunity_terms or (sentiment > 0.3 and political_relevance > 0.6)
    
    def _detect_region(self, text: str) -> Optional[str]:
        for region, code in self.regions.items():
            if region in text:
                return code
        return None

analyzer = SentimentAnalyzer()

# Storage en memoria para métricas (sin Redis)
class InMemoryStorage:
    def __init__(self):
        self.processed_count = 0
        self.crisis_alerts = 0
        self.trending_topics = 0
        self.sentiment_sum = 0.0
        self.recent_items: List[Dict] = []
        
    def add_item(self, item: Dict):
        self.processed_count += 1
        self.sentiment_sum += item.get('realtime_sentiment', 0)

        if item.get('is_crisis_indicator'):
            self.crisis_alerts += 1
        if item.get('is_trending'):
            self.trending_topics += 1

        self.recent_items.append(item)
        if len(self.recent_items) > 1000:
            self.recent_items = self.recent_items[-500:]

        # Persist to PostgreSQL
        try:
            session = SessionLocal()
            record = LiveStreamRecord(
                stream_id=item.get('stream_id', ''),
                platform=item.get('platform', ''),
                stream_type=item.get('stream_type', ''),
                content=item.get('content', ''),
                author_handle=item.get('author_handle'),
                author_name=item.get('author_name'),
                realtime_sentiment=item.get('realtime_sentiment', 0),
                sentiment_confidence=item.get('sentiment_confidence', 0),
                political_relevance_score=item.get('political_relevance_score', 0),
                urgency_score=item.get('urgency_score', 0),
                is_trending=item.get('is_trending', False),
                is_crisis_indicator=item.get('is_crisis_indicator', False),
                is_opportunity=item.get('is_opportunity', False),
                detected_region=item.get('detected_region'),
                detected_keywords=item.get('detected_keywords', []),
                political_entities=item.get('political_entities', []),
                hashtags=item.get('hashtags', []),
                processing_latency_ms=item.get('processing_latency_ms', 0),
                message_timestamp=item.get('message_timestamp'),
            )
            session.add(record)
            session.commit()
            session.close()
        except Exception as e:
            logger.warning(f"Failed to persist to DB (non-fatal): {e}")
    
    def get_metrics(self) -> StreamMetrics:
        avg_sentiment = self.sentiment_sum / self.processed_count if self.processed_count > 0 else 0.0
        return StreamMetrics(
            active_streams=len(manager.active_connections),
            processed_count=self.processed_count,
            avg_sentiment=avg_sentiment,
            crisis_alerts=self.crisis_alerts,
            trending_topics=self.trending_topics,
            processing_rate=len(self.recent_items) / 60.0
        )

storage = InMemoryStorage()

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando microservicio de streaming...")
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS realtime_data"))
            conn.commit()
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized")
    except Exception as e:
        logger.warning(f"Database init warning (non-fatal): {e}")
    yield
    logger.info("Cerrando microservicio...")

# FastAPI Application
app = FastAPI(
    title="PoliticaPE Streaming Service",
    description="Microservicio de análisis de datos políticos en tiempo real",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints
@app.get("/", response_class=HTMLResponse)
async def root():
    """Página principal del servicio"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>PoliticaPE Streaming Service</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 20px; }
            .status { background: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .links { display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap; }
            .link { background: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
            .link:hover { background: #c0392b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>PoliticaPE Streaming Service</h1>
                <p>Real-time Political Data Analysis Microservice</p>
            </div>
            <div class="status">
                <h3>Service Status: Active</h3>
                <p>Real-time analysis of political content from multiple sources</p>
            </div>
            <div class="links">
                <a href="/docs" class="link">API Documentation</a>
                <a href="/health" class="link">Health Check</a>
                <a href="/api/metrics" class="link">Metrics</a>
                <a href="/prometheus" class="link">Prometheus Metrics</a>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "PoliticaPE Streaming Service",
        "version": "1.0.0",
        "websocket_connections": len(manager.active_connections),
        "processed_count": storage.processed_count
    }

@app.get("/prometheus")
async def prometheus_metrics():
    """Prometheus metrics endpoint"""
    return JSONResponse(content={"metrics": generate_latest().decode()})

@app.get("/api/metrics", response_model=StreamMetrics)
async def get_metrics():
    """Get real-time streaming metrics"""
    return storage.get_metrics()

@app.post("/api/analyze")
async def analyze_text(request: AnalyzeRequest):
    """Analyze text content for political sentiment and relevance"""
    analysis = await analyzer.analyze_content(request.text)
    
    stream_data = {
        "stream_id": str(uuid.uuid4()),
        "platform": request.platform,
        "stream_type": "manual_analysis",
        "content": request.text[:500],
        "message_timestamp": datetime.now(timezone.utc).isoformat(),
        **analysis
    }
    
    storage.add_item(stream_data)
    stream_counter.inc()
    
    # Broadcast to WebSocket clients
    await manager.broadcast(stream_data)
    
    return stream_data

@app.get("/api/recent")
async def get_recent_items(limit: int = 50):
    """Get recent analyzed items"""
    return {"items": storage.recent_items[-limit:]}

@app.get("/api/crisis-alerts")
async def get_crisis_alerts():
    """Get recent crisis indicators"""
    crisis_items = [item for item in storage.recent_items if item.get('is_crisis_indicator')]
    return {"crisis_alerts": crisis_items[-20:], "total": len(crisis_items)}

@app.get("/api/trending")
async def get_trending():
    """Get trending topics"""
    trending_items = [item for item in storage.recent_items if item.get('is_trending')]
    return {"trending": trending_items[-20:], "total": len(trending_items)}

# WebSocket endpoint
@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """WebSocket endpoint for real-time data streaming"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get('type') == 'analyze':
                    analysis = await analyzer.analyze_content(message.get('text', ''))
                    stream_data = {
                        "stream_id": str(uuid.uuid4()),
                        "platform": message.get('platform', 'websocket'),
                        "stream_type": "websocket_analysis",
                        "content": message.get('text', '')[:500],
                        "message_timestamp": datetime.now(timezone.utc).isoformat(),
                        **analysis
                    }
                    storage.add_item(stream_data)
                    stream_counter.inc()
                    await manager.broadcast(stream_data)
                elif message.get('type') == 'ping':
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        log_level=settings.log_level.lower()
    )
