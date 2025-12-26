import httpx
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from app.scrapers.base import BaseScraper
from app.models import RawSocialPost
from app.config import settings
from loguru import logger

class TwitterScraper(BaseScraper):
    """Twitter API v2 scraper"""
    
    def __init__(self):
        super().__init__()
        self.api_base = "https://api.twitter.com/2"
        self.bearer_token = settings.TWITTER_BEARER_TOKEN
        
        if not self.bearer_token:
            logger.warning("Twitter Bearer Token not configured")
    
    def scrape(self, db: Session) -> int:
        """Scrape Twitter posts using API v2"""
        if not self.bearer_token:
            logger.error("Cannot scrape Twitter without Bearer Token")
            return 0
        
        # Political keywords to search for
        keywords = [
            "política perú", "gobierno perú", "congreso perú", 
            "elecciones perú", "presidente perú"
        ]
        
        all_items = []
        
        for keyword in keywords:
            try:
                items = self._search_tweets(keyword)
                all_items.extend(items)
            except Exception as e:
                logger.error(f"Error searching tweets for '{keyword}': {e}")
                continue
        
        return self._save_items(db, all_items, RawSocialPost)
    
    def _search_tweets(self, query: str, max_results: int = 100) -> List[Dict[str, Any]]:
        """Search tweets using Twitter API v2"""
        
        url = f"{self.api_base}/tweets/search/recent"
        
        headers = {
            "Authorization": f"Bearer {self.bearer_token}",
            "Content-Type": "application/json"
        }
        
        params = {
            "query": f"{query} -is:retweet lang:es",
            "max_results": min(max_results, 100),
            "tweet.fields": "created_at,author_id,public_metrics,context_annotations",
            "user.fields": "username,name,verified",
            "expansions": "author_id"
        }
        
        response = self._make_request(url, headers=headers, params=params)
        if not response:
            return []
        
        try:
            data = response.json()
            return self._parse_twitter_response(data)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing Twitter API response: {e}")
            return []
    
    def _parse_twitter_response(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Twitter API response"""
        tweets = []
        
        if 'data' not in data:
            return tweets
        
        # Create user lookup
        users = {}
        if 'includes' in data and 'users' in data['includes']:
            for user in data['includes']['users']:
                users[user['id']] = user
        
        for tweet in data['data']:
            try:
                author_info = users.get(tweet.get('author_id'), {})
                
                tweet_data = {
                    'platform': 'twitter',
                    'post_id': tweet['id'],
                    'author': author_info.get('username'),
                    'content': tweet['text'],
                    'created_at': datetime.fromisoformat(tweet['created_at'].replace('Z', '+00:00')),
                    'engagement_metrics': tweet.get('public_metrics', {}),
                    'metadata': {
                        'author_name': author_info.get('name'),
                        'author_verified': author_info.get('verified', False),
                        'context_annotations': tweet.get('context_annotations', [])
                    },
                    'scraped_at': datetime.now()
                }
                
                tweets.append(tweet_data)
                
            except Exception as e:
                logger.error(f"Error parsing tweet data: {e}")
                continue
        
        return tweets
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if tweet already exists"""
        existing = db.query(model_class).filter(
            model_class.platform == 'twitter',
            model_class.post_id == item_data['post_id']
        ).first()
        return existing is not None
    
    def _parse_content(self, response) -> List[Dict[str, Any]]:
        """Parse Twitter API response"""
        try:
            data = response.json()
            return self._parse_twitter_response(data)
        except:
            return []

class FacebookScraper(BaseScraper):
    """Facebook Graph API scraper"""
    
    def __init__(self):
        super().__init__()
        self.api_base = "https://graph.facebook.com/v18.0"
        self.access_token = settings.FACEBOOK_ACCESS_TOKEN
        
        if not self.access_token:
            logger.warning("Facebook Access Token not configured")
    
    def scrape(self, db: Session) -> int:
        """Scrape Facebook posts using Graph API"""
        if not self.access_token:
            logger.error("Cannot scrape Facebook without Access Token")
            return 0
        
        # Note: Facebook's API is restrictive for public content
        # This is a basic implementation that would need proper page access
        
        all_items = []
        
        # Example: scrape from specific public pages (requires page access)
        public_pages = []  # Add page IDs here
        
        for page_id in public_pages:
            try:
                items = self._get_page_posts(page_id)
                all_items.extend(items)
            except Exception as e:
                logger.error(f"Error scraping Facebook page {page_id}: {e}")
                continue
        
        return self._save_items(db, all_items, RawSocialPost)
    
    def _get_page_posts(self, page_id: str) -> List[Dict[str, Any]]:
        """Get posts from a Facebook page"""
        
        url = f"{self.api_base}/{page_id}/posts"
        
        params = {
            "access_token": self.access_token,
            "fields": "id,message,created_time,engagement,reactions.summary(true)",
            "limit": 50
        }
        
        response = self._make_request(url, params=params)
        if not response:
            return []
        
        try:
            data = response.json()
            return self._parse_facebook_response(data)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing Facebook API response: {e}")
            return []
    
    def _parse_facebook_response(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Facebook API response"""
        posts = []
        
        if 'data' not in data:
            return posts
        
        for post in data['data']:
            try:
                post_data = {
                    'platform': 'facebook',
                    'post_id': post['id'],
                    'author': None,  # Would need additional API call
                    'content': post.get('message', ''),
                    'created_at': datetime.fromisoformat(post['created_time'].replace('+0000', '+00:00')),
                    'engagement_metrics': {
                        'reactions': post.get('reactions', {}).get('summary', {}).get('total_count', 0)
                    },
                    'metadata': post.get('engagement', {}),
                    'scraped_at': datetime.now()
                }
                
                posts.append(post_data)
                
            except Exception as e:
                logger.error(f"Error parsing Facebook post data: {e}")
                continue
        
        return posts
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if Facebook post already exists"""
        existing = db.query(model_class).filter(
            model_class.platform == 'facebook',
            model_class.post_id == item_data['post_id']
        ).first()
        return existing is not None
    
    def _parse_content(self, response) -> List[Dict[str, Any]]:
        """Parse Facebook API response"""
        try:
            data = response.json()
            return self._parse_facebook_response(data)
        except:
            return []

class InstagramScraper(BaseScraper):
    """Instagram Basic Display API scraper"""
    
    def __init__(self):
        super().__init__()
        self.api_base = "https://graph.instagram.com"
        self.access_token = settings.INSTAGRAM_ACCESS_TOKEN
        
        if not self.access_token:
            logger.warning("Instagram Access Token not configured")
    
    def scrape(self, db: Session) -> int:
        """Scrape Instagram posts using Basic Display API"""
        if not self.access_token:
            logger.error("Cannot scrape Instagram without Access Token")
            return 0
        
        # Note: Instagram Basic Display API is limited to user's own content
        # For public content, would need Instagram Graph API with business account
        
        all_items = []
        
        try:
            items = self._get_user_media()
            all_items.extend(items)
        except Exception as e:
            logger.error(f"Error scraping Instagram media: {e}")
        
        return self._save_items(db, all_items, RawSocialPost)
    
    def _get_user_media(self) -> List[Dict[str, Any]]:
        """Get user's Instagram media"""
        
        url = f"{self.api_base}/me/media"
        
        params = {
            "access_token": self.access_token,
            "fields": "id,caption,media_type,media_url,timestamp,like_count,comments_count",
            "limit": 50
        }
        
        response = self._make_request(url, params=params)
        if not response:
            return []
        
        try:
            data = response.json()
            return self._parse_instagram_response(data)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing Instagram API response: {e}")
            return []
    
    def _parse_instagram_response(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Instagram API response"""
        posts =[]
        
        if 'data' not in data:
            return posts
        
        for media in data['data']:
            try:
                post_data = {
                    'platform': 'instagram',
                    'post_id': media['id'],
                    'author': None,  # Would need additional API call
                    'content': media.get('caption', ''),
                    'created_at': datetime.fromisoformat(media['timestamp'].replace('+0000', '+00:00')),
                    'engagement_metrics': {
                        'likes': media.get('like_count', 0),
                        'comments': media.get('comments_count', 0)
                    },
                    'metadata': {
                        'media_type': media.get('media_type'),
                        'media_url': media.get('media_url')
                    },
                    'scraped_at': datetime.now()
                }
                
                posts.append(post_data)
                
            except Exception as e:
                logger.error(f"Error parsing Instagram media data: {e}")
                continue
        
        return posts
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if Instagram post already exists"""
        existing = db.query(model_class).filter(
            model_class.platform == 'instagram',
            model_class.post_id == item_data['post_id']
        ).first()
        return existing is not None
    
    def _parse_content(self, response) -> List[Dict[str, Any]]:
        """Parse Instagram API response"""
        try:
            data = response.json()
            return self._parse_instagram_response(data)
        except:
            return []

class YouTubeScraper(BaseScraper):
    """YouTube Data API v3 scraper"""
    
    def __init__(self):
        super().__init__()
        self.api_base = "https://www.googleapis.com/youtube/v3"
        self.api_key = settings.YOUTUBE_API_KEY
        
        if not self.api_key:
            logger.warning("YouTube API Key not configured")
    
    def scrape(self, db: Session) -> int:
        """Scrape YouTube videos using Data API v3"""
        if not self.api_key:
            logger.error("Cannot scrape YouTube without API Key")
            return 0
        
        # Search for political content
        keywords = [
            "política perú", "gobierno perú", "congreso perú",
            "elecciones perú", "noticias perú"
        ]
        
        all_items = []
        
        for keyword in keywords:
            try:
                items = self._search_videos(keyword)
                all_items.extend(items)
            except Exception as e:
                logger.error(f"Error searching YouTube videos for '{keyword}': {e}")
                continue
        
        return self._save_items(db, all_items, RawSocialPost)
    
    def _search_videos(self, query: str, max_results: int = 50) -> List[Dict[str, Any]]:
        """Search YouTube videos"""
        
        url = f"{self.api_base}/search"
        
        params = {
            "key": self.api_key,
            "q": query,
            "part": "snippet",
            "type": "video",
            "maxResults": min(max_results, 50),
            "order": "date",
            "regionCode": "PE",
            "relevanceLanguage": "es"
        }
        
        response = self._make_request(url, params=params)
        if not response:
            return []
        
        try:
            data = response.json()
            return self._parse_youtube_response(data)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing YouTube API response: {e}")
            return []
    
    def _parse_youtube_response(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse YouTube API response"""
        videos = []
        
        if 'items' not in data:
            return videos
        
        for item in data['items']:
            try:
                snippet = item['snippet']
                
                video_data = {
                    'platform': 'youtube',
                    'post_id': item['id']['videoId'],
                    'author': snippet['channelTitle'],
                    'content': f"{snippet['title']} - {snippet.get('description', '')}",
                    'created_at': datetime.fromisoformat(snippet['publishedAt'].replace('Z', '+00:00')),
                    'engagement_metrics': {},  # Would need additional API call for statistics
                    'metadata': {
                        'channel_id': snippet['channelId'],
                        'thumbnail': snippet.get('thumbnails', {}).get('default', {}).get('url')
                    },
                    'scraped_at': datetime.now()
                }
                
                videos.append(video_data)
                
            except Exception as e:
                logger.error(f"Error parsing YouTube video data: {e}")
                continue
        
        return videos
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if YouTube video already exists"""
        existing = db.query(model_class).filter(
            model_class.platform == 'youtube',
            model_class.post_id == item_data['post_id']
        ).first()
        return existing is not None
    
    def _parse_content(self, response) -> List[Dict[str, Any]]:
        """Parse YouTube API response"""
        try:
            data = response.json()
            return self._parse_youtube_response(data)
        except:
            return []