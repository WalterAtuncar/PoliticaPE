import os
import httpx
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class TwitterScraper:
    BASE_URL = "https://api.twitter.com/2"
    
    def __init__(self):
        self.bearer_token = os.environ.get("X_BEARER_TOKEN")
        if not self.bearer_token:
            raise ValueError("X_BEARER_TOKEN no está configurado")
        
        self.headers = {
            "Authorization": f"Bearer {self.bearer_token}",
            "Content-Type": "application/json"
        }
    
    async def search_tweets(
        self, 
        query: str = "política Perú OR gobierno Perú OR congreso Perú",
        max_results: int = 100,
        days_back: int = 7
    ) -> List[Dict[str, Any]]:
        start_time = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        params = {
            "query": f"{query} lang:es -is:retweet",
            "max_results": min(max_results, 100),
            "start_time": start_time,
            "tweet.fields": "created_at,public_metrics,author_id,geo,lang",
            "expansions": "author_id,geo.place_id",
            "user.fields": "username,name,location",
            "place.fields": "full_name,country"
        }
        
        tweets = []
        next_token = None
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            while len(tweets) < max_results:
                if next_token:
                    params["next_token"] = next_token
                
                try:
                    response = await client.get(
                        f"{self.BASE_URL}/tweets/search/recent",
                        headers=self.headers,
                        params=params
                    )
                    
                    if response.status_code == 429:
                        logger.warning("Rate limit alcanzado. Esperando...")
                        break
                    
                    response.raise_for_status()
                    data = response.json()
                    
                    if "data" not in data:
                        logger.info("No se encontraron tweets")
                        break
                    
                    users_map = {}
                    if "includes" in data and "users" in data["includes"]:
                        for user in data["includes"]["users"]:
                            users_map[user["id"]] = user
                    
                    places_map = {}
                    if "includes" in data and "places" in data["includes"]:
                        for place in data["includes"]["places"]:
                            places_map[place["id"]] = place
                    
                    for tweet in data["data"]:
                        user = users_map.get(tweet.get("author_id"), {})
                        metrics = tweet.get("public_metrics", {})
                        
                        geo_location = None
                        if "geo" in tweet and "place_id" in tweet["geo"]:
                            place = places_map.get(tweet["geo"]["place_id"], {})
                            geo_location = place.get("full_name")
                        elif user.get("location"):
                            loc = user["location"].lower()
                            peru_regions = ["lima", "arequipa", "cusco", "trujillo", "piura", "chiclayo", "ica", "tacna", "puno", "huancayo"]
                            for region in peru_regions:
                                if region in loc:
                                    geo_location = region.title()
                                    break
                        
                        processed_tweet = {
                            "platform": "twitter",
                            "post_id": tweet["id"],
                            "author": user.get("username", "unknown"),
                            "content": tweet.get("text", ""),
                            "created_at": tweet.get("created_at"),
                            "engagement_metrics": {
                                "likes": metrics.get("like_count", 0),
                                "shares": metrics.get("retweet_count", 0),
                                "comments": metrics.get("reply_count", 0),
                                "views": metrics.get("impression_count", 0),
                                "quotes": metrics.get("quote_count", 0)
                            },
                            "metadata": {
                                "author_id": tweet.get("author_id"),
                                "author_name": user.get("name"),
                                "author_location": user.get("location"),
                                "lang": tweet.get("lang")
                            },
                            "geographic_location": geo_location
                        }
                        tweets.append(processed_tweet)
                    
                    meta = data.get("meta", {})
                    next_token = meta.get("next_token")
                    
                    if not next_token:
                        break
                        
                except httpx.HTTPStatusError as e:
                    logger.error(f"Error HTTP de Twitter API: {e.response.status_code} - {e.response.text}")
                    break
                except Exception as e:
                    logger.error(f"Error al obtener tweets: {str(e)}")
                    break
        
        logger.info(f"Se obtuvieron {len(tweets)} tweets")
        return tweets
    
    async def search_political_content(self, keywords: List[str] = None, max_results: int = 100) -> List[Dict[str, Any]]:
        if keywords is None:
            keywords = [
                "Dina Boluarte", "Congreso Perú", "política peruana",
                "elecciones Perú", "JNE", "ONPE", "ministros Perú",
                "Fuerza Popular", "Perú Libre", "Alianza para el Progreso"
            ]
        
        query = " OR ".join([f'"{kw}"' for kw in keywords[:5]])
        return await self.search_tweets(query=query, max_results=max_results)
