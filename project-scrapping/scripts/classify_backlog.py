import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings
from app.services.claude_client import has_key
from app.services.classifier import run_classification_cycle


def main():
    ap = argparse.ArgumentParser(description="Clasifica el backlog de contenido sin clasificar")
    ap.add_argument("--max", type=int, default=600, help="maximo de contenidos a clasificar")
    ap.add_argument("--respect-daily-limit", action="store_true",
                    help="respetar CLASSIFY_DAILY_LIMIT (por defecto se ignora en el backfill)")
    args = ap.parse_args()

    if not has_key():
        print("ANTHROPIC_API_KEY no esta configurada. Nada que hacer.")
        sys.exit(2)

    result = run_classification_cycle(
        settings.DATABASE_URL,
        max_items=args.max,
        ignore_daily_limit=not args.respect_daily_limit,
    )
    print(result)


if __name__ == "__main__":
    main()
