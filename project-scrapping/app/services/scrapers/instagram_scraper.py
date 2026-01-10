import httpx
import os
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class InstagramScraper:
    def __init__(self):
        self.access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
        self.base_url = "https://graph.facebook.com/v18.0"
    
    def is_configured(self) -> bool:
        return bool(self.access_token)
    
    def _extract_username_from_permalink(self, permalink: str) -> str:
        """Extract username from Instagram permalink like https://www.instagram.com/p/CODE/"""
        if not permalink:
            return ""
        try:
            import re
            match = re.search(r'instagram\.com/([^/]+)/p/', permalink)
            if match:
                username = match.group(1)
                if username not in ['p', 'reel', 'tv', 'stories']:
                    return username
            match = re.search(r'instagram\.com/reel/[^/]+/?\?.*igsh=', permalink)
            if match:
                return ""
        except Exception:
            pass
        return ""
    
    async def test_connection(self) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "success": False,
                "error": "INSTAGRAM_ACCESS_TOKEN no está configurado"
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
                        "message": "Conexión exitosa con la API de Instagram/Facebook"
                    }
                else:
                    error_data = response.json()
                    return {
                        "success": False,
                        "error": error_data.get("error", {}).get("message", "Error desconocido"),
                        "status_code": response.status_code
                    }
        except Exception as e:
            logger.error(f"Error testing Instagram connection: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_instagram_accounts(self) -> List[Dict[str, Any]]:
        if not self.is_configured():
            logger.error("Instagram no está configurado - falta INSTAGRAM_ACCESS_TOKEN")
            return []
        
        accounts = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/me/accounts",
                    params={
                        "access_token": self.access_token,
                        "fields": "id,name,instagram_business_account"
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"Error getting pages: {response.text}")
                    return []
                
                pages = response.json().get("data", [])
                
                for page in pages:
                    ig_account = page.get("instagram_business_account")
                    if ig_account:
                        ig_id = ig_account.get("id")
                        ig_response = await client.get(
                            f"{self.base_url}/{ig_id}",
                            params={
                                "access_token": self.access_token,
                                "fields": "id,username,name,followers_count,media_count"
                            }
                        )
                        
                        if ig_response.status_code == 200:
                            ig_data = ig_response.json()
                            accounts.append({
                                "page_id": page.get("id"),
                                "page_name": page.get("name"),
                                "instagram_id": ig_id,
                                "instagram_username": ig_data.get("username"),
                                "instagram_name": ig_data.get("name"),
                                "followers_count": ig_data.get("followers_count", 0),
                                "media_count": ig_data.get("media_count", 0)
                            })
                
                return accounts
                
        except Exception as e:
            logger.error(f"Error getting Instagram accounts: {e}")
            return []
    
    async def search_hashtag(self, hashtag: str, user_id: str, max_results: int = 50) -> List[Dict[str, Any]]:
        if not self.is_configured():
            logger.error("Instagram no está configurado")
            return []
        
        all_posts = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                search_response = await client.get(
                    f"{self.base_url}/ig_hashtag_search",
                    params={
                        "user_id": user_id,
                        "q": hashtag.replace("#", ""),
                        "access_token": self.access_token
                    }
                )
                
                if search_response.status_code != 200:
                    logger.error(f"Error searching hashtag: {search_response.text}")
                    return []
                
                hashtag_data = search_response.json().get("data", [])
                if not hashtag_data:
                    logger.warning(f"No se encontró el hashtag: {hashtag}")
                    return []
                
                hashtag_id = hashtag_data[0].get("id")
                
                media_response = await client.get(
                    f"{self.base_url}/{hashtag_id}/top_media",
                    params={
                        "user_id": user_id,
                        "access_token": self.access_token,
                        "fields": "id,caption,like_count,comments_count,timestamp,permalink,media_type"
                    }
                )
                
                if media_response.status_code != 200:
                    logger.error(f"Error getting hashtag media: {media_response.text}")
                    return []
                
                posts = media_response.json().get("data", [])[:max_results]
                
                for post in posts:
                    permalink = post.get("permalink", "")
                    author_name = self._extract_username_from_permalink(permalink)
                    
                    all_posts.append({
                        "post_id": post.get("id"),
                        "content": post.get("caption", ""),
                        "author": author_name,
                        "likes": post.get("like_count", 0),
                        "comments": post.get("comments_count", 0),
                        "shares": 0,
                        "views": 0,
                        "timestamp": post.get("timestamp"),
                        "permalink": permalink,
                        "media_type": post.get("media_type"),
                        "hashtag": hashtag,
                        "platform": "instagram"
                    })
                
                logger.info(f"Encontrados {len(all_posts)} posts para #{hashtag}")
                return all_posts
                
        except Exception as e:
            logger.error(f"Error searching hashtag {hashtag}: {e}")
            return []
    
    async def get_user_media(self, ig_user_id: str, max_results: int = 50) -> List[Dict[str, Any]]:
        if not self.is_configured():
            logger.error("Instagram no está configurado")
            return []
        
        all_posts = []
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/{ig_user_id}/media",
                    params={
                        "access_token": self.access_token,
                        "fields": "id,caption,like_count,comments_count,timestamp,permalink,media_type,username",
                        "limit": min(max_results, 50)
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"Error getting user media: {response.text}")
                    return []
                
                posts = response.json().get("data", [])
                
                for post in posts:
                    all_posts.append({
                        "post_id": post.get("id"),
                        "content": post.get("caption", ""),
                        "author": post.get("username", ""),
                        "likes": post.get("like_count", 0),
                        "comments": post.get("comments_count", 0),
                        "shares": 0,
                        "views": 0,
                        "timestamp": post.get("timestamp"),
                        "permalink": post.get("permalink"),
                        "media_type": post.get("media_type"),
                        "platform": "instagram"
                    })
                
                logger.info(f"Encontrados {len(all_posts)} posts del usuario")
                return all_posts
                
        except Exception as e:
            logger.error(f"Error getting user media: {e}")
            return []
    
    async def scrape_political_content(self, ig_user_id: str, max_per_hashtag: int = 25) -> List[Dict[str, Any]]:
        political_hashtags = [
            "politicaperu",
            "perupolitico",
            "congresoperu",
            "gobiernoperu",
            "eleccionesperu",
            "peru2026"
        ]
        
        all_posts = []
        
        for hashtag in political_hashtags:
            try:
                posts = await self.search_hashtag(hashtag, ig_user_id, max_per_hashtag)
                all_posts.extend(posts)
                logger.info(f"Hashtag #{hashtag}: {len(posts)} posts")
            except Exception as e:
                logger.error(f"Error con hashtag #{hashtag}: {e}")
                continue
        
        unique_posts = {post["post_id"]: post for post in all_posts}
        return list(unique_posts.values())
