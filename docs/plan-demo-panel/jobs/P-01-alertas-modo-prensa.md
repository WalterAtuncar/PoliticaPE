# P-01 — Motor de alertas: modo prensa (ventana diaria)

## Objetivo

Que el motor de alertas dispare con el volumen real de hoy (prensa sola, ~2–7 menciones/día del
candidato) sin romper la calibración para redes. Resultado esperado: una alerta `crisis` o `attack`
real sobre López Aliaga por los pedidos de exclusión ante el JEE, con `suggested_response` de Claude,
visible en `/alerts` y por tanto en el Panel.

## Precondiciones

- `ANTHROPIC_API_KEY` en `.env` (ya está). `content_classifications` con filas de RLA en las últimas
  24 h (verificar: ver criterio 0).

## Archivos a tocar

- `project-scrapping/app/services/alert_engine.py` — líneas 18-21 (umbrales), 29-32 (`_params`),
  226-228 (umbral de ataque), 252 (`dedup_key`).
- `.env` — bloque `ALERT_*`.
- `docs/plan-lima-2026/ESTADO-EJECUCION.md` — una línea en "Deuda conocida" (ver paso 5).

## Pasos

### 1. Umbrales nuevos por env (`alert_engine.py:18-21`)

Reemplaza el bloque por:

```python
SPIKE_FACTOR = float(os.getenv("ALERT_SPIKE_FACTOR", "3.0"))
MIN_MENTIONS = int(os.getenv("ALERT_MIN_MENTIONS", "15"))
NEG_SHARE = float(os.getenv("ALERT_NEG_SHARE", "0.6"))
# Ventana de observacion. 60 min esta calibrado para redes sociales (miles de menciones/hora).
# Con prensa sola el candidato recibe 2-7 notas al dia: usar 1440 (un dia) y bajar ALERT_MIN_MENTIONS.
WINDOW_MINUTES = int(os.getenv("ALERT_WINDOW_MINUTES", "60"))
# Minimo de ataques del mismo origen en la ventana para abrir una alerta "attack".
ATTACK_MIN = int(os.getenv("ALERT_ATTACK_MIN", "5"))
ALERT_ROLES = ("candidate", "incumbent")
```

### 2. `_params()` usa la ventana (`alert_engine.py:29-32`)

La rama normal (no debate) pasa a:

```python
    return {"window_minutes": WINDOW_MINUTES, "baseline_hours": 24 * 7, "min_mentions": MIN_MENTIONS}
```

La rama de debate (`window_minutes: 5`) **no se toca**.

Ojo con la línea base: `periods = (baseline_hours*60)/window_minutes`. Con ventana de 1 440 min y base de
7 días, `periods = 7` y `baseline = base_n / 7` (menciones por día). La fórmula ya es correcta para
cualquier ventana; solo verifica que no haya un `// 60` escondido (no lo hay, línea ~194).

### 3. Umbral de ataque (`alert_engine.py:226-228`)

`elif attacks and int(attacks[1]) >= 5:` → `elif attacks and int(attacks[1]) >= ATTACK_MIN:`

### 4. Dedup por ventana (`alert_engine.py:252`)

Hoy: `"dedup_key": f"{f.id}|{kind}|{now.strftime('%Y-%m-%dT%H')}"`. Con ventana diaria, el ciclo de
10 min recrearía la misma alerta 24 veces al día. Reemplaza por:

```python
                "dedup_key": f"{f.id}|{kind}|{now.strftime('%Y-%m-%d' if p['window_minutes'] >= 1440 else '%Y-%m-%dT%H')}",
```

### 5. `.env` (local) — activar modo prensa

```
ALERT_WINDOW_MINUTES=1440
ALERT_MIN_MENTIONS=3
ALERT_ATTACK_MIN=2
```

`ALERT_SPIKE_FACTOR=3.0` y `ALERT_NEG_SHARE=0.6` se quedan. Reinicia el backend local.

Añade en `docs/plan-lima-2026/ESTADO-EJECUCION.md` → "Deuda conocida": *"El motor de alertas corre en
modo prensa (`ALERT_WINDOW_MINUTES=1440`, mínimo 3). Cuando se activen TWITTERAPI_IO_KEY/YOUTUBE_API_KEY,
volver a 60 / 15 / 5."*

**No** pongas estas variables en Railway todavía: eso es parte del trabajo 8 (deploy final).

### 6. Disparo manual y verificación

```bash
cd project-scrapping && python - <<'PY'
from app.config import settings            # carga .env
from app.services.alert_engine import run_alert_cycle, _params
print("params:", _params())
print(run_alert_cycle(settings.DATABASE_URL))
PY
```

## Criterios de aceptación

0. (previo) `SELECT count(DISTINCT content_id) FROM content_classifications WHERE figure_id = (SELECT id FROM political_figures WHERE is_own_candidate) AND content_published_at >= now() - interval '24 hours';` → **≥ 3**. Si es menor, espera al siguiente ciclo de clasificación (15 min) o corre `python scripts/classify_backlog.py --max 100`.
1. `_params()` imprime `{'window_minutes': 1440, 'baseline_hours': 168, 'min_mentions': 3}`.
2. `run_alert_cycle` devuelve `created >= 1` en la primera ejecución.
3. Segunda ejecución inmediata → `created == 0` (dedup por día funciona).
4. `curl -s -H "Authorization: Bearer $TOK" http://127.0.0.1:8000/api/v1/alerts` → `alerts[0]` con
   `figure_name == "Rafael López Aliaga"`, `kind in ("crisis","attack")`, `evidence` con ≥ 1 entrada con `url`,
   y `suggested_response` **no nulo** (lo genera Claude; si es nulo, la severidad salió `medium`: revisa `_severity`
   y, si `velocity` es < 6, es normal que sea `high` → debe haber respuesta igual porque `high` la activa).
5. Con `.env` sin las 3 variables nuevas (cópialo aparte, pruébalo, restáuralo), `_params()` devuelve
   `window_minutes: 60, min_mentions: 15` → comportamiento original intacto.
6. `git diff --stat` solo toca los 3 archivos listados.

## Si falla

- `created == 0` en el criterio 2 con n ≥ 3: imprime `n, base_n, baseline, velocity, neg_share` para RLA
  (añade un `logger.info` temporal y quítalo antes del commit). Si `velocity < 3.0` porque la base de 7 días
  ya incluye los mismos 3 días de crisis (baseline alta), baja **temporalmente** `ALERT_SPIKE_FACTOR=2.0` en
  `.env` y anótalo en el reporte; no cambies el default del código.
- `suggested_response` nulo: `suggest_response()` (línea 80) captura excepciones de la API; revisa el log del
  backend por `[Alerts]`. Si es un 4xx de Anthropic, el modelo en `CLAUDE_MODEL` está mal (debe ser `claude-opus-5`).

## Commit

```
fix(alertas): P-01 modo prensa con ventana diaria y dedup por dia

El motor estaba calibrado para volumen de redes sociales: ventana de 60 min, minimo 15
menciones por hora y 5 ataques del mismo origen. Con prensa sola (unica fuente activa hoy)
el candidato recibe 2-7 notas al dia, asi que ninguna alerta se abrio nunca, ni con 3 ataques
en un dia por los pedidos de exclusion ante el JEE.

Se hacen configurables la ventana (ALERT_WINDOW_MINUTES) y el umbral de ataque
(ALERT_ATTACK_MIN), con defaults identicos a los actuales. Con ventana >= 1 dia el dedup
pasa a ser diario; si no, el ciclo de 10 min recrearia la misma alerta cada hora.

.env local activa el modo prensa (1440 / 3 / 2). Al encender redes, volver a 60 / 15 / 5.
```
