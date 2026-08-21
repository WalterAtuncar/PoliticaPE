import os
import json
import logging
import re
import uuid
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Literal, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, text
from collections import defaultdict

from app.models import (
    PoliticalFigure, RawSocialPost, NewsArticle,
    AIRecommendationRecord, ScrapedSurvey, GovernmentData,
)
from app import electoral_config as ec

logger = logging.getLogger(__name__)

CONTEXT_DAYS = 120
MAX_SOCIAL_POSTS = 800
MAX_NEWS = 300
MAX_SURVEYS = 50
MAX_GOV_DATA = 30


def _sanitize_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[#@]\w+', lambda m: m.group(0) if len(m.group(0)) > 3 else '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:500]


def _classify_sentiment(score: float) -> str:
    if score is None:
        return "neutro"
    if score > 0.15:
        return "positivo"
    if score < -0.15:
        return "negativo"
    return "neutro"


def _build_keyword_conditions(model_class, field_names: List[str], keywords: List[str]):
    conditions = []
    for kw in keywords:
        for field_name in field_names:
            field = getattr(model_class, field_name)
            conditions.append(field.ilike(f"%{kw}%"))
    return conditions


def gather_figure_context(db: Session, figure: PoliticalFigure) -> Dict[str, Any]:
    keywords = figure.search_keywords or []
    if not keywords:
        keywords = [figure.display_name]
    if figure.full_name and figure.full_name != figure.display_name:
        keywords = list(set(keywords + [figure.full_name]))
    if figure.nickname:
        keywords = list(set(keywords + [figure.nickname]))

    since = datetime.utcnow() - timedelta(days=CONTEXT_DAYS)

    social_data = _gather_social_data(db, keywords, since)
    news_data = _gather_news_data(db, keywords, since)
    survey_data = _gather_survey_data(db, keywords, since)
    gov_data = _gather_government_data(db, keywords, since)
    incidents = _extract_incidents(social_data, news_data)
    weekly_trends = _compute_weekly_trends(social_data["posts_raw"], news_data["articles_raw"], since)

    return {
        "figure": {
            "full_name": figure.full_name,
            "display_name": figure.display_name,
            "nickname": figure.nickname or "",
            "party_name": figure.party_name or "Independiente",
            "current_position": figure.current_position or "No especificado",
            "region": figure.region or "Nacional",
            "social_accounts": figure.social_accounts or [],
        },
        "social_media": social_data["summary"],
        "news_media": news_data["summary"],
        "surveys": survey_data,
        "government": gov_data,
        "incidents": incidents,
        "weekly_trends": weekly_trends,
    }


def _gather_social_data(db: Session, keywords: List[str], since: datetime) -> Dict[str, Any]:
    conditions = _build_keyword_conditions(RawSocialPost, ["content"], keywords)
    if not conditions:
        return {"summary": {}, "posts_raw": []}

    posts = db.query(RawSocialPost).filter(
        or_(*conditions),
        RawSocialPost.scraped_at >= since
    ).order_by(RawSocialPost.scraped_at.desc()).limit(MAX_SOCIAL_POSTS).all()

    total = len(posts)
    sentiments = [p.sentiment_score for p in posts if p.sentiment_score is not None]
    avg_sentiment = round(sum(sentiments) / len(sentiments), 3) if sentiments else 0.0

    platform_stats = defaultdict(lambda: {"count": 0, "engagement": 0, "sentiment_sum": 0, "sentiment_count": 0})
    region_counts: Dict[str, int] = defaultdict(int)
    total_engagement = 0

    positive_posts = []
    negative_posts = []
    neutral_posts = []

    for p in posts:
        metrics = p.engagement_metrics or {}
        engagement = sum(v or 0 for v in [
            metrics.get("likes", 0), metrics.get("comments", 0),
            metrics.get("shares", 0), metrics.get("views", 0),
        ])
        total_engagement += engagement

        plat = p.platform or "desconocida"
        platform_stats[plat]["count"] += 1
        platform_stats[plat]["engagement"] += engagement
        if p.sentiment_score is not None:
            platform_stats[plat]["sentiment_sum"] += p.sentiment_score
            platform_stats[plat]["sentiment_count"] += 1

        region = p.region or p.geographic_location or "Desconocida"
        region_counts[region] += 1

        sentiment_class = _classify_sentiment(p.sentiment_score)
        post_entry = {
            "platform": plat,
            "content": _sanitize_text(p.content),
            "sentiment": round(p.sentiment_score, 3) if p.sentiment_score is not None else 0,
            "sentiment_class": sentiment_class,
            "engagement": engagement,
            "date": p.scraped_at.strftime("%Y-%m-%d") if p.scraped_at else None,
            "author": p.author or "",
        }

        if sentiment_class == "positivo":
            positive_posts.append(post_entry)
        elif sentiment_class == "negativo":
            negative_posts.append(post_entry)
        else:
            neutral_posts.append(post_entry)

    positive_posts.sort(key=lambda x: x["engagement"], reverse=True)
    negative_posts.sort(key=lambda x: x["engagement"], reverse=True)
    neutral_posts.sort(key=lambda x: x["engagement"], reverse=True)

    sentiment_trend = "estable"
    if len(posts) >= 10:
        third = len(posts) // 3
        recent = [p.sentiment_score for p in posts[:third] if p.sentiment_score is not None]
        older = [p.sentiment_score for p in posts[-third:] if p.sentiment_score is not None]
        if recent and older:
            diff = (sum(recent) / len(recent)) - (sum(older) / len(older))
            if diff > 0.08:
                sentiment_trend = "mejorando"
            elif diff < -0.08:
                sentiment_trend = "empeorando"

    sentiment_distribution = {
        "positivo": len(positive_posts),
        "neutro": len(neutral_posts),
        "negativo": len(negative_posts),
    }

    platforms_summary = []
    for plat, stats in sorted(platform_stats.items(), key=lambda x: x[1]["count"], reverse=True)[:6]:
        avg_s = round(stats["sentiment_sum"] / stats["sentiment_count"], 3) if stats["sentiment_count"] > 0 else 0
        platforms_summary.append({
            "platform": plat,
            "mentions": stats["count"],
            "engagement": stats["engagement"],
            "avg_sentiment": avg_s,
        })

    top_regions = sorted(region_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    summary = {
        "total_mentions": total,
        "sentiment_average": avg_sentiment,
        "sentiment_trend": sentiment_trend,
        "sentiment_distribution": sentiment_distribution,
        "total_engagement": total_engagement,
        "platforms": platforms_summary,
        "top_regions": [{"region": r, "mentions": c} for r, c in top_regions],
        "top_positive_posts": positive_posts[:8],
        "top_negative_posts": negative_posts[:8],
        "top_neutral_posts": neutral_posts[:5],
    }

    return {"summary": summary, "posts_raw": posts}


def _gather_news_data(db: Session, keywords: List[str], since: datetime) -> Dict[str, Any]:
    conditions = _build_keyword_conditions(NewsArticle, ["title", "content"], keywords)
    if not conditions:
        return {"summary": {}, "articles_raw": []}

    articles = db.query(NewsArticle).filter(
        or_(*conditions),
        NewsArticle.scraped_at >= since
    ).order_by(NewsArticle.scraped_at.desc()).limit(MAX_NEWS).all()

    total = len(articles)
    sentiments = [a.sentiment_score for a in articles if a.sentiment_score is not None]
    avg_sentiment = round(sum(sentiments) / len(sentiments), 3) if sentiments else 0.0

    source_stats = defaultdict(lambda: {"count": 0, "sentiment_sum": 0, "sentiment_count": 0})
    category_counts: Dict[str, int] = defaultdict(int)

    positive_news = []
    negative_news = []
    neutral_news = []

    for a in articles:
        src = a.source or "desconocida"
        source_stats[src]["count"] += 1
        if a.sentiment_score is not None:
            source_stats[src]["sentiment_sum"] += a.sentiment_score
            source_stats[src]["sentiment_count"] += 1

        cat = a.category or "General"
        category_counts[cat] += 1

        sentiment_class = _classify_sentiment(a.sentiment_score)
        entry = {
            "source": src,
            "title": _sanitize_text(a.title),
            "content_preview": _sanitize_text(a.content)[:200] if a.content else "",
            "sentiment": round(a.sentiment_score, 3) if a.sentiment_score is not None else 0,
            "sentiment_class": sentiment_class,
            "category": cat,
            "date": a.published_at.strftime("%Y-%m-%d") if a.published_at else (a.scraped_at.strftime("%Y-%m-%d") if a.scraped_at else None),
            "url": a.url or "",
        }

        if sentiment_class == "positivo":
            positive_news.append(entry)
        elif sentiment_class == "negativo":
            negative_news.append(entry)
        else:
            neutral_news.append(entry)

    sources_summary = []
    for src, stats in sorted(source_stats.items(), key=lambda x: x[1]["count"], reverse=True)[:10]:
        avg_s = round(stats["sentiment_sum"] / stats["sentiment_count"], 3) if stats["sentiment_count"] > 0 else 0
        sources_summary.append({
            "source": src,
            "articles": stats["count"],
            "avg_sentiment": avg_s,
        })

    summary = {
        "total_articles": total,
        "sentiment_average": avg_sentiment,
        "sentiment_distribution": {
            "positivo": len(positive_news),
            "neutro": len(neutral_news),
            "negativo": len(negative_news),
        },
        "sources": sources_summary,
        "categories": dict(sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:8]),
        "top_positive_news": positive_news[:6],
        "top_negative_news": negative_news[:6],
        "top_neutral_news": neutral_news[:4],
    }

    return {"summary": summary, "articles_raw": articles}


def _gather_survey_data(db: Session, keywords: List[str], since: datetime) -> Dict[str, Any]:
    conditions = []
    for kw in keywords:
        conditions.append(ScrapedSurvey.title.ilike(f"%{kw}%"))

    if not conditions:
        return {"total_surveys": 0, "data": []}

    surveys = db.query(ScrapedSurvey).filter(
        or_(*conditions),
        ScrapedSurvey.scraped_at >= since
    ).order_by(ScrapedSurvey.scraped_at.desc()).limit(MAX_SURVEYS).all()

    if not surveys:
        all_surveys = db.query(ScrapedSurvey).filter(
            ScrapedSurvey.scraped_at >= since
        ).order_by(ScrapedSurvey.scraped_at.desc()).limit(MAX_SURVEYS).all()

        relevant = []
        for s in all_surveys:
            results_str = json.dumps(s.results or {}, ensure_ascii=False).lower()
            if any(kw.lower() in results_str or kw.lower() in (s.title or "").lower() for kw in keywords):
                relevant.append(s)
        surveys = relevant

    if not surveys:
        return {"total_surveys": 0, "data": []}

    survey_entries = []
    for s in surveys:
        raw_results = s.results if isinstance(s.results, dict) else {}
        sanitized_results = {}
        for k, v in raw_results.items():
            sanitized_results[_sanitize_text(str(k))[:100]] = _sanitize_text(str(v))[:300] if isinstance(v, str) else v

        survey_entries.append({
            "title": _sanitize_text(s.title),
            "source": _sanitize_text(s.source) if s.source else "",
            "pollster": _sanitize_text(s.pollster) if s.pollster else "",
            "methodology": _sanitize_text(s.methodology)[:200] if s.methodology else "",
            "sample_size": s.sample_size,
            "margin_error": s.margin_error,
            "results": sanitized_results,
            "date": s.published_at.strftime("%Y-%m-%d") if s.published_at else None,
        })

    return {
        "total_surveys": len(survey_entries),
        "data": survey_entries[:15],
    }


def _gather_government_data(db: Session, keywords: List[str], since: datetime) -> Dict[str, Any]:
    conditions = _build_keyword_conditions(GovernmentData, ["title"], keywords)

    if conditions:
        gov_records = db.query(GovernmentData).filter(
            or_(*conditions),
            GovernmentData.scraped_at >= since
        ).order_by(GovernmentData.scraped_at.desc()).limit(MAX_GOV_DATA).all()
    else:
        gov_records = []

    if not gov_records:
        gov_records = db.query(GovernmentData).filter(
            GovernmentData.scraped_at >= since
        ).order_by(GovernmentData.scraped_at.desc()).limit(10).all()

    if not gov_records:
        return {"total": 0, "data": []}

    entries = []
    for g in gov_records:
        content_str = ""
        if isinstance(g.content, dict):
            content_str = _sanitize_text(json.dumps(g.content, ensure_ascii=False))[:300]
        elif isinstance(g.content, str):
            content_str = _sanitize_text(g.content)[:300]

        entries.append({
            "title": _sanitize_text(g.title),
            "source": _sanitize_text(g.source) if g.source else "",
            "type": _sanitize_text(g.data_type) if g.data_type else "",
            "department": _sanitize_text(g.department) if g.department else "",
            "content_preview": content_str,
            "date": g.published_at.strftime("%Y-%m-%d") if g.published_at else None,
        })

    return {"total": len(entries), "data": entries}


def _extract_incidents(social_data: Dict, news_data: Dict) -> List[Dict[str, Any]]:
    incidents = []
    seen_titles = set()

    for post in social_data.get("summary", {}).get("top_negative_posts", []):
        content = post.get("content", "")
        if len(content) > 30 and content[:50] not in seen_titles:
            seen_titles.add(content[:50])
            incidents.append({
                "type": "social_negative",
                "source": f"Redes Sociales ({post.get('platform', '')})",
                "description": content[:300],
                "sentiment": post.get("sentiment", 0),
                "sentiment_class": "negativo",
                "engagement": post.get("engagement", 0),
                "date": post.get("date", ""),
                "action_needed": "remediar",
            })

    for post in social_data.get("summary", {}).get("top_positive_posts", []):
        content = post.get("content", "")
        if len(content) > 30 and content[:50] not in seen_titles:
            seen_titles.add(content[:50])
            incidents.append({
                "type": "social_positive",
                "source": f"Redes Sociales ({post.get('platform', '')})",
                "description": content[:300],
                "sentiment": post.get("sentiment", 0),
                "sentiment_class": "positivo",
                "engagement": post.get("engagement", 0),
                "date": post.get("date", ""),
                "action_needed": "potenciar",
            })

    for article in news_data.get("summary", {}).get("top_negative_news", []):
        title = article.get("title", "")
        if title and title not in seen_titles:
            seen_titles.add(title)
            incidents.append({
                "type": "news_negative",
                "source": f"Prensa ({article.get('source', '')})",
                "description": f"{title}. {article.get('content_preview', '')}",
                "sentiment": article.get("sentiment", 0),
                "sentiment_class": "negativo",
                "date": article.get("date", ""),
                "action_needed": "remediar",
            })

    for article in news_data.get("summary", {}).get("top_positive_news", []):
        title = article.get("title", "")
        if title and title not in seen_titles:
            seen_titles.add(title)
            incidents.append({
                "type": "news_positive",
                "source": f"Prensa ({article.get('source', '')})",
                "description": f"{title}. {article.get('content_preview', '')}",
                "sentiment": article.get("sentiment", 0),
                "sentiment_class": "positivo",
                "date": article.get("date", ""),
                "action_needed": "potenciar",
            })

    incidents.sort(key=lambda x: abs(x.get("sentiment", 0)), reverse=True)
    return incidents[:20]


def _compute_weekly_trends(posts: list, articles: list, since: datetime) -> List[Dict[str, Any]]:
    weeks: Dict[str, Dict] = defaultdict(lambda: {
        "social_mentions": 0, "news_mentions": 0,
        "social_sentiment_sum": 0, "social_sentiment_count": 0,
        "news_sentiment_sum": 0, "news_sentiment_count": 0,
        "engagement": 0,
    })

    for p in posts:
        if p.scraped_at:
            week_key = p.scraped_at.strftime("%Y-W%W")
            weeks[week_key]["social_mentions"] += 1
            if p.sentiment_score is not None:
                weeks[week_key]["social_sentiment_sum"] += p.sentiment_score
                weeks[week_key]["social_sentiment_count"] += 1
            metrics = p.engagement_metrics or {}
            weeks[week_key]["engagement"] += sum(v or 0 for v in [
                metrics.get("likes", 0), metrics.get("comments", 0),
                metrics.get("shares", 0),
            ])

    for a in articles:
        dt = a.published_at or a.scraped_at
        if dt:
            week_key = dt.strftime("%Y-W%W")
            weeks[week_key]["news_mentions"] += 1
            if a.sentiment_score is not None:
                weeks[week_key]["news_sentiment_sum"] += a.sentiment_score
                weeks[week_key]["news_sentiment_count"] += 1

    result = []
    for week, data in sorted(weeks.items()):
        social_avg = round(data["social_sentiment_sum"] / data["social_sentiment_count"], 3) if data["social_sentiment_count"] > 0 else 0
        news_avg = round(data["news_sentiment_sum"] / data["news_sentiment_count"], 3) if data["news_sentiment_count"] > 0 else 0
        result.append({
            "week": week,
            "social_mentions": data["social_mentions"],
            "news_mentions": data["news_mentions"],
            "social_sentiment_avg": social_avg,
            "news_sentiment_avg": news_avg,
            "total_engagement": data["engagement"],
        })

    return result[-16:]


Category = Literal[
    "territorial_priority", "message_of_day", "crisis_response",
    "rival_contrast", "ground_game", "digital_push",
]
Priority = Literal["critical", "high", "medium", "low"]

FOCUS_DESCRIPTIONS = {
    "territorial_priority": "Prioridad territorial: donde ir esta semana y por que",
    "message_of_day": "Mensaje del dia: tema y encuadre para voceria y redes",
    "crisis_response": "Respuesta a crisis: que responder y como ante ataques o incidentes",
    "rival_contrast": "Contraste con rivales: diferenciacion frente a los punteros",
    "ground_game": "Trabajo de calle: caminatas, dirigentes, gremios, eventos",
    "digital_push": "Empuje digital: pauta y contenido segmentado por zona",
}

# Focos que implican propaganda o actos publicos: se filtran cuando la ley ya no los permite.
PROPAGANDA_FOCUS = ("ground_game", "digital_push")


class Recommendation(BaseModel):
    figure_display_name: str
    title: str = Field(max_length=80)
    description: str
    category: Category
    priority: Priority
    target_zone: Optional[str] = None
    target_districts: List[str] = Field(default_factory=list, max_length=5)
    target_demographic: Optional[str] = None
    identified_weakness: str = Field(description="Cita textual del dato que fundamenta la recomendacion")
    recommended_action: str = Field(description="Paso 1: ... Paso 2: ... Paso 3: ...")
    estimated_budget_min_pen: int
    estimated_budget_max_pen: int
    expected_timeline: str
    projected_roi_pct: int
    ai_confidence_pct: int
    resources_needed: List[str] = Field(default_factory=list)
    success_kpis: List[str] = Field(default_factory=list)
    risk_factors: List[str] = Field(default_factory=list)
    legal_check: str = Field(description="'OK' o la restriccion legal aplicable")


class RecommendationBatch(BaseModel):
    recommendations: List[Recommendation]


def _rivals_block(db: Session, own_display_name: Optional[str]) -> str:
    from app.services import race

    poll_rows = race.polls(db, base="validos", days=120)
    avg = race.poll_average(poll_rows)
    sent = {s["name"]: s for s in race.sentiment(db, 30)}

    lines = []
    for a in avg[:4]:
        if own_display_name and a["name"] == own_display_name:
            continue
        zones = (sent.get(a["name"]) or {}).get("by_zone", {})
        strong = sorted(
            [(z, v.get("net")) for z, v in zones.items() if v.get("net") is not None],
            key=lambda kv: -(kv[1] or 0),
        )[:2]
        zone_txt = ", ".join(f"{z} ({net:+.2f})" for z, net in strong) if strong else "sin datos por zona"
        lines.append(f"- {a['name']}: {a['pct']} % en encuestas [{a['low']}-{a['high']}] · zonas fuertes: {zone_txt}")
        if len(lines) >= 3:
            break
    return "\n".join(lines) or "- Sin datos de encuestas todavia"


def _own_block(db: Session, figure: PoliticalFigure) -> str:
    return (
        f"{figure.display_name} ({figure.party_name or 'sin partido'}) — "
        f"{figure.current_position or 'candidatura'} · lista: {figure.list_name or 'n/d'}"
    )


def build_claude_prompt(contexts: List[Dict], focus_areas: Dict[str, str],
                        db: Optional[Session] = None,
                        own_display_name: Optional[str] = None,
                        extra: Optional[Dict[str, Any]] = None) -> tuple:
    """Devuelve (system, user) para el generador de recomendaciones municipales."""
    today = date.today()
    extra = extra or {}

    system = f"""Eres el estratega jefe de una campana a la alcaldia de Lima Metropolitana. Eleccion: {ec.fmt_es(ec.ELECTION_DATE)} (una sola vuelta; gana la lista con mas votos validos; 21 listas; ~7,9 millones de electores; un tercio sin decidir). Hoy es {ec.fmt_es(today)}. Quedan {max(0, ec.days_to(ec.ELECTION_DATE, today) or 0)} dias para la eleccion y {max(0, ec.days_to(ec.PROPAGANDA_DEADLINE, today) or 0)} para el ultimo dia de propaganda ({ec.fmt_es(ec.PROPAGANDA_DEADLINE)}). Ultimo dia de mitines: {ec.fmt_es(ec.RALLY_DEADLINE)}. Veda de publicacion de encuestas desde {ec.fmt_es(ec.POLL_BLACKOUT_FROM)}. Fase actual: {ec.campaign_phase(today)}.

Candidatura propia: {extra.get('own_block') or '(sin definir: analiza cada figura seleccionada como si fuera la propia)'}
Rivales prioritarios:
{extra.get('rivals_block') or '- Sin datos'}

Zonas y peso electoral: Lima Norte ~2,17 M, Lima Este ~1,97 M, Lima Sur ~1,64 M, Lima Moderna ~1,35 M, Lima Centro ~0,77 M. Temas que deciden el voto: inseguridad (71 % lo pide como prioridad), extorsion a transportistas, transporte, basura, corrupcion municipal, legalidad de candidaturas.

Reglas:
- Cada recomendacion nace de UN dato concreto del contexto (citalo en identified_weakness). Sin dato, sin recomendacion.
- Piensa en terminos de votos: donde hay mas electores indecisos y menor presencia nuestra; que tema domina en esa zona; que rival capitaliza ese tema.
- Acciones ejecutables por un equipo de campana municipal real: caminatas, voceria, respuesta de prensa, pauta digital segmentada por distrito, reuniones con dirigentes vecinales o gremios de transportistas, contraste de propuestas. Presupuestos en soles (S/), realistas para campana municipal.
- Respeta la ley: despues del {ec.fmt_es(ec.PROPAGANDA_DEADLINE)} no hay propaganda; despues del {ec.fmt_es(ec.RALLY_DEADLINE)} no hay mitines; nunca recomiendes publicar encuestas en veda. Indica la restriccion en legal_check.
- KPIs medibles por este sistema en 72 h: menciones, sentimiento neto, share of voice por zona/distrito, alertas cerradas.
- Entre 4 y 8 recomendaciones por figura. Todo en espanol."""

    if not ec.propaganda_allowed(today):
        system += ("\n\nRESTRICCION VIGENTE: esta prohibida toda propaganda electoral. Solo recomienda respuesta "
                   "de prensa, gestion de crisis, defensa legal, logistica del dia de la eleccion y personeros.")
    if not ec.rallies_allowed(today):
        system += "\nRESTRICCION: prohibidas reuniones y manifestaciones publicas."

    figures_text = ""
    for ctx in contexts:
        fig = ctx["figure"]
        social = ctx.get("social_media", {})
        news = ctx.get("news_media", {})
        figures_text += f"""
================================================================================
FIGURA: {fig["display_name"]} | {fig["party_name"]} | {fig["current_position"]}
--- REDES ({CONTEXT_DAYS} dias) ---
Menciones: {social.get("total_mentions", 0)} | sentimiento {social.get("sentiment_average", 0)} ({social.get("sentiment_trend", "sin datos")})
Distribucion: {json.dumps(social.get("sentiment_distribution", {}), ensure_ascii=False)}
Posts negativos con mas alcance: {json.dumps(social.get("top_negative_posts", [])[:5], ensure_ascii=False)}
Posts positivos con mas alcance: {json.dumps(social.get("top_positive_posts", [])[:5], ensure_ascii=False)}
--- PRENSA ({CONTEXT_DAYS} dias) ---
Articulos: {news.get("total_articles", 0)} | sentimiento {news.get("sentiment_average", 0)}
Noticias negativas: {json.dumps(news.get("top_negative_news", [])[:4], ensure_ascii=False)}
Noticias positivas: {json.dumps(news.get("top_positive_news", [])[:4], ensure_ascii=False)}
--- ENCUESTAS ---
{json.dumps(ctx.get("surveys", {}), ensure_ascii=False)[:2000]}
--- INCIDENTES DETECTADOS ---
{json.dumps(ctx.get("incidents", [])[:10], ensure_ascii=False)}
--- TENDENCIA SEMANAL ---
{json.dumps(ctx.get("weekly_trends", [])[-8:], ensure_ascii=False)}
--- TERRITORIO (top distritos) ---
{json.dumps(ctx.get("territory", [])[:10], ensure_ascii=False, default=str)}
--- OPORTUNIDAD TERRITORIAL (top 10) ---
{json.dumps(ctx.get("opportunity", [])[:10], ensure_ascii=False, default=str)}
--- ATAQUES 7 DIAS ---
{json.dumps(ctx.get("attacks_7d", []), ensure_ascii=False, default=str)}
--- ALERTAS ABIERTAS ---
{json.dumps(ctx.get("open_alerts", []), ensure_ascii=False, default=str)}
"""

    focus_text = "\n".join(f"- {k}: {v}" for k, v in focus_areas.items())
    user = f"""CONTEXTO DE DATOS (ultimos {CONTEXT_DAYS} dias):
{figures_text}

TEMAS 7 DIAS: {json.dumps(extra.get('topics_7d', []), ensure_ascii=False, default=str)}

AREAS DE ENFOQUE SOLICITADAS:
{focus_text}"""

    return system, user


def _enrich_context(db: Session, figure: PoliticalFigure, ctx: Dict[str, Any]) -> Dict[str, Any]:
    from app.services import territory

    try:
        ctx["territory"] = [
            {k: d[k] for k in ("name", "zone", "electors", "mentions", "net_sentiment", "top_topic")}
            for d in territory.district_stats(db, 30, figure.id)[:10]
        ]
    except Exception as e:
        logger.warning(f"territorio no disponible: {e}")
        ctx["territory"] = []

    try:
        if (figure.figure_role or "candidate") == "candidate":
            ctx["opportunity"] = [
                {k: d[k] for k in ("name", "zone", "score", "rank", "why")}
                for d in territory.opportunity(db, figure.id)[:10]
            ]
        else:
            ctx["opportunity"] = []
    except Exception as e:
        logger.warning(f"oportunidad no disponible: {e}")
        ctx["opportunity"] = []

    try:
        ctx["attacks_7d"] = [dict(r._mapping) for r in db.execute(text("""
            SELECT COALESCE(fa.display_name, 'origen no identificado') AS attacker,
                   fd.display_name AS attacked, count(*) AS count
            FROM content_classifications c
            JOIN political_figures fd ON fd.id = c.attacked_figure_id
            LEFT JOIN political_figures fa ON fa.id = c.attacker_figure_id
            WHERE c.is_attack AND c.content_published_at >= NOW() - INTERVAL '7 days'
              AND (c.attacked_figure_id = :fid OR c.attacker_figure_id = :fid)
            GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 8
        """), {"fid": figure.id}).fetchall()]
    except Exception:
        ctx["attacks_7d"] = []

    try:
        ctx["open_alerts"] = [dict(r._mapping) for r in db.execute(text("""
            SELECT kind, severity, title FROM alerts
            WHERE status = 'open' AND figure_id = :fid ORDER BY created_at DESC LIMIT 5
        """), {"fid": figure.id}).fetchall()]
    except Exception:
        ctx["open_alerts"] = []

    return ctx


async def generate_recommendations_for_figures(
    db: Session,
    figure_ids: List[str],
    focus_areas: List[str],
) -> List[Dict[str, Any]]:
    import asyncio as _asyncio

    from app.services import race
    from app.services.claude_client import get_client, has_key, model as claude_model

    if not has_key():
        raise ValueError("ANTHROPIC_API_KEY no esta configurada. Agregala en la configuracion de secretos.")

    figures = db.query(PoliticalFigure).filter(PoliticalFigure.id.in_(figure_ids)).all()
    if not figures:
        raise ValueError("No se encontraron las figuras politicas especificadas")

    today = date.today()
    all_contexts = []
    for fig in figures:
        ctx = gather_figure_context(db, fig)
        all_contexts.append(_enrich_context(db, fig, ctx))

    own = next((f for f in figures if f.is_own_candidate), None)
    own_name = own.display_name if own else (ec.OWN_CANDIDATE or None)

    selected_focus = {k: v for k, v in FOCUS_DESCRIPTIONS.items() if k in focus_areas} or FOCUS_DESCRIPTIONS
    if not ec.propaganda_allowed(today):
        selected_focus = {k: v for k, v in selected_focus.items() if k not in PROPAGANDA_FOCUS} or {
            "crisis_response": FOCUS_DESCRIPTIONS["crisis_response"]
        }

    extra = {
        "own_block": _own_block(db, own) if own else None,
        "rivals_block": _rivals_block(db, own_name),
        "topics_7d": race.topics(db, 7),
    }
    system, user = build_claude_prompt(all_contexts, selected_focus, db, own_name, extra)
    logger.info(f"Prompt municipal: system {len(system)} chars, user {len(user)} chars, {len(figures)} figura(s)")

    response = await _asyncio.to_thread(
        get_client().messages.parse,
        model=claude_model(),
        max_tokens=16000,
        thinking={"type": "adaptive"},
        output_config={"effort": "high"},
        system=system,
        messages=[{"role": "user", "content": user}],
        output_format=RecommendationBatch,
    )

    batch: RecommendationBatch = response.parsed_output
    figure_map = {}
    for f in figures:
        figure_map[f.display_name.lower()] = f.id
        if f.full_name:
            figure_map[f.full_name.lower()] = f.id
    default_figure_id = figures[0].id

    saved = []
    for rec in batch.recommendations:
        if not ec.propaganda_allowed(today) and rec.category in PROPAGANDA_FOCUS:
            continue
        fid = figure_map.get((rec.figure_display_name or "").lower().strip(), default_figure_id)
        region = ", ".join(x for x in ([rec.target_zone] + list(rec.target_districts)) if x) or None
        risks = list(rec.risk_factors)
        if rec.legal_check and rec.legal_check.strip().upper() != "OK":
            risks.append(f"Restriccion legal: {rec.legal_check}")

        record = AIRecommendationRecord(
            id=str(uuid.uuid4()),
            figure_id=fid,
            title=rec.title[:500],
            description=rec.description,
            category=rec.category,
            priority=rec.priority,
            status="generated",
            target_region=(region or "")[:100] or None,
            target_demographic=rec.target_demographic,
            identified_weakness=rec.identified_weakness,
            recommended_action=rec.recommended_action,
            estimated_budget={"min": rec.estimated_budget_min_pen, "max": rec.estimated_budget_max_pen},
            expected_timeline=rec.expected_timeline,
            projected_roi=float(rec.projected_roi_pct),
            ai_confidence=float(rec.ai_confidence_pct),
            resources_needed=rec.resources_needed,
            success_kpis=rec.success_kpis,
            risk_factors=risks,
        )
        db.add(record)
        saved.append(record)

    db.commit()
    for s in saved:
        db.refresh(s)

    return [record_to_dict(s) for s in saved]


def record_to_dict(rec: AIRecommendationRecord) -> Dict[str, Any]:
    return {
        "id": rec.id,
        "figure_id": rec.figure_id,
        "title": rec.title,
        "description": rec.description,
        "category": rec.category,
        "priority": rec.priority,
        "status": rec.status,
        "target_region": rec.target_region,
        "target_demographic": rec.target_demographic,
        "identified_weakness": rec.identified_weakness,
        "recommended_action": rec.recommended_action,
        "estimated_budget": rec.estimated_budget,
        "expected_timeline": rec.expected_timeline,
        "projected_roi": rec.projected_roi,
        "ai_confidence": rec.ai_confidence,
        "resources_needed": rec.resources_needed,
        "success_kpis": rec.success_kpis,
        "risk_factors": rec.risk_factors,
        "user_rating": rec.user_rating,
        "implementation_progress": rec.implementation_progress,
        "created_at": rec.created_at.isoformat() if rec.created_at else None,
        "updated_at": rec.updated_at.isoformat() if rec.updated_at else None,
    }
