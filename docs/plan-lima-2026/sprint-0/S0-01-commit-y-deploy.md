# S0-01 — Commit del sprint MVP, rama `lima-2026` y deploy en Railway

**Objetivo:** que el trabajo de mayo quede en git, que exista la rama de trabajo, y que los tres servicios corran 24/7 en Railway para que el scheduler recolecte sin depender de la PC de Walter.

**Precondiciones:** ninguna. Es el primer trabajo.

**Archivos a tocar:** `.gitignore`, índice de git (no código fuente). `Dockerfile.web` solo si el healthcheck falla (ver "Si falla").

## Parte A — Git (sin acción humana)

1. Verificar que estás en la raíz del repo y en `main`:
   ```bash
   git rev-parse --show-toplevel   # debe terminar en /PoliticaPE/PoliticaPE
   git branch --show-current       # main
   ```
2. Sacar del índice lo que no debe estar trackeado (quedan en disco):
   ```bash
   git rm -r --cached -q project-react/dist 2>/dev/null || true
   git ls-files | grep -E '__pycache__|\.pyc$' | xargs -r git rm --cached -q
   ```
3. Añadir al final de `.gitignore` estas líneas exactas:
   ```
   # Lima 2026
   .agents/
   .config/
   .local/
   *.dump
   backup_*.sql
   project-scrapping/logs/
   ```
4. Confirmar que `.env` NO aparece en `git status` (ya está ignorado). Si aparece, detente.
5. Commit del sprint MVP (todo lo que hay):
   ```bash
   git add -A
   git status --short | head -50     # revisar: nada de .env, dist/, .pyc
   git commit -m "chore(mvp): sprint 2026-05-24 — JWT, scrapers de prensa, Neon, limpieza Replit, Dockerfiles"
   ```
6. Crear la rama de trabajo y subir ambas:
   ```bash
   git checkout -b lima-2026
   git push -u origin main
   git push -u origin lima-2026
   ```
   Si `git push` pide credenciales y no hay credential manager, pide a Walter que ejecute `! git push -u origin main` y `! git push -u origin lima-2026` en el prompt (el prefijo `!` ejecuta en esta sesión). No continúes sin push: Railway por CLI no lo necesita, pero el respaldo sí.

## Parte B — Railway `[WALTER]` para el login

7. Login (interactivo, lo hace Walter): `! railway login` (o `railway login --browserless` y pega el código). Verifica con `railway whoami`.
8. Crear proyecto y servicios desde la raíz del repo:
   ```bash
   railway init --name politicape          # crea el proyecto y lo enlaza al directorio
   railway add --service politicape-web
   railway add --service politicape-sniffing
   ```
   Alternativa con el MCP de Railway (si el CLI falla): `mcp__railway__create_project` (name `politicape`), `mcp__railway__create_service` ×2, luego `mcp__railway__link_service`.
9. Variables del servicio **sniffing**:
   ```bash
   railway variables --service politicape-sniffing --set "PORT=8080" --set "DATABASE_URL=<valor de .env>" --set "LOG_LEVEL=INFO" --set "RAILWAY_DOCKERFILE_PATH=Dockerfile.sniffing"
   ```
10. Variables del servicio **web** (copiar `DATABASE_URL` de `.env`; generar `JWT_SECRET_KEY` con `python -c "import secrets;print(secrets.token_urlsafe(48))"`):
    ```bash
    railway variables --service politicape-web \
      --set "PORT=8000" \
      --set "DATABASE_URL=<valor de .env>" \
      --set "JWT_SECRET_KEY=<generado>" \
      --set "SERVE_FRONTEND=true" \
      --set "DEBUG=false" \
      --set "SNIFFING_URL=http://politicape-sniffing.railway.internal:8080" \
      --set "SNIFFING_WS_URL=ws://politicape-sniffing.railway.internal:8080" \
      --set "SCRAPING_INTERVAL_HOURS=2" \
      --set "RAILWAY_DOCKERFILE_PATH=Dockerfile.web"
    ```
    Las claves de API se añaden en S0-02 y las electorales en S0-03 (el trabajo correspondiente dice `railway variables --set ...`).
11. Desplegar ambos (el build context es la raíz del repo; los Dockerfiles ya están escritos para eso):
    ```bash
    railway up --service politicape-sniffing --detach
    railway up --service politicape-web --detach
    ```
12. Dominio público para web y `FRONTEND_URL`:
    ```bash
    railway domain --service politicape-web          # imprime https://politicape-web-xxxx.up.railway.app
    railway variables --service politicape-web --set "FRONTEND_URL=https://<dominio>"
    railway up --service politicape-web --detach     # redeploy para que CORS tome FRONTEND_URL
    ```
13. Habilitar red privada si el sniffing no responde desde web: `mcp__railway__private_network_status` / `private_network_update`.

## Criterios de aceptación

1. `git log --oneline -3` muestra el commit `chore(mvp)` y la rama actual es `lima-2026`.
2. `git ls-files | grep -cE '__pycache__|dist/'` devuelve `0`.
3. `curl -s https://<dominio>/health` → `{"status":"healthy",...}` y `curl -s https://<dominio>/` devuelve HTML (frontend servido).
4. `curl -s -X POST https://<dominio>/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@politica.pe","password":"password123"}'` devuelve `"success":true`.
5. `railway logs --service politicape-web | grep -m1 "[Scheduler] Scheduler iniciado"` encuentra la línea.
6. `curl -s https://<dominio>/api/metrics` devuelve JSON con `processed_count` (proxy a sniffing por red privada funcionando; si devuelve todos ceros con `active_streams: 0` está bien).

## Si falla

- Build de web falla en `npm ci`: el lockfile de `project-react` está sincronizado; si no, cambia `npm ci --production=false` por `npm install` en `Dockerfile.web` línea 11 y anótalo.
- Healthcheck: `Dockerfile.web` usa `curl -f http://localhost:${PORT:-8000}/health`; con `PORT=8000` definido funciona. Si Railway reporta unhealthy antes de inicializar, sube `--start-period=60s`.
- `railway up` sube el directorio actual; asegúrate de estar en la raíz del repo y que `.dockerignore` existe (ya excluye `db/`, `docs/`, `.env`).

## Commit

Este trabajo genera dos commits: el `chore(mvp)` de la parte A y, si tocaste `Dockerfile.web` o `.gitignore` después, `feat(lima2026): S0-01 deploy en Railway (politicape-web, politicape-sniffing)`. Si no tocaste nada más, no hay segundo commit y lo indicas en el reporte.
