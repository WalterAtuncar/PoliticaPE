import math
from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models import PoliticalFigure, ScrapedSurvey
from app.services.classifier import TOPIC_LABELS

# Semivida del peso de una encuesta en el promedio ponderado.
HALF_LIFE_DAYS = 14
AVERAGE_WINDOW_DAYS = 35
RACE_ROLES = ("candidate", "incumbent")


def _figures(db: Session, roles=RACE_ROLES) -> List[PoliticalFigure]:
    return (
        db.query(PoliticalFigure)
        .filter(PoliticalFigure.is_active == True)
        .filter(PoliticalFigure.figure_role.in_(roles))
        .all()
    )


def _figure_id_by_name(db: Session) -> Dict[str, str]:
    out = {}
    for f in db.query(PoliticalFigure).filter(PoliticalFigure.is_active == True).all():
        out[f.display_name.strip().lower()] = f.id
    return out


def polls(db: Session, base: str = "validos", days: int = 120) -> List[dict]:
    since = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(ScrapedSurvey)
        .filter(ScrapedSurvey.published_at >= since)
        .order_by(ScrapedSurvey.published_at.desc())
        .all()
    )
    name_to_id = _figure_id_by_name(db)
    out = []
    for s in rows:
        r = s.results if isinstance(s.results, dict) else {}
        if r.get("ambito") != "lima_metropolitana":
            continue
        if base and r.get("base") != base:
            continue
        candidates = []
        for c in (r.get("candidatos") or []):
            name = c.get("candidato")
            if not name:
                continue
            candidates.append({
                "name": name,
                "figure_id": name_to_id.get(name.strip().lower()),
                "pct": c.get("porcentaje"),
            })
        out.append({
            "id": str(s.id),
            "pollster": s.pollster or s.source,
            "source": s.source,
            "field_dates": s.field_dates,
            "published_at": s.published_at.isoformat() if s.published_at else None,
            "sample_size": s.sample_size,
            "margin_error": s.margin_error,
            "base": r.get("base"),
            "candidates": candidates,
            "undecided": r.get("indecisos"),
            "blank": r.get("blanco_viciado"),
            "manual": bool(r.get("manual")),
        })
    return out


def poll_average(poll_rows: List[dict], today: Optional[date] = None) -> List[dict]:
    """Promedio ponderado por tamano de muestra y antiguedad, con banda de confianza."""
    today = today or date.today()
    acc: Dict[str, dict] = defaultdict(lambda: {"w": 0.0, "w2": 0.0, "wp": 0.0, "n": 0, "samples": [], "figure_id": None})

    for p in poll_rows:
        if not p.get("published_at"):
            continue
        pub = datetime.fromisoformat(p["published_at"]).date()
        age = (today - pub).days
        if age < 0 or age > AVERAGE_WINDOW_DAYS:
            continue
        sample = p.get("sample_size") or 400
        w = math.sqrt(sample) * (0.5 ** (age / HALF_LIFE_DAYS))
        for c in p["candidates"]:
            if c["pct"] is None:
                continue
            a = acc[c["name"]]
            a["w"] += w
            a["w2"] += w * w
            a["wp"] += w * c["pct"]
            a["n"] += 1
            a["samples"].append(sample)
            a["figure_id"] = a["figure_id"] or c.get("figure_id")

    out = []
    for name, a in acc.items():
        if a["w"] <= 0:
            continue
        pct = a["wp"] / a["w"]
        n_eff = (a["w"] ** 2) / a["w2"] if a["w2"] else 1.0
        mean_sample = sum(a["samples"]) / len(a["samples"])
        n_eff_sample = max(1.0, n_eff * mean_sample)
        margin = 1.96 * math.sqrt(max(pct, 0.01) * (100 - min(pct, 99.99)) / n_eff_sample)
        out.append({
            "name": name,
            "figure_id": a["figure_id"],
            "pct": round(pct, 1),
            "low": round(max(0.0, pct - margin), 1),
            "high": round(min(100.0, pct + margin), 1),
            "n_polls": a["n"],
        })
    out.sort(key=lambda x: -x["pct"])
    return out


def _counts(db: Session, since: datetime, until: Optional[datetime] = None) -> List[tuple]:
    until = until or datetime.utcnow()
    return db.execute(text("""
        SELECT figure_id, content_type, count(DISTINCT content_id) AS n
        FROM content_classifications
        WHERE figure_id IS NOT NULL
          AND content_published_at >= :since AND content_published_at < :until
        GROUP BY 1, 2
    """), {"since": since, "until": until}).fetchall()


def share_of_voice(db: Session, days: int = 7) -> List[dict]:
    now = datetime.utcnow()
    since = now - timedelta(days=days)
    prev_since = since - timedelta(days=days)

    cur = defaultdict(lambda: {"news": 0, "social": 0})
    for fid, ctype, n in _counts(db, since):
        cur[fid]["news" if ctype == "news" else "social"] += n
    prev = defaultdict(int)
    for fid, _ctype, n in _counts(db, prev_since, since):
        prev[fid] += n

    figures = {f.id: f for f in _figures(db)}
    total = sum(v["news"] + v["social"] for k, v in cur.items() if k in figures) or 1

    out = []
    for fid, f in figures.items():
        c = cur.get(fid, {"news": 0, "social": 0})
        tot = c["news"] + c["social"]
        p = prev.get(fid, 0)
        out.append({
            "figure_id": fid,
            "name": f.display_name,
            "party_name": f.party_name,
            "color": f.color,
            "news_mentions": c["news"],
            "social_mentions": c["social"],
            "total": tot,
            "share_pct": round(tot / total * 100, 1),
            "trend_pct": round((tot - p) / p * 100, 1) if p else (100.0 if tot else 0.0),
        })
    out.sort(key=lambda x: -x["total"])
    return out


def sentiment(db: Session, days: int = 7, zone: Optional[str] = None) -> List[dict]:
    since = datetime.utcnow() - timedelta(days=days)
    params = {"since": since}
    zone_sql = ""
    if zone:
        zone_sql = " AND zone = :zone"
        params["zone"] = zone

    rows = db.execute(text(f"""
        SELECT figure_id, stance_label, zone, count(*) AS n
        FROM content_classifications
        WHERE figure_id IS NOT NULL AND content_published_at >= :since{zone_sql}
        GROUP BY 1, 2, 3
    """), params).fetchall()

    figures = {f.id: f for f in _figures(db)}
    agg = defaultdict(lambda: {"positivo": 0, "neutro": 0, "negativo": 0,
                               "by_zone": defaultdict(lambda: {"pos": 0, "neg": 0, "n": 0})})
    for fid, label, z, n in rows:
        if fid not in figures or not label:
            continue
        a = agg[fid]
        a[label] = a.get(label, 0) + n
        if z:
            zz = a["by_zone"][z]
            zz["n"] += n
            if label == "positivo":
                zz["pos"] += n
            elif label == "negativo":
                zz["neg"] += n

    out = []
    for fid, f in figures.items():
        a = agg.get(fid)
        if not a:
            out.append({"figure_id": fid, "name": f.display_name, "color": f.color,
                        "positive": 0, "neutral": 0, "negative": 0, "total": 0,
                        "net_sentiment": None, "by_zone": {}})
            continue
        total = a["positivo"] + a["neutro"] + a["negativo"]
        by_zone = {
            z: {"n": v["n"], "net": round((v["pos"] - v["neg"]) / v["n"], 3) if v["n"] else None}
            for z, v in a["by_zone"].items()
        }
        out.append({
            "figure_id": fid,
            "name": f.display_name,
            "color": f.color,
            "positive": a["positivo"],
            "neutral": a["neutro"],
            "negative": a["negativo"],
            "total": total,
            "net_sentiment": round((a["positivo"] - a["negativo"]) / total, 3) if total else None,
            "by_zone": by_zone,
        })
    out.sort(key=lambda x: -x["total"])
    return out


def topics(db: Session, days: int = 1) -> List[dict]:
    now = datetime.utcnow()
    since = now - timedelta(days=days)
    prev_since = since - timedelta(days=days)

    def counts(a, b):
        return {r[0]: r[1] for r in db.execute(text("""
            SELECT topic, count(DISTINCT content_id) FROM content_classifications
            WHERE content_published_at >= :a AND content_published_at < :b
            GROUP BY 1
        """), {"a": a, "b": b}).fetchall()}

    cur = counts(since, now)
    prev = counts(prev_since, since)
    total = sum(cur.values()) or 1

    nets = {r[0]: (float(r[1]) if r[1] is not None else None) for r in db.execute(text("""
        SELECT topic, avg(stance) FROM content_classifications
        WHERE content_published_at >= :since AND stance IS NOT NULL GROUP BY 1
    """), {"since": since}).fetchall()}

    tops = {}
    for topic, fid, n in db.execute(text("""
        SELECT topic, figure_id, count(DISTINCT content_id) n FROM content_classifications
        WHERE content_published_at >= :since AND figure_id IS NOT NULL
        GROUP BY 1, 2 ORDER BY 1, 3 DESC
    """), {"since": since}).fetchall():
        tops.setdefault(topic, (fid, n))

    fig_names = {f.id: f.display_name for f in db.query(PoliticalFigure).all()}

    out = []
    for topic, n in sorted(cur.items(), key=lambda kv: -kv[1]):
        p = prev.get(topic, 0)
        top_fid = tops.get(topic, (None, 0))[0]
        out.append({
            "topic": topic,
            "label": TOPIC_LABELS.get(topic, topic),
            "mentions": n,
            "share_pct": round(n / total * 100, 1),
            "delta_vs_prev_pct": round((n - p) / p * 100, 1) if p else (100.0 if n else 0.0),
            "net_sentiment": round(nets[topic], 3) if nets.get(topic) is not None else None,
            "top_figure": fig_names.get(top_fid) if top_fid else None,
        })
    return out
