from abc import ABC, abstractmethod
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from fake_useragent import UserAgent
import time
import random
from loguru import logger

from app.config import settings

class BaseScraper(ABC):
    """Base class for all scrapers"""
    
    def __init__(self):
        self.session = self._create_session()
        self.ua = UserAgent()
        self.delay_range = (1, 3)  # Random delay between requests
    
    def _create_session(self) -> requests.Session:
        """Create a configured requests session"""
        session = requests.Session()
        
        # Retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Default headers
        session.headers.update({
            'User-Agent': settings.USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        return session
    
    def _get_random_user_agent(self) -> str:
        """Get a random user agent"""
        try:
            return self.ua.random
        except:
            return settings.USER_AGENT
    
    def _make_request(self, url: str, **kwargs) -> Optional[requests.Response]:
        """Make a request with proper error handling and delays"""
        try:
            # Random delay to avoid being blocked
            delay = random.uniform(*self.delay_range)
            time.sleep(delay)
            
            # Use random user agent
            headers = kwargs.get('headers', {})
            headers['User-Agent'] = self._get_random_user_agent()
            kwargs['headers'] = headers
            
            # Set timeout
            kwargs.setdefault('timeout', settings.REQUEST_TIMEOUT)
            
            response = self.session.get(url, **kwargs)
            response.raise_for_status()
            
            logger.debug(f"Successfully fetched {url}")
            return response
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def _check_robots_txt(self, base_url: str, path: str) -> bool:
        """Check if scraping is allowed by robots.txt"""
        try:
            robots_url = f"{base_url}/robots.txt"
            response = self._make_request(robots_url)
            
            if not response:
                return True  # Assume allowed if can't fetch robots.txt
            
            # Simple robots.txt parsing
            content = response.text.lower()
            user_agent_section = False
            
            for line in content.split('\n'):
                line = line.strip()
                
                if line.startswith('user-agent:'):
                    agent = line.split(':', 1)[1].strip()
                    user_agent_section = (agent == '*' or 'bot' in agent.lower())
                
                elif user_agent_section and line.startswith('disallow:'):
                    disallowed_path = line.split(':', 1)[1].strip()
                    if disallowed_path and path.startswith(disallowed_path):
                        logger.warning(f"Path {path} disallowed by robots.txt")
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking robots.txt for {base_url}: {e}")
            return True  # Assume allowed on error
    
    @abstractmethod
    def scrape(self, db: Session) -> int:
        """
        Main scraping method to be implemented by subclasses
        Returns: Number of items scraped
        """
        pass
    
    @abstractmethod
    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        """
        Parse response content and extract data
        Returns: List of extracted items
        """
        pass
    
    def _save_items(self, db: Session, items: List[Dict[str, Any]], model_class) -> int:
        """Save scraped items to database"""
        saved_count = 0
        
        for item_data in items:
            try:
                # Check if item already exists (implement in subclasses)
                if not self._item_exists(db, item_data, model_class):
                    if 'metadata' in item_data and hasattr(model_class, 'extra_metadata'):
                        item_data['extra_metadata'] = item_data.pop('metadata')
                    item = model_class(**item_data)
                    db.add(item)
                    saved_count += 1
                
            except Exception as e:
                logger.error(f"Error saving item: {e}")
                continue
        
        try:
            db.commit()
            logger.info(f"Saved {saved_count} new items")
        except Exception as e:
            logger.error(f"Error committing to database: {e}")
            db.rollback()
            saved_count = 0
        
        return saved_count
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if item already exists in database (override in subclasses)"""
        return False
    
    def close(self):
        """Close the scraper session"""
        if self.session:
            self.session.close()
