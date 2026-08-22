# PoliticaPE — Cuarto de guerra para la elección municipal de Lima 2026

> Plataforma de inteligencia electoral. **No es un proyecto de analítica política genérica**: desde el
> 2026-08-21 está calibrada para una sola cosa — que un equipo de campaña decida con datos en la
> elección de la alcaldía de Lima Metropolitana del **domingo 4 de octubre de 2026**.

## Lo primero que debes saber

| Dato | Valor |
|---|---|
| Elección | Lima Metropolitana, **2026-10-04**, una sola vuelta, 21 listas |
| Padrón | 7 901 379 electores en 43 distritos (Reniec 2026) |
| Producción | https://politicape-web-production.up.railway.app |
| Railway | proyecto `politicape` · servicios `politicape-web`, `politicape-sniffing` |
| Base de datos | Neon PostgreSQL (nube). **No hay base local.** `DATABASE_URL` en `.env` |
| Rama de trabajo | `lima-2026` (mergeada a `main`) |
| Plan y contexto | `docs/plan-lima-2026/` — empieza por `ESTADO-EJECUCION.md` |

Callao **no** es Lima Metropolitana: es otra circunscripción y se excluye en todo el código.

## Estructura

```
project-scrapping/   FastAPI: scrapers, API REST, scheduler, servicios de análisis  (:8000)
project-sniffing/    FastAPI: streaming en vivo por WebSocket                       (:8080)
project-react/       React 18 + Vite + TS + Tailwind                                (:5000)
db/migrations/lima2026/   001-007.sql, idempotentes, runner propio (no Alembic)
docs/plan-lima-2026/      plan de 15 trabajos, contexto electoral y datos de referencia
```

## Levantar en local

```bash
# Walter tiene PORT=3010 global: SIEMPRE pasa PORT explícito o el servicio arranca en el puerto equivocado.
cd project-scrapping && PORT=8000 python serve.py
cd project-sniffing/microservice && PORT=8080 python -c "import os; os.environ['PORT']='8080'; import uvicorn; from main import app; uvicorn.run(app, host='0.0.0.0', port=8080)"
cd project-react && npm run dev
```

Reiniciar el backend en Windows (el puerto queda tomado por el proceso viejo):

```bash
PID=$(netstat -ano | grep ":8000 " | grep LISTENING | awk '{print $5}' | head -1)
[ -n "$PID" ] && taskkill //F //PID "$PID"
```

Token para probar endpoints:

```bash
TOKEN=$(curl -s -X POST localhost:8000/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@politica.pe","password":"password123"}' | python -c "import sys,json;print(json.load(sys.stdin)['token'])")
```

## Lo que corre solo (scheduler en `app/services/scheduler.py`)

| Loop | Cada | Qué hace |
|---|---|---|
| `scheduler_loop` | `SCRAPING_INTERVAL_HOURS` (2 en prod) | prensa (12 medios) → redes → gobierno → encuestas |
| `classification_loop` | 15 min | clasifica con Claude: figura, sentimiento *hacia* ella, tema, ataque, distrito |
| `daily_brief_loop` | 07:00 America/Lima | brief de una página → Telegram + correo |
| `alert_loop` | 10 min | crisis / ataque / oportunidad / pico por candidato |
| `results_loop` | 15 min, solo el día D y 72 h después | resultados ONPE por distrito |

Los tres últimos y la clasificación **no hacen nada sin `ANTHROPIC_API_KEY`** (lo registran en el log y siguen).

## Convenciones

- Todo el texto visible al usuario en **español**. Código y variables en inglés.
- Fechas electorales **nunca hardcodeadas**: viven en `app/electoral_config.py` leído de variables de entorno.
  `campaign_phase()` devuelve `pre | campaign | poll_blackout | closing | election_day | post` y el resto
  del sistema (recomendaciones, brief, alertas, UI) cambia de comportamiento según esa fase.
- Migraciones: SQL idempotente en `db/migrations/lima2026/`, aplicadas con
  `python scripts/apply_migrations.py`. Aditivas: nunca borrar tablas ni columnas.
- Sin Alembic, sin Redis, sin Celery (`app/tasks/` y `app/celery_app.py` son código muerto).
- Escrituras de tiempo en **UTC** (`datetime.utcnow()`), no hora local.

## Trampas del esquema (verificadas en producción — no las repitas)

1. **Las columnas `id` de `news_articles`, `raw_social_posts`, `scraped_surveys`, `government_data` y
   `scraping_logs` son `uuid` en Postgres.** Si un modelo nuevo las declara `String`, SQLAlchemy 2.0
   falla en la inserción masiva con *"Can't match sentinel values"*. Usa `PGUUID(as_uuid=False)`.
2. **`Column(JSON)` escribe JSON `null`, no SQL NULL.** Eso rompe `jsonb_array_length`. Usa
   `Column(JSON(none_as_null=True))` y valida con `jsonb_typeof(col::jsonb) = 'array'` antes de indexar.
3. **`realtime_data.live_streams`**: `stream_id` es `uuid`, las listas son `text[]` (no JSON) y la marca
   de tiempo es `received_at` (no `created_at`). Estuvo con 0 filas desde el inicio del proyecto por
   no coincidir con el modelo.
4. **Un `%` en un comentario SQL rompe la migración**: psycopg2 lo lee como placeholder. El runner usa
   cursor crudo cuando no hay parámetros, precisamente por eso.
5. `bcrypt` es obligatorio en `requirements.txt`: sin él el router completo de la API falla en Docker
   (`_create_demo_user` lo importa al arrancar) y solo responde el frontend.
6. El scheduler usa `logging` estándar: sin `logging.basicConfig` en `app/main.py` sus líneas no llegan
   a stdout ni a los logs de Railway.

## Fuentes con manías conocidas

- **Andina** renderiza sus secciones con JavaScript → se usa su RSS (`/agencia/rss.aspx`).
- **CanalN** no tiene `/politica` (404) → `/peru`.
- El gazetteer de `app/data/lima_districts.json` excluye a propósito vías nacionales
  (Panamericana, Carretera Central), genéricos municipales (serenazgo) y alias ambiguos
  (`Pro`, `Nana`, `Molina`, `Año Nuevo`, `El Porvenir`): generaban falsos positivos de Lima.

## Antes de dar por terminado un cambio

```bash
cd project-react && npx tsc --noEmit && npm run build   # tsc no detecta todo: el build sí
curl -s localhost:8000/health
railway up --service politicape-web --detach            # despliegue
```

`npx tsc --noEmit` puede pasar y el build fallar (p. ej. dos `default` en un `switch`). Corre los dos.
