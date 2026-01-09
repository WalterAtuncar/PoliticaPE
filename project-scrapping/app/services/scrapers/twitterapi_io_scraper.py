import httpx
import os
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class TwitterAPIioScraper:
    def __init__(self):
        self.api_key = os.getenv("TWITTERAPI_IO_KEY")
        self.base_url = "https://api.twitterapi.io/twitter"
        self.headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def is_configured(self) -> bool:
        return bool(self.api_key)
    
    async def search_tweets(self, query: str, max_results: int = 20) -> List[Dict[str, Any]]:
        if not self.is_configured():
            logger.error("TwitterAPI.io no está configurado - falta TWITTERAPI_IO_KEY")
            return []
        
        all_tweets = []
        cursor = None
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                while len(all_tweets) < max_results:
                    url = f"{self.base_url}/tweet/advanced_search"
                    
                    params = {
                        "query": query,
                        "queryType": "Latest"
                    }
                    
                    if cursor:
                        params["cursor"] = cursor
                    
                    response = await client.get(url, headers=self.headers, params=params)
                    
                    if response.status_code == 200:
                        data = response.json()
                        tweets = data.get("tweets", [])
                        all_tweets.extend(tweets)
                        
                        cursor = data.get("next_cursor")
                        if not cursor or not tweets:
                            break
                    else:
                        logger.error(f"Error TwitterAPI.io: {response.status_code} - {response.text}")
                        break
                
                logger.info(f"TwitterAPI.io: {len(all_tweets)} tweets encontrados para '{query}'")
                return all_tweets[:max_results]
                    
        except Exception as e:
            logger.error(f"Error en TwitterAPI.io scraper: {e}")
            return all_tweets[:max_results] if all_tweets else []
    
    async def test_connection(self) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "status": "error",
                "message": "API key no configurada",
                "api_configured": False
            }
        
        try:
            tweets = await self.search_tweets("Peru politica", max_results=5)
            
            sample_tweets = []
            for tweet in tweets[:3]:
                author = tweet.get("author", {})
                sample_tweets.append({
                    "id": tweet.get("id", ""),
                    "author": author.get("userName", "unknown"),
                    "content": tweet.get("text", "")[:200],
                    "engagement": {
                        "likes": tweet.get("likeCount", 0),
                        "retweets": tweet.get("retweetCount", 0),
                        "replies": tweet.get("replyCount", 0),
                        "views": tweet.get("viewCount", 0)
                    }
                })
            
            return {
                "status": "success",
                "message": "Conexión a TwitterAPI.io exitosa",
                "api_configured": True,
                "tweets_found": len(tweets),
                "sample_tweets": sample_tweets
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error de conexión: {str(e)}",
                "api_configured": True
            }
    
    def transform_tweet(self, tweet: Dict[str, Any]) -> Dict[str, Any]:
        author = tweet.get("author", {})
        
        created_at_str = tweet.get("createdAt", "")
        try:
            created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        except:
            created_at = datetime.utcnow()
        
        return {
            "platform": "twitter",
            "post_id": tweet.get("id", ""),
            "author": author.get("userName", "unknown"),
            "content": tweet.get("text", ""),
            "created_at": created_at,
            "engagement_metrics": {
                "likes": tweet.get("likeCount", 0),
                "shares": tweet.get("retweetCount", 0),
                "comments": tweet.get("replyCount", 0),
                "views": tweet.get("viewCount", 0)
            },
            "geographic_location": "Perú",
            "url": f"https://twitter.com/{author.get('userName', '')}/status/{tweet.get('id', '')}"
        }
