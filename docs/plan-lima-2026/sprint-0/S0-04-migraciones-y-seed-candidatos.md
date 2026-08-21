# S0-04 — Runner de migraciones, columnas nuevas y seed de figuras políticas

**Objetivo:** tener un mecanismo repetible para cambiar el esquema sin Alembic, aplicar la migración 001, y poblar `political_figures` con las 24 figuras de `referencia/candidatos-lima-2026.json` (21 candidatos + alcalde + MML + Presidencia), desactivando los tags presidenciales.

**Precondiciones:** S0-03 (el seed no lo necesita, pero el orden evita conflictos de commit).

**Archivos a tocar:**
- nuevo `db/migrations/lima2026/001_political_figures_lima.sql` (copiar de `referencia/migraciones/`)
- nuevo `project-scrapping/scripts/__init__.py` (vacío), `project-scrapping/scripts/apply_migrations.py`, `project-scrapping/scripts/seed_lima_2026.py`
- `project-scrapping/app/models.py` (clase `PoliticalFigure`)
- `project-scrapping/app/schemas.py` (`PoliticalFigureCreate/Update/Response`)
- `project-react/src/types/recommendations.ts` (`PoliticalFigure`)
- `project-react/src/components/recommendations/PoliticalFiguresManager.tsx` y `FiguresPanel.tsx` solo si muestran campos por lista explícita (añadir `figure_role` y `list_name` al formulario/tarjeta es opcional; mínimo: que no rompan).

## Pasos

1. `mkdir -p db/migrations/lima2026 && cp docs/plan-lima-2026/referencia/migraciones/001_political_figures_lima.sql db/migrations/lima2026/`
2. Crear `project-scrapping/scripts/apply_migrations.py`:
   ```python
   import os
   import sys
   from pathlib import Path

   sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

   from sqlalchemy import text
   from app.database import SessionLocal

   MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "db" / "migrations" / "lima2026"


   def main():
       db = SessionLocal()
       try:
           db.execute(text("""
               CREATE TABLE IF NOT EXISTS public.schema_migrations (
                   filename VARCHAR(200) PRIMARY KEY,
                   applied_at TIMESTAMP DEFAULT NOW()
               )
           """))
           db.commit()
           applied = {r[0] for r in db.execute(text("SELECT filename FROM public.schema_migrations"))}
           params = {"own_party_slug": os.getenv("OWN_PARTY_SLUG", "")}
           for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
               if path.name in applied:
                   print(f"skip    {path.name}")
                   continue
               sql = path.read_text(encoding="utf-8")
               try:
                   db.execute(text(sql), params)
                   db.execute(text("INSERT INTO public.schema_migrations (filename) VALUES (:f)"), {"f": path.name})
                   db.commit()
                   print(f"applied {path.name}")
               except Exception as e:
                   db.rollback()
                   print(f"FAILED  {path.name}: {e}")
                   sys.exit(1)
       finally:
           db.close()


   if __name__ == "__main__":
       main()
   ```
   Nota: `text(sql)` con varias sentencias separadas por `;` funciona en psycopg2 cuando no hay parámetros en las sentencias que no los usan; la 006 usa `:own_party_slug` y la misma llamada lo resuelve. Si una migración fallara por `:` dentro de un literal (p. ej. `'{"ambito": ...}'`), escapar como `\:` — la 001 usa `'{"ambito": "presidencial_2026"}'` con dos puntos dentro de comillas; SQLAlchemy solo interpreta `:palabra` seguida de identificador; `: "` no es parámetro. Verificar con el criterio 1.
3. Ejecutar: `cd project-scrapping && python scripts/apply_migrations.py` → `applied 001_political_figures_lima.sql`.
4. `models.py`, clase `PoliticalFigure`, añadir tras `notes`:
   ```python
   figure_role = Column(String(30), default='candidate')
   is_own_candidate = Column(Boolean, default=False)
   list_name = Column(String(200), nullable=True)
   color = Column(String(20), nullable=True)
   zone_strength = Column(JSON, nullable=True)
   ```
5. `schemas.py`: en `PoliticalFigureCreate` añadir `figure_role: str = "candidate"`, `is_own_candidate: bool = False`, `list_name: Optional[str] = None`, `color: Optional[str] = None`, `zone_strength: Optional[Dict[str, Any]] = None`; en `Update` las mismas como `Optional[...] = None`; en `Response` como opcionales. En `political_figures.py` `create_figure`, pasar los cinco campos nuevos al constructor.
6. `types/recommendations.ts`, interfaz `PoliticalFigure`: añadir `figure_role?: 'candidate' | 'incumbent' | 'national_actor' | 'institution'; is_own_candidate?: boolean; list_name?: string; color?: string; zone_strength?: Record<string, number>;`.
7. Crear `project-scrapping/scripts/seed_lima_2026.py`:
   ```python
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
       ap.add_argument("--skip-unverified-socials", action="store_true", default=True)
       args = ap.parse_args()

       data = json.loads(Path(args.file).read_text(encoding="utf-8"))
       db = SessionLocal()
       created = updated = 0
       try:
           for f in data["figures"]:
               socials = [
                   {"platform": s["platform"], "handle": s["handle"], "profile_url": s.get("profile_url", "")}
                   for s in f.get("social_accounts", [])
                   if not (args.skip_unverified_socials and s.get("verify"))
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

           for tag_text in data.get("deactivate_search_tags", []):
               tag = db.query(SearchTag).filter(SearchTag.tag == tag_text).first()
               if tag:
                   tag.is_active = False
           db.commit()
           print(f"figures created={created} updated={updated}; tags deactivated={len(data.get('deactivate_search_tags', []))}")
       finally:
           db.close()


   if __name__ == "__main__":
       main()
   ```
8. **Verificar cuentas sociales** marcadas `"verify": true` en el JSON: para cada una, una búsqueda web `"<nombre>" cuenta oficial X` o la página del partido. Si se confirma, quitar `"verify": true` del JSON (edita `referencia/candidatos-lima-2026.json`); si no, borrar esa entrada de `social_accounts`. Añade handles de TikTok/Facebook solo si los confirmas. El seed ignora las no verificadas, así que puedes correrlo antes y re-correrlo después (es idempotente por `full_name`).
9. Ejecutar: `cd project-scrapping && python scripts/seed_lima_2026.py --own "$OWN_CANDIDATE"` (si `OWN_CANDIDATE` está vacío, sin `--own`).
10. Revisar que el frontend "Recomendaciones → Figuras" lista 24 figuras sin error (`PoliticalFiguresManager.tsx` usa el hook existente; si el formulario de creación exige campos que ahora son opcionales, no cambia nada).

## Criterios de aceptación

1. `python scripts/apply_migrations.py` segunda ejecución imprime `skip 001_political_figures_lima.sql`.
2. Neon: `SELECT count(*) FROM political_figures WHERE is_active` = 24; `SELECT count(*) FROM political_figures WHERE figure_role='candidate'` = 21.
3. `SELECT tag FROM search_tags WHERE is_active ORDER BY tag` no contiene `test`, `Boluarte`, `forsyth`, `lópez chau`, `acuña`, `carlos álvarez`, `presidenta Peru`; contiene `López Aliaga`, `Carlos Bruce`, `Urresti`, `Reggiardo`.
4. `SELECT count(*) FROM scraped_surveys WHERE results::jsonb->>'ambito' = 'presidencial_2026'` = 96.
5. `curl -s -H "Authorization: Bearer $TOKEN" localhost:8000/api/v1/political-figures | python -c "import sys,json;d=json.load(sys.stdin);print(len(d), d[0].keys())"` → 24 y las claves incluyen `figure_role`.
6. `cd project-react && npx tsc --noEmit` sin errores.

## Commit

`feat(lima2026): S0-04 runner de migraciones, columnas municipales y seed de 24 figuras políticas`
