"""
Microservicio de Análisis de Datos Políticos
Servicio de análisis de datos políticos en tiempo real de alto rendimiento
"""

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncpg
import aiohttp
import tweepy
from kafka import KafkaProducer, KafkaConsumer
import spacy
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import redis.asyncio as redis
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from pydantic import BaseSettings, BaseModel
import uvicorn

# Configuración
class Settings(BaseSettings):
    """Configuración de la aplicación usando variables de entorno"""
    twitter_bearer_token: str = "your_twitter_bearer_token_here"
    twitter_api_key: str = "your_twitter_api_key_here"
    twitter_api_secret: str = "your_twitter_api_secret_here"
    postgres_url: str = "postgresql://postgres:123456@localhost:5432/politiscope_db"
    redis_url: str = "redis://localhost:6379"
    kafka_bootstrap_servers: str = "localhost:9092"
    log_level: str = "INFO"
    port: int = 8000
    batch_size: int = 100
    processing_interval: int = 5
    max_retries: int = 3
    
    class Config:
        env_file = ".env"

settings = Settings()

# Configurar logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Métricas
stream_counter = Counter('political_streams_total', 'Total de flujos de datos políticos procesados')
sentiment_histogram = Histogram('sentiment_analysis_duration_seconds', 'Tiempo empleado en análisis de sentimiento')
active_connections = Gauge('websocket_connections_active', 'Conexiones WebSocket activas')
database_operations = Counter('database_operations_total', 'Total de operaciones de base de datos', ['operation', 'status'])

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
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    detected_keywords: List[str] = []
    political_entities: List[str] = []
    hashtags: List[str] = []
    raw_message: Dict = {}
    processing_latency_ms: int
    message_timestamp: datetime

class StreamMetrics(BaseModel):
    active_streams: int
    processed_count: int
    avg_sentiment: float
    crisis_alerts: int
    trending_topics: int
    processing_rate: float

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
        
        # Limpiar conexiones desconectadas
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

# Pipeline de NLP
class SentimentAnalyzer:
    def __init__(self):
        self.nlp = None
        self.tokenizer = None
        self.model = None
        
    async def initialize(self):
        """Inicializar modelos de NLP de forma asíncrona"""
        try:
            logger.info("Inicializando modelos de NLP...")
            # En un entorno de producción, estos modelos se cargarían aquí
            # self.nlp = spacy.load("es_core_news_lg")
            # self.tokenizer = AutoTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
            # self.model = AutoModelForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
            logger.info("Modelos de NLP inicializados correctamente")
        except Exception as e:
            logger.error(f"Error inicializando modelos NLP: {e}")
        
    @sentiment_histogram.time()
    async def analyze_content(self, text: str) -> Dict:
        """Analizar contenido completo incluyendo sentimiento, relevancia política y urgencia"""
        try:
            start_time = datetime.now()
            
            # Análisis de sentimiento
            sentiment_score = self._calculate_sentiment(text)
            sentiment_confidence = 0.7 + (abs(sentiment_score) * 0.3)
            
            # Análisis de relevancia política
            political_relevance = self._calculate_political_relevance(text)
            
            # Análisis de urgencia
            urgency_score = self._calculate_urgency(text)
            
            # Detección de entidades políticas
            political_entities = self._extract_political_entities(text)
            
            # Extracción de palabras clave
            keywords = self._extract_keywords(text)
            
            # Extracción de hashtags
            hashtags = self._extract_hashtags(text)
            
            # Detección de eventos
            is_trending = self._detect_trending(text, keywords)
            is_crisis = self._detect_crisis(text, sentiment_score, urgency_score)
            is_opportunity = self._detect_opportunity(text, sentiment_score, political_relevance)
            
            # Detección geográfica básica
            detected_region = self._detect_region(text)
            
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
        except Exception as e:
            logger.error(f"Error en análisis de contenido: {e}")
            return {
                "realtime_sentiment": 0.0,
                "sentiment_confidence": 0.5,
                "political_relevance_score": 0.0,
                "urgency_score": 0.0,
                "is_trending": False,
                "is_crisis_indicator": False,
                "is_opportunity": False,
                "detected_region": None,
                "location_confidence": None,
                "detected_keywords": [],
                "political_entities": [],
                "hashtags": [],
                "processing_latency_ms": 0
            }
    
    def _calculate_sentiment(self, text: str) -> float:
        """Calcular sentimiento (-1 a 1)"""
        # Palabras positivas y negativas para política peruana
        positive_words = ['progreso', 'desarrollo', 'mejora', 'éxito', 'crecimiento', 'esperanza', 'futuro', 'oportunidad']
        negative_words = ['crisis', 'corrupción', 'problema', 'conflicto', 'protesta', 'violencia', 'caos', 'fracaso']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count + negative_count == 0:
            return 0.0
        
        sentiment = (positive_count - negative_count) / (positive_count + negative_count)
        return max(-1.0, min(1.0, sentiment))
    
    def _calculate_political_relevance(self, text: str) -> float:
        """Calcular relevancia política (0 a 1)"""
        political_terms = [
            'congreso', 'presidente', 'gobierno', 'elecciones', 'política', 'ministro',
            'dina boluarte', 'castillo', 'keiko', 'antauro', 'reforma', 'ley',
            'parlamento', 'senado', 'diputado', 'alcalde', 'gobernador'
        ]
        
        text_lower = text.lower()
        matches = sum(1 for term in political_terms if term in text_lower)
        
        # Normalizar entre 0 y 1
        relevance = min(1.0, matches / 3.0)  # 3 o más términos = máxima relevancia
        return relevance
    
    def _calculate_urgency(self, text: str) -> float:
        """Calcular urgencia (0 a 1)"""
        urgent_terms = [
            'urgente', 'inmediato', 'ahora', 'crisis', 'emergencia', 'alerta',
            'breaking', 'último momento', 'importante', 'grave'
        ]
        
        text_lower = text.lower()
        matches = sum(1 for term in urgent_terms if term in text_lower)
        
        urgency = min(1.0, matches / 2.0)  # 2 o más términos = máxima urgencia
        return urgency
    
    def _extract_political_entities(self, text: str) -> List[str]:
        """Extraer entidades políticas"""
        entities = [
            'Dina Boluarte', 'Pedro Castillo', 'Keiko Fujimori', 'Antauro Humala',
            'Congreso', 'PCM', 'Mininter', 'Sunat', 'BCR'
        ]
        
        found_entities = []
        text_lower = text.lower()
        
        for entity in entities:
            if entity.lower() in text_lower:
                found_entities.append(entity)
        
        return found_entities
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extraer palabras clave relevantes"""
        keywords = []
        political_terms = [
            'congreso', 'presidente', 'gobierno', 'elecciones', 'política',
            'economía', 'inflación', 'protesta', 'manifestación', 'reforma',
            'corrupción', 'justicia', 'democracia', 'crisis'
        ]
        
        text_lower = text.lower()
        for term in political_terms:
            if term in text_lower:
                keywords.append(term)
        
        return keywords[:10]  # Máximo 10 palabras clave
    
    def _extract_hashtags(self, text: str) -> List[str]:
        """Extraer hashtags del texto"""
        import re
        hashtags = re.findall(r'#\w+', text)
        return [tag.lower() for tag in hashtags]
    
    def _detect_trending(self, text: str, keywords: List[str]) -> bool:
        """Detectar si el contenido puede ser tendencia"""
        trending_indicators = ['viral', 'trending', 'tendencia', 'todos hablan']
        text_lower = text.lower()
        
        # Si tiene muchas palabras clave políticas o indicadores de tendencia
        return len(keywords) >= 3 or any(indicator in text_lower for indicator in trending_indicators)
    
    def _detect_crisis(self, text: str, sentiment: float, urgency: float) -> bool:
        """Detectar indicadores de crisis"""
        crisis_terms = ['crisis', 'emergencia', 'violencia', 'disturbios', 'caos']
        text_lower = text.lower()
        
        has_crisis_terms = any(term in text_lower for term in crisis_terms)
        negative_sentiment = sentiment < -0.5
        high_urgency = urgency > 0.7
        
        return has_crisis_terms or (negative_sentiment and high_urgency)
    
    def _detect_opportunity(self, text: str, sentiment: float, political_relevance: float) -> bool:
        """Detectar oportunidades políticas"""
        opportunity_terms = ['oportunidad', 'propuesta', 'solución', 'plan', 'iniciativa']
        text_lower = text.lower()
        
        has_opportunity_terms = any(term in text_lower for term in opportunity_terms)
        positive_sentiment = sentiment > 0.3
        high_relevance = political_relevance > 0.6
        
        return has_opportunity_terms or (positive_sentiment and high_relevance)
    
    def _detect_region(self, text: str) -> Optional[str]:
        """Detectar región geográfica mencionada"""
        regions = {
            'lima': 'LIM',
            'arequipa': 'ARE',
            'cusco': 'CUS',
            'trujillo': 'LAL',
            'piura': 'PIU',
            'iquitos': 'LOR',
            'huancayo': 'JUN',
            'chiclayo': 'LAM'
        }
        
        text_lower = text.lower()
        for region, code in regions.items():
            if region in text_lower:
                return code
        
        return None

analyzer = SentimentAnalyzer()

# Operaciones de Base de Datos
class DatabaseManager:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        
    async def init_pool(self):
        """Inicializar pool de conexiones de base de datos"""
        try:
            self.pool = await asyncpg.create_pool(
                settings.postgres_url,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            logger.info("Pool de base de datos inicializado")
            
            # Verificar conexión y crear esquema si no existe
            async with self.pool.acquire() as conn:
                await conn.execute("CREATE SCHEMA IF NOT EXISTS realtime_data")
                await conn.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
                
                # Crear enum si no existe
                await conn.execute("""
                    DO $$ BEGIN
                        CREATE TYPE content_type AS ENUM ('text', 'image', 'video', 'link', 'poll');
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                """)
                
                # Crear tabla si no existe
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS realtime_data.live_streams (
                        id BIGSERIAL PRIMARY KEY,
                        
                        -- Identificación del stream
                        stream_id UUID DEFAULT uuid_generate_v4(),
                        platform VARCHAR(50) NOT NULL,
                        stream_type VARCHAR(100) NOT NULL,
                        
                        -- Contenido del mensaje
                        content TEXT NOT NULL,
                        content_type content_type DEFAULT 'text',
                        
                        -- Autor
                        author_handle VARCHAR(255),
                        author_name VARCHAR(500),
                        
                        -- Engagement inmediato
                        immediate_likes BIGINT DEFAULT 0,
                        immediate_shares BIGINT DEFAULT 0,
                        immediate_comments BIGINT DEFAULT 0,
                        
                        -- Análisis en tiempo real
                        realtime_sentiment DECIMAL(4,3),
                        sentiment_confidence DECIMAL(4,3),
                        political_relevance_score DECIMAL(4,3),
                        urgency_score DECIMAL(4,3),
                        
                        -- Detección de eventos
                        is_trending BOOLEAN DEFAULT FALSE,
                        is_crisis_indicator BOOLEAN DEFAULT FALSE,
                        is_opportunity BOOLEAN DEFAULT FALSE,
                        
                        -- Geográfico (sin PostGIS)
                        detected_region VARCHAR(10),
                        location_confidence DECIMAL(4,3),
                        latitude DECIMAL(10,8),
                        longitude DECIMAL(11,8),
                        
                        -- Keywords y entidades
                        detected_keywords TEXT[],
                        political_entities TEXT[],
                        hashtags TEXT[],
                        
                        -- Metadata técnica
                        raw_message JSONB,
                        processing_latency_ms INTEGER,
                        
                        -- Timestamps (críticos para tiempo real)
                        message_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
                        received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        
                        -- TTL para limpieza automática
                        expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
                        
                        CHECK (realtime_sentiment BETWEEN -1.000 AND 1.000),
                        CHECK (sentiment_confidence BETWEEN 0.000 AND 1.000),
                        CHECK (political_relevance_score BETWEEN 0.000 AND 1.000)
                    );
                """)
                
                # Crear índices para optimización
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_live_streams_timestamp 
                    ON realtime_data.live_streams(message_timestamp);
                """)
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_live_streams_platform 
                    ON realtime_data.live_streams(platform);
                """)
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_live_streams_sentiment 
                    ON realtime_data.live_streams(realtime_sentiment);
                """)
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_live_streams_crisis 
                    ON realtime_data.live_streams(is_crisis_indicator);
                """)
                
                logger.info("Esquema de base de datos verificado y creado")
                
        except Exception as e:
            logger.error(f"Error inicializando base de datos: {e}")
            
    async def insert_live_stream_data(self, data: LiveStreamData):
        """Insertar datos en la tabla live_streams"""
        if not self.pool:
            logger.warning("Base de datos no disponible")
            return False
            
        try:
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO realtime_data.live_streams (
                        stream_id, platform, stream_type, content, content_type,
                        author_handle, author_name, immediate_likes, immediate_shares, immediate_comments,
                        realtime_sentiment, sentiment_confidence, political_relevance_score, urgency_score,
                        is_trending, is_crisis_indicator, is_opportunity,
                        detected_region, location_confidence, latitude, longitude,
                        detected_keywords, political_entities, hashtags,
                        raw_message, processing_latency_ms, message_timestamp
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                        $21, $22, $23, $24, $25, $26, $27
                    )
                """, 
                data.stream_id, data.platform, data.stream_type, data.content, data.content_type,
                data.author_handle, data.author_name, data.immediate_likes, data.immediate_shares, data.immediate_comments,
                data.realtime_sentiment, data.sentiment_confidence, data.political_relevance_score, data.urgency_score,
                data.is_trending, data.is_crisis_indicator, data.is_opportunity,
                data.detected_region, data.location_confidence, data.latitude, data.longitude,
                data.detected_keywords, data.political_entities, data.hashtags,
                json.dumps(data.raw_message), data.processing_latency_ms, data.message_timestamp
                )
                
                database_operations.labels(operation='insert', status='success').inc()
                logger.debug(f"Datos insertados en BD: {data.stream_id}")
                return True
                
        except Exception as e:
            database_operations.labels(operation='insert', status='error').inc()
            logger.error(f"Error insertando datos en BD: {e}")
            return False
            
    async def get_metrics(self) -> StreamMetrics:
        """Obtener métricas en tiempo real"""
        if not self.pool:
            return StreamMetrics(
                active_streams=len(manager.active_connections),
                processed_count=0,
                avg_sentiment=0.0,
                crisis_alerts=0,
                trending_topics=0,
                processing_rate=0.0
            )
            
        try:
            async with self.pool.acquire() as conn:
                result = await conn.fetchrow("""
                    SELECT 
                        COUNT(*) as processed_count,
                        AVG(realtime_sentiment) as avg_sentiment,
                        COUNT(*) FILTER (WHERE is_crisis_indicator = TRUE) as crisis_alerts,
                        COUNT(*) FILTER (WHERE is_trending = TRUE) as trending_topics,
                        COUNT(*) FILTER (WHERE message_timestamp > NOW() - INTERVAL '1 minute') as last_minute_count
                    FROM realtime_data.live_streams 
                    WHERE message_timestamp > NOW() - INTERVAL '1 hour'
                """)
                
                return StreamMetrics(
                    active_streams=len(manager.active_connections),
                    processed_count=result['processed_count'] or 0,
                    avg_sentiment=float(result['avg_sentiment'] or 0.0),
                    crisis_alerts=result['crisis_alerts'] or 0,
                    trending_topics=result['trending_topics'] or 0,
                    processing_rate=float(result['last_minute_count'] or 0)
                )
        except Exception as e:
            logger.error(f"Error obteniendo métricas: {e}")
            return StreamMetrics(
                active_streams=len(manager.active_connections),
                processed_count=0,
                avg_sentiment=0.0,
                crisis_alerts=0,
                trending_topics=0,
                processing_rate=0.0
            )

db_manager = DatabaseManager()

# Manejador de Flujo de Twitter
class PoliticalTwitterStream:
    def __init__(self):
        self.client = None
        self.keywords = [
            "peru", "congreso", "presidente", "elecciones",
            "castillo", "dina boluarte", "keiko", "antauro",
            "mininter", "pcm", "política peruana", "gobierno peru"
        ]
        self.is_running = False
        
    async def initialize(self):
        """Inicializar cliente de Twitter"""
        try:
            if settings.twitter_bearer_token != "your_twitter_bearer_token_here":
                self.client = tweepy.StreamingClient(
                    bearer_token=settings.twitter_bearer_token,
                    wait_on_rate_limit=True
                )
                logger.info("Cliente de Twitter inicializado")
            else:
                logger.warning("Token de Twitter no configurado, usando datos simulados")
        except Exception as e:
            logger.error(f"Error inicializando cliente Twitter: {e}")
        
    async def start_stream(self):
        """Iniciar el flujo de Twitter con filtros políticos"""
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("Iniciando flujo de datos políticos...")
        
        # Simular flujo de datos para desarrollo
        while self.is_running:
            try:
                await self.simulate_tweet()
                await asyncio.sleep(settings.processing_interval)
            except Exception as e:
                logger.error(f"Error en flujo de Twitter: {e}")
                await asyncio.sleep(10)
                
    async def simulate_tweet(self):
        """Simular tweet para desarrollo"""
        sample_tweets = [
            {
                "content": "El Congreso debate nuevas medidas económicas para enfrentar la crisis inflacionaria #CongresoPerú",
                "author": "usuario_politico",
                "likes": 45,
                "shares": 12,
                "comments": 8
            },
            {
                "content": "Ciudadanos expresan su opinión sobre las próximas elecciones regionales en todo el país",
                "author": "periodista_lima",
                "likes": 23,
                "shares": 6,
                "comments": 15
            },
            {
                "content": "Dina Boluarte anuncia nuevas reformas en el sector educativo durante conferencia de prensa",
                "author": "canal_noticias",
                "likes": 67,
                "shares": 34,
                "comments": 22
            },
            {
                "content": "Protestas pacíficas en Lima por mejores condiciones laborales #ProtestaPacífica",
                "author": "activista_social",
                "likes": 89,
                "shares": 45,
                "comments": 31
            },
            {
                "content": "Análisis económico muestra signos de recuperación en el sector minero del país",
                "author": "economista_peru",
                "likes": 34,
                "shares": 18,
                "comments": 12
            }
        ]
        
        import random
        tweet_data = random.choice(sample_tweets)
        
        # Procesar el tweet simulado
        await self.process_tweet_data(tweet_data)
        
    async def process_tweet_data(self, tweet_data: dict):
        """Procesar datos de tweet"""
        try:
            start_time = datetime.now()
            
            # Analizar contenido
            analysis = await analyzer.analyze_content(tweet_data["content"])
            
            # Crear objeto de datos para la base de datos
            stream_data = LiveStreamData(
                stream_id=str(uuid.uuid4()),
                platform="twitter",
                stream_type="political_monitoring",
                content=tweet_data["content"],
                content_type="text",
                author_handle=tweet_data["author"],
                author_name=tweet_data["author"].replace("_", " ").title(),
                immediate_likes=tweet_data.get("likes", 0),
                immediate_shares=tweet_data.get("shares", 0),
                immediate_comments=tweet_data.get("comments", 0),
                realtime_sentiment=analysis["realtime_sentiment"],
                sentiment_confidence=analysis["sentiment_confidence"],
                political_relevance_score=analysis["political_relevance_score"],
                urgency_score=analysis["urgency_score"],
                is_trending=analysis["is_trending"],
                is_crisis_indicator=analysis["is_crisis_indicator"],
                is_opportunity=analysis["is_opportunity"],
                detected_region=analysis["detected_region"],
                location_confidence=analysis["location_confidence"],
                detected_keywords=analysis["detected_keywords"],
                political_entities=analysis["political_entities"],
                hashtags=analysis["hashtags"],
                raw_message={
                    "original_content": tweet_data["content"],
                    "engagement": {
                        "likes": tweet_data.get("likes", 0),
                        "shares": tweet_data.get("shares", 0),
                        "comments": tweet_data.get("comments", 0)
                    }
                },
                processing_latency_ms=analysis["processing_latency_ms"],
                message_timestamp=datetime.now(timezone.utc)
            )
            
            # Guardar en base de datos
            success = await db_manager.insert_live_stream_data(stream_data)
            
            if success:
                # Transmitir a clientes WebSocket
                await manager.broadcast({
                    "type": "live_stream_data",
                    "data": {
                        "stream_id": stream_data.stream_id,
                        "platform": stream_data.platform,
                        "content": stream_data.content,
                        "author": stream_data.author_handle,
                        "sentiment": stream_data.realtime_sentiment,
                        "political_relevance": stream_data.political_relevance_score,
                        "is_crisis": stream_data.is_crisis_indicator,
                        "is_trending": stream_data.is_trending,
                        "keywords": stream_data.detected_keywords,
                        "timestamp": stream_data.message_timestamp.isoformat()
                    }
                })
                
                stream_counter.inc()
                logger.info(f"Datos procesados y guardados: {stream_data.stream_id}")
            
        except Exception as e:
            logger.error(f"Error procesando datos de tweet: {e}")

# Patrón Circuit Breaker
class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        
    async def call(self, func, *args, **kwargs):
        """Ejecutar función con patrón circuit breaker"""
        if self.state == "OPEN":
            if datetime.now().timestamp() - self.last_failure_time > self.timeout:
                self.state = "HALF_OPEN"
            else:
                raise HTTPException(503, "Servicio temporalmente no disponible")
                
        try:
            result = await func(*args, **kwargs)
            if self.state == "HALF_OPEN":
                self.state = "CLOSED"
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = datetime.now().timestamp()
            
            if self.failure_count >= self.failure_threshold:
                self.state = "OPEN"
                
            raise e

circuit_breaker = CircuitBreaker()

# Ciclo de Vida de la Aplicación
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicio
    logger.info("Iniciando microservicio de datos políticos...")
    
    # Inicializar componentes
    await db_manager.init_pool()
    await analyzer.initialize()
    
    # Inicializar flujo de Twitter
    twitter_stream = PoliticalTwitterStream()
    await twitter_stream.initialize()
    
    # Iniciar flujo en segundo plano
    asyncio.create_task(twitter_stream.start_stream())
    
    logger.info("Microservicio iniciado correctamente")
    
    yield
    
    # Cierre
    logger.info("Cerrando microservicio...")
    twitter_stream.is_running = False
    
    if db_manager.pool:
        await db_manager.pool.close()
    
    logger.info("Microservicio cerrado")

# Aplicación FastAPI
app = FastAPI(
    title="Microservicio de Análisis de Datos Políticos",
    description="Análisis y monitoreo de datos políticos en tiempo real",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas
@app.get("/health")
async def health_check():
    """Endpoint de verificación de salud"""
    return {
        "status": "healthy", 
        "timestamp": datetime.now(),
        "version": "1.0.0",
        "database": "connected" if db_manager.pool else "disconnected",
        "active_connections": len(manager.active_connections)
    }

@app.get("/metrics")
async def get_prometheus_metrics():
    """Obtener métricas de Prometheus"""
    return generate_latest()

@app.get("/api/stats")
async def get_stats():
    """Obtener estadísticas en tiempo real"""
    try:
        metrics = await circuit_breaker.call(db_manager.get_metrics)
        return metrics
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(500, "Error interno del servidor")

@app.get("/api/recent-data")
async def get_recent_data(limit: int = 10):
    """Obtener datos recientes de la tabla live_streams"""
    if not db_manager.pool:
        return {"data": [], "message": "Base de datos no disponible"}
    
    try:
        async with db_manager.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    stream_id, platform, content, author_handle,
                    realtime_sentiment, political_relevance_score,
                    is_trending, is_crisis_indicator, detected_keywords,
                    message_timestamp
                FROM realtime_data.live_streams 
                ORDER BY message_timestamp DESC 
                LIMIT $1
            """, limit)
            
            data = [dict(row) for row in rows]
            return {"data": data, "count": len(data)}
    except Exception as e:
        logger.error(f"Error obteniendo datos recientes: {e}")
        raise HTTPException(500, "Error obteniendo datos")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Endpoint WebSocket para actualizaciones en tiempo real"""
    await manager.connect(websocket)
    try:
        while True:
            # Mantener conexión activa
            data = await websocket.receive_text()
            # Echo para mantener conexión
            await websocket.send_text(json.dumps({"type": "pong", "data": "connected"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error en WebSocket: {e}")
        manager.disconnect(websocket)

@app.post("/api/test-alert")
async def test_alert():
    """Endpoint para pruebas manuales de alertas"""
    test_data = LiveStreamData(
        stream_id=str(uuid.uuid4()),
        platform="test",
        stream_type="manual_test",
        content="Alerta de prueba: Sistema de monitoreo político funcionando correctamente",
        author_handle="sistema_test",
        realtime_sentiment=0.5,
        sentiment_confidence=0.8,
        political_relevance_score=0.9,
        urgency_score=0.3,
        detected_keywords=["test", "alerta", "sistema"],
        processing_latency_ms=50,
        message_timestamp=datetime.now(timezone.utc)
    )
    
    # Guardar en base de datos
    success = await db_manager.insert_live_stream_data(test_data)
    
    if success:
        await manager.broadcast({
            "type": "test_alert",
            "data": {
                "stream_id": test_data.stream_id,
                "content": test_data.content,
                "timestamp": test_data.message_timestamp.isoformat()
            }
        })
        
        return {"message": "Alerta de prueba enviada y guardada", "stream_id": test_data.stream_id}
    else:
        raise HTTPException(500, "Error guardando alerta de prueba")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        log_level=settings.log_level.lower()
    )