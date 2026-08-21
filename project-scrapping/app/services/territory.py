from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services import lima_geo

# Peso de cada tema en el score de oportunidad territorial (S2-12).
# Derivado de las prioridades declaradas por los limenos: inseguridad 71 %, transporte 9 %.
TOPIC_WEIGHTS = {
    "inseguridad": 1.00, "extorsion": 0.95, "transporte": 0.60, "limpieza_residuos": 0.50,
    "corrupcion": 0.45, "obras_infraestructura": 0.40, "servicios_basicos": 0.35,
    "comercio_informal": 0.30, "vivienda_urbanismo": 0.30, "gestion_municipal": 0.30,
    "legalidad_candidatura": 0.25, "espacios_publicos_ambiente": 0.20, "economia_empleo": 0.20,
    "campana_electoral": 0.10, "gobierno_nacional": 0.10, "otro": 0.05,
}


def _has_classifications(db: Session) -> bool:
    return bool(db.execute(text("SELECT to_regclass('public.content_classifications') IS NOT NULL")).scalar())


def _empty_stats() -> Dict[str, dict]:
    return {
        d["ubigeo"]: {
            "ubigeo": d["ubigeo"], "name": d["display"], "zone": d["zone"],
            "electors": d["electors_approx"], "mentions": 0,
            "sent_sum": 0.0, "sent_n": 0,
            "topics": defaultdict(int),
            "figures": defaultdict(lambda: {"mentions": 0, "sent_sum": 0.0, "sent_n": 0}),
        }
        for d in lima_geo.all_districts()
    }


def district_stats(db: Session, days: int = 7, figure_id: Optional[str] = None) -> List[dict]:
    since = datetime.utcnow() - timedelta(days=days)
    stats = _empty_stats()

    if _has_classifications(db):
        rows = db.execute(text("""
            SELECT districts, figure_id, stance, topic
            FROM content_classifications
            WHERE content_published_at >= :since
              AND jsonb_typeof(districts::jsonb) = 'array'
              AND jsonb_array_length(districts::jsonb) > 0
        """), {"since": since}).fetchall()
        for districts, fid, stance, topic in rows:
            for d in (districts or []):
                s = stats.get(d.get("ubigeo"))
                if not s:
                    continue
                s["mentions"] += 1
                if topic:
                    s["topics"][topic] += 1
                if stance is not None:
                    s["sent_sum"] += float(stance)
                    s["sent_n"] += 1
                if fid:
                    f = s["figures"][fid]
                    f["mentions"] += 1
                    if stance is not None:
                        f["sent_sum"] += float(stance)
                        f["sent_n"] += 1
    else:
        # Antes de S1-09 no hay clasificaciones: se usa el sentimiento del lexico.
        for table, date_col in (("news_articles", "published_at"), ("raw_social_posts", "created_at")):
            rows = db.execute(text(f"""
                SELECT districts, sentiment_score
                FROM {table}
                WHERE {date_col} >= :since
                  AND jsonb_typeof(districts::jsonb) = 'array'
                  AND jsonb_array_length(districts::jsonb) > 0
            """), {"since": since}).fetchall()
            for districts, score in rows:
                for d in (districts or []):
                    s = stats.get(d.get("ubigeo"))
                    if not s:
                        continue
                    s["mentions"] += 1
                    if score is not None:
                        s["sent_sum"] += float(score)
                        s["sent_n"] += 1

    out = []
    for s in stats.values():
        top_topic = max(s["topics"].items(), key=lambda kv: kv[1])[0] if s["topics"] else None
        figures = {
            fid: {
                "mentions": f["mentions"],
                "net": round(f["sent_sum"] / f["sent_n"], 3) if f["sent_n"] else None,
            }
            for fid, f in s["figures"].items()
        }
        if figure_id:
            figures = {k: v for k, v in figures.items() if k == figure_id}
        out.append({
            "ubigeo": s["ubigeo"],
            "name": s["name"],
            "zone": s["zone"],
            "electors": s["electors"],
            "mentions": s["mentions"],
            "net_sentiment": round(s["sent_sum"] / s["sent_n"], 3) if s["sent_n"] else None,
            "top_topic": top_topic,
            "topics": dict(sorted(s["topics"].items(), key=lambda kv: -kv[1])[:5]),
            "figures": figures,
        })
    out.sort(key=lambda x: -x["mentions"])
    return out


def zone_stats(db: Session, days: int = 7, figure_id: Optional[str] = None) -> List[dict]:
    agg = {z: {"zone": z, "electors": 0, "mentions": 0, "sent_sum": 0.0, "sent_n": 0, "districts": 0}
           for z in lima_geo.ZONES}
    for d in district_stats(db, days, figure_id):
        a = agg[d["zone"]]
        a["electors"] += d["electors"]
        a["mentions"] += d["mentions"]
        a["districts"] += 1
        if d["net_sentiment"] is not None and d["mentions"]:
            a["sent_sum"] += d["net_sentiment"] * d["mentions"]
            a["sent_n"] += d["mentions"]
    return [{
        "zone": a["zone"],
        "electors": a["electors"],
        "mentions": a["mentions"],
        "districts": a["districts"],
        "net_sentiment": round(a["sent_sum"] / a["sent_n"], 3) if a["sent_n"] else None,
    } for a in agg.values()]
