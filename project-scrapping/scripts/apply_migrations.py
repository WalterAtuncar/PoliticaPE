import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import _get_engine

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "db" / "migrations" / "lima2026"


def main():
    engine = _get_engine()

    with engine.begin() as conn:
        conn.exec_driver_sql("""
            CREATE TABLE IF NOT EXISTS public.schema_migrations (
                filename VARCHAR(200) PRIMARY KEY,
                applied_at TIMESTAMP DEFAULT NOW()
            )
        """)

    with engine.connect() as conn:
        applied = {r[0] for r in conn.exec_driver_sql("SELECT filename FROM public.schema_migrations")}

    params = {"own_party_slug": os.getenv("OWN_PARTY_SLUG", "")}
    failed = False

    for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
        if path.name in applied:
            print(f"skip    {path.name}")
            continue
        sql = path.read_text(encoding="utf-8")
        try:
            with engine.begin() as conn:
                if "%(own_party_slug)s" in sql:
                    conn.exec_driver_sql(sql, params)
                else:
                    conn.exec_driver_sql(sql)
                conn.exec_driver_sql(
                    "INSERT INTO public.schema_migrations (filename) VALUES (%(f)s)", {"f": path.name}
                )
            print(f"applied {path.name}")
        except Exception as e:
            print(f"FAILED  {path.name}: {e}")
            failed = True
            break

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
