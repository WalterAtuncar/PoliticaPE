-- 002: ámbito (Lima / nacional), distritos detectados, temas y bandera de clasificación
-- Idempotente.

ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS scope VARCHAR(30);
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS districts JSONB;
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS topics JSONB;
ALTER TABLE public.news_articles ADD COLUMN IF NOT EXISTS classified BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_news_scope ON public.news_articles (scope);
CREATE INDEX IF NOT EXISTS idx_news_classified ON public.news_articles (classified);

ALTER TABLE public.raw_social_posts ADD COLUMN IF NOT EXISTS scope VARCHAR(30);
ALTER TABLE public.raw_social_posts ADD COLUMN IF NOT EXISTS districts JSONB;
ALTER TABLE public.raw_social_posts ADD COLUMN IF NOT EXISTS topics JSONB;
ALTER TABLE public.raw_social_posts ADD COLUMN IF NOT EXISTS classified BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_social_scope ON public.raw_social_posts (scope);
CREATE INDEX IF NOT EXISTS idx_social_classified ON public.raw_social_posts (classified);
