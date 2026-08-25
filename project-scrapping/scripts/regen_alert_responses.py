"""Regenera la respuesta sugerida de las alertas abiertas con la candidatura propia actual.

Las respuestas se escriben una sola vez, al crear la alerta, y llevan dentro el
encuadre de OWN_CANDIDATE ("nuestra candidatura"). Al cambiar de candidatura esas
respuestas quedan al reves: aconsejan defender a quien ahora es el rival.

Uso:
    python scripts/regen_alert_responses.py --dry-run
    python scripts/regen_alert_responses.py --apply
    python scripts/regen_alert_responses.py --apply --clear-only   # borra sin regenerar
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Alert, PoliticalFigure
from app.services.alert_engine import suggest_response
from app import electoral_config as ec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="escribe en la base")
    ap.add_argument("--dry-run", action="store_true", help="solo lista lo que haria")
    ap.add_argument("--clear-only", action="store_true",
                    help="deja suggested_response en NULL en vez de regenerarla")
    args = ap.parse_args()
    if not args.apply and not args.dry_run:
        ap.error("elige --apply o --dry-run")

    db = SessionLocal()
    try:
        own = db.query(PoliticalFigure).filter(PoliticalFigure.is_own_candidate == True).first()
        own_name = own.display_name if own else (ec.OWN_CANDIDATE or "(sin definir)")
        print(f"candidatura propia: {own_name}")

        alerts = (db.query(Alert)
                  .filter(Alert.status == "open", Alert.suggested_response.isnot(None))
                  .order_by(Alert.created_at.desc()).all())
        print(f"alertas abiertas con respuesta: {len(alerts)}")

        regenerated = cleared = 0
        for a in alerts:
            fig = db.query(PoliticalFigure).filter(PoliticalFigure.id == a.figure_id).first()
            fig_name = fig.display_name if fig else "(desconocida)"
            print(f"  [{a.severity}/{a.kind}] {fig_name}: {(a.title or '')[:60]}")
            if args.dry_run:
                continue
            if args.clear_only:
                a.suggested_response = None
                cleared += 1
                continue
            nueva = suggest_response(
                fig_name, a.kind, a.severity, a.metrics or {},
                (a.metrics or {}).get("top_topic"), a.evidence or [],
            )
            if nueva:
                a.suggested_response = nueva
                regenerated += 1
                print("      -> regenerada")
            else:
                a.suggested_response = None
                cleared += 1
                print("      -> sin clave o fallo: se deja vacia (mejor nada que el encuadre viejo)")
        if args.apply:
            db.commit()
            print(f"listo: {regenerated} regeneradas, {cleared} vaciadas")
    finally:
        db.close()


if __name__ == "__main__":
    main()
