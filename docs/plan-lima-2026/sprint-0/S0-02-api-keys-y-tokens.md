# S0-02 — Claves de API unificadas

**Objetivo:** que con una sola forma de configurar claves (env o tabla `social_api_tokens`) funcionen X (TwitterAPI.io), YouTube y Claude; Facebook/Instagram quedan preparados para cuando haya tokens. Hoy hay tres nombres de variable para la misma cosa (H8 en `02-ESTADO`).

**Precondiciones:** S0-01.

**Archivos a tocar:** `project-scrapping/app/services/scheduler.py` (líneas 424-436), `project-scrapping/app/config.py`, `.env.example`, `.env` (local), variables de Railway.

## Pasos

1. En `scheduler.py`, función `run_scheduled_social_scraping`, reemplazar el bloque de fallback a env (líneas 424-436) por uno que acepte ambos nombres:
   ```python
   if platform == "twitter" and not tokens:
       api_key = os.getenv("TWITTERAPI_IO_KEY") or os.getenv("TWITTER_BEARER_TOKEN")
       if api_key:
           tokens = [{"id": "__env__", "label": "Variable de entorno", "credentials": {"api_key": api_key}}]
   elif platform == "youtube" and not tokens:
       api_key = os.getenv("YOUTUBE_API_KEY")
       if api_key:
           tokens = [{"id": "__env__", "label": "Variable de entorno", "credentials": {"api_key": api_key}}]
   elif platform == "instagram" and not tokens:
       access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
       if access_token:
           tokens = [{"id": "__env__", "label": "Variable de entorno", "credentials": {"access_token": access_token}}]
   elif platform == "facebook" and not tokens:
       access_token = os.getenv("FACEBOOK_GRAPH_TOKEN") or os.getenv("FACEBOOK_ACCESS_TOKEN")
       if access_token:
           tokens = [{"id": "__env__", "label": "Variable de entorno", "credentials": {"access_token": access_token}}]
   ```
   Nota: `update_token_status(db, "__env__", ...)` hace un query por id `"__env__"` que no existe y no falla; no tocar.
2. En `config.py`, añadir tras `YOUTUBE_API_KEY`:
   ```python
   TWITTERAPI_IO_KEY: Optional[str] = None
   FACEBOOK_GRAPH_TOKEN: Optional[str] = None
   ANTHROPIC_API_KEY: Optional[str] = None
   ```
3. Reescribir la sección `# API Keys` de `.env.example`:
   ```
   # API Keys
   TWITTERAPI_IO_KEY=            # X vía twitterapi.io (https://twitterapi.io) — lo usa el scheduler
   YOUTUBE_API_KEY=              # Google Cloud Console → YouTube Data API v3
   ANTHROPIC_API_KEY=            # console.anthropic.com
   FACEBOOK_GRAPH_TOKEN=         # opcional, Graph API (page token)
   INSTAGRAM_ACCESS_TOKEN=       # opcional
   TWITTER_BEARER_TOKEN=         # legado (API v2 oficial); si está vacío no pasa nada
   JWT_SECRET_KEY=               # obligatorio en producción
   ```
4. `[WALTER]` Pedir las tres claves mínimas y escribirlas en `.env` local (sección `# API Keys`) y en Railway:
   ```bash
   railway variables --service politicape-web --set "TWITTERAPI_IO_KEY=..." --set "YOUTUBE_API_KEY=..." --set "ANTHROPIC_API_KEY=..."
   railway up --service politicape-web --detach
   ```
   Si Walter no las tiene a mano, continúa con el resto del sprint y deja la nota; S0-04 en adelante no las necesita, S1-09 sí (`ANTHROPIC_API_KEY`).
5. Probar conectividad con los endpoints existentes (backend local levantado y `$TOKEN` de `04-CONVENCIONES`):
   ```bash
   curl -s -H "Authorization: Bearer $TOKEN" localhost:8000/api/v1/scraping/test/twitterapi-io
   curl -s -H "Authorization: Bearer $TOKEN" localhost:8000/api/v1/scraping/test/youtube
   ```

## Criterios de aceptación

1. `grep -n "TWITTERAPI_IO_KEY\|FACEBOOK_GRAPH_TOKEN" project-scrapping/app/services/scheduler.py` muestra los `or` de fallback.
2. `python -c "from app.config import settings; print(settings.TWITTERAPI_IO_KEY is not None or True)"` (desde `project-scrapping`) no lanza error de validación.
3. Si hay claves: `/scraping/test/twitterapi-io` y `/scraping/test/youtube` devuelven `success: true`. Si no hay claves: los endpoints devuelven un error claro (no 500) y lo anotas como `[WALTER] pendiente`.
4. `.env.example` contiene `TWITTERAPI_IO_KEY` y `JWT_SECRET_KEY`.

## Commit

`feat(lima2026): S0-02 claves de API unificadas (twitterapi.io, youtube, anthropic)`
