import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime
from urllib.parse import urljoin, urlparse
import re

from app.scrapers.base import BaseScraper
from app.models import NewsArticle
from loguru import logger

class ElComercioScraper(BaseScraper):
    """Scraper for El Comercio Peru"""
    
    def __init__(self):
        super().__init__()
        self.base_url = "https://elcomercio.pe"
        self.sections = [
            "/politica/",
            "/economia/",
            "/peru/"
        ]
    
    def scrape(self, db: Session) -> int:
        """Scrape El Comercio articles"""
        all_items = []
        
        for section in self.sections:
            section_url = f"{self.base_url}{section}"
            
            # Check robots.txt
            if not self._check_robots_txt(self.base_url, section):
                logger.warning(f"Skipping {section_url} due to robots.txt restrictions")
                continue
            
            response = self._make_request(section_url)
            if not response:
                continue
            
            items = self._parse_content(response)
            all_items.extend(items)
            
            logger.info(f"Scraped {len(items)} articles from {section}")
        
        return self._save_items(db, all_items, NewsArticle)
    
    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        """Parse El Comercio HTML content"""
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        
        # Find article elements (adjust selectors based on actual site structure)
        article_elements = soup.find_all(['article', 'div'], class_=re.compile(r'story|article|card'))
        
        for element in article_elements[:20]:  # Limit to 20 articles per section
            try:
                article_data = self._extract_article_data(element, response.url)
                if article_data:
                    articles.append(article_data)
            except Exception as e:
                logger.error(f"Error extracting article data: {e}")
                continue
        
        return articles
    
    def _extract_article_data(self, element: BeautifulSoup, base_url: str) -> Optional[Dict[str, Any]]:
        """Extract article data from HTML element"""
        
        # Extract title
        title_elem = element.find(['h1', 'h2', 'h3'], class_=re.compile(r'title|headline'))
        if not title_elem:
            title_elem = element.find('a')
        
        if not title_elem:
            return None
        
        title = title_elem.get_text(strip=True)
        
        # Extract URL
        link_elem = title_elem if title_elem.name == 'a' else title_elem.find('a')
        if not link_elem:
            return None
        
        url = urljoin(base_url, link_elem.get('href', ''))
        
        # Extract content preview
        content_elem = element.find(['p', 'div'], class_=re.compile(r'summary|excerpt|description'))
        content = content_elem.get_text(strip=True) if content_elem else ""
        
        # Extract author
        author_elem = element.find(['span', 'div'], class_=re.compile(r'author|byline'))
        author = author_elem.get_text(strip=True) if author_elem else None
        
        # Extract date
        date_elem = element.find(['time', 'span'], class_=re.compile(r'date|time'))
        published_at = self._parse_date(date_elem.get_text(strip=True) if date_elem else "")
        
        return {
            'source': 'elcomercio',
            'title': title,
            'content': content,
            'author': author,
            'published_at': published_at,
            'url': url,
            'category': 'politica',  # Default category
            'scraped_at': datetime.now()
        }
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date string to datetime"""
        if not date_str:
            return None
        
        # Common Spanish date patterns
        patterns = [
            r'(\d{1,2})/(\d{1,2})/(\d{4})',  # DD/MM/YYYY
            r'(\d{1,2})-(\d{1,2})-(\d{4})',  # DD-MM-YYYY
            r'(\d{4})-(\d{1,2})-(\d{1,2})',  # YYYY-MM-DD
        ]
        
        for pattern in patterns:
            match = re.search(pattern, date_str)
            if match:
                try:
                    if pattern.startswith(r'(\d{4})'):  # YYYY-MM-DD
                        year, month, day = match.groups()
                    else:  # DD/MM/YYYY or DD-MM-YYYY
                        day, month, year = match.groups()
                    
                    return datetime(int(year), int(month), int(day))
                except ValueError:
                    continue
        
        return None
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if article already exists"""
        existing = db.query(model_class).filter(
            model_class.url == item_data['url']
        ).first()
        return existing is not None

class RPPScraper(BaseScraper):
    """Scraper for RPP Noticias"""
    
    def __init__(self):
        super().__init__()
        self.base_url = "https://rpp.pe"
        self.sections = [
            "/politica/",
            "/economia/",
            "/peru/"
        ]
    
    def scrape(self, db: Session) -> int:
        """Scrape RPP articles"""
        all_items = []
        
        for section in self.sections:
            section_url = f"{self.base_url}{section}"
            
            if not self._check_robots_txt(self.base_url, section):
                logger.warning(f"Skipping {section_url} due to robots.txt restrictions")
                continue
            
            response = self._make_request(section_url)
            if not response:
                continue
            
            items = self._parse_content(response)
            all_items.extend(items)
            
            logger.info(f"Scraped {len(items)} articles from {section}")
        
        return self._save_items(db, all_items, NewsArticle)
    
    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        """Parse RPP HTML content"""
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        
        # Find article elements (adjust selectors for RPP)
        article_elements = soup.find_all(['article', 'div'], class_=re.compile(r'story|noticia|card'))
        
        for element in article_elements[:20]:
            try:
                article_data = self._extract_article_data(element, response.url)
                if article_data:
                    articles.append(article_data)
            except Exception as e:
                logger.error(f"Error extracting RPP article data: {e}")
                continue
        
        return articles
    
    def _extract_article_data(self, element: BeautifulSoup, base_url: str) -> Optional[Dict[str, Any]]:
        """Extract RPP article data"""
        
        # Similar extraction logic as ElComercio but adapted for RPP structure
        title_elem = element.find(['h1', 'h2', 'h3'])
        if not title_elem:
            return None
        
        title = title_elem.get_text(strip=True)
        
        link_elem = title_elem.find('a') or element.find('a')
        if not link_elem:
            return None
        
        url = urljoin(base_url, link_elem.get('href', ''))
        
        # Extract content
        content_elem = element.find(['p', 'div'], class_=re.compile(r'resumen|excerpt'))
        content = content_elem.get_text(strip=True) if content_elem else ""
        
        return {
            'source': 'rpp',
            'title': title,
            'content': content,
            'author': None,
            'published_at': datetime.now(),  # RPP might need different date parsing
            'url': url,
            'category': 'politica',
            'scraped_at': datetime.now()
        }
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if RPP article already exists"""
        existing = db.query(model_class).filter(
            model_class.url == item_data['url']
        ).first()
        return existing is not None

class GestionScraper(BaseScraper):
    """Scraper for Gestión"""
    
    def __init__(self):
        super().__init__()
        self.base_url = "https://gestion.pe"
        self.sections = [
            "/politica/",
            "/economia/",
            "/peru/"
        ]
    
    def scrape(self, db: Session) -> int:
        """Scrape Gestión articles"""
        all_items = []
        
        for section in self.sections:
            section_url = f"{self.base_url}{section}"
            
            if not self._check_robots_txt(self.base_url, section):
                logger.warning(f"Skipping {section_url} due to robots.txt restrictions")
                continue
            
            response = self._make_request(section_url)
            if not response:
                continue
            
            items = self._parse_content(response)
            all_items.extend(items)
            
            logger.info(f"Scraped {len(items)} articles from {section}")
        
        return self._save_items(db, all_items, NewsArticle)
    
    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        """Parse Gestión HTML content"""
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        
        # Find article elements (adjust for Gestión structure)
        article_elements = soup.find_all(['article', 'div'], class_=re.compile(r'noticia|articulo|card'))
        
        for element in article_elements[:20]:
            try:
                article_data = self._extract_article_data(element, response.url)
                if article_data:
                    articles.append(article_data)
            except Exception as e:
                logger.error(f"Error extracting Gestión article data: {e}")
                continue
        
        return articles
    
    def _extract_article_data(self, element: BeautifulSoup, base_url: str) -> Optional[Dict[str, Any]]:
        """Extract Gestión article data"""
        
        title_elem = element.find(['h1', 'h2', 'h3'])
        if not title_elem:
            return None
        
        title = title_elem.get_text(strip=True)
        
        link_elem = title_elem.find('a') or element.find('a')
        if not link_elem:
            return None
        
        url = urljoin(base_url, link_elem.get('href', ''))
        
        # Extract content
        content_elem = element.find(['p', 'div'], class_=re.compile(r'bajada|resumen'))
        content = content_elem.get_text(strip=True) if content_elem else ""
        
        return {
            'source': 'gestion',
            'title': title,
            'content': content,
            'author': None,
            'published_at': datetime.now(),
            'url': url,
            'category': 'economia',  # Gestión focuses on economy
            'scraped_at': datetime.now()
        }
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if Gestión article already exists"""
        existing = db.query(model_class).filter(
            model_class.url == item_data['url']
        ).first()
        return existing is not None