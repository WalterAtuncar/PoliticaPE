CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA IF NOT EXISTS realtime_data;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
        CREATE TYPE content_type AS ENUM ('text', 'image', 'video', 'link', 'poll');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.raw_social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    post_id VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT NOW(),
    engagement_metrics JSONB,
    metadata JSONB,
    processed BOOLEAN DEFAULT FALSE,
    sentiment_score DOUBLE PRECISION,
    geographic_location VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_platform_post_id ON public.raw_social_posts (platform, post_id);
CREATE INDEX IF NOT EXISTS idx_scraped_at_raw_social_posts ON public.raw_social_posts (scraped_at);
CREATE INDEX IF NOT EXISTS idx_processed_raw_social_posts ON public.raw_social_posts (processed);
CREATE INDEX IF NOT EXISTS idx_geographic_location_raw_social_posts ON public.raw_social_posts (geographic_location);

CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    author VARCHAR(255),
    published_at TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT NOW(),
    url VARCHAR(1000) NOT NULL,
    category VARCHAR(100),
    tags JSONB,
    sentiment_score DOUBLE PRECISION,
    political_entities JSONB,
    processed BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_source_published_news_articles ON public.news_articles (source, published_at);
CREATE INDEX IF NOT EXISTS idx_scraped_at_news_articles ON public.news_articles (scraped_at);
CREATE INDEX IF NOT EXISTS idx_processed_news_articles ON public.news_articles (processed);
CREATE INDEX IF NOT EXISTS idx_category_news_articles ON public.news_articles (category);

CREATE TABLE IF NOT EXISTS public.government_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL,
    data_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content JSONB,
    published_at TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT NOW(),
    url VARCHAR(1000) NOT NULL,
    department VARCHAR(200),
    metadata JSONB,
    processed BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_source_type_government_data ON public.government_data (source, data_type);
CREATE INDEX IF NOT EXISTS idx_scraped_at_government_data ON public.government_data (scraped_at);
CREATE INDEX IF NOT EXISTS idx_processed_government_data ON public.government_data (processed);
CREATE INDEX IF NOT EXISTS idx_department_government_data ON public.government_data (department);

CREATE TABLE IF NOT EXISTS public.scraped_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    methodology TEXT,
    sample_size INTEGER,
    margin_error DOUBLE PRECISION,
    field_dates VARCHAR(200),
    results JSONB NOT NULL,
    published_at TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT NOW(),
    url VARCHAR(1000) NOT NULL,
    pollster VARCHAR(200),
    processed BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_source_published_scraped_surveys ON public.scraped_surveys (source, published_at);
CREATE INDEX IF NOT EXISTS idx_scraped_at_scraped_surveys ON public.scraped_surveys (scraped_at);
CREATE INDEX IF NOT EXISTS idx_processed_scraped_surveys ON public.scraped_surveys (processed);
CREATE INDEX IF NOT EXISTS idx_pollster_scraped_surveys ON public.scraped_surveys (pollster);

CREATE TABLE IF NOT EXISTS public.scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL,
    scraping_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    items_scraped INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_source_type_scraping_logs ON public.scraping_logs (source, scraping_type);
CREATE INDEX IF NOT EXISTS idx_started_at_scraping_logs ON public.scraping_logs (started_at);
CREATE INDEX IF NOT EXISTS idx_status_scraping_logs ON public.scraping_logs (status);

CREATE TABLE IF NOT EXISTS realtime_data.live_streams (
    id BIGSERIAL PRIMARY KEY,
    stream_id UUID DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    stream_type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    content_type content_type DEFAULT 'text',
    author_handle VARCHAR(255),
    author_name VARCHAR(500),
    immediate_likes BIGINT DEFAULT 0,
    immediate_shares BIGINT DEFAULT 0,
    immediate_comments BIGINT DEFAULT 0,
    realtime_sentiment NUMERIC(4,3),
    sentiment_confidence NUMERIC(4,3),
    political_relevance_score NUMERIC(4,3),
    urgency_score NUMERIC(4,3),
    is_trending BOOLEAN DEFAULT FALSE,
    is_crisis_indicator BOOLEAN DEFAULT FALSE,
    is_opportunity BOOLEAN DEFAULT FALSE,
    detected_region VARCHAR(10),
    location_confidence NUMERIC(4,3),
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    detected_keywords TEXT[],
    political_entities TEXT[],
    hashtags TEXT[],
    raw_message JSONB,
    processing_latency_ms INTEGER,
    message_timestamp TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    CHECK (realtime_sentiment BETWEEN -1.000 AND 1.000),
    CHECK (sentiment_confidence BETWEEN 0.000 AND 1.000),
    CHECK (political_relevance_score BETWEEN 0.000 AND 1.000)
);
CREATE INDEX IF NOT EXISTS idx_live_streams_timestamp ON realtime_data.live_streams (message_timestamp);
CREATE INDEX IF NOT EXISTS idx_live_streams_platform ON realtime_data.live_streams (platform);
CREATE INDEX IF NOT EXISTS idx_live_streams_sentiment ON realtime_data.live_streams (realtime_sentiment);
CREATE INDEX IF NOT EXISTS idx_live_streams_crisis ON realtime_data.live_streams (is_crisis_indicator);

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS organization;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'election_type') THEN
        CREATE TYPE election_type AS ENUM ('presidential', 'congressional', 'regional', 'municipal');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE event_type AS ENUM ('tour', 'rally', 'debate', 'press', 'fundraising', 'meeting');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'blocked');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_status') THEN
        CREATE TYPE program_status AS ENUM ('draft', 'review', 'approved', 'archived');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS identity.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS identity.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    avatar_url VARCHAR(1000),
    is_active BOOLEAN DEFAULT TRUE,
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, email)
);
CREATE INDEX IF NOT EXISTS idx_users_active ON identity.users (is_active);

CREATE TABLE IF NOT EXISTS identity.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS identity.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS identity.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES identity.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, user_id, role_id)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON identity.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON identity.user_roles (role_id);

CREATE TABLE IF NOT EXISTS identity.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES identity.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES identity.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, role_id, permission_id)
);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON identity.role_permissions (role_id);

CREATE TABLE IF NOT EXISTS identity.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(100),
    user_agent VARCHAR(500)
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON identity.sessions (user_id, expires_at);

CREATE TABLE IF NOT EXISTS identity.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES identity.users(id) ON DELETE SET NULL,
    key_prefix VARCHAR(20) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    scopes JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    UNIQUE (key_prefix)
);
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_user ON identity.api_keys (tenant_id, user_id);

CREATE TABLE IF NOT EXISTS identity.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES identity.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100),
    resource_type VARCHAR(100),
    resource_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_time ON identity.audit_logs (tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON identity.audit_logs (resource_type, resource_id);

CREATE TABLE IF NOT EXISTS organization.parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    abbreviation VARCHAR(50),
    country VARCHAR(100) DEFAULT 'Peru',
    logo_url VARCHAR(1000),
    description TEXT,
    founded_at DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS organization.regions (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    parent_code VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS organization.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    party_id UUID NOT NULL REFERENCES organization.parties(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    election election_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    region_code VARCHAR(10),
    budget NUMERIC(14,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);
CREATE INDEX IF NOT EXISTS idx_campaigns_party ON organization.campaigns (party_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON organization.campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaigns_start ON organization.campaigns (start_date);

CREATE TABLE IF NOT EXISTS organization.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    region_code VARCHAR(10),
    capacity INTEGER,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    contact_name VARCHAR(200),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_venues_tenant_region ON organization.venues (tenant_id, region_code);

CREATE TABLE IF NOT EXISTS organization.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES organization.campaigns(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES organization.venues(id) ON DELETE SET NULL,
    event_type event_type NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    region_code VARCHAR(10),
    expected_attendance INTEGER,
    actual_attendance INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_campaign_start ON organization.events (campaign_id, start_at);
CREATE INDEX IF NOT EXISTS idx_events_region ON organization.events (region_code);

CREATE TABLE IF NOT EXISTS organization.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES organization.campaigns(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    category VARCHAR(100),
    status program_status DEFAULT 'draft',
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, title, campaign_id)
);

CREATE TABLE IF NOT EXISTS organization.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES organization.campaigns(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    area_policy VARCHAR(100),
    status project_status DEFAULT 'draft',
    description TEXT,
    budget NUMERIC(14,2) DEFAULT 0,
    priority task_priority DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (tenant_id, title, campaign_id)
);

CREATE TABLE IF NOT EXISTS organization.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES organization.campaigns(id) ON DELETE CASCADE,
    event_id UUID REFERENCES organization.events(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    assigned_user_id UUID REFERENCES identity.users(id) ON DELETE SET NULL,
    created_by_user_id UUID REFERENCES identity.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    labels TEXT[],
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status ON organization.tasks (assigned_user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON organization.tasks (due_date);

CREATE TABLE IF NOT EXISTS organization.volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    region_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    assigned_event_id UUID REFERENCES organization.events(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_volunteers_tenant_region ON organization.volunteers (tenant_id, region_code);

CREATE TABLE IF NOT EXISTS organization.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES organization.campaigns(id) ON DELETE CASCADE,
    donor_name VARCHAR(200) NOT NULL,
    donor_type VARCHAR(50) DEFAULT 'individual',
    amount NUMERIC(14,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PEN',
    received_at TIMESTAMPTZ DEFAULT NOW(),
    method VARCHAR(50),
    notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_received ON organization.donations (campaign_id, received_at);

CREATE TABLE IF NOT EXISTS organization.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES organization.events(id) ON DELETE CASCADE,
    person_name VARCHAR(200),
    contact VARCHAR(200),
    checkin_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attendance_event_checkin ON organization.attendance (event_id, checkin_at);

CREATE TABLE IF NOT EXISTS organization.event_media_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES organization.events(id) ON DELETE CASCADE,
    source_type VARCHAR(20) NOT NULL,
    source_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_event_media_event ON organization.event_media_links (event_id, source_type);