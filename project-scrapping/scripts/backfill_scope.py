import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal
from app.models import NewsArticle, RawSocialPost
from app.services.lima_geo import detect_scope, figure_keywords

BATCH = 500


def backfill(db, model, title_attr, content_attr, keywords, label):
    total = 0
    lima = 0
    while True:
        rows = db.query(model).filter(model.scope.is_(None)).limit(BATCH).all()
        if not rows:
            break
        for row in rows:
            title = getattr(row, title_attr, "") or "" if title_attr else ""
            content = getattr(row, content_attr, "") or ""
            scope, districts = detect_scope(title, content, keywords)
            row.scope = scope
            row.districts = districts or None
            if scope == "lima_metropolitana":
                lima += 1
            total += 1
        db.commit()
        print(f"  {label}: {total} procesados ({lima} Lima)")
    return total, lima


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", choices=["news", "social", "all"], default="all")
    args = ap.parse_args()

    db = SessionLocal()
    try:
        keywords = figure_keywords(db)
        print(f"keywords de figuras activas: {len(keywords)}")
        if args.only in ("news", "all"):
            n, l = backfill(db, NewsArticle, "title", "content", keywords, "noticias")
            print(f"noticias: {n} procesadas, {l} de Lima Metropolitana")
        if args.only in ("social", "all"):
            n, l = backfill(db, RawSocialPost, None, "content", keywords, "posts")
            print(f"posts: {n} procesados, {l} de Lima Metropolitana")
    finally:
        db.close()


if __name__ == "__main__":
    main()
