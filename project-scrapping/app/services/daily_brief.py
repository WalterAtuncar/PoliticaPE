import json
import logging
import os
import uuid
from datetime import date, datetime, timedelta
from typing import Any, Dict, Optional
from zoneinfo import ZoneInfo

from sqlalchemy import text
from sqlalchemy.orm import Session

from app import electoral_config as ec
from app.services import notify, race, territory
from app.services.claude_client import get_client, has_key, model

logger = logging.getLogger(__name__)

LIMA = ZoneInfo("America/Lima")
BRIEF_HOUR = int(os.getenv("BRIEF_HOUR_LIMA", "7"))
STRIP_POLLS_IN_EMAIL = os.getenv("BRIEF_EMAIL_STRIP_POLLS", "true").lower() == "true"


def _window(brief_date: date):
    """De ayer BRIEF_HOUR a hoy BRIEF_HOUR, hora de Lima, devuelto en UTC naive."""
    end_local = datetime(brief_date.year, brief_date.month, brief_date.day, BRIEF_HOUR, tzinfo=LIMA)
    start_local = end_local - timedelta(days=1)
    to_utc = lambda d: d.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
    return to_utc(start_local), to_utc(end_local)


def _table_exists(db: Session, name: str) -> bool:
    return bool(db.execute(text("SELECT to_regclass(:n) IS NOT NULL"), {"n": f"public.{name}"}).scalar())


def collect_data(db: Session, brief_date: Optional[date] = None) -> Dict[str, Any]:
    brief_date = brief_date or datetime.now(LIMA).date()
    start, end = _window(brief_date)

    poll_rows = race.polls(db, base="validos", days=120)
    data: Dict[str, Any] = {
        "race_polls": {"average": race.poll_average(poll_rows), "latest": poll_rows[:5]},
        "share_of_voice_7d": race.share_of_voice(db, 7),
        "share_of_voice_1d": race.share_of_voice(db, 1),
        "sentiment_7d": race.sentiment(db, 7),
        "topics_1d": race.topics(db, 1),
        "own_candidate": ec.OWN_CANDIDATE,
        "phase": ec.campaign_phase(),
        "days_to_election": ec.days_to(ec.ELECTION_DATE),
        "days_to_propaganda": ec.days_to(ec.PROPAGANDA_DEADLINE),
        "poll_blackout_from": ec.POLL_BLACKOUT_FROM.isoformat() if ec.POLL_BLACKOUT_FROM else None,
        "window_start": start.isoformat(),
        "window_end": end.isoformat(),
    }

    data["top_items"] = [dict(r._mapping) for r in db.execute(text("""
        SELECT c.content_type, c.summary, c.topic, c.relevance, c.stance, c.zone,
               COALESCE(n.title, left(s.content, 200)) AS title,
               COALESCE(n.url, '') AS url,
               COALESCE(n.source, s.platform) AS source,
               c.content_published_at
        FROM content_classifications c
        LEFT JOIN news_articles n ON c.content_type = 'news' AND n.id::text = c.content_id
        LEFT JOIN raw_social_posts s ON c.content_type = 'social' AND s.id::text = c.content_id
        WHERE c.content_published_at >= :start AND c.content_published_at < :end
        ORDER BY c.relevance DESC NULLS LAST, c.content_published_at DESC
        LIMIT 15
    """), {"start": start, "end": end}).fetchall()]

    data["attacks_1d"] = [dict(r._mapping) for r in db.execute(text("""
        SELECT fa.display_name AS attacker, fd.display_name AS attacked, count(*) AS count,
               max(COALESCE(n.url, '')) AS example_url
        FROM content_classifications c
        JOIN political_figures fd ON fd.id = c.attacked_figure_id
        LEFT JOIN political_figures fa ON fa.id = c.attacker_figure_id
        LEFT JOIN news_articles n ON c.content_type = 'news' AND n.id::text = c.content_id
        WHERE c.is_attack AND c.content_published_at >= :start
        GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 10
    """), {"start": start}).fetchall()]

    districts = territory.district_stats(db, days=7)
    data["territory_delta"] = sorted(districts, key=lambda d: -d["mentions"])[:5]

    data["open_alerts"] = []
    if _table_exists(db, "alerts"):
        data["open_alerts"] = [dict(r._mapping) for r in db.execute(text("""
            SELECT kind, severity, title, created_at FROM alerts
            WHERE status = 'open' ORDER BY created_at DESC LIMIT 10
        """)).fetchall()]

    data["events_yesterday"] = []
    if _table_exists(db, "events") or True:
        try:
            data["events_yesterday"] = [dict(r._mapping) for r in db.execute(text("""
                SELECT title, event_type, region_code, start_at, actual_attendance
                FROM organization.events
                WHERE start_at >= :start AND start_at < :end
                ORDER BY start_at LIMIT 10
            """), {"start": start, "end": end}).fetchall()]
        except Exception:
            data["events_yesterday"] = []

    return data


SYSTEM_TEMPLATE = """Eres el jefe de analisis de una campana a la alcaldia de Lima Metropolitana (eleccion: 4 de octubre de 2026, una sola vuelta). Cada manana redactas un brief de UNA pagina para el jefe de campana, el jefe de prensa y el responsable territorial. Escribes en espanol, directo, sin adjetivos vacios, con cifras. No inventas datos: todo lo que afirmes debe salir del JSON que recibes, y cada afirmacion cuantitativa lleva la cifra y la fuente (prensa/redes/encuesta). Si un dato no esta, dices "sin datos" y sigues.

Candidatura propia: {own_candidate}
Fase de campana hoy: {phase}. Dias para la eleccion: {days_to_election}. Dias para el cierre de propaganda: {days_to_propaganda}. Veda de encuestas desde: {poll_blackout_from}.

Estructura obligatoria (usa estos encabezados, en este orden):
# <titular de una linea con el hecho mas importante de ayer>
## Que paso ayer (3-5 vinetas, cada una con fuente y cifra)
## Tema del dia (el tema municipal con mas volumen en 24 h y su variacion vs. la semana; que candidato lo esta capitalizando)
## Carrera (promedio de encuestas con banda, share of voice prensa/redes, sentimiento neto; cambios relevantes; en veda: solo indicadores propios y recuerdalo explicitamente)
## Territorio (zonas/distritos donde subio o bajo la conversacion sobre nosotros o el rival principal; 2-3 lineas)
## Alertas abiertas (lista de alertas con severidad; si no hay, "Ninguna")
## Tres decisiones para hoy (numeradas: accion concreta, responsable sugerido - prensa/territorio/digital/candidato -, y que dato la justifica)
## Riesgos (1-3 lineas)

Maximo 550 palabras. Nada de introducciones ni despedidas."""


POSTELECTORAL_EXTRA = """
ATENCION: este NO es el brief diario, es el INFORME POST-ELECTORAL. Ignora la estructura anterior y usa esta:
# <titular con el resultado>
## Resultado global (votos y porcentaje por lista, actas contabilizadas)
## Resultado por zona (las cinco zonas de Lima)
## Donde acertamos y donde no (usa vs_opportunity: correlacion de Spearman, distritos de alto score que ganamos y los que no)
## Que explico la diferencia (temas, ataques y alertas de la ultima semana)
## Lecciones para la gestion o la oposicion
Maximo 700 palabras."""


def build_prompts(data: Dict[str, Any], brief_date: date, kind: str = "daily"):
    own = data.get("own_candidate") or ""
    system = SYSTEM_TEMPLATE.format(
        own_candidate=own if own else "(sin definir: escribe el brief en modo observador comparando a los tres punteros)",
        phase=data.get("phase"),
        days_to_election=data.get("days_to_election"),
        days_to_propaganda=data.get("days_to_propaganda"),
        poll_blackout_from=data.get("poll_blackout_from"),
    )
    if data.get("phase") in ("poll_blackout", "closing", "election_day"):
        system += "\n\nATENCION: rige la veda de publicacion de encuestas. Encabeza el brief con la linea `> VEDA DE ENCUESTAS - uso interno. No difundir cifras.`"
    if kind == "postelectoral":
        system += "\n" + POSTELECTORAL_EXTRA

    user = (
        f"Fecha del brief: {brief_date.isoformat()} "
        f"(datos de {data.get('window_start')} a {data.get('window_end')}, UTC)\n\n"
        f"DATOS (JSON):\n{json.dumps(data, ensure_ascii=False, default=str)}"
    )
    return system, user


def _strip_polls_section(markdown: str) -> str:
    lines = markdown.split("\n")
    out, skipping = [], False
    for ln in lines:
        if ln.startswith("## "):
            skipping = ln.strip().lower().startswith("## carrera")
        if not skipping:
            out.append(ln)
    return "\n".join(out)


def generate(db: Session, brief_date: Optional[date] = None, send: bool = False,
             force: bool = False, kind: str = "daily") -> Dict[str, Any]:
    brief_date = brief_date or datetime.now(LIMA).date()
    if kind == "postelectoral":
        brief_date = ec.ELECTION_DATE + timedelta(days=1)

    existing = db.execute(text("SELECT * FROM daily_briefs WHERE brief_date = :d"), {"d": brief_date}).fetchone()
    if existing and not force and not send:
        return dict(existing._mapping)

    if not has_key():
        raise RuntimeError("ANTHROPIC_API_KEY no esta configurada")

    data = collect_data(db, brief_date)
    data["kind"] = kind
    if kind == "postelectoral":
        try:
            from app.models import PoliticalFigure
            from app.services import results as results_service
            own = db.query(PoliticalFigure).filter(PoliticalFigure.is_own_candidate == True).first()
            source = db.execute(text(
                "SELECT source FROM election_results ORDER BY loaded_at DESC LIMIT 1"
            )).scalar() or "onpe"
            data["results"] = results_service.summary(db, source)
            if own:
                data["vs_opportunity"] = results_service.vs_opportunity(db, own.id, source)
        except Exception as e:
            logger.warning(f"[Brief] resultados no disponibles: {e}")
            data["results"] = {}
    system, user = build_prompts(data, brief_date, kind)
    model_name = model()

    response = get_client().messages.create(
        model=model_name,
        max_tokens=4000,
        thinking={"type": "adaptive"},
        output_config={"effort": "high"},
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    body = "".join(b.text for b in response.content if b.type == "text").strip()
    headline = next((ln.lstrip("# ").strip() for ln in body.split("\n") if ln.startswith("# ")), "")[:300]

    channels = {"telegram": False, "email": False}
    if send:
        channels["telegram"] = notify.send_telegram(body)
        email_body = _strip_polls_section(body) if (STRIP_POLLS_IN_EMAIL and not ec.polls_publishable()) else body
        channels["email"] = notify.send_email(f"Brief Lima 2026 — {brief_date.isoformat()}", email_body)

    db.execute(text("""
        INSERT INTO daily_briefs (id, brief_date, generated_at, model, headline, body_markdown, data, sent_channels, status)
        VALUES (:id, :d, NOW(), :model, :headline, :body, CAST(:data AS jsonb), CAST(:channels AS jsonb), :status)
        ON CONFLICT (brief_date) DO UPDATE SET
            generated_at = NOW(), model = EXCLUDED.model, headline = EXCLUDED.headline,
            body_markdown = EXCLUDED.body_markdown, data = EXCLUDED.data,
            sent_channels = EXCLUDED.sent_channels, status = EXCLUDED.status
    """), {
        "id": str(uuid.uuid4()), "d": brief_date, "model": model_name,
        "headline": headline, "body": body,
        "data": json.dumps(data, ensure_ascii=False, default=str),
        "channels": json.dumps(channels),
        "status": "sent" if any(channels.values()) else "generated",
    })
    db.commit()

    row = db.execute(text("SELECT * FROM daily_briefs WHERE brief_date = :d"), {"d": brief_date}).fetchone()
    return dict(row._mapping)


def latest(db: Session) -> Optional[Dict[str, Any]]:
    row = db.execute(text("SELECT * FROM daily_briefs ORDER BY brief_date DESC LIMIT 1")).fetchone()
    return dict(row._mapping) if row else None
