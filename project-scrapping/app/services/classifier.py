import logging
import os
import time
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Literal, Optional

import anthropic
from pydantic import BaseModel, Field
from sqlalchemy import or_, text
from sqlalchemy.orm import Session

from app.models import NewsArticle, PoliticalFigure, RawSocialPost
from app.services import lima_geo
from app.services.claude_client import get_client, has_key, model

logger = logging.getLogger(__name__)

BATCH_SIZE = int(os.getenv("CLASSIFY_BATCH_SIZE", "20"))
DAILY_LIMIT = int(os.getenv("CLASSIFY_DAILY_LIMIT", "3000"))
MAX_CONTENT_CHARS = 1200

TOPICS = [
    "inseguridad", "extorsion", "transporte", "limpieza_residuos", "obras_infraestructura",
    "corrupcion", "legalidad_candidatura", "comercio_informal", "espacios_publicos_ambiente",
    "servicios_basicos", "gestion_municipal", "economia_empleo", "vivienda_urbanismo",
    "campana_electoral", "gobierno_nacional", "otro",
]

TOPIC_LABELS = {
    "inseguridad": "Inseguridad ciudadana", "extorsion": "Extorsión",
    "transporte": "Transporte y tránsito", "limpieza_residuos": "Basura y limpieza",
    "obras_infraestructura": "Obras e infraestructura", "corrupcion": "Corrupción y fiscalización",
    "legalidad_candidatura": "Legalidad de candidaturas", "comercio_informal": "Comercio informal",
    "espacios_publicos_ambiente": "Espacios públicos y ambiente", "servicios_basicos": "Agua, desagüe y servicios",
    "gestion_municipal": "Gestión municipal", "economia_empleo": "Economía y empleo",
    "vivienda_urbanismo": "Vivienda y urbanismo", "campana_electoral": "Campaña y encuestas",
    "gobierno_nacional": "Gobierno central", "otro": "Otro",
}

Topic = Literal[
    "inseguridad", "extorsion", "transporte", "limpieza_residuos", "obras_infraestructura",
    "corrupcion", "legalidad_candidatura", "comercio_informal", "espacios_publicos_ambiente",
    "servicios_basicos", "gestion_municipal", "economia_empleo", "vivienda_urbanismo",
    "campana_electoral", "gobierno_nacional", "otro",
]


class FigureStance(BaseModel):
    figure: str = Field(description="display_name EXACTO de la lista de figuras")
    stance: float = Field(ge=-1, le=1, description="Sentimiento del texto HACIA esta figura. -1 muy negativo, 0 neutro/informativo, 1 muy positivo")
    is_attacked: bool = Field(description="True si el texto contiene un ataque, critica o acusacion dirigida a esta figura")
    attacked_by: Optional[str] = Field(default=None, description="display_name del atacante si el ataque lo hace otra figura de la lista; null si es un medio, ciudadano o desconocido")


class ItemClassification(BaseModel):
    item_id: str
    relevance: float = Field(ge=0, le=1, description="Relevancia para la campana municipal de Lima 2026. 0 = nada que ver, 1 = central")
    topic: Topic
    secondary_topics: List[Topic] = Field(default_factory=list, max_length=2)
    districts: List[str] = Field(default_factory=list, description="Distritos de Lima Metropolitana mencionados o claramente implicados")
    figures: List[FigureStance] = Field(default_factory=list, description="Una entrada por cada figura de la lista que el texto mencione o aluda claramente")
    summary: str = Field(max_length=200, description="Una frase en espanol que resuma el hecho, sin opinion")


class BatchClassification(BaseModel):
    items: List[ItemClassification]


_system_cache: Dict[str, Any] = {"text": None, "at": 0.0}
SYSTEM_TTL_SECONDS = 600


def _stance_label(stance: Optional[float]) -> str:
    if stance is None:
        return "neutro"
    if stance > 0.15:
        return "positivo"
    if stance < -0.15:
        return "negativo"
    return "neutro"


def build_system_prompt(db: Session, force: bool = False) -> str:
    now = time.time()
    if not force and _system_cache["text"] and now - _system_cache["at"] < SYSTEM_TTL_SECONDS:
        return _system_cache["text"]

    figures = db.query(PoliticalFigure).filter(PoliticalFigure.is_active == True).all()
    fig_lines = []
    for f in figures:
        alias = list(f.search_keywords or [])
        if f.nickname:
            alias.append(f.nickname)
        fig_lines.append(f"- {f.display_name} — alias: {', '.join(alias) or 'sin alias'} — rol: {f.figure_role or 'candidate'}")

    dist_lines = [
        f"- {d['display']} — {', '.join(d.get('aliases', [])) or 'sin alias'}"
        for d in lima_geo.all_districts()
    ]

    prompt = f"""Eres un analista de opinion publica que clasifica noticias y publicaciones de redes sociales para el equipo de una campana a la alcaldia de Lima Metropolitana (eleccion del 4 de octubre de 2026, una sola vuelta, 21 listas).

Para cada texto devuelve exactamente una clasificacion. Reglas:
1. `topic` es UNO de la taxonomia; usa `secondary_topics` para hasta dos mas. "extorsion" prevalece sobre "inseguridad" si hay cupos/extorsion explicita. "legalidad_candidatura" prevalece sobre "campana_electoral" si hay JNE/JEE/tacha/renuncia/sucesion. "gestion_municipal" es para la gestion actual (Reggiardo / Municipalidad de Lima), no para promesas de candidatos.
2. `figures`: incluye solo figuras de la lista que el texto mencione por nombre, apellido, apodo o cargo inequivoco ("el alcalde de Lima" = Renzo Reggiardo; "la presidenta" = Keiko Fujimori). No incluyas figuras por mera asociacion de partido.
3. `stance` mide el sentimiento HACIA la figura, no el tono general del texto. Una noticia que informa que un candidato denuncia a otro es negativa para el denunciado y neutra o levemente positiva para el denunciante. Texto puramente informativo = 0.
4. `is_attacked` es true solo ante critica, acusacion, burla o denuncia dirigida a la figura. `attacked_by` solo si el atacante es otra figura de la lista.
5. `districts`: solo distritos de Lima Metropolitana de la lista. "Lima" a secas no es un distrito. Callao no es Lima Metropolitana.
6. `relevance`: 0 si el texto no tiene relacion con Lima, sus problemas urbanos o la eleccion municipal; 1 si trata directamente de la campana o de un problema municipal de Lima.
7. No inventes figuras ni distritos. Si dudas, omite.
8. `summary`: espanol neutro, maximo 200 caracteres, sin adjetivos valorativos.

FIGURAS (display_name — alias/apodos — rol):
{chr(10).join(fig_lines)}

DISTRITOS DE LIMA METROPOLITANA (nombre — alias):
{chr(10).join(dist_lines)}

TAXONOMIA DE TEMAS: {', '.join(TOPICS)}."""

    _system_cache["text"] = prompt
    _system_cache["at"] = now
    return prompt


def _figure_keyword_conditions(model_class, fields: List[str], keywords: List[str]):
    conditions = []
    for kw in keywords:
        for field_name in fields:
            conditions.append(getattr(model_class, field_name).ilike(f"%{kw}%"))
    return conditions


def select_pending(db: Session, limit: int) -> List[Dict[str, Any]]:
    """Contenido sin clasificar que es de Lima o menciona a una figura monitoreada.
    Mezcla 70 % noticias / 30 % posts."""
    keywords = [
        kw for (kws,) in db.query(PoliticalFigure.search_keywords).filter(PoliticalFigure.is_active == True).all()
        for kw in (kws or []) if kw and len(kw) >= 4
    ]
    keywords = list(dict.fromkeys(keywords))

    n_news = max(1, int(limit * 0.7))
    n_social = max(1, limit - n_news)
    items: List[Dict[str, Any]] = []

    news_conditions = [NewsArticle.scope == "lima_metropolitana"]
    if keywords:
        news_conditions += _figure_keyword_conditions(NewsArticle, ["title", "content"], keywords)
    news = (
        db.query(NewsArticle)
        .filter(NewsArticle.classified == False)
        .filter(or_(*news_conditions))
        .order_by(NewsArticle.published_at.desc().nullslast())
        .limit(n_news)
        .all()
    )
    for a in news:
        items.append({
            "item_id": str(a.id),
            "content_type": "news",
            "source": a.source,
            "title": a.title or "",
            "content": (a.content or "")[:MAX_CONTENT_CHARS],
            "published_at": a.published_at or a.scraped_at,
        })

    social_conditions = [RawSocialPost.scope == "lima_metropolitana"]
    if keywords:
        social_conditions += _figure_keyword_conditions(RawSocialPost, ["content"], keywords)
    posts = (
        db.query(RawSocialPost)
        .filter(RawSocialPost.classified == False)
        .filter(or_(*social_conditions))
        .order_by(RawSocialPost.created_at.desc().nullslast())
        .limit(n_social)
        .all()
    )
    for p in posts:
        items.append({
            "item_id": str(p.id),
            "content_type": "social",
            "source": f"{p.platform}/{p.author or 'anon'}",
            "title": "",
            "content": (p.content or "")[:MAX_CONTENT_CHARS],
            "published_at": p.created_at or p.scraped_at,
        })

    return items


def build_user_message(items: List[Dict[str, Any]]) -> str:
    parts = [f"Clasifica los siguientes {len(items)} textos. Devuelve una entrada por item_id, en el mismo orden.\n"]
    for it in items:
        date = it["published_at"].strftime("%Y-%m-%d") if it.get("published_at") else "sin fecha"
        parts.append(
            f"--- item_id: {it['item_id']} | tipo: {it['content_type']} | fuente: {it['source']} | fecha: {date}\n"
            f"{it['title']}\n{it['content']}\n"
        )
    return "\n".join(parts)


def _figure_maps(db: Session):
    figures = db.query(PoliticalFigure).filter(PoliticalFigure.is_active == True).all()
    by_name = {}
    for f in figures:
        by_name[f.display_name.strip().lower()] = f.id
        if f.full_name:
            by_name[f.full_name.strip().lower()] = f.id
        if f.nickname:
            by_name[f.nickname.strip().lower()] = f.id
    return by_name


def _persist(db: Session, items: List[Dict[str, Any]], parsed: BatchClassification, model_name: str) -> int:
    by_name = _figure_maps(db)
    by_id = {it["item_id"]: it for it in items}
    saved = 0

    for res in parsed.items:
        src = by_id.get(res.item_id)
        if not src:
            logger.warning(f"[Classifier] item_id desconocido en la respuesta: {res.item_id}")
            continue

        districts = []
        for name in res.districts:
            d = lima_geo.district_by_name(name)
            if d:
                districts.append({"ubigeo": d["ubigeo"], "name": d["display"], "zone": d["zone"]})
        zone = districts[0]["zone"] if districts else None
        secondary = [t for t in res.secondary_topics if t != res.topic][:2]
        published = src.get("published_at")

        rows = []
        for fs in res.figures:
            fid = by_name.get(fs.figure.strip().lower())
            if not fid:
                logger.warning(f"[Classifier] figura desconocida ignorada: {fs.figure}")
                continue
            attacker = by_name.get((fs.attacked_by or "").strip().lower()) if fs.attacked_by else None
            rows.append({
                "figure_id": fid,
                "stance": fs.stance,
                "stance_label": _stance_label(fs.stance),
                "is_attack": bool(fs.is_attacked),
                "attacker_figure_id": attacker,
                "attacked_figure_id": fid if fs.is_attacked else None,
            })

        if not rows:
            rows.append({
                "figure_id": None, "stance": None, "stance_label": None,
                "is_attack": False, "attacker_figure_id": None, "attacked_figure_id": None,
            })

        for r in rows:
            db.execute(text("""
                INSERT INTO content_classifications
                    (id, content_type, content_id, figure_id, stance, stance_label, topic, secondary_topics,
                     is_attack, attacker_figure_id, attacked_figure_id, districts, zone, summary, relevance,
                     model, classified_at, content_published_at)
                VALUES
                    (:id, :content_type, :content_id, :figure_id, :stance, :stance_label, :topic,
                     CAST(:secondary_topics AS jsonb), :is_attack, :attacker_figure_id, :attacked_figure_id,
                     CAST(:districts AS jsonb), :zone, :summary, :relevance, :model, NOW(), :published)
                ON CONFLICT (content_type, content_id, COALESCE(figure_id, ''))
                DO UPDATE SET stance = EXCLUDED.stance, stance_label = EXCLUDED.stance_label,
                              topic = EXCLUDED.topic, secondary_topics = EXCLUDED.secondary_topics,
                              is_attack = EXCLUDED.is_attack, attacker_figure_id = EXCLUDED.attacker_figure_id,
                              attacked_figure_id = EXCLUDED.attacked_figure_id, districts = EXCLUDED.districts,
                              zone = EXCLUDED.zone, summary = EXCLUDED.summary, relevance = EXCLUDED.relevance,
                              model = EXCLUDED.model, classified_at = NOW(),
                              content_published_at = EXCLUDED.content_published_at
            """), {
                "id": str(uuid.uuid4()),
                "content_type": src["content_type"],
                "content_id": src["item_id"],
                "figure_id": r["figure_id"],
                "stance": r["stance"],
                "stance_label": r["stance_label"],
                "topic": res.topic,
                "secondary_topics": __import__("json").dumps(secondary),
                "is_attack": r["is_attack"],
                "attacker_figure_id": r["attacker_figure_id"],
                "attacked_figure_id": r["attacked_figure_id"],
                "districts": __import__("json").dumps(districts),
                "zone": zone,
                "summary": res.summary,
                "relevance": res.relevance,
                "model": model_name,
                "published": published,
            })
            saved += 1

        table = "news_articles" if src["content_type"] == "news" else "raw_social_posts"
        db.execute(text(f"""
            UPDATE {table}
            SET classified = TRUE, topics = CAST(:topics AS jsonb)
            WHERE id = CAST(:cid AS uuid)
        """), {
            "topics": __import__("json").dumps({"topic": res.topic, "secondary": secondary}),
            "cid": src["item_id"],
        })

    db.commit()
    return saved


def classify_batch(db: Session, items: List[Dict[str, Any]], dry_run: bool = False):
    """Clasifica un lote. Con dry_run=True devuelve el objeto parseado sin persistir."""
    if not items:
        return None if dry_run else 0
    if not has_key():
        raise RuntimeError("ANTHROPIC_API_KEY no esta configurada")

    system_prompt = build_system_prompt(db)
    user_text = build_user_message(items)
    model_name = model("classifier")

    def _call():
        return get_client().messages.parse(
            model=model_name,
            max_tokens=8000,
            thinking={"type": "adaptive"},
            output_config={"effort": "low"},
            system=[{"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}],
            messages=[{"role": "user", "content": user_text}],
            output_format=BatchClassification,
        )

    try:
        response = _call()
    except anthropic.RateLimitError:
        logger.warning("[Classifier] rate limit, reintentando en 30 s")
        time.sleep(30)
        response = _call()
    except anthropic.APIStatusError as e:
        logger.error(f"[Classifier] error de API {getattr(e, 'status_code', '?')}: {e}")
        raise

    parsed: BatchClassification = response.parsed_output
    usage = getattr(response, "usage", None)
    if usage is not None:
        logger.info(
            f"[Classifier] lote de {len(items)} -> {len(parsed.items)} clasificados "
            f"(in {getattr(usage, 'input_tokens', '?')} / out {getattr(usage, 'output_tokens', '?')} tokens)"
        )

    if dry_run:
        return parsed
    return _persist(db, items, parsed, model_name)


def _classified_today(db: Session) -> int:
    return int(db.execute(text("""
        SELECT count(DISTINCT content_id) FROM content_classifications
        WHERE classified_at >= date_trunc('day', NOW())
    """)).scalar() or 0)


def run_classification_cycle(db_url: str, max_items: Optional[int] = None,
                             ignore_daily_limit: bool = False) -> Dict[str, Any]:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(db_url)
    db = sessionmaker(bind=engine)()
    result = {"classified": 0, "batches": 0, "skipped_daily_limit": False}

    try:
        if not ignore_daily_limit:
            done_today = _classified_today(db)
            if done_today >= DAILY_LIMIT:
                result["skipped_daily_limit"] = True
                return result
            budget = DAILY_LIMIT - done_today
        else:
            budget = max_items or 10 ** 9

        remaining = min(budget, max_items or budget)
        while remaining > 0:
            batch = select_pending(db, min(BATCH_SIZE, remaining))
            if not batch:
                break
            try:
                classify_batch(db, batch)
            except Exception as e:
                logger.error(f"[Classifier] lote fallido: {e}")
                break
            result["classified"] += len(batch)
            result["batches"] += 1
            remaining -= len(batch)
        return result
    finally:
        db.close()
