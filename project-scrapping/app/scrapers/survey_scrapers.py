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


class WikipediaPollScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.url = "https://es.wikipedia.org/wiki/Elecciones_generales_de_Per%C3%BA_de_2026"

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        return self._extract_poll_tables(response)

    def scrape(self, db: Session) -> int:
        response = self._make_request(self.url)
        if not response:
            logger.error("Wikipedia: no se pudo acceder a la página")
            return 0

        all_items = []

        poll_items = self._extract_poll_tables(response)
        all_items.extend(poll_items)
        logger.info(f"Wikipedia: {len(poll_items)} encuestas extraídas de tablas")

        return self._save_items(db, all_items, ScrapedSurvey)

    def _extract_poll_tables(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []

        tables = soup.find_all('table', class_='wikitable')

        for table in tables:
            rows = table.find_all('tr')
            if len(rows) < 3:
                continue

            header_row = rows[0]
            header_cells = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]

            if not any(kw in ' '.join(header_cells).lower() for kw in ['encuestadora', 'muestra', 'fecha']):
                continue

            candidate_row = rows[1] if len(rows) > 1 else None
            candidate_names = []
            if candidate_row:
                candidate_names = [td.get_text(strip=True) for td in candidate_row.find_all(['td', 'th'])]
                has_names = any(re.search(r'[A-ZÁÉÍÓÚ][a-záéíóú]', c) for c in candidate_names if c)
                if not has_names:
                    candidate_names = []

            data_start = 2 if candidate_names else 1

            for row in rows[data_start:]:
                cells = [td.get_text(strip=True) for td in row.find_all(['td', 'th'])]
                if len(cells) < 4:
                    continue

                item = self._parse_poll_row(cells, header_cells, candidate_names)
                if item:
                    items.append(item)

        return items

    def _parse_poll_row(self, cells: List[str], headers: List[str], candidates: List[str]) -> Optional[Dict[str, Any]]:
        pollster = cells[0] if len(cells) > 0 else ''
        date_str = cells[1] if len(cells) > 1 else ''
        sample_str = cells[2] if len(cells) > 2 else ''

        pollster = re.sub(r'\[.*?\]', '', pollster).replace('\u200b', '').strip()
        if not pollster or len(pollster) < 2:
            return None

        sample_size = None
        sample_clean = re.sub(r'[^\d]', '', sample_str)
        if sample_clean and len(sample_clean) >= 3:
            try:
                sample_size = int(sample_clean)
            except ValueError:
                pass

        results = {}
        percentages = []

        data_cells = cells[3:]
        for i, val in enumerate(data_cells):
            val_clean = val.replace(',', '.').replace('―', '').replace('–', '').replace('-', '').strip()
            try:
                num = float(val_clean)
                candidate_name = candidates[i] if i < len(candidates) else f"Opción {i+1}"
                candidate_name = re.sub(r'\[.*?\]', '', candidate_name).replace('\u200b', '').strip()

                if candidate_name and num > 0:
                    percentages.append({"candidato": candidate_name, "porcentaje": num})
            except (ValueError, IndexError):
                continue

        if not percentages:
            return None

        exclude_names = {'b/v', 'ns/no', 'dif.', 'dif', 'ns', 'no', 'blanco', 'viciado', 'nr', 'ns/nc'}
        percentages = [p for p in percentages if p['candidato'].lower() not in exclude_names and not p['candidato'].startswith('Opción')]

        top_candidates = sorted(percentages, key=lambda x: x['porcentaje'], reverse=True)

        results = {
            "tipo": "Intención de voto presidencial",
            "candidatos": top_candidates,
            "total_candidatos": len(top_candidates),
            "lider": top_candidates[0]["candidato"] if top_candidates else None,
            "lider_porcentaje": top_candidates[0]["porcentaje"] if top_candidates else None,
        }

        if len(top_candidates) >= 2:
            results["diferencia_1_2"] = round(top_candidates[0]["porcentaje"] - top_candidates[1]["porcentaje"], 1)
            results["segundo"] = top_candidates[1]["candidato"]
            results["segundo_porcentaje"] = top_candidates[1]["porcentaje"]

        if len(top_candidates) >= 3:
            results["tercero"] = top_candidates[2]["candidato"]
            results["tercero_porcentaje"] = top_candidates[2]["porcentaje"]

        published_at = self._parse_wiki_date(date_str)

        source_parts = pollster.split('/')
        pollster_name = source_parts[0].strip()
        medio = source_parts[1].strip() if len(source_parts) > 1 else ''

        title = f"Intención de voto: {top_candidates[0]['candidato']} lidera con {top_candidates[0]['porcentaje']}%"
        if len(top_candidates) >= 2:
            title += f" vs {top_candidates[1]['candidato']} {top_candidates[1]['porcentaje']}%"

        return {
            'id': str(uuid.uuid4()),
            'source': pollster_name,
            'title': title[:500],
            'methodology': f"Encuesta de opinión pública{' - ' + medio if medio else ''}",
            'sample_size': sample_size,
            'margin_error': self._estimate_margin(sample_size),
            'field_dates': date_str,
            'results': results,
            'published_at': published_at or datetime.now(),
            'url': self.url,
            'pollster': pollster,
            'processed': False
        }

    def _estimate_margin(self, sample_size: Optional[int]) -> Optional[float]:
        if not sample_size or sample_size < 100:
            return None
        import math
        return round(1.96 * math.sqrt(0.25 / sample_size) * 100, 1)

    def _parse_wiki_date(self, date_str: str) -> Optional[datetime]:
        if not date_str:
            return None

        date_str = date_str.strip()

        meses = {
            'ene': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'may': 5, 'jun': 6,
            'jul': 7, 'ago': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dic': 12,
            'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5,
            'junio': 6, 'julio': 7, 'agosto': 8, 'septiembre': 9,
            'octubre': 10, 'noviembre': 11, 'diciembre': 12
        }

        match = re.search(r'(\d{1,2})\s*(?:de\s+)?(\w+)\s*(?:de\s+)?(\d{4})', date_str)
        if match:
            day = int(match.group(1))
            month_str = match.group(2).lower()[:3]
            year = int(match.group(3))
            month = meses.get(month_str)
            if month:
                try:
                    return datetime(year, month, day)
                except ValueError:
                    pass

        match = re.search(r'(\d{1,2})/(\d{1,2})/(\d{4})', date_str)
        if match:
            try:
                return datetime(int(match.group(3)), int(match.group(2)), int(match.group(1)))
            except ValueError:
                pass

        match = re.search(r'(\d{1,2})[-–].*?(\d{1,2})/(\d{1,2})/(\d{4})', date_str)
        if match:
            try:
                return datetime(int(match.group(4)), int(match.group(3)), int(match.group(2)))
            except ValueError:
                pass

        match = re.search(r'(\w+)\s+(\d{4})', date_str)
        if match:
            month_str = match.group(1).lower()[:3]
            year = int(match.group(2))
            month = meses.get(month_str)
            if month:
                try:
                    return datetime(year, month, 15)
                except ValueError:
                    pass

        return None

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.source == item_data['source'],
            model_class.field_dates == item_data.get('field_dates')
        ).first()
        return existing is not None


class IEPScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.api_url = "https://estudiosdeopinion.iep.org.pe/wp-json/wp/v2/posts"
        self.base_url = "https://estudiosdeopinion.iep.org.pe"

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        return []

    def scrape(self, db: Session) -> int:
        all_items = []

        try:
            response = requests.get(
                self.api_url,
                params={'per_page': 20},
                headers={'User-Agent': 'Mozilla/5.0'},
                timeout=15
            )
            if response.status_code == 200:
                posts = response.json()
                for post in posts:
                    item = self._parse_wp_post(post)
                    if item:
                        all_items.append(item)
                logger.info(f"IEP API: {len(all_items)} informes extraídos")
        except Exception as e:
            logger.error(f"IEP API error: {e}")

        return self._save_items(db, all_items, ScrapedSurvey)

    def _parse_wp_post(self, post: Dict) -> Optional[Dict[str, Any]]:
        title = post.get('title', {}).get('rendered', '')
        content_html = post.get('content', {}).get('rendered', '')
        link = post.get('link', '')
        date_str = post.get('date', '')

        if not title or not content_html:
            return None

        soup = BeautifulSoup(content_html, 'html.parser')
        text = soup.get_text()

        if len(text) < 50:
            return None

        results = self._extract_analysis_data(text, title)

        if not results.get('datos_encontrados'):
            return None

        published_at = None
        if date_str:
            try:
                published_at = datetime.fromisoformat(date_str.replace('Z', '+00:00')).replace(tzinfo=None)
            except (ValueError, TypeError):
                published_at = datetime.now()

        return {
            'id': str(uuid.uuid4()),
            'source': 'IEP',
            'title': title[:500],
            'methodology': 'Encuesta telefónica a celulares a nivel nacional',
            'sample_size': results.get('muestra'),
            'margin_error': results.get('margen_error'),
            'field_dates': None,
            'results': results,
            'published_at': published_at,
            'url': link,
            'pollster': 'Instituto de Estudios Peruanos (IEP)',
            'processed': False
        }

    def _extract_analysis_data(self, text: str, title: str) -> Dict[str, Any]:
        results = {
            "tipo": "Informe de opinión",
            "resumen": text[:400].strip(),
            "datos_encontrados": False,
        }

        pct_matches = re.findall(r'(\d{1,3}(?:[.,]\d+)?)\s*%', text)
        if pct_matches:
            results["porcentajes_mencionados"] = [float(p.replace(',', '.')) for p in pct_matches[:15]]
            results["datos_encontrados"] = True

        approval = re.findall(r'(?:aprob\w+|aprueba\w*)\s*[\w\s]*?(\d{1,3}(?:[.,]\d+)?)\s*%', text, re.I)
        if approval:
            results["aprobacion"] = [float(a.replace(',', '.')) for a in approval[:5]]
            results["datos_encontrados"] = True

        disapproval = re.findall(r'(?:desaprob\w+|desaprueba\w*)\s*[\w\s]*?(\d{1,3}(?:[.,]\d+)?)\s*%', text, re.I)
        if disapproval:
            results["desaprobacion"] = [float(d.replace(',', '.')) for d in disapproval[:5]]
            results["datos_encontrados"] = True

        sentences = re.split(r'[.!?]\s+', text)
        key_findings = []
        for sentence in sentences:
            if re.search(r'\d+\s*%', sentence) and len(sentence) > 30 and len(sentence) < 300:
                clean = sentence.strip()
                if any(kw in clean.lower() for kw in ['aprob', 'desaprob', 'confianza', 'intención',
                    'elección', 'candidato', 'voto', 'ciudadan', 'peruano', 'presidente',
                    'congreso', 'gobierno', 'vacancia', 'partido']):
                    key_findings.append(clean)

        if key_findings:
            results["hallazgos_clave"] = key_findings[:8]
            results["datos_encontrados"] = True

        sample = re.search(r'(\d{3,5})\s*(?:personas|encuestados|entrevistados|casos)', text, re.I)
        if sample:
            results["muestra"] = int(sample.group(1))

        margin = re.search(r'(?:margen|error)\s*(?:de\s+)?(?:error\s+)?[+-±]?\s*(\d+(?:[.,]\d+)?)\s*%', text, re.I)
        if margin:
            results["margen_error"] = float(margin.group(1).replace(',', '.'))

        return results

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
            'results': {"raw_text": title, "tipo": "Artículo Ipsos Perú"},
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
                items = self._parse_content(response, url)
                all_items.extend(items)
                logger.info(f"Datum ({path}): {len(items)} items")

        return self._save_items(db, all_items, ScrapedSurvey)

    def _parse_content(self, response: requests.Response, page_url: str) -> List[Dict[str, Any]]:
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
                    'results': {"raw_text": title, "tipo": "Publicación Datum"},
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
                    'results': {"raw_text": title, "tipo": "Publicación CPI"},
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
