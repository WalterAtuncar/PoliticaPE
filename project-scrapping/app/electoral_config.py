import os
from datetime import date
from typing import Optional


def _d(name: str, default: str) -> Optional[date]:
    raw = os.getenv(name, default).strip()
    return date.fromisoformat(raw) if raw else None


ELECTION_NAME = os.getenv("ELECTION_NAME", "Elecciones Municipales de Lima Metropolitana 2026")
ELECTION_TYPE = os.getenv("ELECTION_TYPE", "municipal")
ELECTORAL_DISTRICT = os.getenv("ELECTORAL_DISTRICT", "Lima Metropolitana")
ELECTION_ROUNDS = int(os.getenv("ELECTION_ROUNDS", "1"))
OWN_CANDIDATE = os.getenv("OWN_CANDIDATE", "").strip()

ELECTION_DATE = _d("ELECTION_DATE", "2026-10-04")
CANDIDACY_FINAL_DATE = _d("CANDIDACY_FINAL_DATE", "2026-09-05")
POLL_BLACKOUT_FROM = _d("POLL_BLACKOUT_FROM", "2026-09-28")
RALLY_DEADLINE = _d("RALLY_DEADLINE", "2026-10-01")
PROPAGANDA_DEADLINE = _d("PROPAGANDA_DEADLINE", "2026-10-02")
DEBATE_DATE = _d("DEBATE_DATE", "")

MESES_ES = {1: "enero", 2: "febrero", 3: "marzo", 4: "abril", 5: "mayo", 6: "junio",
            7: "julio", 8: "agosto", 9: "septiembre", 10: "octubre", 11: "noviembre", 12: "diciembre"}


def fmt_es(d: Optional[date]) -> str:
    return f"{d.day} de {MESES_ES[d.month]} de {d.year}" if d else "por confirmar"


def days_to(d: Optional[date], today: Optional[date] = None) -> Optional[int]:
    if d is None:
        return None
    today = today or date.today()
    return (d - today).days


def campaign_phase(today: Optional[date] = None) -> str:
    """pre | campaign | poll_blackout | closing | election_day | post"""
    today = today or date.today()
    if today > ELECTION_DATE:
        return "post"
    if today == ELECTION_DATE:
        return "election_day"
    if today > PROPAGANDA_DEADLINE:
        return "closing"
    if POLL_BLACKOUT_FROM and today >= POLL_BLACKOUT_FROM:
        return "poll_blackout"
    if CANDIDACY_FINAL_DATE and today < CANDIDACY_FINAL_DATE:
        return "pre"
    return "campaign"


def polls_publishable(today: Optional[date] = None) -> bool:
    today = today or date.today()
    return not (POLL_BLACKOUT_FROM and POLL_BLACKOUT_FROM <= today <= ELECTION_DATE)


def propaganda_allowed(today: Optional[date] = None) -> bool:
    today = today or date.today()
    return today <= PROPAGANDA_DEADLINE


def rallies_allowed(today: Optional[date] = None) -> bool:
    today = today or date.today()
    return today <= RALLY_DEADLINE


def as_dict(today: Optional[date] = None) -> dict:
    today = today or date.today()
    return {
        "election_name": ELECTION_NAME,
        "election_type": ELECTION_TYPE,
        "electoral_district": ELECTORAL_DISTRICT,
        "rounds": ELECTION_ROUNDS,
        "own_candidate": OWN_CANDIDATE,
        "election_date": ELECTION_DATE.isoformat(),
        "candidacy_final_date": CANDIDACY_FINAL_DATE.isoformat() if CANDIDACY_FINAL_DATE else None,
        "poll_blackout_from": POLL_BLACKOUT_FROM.isoformat() if POLL_BLACKOUT_FROM else None,
        "rally_deadline": RALLY_DEADLINE.isoformat(),
        "propaganda_deadline": PROPAGANDA_DEADLINE.isoformat(),
        "debate_date": DEBATE_DATE.isoformat() if DEBATE_DATE else None,
        "today": today.isoformat(),
        "phase": campaign_phase(today),
        "days_to_election": days_to(ELECTION_DATE, today),
        "days_to_propaganda_deadline": days_to(PROPAGANDA_DEADLINE, today),
        "days_to_poll_blackout": days_to(POLL_BLACKOUT_FROM, today),
        "days_to_candidacy_final": days_to(CANDIDACY_FINAL_DATE, today),
        "polls_publishable": polls_publishable(today),
        "propaganda_allowed": propaganda_allowed(today),
        "rallies_allowed": rallies_allowed(today),
    }
