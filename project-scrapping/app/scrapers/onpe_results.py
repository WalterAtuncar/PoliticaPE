"""Carga de resultados de ONPE por distrito de Lima Metropolitana.

La URL del portal de resultados ERM 2026 no se conoce por adelantado. El dia de la
eleccion hay que abrir el portal, inspeccionar en las herramientas de red que endpoint
JSON devuelve los resultados por ubigeo y fijarlo en ONPE_RESULTS_URL. Mientras tanto,
la carga por CSV (scripts/load_results_csv.py) es el camino garantizado.

ONPE_RESULTS_URL admite el marcador {ubigeo}; si no lo lleva, se envia como query param.
"""

import logging
import os
from typing import Any, Dict, List

import requests

from app.services import lima_geo

logger = logging.getLogger(__name__)

LIST_KEYS = ("organizacion_politica", "organizacion", "agrupacion", "partido", "lista", "nombre")
VOTE_KEYS = ("votos", "votos_validos", "total_votos", "cantidad")
PCT_KEYS = ("porcentaje", "porcentaje_valido", "pct", "porc")
ACTAS_KEYS = ("actas_contabilizadas_porcentaje", "porcentaje_actas", "actas_procesadas")


class OnpeResultsScraper:
    def __init__(self, base_url: str = None):
        self.base_url = (base_url or os.getenv("ONPE_RESULTS_URL", "")).strip()
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "PoliticaPE/1.0 (contacto: walter150976@gmail.com)",
            "Accept": "application/json",
        })

    def is_configured(self) -> bool:
        return bool(self.base_url)

    def _url_for(self, ubigeo: str) -> str:
        if "{ubigeo}" in self.base_url:
            return self.base_url.replace("{ubigeo}", ubigeo)
        sep = "&" if "?" in self.base_url else "?"
        return f"{self.base_url}{sep}ubigeo={ubigeo}"

    @staticmethod
    def _first(d: Dict[str, Any], keys) -> Any:
        for k in keys:
            for actual in d:
                if actual.lower() == k:
                    return d[actual]
        return None

    def _parse(self, payload: Any, ubigeo: str) -> List[Dict[str, Any]]:
        """Acepta una lista de filas o un dict con la lista bajo alguna clave conocida."""
        items = payload
        if isinstance(payload, dict):
            for key in ("data", "resultados", "items", "rows", "detalle"):
                if isinstance(payload.get(key), list):
                    items = payload[key]
                    break
        if not isinstance(items, list):
            logger.warning(f"[ONPE] respuesta inesperada para {ubigeo}: {type(payload)}")
            return []

        d = lima_geo.district_by_ubigeo(ubigeo)
        out = []
        for it in items:
            if not isinstance(it, dict):
                continue
            list_name = self._first(it, LIST_KEYS)
            if not list_name:
                continue
            out.append({
                "ubigeo": ubigeo,
                "district_name": d["display"] if d else None,
                "list_name": str(list_name).strip(),
                "votes": self._first(it, VOTE_KEYS),
                "pct_valid": self._first(it, PCT_KEYS),
                "actas_pct": self._first(it, ACTAS_KEYS),
            })
        return out

    def fetch_lima_districts(self) -> List[Dict[str, Any]]:
        if not self.is_configured():
            logger.info("[ONPE] ONPE_RESULTS_URL no configurada; no hay nada que descargar")
            return []

        rows: List[Dict[str, Any]] = []
        for d in lima_geo.all_districts():
            try:
                r = self.session.get(self._url_for(d["ubigeo"]), timeout=25)
                r.raise_for_status()
                rows.extend(self._parse(r.json(), d["ubigeo"]))
            except Exception as e:
                logger.error(f"[ONPE] {d['ubigeo']} {d['display']}: {e}")
        logger.info(f"[ONPE] {len(rows)} filas de resultado descargadas")
        return rows

    def close(self):
        self.session.close()
