# S2-11 — Alertas de crisis y oportunidad por candidato

**Objetivo:** que el sistema avise (Telegram + panel) cuando una figura sufre un pico de menciones negativas, un ataque de otro candidato o una ola positiva, con evidencia y respuesta sugerida. El sniffing pasa a ser el difusor WebSocket de ítems ya clasificados.

**Precondiciones:** S1-09 (clasificaciones), S1-10 (`notify.py`, Telegram configurado).

**Archivos a tocar:**
- nuevo `db/migrations/lima2026/005_alerts.sql`
- nuevos `app/services/alert_engine.py`, `app/api/endpoints/alerts.py`
- `app/models.py` (+ `Alert`), `app/api/__init__.py`, `app/services/scheduler.py` (+ `alert_loop`), `app/services/classifier.py` (hook post-clasificación → sniffing)
- `project-sniffing/microservice/main.py` (+ `POST /api/ingest`)
- `project-scrapping/app/main.py` (`_setup_proxy_routes`: nada; el ingest va directo scrapping→sniffing por URL interna)
- frontend: `config/api.ts`, nuevo `hooks/useAlerts.ts`, nuevo `components/dashboard/AlertsPanel.tsx`, `Dashboard.tsx`, `components/social/CrisisMonitoring.tsx` (consumir `/alerts`), `project-react/vite.config.ts` (sin cambio)
- `.env.example` (bloque `# S2-11`)

## Pasos — motor

1. Migración 005 + modelo `Alert` en `models.py` (columnas de la tabla).
2. `app/services/alert_engine.py`:
   - Parámetros: `SPIKE_FACTOR = float(os.getenv("ALERT_SPIKE_FACTOR", "3.0"))`, `MIN_MENTIONS = int(os.getenv("ALERT_MIN_MENTIONS", "15"))`, `NEG_SHARE = float(os.getenv("ALERT_NEG_SHARE", "0.6"))`, `DEBATE_MODE = os.getenv("DEBATE_MODE", "false").lower() == "true"` (en debate: ventana 5 min, baseline sobre 2 h, `MIN_MENTIONS` = 5).
   - `run_alert_cycle(db_url) -> dict`: para cada figura activa con `figure_role in ('candidate','incumbent')`:
     1. `mentions_1h` = contenidos distintos en `content_classifications` con `figure_id = f` y `content_published_at >= now-1h` (ventana 60 min; debate 5 min).
     2. `baseline_1h` = media por hora de los últimos 7 días (excluyendo la última hora); mínimo 1.
     3. `neg_share` = negativos / mentions_1h; `pos_share` análogo.
     4. `velocity = mentions_1h / baseline_1h`.
     5. Reglas (evaluar en este orden, una alerta por figura y ciclo):
        - `crisis`: `mentions_1h >= MIN_MENTIONS and velocity >= SPIKE_FACTOR and neg_share >= NEG_SHARE` → severidad `critical` si `velocity >= 2*SPIKE_FACTOR` else `high`.
        - `attack`: ≥ 5 filas con `is_attack and attacked_figure_id = f` en la ventana, agrupadas por `attacker_figure_id` (no nulo) → `high` si ≥ 10, else `medium`. Título "X ataca a Y: N menciones en 1 h".
        - `opportunity`: `mentions_1h >= MIN_MENTIONS and velocity >= SPIKE_FACTOR and pos_share >= 0.6` → `medium`.
        - `spike`: `velocity >= SPIKE_FACTOR and mentions_1h >= MIN_MENTIONS` sin dominancia de signo → `low`.
     6. `dedup_key = f"{figure_id}|{kind}|{now:%Y-%m-%dT%H}"` (una por figura/tipo/hora). Insertar con `ON CONFLICT (dedup_key) DO NOTHING`.
     7. `evidence`: hasta 10 contenidos de la ventana ordenados por engagement (posts) o fuente (noticias) con `{content_type, content_id, url, snippet[:200], source}`; la URL de noticias está en `news_articles.url`; la de posts en `extra_metadata.url` si existe o `https://x.com/<author>/status/<post_id>` para twitter / `https://www.youtube.com/watch?v=<post_id>` para youtube.
     8. Para `crisis`/`attack` con severidad `high`/`critical`: `suggested_response` vía `referencia/prompts/alerta-respuesta.md`.
     9. Notificar Telegram: `⚠️ *{severidad}* — {título}\n{detalle}\nEvidencia: {3 primeras urls}\n{respuesta sugerida si existe}`.
3. `app/api/endpoints/alerts.py`: `GET /alerts?status=open&figure_id=&limit=50` y `PUT /alerts/{id}` `{status}` (setea `acknowledged_at/by` cuando pasa de `open`). Prefijo `/alerts`.
4. `scheduler.py`: `alert_loop()` cada `ALERT_INTERVAL_MINUTES` (10; en `DEBATE_MODE` 2), arrancado en `start_scheduler()` si hay `ANTHROPIC_API_KEY` (el motor funciona sin Claude salvo la respuesta sugerida: si no hay clave, `suggested_response=None`; arrancar siempre).

## Pasos — sniffing como difusor

5. `project-sniffing/microservice/main.py`: añadir
   ```python
   class IngestItem(BaseModel):
       stream_id: str
       platform: str
       stream_type: str = "classified"
       content: str
       author_handle: Optional[str] = None
       realtime_sentiment: float = 0.0
       sentiment_confidence: float = 0.9
       political_relevance_score: float = 1.0
       urgency_score: float = 0.0
       is_trending: bool = False
       is_crisis_indicator: bool = False
       is_opportunity: bool = False
       detected_region: Optional[str] = None
       detected_keywords: List[str] = []
       political_entities: List[str] = []
       hashtags: List[str] = []
       message_timestamp: Optional[str] = None

   @app.post("/api/ingest")
   async def ingest(item: IngestItem):
       data = item.model_dump()
       data["message_timestamp"] = data.get("message_timestamp") or datetime.now(timezone.utc).isoformat()
       data["processing_latency_ms"] = 0
       storage.add_item(data)
       stream_counter.inc()
       await manager.broadcast(data)
       return {"ok": True}
   ```
6. `classifier.py`: tras persistir cada ítem clasificado con `relevance >= 0.5`, `httpx.post(f"{SNIFFING_URL}/api/ingest", json={...}, timeout=5)` en try/except silencioso, mapeando: `realtime_sentiment` = media de `stance` de las figuras del ítem (0 si ninguna), `political_entities` = display_names, `detected_region` = `zone`, `detected_keywords` = `[topic] + secondary`, `is_crisis_indicator` = `stance <= -0.5` para alguna figura, `is_opportunity` = `stance >= 0.5`. `SNIFFING_URL` ya está en env (`app/main.py` lo lee; exportarlo desde `config.py` como `SNIFFING_URL: str = os.getenv("SNIFFING_URL", "http://localhost:8080")`).

## Pasos — frontend

7. `config/api.ts`: `ALERTS: '/api/v1/alerts'`. `hooks/useAlerts.ts`: lista abierta con polling cada 60 s + `acknowledge(id)`, `dismiss(id)`.
8. `components/dashboard/AlertsPanel.tsx`: tarjetas por severidad (franja de color: critical rojo, high naranja, medium ámbar, low gris), título, figura, hace X min, 3 evidencias con enlace, respuesta sugerida plegable, botones "Atendida" / "Descartar". Reemplazar `RealtimeAlerts` en `Dashboard.tsx` por `AlertsPanel` (mantener `RealtimeAlerts` solo como feed WS secundario si se quiere; mínimo: `AlertsPanel` visible).
9. `components/social/CrisisMonitoring.tsx`: sustituir su fuente de datos (`/api/crisis-alerts` del sniffing) por `useAlerts()`; conservar la UI.

## Criterios de aceptación

1. Simulación: insertar 20 filas sintéticas en `content_classifications` para una figura con `stance=-0.8`, `content_published_at = now()` (script inline) y ejecutar `python -c "from app.services.alert_engine import run_alert_cycle; from app.config import settings; print(run_alert_cycle(settings.DATABASE_URL))"` → crea una alerta `crisis` (`SELECT kind, severity, title FROM alerts ORDER BY created_at DESC LIMIT 1`). Borrar las filas sintéticas después (`content_id LIKE 'test-%'`).
2. Repetir el ciclo en la misma hora no crea una segunda alerta (dedup).
3. Telegram recibe el mensaje (si está configurado).
4. `curl -X POST localhost:8080/api/ingest -d '{"stream_id":"t","platform":"news","content":"prueba"}' -H 'Content-Type: application/json'` → `{"ok":true}` y un cliente WS conectado (`useWebSocket` del frontend) recibe el ítem; `SELECT count(*) FROM realtime_data.live_streams` > 0.
5. `GET /alerts?status=open` devuelve la alerta; `PUT /alerts/{id} {"status":"acknowledged"}` la saca de la lista.
6. Dashboard muestra `AlertsPanel` con la alerta y el botón "Atendida" funciona.

## Commit

`feat(lima2026): S2-11 motor de alertas por candidato, Telegram, sniffing como difusor de ítems clasificados`
