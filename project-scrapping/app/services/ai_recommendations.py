import os
import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.models import PoliticalFigure, RawSocialPost, NewsArticle, AIRecommendationRecord

logger = logging.getLogger(__name__)


def gather_figure_context(db: Session, figure: PoliticalFigure) -> Dict[str, Any]:
    keywords = figure.search_keywords or []
    if not keywords:
        keywords = [figure.display_name]

    since = datetime.utcnow() - timedelta(days=90)

    conditions = []
    for kw in keywords:
        conditions.append(RawSocialPost.content.ilike(f"%{kw}%"))

    from sqlalchemy import or_
    posts = db.query(RawSocialPost).filter(
        or_(*conditions),
        RawSocialPost.scraped_at >= since
    ).order_by(RawSocialPost.scraped_at.desc()).limit(500).all()

    total_mentions = len(posts)
    sentiments = [p.sentiment_score for p in posts if p.sentiment_score is not None]
    avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0.0

    platform_counts: Dict[str, int] = {}
    region_counts: Dict[str, int] = {}
    total_engagement = 0
    recent_posts_sample = []

    for p in posts:
        platform_counts[p.platform] = platform_counts.get(p.platform, 0) + 1

        region = p.region or p.geographic_location or "Desconocida"
        region_counts[region] = region_counts.get(region, 0) + 1

        metrics = p.engagement_metrics or {}
        total_engagement += (
            (metrics.get("likes", 0) or 0) +
            (metrics.get("comments", 0) or 0) +
            (metrics.get("shares", 0) or 0) +
            (metrics.get("views", 0) or 0)
        )

        if len(recent_posts_sample) < 15:
            content_preview = (p.content or "")[:300]
            recent_posts_sample.append({
                "platform": p.platform,
                "content": content_preview,
                "sentiment": p.sentiment_score,
                "engagement": sum(v for v in (metrics.get("likes", 0), metrics.get("comments", 0), metrics.get("shares", 0)) if v),
                "date": p.scraped_at.isoformat() if p.scraped_at else None,
            })

    sentiment_trend = "stable"
    if len(posts) >= 10:
        half = len(posts) // 2
        recent_half = [p.sentiment_score for p in posts[:half] if p.sentiment_score is not None]
        older_half = [p.sentiment_score for p in posts[half:] if p.sentiment_score is not None]
        if recent_half and older_half:
            recent_avg = sum(recent_half) / len(recent_half)
            older_avg = sum(older_half) / len(older_half)
            diff = recent_avg - older_avg
            if diff > 0.05:
                sentiment_trend = "improving"
            elif diff < -0.05:
                sentiment_trend = "declining"

    top_platforms = sorted(platform_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_regions = sorted(region_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    news_conditions = []
    for kw in keywords:
        news_conditions.append(NewsArticle.content.ilike(f"%{kw}%"))
        news_conditions.append(NewsArticle.title.ilike(f"%{kw}%"))

    news_mentions = db.query(func.count(NewsArticle.id)).filter(
        or_(*news_conditions),
        NewsArticle.scraped_at >= since
    ).scalar() or 0

    return {
        "figure": {
            "full_name": figure.full_name,
            "display_name": figure.display_name,
            "party_name": figure.party_name or "Independiente",
            "current_position": figure.current_position or "No especificado",
            "region": figure.region or "Nacional",
            "social_accounts": figure.social_accounts or [],
        },
        "metrics": {
            "total_mentions": total_mentions,
            "sentiment_average": round(avg_sentiment, 3),
            "sentiment_trend": sentiment_trend,
            "total_engagement": total_engagement,
            "top_platforms": [{"platform": p, "mentions": c} for p, c in top_platforms],
            "top_regions": [{"region": r, "mentions": c} for r, c in top_regions],
            "news_mentions": news_mentions,
            "recent_posts": recent_posts_sample,
        }
    }


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

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 4096,
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
        met = ctx["metrics"]
        figures_text += f"""
--- FIGURA: {fig["display_name"]} ---
Nombre completo: {fig["full_name"]}
Partido: {fig["party_name"]}
Posición actual: {fig["current_position"]}
Región principal: {fig["region"]}
Cuentas sociales: {json.dumps(fig["social_accounts"], ensure_ascii=False)}

MÉTRICAS DE REDES SOCIALES (últimos 90 días):
- Total de menciones: {met["total_mentions"]}
- Sentimiento promedio: {met["sentiment_average"]} (escala -1 a 1)
- Tendencia de sentimiento: {met["sentiment_trend"]}
- Engagement total: {met["total_engagement"]}
- Menciones en noticias: {met["news_mentions"]}
- Plataformas principales: {json.dumps(met["top_platforms"], ensure_ascii=False)}
- Regiones principales: {json.dumps(met["top_regions"], ensure_ascii=False)}

POSTS RECIENTES MÁS RELEVANTES:
{json.dumps(met["recent_posts"], ensure_ascii=False, indent=2)}
"""

    focus_text = "\n".join(f"- {k}: {v}" for k, v in focus_areas.items())

    return f"""Eres un consultor político experto en Perú. Analiza los datos reales de redes sociales de las siguientes figuras políticas y genera recomendaciones estratégicas accionables.

DATOS DE LAS FIGURAS POLÍTICAS:
{figures_text}

ÁREAS DE ENFOQUE SOLICITADAS:
{focus_text}

INSTRUCCIONES:
1. Genera entre 2 y 4 recomendaciones por cada figura política y por cada área de enfoque
2. Cada recomendación debe basarse en los datos reales proporcionados
3. Responde EXCLUSIVAMENTE con un JSON array válido, sin texto adicional antes o después
4. Cada objeto en el array debe tener exactamente esta estructura:

[
  {{
    "figure_display_name": "nombre de la figura",
    "title": "Título de la recomendación (máx 80 caracteres)",
    "description": "Descripción detallada de la recomendación (2-3 oraciones)",
    "category": "una de: immediate_opportunities, regional_strengthening, territorial_recovery, demographic_expansion",
    "priority": "una de: critical, high, medium, low",
    "target_region": "región objetivo (ej: Lima, Arequipa, Nacional)",
    "target_demographic": "segmento demográfico objetivo (ej: 18-25, NSE C, Mujeres profesionales)",
    "identified_weakness": "debilidad identificada basada en los datos",
    "recommended_action": "acción concreta a implementar",
    "estimated_budget": {{"min": 5000, "max": 50000}},
    "expected_timeline": "plazo estimado (ej: 2-4 semanas)",
    "projected_roi": 200,
    "ai_confidence": 85,
    "resources_needed": ["recurso1", "recurso2"],
    "success_kpis": ["KPI medible 1", "KPI medible 2"],
    "risk_factors": ["riesgo 1", "riesgo 2"]
  }}
]

Todos los textos deben estar en español.
Los valores de estimated_budget son en soles peruanos.
projected_roi es un porcentaje (ej: 200 = 200% retorno).
ai_confidence es un porcentaje de 0 a 100.

Responde SOLO con el JSON array, sin explicaciones adicionales."""


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

    figure_map = {f.display_name.lower(): f.id for f in figures}
    if len(figures) == 1:
        default_figure_id = figures[0].id
    else:
        default_figure_id = figures[0].id

    results = []
    for item in items:
        fig_name = item.get("figure_display_name", "").lower()
        figure_id = figure_map.get(fig_name, default_figure_id)

        for f_name, f_id in figure_map.items():
            if f_name in fig_name or fig_name in f_name:
                figure_id = f_id
                break

        results.append({
            "figure_id": figure_id,
            "title": item.get("title", "Recomendación sin título"),
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
