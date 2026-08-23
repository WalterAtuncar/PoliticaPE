# 03 — Convenciones y verificación

## Levantar el stack (si no está arriba)

```bash
# liberar puertos si quedaron ocupados (Windows retiene el proceso viejo)
for P in 8000 8080 5000; do PID=$(netstat -ano | grep ":$P " | grep LISTENING | awk '{print $5}' | head -1); [ -n "$PID" ] && taskkill //F //PID "$PID"; done

cd project-scrapping && PORT=8000 python serve.py                       # backend (carga .env solo; ver nota)
cd project-sniffing/microservice && PORT=8080 python -c "import os; os.environ['PORT']='8080'; import uvicorn; from main import app; uvicorn.run(app, host='0.0.0.0', port=8080)"
cd project-react && PORT=5000 npm run dev                                # frontend → http://127.0.0.1:5000
```

Nota: `app/config.py` carga `.env` al entorno (`override=False`) desde el commit `74bf8eb`. Si cambias `.env`,
**reinicia el backend**; el proceso no relee el archivo.

Token para probar endpoints a mano:
```bash
TOK=$(curl -s -X POST http://127.0.0.1:8000/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@politica.pe","password":"password123"}' | python -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s -H "Authorization: Bearer $TOK" http://127.0.0.1:8000/api/v1/race/topics?days=7 | python -m json.tool | head -30
```

## Frontend

- **Fetch**: siempre `fetch(\`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.X}\`, { headers: getAuthHeaders() })`
  desde `src/config/api.ts`. Nunca `fetch` sin cabecera (es el fallo de `TrendChart`). Si un endpoint
  nuevo no está en `ENDPOINTS`, añádelo ahí, no lo escribas inline.
- **Degradación por widget**: un endpoint caído no tumba el Panel. `useDashboard` usa
  `Promise.allSettled`; cada widget recibe su slice + `isLoading` + `error` y decide solo.
- **Estados**: tres por widget, siempre. *Cargando* → bloque `animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl`
  de la misma altura que el contenido final (evita saltos). *Vacío* → texto exacto de `02-DISENO-OBJETIVO`,
  `text-sm text-gray-500 dark:text-gray-400`, sin icono gigante. *Error* → mismo estilo que vacío, texto
  "No se pudo cargar. Reintentar" con botón que llama `refetch`.
- **Tarjetas**: `<Card glass className="p-5">` de `components/ui/Card`. Título de widget:
  `<h3 className="text-sm font-semibold text-gray-900 dark:text-white">` + subtítulo opcional
  `text-xs text-gray-500 dark:text-gray-400`. Es el patrón de `AlertsPanel.tsx:113-120`; cópialo.
- **Paleta**: la de la era Lima, no el azul/morado presidencial. Teal `#1F6B73`, ámbar `#B8741A`,
  colores de candidato desde `figures[].color` (RLA `#00AEEF`). Severidades como `AlertsPanel.tsx:5-10`.
  Prioridades de recomendación: critical rojo, high naranja, medium ámbar, low gris (mismas clases).
- **Animación**: `motion.div` de framer-motion con `initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}`
  y `transition={{delay: index*0.05}}`. Sin más.
- **Modo oscuro**: cada color con su `dark:`. Verificar ambos modos en P-07.
- **Formato de números**: `n.toLocaleString('es-PE')` para enteros; porcentajes con 1 decimal y coma
  (`(27.8).toLocaleString('es-PE', {minimumFractionDigits:1, maximumFractionDigits:1})` → "27,8").
- **Fechas**: `formatElectoralDate` de `useElectoralConfig` para fechas electorales; para "hace X"
  reutiliza `timeAgo` de `AlertsPanel.tsx:23-28` (muévelo a `src/utils/time.ts` en P-04 y que
  `AlertsPanel` lo importe de ahí).
- **TypeScript estricto**: sin `any`. Reutiliza los tipos exportados por los hooks (`01-ESTADO-ACTUAL`).
  `npx tsc --noEmit && npm run build` deben pasar sin errores ni warnings nuevos al cierre de cada trabajo de frontend.
- **No** `console.log` en código final. `console.error` solo dentro de `catch`.

## Backend

- Variables de entorno con valor por defecto que **preserve el comportamiento actual**. El modo prensa
  se activa por `.env`, no por cambio de código.
- SQL vía `text()` parametrizado, como el resto de `alert_engine.py`.
- Probar con `python -c` contra la base real (es lo que hay); no crear fixtures.

## Verificación estándar por trabajo de frontend

```bash
cd project-react && npx tsc --noEmit && npm run build 2>&1 | tail -5   # los dos: tsc no detecta todo, el build sí (CLAUDE.md)
# en el navegador: http://127.0.0.1:5000 → login → Panel
# abrir DevTools → Console: cero errores rojos; Network: todos los /api/v1/* en 200
```

## Verificación de "cero mock"

```bash
cd project-react && grep -rnE "mock|Mock|MOCK|lorem|Lorem|dummy|fake|sample" src/components/dashboard src/hooks/useDashboard.ts
# debe devolver 0 líneas
```

## Git

- Rama de trabajo: `main` (el repo ya trabaja directo sobre `main` desde el 21-ago).
- Mensaje: `tipo(ámbito): P-NN resumen` + cuerpo en español con el porqué. Pie con
  `Co-Authored-By` como en los commits anteriores. `git push origin main` al cerrar.
