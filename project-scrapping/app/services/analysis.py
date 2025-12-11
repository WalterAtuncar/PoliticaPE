from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json
from collections import Counter

from app.models import NewsArticle, RawSocialPost, GovernmentData
from app.schemas import SentimentAnalysisResponse, TrendAnalysisResponse

class AnalysisService:
    def __init__(self, db: Session):
        self.db = db
    
    def analyze_news_sentiment(
        self, 
        start_date: datetime, 
        end_date: datetime, 
        source: Optional[str] = None
    ) -> SentimentAnalysisResponse:
        """Analyze sentiment of news articles in date range"""
        
        query = self.db.query(NewsArticle).filter(
            and_(
                NewsArticle.published_at >= start_date,
                NewsArticle.published_at <= end_date,
                NewsArticle.sentiment_score.isnot(None)
            )
        )
        
        if source:
            query = query.filter(NewsArticle.source == source)
        
        articles = query.all()
        
        if not articles:
            return SentimentAnalysisResponse(
                source_type="news",
                source=source,
                period_days=(end_date - start_date).days,
                total_items=0,
                sentiment_distribution={"positive": 0, "neutral": 0, "negative": 0},
                average_sentiment=0.0,
                sentiment_trend=[]
            )
        
        # Calculate sentiment distribution
        positive = sum(1 for a in articles if a.sentiment_score > 0.1)
        negative = sum(1 for a in articles if a.sentiment_score < -0.1)
        neutral = len(articles) - positive - negative
        
        total = len(articles)
        sentiment_distribution = {
            "positive": positive / total,
            "neutral": neutral / total,
            "negative": negative / total
        }
        
        # Calculate average sentiment
        average_sentiment = sum(a.sentiment_score for a in articles) / total
        
        # Calculate daily trend
        sentiment_trend = self._calculate_daily_sentiment_trend(articles, start_date, end_date)
        
        return SentimentAnalysisResponse(
            source_type="news",
            source=source,
            period_days=(end_date - start_date).days,
            total_items=total,
            sentiment_distribution=sentiment_distribution,
            average_sentiment=average_sentiment,
            sentiment_trend=sentiment_trend
        )
    
    def analyze_social_sentiment(
        self, 
        start_date: datetime, 
        end_date: datetime, 
        platform: Optional[str] = None
    ) -> SentimentAnalysisResponse:
        """Analyze sentiment of social media posts in date range"""
        
        query = self.db.query(RawSocialPost).filter(
            and_(
                RawSocialPost.created_at >= start_date,
                RawSocialPost.created_at <= end_date,
                RawSocialPost.sentiment_score.isnot(None)
            )
        )
        
        if platform:
            query = query.filter(RawSocialPost.platform == platform)
        
        posts = query.all()
        
        if not posts:
            return SentimentAnalysisResponse(
                source_type="social",
                source=platform,
                period_days=(end_date - start_date).days,
                total_items=0,
                sentiment_distribution={"positive": 0, "neutral": 0, "negative": 0},
                average_sentiment=0.0,
                sentiment_trend=[]
            )
        
        # Calculate sentiment distribution
        positive = sum(1 for p in posts if p.sentiment_score > 0.1)
        negative = sum(1 for p in posts if p.sentiment_score < -0.1)
        neutral = len(posts) - positive - negative
        
        total = len(posts)
        sentiment_distribution = {
            "positive": positive / total,
            "neutral": neutral / total,
            "negative": negative / total
        }
        
        # Calculate average sentiment
        average_sentiment = sum(p.sentiment_score for p in posts) / total
        
        # Calculate daily trend
        sentiment_trend = self._calculate_daily_sentiment_trend(posts, start_date, end_date)
        
        return SentimentAnalysisResponse(
            source_type="social",
            source=platform,
            period_days=(end_date - start_date).days,
            total_items=total,
            sentiment_distribution=sentiment_distribution,
            average_sentiment=average_sentiment,
            sentiment_trend=sentiment_trend
        )
    
    def analyze_trends(
        self, 
        keywords: List[str], 
        start_date: datetime, 
        end_date: datetime
    ) -> TrendAnalysisResponse:
        """Analyze keyword trends across all data sources"""
        
        keyword_trends = {}
        
        for keyword in keywords:
            # Search in news articles
            news_trend = self._get_keyword_trend_news(keyword, start_date, end_date)
            
            # Search in social posts
            social_trend = self._get_keyword_trend_social(keyword, start_date, end_date)
            
            # Combine trends
            combined_trend = self._combine_trends(news_trend, social_trend)
            keyword_trends[keyword] = combined_trend
        
        # Calculate correlation matrix
        correlation_matrix = self._calculate_keyword_correlations(keywords, keyword_trends)
        
        return TrendAnalysisResponse(
            keywords=keywords,
            period_days=(end_date - start_date).days,
            keyword_trends=keyword_trends,
            correlation_matrix=correlation_matrix
        )
    
    def analyze_geographic_distribution(
        self, 
        start_date: datetime, 
        end_date: datetime
    ) -> Dict[str, int]:
        """Analyze geographic distribution of social posts"""
        
        posts = self.db.query(RawSocialPost).filter(
            and_(
                RawSocialPost.created_at >= start_date,
                RawSocialPost.created_at <= end_date,
                RawSocialPost.geographic_location.isnot(None)
            )
        ).all()
        
        location_counts = Counter()
        for post in posts:
            if post.geographic_location:
                location_counts[post.geographic_location] += 1
        
        return dict(location_counts.most_common(20))
    
    def analyze_engagement_metrics(
        self, 
        start_date: datetime, 
        end_date: datetime, 
        platform: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze engagement metrics for social posts"""
        
        query = self.db.query(RawSocialPost).filter(
            and_(
                RawSocialPost.created_at >= start_date,
                RawSocialPost.created_at <= end_date,
                RawSocialPost.engagement_metrics.isnot(None)
            )
        )
        
        if platform:
            query = query.filter(RawSocialPost.platform == platform)
        
        posts = query.all()
        
        if not posts:
            return {"total_posts": 0, "average_engagement": {}}
        
        # Aggregate engagement metrics
        total_likes = 0
        total_shares = 0
        total_comments = 0
        total_views = 0
        posts_with_metrics = 0
        
        for post in posts:
            if post.engagement_metrics:
                metrics = post.engagement_metrics
                if isinstance(metrics, dict):
                    total_likes += metrics.get('likes', 0)
                    total_shares += metrics.get('shares', 0)
                    total_comments += metrics.get('comments', 0)
                    total_views += metrics.get('views', 0)
                    posts_with_metrics += 1
        
        if posts_with_metrics == 0:
            return {"total_posts": len(posts), "average_engagement": {}}
        
        return {
            "total_posts": len(posts),
            "posts_with_metrics": posts_with_metrics,
            "average_engagement": {
                "likes": total_likes / posts_with_metrics,
                "shares": total_shares / posts_with_metrics,
                "comments": total_comments / posts_with_metrics,
                "views": total_views / posts_with_metrics
            },
            "total_engagement": {
                "likes": total_likes,
                "shares": total_shares,
                "comments": total_comments,
                "views": total_views
            }
        }
    
    def extract_trending_topics(
        self, 
        start_date: datetime, 
        end_date: datetime,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Extract trending topics from all content"""
        
        # Get all content from the period
        news_articles = self.db.query(NewsArticle).filter(
            and_(
                NewsArticle.published_at >= start_date,
                NewsArticle.published_at <= end_date,
                NewsArticle.content.isnot(None)
            )
        ).all()
        
        social_posts = self.db.query(RawSocialPost).filter(
            and_(
                RawSocialPost.created_at >= start_date,
                RawSocialPost.created_at <= end_date,
                RawSocialPost.content.isnot(None)
            )
        ).all()
        
        # Extract keywords/topics (simplified implementation)
        word_counts = Counter()
        
        # Common political keywords in Spanish
        political_keywords = {
            'gobierno', 'presidente', 'congreso', 'elecciones', 'politica',
            'ministro', 'ley', 'reforma', 'crisis', 'economia', 'corrupcion',
            'democracia', 'partido', 'candidato', 'votacion', 'pueblo'
        }
        
        # Process news content
        for article in news_articles:
            if article.content:
                words = article.content.lower().split()
                for word in words:
                    clean_word = ''.join(c for c in word if c.isalpha())
                    if len(clean_word) > 3 and clean_word in political_keywords:
                        word_counts[clean_word] += 1
        
        # Process social content
        for post in social_posts:
            if post.content:
                words = post.content.lower().split()
                for word in words:
                    clean_word = ''.join(c for c in word if c.isalpha())
                    if len(clean_word) > 3 and clean_word in political_keywords:
                        word_counts[clean_word] += 1
        
        # Return top trending topics
        trending_topics = []
        for word, count in word_counts.most_common(limit):
            trending_topics.append({
                "topic": word,
                "mentions": count,
                "trend_score": count / max(word_counts.values()) if word_counts else 0
            })
        
        return trending_topics
    
    def _calculate_daily_sentiment_trend(
        self, 
        items: List, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Calculate daily sentiment trend"""
        
        daily_sentiment = {}
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        # Initialize all dates with zero values
        while current_date <= end_date_only:
            daily_sentiment[current_date.isoformat()] = []
            current_date += timedelta(days=1)
        
        # Group items by date
        for item in items:
            if hasattr(item, 'published_at') and item.published_at:
                date_key = item.published_at.date().isoformat()
            elif hasattr(item, 'created_at') and item.created_at:
                date_key = item.created_at.date().isoformat()
            else:
                continue
            
            if date_key in daily_sentiment and item.sentiment_score is not None:
                daily_sentiment[date_key].append(item.sentiment_score)
        
        # Calculate average sentiment per day
        trend = []
        for date, scores in daily_sentiment.items():
            avg_sentiment = sum(scores) / len(scores) if scores else 0
            trend.append({
                "date": date,
                "average_sentiment": avg_sentiment,
                "item_count": len(scores)
            })
        
        return trend
    
    def _get_keyword_trend_news(
        self, 
        keyword: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get keyword trend from news articles"""
        
        articles = self.db.query(NewsArticle).filter(
            and_(
                NewsArticle.published_at >= start_date,
                NewsArticle.published_at <= end_date,
                NewsArticle.content.ilike(f'%{keyword}%')
            )
        ).all()
        
        # Group by date and count mentions
        daily_counts = {}
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        while current_date <= end_date_only:
            daily_counts[current_date.isoformat()] = 0
            current_date += timedelta(days=1)
        
        for article in articles:
            if article.published_at:
                date_key = article.published_at.date().isoformat()
                if date_key in daily_counts:
                    # Count keyword occurrences in content
                    count = article.content.lower().count(keyword.lower()) if article.content else 0
                    daily_counts[date_key] += count
        
        return [{"date": date, "count": count, "source": "news"} for date, count in daily_counts.items()]
    
    def _get_keyword_trend_social(
        self, 
        keyword: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get keyword trend from social posts"""
        
        posts = self.db.query(RawSocialPost).filter(
            and_(
                RawSocialPost.created_at >= start_date,
                RawSocialPost.created_at <= end_date,
                RawSocialPost.content.ilike(f'%{keyword}%')
            )
        ).all()
        
        # Group by date and count mentions
        daily_counts = {}
        current_date = start_date.date()
        end_date_only = end_date.date()
        
        while current_date <= end_date_only:
            daily_counts[current_date.isoformat()] = 0
            current_date += timedelta(days=1)
        
        for post in posts:
            if post.created_at:
                date_key = post.created_at.date().isoformat()
                if date_key in daily_counts:
                    # Count keyword occurrences in content
                    count = post.content.lower().count(keyword.lower()) if post.content else 0
                    daily_counts[date_key] += count
        
        return [{"date": date, "count": count, "source": "social"} for date, count in daily_counts.items()]
    
    def _combine_trends(
        self, 
        news_trend: List[Dict[str, Any]], 
        social_trend: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Combine news and social trends"""
        
        combined = {}
        
        # Add news data
        for item in news_trend:
            date = item['date']
            if date not in combined:
                combined[date] = {"date": date, "news_count": 0, "social_count": 0, "total_count": 0}
            combined[date]["news_count"] = item['count']
            combined[date]["total_count"] += item['count']
        
        # Add social data
        for item in social_trend:
            date = item['date']
            if date not in combined:
                combined[date] = {"date": date, "news_count": 0, "social_count": 0, "total_count": 0}
            combined[date]["social_count"] = item['count']
            combined[date]["total_count"] += item['count']
        
        return list(combined.values())
    
    def _calculate_keyword_correlations(
        self, 
        keywords: List[str], 
        keyword_trends: Dict[str, List[Dict[str, Any]]]
    ) -> Dict[str, Dict[str, float]]:
        """Calculate correlation matrix between keywords"""
        
        # Simplified correlation calculation
        correlation_matrix = {}
        
        for keyword1 in keywords:
            correlation_matrix[keyword1] = {}
            for keyword2 in keywords:
                if keyword1 == keyword2:
                    correlation_matrix[keyword1][keyword2] = 1.0
                else:
                    # Calculate simple correlation based on daily trends
                    trend1 = keyword_trends.get(keyword1, [])
                    trend2 = keyword_trends.get(keyword2, [])
                    
                    if not trend1 or not trend2:
                        correlation_matrix[keyword1][keyword2] = 0.0
                    else:
                        # Simple correlation based on trend similarity
                        correlation = self._calculate_simple_correlation(trend1, trend2)
                        correlation_matrix[keyword1][keyword2] = correlation
        
        return correlation_matrix
    
    def _calculate_simple_correlation(
        self, 
        trend1: List[Dict[str, Any]], 
        trend2: List[Dict[str, Any]]
    ) -> float:
        """Calculate simple correlation between two trends"""
        
        # Create aligned data
        data1 = {}
        data2 = {}
        
        for item in trend1:
            data1[item['date']] = item.get('total_count', 0)
        
        for item in trend2:
            data2[item['date']] = item.get('total_count', 0)
        
        # Find common dates
        common_dates = set(data1.keys()) & set(data2.keys())
        
        if len(common_dates) < 2:
            return 0.0
        
        # Calculate correlation coefficient (simplified)
        values1 = [data1[date] for date in common_dates]
        values2 = [data2[date] for date in common_dates]
        
        if not values1 or not values2:
            return 0.0
        
        # Simple correlation: if trends move in same direction
        mean1 = sum(values1) / len(values1)
        mean2 = sum(values2) / len(values2)
        
        numerator = sum((v1 - mean1) * (v2 - mean2) for v1, v2 in zip(values1, values2))
        denominator1 = sum((v1 - mean1) ** 2 for v1 in values1) ** 0.5
        denominator2 = sum((v2 - mean2) ** 2 for v2 in values2) ** 0.5
        
        if denominator1 == 0 or denominator2 == 0:
            return 0.0
        
        correlation = numerator / (denominator1 * denominator2)
        return max(-1.0, min(1.0, correlation))  # Clamp between -1 and 1