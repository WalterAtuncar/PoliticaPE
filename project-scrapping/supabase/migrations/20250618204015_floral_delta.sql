-- Initialize database with extensions and basic setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created automatically by SQLAlchemy, but we can add custom ones here

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_content_fts 
ON news_articles USING gin(to_tsvector('spanish', content));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_content_fts 
ON raw_social_posts USING gin(to_tsvector('spanish', content));

-- Geographic search optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_geo_trgm 
ON raw_social_posts USING gin(geographic_location gin_trgm_ops);

-- JSON indexes for metadata searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_news_political_entities 
ON news_articles USING gin(political_entities);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_engagement 
ON raw_social_posts USING gin(engagement_metrics);

-- Performance optimization
ANALYZE;