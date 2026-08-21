import json
import re
import unicodedata
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional, Tuple

DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "lima_districts.json"
ZONES = ["Lima Norte", "Lima Este", "Lima Centro", "Lima Moderna", "Lima Sur"]


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", text).strip().lower()


def _word_pattern(term: str) -> re.Pattern:
    return re.compile(r"(?<![\w])" + re.escape(term) + r"(?![\w])")


@lru_cache(maxsize=1)
def _load():
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    districts = data["districts"]
    by_ubigeo = {d["ubigeo"]: d for d in districts}
    by_name: Dict[str, dict] = {}
    patterns = []  # (compiled, ubigeo, is_short_alias)

    for d in districts:
        by_name[normalize(d["name"])] = d
        by_name[normalize(d["display"])] = d
        # "Lima" a secas es ambiguo: solo cuentan sus alias explicitos
        terms = [] if d["name"] == "Lima" else [d["name"], d["display"]]
        for alias in d.get("aliases", []):
            by_name[normalize(alias)] = d
            terms.append(alias)
        for t in set(terms):
            short = t.isupper() and len(t) <= 4
            patterns.append((_word_pattern(t if short else normalize(t)), d["ubigeo"], short))

    patterns.sort(key=lambda p: -len(p[0].pattern))
    city_terms = [(normalize(t), _word_pattern(normalize(t))) for t in data["city_level_terms"]["terms"]]
    exclude = [(normalize(t), _word_pattern(normalize(t))) for t in data["exclude_terms"]]
    return districts, by_ubigeo, by_name, patterns, city_terms, exclude


def all_districts() -> List[dict]:
    return _load()[0]


def district_by_ubigeo(ubigeo: str) -> Optional[dict]:
    return _load()[1].get(ubigeo)


def district_by_name(name: str) -> Optional[dict]:
    return _load()[2].get(normalize(name))


def zone_of_ubigeo(ubigeo: str) -> Optional[str]:
    d = district_by_ubigeo(ubigeo)
    return d["zone"] if d else None


def detect_districts(text: str) -> List[Dict[str, str]]:
    """Distritos de Lima Metropolitana mencionados, unicos y en orden de aparicion.
    Ignora Callao y sus distritos."""
    if not text:
        return []
    _, by_ubigeo, _, patterns, _, exclude = _load()
    norm = normalize(text)

    if "lima" not in norm and any(pat.search(norm) for _, pat in exclude):
        return []

    found, seen = [], set()
    for pat, ubigeo, short in patterns:
        if ubigeo in seen:
            continue
        m = pat.search(text if short else norm)
        if m:
            seen.add(ubigeo)
            d = by_ubigeo[ubigeo]
            found.append({"ubigeo": ubigeo, "name": d["display"], "zone": d["zone"], "pos": m.start()})

    found.sort(key=lambda f: f["pos"])
    return [{k: v for k, v in f.items() if k != "pos"} for f in found]


def detect_scope(title: str, content: str = "", extra_terms: Optional[List[str]] = None) -> Tuple[str, List[Dict[str, str]]]:
    """('lima_metropolitana'|'nacional', districts).
    extra_terms: keywords de figuras activas, para captar a los candidatos sin distrito explicito."""
    text = f"{title or ''} {content or ''}"
    districts = detect_districts(text)
    if districts:
        return "lima_metropolitana", districts

    norm = normalize(text)
    _, _, _, _, city_terms, _ = _load()
    if any(pat.search(norm) for _, pat in city_terms):
        return "lima_metropolitana", []

    for kw in extra_terms or []:
        if kw and _word_pattern(normalize(kw)).search(norm):
            return "lima_metropolitana", []

    return "nacional", []


def zone_of(districts: List[Dict[str, str]]) -> Optional[str]:
    return districts[0]["zone"] if districts else None


# Los actores nacionales (presidencia, ministros) se monitorean, pero mencionarlos
# no convierte una noticia en noticia de Lima: quedan fuera de detect_scope.
SCOPE_ROLES = ("candidate", "incumbent", "institution")


def figure_keywords(db) -> List[str]:
    """Keywords de las figuras locales activas, para detect_scope."""
    from app.models import PoliticalFigure
    rows = (
        db.query(PoliticalFigure.search_keywords)
        .filter(PoliticalFigure.is_active == True)
        .filter(PoliticalFigure.figure_role.in_(SCOPE_ROLES))
        .all()
    )
    out = []
    for (kws,) in rows:
        for kw in (kws or []):
            if kw and len(kw) >= 4:
                out.append(kw)
    return list(dict.fromkeys(out))
