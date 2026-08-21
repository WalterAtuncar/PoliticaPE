import argparse
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal
from app.services import results as results_service


def num(v):
    v = (v or "").strip().replace(",", ".")
    try:
        return float(v) if v else None
    except ValueError:
        return None


def main():
    ap = argparse.ArgumentParser(description="Carga resultados electorales desde un CSV")
    ap.add_argument("--file", required=True, help="CSV con columnas ubigeo,distrito,lista,votos,pct_validos,actas_pct")
    ap.add_argument("--source", default="manual")
    args = ap.parse_args()

    rows = []
    with open(args.file, encoding="utf-8-sig", newline="") as fh:
        for r in csv.DictReader(fh):
            low = {k.strip().lower(): (v or "").strip() for k, v in r.items() if k}
            votes = num(low.get("votos"))
            rows.append({
                "ubigeo": low.get("ubigeo"),
                "district_name": low.get("distrito"),
                "list_name": low.get("lista"),
                "votes": int(votes) if votes is not None else None,
                "pct_valid": num(low.get("pct_validos")),
                "actas_pct": num(low.get("actas_pct")),
            })

    db = SessionLocal()
    try:
        saved = results_service.upsert_results(db, rows, args.source)
        print(f"{saved} filas cargadas con source='{args.source}'")
    finally:
        db.close()


if __name__ == "__main__":
    main()
