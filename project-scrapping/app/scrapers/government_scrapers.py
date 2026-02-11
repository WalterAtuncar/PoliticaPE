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


class WikipediaGovScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.delay_range = (0.5, 1.5)

    def _parse_content(self, response) -> List[Dict[str, Any]]:
        return []

    def scrape(self, db: Session) -> int:
        all_items = []
        all_items.extend(self._scrape_cabinet())
        all_items.extend(self._scrape_economy())
        return self._save_items(db, all_items, GovernmentData)

    def _scrape_cabinet(self) -> List[Dict[str, Any]]:
        items = []
        try:
            response = self._make_request('https://es.wikipedia.org/wiki/Consejo_de_Ministros_del_Per%C3%BA')
            if not response:
                return items
            soup = BeautifulSoup(response.content, 'html.parser')
            tables = soup.find_all('table', class_='wikitable')
            if not tables:
                return items

            table = tables[0]
            rows = table.find_all('tr')
            ministros = []

            for row in rows[1:]:
                th = row.find('th')
                ministerio_link = th.find('a') if th else None
                ministerio_raw = ministerio_link.get('title', '') if ministerio_link else (th.get_text(strip=True) if th else '')
                ministerio = re.sub(r' del Perú$', '', ministerio_raw).strip()

                tds = row.find_all('td')
                if tds:
                    titular = tds[0].get_text(strip=True)
                    fecha = tds[1].get_text(strip=True) if len(tds) > 1 else ''
                else:
                    continue

                if titular and ministerio:
                    ministros.append({
                        'ministerio': ministerio,
                        'titular': titular,
                        'fecha_juramentacion': fecha,
                    })

            if ministros:
                items.append({
                    'source': 'Congreso',
                    'data_type': 'Gabinete',
                    'title': f'Consejo de Ministros del Perú ({len(ministros)} carteras)',
                    'content': {
                        'tipo': 'Gabinete Ministerial',
                        'total_ministerios': len(ministros),
                        'ministros': ministros,
                        'fecha_juramentacion': ministros[0]['fecha_juramentacion'] if ministros else '',
                        'premier': ministros[0]['titular'] if ministros else '',
                        'premier_cargo': ministros[0]['ministerio'] if ministros else '',
                    },
                    'published_at': datetime.now(),
                    'url': 'https://es.wikipedia.org/wiki/Consejo_de_Ministros_del_Per%C3%BA',
                    'department': 'Nacional',
                    'metadata': {'extraction_method': 'wikipedia_table'},
                    'scraped_at': datetime.now(),
                })
                logger.info(f"Wikipedia: {len(ministros)} ministros extraídos del gabinete")
        except Exception as e:
            logger.error(f"Error scraping cabinet: {e}")
        return items

    def _scrape_economy(self) -> List[Dict[str, Any]]:
        items = []
        try:
            response = self._make_request('https://es.wikipedia.org/wiki/Econom%C3%ADa_del_Per%C3%BA')
            if not response:
                return items
            soup = BeautifulSoup(response.content, 'html.parser')

            infobox = soup.find('table', class_='infobox')
            if not infobox:
                return items

            indicators = {}
            rows = infobox.find_all('tr')
            for row in rows:
                th = row.find('th')
                td = row.find('td')
                if th and td:
                    key = th.get_text(strip=True)
                    val = td.get_text(strip=True)
                    if key and val:
                        indicators[key] = val

            if indicators:
                key_indicators = {}
                indicator_mapping = {
                    'PIB(nominal)': 'pib_nominal',
                    'PIB(PPA)': 'pib_ppa',
                    'Variación del PIB': 'variacion_pib',
                    'PIB per cápita(nominal)': 'pib_per_capita',
                    'Inflación (IPC)': 'inflacion',
                    'IDH': 'idh',
                    'Población': 'poblacion',
                    'Coef. de Gini': 'gini',
                    'Moneda': 'moneda',
                    'Deuda externa': 'deuda_externa',
                    'Deuda pública': 'deuda_publica',
                    'Ingresos': 'ingresos',
                    'Gasto público': 'gasto_publico',
                    'Reservas internacionales': 'reservas',
                    'Tasa de desempleo': 'desempleo',
                    'Salario mínimo': 'salario_minimo',
                }
                for wiki_key, mapped_key in indicator_mapping.items():
                    for k, v in indicators.items():
                        if wiki_key.lower() in k.lower():
                            key_indicators[mapped_key] = v
                            break

                pib_nums = []
                for k, v in indicators.items():
                    matches = re.findall(r'[\d,.]+', v.replace('\xa0', ' '))
                    if 'PIB' in k and matches:
                        pib_nums.extend(matches[:2])

                items.append({
                    'source': 'INEI',
                    'data_type': 'Indicador',
                    'title': f'Indicadores Económicos del Perú ({len(key_indicators)} métricas)',
                    'content': {
                        'tipo': 'Indicadores Macroeconómicos',
                        'indicadores': key_indicators,
                        'total_metricas': len(key_indicators),
                        'all_indicators': indicators,
                        'datos_encontrados': True,
                    },
                    'published_at': datetime.now(),
                    'url': 'https://es.wikipedia.org/wiki/Econom%C3%ADa_del_Per%C3%BA',
                    'department': 'Nacional',
                    'metadata': {'extraction_method': 'wikipedia_infobox'},
                    'scraped_at': datetime.now(),
                })
                logger.info(f"Wikipedia: {len(key_indicators)} indicadores económicos extraídos")

            tables = soup.find_all('table', class_='wikitable')
            for table in tables[:3]:
                rows = table.find_all('tr')
                if len(rows) < 3:
                    continue
                headers = [h.get_text(strip=True) for h in rows[0].find_all(['th', 'td'])]
                if not any('PIB' in h or 'Año' in h or 'año' in h.lower() for h in headers):
                    continue

                table_data = []
                for row in rows[1:]:
                    cells = [c.get_text(strip=True) for c in row.find_all(['td', 'th'])]
                    if cells and any(c.strip() for c in cells):
                        table_data.append(dict(zip(headers, cells)))

                if table_data:
                    items.append({
                        'source': 'INEI',
                        'data_type': 'Estadística',
                        'title': f'PIB per cápita histórico ({len(table_data)} registros)',
                        'content': {
                            'tipo': 'Serie Histórica',
                            'headers': headers,
                            'datos': table_data[:15],
                            'total_registros': len(table_data),
                            'datos_encontrados': True,
                        },
                        'published_at': datetime.now(),
                        'url': 'https://es.wikipedia.org/wiki/Econom%C3%ADa_del_Per%C3%BA',
                        'department': 'Nacional',
                        'metadata': {'extraction_method': 'wikipedia_table'},
                        'scraped_at': datetime.now(),
                    })
                    break
        except Exception as e:
            logger.error(f"Error scraping economy: {e}")
        return items

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.title == item_data['title'],
            model_class.source == item_data['source']
        ).first()
        return existing is not None


class CongresoScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.delay_range = (1, 2)

    def _parse_content(self, response) -> List[Dict[str, Any]]:
        return []

    def scrape(self, db: Session) -> int:
        all_items = []
        all_items.extend(self._scrape_congresistas())
        all_items.extend(self._scrape_comisiones())
        return self._save_items(db, all_items, GovernmentData)

    def _scrape_congresistas(self) -> List[Dict[str, Any]]:
        items = []
        try:
            response = self._make_request('https://www.congreso.gob.pe/pleno/congresistas/')
            if not response:
                return items
            soup = BeautifulSoup(response.content, 'html.parser')
            table = soup.find('table')
            if not table:
                return items

            rows = table.find_all('tr')
            if len(rows) < 2:
                return items

            parties: Dict[str, List[str]] = {}
            total = 0

            for row in rows[1:]:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 3:
                    name = cells[1].get_text(strip=True)
                    party = cells[2].get_text(strip=True)
                    if name and party:
                        if party not in parties:
                            parties[party] = []
                        parties[party].append(name)
                        total += 1

            if parties:
                party_summary = []
                for party, members in sorted(parties.items(), key=lambda x: -len(x[1])):
                    party_summary.append({
                        'bancada': party,
                        'escanos': len(members),
                        'porcentaje': round(len(members) / total * 100, 1) if total > 0 else 0,
                        'congresistas': members[:5],
                    })

                items.append({
                    'source': 'Congreso',
                    'data_type': 'Composición',
                    'title': f'Composición del Congreso ({total} congresistas, {len(parties)} bancadas)',
                    'content': {
                        'tipo': 'Composición Parlamentaria',
                        'total_congresistas': total,
                        'total_bancadas': len(parties),
                        'bancadas': party_summary,
                        'bancada_mayoritaria': party_summary[0]['bancada'] if party_summary else '',
                        'escanos_mayoritaria': party_summary[0]['escanos'] if party_summary else 0,
                        'datos_encontrados': True,
                    },
                    'published_at': datetime.now(),
                    'url': 'https://www.congreso.gob.pe/pleno/congresistas/',
                    'department': 'Nacional',
                    'metadata': {'extraction_method': 'congreso_table'},
                    'scraped_at': datetime.now(),
                })
                logger.info(f"Congreso: {total} congresistas en {len(parties)} bancadas")
        except Exception as e:
            logger.error(f"Error scraping congresistas: {e}")
        return items

    def _scrape_comisiones(self) -> List[Dict[str, Any]]:
        items = []
        try:
            response = self._make_request('https://www.congreso.gob.pe/CuadrodeComisiones/')
            if not response:
                return items
            soup = BeautifulSoup(response.content, 'html.parser')

            comisiones = []
            links = soup.find_all('a', href=True)
            for link in links:
                href = link.get('href', '')
                text = link.get_text(strip=True)
                if ('comision' in href.lower() or 'Comisión' in text) and len(text) > 10 and text not in [c.get('nombre') for c in comisiones]:
                    comisiones.append({
                        'nombre': text[:120],
                        'url': urljoin('https://www.congreso.gob.pe', href),
                    })

            comisiones_unique = []
            seen = set()
            for c in comisiones:
                if c['nombre'] not in seen and len(c['nombre']) > 15:
                    seen.add(c['nombre'])
                    comisiones_unique.append(c)

            if comisiones_unique:
                items.append({
                    'source': 'Congreso',
                    'data_type': 'Organización',
                    'title': f'Comisiones del Congreso ({len(comisiones_unique)} comisiones)',
                    'content': {
                        'tipo': 'Comisiones Parlamentarias',
                        'total_comisiones': len(comisiones_unique),
                        'comisiones': comisiones_unique[:30],
                        'datos_encontrados': True,
                    },
                    'published_at': datetime.now(),
                    'url': 'https://www.congreso.gob.pe/CuadrodeComisiones/',
                    'department': 'Nacional',
                    'metadata': {'extraction_method': 'congreso_html'},
                    'scraped_at': datetime.now(),
                })
                logger.info(f"Congreso: {len(comisiones_unique)} comisiones encontradas")
        except Exception as e:
            logger.error(f"Error scraping comisiones: {e}")
        return items

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.title == item_data['title'],
            model_class.source == item_data['source']
        ).first()
        return existing is not None


class DatosAbiertosScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.base_url = 'https://www.datosabiertos.gob.pe'
        self.api_url = f'{self.base_url}/api/3/action'
        self.delay_range = (0.3, 0.8)
        self.max_csv_rows = 60
        self.max_datasets_per_category = 3
        self.max_attempts_per_category = 15

    def _parse_content(self, response) -> List[Dict[str, Any]]:
        return []

    def _download_csv_data(self, url: str) -> Optional[Dict[str, Any]]:
        try:
            r = requests.get(url, timeout=8, headers=self.session.headers, stream=True)
            if r.status_code != 200:
                return None

            max_bytes = 500_000
            chunks = []
            downloaded = 0
            for chunk in r.iter_content(chunk_size=8192):
                chunks.append(chunk if isinstance(chunk, bytes) else chunk.encode('utf-8'))
                downloaded += len(chunk)
                if downloaded > max_bytes:
                    break
            r.close()
            raw = b''.join(chunks)
            if raw.startswith(b'\xef\xbb\xbf'):
                raw = raw[3:]
            for enc in ['utf-8', 'latin-1', 'cp1252']:
                try:
                    text = raw.decode(enc).strip()
                    break
                except (UnicodeDecodeError, ValueError):
                    continue
            else:
                text = raw.decode('utf-8', errors='replace').strip()
            text = text.replace('\r\n', '\n').replace('\r', '\n')
            if not text:
                return None

            import csv
            from io import StringIO

            sample = text[:2048]
            try:
                dialect = csv.Sniffer().sniff(sample, delimiters=',;\t|')
            except csv.Error:
                dialect = csv.excel

            reader = csv.reader(StringIO(text), dialect)
            rows_list = []
            for row in reader:
                rows_list.append(row)
                if len(rows_list) > self.max_csv_rows + 1:
                    break

            if len(rows_list) < 2:
                return None

            headers = [h.strip().lstrip('\ufeff') for h in rows_list[0] if h.strip()]
            if len(headers) < 2 or len(headers) > 30:
                return None

            data_rows = []
            for row in rows_list[1:]:
                if row and any(cell.strip() for cell in row):
                    row_dict = {}
                    for i, h in enumerate(headers):
                        if i < len(row):
                            row_dict[h] = row[i].strip()
                    data_rows.append(row_dict)

            total_approx = len(rows_list) - 1
            if downloaded >= max_bytes:
                total_approx = max(total_approx, int(total_approx * 1.5))

            return {
                'headers': headers[:15],
                'datos': data_rows[:50],
                'total_filas': total_approx,
                'filas_mostradas': min(len(data_rows), 50),
            }
        except Exception as e:
            logger.warning(f"Error downloading CSV {url[:60]}: {e}")
            return None

    def _get_package_with_data(self, pkg_name: str) -> Optional[Dict[str, Any]]:
        try:
            r = requests.get(f'{self.api_url}/package_show?id={pkg_name}', timeout=8, headers=self.session.headers)
            if not r or r.status_code != 200:
                return None
            resp = r.json()
            result = resp.get('result', {})
            if isinstance(result, list):
                result = result[0] if result else {}

            title = result.get('title', pkg_name.replace('-', ' ').title())
            org = result.get('organization', {})
            org_name = org.get('title', '') if isinstance(org, dict) else ''
            resources = result.get('resources', [])

            csv_resources = [res for res in resources if res.get('format', '').lower() == 'csv']
            if not csv_resources:
                logger.debug(f"Package {pkg_name}: no CSV resources (formats: {[r.get('format','') for r in resources[:5]]})")
                return None

            datasets_with_data = []
            for res in csv_resources[:2]:
                csv_url = res.get('url', '')
                res_name = res.get('name', '')
                if not csv_url:
                    continue
                csv_data = self._download_csv_data(csv_url)
                if csv_data and csv_data['total_filas'] > 1:
                    datasets_with_data.append({
                        'recurso': res_name or title,
                        'formato': 'CSV',
                        'total_filas': csv_data['total_filas'],
                        'filas_mostradas': csv_data['filas_mostradas'],
                        'headers': csv_data['headers'],
                        'datos': csv_data['datos'],
                        'url_recurso': csv_url,
                    })
                    break
                else:
                    logger.debug(f"Package {pkg_name}: CSV download failed or empty for {csv_url[:60]}")

            if not datasets_with_data:
                return None

            return {
                'title': title,
                'organization': org_name,
                'datasets': datasets_with_data,
                'url': result.get('url', f'{self.base_url}/dataset/{pkg_name}'),
            }
        except Exception as e:
            logger.warning(f"Error getting package {pkg_name}: {e}")
            return None

    def scrape(self, db: Session) -> int:
        all_items = []
        try:
            r = self._make_request(f'{self.api_url}/package_list')
            if not r:
                return 0
            data = r.json()
            all_packages = data.get('result', [])
            logger.info(f"Datos Abiertos: {len(all_packages)} datasets disponibles")

            political_keywords = [
                'presupuesto', 'congreso', 'electoral', 'fiscal', 'gasto-público',
                'deuda', 'empleo', 'pobreza', 'educación', 'salud', 'seguridad',
                'corrupción', 'transparencia', 'gobierno', 'ministerio',
                'indicador', 'censo', 'votación', 'elecciones',
            ]

            relevant = []
            for pkg in all_packages:
                pkg_lower = pkg.lower()
                if any(kw in pkg_lower for kw in political_keywords):
                    relevant.append(pkg)

            categories: Dict[str, List[str]] = {
                'Presupuesto y Finanzas': [],
                'Electoral': [],
                'Indicadores Sociales': [],
                'Gobierno y Transparencia': [],
                'Seguridad': [],
            }

            for pkg in relevant:
                pkg_lower = pkg.lower()
                if any(kw in pkg_lower for kw in ['presupuesto', 'fiscal', 'gasto', 'deuda', 'financ']):
                    categories['Presupuesto y Finanzas'].append(pkg)
                elif any(kw in pkg_lower for kw in ['electoral', 'votación', 'elecciones', 'congreso']):
                    categories['Electoral'].append(pkg)
                elif any(kw in pkg_lower for kw in ['empleo', 'pobreza', 'educación', 'salud', 'censo']):
                    categories['Indicadores Sociales'].append(pkg)
                elif any(kw in pkg_lower for kw in ['gobierno', 'transparencia', 'ministerio', 'corrupción']):
                    categories['Gobierno y Transparencia'].append(pkg)
                elif any(kw in pkg_lower for kw in ['seguridad']):
                    categories['Seguridad'].append(pkg)

            total_with_data = 0
            for cat, pkgs in categories.items():
                if not pkgs:
                    continue

                datasets_downloaded = []
                attempts = 0
                for pkg_name in pkgs:
                    if len(datasets_downloaded) >= self.max_datasets_per_category:
                        break
                    if attempts >= self.max_attempts_per_category:
                        break
                    attempts += 1
                    pkg_data = self._get_package_with_data(pkg_name)
                    if pkg_data:
                        datasets_downloaded.append(pkg_data)
                        logger.info(f"Datos Abiertos [{cat}]: descargado '{pkg_data['title'][:50]}'")
                

                if datasets_downloaded:
                    total_with_data += len(datasets_downloaded)
                    all_items.append({
                        'source': 'PCM',
                        'data_type': 'Datos Abiertos',
                        'title': f'{cat}: {len(datasets_downloaded)} datasets con datos reales',
                        'content': {
                            'tipo': f'Datos Abiertos - {cat}',
                            'categoria': cat,
                            'total_datasets_categoria': len(pkgs),
                            'datasets_descargados': len(datasets_downloaded),
                            'datasets': [{
                                'titulo': ds['title'],
                                'organizacion': ds['organization'],
                                'url': ds['url'],
                                'recursos': ds['datasets'],
                            } for ds in datasets_downloaded],
                            'datos_encontrados': True,
                        },
                        'published_at': datetime.now(),
                        'url': f'{self.base_url}/dataset',
                        'department': 'Nacional',
                        'metadata': {'extraction_method': 'ckan_api_csv_download'},
                        'scraped_at': datetime.now(),
                    })

            logger.info(f"Datos Abiertos: {total_with_data} datasets con datos reales descargados en {len([i for i in all_items])} categorías")
        except Exception as e:
            logger.error(f"Error scraping Datos Abiertos: {e}")
        return self._save_items(db, all_items, GovernmentData)

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.title == item_data['title'],
            model_class.source == item_data['source']
        ).first()
        return existing is not None


class ONPEScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.base_url = "https://www.onpe.gob.pe"

    def _parse_content(self, response) -> List[Dict[str, Any]]:
        return []

    def scrape(self, db: Session) -> int:
        return 0

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.url == item_data.get('url', '')
        ).first()
        return existing is not None


class INEIScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.base_url = "https://www.inei.gob.pe"

    def _parse_content(self, response) -> List[Dict[str, Any]]:
        return []

    def scrape(self, db: Session) -> int:
        return 0

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.url == item_data.get('url', '')
        ).first()
        return existing is not None


class MEFScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.base_url = "https://www.mef.gob.pe"

    def _parse_content(self, response) -> List[Dict[str, Any]]:
        return []

    def scrape(self, db: Session) -> int:
        return 0

    def _item_exists(self, db: Session, item_data: Dict[str, Any], model_class) -> bool:
        existing = db.query(model_class).filter(
            model_class.url == item_data.get('url', '')
        ).first()
        return existing is not None
