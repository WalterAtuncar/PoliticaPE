import os
import httpx
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class YouTubeScraper:
    BASE_URL = "https://www.googleapis.com/youtube/v3"
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("YOUTUBE_API_KEY")
        if not self.api_key:
            raise ValueError("YOUTUBE_API_KEY no está configurado")
    
    async def search_videos(
        self,
        query: str = "política Perú",
        max_results: int = 50,
        days_back: int = 7
    ) -> List[Dict[str, Any]]:
        published_after = (datetime.utcnow() - timedelta(days=days_back)).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "regionCode": "PE",
            "relevanceLanguage": "es",
            "maxResults": min(max_results, 50),
            "publishedAfter": published_after,
            "order": "relevance",
            "key": self.api_key
        }
        
        videos = []
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(f"{self.BASE_URL}/search", params=params)
                response.raise_for_status()
                search_data = response.json()
                
                if "items" not in search_data:
                    logger.info("No se encontraron videos")
                    return videos
                
                video_ids = [item["id"]["videoId"] for item in search_data["items"] if "videoId" in item.get("id", {})]
                
                if not video_ids:
                    return videos
                
                stats_params = {
                    "part": "statistics,contentDetails",
                    "id": ",".join(video_ids),
                    "key": self.api_key
                }
                
                stats_response = await client.get(f"{self.BASE_URL}/videos", params=stats_params)
                stats_response.raise_for_status()
                stats_data = stats_response.json()
                
                stats_map = {}
                for item in stats_data.get("items", []):
                    stats_map[item["id"]] = item.get("statistics", {})
                
                for item in search_data["items"]:
                    if "videoId" not in item.get("id", {}):
                        continue
                        
                    video_id = item["id"]["videoId"]
                    snippet = item.get("snippet", {})
                    stats = stats_map.get(video_id, {})
                    
                    processed_video = {
                        "platform": "youtube",
                        "post_id": video_id,
                        "author": snippet.get("channelTitle", "unknown"),
                        "content": f"{snippet.get('title', '')} - {snippet.get('description', '')[:500]}",
                        "created_at": snippet.get("publishedAt"),
                        "engagement_metrics": {
                            "likes": int(stats.get("likeCount", 0)),
                            "shares": 0,
                            "comments": int(stats.get("commentCount", 0)),
                            "views": int(stats.get("viewCount", 0))
                        },
                        "metadata": {
                            "channel_id": snippet.get("channelId"),
                            "channel_title": snippet.get("channelTitle"),
                            "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url"),
                            "video_url": f"https://www.youtube.com/watch?v={video_id}"
                        },
                        "geographic_location": "Perú",
                        "region": "Nacional"
                    }
                    videos.append(processed_video)
                
            except httpx.HTTPStatusError as e:
                logger.error(f"Error HTTP de YouTube API: {e.response.status_code} - {e.response.text}")
            except Exception as e:
                logger.error(f"Error al obtener videos: {str(e)}")
        
        logger.info(f"Se obtuvieron {len(videos)} videos de YouTube")
        return videos
    
    async def search_political_content(self, keywords: List[str] = None, max_results: int = 50) -> List[Dict[str, Any]]:
        if keywords is None:
            keywords = [
                "política peruana 2026",
                "congreso Perú noticias",
                "Dina Boluarte",
                "elecciones Perú",
                "partidos políticos Perú"
            ]
        
        all_videos = []
        videos_per_query = max(1, max_results // len(keywords))
        
        for keyword in keywords:
            videos = await self.search_videos(query=keyword, max_results=videos_per_query)
            for video in videos:
                if video["post_id"] not in [v["post_id"] for v in all_videos]:
                    all_videos.append(video)
        
        return all_videos[:max_results]
