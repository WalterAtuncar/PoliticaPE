# 04 — Convenciones y verificación

## Levantar servicios en local (Git Bash, desde la raíz del repo)

```bash
# Backend scrapping (terminal 1)
cd project-scrapping && PORT=8000 python serve.py
# Sniffing (terminal 2)
cd project-sniffing/microservice && PORT=8080 python -c "import os; os.environ['PORT']='8080'; import uvicorn; from main import app; uvicorn.run(app, host='0.0.0.0', port=8080)"
# Frontend (terminal 3)
cd project-react && npm run dev
```

Con la herramienta Bash, usa `run_in_background: true` para los servidores y verifica con `curl -s localhost:8000/health`.

## Token para pruebas

```bash
TOKEN=$(curl -s -X POST localhost:8000/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@politica.pe","password":"password123"}' | python -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s -H "Authorization: Bearer $TOKEN" localhost:8000/api/v1/data/stats
```

## Consultas a Neon sin psql

```bash
cd project-scrapping && python - <<'EOF'
from app.database import SessionLocal
from sqlalchemy import text
db = SessionLocal()
for r in db.execute(text("SELECT count(*) FROM political_figures")): print(r)
EOF
```

(`app.config.settings` carga `.env` desde la raíz del repo automáticamente.)

## Estilo de código

- Python: mismo estilo del repo (sin type-hints exhaustivos, `logger` de `loguru` en scrapers y `logging` en servicios, funciones módulo-nivel). Sin docstrings largos. Sin comentarios que expliquen lo obvio.
- SQLAlchemy: modelos en `app/models.py`, `Column(...)` explícitos, `__table_args__` con `Index`. Tablas del esquema `organization` llevan `{'schema': 'organization'}`.
- Endpoints: router por archivo, `Depends(get_current_user)` en todos, `Depends(get_db)`, Pydantic en `app/schemas.py` (añadir al final del archivo, sección comentada `# --- Lima 2026 ---`).
- Frontend: componentes funcionales con `React.FC`, Tailwind, `framer-motion` opcional, `lucide-react` para iconos, `recharts` para gráficos, `react-leaflet` para mapas. Hooks en `src/hooks/`, fetch con `getAuthHeaders()`. Estados vacíos con texto en español, nunca datos de ejemplo.
- Fechas: backend en UTC naive (como el resto); presentación en frontend con `toLocaleDateString('es-PE')`.
- Zona horaria de Lima para programación del brief: `zoneinfo.ZoneInfo("America/Lima")` (añadir `tzdata` a requirements para Windows).

## Anthropic SDK (S1-09 en adelante)

- Dependencia: `anthropic` (instalar con `pip install -U anthropic`, fijar la versión instalada en `requirements.txt`).
- Cliente único en `app/services/claude_client.py`:
  ```python
  import os, anthropic
  _client = None
  def get_client():
      global _client
      if _client is None:
          _client = anthropic.Anthropic()  # lee ANTHROPIC_API_KEY
      return _client
  def model(kind: str = "default") -> str:
      if kind == "classifier":
          return os.getenv("CLAUDE_MODEL_CLASSIFIER") or os.getenv("CLAUDE_MODEL", "claude-opus-5")
      return os.getenv("CLAUDE_MODEL", "claude-opus-5")
  ```
- Salida estructurada: `client.messages.parse(model=..., max_tokens=..., messages=[...], output_format=PydanticModel)` → `response.parsed_output`. Pensamiento adaptativo: `thinking={"type": "adaptive"}`; esfuerzo bajo para clasificación: `output_config={"effort": "low"}`; brief y recomendaciones: `output_config={"effort": "high"}`.
- No usar prefill de asistente. No usar `budget_tokens`. Parsear siempre con `json.loads`/Pydantic, nunca regex sobre el JSON.
- Walter decide el modelo: por defecto `claude-opus-5`; si quiere abaratar el clasificador, pone `CLAUDE_MODEL_CLASSIFIER=claude-sonnet-5`. No cambies el default por tu cuenta.

## Commits

- Formato: `feat(lima2026): S0-03 fechas electorales a configuración`. Un commit por trabajo. Rama `lima-2026`.
- Terminar cada mensaje de commit con las dos líneas de trailer que exige el entorno (Co-Authored-By y Claude-Session) si el harness lo pide.
- Antes de cada commit: `git status` y confirma que no entran `.env`, `dist/`, `__pycache__/`, `*.dump`, `*.sql` de backup.

## Verificación estándar (ejecutar al cierre de cada sprint)

```bash
# 1. Backend arranca y expone rutas
curl -s localhost:8000/health
curl -s localhost:8000/openapi.json | python -c "import sys,json;print(sorted(json.load(sys.stdin)['paths']))"
# 2. Frontend compila sin errores de tipos
cd project-react && npx tsc --noEmit && npm run build
# 3. Scheduler vivo: buscar en el log "[Scheduler]" tras el arranque
# 4. Conteos que deben crecer día a día
#    news_articles WHERE scraped_at > now()-interval '1 day'; raw_social_posts idem; content_classifications idem
```

## Si algo de Railway falla

- `railway logs --service politicape-web` para ver el arranque.
- Health: el servicio web responde `/health` incluso durante `initializing` (503 para el resto). Si Railway marca unhealthy, sube `HEALTHCHECK --start-period` a 60 s en `Dockerfile.web`.
- Si el build de Node falla por memoria, añade `NODE_OPTIONS=--max-old-space-size=2048` como variable de build.

---

## Aprendido durante la ejecución (2026-08-21)

Lo que costó tiempo descubrir y no debe volver a costarlo. La versión corta está en `CLAUDE.md`.

### Tipos de Postgres que no coinciden con los modelos

Las tablas se crearon con DDL a mano (`db/ddl_postgres_final.sql`), no con SQLAlchemy, así que los
modelos y las columnas reales divergen. Antes de escribir un modelo nuevo, mira la tabla:

```sql
SELECT column_name, data_type, udt_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='mi_tabla' ORDER BY ordinal_position;
```

- Los `id` de `news_articles`, `raw_social_posts`, `scraped_surveys`, `government_data` y
  `scraping_logs` son **`uuid`**. Declararlos `String` rompe la inserción masiva de SQLAlchemy 2.0 con
  *"Can't match sentinel values in result set to parameter sets"*. Usa `PGUUID(as_uuid=False)`.
- `Column(JSON)` con valor `None` escribe **JSON `null`**, no SQL NULL, y eso hace fallar
  `jsonb_array_length` con *"cannot get array length of a scalar"*. Usa `JSON(none_as_null=True)` y
  filtra con `jsonb_typeof(col::jsonb) = 'array'`.
- `realtime_data.live_streams`: `stream_id` es `uuid`, `detected_keywords`/`political_entities`/
  `hashtags` son `text[]` (no JSON) y la marca de tiempo es `received_at`. El modelo llevaba mal los tres.

### psycopg2 y el signo de porcentaje

`exec_driver_sql(sql)` pasa un dict de parámetros vacío y psycopg2 interpreta cualquier `%` como
placeholder — incluso dentro de un comentario SQL. Síntoma:
`TypeError: immutabledict is not a sequence`. Soluciones: `%%`, o cursor crudo cuando no hay parámetros
(es lo que hace `scripts/apply_migrations.py`). Lo mismo aplica a consultas ad-hoc con `ILIKE '%algo%'`:
usa parámetros con nombre.

### SQLAlchemy 2.0: `db.commit()` cierra la conexión

`conn = db.connection()` seguido de `db.commit()` invalida `conn` (*"This Connection is closed"*).
Para scripts que hacen varias transacciones, usa el engine: `with engine.begin() as conn:` por bloque.

### Reinicio del backend en Windows

El proceso viejo mantiene el puerto y el nuevo arranca sin avisar del conflicto (health responde, pero
con el código anterior). Mata por PID antes de relanzar; ver `CLAUDE.md`.

### `tsc --noEmit` no sustituye a `npm run build`

TypeScript pasó por alto dos cláusulas `default` en el mismo `switch`; esbuild lo detectó. Corre los dos.

### Verificar contra la fuente real, no contra la documentación

Varias piezas "terminadas" nunca habían corrido: `live_streams` con 0 filas desde el inicio, secciones de
medios que devolvían 404 o 0 artículos, columnas que nadie había insertado. Antes de dar algo por bueno:
consulta Neon, haz `curl` al endpoint, descarga la página real.

### Datos de prueba

Si insertas filas sintéticas para probar (clasificaciones, alertas, resultados), márcalas con un valor
reconocible (`model='test-...'`, `source='prueba'`, `content_id LIKE 'test-%'`) y **bórralas al terminar**.
