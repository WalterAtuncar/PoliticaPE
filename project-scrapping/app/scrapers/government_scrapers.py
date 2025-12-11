import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime
from urllib.parse import urljoin
import json
import re

from app.scrapers.base import BaseScraper
from app.models import GovernmentData
from loguru import logger

class ONPEScraper(BaseScraper):
    """Scraper for ONPE (Oficina Nacional de Procesos Electorales)"""
    
    def __init__(self):
        super().__init__()
        self.base_url = "https://www.onpe.gob.pe"
        self.sections = [
            "/modCompendio/",
            "/modOrganizacion/",
            "/modEducacion/"
        ]
    
    def scrape(self, db: Session) -> int:
        """Scrape ONPE data"""
        all_items = []
        
        # Scrape main sections
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
            
            logger.info(f"Scraped {len(items)} items from ONPE {section}")
        
        # Scrape electoral results if available
        electoral_items = self._scrape_electoral_results()
        all_items.extend(electoral_items)
        
        return self._save_items(db, all_items, GovernmentData)
    
    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        """Parse ONPE HTML content"""
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []
        
        # Find document/content elements
        content_elements = soup.find_all(['div', 'article'], class_=re.compile(r'documento|contenido|noticia'))
        
        for element in content_elements:
            try:
                item_data = self._extract_government_item(element, response.url, 'onpe')
                if item_data:
                    items.append(item_data)
            except Exception as e:
                logger.error(f"Error extracting ONPE item: {e}")
                continue
        
        return items
    
    def _scrape_electoral_results(self) -> List[Dict[str, Any]]:
        """Scrape electoral results and statistics"""
        results = []
        
        # This would contain specific logic for electoral data
        # For now, return empty list
        logger.info("Electoral results scraping not implemented yet")
        
        return results
    
    def _extract_government_item(self, element: BeautifulSoup, base_url: str, source: str) -> Optional[Dict[str, Any]]:
        """Extract government data item"""
        
        # Extract title
        title_elem = element.find(['h1', 'h2', 'h3', 'h4'])
        if not title_elem:
            return None
        
        title = title_elem.get_text(strip=True)
        
        # Extract URL
        link_elem = element.find('a')
        url = urljoin(base_url, link_elem.get('href', '')) if link_elem else base_url
        
        # Extract content
        content_elem = element.find(['p', 'div'], class_=re.compile(r'contenido|descripcion|resumen'))
        content_text = content_elem.get_text(strip=True) if content_elem else ""
        
        # Extract date
        date_elem = element.find(['span', 'time'], class_=re.compile(r'fecha|date'))
        published_at = self._parse_date(date_elem.get_text(strip=True) if date_elem else "")
        
        # Determine data type
        data_type = self._determine_data_type(title, content_text)
        
        return {
            'source': source,
            'data_type': data_type,
            'title': title,
            'content': {'text': content_text} if content_text else None,
            'published_at': published_at,
            'url': url,
            'department': 'ONPE',
            'metadata': {
                'extraction_method': 'web_scraping',
                'content_type': 'html'
            },
            'scraped_at': datetime.now()
        }
    
    def _determine_data_type(self, title: str, content: str) -> str:
        """Determine the type of government data"""
        title_lower = title.lower()
        content_lower = content.lower()
        
        if any(word in title_lower for word in ['elección', 'electoral', 'voto', 'candidato']):
            return 'electoral'
        elif any(word in title_lower for word in ['resolución', 'directiva', 'reglamento']):
            return 'normative'
        elif any(word in title_lower for word in ['comunicado', 'nota', 'prensa']):
            return 'communication'
        elif any(word in title_lower for word in ['estadística', 'reporte', 'informe']):
            return 'report'
        else:
            return 'general'
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date string to datetime"""
        if not date_str:
            return None
        
        # Spanish date patterns
        patterns = [
            r'(\d{1,2})/(\d{1,2})/(\d{4})',
            r'(\d{1,2})-(\d{1,2})-(\d{4})',
            r'(\d{4})-(\d{1,2})-(\d{1,2})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, date_str)
            if match:
                try:
                    if pattern.startswith(r'(\d{4})'):
                        year, month, day = match.groups()
                    else:
                        day, month, year = match.groups()
                    
                    return datetime(int(year), int(month), int(day))
                except ValueError:
                    continue
        
        return None
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if government item already exists"""
        existing = db.query(model_class).filter(
            model_class.url == item_data['url']
        ).first()
        return existing is not None

class INEIScraper(BaseScraper):
    """Scraper for INEI (Instituto Nacional de Estadística e Informática)"""
    
    def __init__(self):
        super().__init__()
        self.base_url = "https://www.inei.gob.pe"
        self.sections = [
            "/estadisticas/",
            "/prensa/",
            "/biblioteca-virtual/"
        ]
    
    def scrape(self, db: Session) -> int:
        """Scrape INEI data"""
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
            
            logger.info(f"Scraped {len(items)} items from INEI {section}")
        
        return self._save_items(db, all_items, GovernmentData)
    
    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        """Parse INEI HTML content"""
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []
        
        # Find statistical reports and publications
        content_elements = soup.find_all(['div', 'article'], class_=re.compile(r'publicacion|estadistica|reporte'))
        
        for element in content_elements:
            try:
                item_data = self._extract_government_item(element, response.url, 'inei')
                if item_data:
                    items.append(item_data)
            except Exception as e:
                logger.error(f"Error extracting INEI item: {e}")
                continue
        
        return items
    
    def _extract_government_item(self, element: BeautifulSoup, base_url: str, source: str) -> Optional[Dict[str, Any]]:
        """Extract INEI data item"""
        
        title_elem = element.find(['h1', 'h2', 'h3', 'h4'])
        if not title_elem:
            return None
        
        title = title_elem.get_text(strip=True)
        
        link_elem = element.find('a')
        url = urljoin(base_url, link_elem.get('href', '')) if link_elem else base_url
        
        # Extract statistical data if available
        data_elem = element.find(['table', 'div'], class_=re.compile(r'datos|cifras|estadisticas'))
        content = self._extract_statistical_data(data_elem) if data_elem else {'text': ''}
        
        return {
            'source': source,
            'data_type': 'statistical',
            'title': title,
            'content': content,
            'published_at': datetime.now(),  # INEI might need specific date parsing
            'url': url,
            'department': 'INEI',
            'metadata': {
                'extraction_method': 'web_scraping',
                'content_type': 'statistical_data'
            },
            'scraped_at': datetime.now()
        }
    
    def _extract_statistical_data(self, element: BeautifulSoup) -> Dict[str, Any]:
        """Extract statistical data from HTML element"""
        data = {'text': element.get_text(strip=True)}
        
        # Try to extract tables
        tables = element.find_all('table')
        if tables:
            table_data = []
            for table in tables:
                rows = []
                for row in table.find_all('tr'):
                    cells = [cell.get_text(strip=True) for cell in row.find_all(['td', 'th'])]
                    if cells:
                        rows.append(cells)
                if rows:
                    table_data.append(rows)
            
            if table_data:
                data['tables'] = table_data
        
        return data
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if INEI item already exists"""
        existing = db.query(model_class).filter(
            model_class.url == item_data['url']
        ).first()
        return existing is not None

class MEFScraper(BaseScraper):
    """Scraper for MEF (Ministerio de Economía y Finanzas)"""
    
    def __init__(self):
        super().__init__()
        self.base_url = "https://www.mef.gob.pe"
        self.sections = [
            "/es/noticias/",
            "/es/normatividad/",
            "/es/estadisticas/"
        ]
    
    def scrape(self, db: Session) -> int:
        """Scrape MEF data"""
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
            
            logger.info(f"Scraped {len(items)} items from MEF {section}")
        
        return self._save_items(db, all_items, GovernmentData)
    
    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        """Parse MEF HTML content"""
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []
        
        # Find economic reports and news
        content_elements = soup.find_all(['div', 'article'], class_=re.compile(r'noticia|documento|reporte'))
        
        for element in content_elements:
            try:
                item_data = self._extract_government_item(element, response.url, 'mef')
                if item_data:
                    items.append(item_data)
            except Exception as e:
                logger.error(f"Error extracting MEF item: {e}")
                continue
        
        return items
    
    def _extract_government_item(self, element: BeautifulSoup, base_url: str, source: str) -> Optional[Dict[str, Any]]:
        """Extract MEF data item"""
        
        title_elem = element.find(['h1', 'h2', 'h3', 'h4'])
        if not title_elem:
            return None
        
        title = title_elem.get_text(strip=True)
        
        link_elem = element.find('a')
        url = urljoin(base_url, link_elem.get('href', '')) if link_elem else base_url
        
        content_elem = element.find(['p', 'div'], class_=re.compile(r'contenido|resumen'))
        content_text = content_elem.get_text(strip=True) if content_elem else ""
        
        # Determine if it's economic data
        data_type = 'economic' if any(word in title.lower() for word in ['presupuesto', 'fiscal', 'económico', 'financiero']) else 'general'
        
        return {
            'source': source,
            'data_type': data_type,
            'title': title,
            'content': {'text': content_text} if content_text else None,
            'published_at': datetime.now(),
            'url': url,
            'department': 'MEF',
            'metadata': {
                'extraction_method': 'web_scraping',
                'content_type': 'economic_data'
            },
            'scraped_at': datetime.now()
        }
    
    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        """Check if MEF item already exists"""
        existing = db.query(model_class).filter(
            model_class.url == item_data['url']
        ).first()
        return existing is not None