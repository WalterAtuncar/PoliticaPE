import logging
import uuid
from collections import defaultdict
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services import lima_geo, territory

logger = logging.getLogger(__name__)


def _figure_by_list(db: Session) -> Dict[str, str]:
    """{list_name normalizado: figure_id} para atribuir resultados a candidatos."""
    out = {}
    for fid, list_name, party in db.execute(text("""
        SELECT id, list_name, party_name FROM political_figures WHERE is_active
    """)).fetchall():
        for key in (list_name, party):
            if key:
                out[key.strip().lower()] = fid
    return out


def upsert_results(db: Session, rows: List[Dict[str, Any]], source: str) -> int:
    by_list = _figure_by_list(db)
    saved = 0
    for r in rows:
        ubigeo = str(r.get("ubigeo") or "").strip()
        list_name = str(r.get("list_name") or "").strip()
        if not ubigeo or not list_name:
            continue
        d = lima_geo.district_by_ubigeo(ubigeo)
        db.execute(text("""
            INSERT INTO election_results
                (id, ubigeo, district_name, figure_id, list_name, votes, pct_valid, actas_pct, source, loaded_at)
            VALUES (:id, :ubigeo, :dname, :fid, :list_name, :votes, :pct, :actas, :source, NOW())
            ON CONFLICT (ubigeo, list_name, source) DO UPDATE SET
                votes = EXCLUDED.votes, pct_valid = EXCLUDED.pct_valid,
                actas_pct = EXCLUDED.actas_pct, figure_id = EXCLUDED.figure_id,
                district_name = EXCLUDED.district_name, loaded_at = NOW()
        """), {
            "id": str(uuid.uuid4()),
            "ubigeo": ubigeo,
            "dname": r.get("district_name") or (d["display"] if d else None),
            "fid": by_list.get(list_name.lower()),
            "list_name": list_name,
            "votes": r.get("votes"),
            "pct": r.get("pct_valid"),
            "actas": r.get("actas_pct"),
            "source": source,
        })
        saved += 1
    db.commit()
    return saved


def summary(db: Session, source: str) -> Dict[str, Any]:
    rows = db.execute(text("""
        SELECT ubigeo, district_name, list_name, figure_id, votes, pct_valid, actas_pct
        FROM election_results WHERE source = :s
    """), {"s": source}).fetchall()
    if not rows:
        return {"source": source, "lists": [], "zones": [], "districts": [], "total_votes": 0, "actas_pct": None}

    by_list = defaultdict(int)
    by_zone = defaultdict(lambda: defaultdict(int))
    by_district = defaultdict(lambda: {"votes": 0, "lists": {}})
    actas = []
    total = 0

    for ub, dname, lname, _fid, votes, _pct, apct in rows:
        v = int(votes or 0)
        d = lima_geo.district_by_ubigeo(ub)
        zone = d["zone"] if d else "Desconocida"
        by_list[lname] += v
        by_zone[zone][lname] += v
        by_district[ub]["votes"] += v
        by_district[ub]["lists"][lname] = v
        by_district[ub]["name"] = dname or (d["display"] if d else ub)
        by_district[ub]["zone"] = zone
        total += v
        if apct is not None:
            actas.append(float(apct))

    lists = sorted(
        [{"list_name": k, "votes": v, "pct_valid": round(v / total * 100, 2) if total else 0.0}
         for k, v in by_list.items()],
        key=lambda x: -x["votes"],
    )
    zones = []
    for z, d in by_zone.items():
        zt = sum(d.values()) or 1
        winner = max(d.items(), key=lambda kv: kv[1])
        zones.append({"zone": z, "votes": zt, "winner": winner[0],
                      "winner_pct": round(winner[1] / zt * 100, 2)})

    districts = []
    for ub, d in by_district.items():
        winner = max(d["lists"].items(), key=lambda kv: kv[1]) if d["lists"] else (None, 0)
        districts.append({
            "ubigeo": ub, "name": d.get("name"), "zone": d.get("zone"), "votes": d["votes"],
            "winner": winner[0],
            "winner_pct": round(winner[1] / d["votes"] * 100, 2) if d["votes"] else 0.0,
            "lists": d["lists"],
        })
    districts.sort(key=lambda x: -x["votes"])

    return {
        "source": source,
        "total_votes": total,
        "actas_pct": round(sum(actas) / len(actas), 2) if actas else None,
        "actas_pct_min": round(min(actas), 2) if actas else None,
        "lists": lists,
        "zones": zones,
        "districts": districts,
    }


def _spearman(pairs: List[tuple]) -> Optional[float]:
    """Correlacion de Spearman sin dependencias externas."""
    n = len(pairs)
    if n < 3:
        return None

    def ranks(values):
        order = sorted(range(len(values)), key=lambda i: values[i])
        r = [0.0] * len(values)
        i = 0
        while i < len(order):
            j = i
            while j + 1 < len(order) and values[order[j + 1]] == values[order[i]]:
                j += 1
            avg = (i + j) / 2 + 1
            for k in range(i, j + 1):
                r[order[k]] = avg
            i = j + 1
        return r

    xs = ranks([p[0] for p in pairs])
    ys = ranks([p[1] for p in pairs])
    d2 = sum((a - b) ** 2 for a, b in zip(xs, ys))
    return round(1 - (6 * d2) / (n * (n * n - 1)), 3)


def vs_opportunity(db: Session, figure_id: str, source: str) -> Dict[str, Any]:
    """Compara el ranking de oportunidad con el resultado real por distrito."""
    opp = {d["ubigeo"]: d for d in territory.opportunity(db, figure_id)}
    if not opp:
        return {"error": "No se pudo calcular la oportunidad territorial"}

    res = summary(db, source)
    own_list = db.execute(text("SELECT list_name FROM political_figures WHERE id = :f"), {"f": figure_id}).scalar()

    rows = []
    pairs = []
    for d in res["districts"]:
        o = opp.get(d["ubigeo"])
        if not o:
            continue
        own_votes = d["lists"].get(own_list or "", 0)
        own_pct = round(own_votes / d["votes"] * 100, 2) if d["votes"] else 0.0
        rows.append({
            "ubigeo": d["ubigeo"], "name": d["name"], "zone": d["zone"],
            "score": o["score"], "score_rank": o["rank"],
            "own_pct": own_pct, "winner": d["winner"],
            "won": d["winner"] == own_list,
        })
        pairs.append((o["score"], own_pct))

    rows.sort(key=lambda r: r["score_rank"])
    return {
        "figure_id": figure_id,
        "own_list": own_list,
        "source": source,
        "spearman": _spearman(pairs),
        "districts": rows,
        "won_districts": sum(1 for r in rows if r["won"]),
    }
