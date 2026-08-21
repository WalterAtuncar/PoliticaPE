# S0-05 — Scraper de encuestas apuntando a la elección municipal de Lima

**Objetivo:** que `WikipediaPollScraper` lea la página `Elecciones_municipales_de_Lima_de_2026` y guarde **cada encuesta con todos sus candidatos**, diferenciando la tabla de votos válidos de la de preferencias brutas, con nombres normalizados a los `display_name` del seed.

**Precondiciones:** S0-04 (figuras cargadas, migración 001 aplicada).

**Archivos a tocar:** `project-scrapping/app/scrapers/survey_scrapers.py` (clase `WikipediaPollScraper`, líneas 17-227), `.env.example`, `project-react/src/components/surveys/SurveysPage.tsx` (solo filtro por ámbito).

## Estructura real de la página (verificada 21-ago-2026)

- Sección "Sondeos de opinión", dos `table.wikitable`: (1) **Intención de voto** (ponderada, sobre válidos) y (2) **Preferencias de voto** (brutas, incluye blanco/viciado y NS/NR).
- Fila de cabecera única (sin rowspan/colspan): `Encuestadora/Medio | Fecha | Muestra | <candidato>×N | Dif.`. Los nombres de candidato vienen con el partido en la misma celda (p. ej. "Carlos Bruce Somos Perú" tras `get_text`), por eso se normaliza con alias.
- Fecha: `13–15 ago 2026` (rango con guion corto, mes abreviado). Muestra: `500`. Valores con punto decimal; faltantes con `–`.
- Filas de ejemplo: `CIT | 13–15 ago 2026 | 500 | 17.4 | 18.3 | – | 6.2 | 13.8 | – | – | 32.0 | – | 13.7`.

## Pasos

1. `.env.example`: añadir `WIKIPEDIA_POLLS_URL=https://es.wikipedia.org/wiki/Elecciones_municipales_de_Lima_de_2026`.
2. Reemplazar la clase `WikipediaPollScraper` completa (líneas 17-227) por esta implementación. Mantén los imports existentes del archivo:
   ```python
   import os
   import unicodedata

   CANDIDATE_ALIASES = {
       # clave normalizada (sin tildes, minúsculas) → display_name del seed
       "lopez aliaga": "Rafael López Aliaga", "rafael lopez aliaga": "Rafael López Aliaga",
       "bruce": "Carlos Bruce", "carlos bruce": "Carlos Bruce",
       "urresti": "Daniel Urresti", "daniel urresti": "Daniel Urresti",
       "allison": "Francis Allison", "francis allison": "Francis Allison",
       "paredes": "Susel Paredes", "susel paredes": "Susel Paredes",
       "daza": "Samuel Daza", "samuel daza": "Samuel Daza",
       "belmont": "Ricardo Belmont", "ricardo belmont": "Ricardo Belmont",
       "tejada": "Alberto Tejada", "alberto tejada": "Alberto Tejada",
       "riera": "Elio Riera", "elio riera": "Elio Riera",
       "vargas": "Oswaldo Vargas", "oswaldo vargas": "Oswaldo Vargas",
       "castro": "Yuri Castro", "yuri castro": "Yuri Castro",
       "leon": "Elizabeth León", "elizabeth leon": "Elizabeth León",
       "yaya": "Mónica Yaya", "monica yaya": "Mónica Yaya",
       "de pomar": "Edgardo de Pomar", "edgardo de pomar": "Edgardo de Pomar",
       "valdez": "Segundo Valdez", "segundo valdez": "Segundo Valdez",
       "la cruz": "Victoria La Cruz", "victoria la cruz": "Victoria La Cruz",
       "caller": "Sandro Caller", "sandro caller": "Sandro Caller",
       "hurtado": "Flor Hurtado", "flor hurtado": "Flor Hurtado",
       "alvarado": "Juan Alvarado Mestanza", "juan alvarado": "Juan Alvarado Mestanza",
       "llanos": "Luis Llanos", "luis llanos": "Luis Llanos",
       "gallardo": "Carlos Gallardo", "carlos gallardo": "Carlos Gallardo",
       "rubio": "Luis Rubio",  # candidato retirado; se guarda con su nombre para encuestas de julio
   }
   NON_CANDIDATE_COLUMNS = {"dif", "dif.", "ventaja", "otros", "otro", "b/v", "blanco/viciado", "blanco",
                            "viciado", "ns/nr", "ns/no", "nsnr", "no precisa", "ninguno", "indecisos", "nr"}
   MESES_ABR = {'ene': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'may': 5, 'jun': 6, 'jul': 7, 'ago': 8,
                'sep': 9, 'set': 9, 'oct': 10, 'nov': 11, 'dic': 12}


   def _norm(s: str) -> str:
       s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode()
       s = re.sub(r'\[.*?\]', '', s).replace('​', '')
       return re.sub(r'\s+', ' ', s).strip().lower()


   class WikipediaPollScraper(BaseScraper):

       def __init__(self):
           super().__init__()
           self.url = os.getenv("WIKIPEDIA_POLLS_URL",
                                "https://es.wikipedia.org/wiki/Elecciones_municipales_de_Lima_de_2026")

       def _parse_content(self, response: requests.Response) -> List[Dict[str, Any]]:
           return self._extract_poll_tables(response)

       def scrape(self, db: Session) -> int:
           response = self._make_request(self.url)
           if not response:
               logger.error("Wikipedia: no se pudo acceder a la página")
               return 0
           items = self._extract_poll_tables(response)
           logger.info(f"Wikipedia municipal Lima: {len(items)} filas de encuesta extraídas")
           return self._save_items(db, items, ScrapedSurvey)

       def _extract_poll_tables(self, response: requests.Response) -> List[Dict[str, Any]]:
           soup = BeautifulSoup(response.content, 'html.parser')
           items = []
           table_index = 0
           for table in soup.find_all('table', class_='wikitable'):
               rows = table.find_all('tr')
               if len(rows) < 2:
                   continue
               header_cells = rows[0].find_all(['th', 'td'])
               headers = [_norm(c.get_text(" ", strip=True)) for c in header_cells]
               if not headers or 'encuestadora' not in headers[0]:
                   continue
               table_index += 1
               base = 'validos' if table_index == 1 else 'total'
               columns = self._map_columns(header_cells)
               for row in rows[1:]:
                   cells = [c.get_text(" ", strip=True) for c in row.find_all(['td', 'th'])]
                   if len(cells) < 4:
                       continue
                   item = self._parse_poll_row(cells, columns, base)
                   if item:
                       items.append(item)
           return items

       def _map_columns(self, header_cells) -> List[Dict[str, Any]]:
           """Devuelve por índice: {'kind': 'pollster'|'date'|'sample'|'candidate'|'other'|'undecided'|'blank'|'diff', 'name': str}"""
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
               elif any(k in full for k in ('ns/nr', 'no precisa', 'indeciso', 'ns/no')):
                   columns.append({'kind': 'undecided', 'name': 'undecided'})
               elif any(k in full for k in ('blanco', 'viciado', 'b/v')):
                   columns.append({'kind': 'blank', 'name': 'blank'})
               elif full in NON_CANDIDATE_COLUMNS or full.startswith('otros'):
                   columns.append({'kind': 'other', 'name': 'otros'})
               else:
                   name = self._canonical_candidate(label) or self._canonical_candidate(full)
                   columns.append({'kind': 'candidate', 'name': name or raw.strip()[:60]})
           return columns

       def _canonical_candidate(self, text: str) -> Optional[str]:
           t = _norm(text)
           if t in CANDIDATE_ALIASES:
               return CANDIDATE_ALIASES[t]
           for alias, canon in sorted(CANDIDATE_ALIASES.items(), key=lambda kv: -len(kv[0])):
               if re.search(r'\b' + re.escape(alias) + r'\b', t):
                   return canon
           return None

       @staticmethod
       def _to_float(val: str) -> Optional[float]:
           v = (val or '').replace(',', '.').replace('%', '').strip()
           if v in ('', '–', '—', '-', '―'):
               return None
           try:
               return float(re.sub(r'[^\d.]', '', v))
           except ValueError:
               return None

       def _parse_poll_row(self, cells: List[str], columns: List[Dict[str, Any]], base: str) -> Optional[Dict[str, Any]]:
           pollster_raw = re.sub(r'\[.*?\]', '', cells[0]).replace('​', '').strip()
           if len(pollster_raw) < 2:
               return None
           date_str = cells[1].strip()
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
           ranked = sorted([c for c in candidates if c['porcentaje'] is not None], key=lambda c: -c['porcentaje'])
           if not ranked:
               return None

           results = {
               'tipo': 'Intención de voto municipal',
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
           base_label = 'válidos' if base == 'validos' else 'total de encuestados'
           title = f"Lima 2026 ({base_label}): {ranked[0]['candidato']} {ranked[0]['porcentaje']}%"
           if len(ranked) > 1:
               title += f" vs {ranked[1]['candidato']} {ranked[1]['porcentaje']}%"
           return {
               'id': str(uuid.uuid4()),
               'source': pollster_name,
               'title': title[:500],
               'methodology': f"Encuesta de intención de voto — base: {base_label}{' — ' + medio if medio else ''}",
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
           """Acepta '13–15 ago 2026', '6–7 ago 2026', '26 jul–2 ago 2026', '15 de agosto de 2026', 'agosto 2026'. Devuelve la fecha FINAL del trabajo de campo."""
           s = _norm(date_str).replace('–', '-').replace('—', '-')
           m = re.search(r'(\d{1,2})\s*(?:de\s+)?([a-z]+)?\s*-\s*(\d{1,2})\s*(?:de\s+)?([a-z]+)\s*(?:de\s+)?(\d{4})', s)
           if m:
               day, mon = int(m.group(3)), MESES_ABR.get(m.group(4)[:3])
               if mon:
                   try:
                       return datetime(int(m.group(5)), mon, day)
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
   ```
3. Ejecutar una vez en local: `curl -s -X POST -H "Authorization: Bearer $TOKEN" localhost:8000/api/v1/scraping/trigger/surveys` y esperar el log `Wikipedia municipal Lima: N filas`.
4. Frontend `SurveysPage.tsx`: en el filtro de fuente (línea ~239 `sources`) añadir un selector "Ámbito" con opciones `Lima 2026` (default, filtra `results.ambito === 'lima_metropolitana'`) y `Presidencial 2026`; no tocar la tarjeta `CandidateData` (ya lee `results.candidatos[].porcentaje`, que puede ser `null` → mostrar `–`).

## Criterios de aceptación

1. Neon: `SELECT source, field_dates, results->>'base', results->>'lider', results->>'lider_porcentaje' FROM scraped_surveys WHERE results->>'ambito'='lima_metropolitana' ORDER BY published_at DESC LIMIT 6` muestra al menos CIT (13–15 ago 2026), Datum (7–9 ago 2026) e Ipsos (6–7 ago 2026), **cada una dos veces** (base `validos` y `total`), con líder `Rafael López Aliaga`.
2. `SELECT jsonb_array_length(results::jsonb->'candidatos') FROM scraped_surveys WHERE results->>'ambito'='lima_metropolitana' LIMIT 1` ≥ 8.
3. `SELECT count(DISTINCT (results::jsonb->'candidatos'->0->>'candidato')) ...` no contiene cadenas con nombre de partido (p. ej. "Somos Perú").
4. Volver a ejecutar el trigger no duplica filas (`count(*)` estable).
5. `published_at` de la fila CIT = `2026-08-15`.

## Si falla

- Si Wikipedia cambia el orden de las dos tablas, `base` se invierte: detectarlo por la cabecera (`'preferencia'` en el `caption` o en el `h3` previo → `total`). Añade esa comprobación si el criterio 1 muestra `total` para la primera tabla.
- Si `_make_request` recibe 403, añadir `headers={'User-Agent': 'PoliticaPE/1.0 (contacto: walter150976@gmail.com)'}` en la llamada (Wikipedia exige UA identificable).

## Commit

`feat(lima2026): S0-05 scraper de encuestas para la elección municipal de Lima (filas completas, base válidos/total)`
