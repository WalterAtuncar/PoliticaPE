# S1-09 — Clasificación en lote con Claude

**Objetivo:** reemplazar el lexicón como fuente de verdad analítica. Cada noticia/post relevante recibe, por figura mencionada: sentimiento *hacia* la figura, tema municipal, ataque/atacante, distritos. Se ejecuta en un loop del scheduler y hay un script para el backlog.

**Precondiciones:** S0-04 (figuras), S0-06 (columnas `classified`, `lima_geo`), `ANTHROPIC_API_KEY` en `.env` y Railway `[WALTER]`.

**Archivos a tocar:**
- `project-scrapping/requirements.txt` (+ `anthropic`, + `tzdata`)
- nuevo `db/migrations/lima2026/003_content_classifications.sql` (copiar de referencia)
- nuevos `project-scrapping/app/services/claude_client.py`, `app/services/classifier.py`, `scripts/classify_backlog.py`
- `project-scrapping/app/models.py` (+ `ContentClassification`)
- `project-scrapping/app/services/scheduler.py` (+ `classification_loop`, `start_scheduler`)
- `project-scrapping/app/services/ai_recommendations.py` (solo la llamada HTTP → SDK; el prompt se reescribe en S2-13)
- nuevo `project-react/src/data/topics.ts`
- `.env.example` (bloque `# S1-09`)

## Pasos

1. `pip install -U anthropic tzdata` y fijar en `requirements.txt` las versiones instaladas (`pip freeze | grep -iE "^(anthropic|tzdata)="`).
2. Migración: `cp docs/plan-lima-2026/referencia/migraciones/003_content_classifications.sql db/migrations/lima2026/ && python scripts/apply_migrations.py`.
3. `models.py`, añadir:
   ```python
   class ContentClassification(Base):
       __tablename__ = "content_classifications"
       id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
       content_type = Column(String(10), nullable=False)
       content_id = Column(String, nullable=False)
       figure_id = Column(String, nullable=True)
       stance = Column(Float, nullable=True)
       stance_label = Column(String(10), nullable=True)
       topic = Column(String(40), nullable=False)
       secondary_topics = Column(JSON, nullable=True)
       is_attack = Column(Boolean, default=False)
       attacker_figure_id = Column(String, nullable=True)
       attacked_figure_id = Column(String, nullable=True)
       districts = Column(JSON, nullable=True)
       zone = Column(String(20), nullable=True)
       summary = Column(String(300), nullable=True)
       relevance = Column(Float, nullable=True)
       model = Column(String(60), nullable=True)
       classified_at = Column(DateTime, default=func.now())
       content_published_at = Column(DateTime, nullable=True)
   ```
4. `app/services/claude_client.py` — exactamente el de `04-CONVENCIONES` (sección Anthropic SDK).
5. `app/services/classifier.py`:
   - Constantes: `TOPICS` (lista de las 16 claves de `referencia/temas-municipales.md`), `BATCH_SIZE = int(os.getenv("CLASSIFY_BATCH_SIZE", "20"))`, `DAILY_LIMIT = int(os.getenv("CLASSIFY_DAILY_LIMIT", "3000"))`.
   - Modelos Pydantic `FigureStance`, `ItemClassification`, `BatchClassification` **tal como están** en `referencia/prompts/clasificacion.md`.
   - `build_system_prompt(db)`: texto exacto del prompt con `{figures_block}` = una línea por figura activa `"{display_name} — alias: {', '.join(search_keywords + [nickname])} — rol: {figure_role}"` y `{districts_block}` = una línea por distrito `"{display} — {', '.join(aliases)}"`. Cachear el string en memoria 10 minutos (las figuras cambian poco).
   - `select_pending(db, limit)`: noticias con `classified = FALSE AND (scope = 'lima_metropolitana' OR <título o contenido contiene alguna keyword de figura activa>)` ordenadas por `published_at DESC`; posts igual con `created_at`. Mezclar 70 % noticias / 30 % posts hasta `limit`. La condición de keyword se implementa con `or_(*[NewsArticle.title.ilike(f"%{kw}%") for kw in keywords])` (mismo patrón que `_build_keyword_conditions` en ai_recommendations.py).
   - `classify_batch(db, items) -> int`: construye el `user` message del prompt (truncar contenido a 1 200 chars), llama
     ```python
     client.messages.parse(
         model=model("classifier"), max_tokens=8000,
         thinking={"type": "adaptive"}, output_config={"effort": "low"},
         system=[{"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}],
         messages=[{"role": "user", "content": user_text}],
         output_format=BatchClassification,
     )
     ```
     y aplica el post-proceso obligatorio del prompt (mapeo de figuras y distritos, `stance_label`, `zone`, upsert en `content_classifications` por `(content_type, content_id, figure_id)` — usar `INSERT ... ON CONFLICT DO UPDATE` vía `text()` o borrar-e-insertar por contenido; marcar `classified = TRUE` y `topics` en la tabla de origen; `content_published_at` = `published_at` o `created_at` del contenido). Manejo de errores: `anthropic.RateLimitError` → dormir 30 s y reintentar una vez; `anthropic.APIStatusError` → loguear y **no** marcar como clasificado; respuesta con menos ítems que el lote → los faltantes quedan sin clasificar (se reintentan en el siguiente ciclo).
   - `run_classification_cycle(db_url, max_items=None) -> dict`: respeta `DAILY_LIMIT` contando `content_classifications` con `classified_at >= hoy 00:00 UTC` (cuenta contenidos distintos), procesa en lotes de `BATCH_SIZE`, devuelve `{"classified": n, "batches": b, "skipped_daily_limit": bool}`.
   - `figure_ids_mentioned(text, figures)`: helper usado por S2-11 (regex por keywords normalizadas).
6. `scheduler.py`:
   ```python
   CLASSIFY_INTERVAL_MINUTES = int(os.getenv("CLASSIFY_INTERVAL_MINUTES", "15"))
   _classify_task = None

   async def classification_loop():
       from app.config import settings
       from app.services.classifier import run_classification_cycle
       await asyncio.sleep(90)
       while True:
           try:
               if os.getenv("ANTHROPIC_API_KEY"):
                   result = await asyncio.to_thread(run_classification_cycle, settings.DATABASE_URL)
                   logger.info(f"[Classifier] {result}")
               else:
                   logger.info("[Classifier] ANTHROPIC_API_KEY ausente; ciclo omitido")
           except Exception as e:
               logger.error(f"[Classifier] Error: {e}")
           await asyncio.sleep(CLASSIFY_INTERVAL_MINUTES * 60)
   ```
   y en `start_scheduler()` crear también `_classify_task = loop.create_task(classification_loop())`; en `stop_scheduler()` cancelarlo.
7. `ai_recommendations.py`: reemplazar el bloque `httpx` (l. ~505-535) por el SDK:
   ```python
   from app.services.claude_client import get_client, model
   response = await asyncio.to_thread(
       get_client().messages.create,
       model=model(), max_tokens=16000, thinking={"type": "adaptive"}, output_config={"effort": "high"},
       messages=[{"role": "user", "content": prompt}],
   )
   text_content = next(b.text for b in response.content if b.type == "text")
   ```
   Quitar `import httpx` local y el check manual de `status_code`; conservar `parse_claude_response` (S2-13 lo sustituye por `parse`).
8. `scripts/classify_backlog.py`: argumentos `--days 30 --max 1500`; llama `run_classification_cycle(db_url, max_items=args.max)` ignorando `DAILY_LIMIT` (parámetro `ignore_daily_limit=True`). Ejecutar una vez con `--days 30 --max 600` para tener base el mismo día.
9. `project-react/src/data/topics.ts`: `export const TOPIC_LABELS: Record<string,string>` con las 16 etiquetas de la taxonomía.
10. `.env.example`: bloque `# S1-09` de `03-DISENO-OBJETIVO.md`. Railway: `railway variables --service politicape-web --set "CLAUDE_MODEL=claude-opus-5" --set "CLASSIFY_INTERVAL_MINUTES=15" --set "CLASSIFY_DAILY_LIMIT=3000"`.

## Criterios de aceptación

1. Prueba unitaria rápida (desde `project-scrapping`, con clave):
   ```bash
   python - <<'EOF'
   from app.database import SessionLocal
   from app.services.classifier import classify_batch, build_system_prompt
   db = SessionLocal()
   items = [{"item_id": "t1", "content_type": "news", "source": "RPP", "published_at": "2026-08-18",
             "title": "Transportistas de SJL exigen a Reggiardo una policía municipal ante ola de extorsiones",
             "content": "Dirigentes criticaron la gestión de la Municipalidad de Lima y pidieron a Carlos Bruce y López Aliaga pronunciarse."}]
   print(classify_batch(db, items, dry_run=True))
   EOF
   ```
   (implementa `dry_run=True` para devolver el objeto parseado sin persistir). Esperado: `topic == "extorsion"`, distritos `["San Juan de Lurigancho"]`, figuras incluyen `Renzo Reggiardo` con `stance < 0` e `is_attacked True`, `Municipalidad de Lima` con `stance < 0`; `Carlos Bruce` y `Rafael López Aliaga` con stance ≈ 0.
2. Tras `classify_backlog.py --days 30 --max 600`: `SELECT count(*) FROM content_classifications` ≥ 400 y `SELECT topic, count(*) FROM content_classifications GROUP BY 1 ORDER BY 2 DESC LIMIT 5` muestra `inseguridad`/`extorsion`/`transporte` entre los primeros.
3. `SELECT count(*) FROM content_classifications WHERE figure_id IS NOT NULL` > 100.
4. Segundo ciclo sobre el mismo backlog no crea duplicados (`count(*)` estable, índice único funciona).
5. Log del backend: `[Classifier] {'classified': N, ...}` cada 15 min.
6. `/territory/districts?days=30` ahora devuelve `figures` no vacío en SJL y `top_topic` poblado (conmuta a `content_classifications`).
7. `DAILY_LIMIT`: con `CLASSIFY_DAILY_LIMIT=5` un ciclo devuelve `skipped_daily_limit: true` tras 5 contenidos.

## Costo (para el reporte)

Registrar en el reporte el `usage` acumulado de un ciclo (input/output tokens) y extrapolar por día con `CLASSIFY_DAILY_LIMIT`. Walter decide si baja el límite o cambia `CLAUDE_MODEL_CLASSIFIER`.

## Commit

`feat(lima2026): S1-09 clasificación en lote con Claude (figura, sentimiento hacia, tema, ataque, distrito)`
