-- 003: clasificación por IA — una fila por (contenido, figura mencionada)
-- Idempotente.

CREATE TABLE IF NOT EXISTS public.content_classifications (
    id VARCHAR PRIMARY KEY,
    content_type VARCHAR(10) NOT NULL,          -- 'news' | 'social'
    content_id VARCHAR NOT NULL,                -- news_articles.id | raw_social_posts.id
    figure_id VARCHAR NULL,                     -- political_figures.id (NULL = sin figura)
    stance NUMERIC(4,3),                        -- -1..1 sentimiento HACIA la figura
    stance_label VARCHAR(10),                   -- positivo | neutro | negativo
    topic VARCHAR(40) NOT NULL,
    secondary_topics JSONB,
    is_attack BOOLEAN DEFAULT FALSE,
    attacker_figure_id VARCHAR NULL,
    attacked_figure_id VARCHAR NULL,
    districts JSONB,                            -- [{"ubigeo":"150132","name":"San Juan de Lurigancho"}]
    zone VARCHAR(20),                           -- Lima Norte | Lima Este | Lima Centro | Lima Moderna | Lima Sur | NULL
    summary VARCHAR(300),
    relevance NUMERIC(3,2),                     -- 0..1
    model VARCHAR(60),
    classified_at TIMESTAMP DEFAULT NOW(),
    content_published_at TIMESTAMP NULL         -- copia de published_at/created_at del contenido, para series de tiempo sin JOIN
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_classification_content_figure
    ON public.content_classifications (content_type, content_id, COALESCE(figure_id, ''));
CREATE INDEX IF NOT EXISTS idx_classification_figure_time ON public.content_classifications (figure_id, content_published_at);
CREATE INDEX IF NOT EXISTS idx_classification_topic_time ON public.content_classifications (topic, content_published_at);
CREATE INDEX IF NOT EXISTS idx_classification_zone ON public.content_classifications (zone);
CREATE INDEX IF NOT EXISTS idx_classification_attack ON public.content_classifications (attacked_figure_id) WHERE is_attack;
