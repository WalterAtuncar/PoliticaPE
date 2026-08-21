-- 001: columnas municipales en political_figures + marcar encuestas antiguas como presidenciales
-- Idempotente. Aplicar con scripts/apply_migrations.py

ALTER TABLE public.political_figures ADD COLUMN IF NOT EXISTS figure_role VARCHAR(30) DEFAULT 'candidate';
ALTER TABLE public.political_figures ADD COLUMN IF NOT EXISTS is_own_candidate BOOLEAN DEFAULT FALSE;
ALTER TABLE public.political_figures ADD COLUMN IF NOT EXISTS list_name VARCHAR(200);
ALTER TABLE public.political_figures ADD COLUMN IF NOT EXISTS color VARCHAR(20);
ALTER TABLE public.political_figures ADD COLUMN IF NOT EXISTS zone_strength JSONB;

CREATE INDEX IF NOT EXISTS idx_political_figure_role ON public.political_figures (figure_role);

-- Las 96 encuestas existentes son de la elección presidencial: etiquetarlas para que /race las excluya
UPDATE public.scraped_surveys
SET results = results::jsonb || '{"ambito": "presidencial_2026"}'::jsonb
WHERE (results::jsonb ->> 'ambito') IS NULL;

-- results es JSON (no JSONB) en el modelo SQLAlchemy; el cast anterior funciona en ambos casos.
