-- Script de inicialización para la base de datos politiscope_db
-- Este script se ejecutará automáticamente al iniciar el contenedor de PostgreSQL

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla principal de eventos políticos
CREATE TABLE IF NOT EXISTS political_events (
    id VARCHAR(255) PRIMARY KEY,
    content TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sentiment_score FLOAT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    crisis_level INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar el rendimiento
CREATE INDEX IF NOT EXISTS idx_political_events_timestamp ON political_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_political_events_source ON political_events(source);
CREATE INDEX IF NOT EXISTS idx_political_events_crisis_level ON political_events(crisis_level);
CREATE INDEX IF NOT EXISTS idx_political_events_sentiment ON political_events(sentiment_score);

-- Tabla de temas en tendencia
CREATE TABLE IF NOT EXISTS trending_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword VARCHAR(255) NOT NULL,
    count INTEGER DEFAULT 1,
    sentiment_avg FLOAT DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para trending_topics
CREATE INDEX IF NOT EXISTS idx_trending_topics_keyword ON trending_topics(keyword);
CREATE INDEX IF NOT EXISTS idx_trending_topics_window ON trending_topics(window_start, window_end);

-- Tabla de alertas de crisis
CREATE TABLE IF NOT EXISTS crisis_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) REFERENCES political_events(id),
    alert_type VARCHAR(100) NOT NULL,
    severity INTEGER NOT NULL,
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para crisis_alerts
CREATE INDEX IF NOT EXISTS idx_crisis_alerts_severity ON crisis_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_crisis_alerts_resolved ON crisis_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_crisis_alerts_created_at ON crisis_alerts(created_at);

-- Tabla de métricas del sistema
CREATE TABLE IF NOT EXISTS stream_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(100) NOT NULL,
    value FLOAT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para stream_metrics
CREATE INDEX IF NOT EXISTS idx_stream_metrics_type ON stream_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_stream_metrics_timestamp ON stream_metrics(timestamp);

-- Tabla de configuración de flujos
CREATE TABLE IF NOT EXISTS stream_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_name VARCHAR(255) NOT NULL UNIQUE,
    keywords TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    config_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en stream_configs
CREATE TRIGGER update_stream_configs_updated_at 
    BEFORE UPDATE ON stream_configs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuraciones iniciales de flujos
INSERT INTO stream_configs (stream_name, keywords, config_data) VALUES
('twitter_political', ARRAY['congreso', 'presidente', 'elecciones', 'dina boluarte', 'peru', 'política'], '{"rate_limit": 100, "language": "es"}'),
('news_sentiment', ARRAY['política', 'gobierno', 'crisis', 'economía', 'reforma'], '{"sources": ["news"], "min_confidence": 0.7}'),
('crisis_detection', ARRAY['protesta', 'violencia', 'emergencia', 'alerta', 'manifestación'], '{"threshold": 0.8, "alert_level": "high"}')
ON CONFLICT (stream_name) DO NOTHING;

-- Vista para estadísticas rápidas
CREATE OR REPLACE VIEW political_stats AS
SELECT 
    COUNT(*) as total_events,
    AVG(sentiment_score) as avg_sentiment,
    COUNT(*) FILTER (WHERE crisis_level >= 3) as crisis_events,
    COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '1 hour') as events_last_hour,
    COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '24 hours') as events_last_day
FROM political_events;

-- Función para limpiar datos antiguos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Eliminar eventos más antiguos de 30 días
    DELETE FROM political_events 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Eliminar métricas más antiguas de 7 días
    DELETE FROM stream_metrics 
    WHERE timestamp < NOW() - INTERVAL '7 days';
    
    -- Eliminar alertas resueltas más antiguas de 7 días
    DELETE FROM crisis_alerts 
    WHERE resolved = TRUE AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE political_events IS 'Almacena todos los eventos políticos procesados en tiempo real';
COMMENT ON TABLE trending_topics IS 'Temas en tendencia calculados por ventanas de tiempo';
COMMENT ON TABLE crisis_alerts IS 'Alertas de crisis generadas automáticamente';
COMMENT ON TABLE stream_metrics IS 'Métricas de rendimiento del sistema';
COMMENT ON TABLE stream_configs IS 'Configuración de los diferentes flujos de datos';