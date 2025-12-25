-- Align Replit PostgreSQL Schema with Dev Team DDL
-- Run this to add missing columns and tables

-- ==========================================
-- 1. Add missing columns to organization.parties
-- ==========================================
DO $$
BEGIN
    -- Add short_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'parties' AND column_name = 'short_name') THEN
        ALTER TABLE organization.parties ADD COLUMN short_name VARCHAR(50);
    END IF;
    
    -- Add slug column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'parties' AND column_name = 'slug') THEN
        ALTER TABLE organization.parties ADD COLUMN slug VARCHAR(50);
    END IF;
    
    -- Add color column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'parties' AND column_name = 'color') THEN
        ALTER TABLE organization.parties ADD COLUMN color VARCHAR(20);
    END IF;
    
    -- Add website column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'parties' AND column_name = 'website') THEN
        ALTER TABLE organization.parties ADD COLUMN website VARCHAR(500);
    END IF;
    
    -- Add founded_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'parties' AND column_name = 'founded_date') THEN
        ALTER TABLE organization.parties ADD COLUMN founded_date DATE;
    END IF;
    
    -- Add ideology column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'parties' AND column_name = 'ideology') THEN
        ALTER TABLE organization.parties ADD COLUMN ideology VARCHAR(200);
    END IF;
    
    -- Add spectrum column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'parties' AND column_name = 'spectrum') THEN
        ALTER TABLE organization.parties ADD COLUMN spectrum VARCHAR(50);
    END IF;
    
    -- Add registration_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'parties' AND column_name = 'registration_status') THEN
        ALTER TABLE organization.parties ADD COLUMN registration_status VARCHAR(50) DEFAULT 'active';
    END IF;
END $$;

-- Migrate abbreviation to short_name if exists
UPDATE organization.parties 
SET short_name = abbreviation 
WHERE short_name IS NULL AND abbreviation IS NOT NULL;

-- Generate slug from name if not exists
UPDATE organization.parties 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), 'á', 'a'))
WHERE slug IS NULL;

-- ==========================================
-- 2. Add missing columns to raw_social_posts (region)
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'raw_social_posts' AND column_name = 'region') THEN
        ALTER TABLE public.raw_social_posts ADD COLUMN region VARCHAR(100);
    END IF;
END $$;

-- ==========================================
-- 3. Create missing enums
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
        CREATE TYPE content_type AS ENUM ('text', 'image', 'video', 'link', 'poll');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'election_type') THEN
        CREATE TYPE election_type AS ENUM ('presidential', 'congressional', 'regional', 'municipal');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE event_type AS ENUM ('tour', 'rally', 'debate', 'press', 'fundraising', 'meeting');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'blocked');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_status') THEN
        CREATE TYPE program_status AS ENUM ('draft', 'review', 'approved', 'archived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');
    END IF;
END $$;

-- ==========================================
-- 4. Create missing tables
-- ==========================================

-- Campaign Team Members
CREATE TABLE IF NOT EXISTS organization.campaign_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES organization.campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES identity.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Campaign Assets
CREATE TABLE IF NOT EXISTS organization.campaign_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES organization.campaigns(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    size_bytes BIGINT,
    tags JSONB,
    approval_status VARCHAR(20) DEFAULT 'pending',
    uploaded_by UUID REFERENCES identity.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- A/B Tests
CREATE TABLE IF NOT EXISTS organization.ab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES organization.campaigns(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    target_regions JSONB,
    results_summary JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- A/B Test Variants
CREATE TABLE IF NOT EXISTS organization.ab_test_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES organization.ab_tests(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creative_url VARCHAR(1000),
    message_copy TEXT,
    traffic_allocation INTEGER DEFAULT 50,
    metrics JSONB
);

-- Competitor Campaigns
CREATE TABLE IF NOT EXISTS organization.competitor_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES identity.tenants(id) ON DELETE CASCADE,
    competitor_name VARCHAR(200) NOT NULL,
    campaign_name VARCHAR(200) NOT NULL,
    detected_at TIMESTAMP DEFAULT NOW(),
    regions JSONB,
    estimated_budget NUMERIC(14,2),
    sentiment_score NUMERIC(4,3),
    key_messages JSONB,
    platforms JSONB
);

-- ==========================================
-- 5. Add missing columns to campaigns table
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'campaigns' AND column_name = 'objective') THEN
        ALTER TABLE organization.campaigns ADD COLUMN objective VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'campaigns' AND column_name = 'target_demographics') THEN
        ALTER TABLE organization.campaigns ADD COLUMN target_demographics JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'campaigns' AND column_name = 'budget_details') THEN
        ALTER TABLE organization.campaigns ADD COLUMN budget_details JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'campaigns' AND column_name = 'performance_metrics') THEN
        ALTER TABLE organization.campaigns ADD COLUMN performance_metrics JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'campaigns' AND column_name = 'crisis_protocol') THEN
        ALTER TABLE organization.campaigns ADD COLUMN crisis_protocol JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'organization' AND table_name = 'campaigns' AND column_name = 'updated_at') THEN
        ALTER TABLE organization.campaigns ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- ==========================================
-- 6. Update tenant slug to match dev team expectation
-- ==========================================
UPDATE identity.tenants 
SET slug = 'politica-pe', name = 'PoliticaPE'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ==========================================
-- 7. Create unique constraint on parties slug if not exists
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'parties_tenant_id_slug_key'
    ) THEN
        BEGIN
            ALTER TABLE organization.parties ADD CONSTRAINT parties_tenant_id_slug_key UNIQUE (tenant_id, slug);
        EXCEPTION WHEN duplicate_table THEN
            NULL;
        END;
    END IF;
END $$;

SELECT 'Schema alignment completed successfully!' as result;
