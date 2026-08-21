import os
import json
import logging
import re
import uuid
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
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


async def generate_recommendations_for_figures(
    db: Session,
    figure_ids: List[str],
    focus_areas: List[str],
) -> List[Dict[str, Any]]:
    import httpx

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY no está configurada. Agrega tu API key en la configuración de secretos.")

    figures = db.query(PoliticalFigure).filter(PoliticalFigure.id.in_(figure_ids)).all()
    if not figures:
        raise ValueError("No se encontraron las figuras políticas especificadas")

    all_contexts = []
    for fig in figures:
        ctx = gather_figure_context(db, fig)
        all_contexts.append(ctx)

    focus_descriptions = {
        "immediate_opportunities": "Oportunidades inmediatas de acción política y comunicacional",
        "regional_strengthening": "Fortalecimiento regional en territorios estratégicos",
        "territorial_recovery": "Recuperación de territorios con sentimiento negativo",
        "demographic_expansion": "Expansión demográfica hacia nuevos segmentos electorales",
    }

    selected_focus = {k: v for k, v in focus_descriptions.items() if k in focus_areas}
    prompt = build_claude_prompt(all_contexts, selected_focus)

    logger.info(f"Sending prompt to Claude ({len(prompt)} chars) for {len(figures)} figure(s)")

    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 8192,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
            },
        )

    if response.status_code != 200:
        logger.error(f"Claude API error: {response.status_code} - {response.text}")
        raise ValueError(f"Error en la API de Claude: {response.status_code}")

    result = response.json()
    text_content = result["content"][0]["text"]

    recommendations = parse_claude_response(text_content, figures)

    saved = []
    for rec in recommendations:
        record = AIRecommendationRecord(
            id=str(uuid.uuid4()),
            figure_id=rec["figure_id"],
            title=rec["title"],
            description=rec["description"],
            category=rec["category"],
            priority=rec["priority"],
            status="generated",
            target_region=rec.get("target_region"),
            target_demographic=rec.get("target_demographic"),
            identified_weakness=rec.get("identified_weakness"),
            recommended_action=rec.get("recommended_action"),
            estimated_budget=rec.get("estimated_budget"),
            expected_timeline=rec.get("expected_timeline"),
            projected_roi=rec.get("projected_roi"),
            ai_confidence=rec.get("ai_confidence"),
            resources_needed=rec.get("resources_needed"),
            success_kpis=rec.get("success_kpis"),
            risk_factors=rec.get("risk_factors"),
        )
        db.add(record)
        saved.append(record)

    db.commit()
    for s in saved:
        db.refresh(s)

    return [record_to_dict(s) for s in saved]


def build_claude_prompt(contexts: List[Dict], focus_areas: Dict[str, str]) -> str:
    figures_text = ""
    for ctx in contexts:
        fig = ctx["figure"]
        social = ctx.get("social_media", {})
        news = ctx.get("news_media", {})
        surveys = ctx.get("surveys", {})
        gov = ctx.get("government", {})
        incidents = ctx.get("incidents", [])
        trends = ctx.get("weekly_trends", [])

        figures_text += f"""
================================================================================
FIGURA POLÍTICA: {fig["display_name"]}
================================================================================
Nombre completo: {fig["full_name"]}
Apodo: {fig.get("nickname", "N/A")}
Partido: {fig["party_name"]}
Posición actual: {fig["current_position"]}
Región principal: {fig["region"]}
Cuentas sociales: {json.dumps(fig["social_accounts"], ensure_ascii=False)}

--- REDES SOCIALES (últimos {CONTEXT_DAYS} días) ---
Total de menciones: {social.get("total_mentions", 0)}
Sentimiento promedio: {social.get("sentiment_average", 0)} (escala -1 a 1)
Tendencia de sentimiento: {social.get("sentiment_trend", "sin datos")}
Distribución: {json.dumps(social.get("sentiment_distribution", {}), ensure_ascii=False)}
Engagement total: {social.get("total_engagement", 0)}
Plataformas: {json.dumps(social.get("platforms", []), ensure_ascii=False)}
Regiones principales: {json.dumps(social.get("top_regions", []), ensure_ascii=False)}

POSTS POSITIVOS MÁS RELEVANTES (para POTENCIAR):
{json.dumps(social.get("top_positive_posts", []), ensure_ascii=False, indent=1)}

POSTS NEGATIVOS MÁS RELEVANTES (para REMEDIAR):
{json.dumps(social.get("top_negative_posts", []), ensure_ascii=False, indent=1)}

--- NOTICIAS EN MEDIOS (últimos {CONTEXT_DAYS} días) ---
Total de artículos: {news.get("total_articles", 0)}
Sentimiento promedio en noticias: {news.get("sentiment_average", 0)}
Distribución: {json.dumps(news.get("sentiment_distribution", {}), ensure_ascii=False)}
Fuentes de medios: {json.dumps(news.get("sources", []), ensure_ascii=False)}
Categorías: {json.dumps(news.get("categories", {}), ensure_ascii=False)}

NOTICIAS POSITIVAS (para POTENCIAR):
{json.dumps(news.get("top_positive_news", []), ensure_ascii=False, indent=1)}

NOTICIAS NEGATIVAS (para REMEDIAR):
{json.dumps(news.get("top_negative_news", []), ensure_ascii=False, indent=1)}

--- ENCUESTAS ---
{json.dumps(surveys, ensure_ascii=False, indent=1) if surveys else "Sin datos de encuestas disponibles"}

--- DATOS DE GOBIERNO ---
{json.dumps(gov, ensure_ascii=False, indent=1) if gov else "Sin datos de gobierno disponibles"}

--- INCIDENTES Y EVENTOS ESPECÍFICOS DETECTADOS ---
{json.dumps(incidents, ensure_ascii=False, indent=1) if incidents else "Sin incidentes específicos detectados"}

--- TENDENCIA SEMANAL ---
{json.dumps(trends, ensure_ascii=False, indent=1) if trends else "Sin datos de tendencia"}
"""

    focus_text = "\n".join(f"- {k}: {v}" for k, v in focus_areas.items())

    today = date.today()
    days_remaining = max(0, ec.days_to(ec.PROPAGANDA_DEADLINE, today) or 0)
    today_str = ec.fmt_es(today)
    deadline_str = ec.fmt_es(ec.PROPAGANDA_DEADLINE)
    election_str = ec.fmt_es(ec.ELECTION_DATE)
    deadline_short = ec.PROPAGANDA_DEADLINE.strftime("%d/%m/%Y")
    rounds_txt = f"{ec.ELECTION_ROUNDS} vuelta" + ("s" if ec.ELECTION_ROUNDS > 1 else "")

    if days_remaining == 0:
        urgency_block = f"""- La ventana de propaganda ya ha finalizado (posterior al {deadline_str})
- Genera recomendaciones de respuesta de prensa, defensa legal y análisis post-electoral"""
    else:
        urgency_block = f"""- Días restantes para acciones de campaña: {days_remaining} días
- TODAS las recomendaciones deben ser ejecutables desde HOY hasta el {deadline_str}
- Priorizar impacto inmediato dado el plazo electoral"""

    return f"""Eres un consultor político estratégico experto en campañas electorales en Perú. Tu trabajo es analizar TODOS los datos reales recopilados sobre figuras políticas y generar recomendaciones estratégicas ultra-específicas y accionables.

CONTEXTO ELECTORAL CRÍTICO:
- Fecha actual: {today_str}
- {ec.ELECTION_NAME}: {election_str} ({rounds_txt}, circunscripción {ec.ELECTORAL_DISTRICT})
- Último día permitido para propaganda y campañas: {deadline_str}
{urgency_block}

================================================================================
DATOS COMPLETOS DE LAS FIGURAS POLÍTICAS
================================================================================
{figures_text}

ÁREAS DE ENFOQUE SOLICITADAS:
{focus_text}

================================================================================
INSTRUCCIONES DETALLADAS
================================================================================

REGLA PRINCIPAL: Por cada evento/incidente/noticia/post encontrado en los datos, debes generar una recomendación específica que indique:

1. **Si el sentimiento es NEGATIVO (posts negativos, noticias negativas, incidentes desfavorables):**
   - Identifica exactamente qué evento/incidente causó el sentimiento negativo
   - Genera una recomendación paso a paso para REMEDIAR el daño
   - Incluye: respuesta pública sugerida, estrategia de comunicación de crisis, acciones concretas para revertir la percepción

2. **Si el sentimiento es POSITIVO (posts positivos, noticias favorables):**
   - Identifica exactamente qué evento generó el sentimiento positivo
   - Genera una recomendación paso a paso para POTENCIAR y capitalizar ese momentum positivo
   - Incluye: cómo amplificar el mensaje, en qué plataformas reforzar, qué acciones tomar para mantener la tendencia

3. **Si el sentimiento es NEUTRO:**
   - Identifica la oportunidad de convertir la neutralidad en sentimiento positivo
   - Genera una recomendación para ACTIVAR engagement y generar opinión favorable

4. **Para ENCUESTAS:**
   - Si la figura aparece en encuestas, analiza su posición relativa
   - Recomienda acciones específicas para mejorar sus números

5. **Para DATOS DE GOBIERNO:**
   - Si hay datos gubernamentales relevantes, úsalos como contexto para oportunidades políticas

FORMATO DE RESPUESTA:
Genera entre 3 y 6 recomendaciones por cada figura política.
Cada recomendación debe estar DIRECTAMENTE vinculada a un dato real encontrado.
Responde EXCLUSIVAMENTE con un JSON array válido, sin texto adicional.

[
  {{
    "figure_display_name": "nombre de la figura",
    "title": "Título conciso de la recomendación (máx 80 caracteres)",
    "description": "Descripción detallada incluyendo: 1) El evento/incidente específico detectado en los datos, 2) Por qué es importante abordarlo, 3) Qué se espera lograr. (3-5 oraciones)",
    "category": "una de: immediate_opportunities, regional_strengthening, territorial_recovery, demographic_expansion",
    "priority": "una de: critical, high, medium, low",
    "target_region": "región objetivo específica basada en los datos",
    "target_demographic": "segmento demográfico objetivo",
    "identified_weakness": "El evento/incidente/dato específico que fundamenta esta recomendación. Citar el contenido real del post/noticia.",
    "recommended_action": "Plan de acción paso a paso: Paso 1: [acción]. Paso 2: [acción]. Paso 3: [acción]. Cada paso debe ser concreto y ejecutable antes del {deadline_str}.",
    "estimated_budget": {{"min": 5000, "max": 50000}},
    "expected_timeline": "plazo concreto (ej: 1-2 semanas, fecha específica) que NO exceda el {deadline_str}",
    "projected_roi": 200,
    "ai_confidence": 85,
    "resources_needed": ["recurso1", "recurso2", "recurso3"],
    "success_kpis": ["KPI medible 1", "KPI medible 2"],
    "risk_factors": ["riesgo 1", "riesgo 2"]
  }}
]

REGLAS FINALES:
- Todos los textos en español
- estimated_budget en soles peruanos (S/.)
- projected_roi es porcentaje (200 = 200% retorno)
- ai_confidence es porcentaje de 0 a 100
- identified_weakness DEBE citar contenido real de los datos proporcionados
- recommended_action DEBE ser un plan paso a paso concreto
- CADA recomendación debe ser ejecutable entre hoy ({today.strftime("%d/%m/%Y")}) y el {deadline_short}
- NO inventes datos. Solo usa la información proporcionada arriba

Responde SOLO con el JSON array."""


def parse_claude_response(text: str, figures: List[PoliticalFigure]) -> List[Dict]:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    try:
        items = json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing Claude response: {e}\nText: {text[:500]}")
        raise ValueError("La respuesta de Claude no es JSON válido")

    if not isinstance(items, list):
        items = [items]

    figure_map = {}
    for f in figures:
        figure_map[f.display_name.lower()] = f.id
        if f.full_name:
            figure_map[f.full_name.lower()] = f.id
        if f.nickname:
            figure_map[f.nickname.lower()] = f.id

    default_figure_id = figures[0].id

    results = []
    for item in items:
        fig_name = item.get("figure_display_name", "").lower().strip()
        figure_id = figure_map.get(fig_name, None)

        if not figure_id:
            for f_name, f_id in figure_map.items():
                if f_name in fig_name or fig_name in f_name:
                    figure_id = f_id
                    break

        if not figure_id:
            figure_id = default_figure_id

        results.append({
            "figure_id": figure_id,
            "title": item.get("title", "Recomendación sin título")[:500],
            "description": item.get("description", ""),
            "category": item.get("category", "immediate_opportunities"),
            "priority": item.get("priority", "medium"),
            "target_region": item.get("target_region"),
            "target_demographic": item.get("target_demographic"),
            "identified_weakness": item.get("identified_weakness"),
            "recommended_action": item.get("recommended_action"),
            "estimated_budget": item.get("estimated_budget"),
            "expected_timeline": item.get("expected_timeline"),
            "projected_roi": item.get("projected_roi"),
            "ai_confidence": item.get("ai_confidence"),
            "resources_needed": item.get("resources_needed"),
            "success_kpis": item.get("success_kpis"),
            "risk_factors": item.get("risk_factors"),
        })

    return results


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
