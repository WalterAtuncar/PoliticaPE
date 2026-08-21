-- 007: resultados electorales por distrito (ONPE o carga manual)
CREATE TABLE IF NOT EXISTS public.election_results (
    id VARCHAR PRIMARY KEY,
    ubigeo VARCHAR(6) NOT NULL,
    district_name VARCHAR(100),
    figure_id VARCHAR NULL,
    list_name VARCHAR(200) NOT NULL,
    votes INTEGER,
    pct_valid NUMERIC(5,2),
    actas_pct NUMERIC(5,2),                     -- % de actas contabilizadas al momento de la carga
    source VARCHAR(50) NOT NULL,                -- 'onpe' | 'manual' | 'flash_<encuestadora>'
    loaded_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (ubigeo, list_name, source)
);
CREATE INDEX IF NOT EXISTS idx_results_ubigeo ON public.election_results (ubigeo);
