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
