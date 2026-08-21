-- 004: brief diario
CREATE TABLE IF NOT EXISTS public.daily_briefs (
    id VARCHAR PRIMARY KEY,
    brief_date DATE NOT NULL UNIQUE,
    generated_at TIMESTAMP DEFAULT NOW(),
    model VARCHAR(60),
    headline VARCHAR(300),
    body_markdown TEXT NOT NULL,
    data JSONB,                                 -- métricas usadas para generarlo (auditable)
    sent_channels JSONB,                        -- {"telegram": true, "email": false}
    status VARCHAR(20) DEFAULT 'generated'      -- generated | sent | failed
);
