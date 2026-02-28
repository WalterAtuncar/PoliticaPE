import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime
from urllib.parse import urljoin, urlparse
import re
import uuid

from app.scrapers.base import BaseScraper
from app.models import NewsArticle
from app.services.sentiment_analyzer import SentimentAnalyzer
from loguru import logger

sentiment_analyzer = SentimentAnalyzer()

SOURCE_TYPES = {
    'elcomercio': 'prensa',
    'rpp': 'prensa',
    'larepublica': 'prensa',
    'peru21': 'prensa',
    'gestion': 'prensa',
    'infobae': 'prensa',
    'andina': 'agencia',
    'canaln': 'tv',
    'americatv': 'tv',
    'panamericana': 'tv',
    'tvperu': 'tv',
    'exitosa': 'radio',
}

SOURCE_DISPLAY_NAMES = {
    'elcomercio': 'El Comercio',
    'rpp': 'RPP Noticias',
    'larepublica': 'La República',
    'peru21': 'Perú21',
    'gestion': 'Gestión',
    'infobae': 'Infobae Perú',
    'andina': 'Andina',
    'canaln': 'Canal N',
    'americatv': 'América TV',
    'panamericana': 'Panamericana TV',
    'tvperu': 'TV Perú',
    'exitosa': 'Exitosa',
}


def _clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'<[^>]+>', '', text)
    return text


def _is_valid_article_url(url: str, base_domain: str) -> bool:
    if not url or url.startswith('#') or url.startswith('javascript:'):
        return False
    parsed = urlparse(url)
    if parsed.hostname and base_domain not in parsed.hostname:
        return False
    path = parsed.path.lower()
    skip_patterns = [
        '/autor/', '/tag/', '/tags/', '/buscar/', '/search/',
        '/login', '/registro', '/contacto', '/about', '/quienes-somos',
        '/aviso-legal', '/politicas-de-privacidad', '/terminos',
        '/categoria/', '/seccion-', '/rss', '/feed',
        '.jpg', '.png', '.gif', '.pdf', '.mp3', '.mp4',
    ]
    for pattern in skip_patterns:
        if pattern in path:
            return False
    path_parts = [p for p in path.split('/') if p]
    if len(path_parts) < 2:
        return False
    return True


def _detect_category(url: str, title: str) -> str:
    text = (url + ' ' + title).lower()
    if any(w in text for w in ['politic', 'congreso', 'gobierno', 'elecciones', 'candidat']):
        return 'Política'
    if any(w in text for w in ['econom', 'finanza', 'presupuest', 'fiscal', 'inflacion']):
        return 'Economía'
    if any(w in text for w in ['judicial', 'fiscalia', 'corte', 'juez', 'investiga']):
        return 'Judiciales'
    if any(w in text for w in ['seguridad', 'policia', 'crimen', 'delincuencia']):
        return 'Seguridad'
    if any(w in text for w in ['region', 'provincial', 'municipal', 'local']):
        return 'Regiones'
    if any(w in text for w in ['social', 'salud', 'educacion', 'pobreza']):
        return 'Social'
    return 'Actualidad'


class PeruvianNewsScraper(BaseScraper):
    source_key: str = ''
    base_url: str = ''
    sections: List[str] = []

    def scrape(self, db: Session) -> int:
        all_items = []
        seen_urls = set()

        existing_urls = set(
            row[0] for row in
            db.query(NewsArticle.url).filter(NewsArticle.source == SOURCE_DISPLAY_NAMES.get(self.source_key, self.source_key)).all()
        )

        for section in self.sections:
            section_url = f"{self.base_url}{section}"
            try:
                response = self._make_request(section_url)
                if not response:
                    continue
                items = self._parse_content(response)
                for item in items:
                    if item['url'] not in seen_urls and item['url'] not in existing_urls:
                        seen_urls.add(item['url'])
                        all_items.append(item)
                logger.info(f"[{self.source_key}] {len(items)} artículos de {section}")
            except Exception as e:
                logger.error(f"[{self.source_key}] Error en {section}: {e}")
                continue

        return self._save_articles(db, all_items)

    def _save_articles(self, db: Session, items: List[Dict[str, Any]]) -> int:
        saved = 0
        for item in items:
            try:
                score = sentiment_analyzer.analyze(item.get('title', '') + ' ' + item.get('content', ''))
                article = NewsArticle(
                    id=str(uuid.uuid4()),
                    source=item['source'],
                    title=item['title'][:500],
                    content=item.get('content', '')[:5000] if item.get('content') else None,
                    author=item.get('author'),
                    published_at=item.get('published_at') or datetime.now(),
                    scraped_at=datetime.now(),
                    url=item['url'][:1000],
                    category=item.get('category', 'Actualidad'),
                    tags=item.get('tags'),
                    sentiment_score=score.get('compound', 0) if isinstance(score, dict) else (score if isinstance(score, (int, float)) else 0),
                    processed=True,
                )
                db.add(article)
                saved += 1
            except Exception as e:
                logger.error(f"[{self.source_key}] Error guardando artículo: {e}")
                continue
        try:
            db.commit()
            logger.info(f"[{self.source_key}] Guardados {saved} artículos nuevos")
        except Exception as e:
            logger.error(f"[{self.source_key}] Error en commit: {e}")
            db.rollback()
            saved = 0
        return saved

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        return []

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        return db.query(model_class).filter(model_class.url == item_data['url']).first() is not None

    def _extract_og_data(self, soup: BeautifulSoup) -> Dict[str, str]:
        data = {}
        for prop in ['og:title', 'og:description', 'og:url']:
            tag = soup.find('meta', property=prop)
            if tag and tag.get('content'):
                key = prop.split(':')[1]
                data[key] = tag['content']
        return data


class ElComercioScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'elcomercio'
        self.base_url = "https://elcomercio.pe"
        self.sections = ["/politica/", "/economia/", "/peru/"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for element in soup.find_all(['h2', 'h3']):
            link = element.find('a', href=True)
            if not link:
                continue
            url = urljoin(self.base_url, link['href'])
            if not _is_valid_article_url(url, 'elcomercio.pe') or url in seen:
                continue
            seen.add(url)
            title = _clean_text(link.get_text())
            if not title or len(title) < 15:
                continue
            parent = element.find_parent(['article', 'div'])
            summary = ''
            if parent:
                p = parent.find('p')
                if p:
                    summary = _clean_text(p.get_text())

            articles.append({
                'source': 'El Comercio',
                'title': title,
                'content': summary,
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })
        return articles[:20]


class RPPScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'rpp'
        self.base_url = "https://rpp.pe"
        self.sections = ["/politica", "/economia", "/peru"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for article_el in soup.find_all('article'):
            link = article_el.find('a', href=True)
            if not link:
                continue
            url = urljoin(self.base_url, link['href'])
            if url in seen or not _is_valid_article_url(url, 'rpp.pe'):
                continue
            seen.add(url)
            headings = article_el.find_all(['h2', 'h3'])
            title = ''
            for h in headings:
                t = _clean_text(h.get_text())
                if len(t) > len(title):
                    title = t
            if not title or len(title) < 20:
                continue
            summary_el = article_el.find('p')
            summary = _clean_text(summary_el.get_text()) if summary_el else ''
            articles.append({
                'source': 'RPP Noticias',
                'title': title,
                'content': summary,
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })

        if len(articles) < 5:
            for heading in soup.find_all(['h2', 'h3']):
                title = _clean_text(heading.get_text())
                if not title or len(title) < 20:
                    continue
                parent_link = heading.find_parent('a', href=True)
                child_link = heading.find('a', href=True)
                link = parent_link or child_link
                if not link:
                    continue
                url = urljoin(self.base_url, link['href'])
                if url in seen or not _is_valid_article_url(url, 'rpp.pe'):
                    continue
                seen.add(url)
                articles.append({
                    'source': 'RPP Noticias',
                    'title': title,
                    'content': '',
                    'url': url,
                    'category': _detect_category(url, title),
                    'published_at': datetime.now(),
                })
        return articles[:25]


class LaRepublicaScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'larepublica'
        self.base_url = "https://larepublica.pe"
        self.sections = ["/politica", "/economia", "/sociedad"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for heading in soup.find_all(['h2', 'h3']):
            link = heading.find('a', href=True)
            if not link:
                continue
            url = link['href']
            if not url.startswith('http'):
                url = urljoin(self.base_url, url)
            if url in seen or 'youtube.com' in url or 'playlist' in url:
                continue
            if not _is_valid_article_url(url, 'larepublica.pe'):
                continue
            seen.add(url)
            title = _clean_text(link.get_text())
            if not title or len(title) < 15:
                continue
            articles.append({
                'source': 'La República',
                'title': title,
                'content': '',
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })
        return articles[:20]


class Peru21Scraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'peru21'
        self.base_url = "https://peru21.pe"
        self.sections = ["/politica/", "/economia/", "/peru/"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for heading in soup.find_all(['h2', 'h3']):
            link = heading.find('a', href=True)
            if not link:
                continue
            url = urljoin(self.base_url, link['href'])
            if url in seen or not _is_valid_article_url(url, 'peru21.pe'):
                continue
            seen.add(url)
            title = _clean_text(link.get_text())
            if not title or len(title) < 15:
                continue
            articles.append({
                'source': 'Perú21',
                'title': title,
                'content': '',
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })
        return articles[:20]


class GestionScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'gestion'
        self.base_url = "https://gestion.pe"
        self.sections = ["/peru/politica/", "/economia/", "/peru/"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for heading in soup.find_all(['h2', 'h3']):
            link = heading.find('a', href=True)
            if not link:
                continue
            url = urljoin(self.base_url, link['href'])
            if url in seen or not _is_valid_article_url(url, 'gestion.pe'):
                continue
            seen.add(url)
            title = _clean_text(link.get_text())
            if not title or len(title) < 15:
                continue
            articles.append({
                'source': 'Gestión',
                'title': title,
                'content': '',
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })
        return articles[:20]


class InfobaeScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'infobae'
        self.base_url = "https://www.infobae.com"
        self.sections = ["/peru/"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for link in soup.find_all('a', href=True):
            href = link['href']
            if not href.startswith('/peru/') or '/deportes/' in href:
                continue
            url = urljoin(self.base_url, href)
            if url in seen:
                continue
            path_parts = [p for p in urlparse(url).path.split('/') if p]
            if len(path_parts) < 3:
                continue
            seen.add(url)
            heading = link.find(class_=re.compile(r'headline|hl'))
            title = _clean_text(heading.get_text()) if heading else _clean_text(link.get_text())
            if not title or len(title) < 20:
                continue
            deck = link.find(class_=re.compile(r'deck'))
            summary = _clean_text(deck.get_text()) if deck else ''
            articles.append({
                'source': 'Infobae Perú',
                'title': title,
                'content': summary,
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })
        return articles[:20]


class AndinaScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'andina'
        self.base_url = "https://andina.pe"
        self.sections = ["/agencia/seccion-politica-1.aspx", "/agencia/seccion-economia-2.aspx"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for link in soup.find_all('a', href=True):
            href = link['href']
            if '/agencia/noticia' not in href and '/agencia/seccion' in href:
                continue
            if '/agencia/noticia' not in href:
                continue
            url = urljoin(self.base_url, href)
            if url in seen:
                continue
            seen.add(url)
            title = _clean_text(link.get_text())
            if not title or len(title) < 15:
                continue
            articles.append({
                'source': 'Andina',
                'title': title,
                'content': '',
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })
        return articles[:20]


class CanalNScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'canaln'
        self.base_url = "https://canaln.pe"
        self.sections = ["/actualidad", "/politica"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for element in soup.find_all(['article', 'div'], class_=re.compile(r'nota|card|article|item')):
            link = element.find('a', href=True)
            if not link:
                continue
            url = urljoin(self.base_url, link['href'])
            if url in seen or not _is_valid_article_url(url, 'canaln.pe'):
                continue
            seen.add(url)
            heading = element.find(['h2', 'h3', 'h4'])
            title = _clean_text(heading.get_text()) if heading else ''
            if not title:
                title = _clean_text(link.get_text())
            if not title or len(title) < 10:
                continue
            summary_el = element.find('p')
            summary = _clean_text(summary_el.get_text()) if summary_el else ''
            articles.append({
                'source': 'Canal N',
                'title': title,
                'content': summary,
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })

        if len(articles) < 3:
            for heading in soup.find_all(['h2', 'h3']):
                link = heading.find('a', href=True)
                if not link:
                    continue
                url = urljoin(self.base_url, link['href'])
                if url in seen or not _is_valid_article_url(url, 'canaln.pe'):
                    continue
                seen.add(url)
                title = _clean_text(link.get_text())
                if not title or len(title) < 10:
                    continue
                articles.append({
                    'source': 'Canal N',
                    'title': title,
                    'content': '',
                    'url': url,
                    'category': _detect_category(url, title),
                    'published_at': datetime.now(),
                })
        return articles[:20]


class AmericaTVScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'americatv'
        self.base_url = "https://www.americatv.com.pe"
        self.sections = ["/noticias/actualidad", "/noticias/internacionales"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen_urls = set()
        url_titles: Dict[str, str] = {}

        for link in soup.find_all('a', href=True):
            href = link['href']
            if not re.search(r'-n\d+', href):
                continue
            url = urljoin(self.base_url, href)
            if '/noticias/' not in url:
                continue
            url = re.sub(r'[?#].*$', '', url)
            if url in seen_urls:
                text = _clean_text(link.get_text())
                if text and len(text) > len(url_titles.get(url, '')):
                    url_titles[url] = text
                continue
            seen_urls.add(url)
            heading = link.find(['h2', 'h3', 'h4'])
            title = _clean_text(heading.get_text()) if heading else _clean_text(link.get_text())
            url_titles[url] = title or ''

        for heading in soup.find_all(['h2', 'h3']):
            parent_link = heading.find_parent('a', href=True)
            child_link = heading.find('a', href=True)
            link = parent_link or child_link
            if not link:
                continue
            href = link['href']
            if not re.search(r'-n\d+', href):
                continue
            url = urljoin(self.base_url, href)
            url = re.sub(r'[?#].*$', '', url)
            title = _clean_text(heading.get_text())
            if title and len(title) > len(url_titles.get(url, '')):
                url_titles[url] = title
                seen_urls.add(url)

        for url, title in url_titles.items():
            if not title or len(title) < 15:
                continue
            articles.append({
                'source': 'América TV',
                'title': title,
                'content': '',
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })
        return articles[:25]


class PanamericanaScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'panamericana'
        self.base_url = "https://panamericana.pe"
        self.sections = ["/politica", "/nacionales"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for heading in soup.find_all(['h2', 'h3', 'h4']):
            link = heading.find('a', href=True)
            if not link:
                parent = heading.find_parent('a', href=True)
                if parent:
                    link = parent
                else:
                    continue
            url = urljoin(self.base_url, link['href'])
            if url in seen or not _is_valid_article_url(url, 'panamericana.pe'):
                continue
            seen.add(url)
            title = _clean_text(heading.get_text())
            if not title or len(title) < 10:
                continue
            articles.append({
                'source': 'Panamericana TV',
                'title': title,
                'content': '',
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })
        return articles[:20]


class TVPeruScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'tvperu'
        self.base_url = "https://www.tvperu.gob.pe"
        self.sections = ["/noticias", "/noticias/politica"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for element in soup.find_all(['article', 'div'], class_=re.compile(r'view|node|card|nota|article')):
            link = element.find('a', href=True)
            if not link:
                continue
            url = urljoin(self.base_url, link['href'])
            if url in seen or not _is_valid_article_url(url, 'tvperu.gob.pe'):
                continue
            seen.add(url)
            heading = element.find(['h2', 'h3', 'h4'])
            title = _clean_text(heading.get_text()) if heading else _clean_text(link.get_text())
            if not title or len(title) < 10:
                continue
            articles.append({
                'source': 'TV Perú',
                'title': title,
                'content': '',
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })

        if len(articles) < 3:
            for heading in soup.find_all(['h2', 'h3']):
                link = heading.find('a', href=True)
                if not link:
                    continue
                url = urljoin(self.base_url, link['href'])
                if url in seen or not _is_valid_article_url(url, 'tvperu.gob.pe'):
                    continue
                seen.add(url)
                title = _clean_text(link.get_text())
                if not title or len(title) < 10:
                    continue
                articles.append({
                    'source': 'TV Perú',
                    'title': title,
                    'content': '',
                    'url': url,
                    'category': _detect_category(url, title),
                    'published_at': datetime.now(),
                })
        return articles[:20]


class ExitosaScraper(PeruvianNewsScraper):
    def __init__(self):
        super().__init__()
        self.source_key = 'exitosa'
        self.base_url = "https://www.exitosanoticias.pe"
        self.sections = ["/politica/", "/actualidad/"]

    def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        seen = set()

        for heading in soup.find_all(['h2', 'h3']):
            link = heading.find('a', href=True)
            if not link:
                continue
            url = urljoin(self.base_url, link['href'])
            if url in seen or not _is_valid_article_url(url, 'exitosanoticias.pe'):
                continue
            seen.add(url)
            title = _clean_text(link.get_text())
            if not title or len(title) < 10:
                continue
            articles.append({
                'source': 'Exitosa',
                'title': title,
                'content': '',
                'url': url,
                'category': _detect_category(url, title),
                'published_at': datetime.now(),
            })
        return articles[:20]


ALL_NEWS_SCRAPERS = {
    'elcomercio': ElComercioScraper,
    'rpp': RPPScraper,
    'larepublica': LaRepublicaScraper,
    'peru21': Peru21Scraper,
    'gestion': GestionScraper,
    'infobae': InfobaeScraper,
    'andina': AndinaScraper,
    'canaln': CanalNScraper,
    'americatv': AmericaTVScraper,
    'panamericana': PanamericanaScraper,
    'tvperu': TVPeruScraper,
    'exitosa': ExitosaScraper,
}


def run_news_scraping(db: Session, sources: Optional[List[str]] = None) -> Dict[str, int]:
    results = {}
    target_sources = sources or list(ALL_NEWS_SCRAPERS.keys())

    for source_key in target_sources:
        scraper_class = ALL_NEWS_SCRAPERS.get(source_key)
        if not scraper_class:
            logger.warning(f"Scraper no encontrado para: {source_key}")
            continue
        try:
            scraper = scraper_class()
            count = scraper.scrape(db)
            results[source_key] = count
            scraper.close()
            logger.info(f"[{source_key}] Completado: {count} artículos nuevos")
        except Exception as e:
            logger.error(f"[{source_key}] Error: {e}")
            results[source_key] = 0
    return results
