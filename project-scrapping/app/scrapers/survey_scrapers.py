import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from urllib.parse import urljoin
import json
import re
import uuid

from app.scrapers.base import BaseScraper
from app.models import ScrapedSurvey
from loguru import logger


class IEPScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.base_url = "https://iep.org.pe"
        self.sections = [
            "/noticias/",
            "/publicaciones/",
        ]

    def scrape(self, db: Session) -> int:
        all_items = []

        for section in self.sections:
            section_url = f"{self.base_url}{section}"
            response = self._make_request(section_url)
            if not response:
                continue

            items = self._parse_content(response)
            all_items.extend(items)
            logger.info(f"IEP: {len(items)} items de {section}")

        return self._save_items(db, all_items, ScrapedSurvey)

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []

        articles = soup.find_all(['article', 'div'], class_=re.compile(
            r'post|entry|publicacion|noticia|item|card', re.I
        ))

        if not articles:
            articles = soup.find_all('a', href=re.compile(r'encuesta|opinion|aprobacion|sondeo', re.I))

        for element in articles:
            try:
                item = self._extract_survey_item(element, response.url, 'IEP')
                if item:
                    items.append(item)
            except Exception as e:
                logger.debug(f"Error extrayendo item IEP: {e}")
                continue

        return items

    def _extract_survey_item(self, element, base_url: str, source: str) -> Optional[Dict[str, Any]]:
        title_elem = element.find(['h1', 'h2', 'h3', 'h4', 'a'])
        if not title_elem:
            return None

        title = title_elem.get_text(strip=True)
        if not title or len(title) < 10:
            return None

        survey_keywords = ['encuesta', 'sondeo', 'aprobación', 'opinión', 'percepción',
                          'intención de voto', 'aprobacion', 'opinion', 'barometro',
                          'estudio', 'indicador', 'confianza', 'preferencia']
        title_lower = title.lower()
        if not any(kw in title_lower for kw in survey_keywords):
            return None

        link_elem = element.find('a', href=True) if element.name != 'a' else element
        url = urljoin(base_url, link_elem.get('href', '')) if link_elem else base_url

        date_elem = element.find(['time', 'span', 'div'], class_=re.compile(r'date|fecha|time', re.I))
        published_at = self._parse_date(date_elem.get_text(strip=True) if date_elem else "")

        content_elem = element.find(['p', 'div'], class_=re.compile(r'excerpt|resumen|content|desc', re.I))
        summary = content_elem.get_text(strip=True) if content_elem else ""

        results = self._extract_poll_numbers(title + " " + summary)

        return {
            'id': str(uuid.uuid4()),
            'source': source,
            'title': title[:500],
            'methodology': 'Encuesta de opinión pública',
            'sample_size': results.get('sample_size'),
            'margin_error': results.get('margin_error'),
            'field_dates': None,
            'results': results,
            'published_at': published_at or datetime.now(),
            'url': url,
            'pollster': source,
            'processed': False
        }

    def _extract_poll_numbers(self, text: str) -> Dict[str, Any]:
        results = {"raw_text": text[:500]}

        pct_matches = re.findall(r'(\d{1,3}(?:[.,]\d+)?)\s*%', text)
        if pct_matches:
            results["percentages"] = [float(p.replace(',', '.')) for p in pct_matches[:10]]

        approval = re.search(r'aprob\w+\s*(?:del?\s+)?(\d{1,3}(?:[.,]\d+)?)\s*%', text, re.I)
        if approval:
            results["approval_rating"] = float(approval.group(1).replace(',', '.'))

        disapproval = re.search(r'desaprob\w+\s*(?:del?\s+)?(\d{1,3}(?:[.,]\d+)?)\s*%', text, re.I)
        if disapproval:
            results["disapproval_rating"] = float(disapproval.group(1).replace(',', '.'))

        sample = re.search(r'(\d{3,5})\s*(?:personas|encuestados|entrevistados)', text, re.I)
        if sample:
            results["sample_size"] = int(sample.group(1))

        margin = re.search(r'(?:margen|error)\s*(?:de\s+)?(?:error\s+)?(?:de\s+)?[+-±]?\s*(\d+(?:[.,]\d+)?)\s*%', text, re.I)
        if margin:
            results["margin_error"] = float(margin.group(1).replace(',', '.'))

        return results

    def _parse_date(self, date_str: str) -> Optional[datetime]:
        if not date_str:
            return None

        patterns = [
            (r'(\d{1,2})/(\d{1,2})/(\d{4})', 'dmy'),
            (r'(\d{1,2})-(\d{1,2})-(\d{4})', 'dmy'),
            (r'(\d{4})-(\d{1,2})-(\d{1,2})', 'ymd'),
        ]

        for pattern, fmt in patterns:
            match = re.search(pattern, date_str)
            if match:
                try:
                    groups = match.groups()
                    if fmt == 'ymd':
                        return datetime(int(groups[0]), int(groups[1]), int(groups[2]))
                    else:
                        return datetime(int(groups[2]), int(groups[1]), int(groups[0]))
                except (ValueError, IndexError):
                    continue

        return None

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.url == item_data['url']
        ).first()
        return existing is not None


class IpsosScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.base_url = "https://www.ipsos.com"
        self.search_url = "https://www.ipsos.com/es-pe"

    def scrape(self, db: Session) -> int:
        all_items = []

        response = self._make_request(self.search_url)
        if response:
            items = self._parse_content(response)
            all_items.extend(items)
            logger.info(f"Ipsos Perú: {len(items)} items encontrados")

        return self._save_items(db, all_items, ScrapedSurvey)

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []

        articles = soup.find_all(['article', 'div', 'li'], class_=re.compile(
            r'node|article|card|item|result|teaser', re.I
        ))

        for element in articles:
            try:
                item = self._extract_survey_item(element, response.url)
                if item:
                    items.append(item)
            except Exception as e:
                logger.debug(f"Error extrayendo item Ipsos: {e}")
                continue

        return items

    def _extract_survey_item(self, element, base_url: str) -> Optional[Dict[str, Any]]:
        title_elem = element.find(['h1', 'h2', 'h3', 'h4', 'a'])
        if not title_elem:
            return None

        title = title_elem.get_text(strip=True)
        if not title or len(title) < 10:
            return None

        peru_keywords = ['perú', 'peru', 'lima', 'aprobación', 'presidente',
                        'congreso', 'elecciones', 'municipales', 'peruanos']
        if not any(kw in title.lower() for kw in peru_keywords):
            return None

        link_elem = element.find('a', href=True) if element.name != 'a' else element
        url = urljoin(base_url, link_elem.get('href', '')) if link_elem else base_url

        return {
            'id': str(uuid.uuid4()),
            'source': 'Ipsos',
            'title': title[:500],
            'methodology': 'Encuesta de opinión pública',
            'sample_size': None,
            'margin_error': None,
            'field_dates': None,
            'results': {"raw_text": title},
            'published_at': datetime.now(),
            'url': url,
            'pollster': 'Ipsos Perú',
            'processed': False
        }

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.url == item_data['url']
        ).first()
        return existing is not None


class DatumScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.base_url = "https://www.datum.com.pe"

    def scrape(self, db: Session) -> int:
        all_items = []

        for path in ["/estudios", "/noticias", "/"]:
            url = f"{self.base_url}{path}"
            response = self._make_request(url)
            if response:
                items = self._parse_content(response)
                all_items.extend(items)
                logger.info(f"Datum ({path}): {len(items)} items")

        return self._save_items(db, all_items, ScrapedSurvey)

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []

        articles = soup.find_all(['article', 'div', 'a'], class_=re.compile(
            r'post|card|item|estudio|noticia|entry', re.I
        ))

        if not articles:
            links = soup.find_all('a', href=True)
            for link in links:
                text = link.get_text(strip=True)
                if len(text) > 15 and any(kw in text.lower() for kw in
                    ['encuesta', 'estudio', 'opinión', 'aprobación', 'sondeo']):
                    articles.append(link)

        for element in articles:
            try:
                title_elem = element.find(['h1', 'h2', 'h3', 'h4']) or element
                title = title_elem.get_text(strip=True)
                if not title or len(title) < 10:
                    continue

                link_elem = element.find('a', href=True) if element.name != 'a' else element
                url = urljoin(response.url, link_elem.get('href', '')) if link_elem else response.url

                items.append({
                    'id': str(uuid.uuid4()),
                    'source': 'Datum',
                    'title': title[:500],
                    'methodology': 'Encuesta de opinión pública',
                    'sample_size': None,
                    'margin_error': None,
                    'field_dates': None,
                    'results': {"raw_text": title},
                    'published_at': datetime.now(),
                    'url': url,
                    'pollster': 'Datum Internacional',
                    'processed': False
                })
            except Exception as e:
                logger.debug(f"Error extrayendo item Datum: {e}")
                continue

        return items

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.url == item_data['url']
        ).first()
        return existing is not None


class CPIScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.base_url = "https://www.cpi.pe"

    def scrape(self, db: Session) -> int:
        all_items = []

        for path in ["/estudios", "/market/", "/"]:
            url = f"{self.base_url}{path}"
            response = self._make_request(url)
            if response:
                items = self._parse_content(response)
                all_items.extend(items)
                logger.info(f"CPI ({path}): {len(items)} items")

        return self._save_items(db, all_items, ScrapedSurvey)

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []

        articles = soup.find_all(['article', 'div', 'a', 'li'], class_=re.compile(
            r'post|card|item|estudio|entry|download', re.I
        ))

        if not articles:
            links = soup.find_all('a', href=re.compile(r'\.pdf|estudio|encuesta|opinion', re.I))
            articles = links

        for element in articles:
            try:
                title_elem = element.find(['h1', 'h2', 'h3', 'h4']) or element
                title = title_elem.get_text(strip=True)
                if not title or len(title) < 10:
                    continue

                link_elem = element.find('a', href=True) if element.name != 'a' else element
                url = urljoin(response.url, link_elem.get('href', '')) if link_elem else response.url

                items.append({
                    'id': str(uuid.uuid4()),
                    'source': 'CPI',
                    'title': title[:500],
                    'methodology': 'Estudio de mercado / opinión pública',
                    'sample_size': None,
                    'margin_error': None,
                    'field_dates': None,
                    'results': {"raw_text": title},
                    'published_at': datetime.now(),
                    'url': url,
                    'pollster': 'CPI - Compañía Peruana de Investigación',
                    'processed': False
                })
            except Exception as e:
                logger.debug(f"Error extrayendo item CPI: {e}")
                continue

        return items

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.url == item_data['url']
        ).first()
        return existing is not None
