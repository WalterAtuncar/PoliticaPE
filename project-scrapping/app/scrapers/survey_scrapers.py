import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from urllib.parse import urljoin
import json
import os
import re
import unicodedata
import uuid

from app.scrapers.base import BaseScraper
from app.models import ScrapedSurvey
from loguru import logger



CANDIDATE_ALIASES = {
    "lopez aliaga": "Rafael López Aliaga", "rafael lopez aliaga": "Rafael López Aliaga",
    "bruce": "Carlos Bruce", "carlos bruce": "Carlos Bruce",
    "urresti": "Daniel Urresti", "daniel urresti": "Daniel Urresti",
    "allison": "Francis Allison", "francis allison": "Francis Allison",
    "paredes": "Susel Paredes", "susel paredes": "Susel Paredes",
    "daza": "Samuel Daza", "samuel daza": "Samuel Daza",
    "belmont": "Ricardo Belmont", "ricardo belmont": "Ricardo Belmont",
    "tejada": "Alberto Tejada", "alberto tejada": "Alberto Tejada",
    "riera": "Elio Riera", "elio riera": "Elio Riera",
    "oswaldo vargas": "Oswaldo Vargas",
    "yuri castro": "Yuri Castro",
    "elizabeth leon": "Elizabeth León",
    "yaya": "Mónica Yaya", "monica yaya": "Mónica Yaya",
    "de pomar": "Edgardo de Pomar", "edgardo de pomar": "Edgardo de Pomar",
    "valdez": "Segundo Valdez", "segundo valdez": "Segundo Valdez",
    "la cruz": "Victoria La Cruz", "victoria la cruz": "Victoria La Cruz",
    "caller": "Sandro Caller", "sandro caller": "Sandro Caller",
    "flor hurtado": "Flor Hurtado",
    "juan alvarado": "Juan Alvarado Mestanza", "alvarado mestanza": "Juan Alvarado Mestanza",
    "llanos": "Luis Llanos", "luis llanos": "Luis Llanos",
    "carlos gallardo": "Carlos Gallardo", "gallardo neyra": "Carlos Gallardo",
    "rubio": "Luis Rubio", "luis rubio": "Luis Rubio",
}

NON_CANDIDATE_COLUMNS = {"dif", "dif.", "ventaja", "otros", "otro", "otr", "otr.", "b/v", "blanco/viciado",
                         "blanco", "viciado", "ns/nr", "ns/no", "nsnr", "no precisa", "ninguno", "indecisos", "nr"}

MESES_ABR = {'ene': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'may': 5, 'jun': 6, 'jul': 7, 'ago': 8,
             'sep': 9, 'set': 9, 'oct': 10, 'nov': 11, 'dic': 12}


def _norm(s: str) -> str:
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode()
    s = re.sub(r'\[.*?\]', '', s).replace('​', '')
    s = re.sub(r'\s*/\s*', '/', s)
    return re.sub(r'\s+', ' ', s).strip().lower()


class WikipediaPollScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.url = os.getenv("WIKIPEDIA_POLLS_URL",
                             "https://es.wikipedia.org/wiki/Elecciones_municipales_de_Lima_de_2026")

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        return self._extract_poll_tables(response)

    def scrape(self, db: Session) -> int:
        response = self._make_request(
            self.url, headers={'User-Agent': 'PoliticaPE/1.0 (contacto: walter150976@gmail.com)'}
        )
        if not response:
            logger.error("Wikipedia: no se pudo acceder a la pagina de encuestas")
            return 0
        items = self._extract_poll_tables(response)
        logger.info(f"Wikipedia municipal Lima: {len(items)} filas de encuesta extraidas")
        return self._save_items(db, items, ScrapedSurvey)

    def _extract_poll_tables(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        items = []
        for table in soup.find_all('table', class_='wikitable'):
            rows = table.find_all('tr')
            if len(rows) < 2:
                continue
            header_cells = rows[0].find_all(['th', 'td'])
            headers = [_norm(c.get_text(" ", strip=True)) for c in header_cells]
            if not headers or 'encuestadora' not in headers[0]:
                continue
            columns = self._map_columns(header_cells)
            has_raw_cols = any(c['kind'] in ('blank', 'undecided') for c in columns)
            base = 'total' if has_raw_cols else 'validos'
            for row in rows[1:]:
                cells = [c.get_text(" ", strip=True) for c in row.find_all(['td', 'th'])]
                if len(cells) < 4:
                    continue
                if len(cells) != len(columns):
                    # Filas con rowspan (escenarios alternativos de la misma encuestadora):
                    # las columnas quedan corridas, guardarlas produciria datos falsos.
                    logger.debug(
                        f"Wikipedia: fila descartada por desalineacion "
                        f"({len(cells)} celdas vs {len(columns)} columnas): {cells[0][:40]}"
                    )
                    continue
                item = self._parse_poll_row(cells, columns, base)
                if item:
                    items.append(item)
        return items

    def _map_columns(self, header_cells) -> List[Dict[str, Any]]:
        columns = []
        for i, cell in enumerate(header_cells):
            raw = cell.get_text(" ", strip=True)
            link = cell.find('a')
            label = _norm(link.get_text(strip=True)) if link else _norm(raw)
            full = _norm(raw)
            if i == 0:
                columns.append({'kind': 'pollster', 'name': 'pollster'})
            elif i == 1:
                columns.append({'kind': 'date', 'name': 'date'})
            elif i == 2:
                columns.append({'kind': 'sample', 'name': 'sample'})
            elif full.startswith('dif') or 'ventaja' in full:
                columns.append({'kind': 'diff', 'name': 'diff'})
            elif any(k in full for k in ('ns/nr', 'ns/no', 'no precisa', 'indeciso')):
                columns.append({'kind': 'undecided', 'name': 'undecided'})
            elif any(k in full for k in ('blanco', 'viciado', 'b/v')):
                columns.append({'kind': 'blank', 'name': 'blank'})
            elif full in NON_CANDIDATE_COLUMNS or full.startswith('otr'):
                columns.append({'kind': 'other', 'name': 'otros'})
            else:
                name = self._canonical_candidate(label) or self._canonical_candidate(full)
                if name:
                    columns.append({'kind': 'candidate', 'name': name})
                else:
                    cleaned = re.sub(r'\[.*?\]', '', raw).strip()
                    columns.append({'kind': 'candidate', 'name': cleaned[:60] or f'Columna {i}'})
        return columns

    def _canonical_candidate(self, text: str) -> Optional[str]:
        t = _norm(text)
        if not t:
            return None
        if t in CANDIDATE_ALIASES:
            return CANDIDATE_ALIASES[t]
        for alias, canon in sorted(CANDIDATE_ALIASES.items(), key=lambda kv: -len(kv[0])):
            if re.search(r'\b' + re.escape(alias) + r'\b', t):
                return canon
        return None

    @staticmethod
    def _to_float(val: str) -> Optional[float]:
        v = (val or '').replace(',', '.').replace('%', '').strip()
        if v in ('', '-', '–', '—', '―'):
            return None
        v = re.sub(r'[^\d.]', '', v)
        if not v or v == '.':
            return None
        try:
            return float(v)
        except ValueError:
            return None

    def _parse_poll_row(self, cells: List[str], columns: List[Dict[str, Any]], base: str) -> Optional[Dict[str, Any]]:
        pollster_raw = re.sub(r'\[.*?\]', '', cells[0]).replace('​', '').strip()
        if len(pollster_raw) < 2:
            return None
        date_str = cells[1].strip()
        if not date_str:
            return None
        sample_clean = re.sub(r'[^\d]', '', cells[2])
        sample_size = int(sample_clean) if len(sample_clean) >= 2 else None

        candidates, undecided, blank, others, diff = [], None, None, None, None
        for i, col in enumerate(columns):
            if i >= len(cells) or i < 3:
                continue
            num = self._to_float(cells[i])
            if col['kind'] == 'candidate':
                candidates.append({'candidato': col['name'], 'porcentaje': num})
            elif col['kind'] == 'undecided':
                undecided = num
            elif col['kind'] == 'blank':
                blank = num
            elif col['kind'] == 'other':
                others = num
            elif col['kind'] == 'diff':
                diff = num

        ranked = sorted([c for c in candidates if c['porcentaje'] is not None],
                        key=lambda c: -c['porcentaje'])
        if not ranked:
            return None

        results = {
            'tipo': 'Intencion de voto municipal',
            'ambito': 'lima_metropolitana',
            'base': base,
            'candidatos': candidates,
            'ranking': ranked,
            'total_candidatos': len(ranked),
            'lider': ranked[0]['candidato'],
            'lider_porcentaje': ranked[0]['porcentaje'],
            'segundo': ranked[1]['candidato'] if len(ranked) > 1 else None,
            'segundo_porcentaje': ranked[1]['porcentaje'] if len(ranked) > 1 else None,
            'diferencia_1_2': round(ranked[0]['porcentaje'] - ranked[1]['porcentaje'], 1) if len(ranked) > 1 else diff,
            'indecisos': undecided,
            'blanco_viciado': blank,
            'otros': others,
        }

        published_at = self._parse_wiki_date(date_str)
        parts = [p.strip() for p in pollster_raw.split('/')]
        pollster_name, medio = parts[0], (parts[1] if len(parts) > 1 else '')
        base_label = 'validos' if base == 'validos' else 'total de encuestados'
        title = f"Lima 2026 ({base_label}): {ranked[0]['candidato']} {ranked[0]['porcentaje']}%"
        if len(ranked) > 1:
            title += f" vs {ranked[1]['candidato']} {ranked[1]['porcentaje']}%"

        return {
            'id': str(uuid.uuid4()),
            'source': pollster_name,
            'title': title[:500],
            'methodology': f"Encuesta de intencion de voto - base: {base_label}{' - ' + medio if medio else ''}",
            'sample_size': sample_size,
            'margin_error': self._estimate_margin(sample_size),
            'field_dates': date_str,
            'results': results,
            'published_at': published_at or datetime.now(),
            'url': self.url,
            'pollster': pollster_raw,
            'processed': False,
        }

    def _estimate_margin(self, sample_size: Optional[int]) -> Optional[float]:
        if not sample_size or sample_size < 100:
            return None
        import math
        return round(1.96 * math.sqrt(0.25 / sample_size) * 100, 1)

    def _parse_wiki_date(self, date_str: str) -> Optional[datetime]:
        """Devuelve la fecha FINAL del trabajo de campo. Acepta '13-15 ago 2026', '26 jul-2 ago 2026',
        '15 de agosto de 2026', 'agosto 2026'."""
        raw = (date_str or '').replace('–', '-').replace('—', '-').replace('―', '-')
        s = _norm(raw)
        m = re.search(r'(\d{1,2})\s*(?:de\s+)?([a-z]+)?\s*-\s*(\d{1,2})\s*(?:de\s+)?([a-z]+)\s*(?:de\s+)?(\d{4})', s)
        if m:
            mon = MESES_ABR.get(m.group(4)[:3])
            if mon:
                try:
                    return datetime(int(m.group(5)), mon, int(m.group(3)))
                except ValueError:
                    pass
        m = re.search(r'(\d{1,2})\s*(?:de\s+)?([a-z]+)\s*(?:de\s+)?(\d{4})', s)
        if m:
            mon = MESES_ABR.get(m.group(2)[:3])
            if mon:
                try:
                    return datetime(int(m.group(3)), mon, int(m.group(1)))
                except ValueError:
                    pass
        m = re.search(r'([a-z]+)\s+(\d{4})', s)
        if m and MESES_ABR.get(m.group(1)[:3]):
            return datetime(int(m.group(2)), MESES_ABR[m.group(1)[:3]], 15)
        return None

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        return db.query(model_class).filter(
            model_class.source == item_data['source'],
            model_class.field_dates == item_data.get('field_dates'),
            model_class.methodology == item_data.get('methodology'),
        ).first() is not None


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
