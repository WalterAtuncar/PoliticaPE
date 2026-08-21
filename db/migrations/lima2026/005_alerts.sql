-- 005: alertas por candidato
CREATE TABLE IF NOT EXISTS public.alerts (
    id VARCHAR PRIMARY KEY,
    figure_id VARCHAR NULL,
    kind VARCHAR(20) NOT NULL,                  -- crisis | opportunity | attack | spike
    severity VARCHAR(10) NOT NULL,              -- low | medium | high | critical
    title VARCHAR(300) NOT NULL,
    detail TEXT,
    metrics JSONB,                              -- {"mentions_1h":..,"baseline_1h":..,"neg_share":..,"velocity":..}
    evidence JSONB,                             -- [{"content_type","content_id","url","snippet","source"}]
    suggested_response TEXT,
    status VARCHAR(20) DEFAULT 'open',          -- open | acknowledged | dismissed | responded
    created_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP NULL,
    acknowledged_by VARCHAR NULL,
    dedup_key VARCHAR(200)                      -- figure_id|kind|ventana, evita duplicados en la misma hora
);
CREATE INDEX IF NOT EXISTS idx_alerts_status_time ON public.alerts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_figure ON public.alerts (figure_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_alerts_dedup ON public.alerts (dedup_key);
