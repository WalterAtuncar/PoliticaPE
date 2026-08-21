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


# --- Oportunidad territorial e impacto de eventos (S2-12) ---

DEFAULT_UNDECIDED = 0.30


def _zone_undecided(poll_rows: List[dict]) -> Dict[str, float]:
    """Indecisos + blanco/viciado por zona. Si la encuestadora no segmenta por zona
    se usa el promedio general, y si tampoco hay, DEFAULT_UNDECIDED."""
    shares = []
    for p in poll_rows:
        u = (p.get("undecided") or 0) + (p.get("blank") or 0)
        if u:
            shares.append(u / 100.0)
    overall = sum(shares) / len(shares) if shares else DEFAULT_UNDECIDED
    return {z: overall for z in lima_geo.ZONES}


def _zone_strength(db: Session, poll_rows: List[dict], days: int = 30) -> Dict[str, Dict[str, float]]:
    """{figure_id: {zona: fuerza estimada en %}}.
    Base: promedio de encuestas de la figura, ajustado por su sentimiento neto en la zona."""
    from app.services import race

    avg = {a["figure_id"]: a["pct"] for a in race.poll_average(poll_rows) if a.get("figure_id")}
    sent = {s["figure_id"]: s for s in race.sentiment(db, days)}

    out: Dict[str, Dict[str, float]] = {}
    for fid, pct in avg.items():
        by_zone = (sent.get(fid) or {}).get("by_zone", {})
        out[fid] = {}
        for z in lima_geo.ZONES:
            cell = by_zone.get(z)
            if cell and cell.get("n", 0) >= 20 and cell.get("net") is not None:
                factor = 1 + float(cell["net"])
            else:
                factor = 1.0
            out[fid][z] = max(0.0, pct * factor)
    return out


def opportunity(db: Session, figure_id: str, days: int = 30) -> List[dict]:
    """Ordena los 43 distritos por donde conviene invertir esfuerzo de campana."""
    from app.models import PoliticalFigure
    from app.services import race

    own = db.query(PoliticalFigure).filter(PoliticalFigure.id == figure_id).first()
    if not own:
        return []

    poll_rows = race.polls(db, base="validos", days=120)
    undecided_by_zone = _zone_undecided(poll_rows)
    strength = _zone_strength(db, poll_rows, days)
    own_strength = strength.get(figure_id, {})

    rival_names = {
        f.id: f.display_name
        for f in db.query(PoliticalFigure)
        .filter(PoliticalFigure.is_active == True, PoliticalFigure.figure_role == "candidate")
        .all()
        if f.id != figure_id
    }

    districts = {d["ubigeo"]: d for d in district_stats(db, days)}
    max_electors = max(d["electors"] for d in districts.values()) or 1

    rows = []
    for ub, d in districts.items():
        z = d["zone"]
        electors_n = d["electors"] / max_electors
        undecided = undecided_by_zone.get(z, DEFAULT_UNDECIDED)
        own_z = own_strength.get(z, 0.0)

        rival_id, rival_z = None, 0.0
        for rid in rival_names:
            v = strength.get(rid, {}).get(z, 0.0)
            if v > rival_z:
                rival_id, rival_z = rid, v
        gap = max(0.0, rival_z - own_z) / 100.0

        topic = d.get("top_topic")
        topic_weight = TOPIC_WEIGHTS.get(topic, 0.3) if topic else 0.3
        own_mentions = (d.get("figures", {}).get(figure_id) or {}).get("mentions", 0)
        presence_penalty = 1 - min(1.0, own_mentions / 50.0)

        score = (
            100 * electors_n * undecided
            * (0.5 + gap)
            * (0.5 + topic_weight)
            * (0.5 + 0.5 * presence_penalty)
        )

        why_parts = [
            f"{d['name']}: {d['electors']:,} electores".replace(",", " "),
            f"{round(undecided * 100)} % indecisos en {z}",
        ]
        if rival_id and rival_z > own_z:
            why_parts.append(f"rival {rival_names[rival_id]} +{round(rival_z - own_z, 1)} pts")
        if topic:
            why_parts.append(f"tema: {topic}")
        why_parts.append(f"presencia propia {'baja' if own_mentions < 5 else 'media' if own_mentions < 20 else 'alta'} ({own_mentions} menciones)")

        rows.append({
            "ubigeo": ub,
            "name": d["name"],
            "zone": z,
            "electors": d["electors"],
            "undecided_share": round(undecided, 3),
            "own_strength": round(own_z, 1),
            "rival_strength": round(rival_z, 1),
            "rival_name": rival_names.get(rival_id),
            "topic": topic,
            "topic_weight": topic_weight,
            "own_mentions": own_mentions,
            "score": round(score, 1),
            "why": " · ".join(why_parts),
        })

    rows.sort(key=lambda r: -r["score"])
    for i, r in enumerate(rows, 1):
        r["rank"] = i
    return rows


def event_impact(db: Session, event, figure_id: Optional[str] = None) -> dict:
    """Menciones y sentimiento en el distrito del evento, 48 h antes vs 48 h despues."""
    from sqlalchemy import text as _text

    start = event.start_at
    if start is None:
        return {"error": "El evento no tiene fecha de inicio"}
    if start.tzinfo is not None:
        start = start.astimezone(tz=None).replace(tzinfo=None)

    ubigeo = event.region_code
    before_a, before_b = start - timedelta(hours=48), start
    after_a, after_b = start, start + timedelta(hours=48)

    def window(a, b):
        params = {"a": a, "b": b, "ub": ubigeo}
        fid_sql = ""
        if figure_id:
            fid_sql = " AND figure_id = :fid"
            params["fid"] = figure_id
        row = db.execute(_text(f"""
            SELECT count(DISTINCT content_id) AS n, avg(stance) AS net
            FROM content_classifications
            WHERE content_published_at >= :a AND content_published_at < :b
              AND districts @> CAST(:ub AS jsonb){fid_sql}
        """), {**params, "ub": f'[{{"ubigeo": "{ubigeo}"}}]'}).fetchone()
        return {"mentions": int(row[0] or 0), "net": round(float(row[1]), 3) if row[1] is not None else None}

    before = window(before_a, before_b)
    after = window(after_a, after_b)
    partial = datetime.utcnow() < after_b

    delta_pct = None
    if before["mentions"]:
        delta_pct = round((after["mentions"] - before["mentions"]) / before["mentions"] * 100, 1)
    elif after["mentions"]:
        delta_pct = 100.0

    delta_net = None
    if before["net"] is not None and after["net"] is not None:
        delta_net = round(after["net"] - before["net"], 3)

    return {
        "ubigeo": ubigeo,
        "before": before,
        "after": after,
        "delta_mentions_pct": delta_pct,
        "delta_net": delta_net,
        "partial": partial,
    }
