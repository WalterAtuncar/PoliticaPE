import json
import logging
import os
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app import electoral_config as ec
from app.models import PoliticalFigure
from app.services import notify
from app.services.claude_client import get_client, has_key, model

logger = logging.getLogger(__name__)

SPIKE_FACTOR = float(os.getenv("ALERT_SPIKE_FACTOR", "3.0"))
MIN_MENTIONS = int(os.getenv("ALERT_MIN_MENTIONS", "15"))
NEG_SHARE = float(os.getenv("ALERT_NEG_SHARE", "0.6"))
ALERT_ROLES = ("candidate", "incumbent")


def _debate_mode() -> bool:
    return os.getenv("DEBATE_MODE", "false").lower() == "true"


def _params():
    """En modo debate la ventana se acorta y el umbral baja."""
    if _debate_mode():
        return {"window_minutes": 5, "baseline_hours": 2, "min_mentions": max(5, MIN_MENTIONS // 3)}
    return {"window_minutes": 60, "baseline_hours": 24 * 7, "min_mentions": MIN_MENTIONS}


def _severity(kind: str, velocity: float, count: int) -> str:
    if kind == "crisis":
        return "critical" if velocity >= 2 * SPIKE_FACTOR else "high"
    if kind == "attack":
        return "high" if count >= 10 else "medium"
    if kind == "opportunity":
        return "medium"
    return "low"


def _evidence(db: Session, figure_id: str, since: datetime, limit: int = 10) -> List[dict]:
    rows = db.execute(text("""
        SELECT c.content_type, c.content_id, c.summary,
               COALESCE(n.title, left(s.content, 200)) AS snippet,
               COALESCE(n.url, '') AS news_url,
               COALESCE(n.source, s.platform) AS source,
               s.platform, s.post_id, s.author,
               COALESCE((s.engagement_metrics->>'likes')::int, 0) AS likes
        FROM content_classifications c
        LEFT JOIN news_articles n ON c.content_type = 'news' AND n.id::text = c.content_id
        LEFT JOIN raw_social_posts s ON c.content_type = 'social' AND s.id::text = c.content_id
        WHERE c.figure_id = :fid AND c.content_published_at >= :since
        ORDER BY c.relevance DESC NULLS LAST, likes DESC
        LIMIT :lim
    """), {"fid": figure_id, "since": since, "lim": limit}).fetchall()

    out = []
    for r in rows:
        m = r._mapping
        url = m["news_url"] or ""
        if not url and m["platform"] and m["post_id"]:
            if m["platform"] == "twitter":
                url = f"https://twitter.com/{m['author'] or 'i'}/status/{m['post_id']}"
            elif m["platform"] == "youtube":
                url = f"https://www.youtube.com/watch?v={m['post_id']}"
        out.append({
            "content_type": m["content_type"],
            "content_id": m["content_id"],
            "url": url,
            "snippet": (m["snippet"] or m["summary"] or "")[:200],
            "source": m["source"] or "",
        })
    return out


def suggest_response(figure_name: str, kind: str, severity: str, metrics: dict,
                     topic: Optional[str], evidence: List[dict]) -> Optional[str]:
    if not has_key():
        return None
    system = f"""Eres el jefe de prensa de una campana a la alcaldia de Lima Metropolitana (eleccion {ec.ELECTION_DATE.isoformat()}). Recibes una alerta con evidencia (posts o titulares). Redacta en espanol:

1. DIAGNOSTICO (2 lineas): que esta pasando, quien lo impulsa, si es organico o coordinado (indicios: mismos textos, cuentas nuevas, horario).
2. RECOMENDACION (una de: responder ahora / responder en 4 h con datos / no responder y monitorear / derivar a legal) con una razon.
3. DECLARACION SUGERIDA (maximo 60 palabras, en primera persona del candidato, tono firme y sin insultos, con un dato verificable si lo hay en la evidencia).
4. CANAL (X, TikTok, conferencia, nota de prensa, WhatsApp a dirigentes) y quien firma.
5. NO HACER (1-2 lineas).

No inventes hechos. Si la evidencia es insuficiente para una declaracion, di "no emitir declaracion" y explica que dato falta. Respeta que despues del {ec.PROPAGANDA_DEADLINE.isoformat()} no hay propaganda."""

    ev_lines = "\n".join(f"- [{e['source']}] {e['snippet']} ({e['url']})" for e in evidence[:10])
    phase = ec.campaign_phase()
    phase_note = ""
    if phase in ("closing", "election_day"):
        phase_note = ("\nFase: cierre - no se puede hacer propaganda; solo declaraciones "
                      "de prensa y acciones legales.")
    elif phase == "poll_blackout":
        phase_note = "\nFase: veda de encuestas - no cites cifras de encuestas en la declaracion."

    user = f"""Candidatura propia: {ec.OWN_CANDIDATE or '(sin definir)'}{phase_note}
Alerta: {kind} · severidad {severity} · figura afectada: {figure_name}
Metricas: menciones ultima ventana {metrics.get('mentions_1h')} (linea base {metrics.get('baseline_1h')}), proporcion negativa {metrics.get('neg_share')}, velocidad {metrics.get('velocity')}x
Tema dominante: {topic or 'sin determinar'}
Evidencia (hasta 10 items):
{ev_lines}"""

    try:
        response = get_client().messages.create(
            model=model(),
            max_tokens=1500,
            thinking={"type": "adaptive"},
            output_config={"effort": "medium"},
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return "".join(b.text for b in response.content if b.type == "text").strip()
    except Exception as e:
        logger.error(f"[Alerts] no se pudo generar respuesta sugerida: {e}")
        return None


def _insert_alert(db: Session, alert: Dict[str, Any]) -> bool:
    res = db.execute(text("""
        INSERT INTO alerts (id, figure_id, kind, severity, title, detail, metrics, evidence,
                            suggested_response, status, created_at, dedup_key)
        VALUES (:id, :figure_id, :kind, :severity, :title, :detail, CAST(:metrics AS jsonb),
                CAST(:evidence AS jsonb), :suggested, 'open', NOW(), :dedup)
        ON CONFLICT (dedup_key) DO NOTHING
        RETURNING id
    """), {
        "id": str(uuid.uuid4()),
        "figure_id": alert["figure_id"],
        "kind": alert["kind"],
        "severity": alert["severity"],
        "title": alert["title"][:300],
        "detail": alert.get("detail"),
        "metrics": json.dumps(alert.get("metrics") or {}),
        "evidence": json.dumps(alert.get("evidence") or [], ensure_ascii=False),
        "suggested": alert.get("suggested_response"),
        "dedup": alert["dedup_key"],
    }).fetchone()
    db.commit()
    return res is not None


def _notify(alert: Dict[str, Any]) -> None:
    icon = {"crisis": "🚨", "attack": "⚔️", "opportunity": "📈", "spike": "📊"}.get(alert["kind"], "•")
    lines = [
        f"{icon} *{alert['severity'].upper()}* — {alert['title']}",
        alert.get("detail") or "",
    ]
    for e in (alert.get("evidence") or [])[:3]:
        if e.get("url"):
            lines.append(f"· {e['url']}")
    if alert.get("suggested_response"):
        lines.append("")
        lines.append(alert["suggested_response"])
    notify.send_telegram("\n".join(x for x in lines if x))


def run_alert_cycle(db_url: str) -> Dict[str, Any]:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(db_url)
    db = sessionmaker(bind=engine)()
    p = _params()
    now = datetime.utcnow()
    win_start = now - timedelta(minutes=p["window_minutes"])
    base_start = now - timedelta(hours=p["baseline_hours"])
    created = 0
    evaluated = 0

    try:
        figures = (
            db.query(PoliticalFigure)
            .filter(PoliticalFigure.is_active == True)
            .filter(PoliticalFigure.figure_role.in_(ALERT_ROLES))
            .all()
        )

        for f in figures:
            evaluated += 1
            row = db.execute(text("""
                SELECT count(DISTINCT content_id) AS n,
                       count(DISTINCT content_id) FILTER (WHERE stance_label = 'negativo') AS neg,
                       count(DISTINCT content_id) FILTER (WHERE stance_label = 'positivo') AS pos,
                       mode() WITHIN GROUP (ORDER BY topic) AS top_topic
                FROM content_classifications
                WHERE figure_id = :fid AND content_published_at >= :since
            """), {"fid": f.id, "since": win_start}).fetchone()
            n, neg, pos, top_topic = int(row[0] or 0), int(row[1] or 0), int(row[2] or 0), row[3]
            if n < p["min_mentions"]:
                continue

            base_n = int(db.execute(text("""
                SELECT count(DISTINCT content_id) FROM content_classifications
                WHERE figure_id = :fid AND content_published_at >= :a AND content_published_at < :b
            """), {"fid": f.id, "a": base_start, "b": win_start}).scalar() or 0)
            periods = max(1.0, (p["baseline_hours"] * 60) / p["window_minutes"])
            baseline = max(1.0, base_n / periods)
            velocity = round(n / baseline, 2)
            neg_share = round(neg / n, 2) if n else 0.0
            pos_share = round(pos / n, 2) if n else 0.0

            attacks = db.execute(text("""
                SELECT COALESCE(fa.display_name, 'origen no identificado') AS attacker, count(*) AS n
                FROM content_classifications c
                LEFT JOIN political_figures fa ON fa.id = c.attacker_figure_id
                WHERE c.attacked_figure_id = :fid AND c.is_attack AND c.content_published_at >= :since
                GROUP BY 1 ORDER BY 2 DESC LIMIT 1
            """), {"fid": f.id, "since": win_start}).fetchone()

            metrics = {"mentions_1h": n, "baseline_1h": round(baseline, 2),
                       "neg_share": neg_share, "pos_share": pos_share, "velocity": velocity}

            kind = None
            title = detail = ""
            if velocity >= SPIKE_FACTOR and neg_share >= NEG_SHARE:
                kind = "crisis"
                title = f"Pico negativo sobre {f.display_name}: {n} menciones ({velocity}x lo normal)"
                detail = f"{int(neg_share * 100)} % negativas. Tema dominante: {top_topic or 'sin determinar'}."
            elif attacks and int(attacks[1]) >= 5:
                kind = "attack"
                title = f"{attacks[0]} ataca a {f.display_name}: {int(attacks[1])} menciones"
                detail = f"Tema: {top_topic or 'sin determinar'}. Velocidad {velocity}x."
            elif velocity >= SPIKE_FACTOR and pos_share >= 0.6:
                kind = "opportunity"
                title = f"Ola positiva sobre {f.display_name}: {n} menciones ({velocity}x)"
                detail = f"{int(pos_share * 100)} % positivas. Tema: {top_topic or 'sin determinar'}."
            elif velocity >= SPIKE_FACTOR:
                kind = "spike"
                title = f"Pico de conversacion sobre {f.display_name}: {n} menciones ({velocity}x)"
                detail = f"Sin signo dominante. Tema: {top_topic or 'sin determinar'}."

            if not kind:
                continue

            severity = _severity(kind, velocity, int(attacks[1]) if attacks else n)
            evidence = _evidence(db, f.id, win_start)
            suggested = None
            if kind in ("crisis", "attack") and severity in ("high", "critical"):
                suggested = suggest_response(f.display_name, kind, severity, metrics, top_topic, evidence)

            alert = {
                "figure_id": f.id, "kind": kind, "severity": severity, "title": title,
                "detail": detail, "metrics": metrics, "evidence": evidence,
                "suggested_response": suggested,
                "dedup_key": f"{f.id}|{kind}|{now.strftime('%Y-%m-%dT%H')}",
            }
            if _insert_alert(db, alert):
                created += 1
                _notify(alert)
                logger.info(f"[Alerts] {severity} {kind}: {title}")

        return {"evaluated": evaluated, "created": created, "debate_mode": _debate_mode()}
    finally:
        db.close()
