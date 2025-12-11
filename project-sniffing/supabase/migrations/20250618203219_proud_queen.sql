-- Political Data Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main events table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_political_events_timestamp ON political_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_political_events_source ON political_events(source);
CREATE INDEX IF NOT EXISTS idx_political_events_crisis_level ON political_events(crisis_level);
CREATE INDEX IF NOT EXISTS idx_political_events_sentiment ON political_events(sentiment_score);

-- Trending topics table
CREATE TABLE IF NOT EXISTS trending_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword VARCHAR(255) NOT NULL,
    count INTEGER DEFAULT 1,
    sentiment_avg FLOAT DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS crisis_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) REFERENCES political_events(id),
    alert_type VARCHAR(100) NOT NULL,
    severity INTEGER NOT NULL,
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream metrics table
CREATE TABLE IF NOT EXISTS stream_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(100) NOT NULL,
    value FLOAT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);