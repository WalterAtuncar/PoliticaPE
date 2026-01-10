import httpx
import os
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class FacebookScraper:
    def __init__(self):
        self.access_token = os.getenv("FACEBOOK_GRAPH_TOKEN")
        self.base_url = "https://graph.facebook.com/v18.0"
    
    def is_configured(self) -> bool:
        return bool(self.access_token)
    
    async def test_connection(self) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "success": False,
                "error": "FACEBOOK_GRAPH_TOKEN no está configurado"
            }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/me",
                    params={
                        "access_token": self.access_token,
                        "fields": "id,name"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "user_id": data.get("id"),
                        "name": data.get("name"),
                        "message": "Conexión exitosa con la API de Facebook"
                    }
                else:
                    error_data = response.json()
                    return {
                        "success": False,
                        "error": error_data.get("error", {}).get("message", "Error desconocido"),
                        "status_code": response.status_code
                    }
        except Exception as e:
            logger.error(f"Error testing Facebook connection: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_managed_pages(self) -> List[Dict[str, Any]]:
        if not self.is_configured():
            logger.error("Facebook no está configurado - falta FACEBOOK_GRAPH_TOKEN")
            return []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/me/accounts",
                    params={
                        "access_token": self.access_token,
                        "fields": "id,name,fan_count,category"
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"Error getting pages: {response.text}")
                    return []
                
                pages = response.json().get("data", [])
                return [{
                    "page_id": page.get("id"),
                    "name": page.get("name"),
                    "fan_count": page.get("fan_count", 0),
                    "category": page.get("category")
                } for page in pages]
                
        except Exception as e:
            logger.error(f"Error getting Facebook pages: {e}")
            return []
    
    async def search_public_posts(self, query: str, max_results: int = 50) -> List[Dict[str, Any]]:
        if not self.is_configured():
            logger.error("Facebook no está configurado")
            return []
        
        all_posts = []
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(
                    f"{self.base_url}/search",
                    params={
                        "type": "post",
                        "q": query,
                        "access_token": self.access_token,
                        "fields": "id,message,created_time,from,shares,reactions.summary(true),comments.summary(true),permalink_url",
                        "limit": min(max_results, 100)
                    }
                )
                
                if response.status_code != 200:
                    error_data = response.json()
                    error_msg = error_data.get("error", {}).get("message", "Error desconocido")
                    logger.warning(f"Search API no disponible: {error_msg}")
                    return []
                
                posts = response.json().get("data", [])
                
                for post in posts:
                    reactions = post.get("reactions", {}).get("summary", {})
                    comments = post.get("comments", {}).get("summary", {})
                    shares = post.get("shares", {})
                    
                    all_posts.append({
                        "post_id": post.get("id"),
                        "content": post.get("message", ""),
                        "author": post.get("from", {}).get("name", ""),
                        "author_id": post.get("from", {}).get("id", ""),
                        "likes": reactions.get("total_count", 0),
                        "comments": comments.get("total_count", 0),
                        "shares": shares.get("count", 0),
                        "views": 0,
                        "timestamp": post.get("created_time"),
                        "permalink": post.get("permalink_url"),
                        "platform": "facebook"
                    })
                
                logger.info(f"Encontrados {len(all_posts)} posts para '{query}'")
                return all_posts
                
        except Exception as e:
            logger.error(f"Error searching posts: {e}")
            return []
    
    async def get_page_posts(self, page_id: str, max_results: int = 50) -> List[Dict[str, Any]]:
        if not self.is_configured():
            logger.error("Facebook no está configurado")
            return []
        
        all_posts = []
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(
                    f"{self.base_url}/{page_id}/posts",
                    params={
                        "access_token": self.access_token,
                        "fields": "id,message,created_time,shares,reactions.summary(true),comments.summary(true),permalink_url",
                        "limit": min(max_results, 100)
                    }
                )
                
                if response.status_code != 200:
                    error_data = response.json()
                    error_msg = error_data.get("error", {}).get("message", "Error desconocido")
                    logger.error(f"Error getting page posts: {error_msg}")
                    return []
                
                posts = response.json().get("data", [])
                
                page_info_response = await client.get(
                    f"{self.base_url}/{page_id}",
                    params={
                        "access_token": self.access_token,
                        "fields": "name"
                    }
                )
                page_name = ""
                if page_info_response.status_code == 200:
                    page_name = page_info_response.json().get("name", "")
                
                for post in posts:
                    if not post.get("message"):
                        continue
                    
                    reactions = post.get("reactions", {}).get("summary", {})
                    comments = post.get("comments", {}).get("summary", {})
                    shares = post.get("shares", {})
                    
                    all_posts.append({
                        "post_id": post.get("id"),
                        "content": post.get("message", ""),
                        "author": page_name,
                        "author_id": page_id,
                        "likes": reactions.get("total_count", 0),
                        "comments": comments.get("total_count", 0),
                        "shares": shares.get("count", 0),
                        "views": 0,
                        "timestamp": post.get("created_time"),
                        "permalink": post.get("permalink_url"),
                        "platform": "facebook"
                    })
                
                logger.info(f"Encontrados {len(all_posts)} posts de página {page_name}")
                return all_posts
                
        except Exception as e:
            logger.error(f"Error getting page posts: {e}")
            return []
    
    async def scrape_political_pages(self, page_ids: List[str] = None, max_per_page: int = 25) -> List[Dict[str, Any]]:
        political_pages = page_ids or [
            "CongresoPeru",
            "PresidenciaPeru",
            "PCaborel",
            "Minabortel",
        ]
        
        all_posts = []
        
        for page_id in political_pages:
            try:
                posts = await self.get_page_posts(page_id, max_per_page)
                all_posts.extend(posts)
                logger.info(f"Página {page_id}: {len(posts)} posts")
            except Exception as e:
                logger.error(f"Error con página {page_id}: {e}")
                continue
        
        unique_posts = {post["post_id"]: post for post in all_posts}
        return list(unique_posts.values())
