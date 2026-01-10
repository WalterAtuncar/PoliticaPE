from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import Counter
import re

from app.database import get_db
from app.models import NewsArticle, RawSocialPost
from app.schemas import SentimentAnalysisResponse, TrendAnalysisResponse
from app.services.analysis import AnalysisService

router = APIRouter()

@router.get("/sentiment", response_model=SentimentAnalysisResponse)
async def get_sentiment_analysis(
    source_type: str = Query(..., description="news, social, or government"),
    source: str = Query(None, description="Specific source to analyze"),
    days: int = Query(7, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get sentiment analysis for specified data source"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    analysis_service = AnalysisService(db)
    
    if source_type == "news":
        result = analysis_service.analyze_news_sentiment(start_date, end_date, source)
    elif source_type == "social":
        result = analysis_service.analyze_social_sentiment(start_date, end_date, source)
    else:
        raise HTTPException(status_code=400, detail="Invalid source_type")
    
    return result

@router.get("/trends", response_model=TrendAnalysisResponse)
async def get_trend_analysis(
    keywords: Optional[str] = Query(None, description="Comma-separated keywords to analyze"),
    period_days: int = Query(30, description="Number of days to analyze"),
    days: int = Query(None, description="Alias for period_days"),
    db: Session = Depends(get_db)
):
    """Get trend analysis for specified keywords"""
    actual_days = days if days is not None else period_days
    
    if keywords:
        keyword_list = [k.strip() for k in keywords.split(",")]
    else:
        keyword_list = ["política", "gobierno", "elecciones", "congreso", "presidente"]
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=actual_days)
    
    analysis_service = AnalysisService(db)
    result = analysis_service.analyze_trends(keyword_list, start_date, end_date)
    
    return result

@router.get("/geographic")
async def get_geographic_analysis(
    days: int = Query(7, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get geographic distribution of social media posts"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    analysis_service = AnalysisService(db)
    result = analysis_service.analyze_geographic_distribution(start_date, end_date)
    
    return {"geographic_distribution": result}

@router.get("/engagement")
async def get_engagement_metrics(
    platform: str = Query(None, description="Social media platform"),
    days: int = Query(7, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get engagement metrics for social media posts"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    analysis_service = AnalysisService(db)
    result = analysis_service.analyze_engagement_metrics(start_date, end_date, platform)
    
    return result


@router.get("/time-series")
async def get_time_series_data(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get time series data for mentions and sentiment over time"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    news_articles = db.query(NewsArticle).filter(
        and_(
            NewsArticle.published_at >= start_date,
            NewsArticle.published_at <= end_date
        )
    ).all()
    
    social_posts = db.query(RawSocialPost).filter(
        and_(
            RawSocialPost.created_at >= start_date,
            RawSocialPost.created_at <= end_date
        )
    ).all()
    
    daily_data = {}
    current = start_date
    while current <= end_date:
        date_key = current.strftime("%d/%m")
        daily_data[date_key] = {"mentions": 0, "sentiment": [], "events": 0}
        current += timedelta(days=1)
    
    for article in news_articles:
        if article.published_at:
            date_key = article.published_at.strftime("%d/%m")
            if date_key in daily_data:
                daily_data[date_key]["mentions"] += 1
                if article.sentiment_score is not None:
                    daily_data[date_key]["sentiment"].append(article.sentiment_score)
    
    for post in social_posts:
        if post.created_at:
            date_key = post.created_at.strftime("%d/%m")
            if date_key in daily_data:
                daily_data[date_key]["mentions"] += 1
                if post.sentiment_score is not None:
                    daily_data[date_key]["sentiment"].append(post.sentiment_score)
    
    time_series = []
    for date_key, data in daily_data.items():
        avg_sentiment = sum(data["sentiment"]) / len(data["sentiment"]) if data["sentiment"] else 0
        time_series.append({
            "date": date_key,
            "mentions": data["mentions"],
            "sentiment": round(avg_sentiment, 2),
            "events": 1 if data["mentions"] > 5 else 0
        })
    
    return {
        "time_series": time_series,
        "total_mentions": sum(d["mentions"] for d in time_series),
        "average_sentiment": round(sum(d["sentiment"] for d in time_series) / len(time_series), 2) if time_series else 0,
        "period_days": days
    }


@router.get("/platform-breakdown")
async def get_platform_breakdown(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get engagement breakdown by platform"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    posts = db.query(RawSocialPost).filter(
        or_(
            and_(
                RawSocialPost.created_at >= start_date,
                RawSocialPost.created_at <= end_date
            ),
            and_(
                RawSocialPost.scraped_at >= start_date,
                RawSocialPost.scraped_at <= end_date
            )
        )
    ).all()
    
    platform_stats = {}
    for post in posts:
        platform = post.platform.lower() if post.platform else "unknown"
        if platform not in platform_stats:
            platform_stats[platform] = {
                "platform": platform.capitalize(),
                "posts": 0,
                "likes": 0,
                "shares": 0,
                "comments": 0,
                "reach": 0
            }
        
        platform_stats[platform]["posts"] += 1
        if post.engagement_metrics and isinstance(post.engagement_metrics, dict):
            platform_stats[platform]["likes"] += post.engagement_metrics.get("likes", 0)
            platform_stats[platform]["shares"] += post.engagement_metrics.get("shares", 0)
            platform_stats[platform]["comments"] += post.engagement_metrics.get("comments", 0)
            platform_stats[platform]["reach"] += post.engagement_metrics.get("views", 0)
    
    return {
        "platforms": list(platform_stats.values()),
        "total_posts": len(posts),
        "period_days": days
    }


@router.get("/share-of-voice")
async def get_share_of_voice(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get share of voice analysis by political party and figures"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    news_articles = db.query(NewsArticle).filter(
        and_(
            NewsArticle.published_at >= start_date,
            NewsArticle.published_at <= end_date
        )
    ).all()
    
    social_posts = db.query(RawSocialPost).filter(
        and_(
            RawSocialPost.created_at >= start_date,
            RawSocialPost.created_at <= end_date
        )
    ).all()
    
    all_content = [a.content or a.title for a in news_articles] + [p.content for p in social_posts if p.content]
    combined_text = " ".join(all_content).lower()
    
    parties = {
        "Perú Libre": {"keywords": ["perú libre", "peru libre", "castillo"], "color": "#EF4444"},
        "Fuerza Popular": {"keywords": ["fuerza popular", "keiko", "fujimori"], "color": "#F97316"},
        "Renovación Popular": {"keywords": ["renovación popular", "renovacion popular", "lópez aliaga", "lopez aliaga"], "color": "#3B82F6"},
        "Alianza para el Progreso": {"keywords": ["alianza para el progreso", "app", "acuña"], "color": "#10B981"},
        "Acción Popular": {"keywords": ["acción popular", "accion popular"], "color": "#8B5CF6"},
    }
    
    party_mentions = {}
    total_mentions = 0
    for party, info in parties.items():
        count = sum(combined_text.count(kw) for kw in info["keywords"])
        party_mentions[party] = {"mentions": count, "color": info["color"]}
        total_mentions += count
    
    party_data = []
    for party, data in party_mentions.items():
        share = (data["mentions"] / total_mentions * 100) if total_mentions > 0 else 0
        party_data.append({
            "party": party,
            "mentions": data["mentions"],
            "share": round(share, 1),
            "color": data["color"]
        })
    
    party_data.sort(key=lambda x: x["mentions"], reverse=True)
    
    hashtag_pattern = r'#\w+'
    hashtags = Counter()
    for content in all_content:
        if content:
            found = re.findall(hashtag_pattern, content)
            hashtags.update([h.lower() for h in found])
    
    hashtags_data = [
        {"hashtag": tag, "mentions": count, "sentiment": 0.0}
        for tag, count in hashtags.most_common(10)
    ]
    
    figures = {
        "Pedro Castillo": ["castillo", "pedro castillo"],
        "Keiko Fujimori": ["keiko", "fujimori"],
        "Rafael López Aliaga": ["lópez aliaga", "lopez aliaga", "porky"],
        "César Acuña": ["acuña", "cesar acuña"],
        "Dina Boluarte": ["boluarte", "dina boluarte"]
    }
    
    figures_data = []
    for figure, keywords in figures.items():
        count = sum(combined_text.count(kw) for kw in keywords)
        figures_data.append({
            "name": figure,
            "mentions": count,
            "sentiment": 0.0,
            "trend": "stable"
        })
    
    figures_data.sort(key=lambda x: x["mentions"], reverse=True)
    
    return {
        "parties": party_data,
        "hashtags": hashtags_data,
        "figures": figures_data[:5],
        "total_mentions": total_mentions,
        "period_days": days
    }


@router.get("/top-posts")
async def get_top_posts(
    days: int = Query(30, description="Number of days to analyze"),
    limit: int = Query(10, description="Number of posts to return"),
    page: int = Query(1, description="Page number for pagination"),
    db: Session = Depends(get_db)
):
    """Get top performing posts by engagement"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    posts = db.query(RawSocialPost).filter(
        and_(
            or_(
                and_(
                    RawSocialPost.created_at >= start_date,
                    RawSocialPost.created_at <= end_date
                ),
                and_(
                    RawSocialPost.scraped_at >= start_date,
                    RawSocialPost.scraped_at <= end_date
                )
            ),
            RawSocialPost.engagement_metrics.isnot(None)
        )
    ).all()
    
    def get_total_engagement(post):
        if not post.engagement_metrics or not isinstance(post.engagement_metrics, dict):
            return 0
        metrics = post.engagement_metrics
        return metrics.get("likes", 0) + metrics.get("shares", 0) * 2 + metrics.get("comments", 0) * 3
    
    sorted_posts = sorted(posts, key=get_total_engagement, reverse=True)
    
    total_posts = len(sorted_posts)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_posts = sorted_posts[start_idx:end_idx]
    
    def get_author_display(post):
        if post.author:
            return post.author
        if post.platform == "instagram" and post.content:
            import re
            hashtags = re.findall(r'#(\w+)', post.content)
            political_tags = [h for h in hashtags if any(kw in h.lower() for kw in ['peru', 'politic', 'congreso', 'gobierno', 'eleccion'])]
            if political_tags:
                return f"#{political_tags[0]}"
            elif hashtags:
                return f"#{hashtags[0]}"
        return "Instagram"
    
    top_posts = []
    for post in paginated_posts:
        metrics = post.engagement_metrics if isinstance(post.engagement_metrics, dict) else {}
        post_date = post.created_at or post.scraped_at
        top_posts.append({
            "id": post.id,
            "content": post.content[:200] + "..." if post.content and len(post.content) > 200 else post.content,
            "author": get_author_display(post),
            "platform": post.platform,
            "engagement": {
                "likes": metrics.get("likes", 0),
                "shares": metrics.get("shares", 0),
                "comments": metrics.get("comments", 0),
                "total": get_total_engagement(post)
            },
            "timestamp": post_date.isoformat() if post_date else None,
            "sentiment": post.sentiment_score
        })
    
    return {
        "posts": top_posts,
        "total_analyzed": len(posts),
        "period_days": days,
        "page": page,
        "limit": limit,
        "total_pages": (total_posts + limit - 1) // limit,
        "total_posts": total_posts
    }


@router.get("/trending-topics")
async def get_trending_topics(
    days: int = Query(7, description="Number of days to analyze"),
    limit: int = Query(20, description="Number of topics to return"),
    db: Session = Depends(get_db)
):
    """Get trending topics from all content"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    analysis_service = AnalysisService(db)
    topics = analysis_service.extract_trending_topics(start_date, end_date, limit)
    
    for topic in topics:
        topic["sentiment"] = round((topic.get("trend_score", 0) - 0.5) * 2, 2)
        topic["count"] = topic.pop("mentions", 0)
    
    return {
        "trending_topics": topics,
        "period_days": days,
        "total_topics": len(topics)
    }


@router.get("/regional-engagement")
async def get_regional_engagement(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get engagement metrics by region (departamentos de Perú)"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    posts = db.query(RawSocialPost).filter(
        and_(
            RawSocialPost.created_at >= start_date,
            RawSocialPost.created_at <= end_date
        )
    ).all()
    
    region_stats = {}
    for post in posts:
        region = post.region if post.region else "Nacional"
        if region not in region_stats:
            region_stats[region] = {"posts": 0, "total_engagement": 0, "likes": 0, "shares": 0, "comments": 0}
        
        region_stats[region]["posts"] += 1
        if post.engagement_metrics and isinstance(post.engagement_metrics, dict):
            likes = post.engagement_metrics.get("likes", 0)
            shares = post.engagement_metrics.get("shares", 0)
            comments = post.engagement_metrics.get("comments", 0)
            region_stats[region]["likes"] += likes
            region_stats[region]["shares"] += shares
            region_stats[region]["comments"] += comments
            region_stats[region]["total_engagement"] += likes + shares + comments
    
    regional_data = []
    for region, stats in region_stats.items():
        engagement_rate = stats["total_engagement"] / stats["posts"] if stats["posts"] > 0 else 0
        regional_data.append({
            "region": region,
            "posts": stats["posts"],
            "engagement": round(engagement_rate, 1),
            "likes": stats["likes"],
            "shares": stats["shares"],
            "comments": stats["comments"]
        })
    
    regional_data.sort(key=lambda x: x["engagement"], reverse=True)
    
    return {"regions": regional_data[:15], "period_days": days}