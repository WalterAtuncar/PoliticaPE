import argparse
import json
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal
from app.models import PoliticalFigure, SearchTag
from app.api.endpoints.political_figures import sync_keywords_to_tags

DEFAULT_FILE = Path(__file__).resolve().parents[2] / "docs" / "plan-lima-2026" / "referencia" / "candidatos-lima-2026.json"
PLATFORMS = ["twitter", "youtube", "instagram", "facebook"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", default=str(DEFAULT_FILE))
    ap.add_argument("--own", default="", help="display_name de la candidatura propia (OWN_CANDIDATE)")
    ap.add_argument("--include-unverified-socials", action="store_true",
                    help="incluir cuentas marcadas verify=true (por defecto se omiten)")
    args = ap.parse_args()

    data = json.loads(Path(args.file).read_text(encoding="utf-8"))
    db = SessionLocal()
    created = updated = 0
    try:
        for f in data["figures"]:
            socials = [
                {"platform": s["platform"], "handle": s["handle"], "profile_url": s.get("profile_url", "")}
                for s in f.get("social_accounts", [])
                if args.include_unverified_socials or not s.get("verify")
            ]
            fig = db.query(PoliticalFigure).filter(PoliticalFigure.full_name == f["full_name"]).first()
            if not fig:
                fig = PoliticalFigure(id=str(uuid.uuid4()), full_name=f["full_name"])
                db.add(fig)
                created += 1
            else:
                updated += 1
            fig.display_name = f["display_name"]
            fig.nickname = f.get("nickname")
            fig.party_name = f.get("party_name")
            fig.current_position = f.get("current_position")
            fig.region = f.get("region")
            fig.search_keywords = f["search_keywords"]
            fig.social_accounts = socials
            fig.is_active = True
            fig.monitoring_priority = f.get("monitoring_priority", "medium")
            fig.notes = f.get("notes")
            fig.figure_role = f.get("figure_role", "candidate")
            fig.list_name = f.get("list_name")
            fig.color = f.get("color")
            fig.is_own_candidate = bool(args.own) and f["display_name"] == args.own
            db.commit()
            sync_keywords_to_tags(db, f["search_keywords"], PLATFORMS)

        deactivated = 0
        for tag_text in data.get("deactivate_search_tags", []):
            tag = db.query(SearchTag).filter(SearchTag.tag == tag_text).first()
            if tag and tag.is_active:
                tag.is_active = False
                deactivated += 1
        db.commit()
        print(f"figures created={created} updated={updated}; tags deactivated={deactivated}")
        if args.own:
            n = db.query(PoliticalFigure).filter(PoliticalFigure.is_own_candidate == True).count()
            print(f"own candidate '{args.own}': {n} figura(s) marcada(s)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
