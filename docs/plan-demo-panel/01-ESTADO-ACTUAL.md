# 01 — Estado actual del Panel (verificado el 23-ago-2026)

Todo lo de abajo fue comprobado contra el código y el backend vivo en local, con token. Confía en ello.

## Qué ve el usuario hoy al entrar

`src/pages/MainApp.tsx:19-20` → `<Dashboard />` (`src/components/dashboard/Dashboard.tsx`, 42 líneas):

| Zona | Componente | Qué muestra hoy | Por qué está mal |
|---|---|---|---|
| Fila 1 | 4 × `MetricCard` vía `useDashboardData` | "Sentimiento Positivo 5 %", "Menciones Sociales 3 574", "Noticias Analizadas 2 166", "Datos Gubernamentales 15" | Cifras de la era presidencial. "Menciones sociales" suma 1 408 posts de enero–mayo (segunda vuelta) con noticias nacionales. Nada habla de Lima ni del candidato. |
| Fila 2 izq. | `TrendChart` | "No hay datos de tendencias disponibles" | `TrendChart.tsx:31` llama `/api/v1/analysis/time-series` **sin cabecera Authorization** → 422. Y aunque la pusiera, la serie se calcula sobre `sentiment_score` presidencial y devuelve `mentions: 0` en todos los días. |
| Fila 2 der. | `AlertsPanel` | "Sin alertas abiertas. El motor revisa cada 10 minutos." | El componente es correcto (era Lima, usa `useAlerts`). El problema es el **motor**: calibrado para volumen de redes (ver abajo). |
| Fila 3 | `GeographicMap` | "No hay datos regionales disponibles" | `GeographicMap.tsx:31` espera `sentimentData.by_region`, que `/analysis/sentiment` ya no devuelve. Era el mapa de 25 regiones presidencial. |
| Banner | `Dashboard.tsx:13-17` | (oculto, porque `hasData` es true) | Texto "Ejecuta el scraping desde Configuración" — concepto presidencial. |

Conclusión: **3 de 4 zonas vacías y la cuarta con números irrelevantes.** Coincide con lo que Walter describe.

## Archivos del Panel y veredicto

| Archivo | Líneas | Veredicto |
|---|---|---|
| `src/components/dashboard/Dashboard.tsx` | 42 | **Reescribir** (P-05) |
| `src/hooks/useDashboardData.ts` | 132 | **Borrar** (P-05). Solo lo usa `Dashboard.tsx`. |
| `src/components/dashboard/TrendChart.tsx` | 162 | **Borrar** (P-05). Solo lo usa `Dashboard.tsx`. |
| `src/components/dashboard/GeographicMap.tsx` | 166 | **Borrar** (P-05). Solo lo usa `Dashboard.tsx`. |
| `src/components/dashboard/MetricCard.tsx` | 78 | **Borrar** (P-05). Sin usos fuera de `dashboard/` (verificado con grep). El nuevo `KpiStrip` tiene otras necesidades (subtítulo, color de candidato, rango). |
| `src/components/dashboard/RealtimeAlerts.tsx` | — | **Borrar** (P-05). Dic-2025, sin usos fuera de `dashboard/`. |
| `src/components/dashboard/AlertsPanel.tsx` | 138 | **Conservar y reutilizar** tal cual. |
| `src/components/layout/Header.tsx:32` | — | Título `dashboard: 'Panel'` → cambiar (P-05). |
| `src/components/layout/Sidebar.tsx:24` | — | Etiqueta `'Panel'` → conservar. |

## Lo que SÍ existe y se reutiliza (era Lima, probado con datos reales)

Hooks (`src/hooks/`): `useRace(days, base)` → `{polls, average, publishable, blackoutFrom, sov, sentiment, topics, brief, ...}`;
`useTerritory({days, figureId})` → `{districts, zones}`; `useOpportunity(figureId)` → `{districts: OpportunityDistrict[]}` (en `useEvents.ts:123`);
`useElectoralConfig()` → `{config}`; `useAlerts(status, limit)`; `usePoliticalFigures()` → `{figures}` con `is_own_candidate`.
Tipos exportados en los mismos archivos (`Poll`, `PollAverage`, `SovFigure`, `SentimentFigure`, `TopicRow`, `Brief`, `DistrictStat`, `OpportunityDistrict`, `CampaignAlert`, `ElectoralConfig`).

Componentes:
- `race/PollAverageChart` `{polls, average, blackoutFrom, figureColors}` — evolución de encuestas con promedio ponderado (semivida 14 d). **14 encuestas con meses de historia**: es el gráfico de evolución de la demo.
- `race/ShareOfVoiceBars` `{figures, days}`; `race/TopicsToday` `{topics, days}`; `race/BriefPanel` `{brief, isGenerating, onGenerate}`.
- `territory/LimaMap` `{districts, metric: 'mentions'|'sentiment'|'opportunity', scores?, height?, compact?, selected?, onSelect?}` — mapa real de 43 distritos (GeoJSON).
- `recommendations/ElectoralCountdown` — cuenta regresiva; se toma como referencia visual pero **no** se reutiliza (no muestra candidato ni hitos).

Patrón para resolver la figura propia (copiar de `territory/TerritoryPage.tsx:45-57`):
```ts
const { figures } = usePoliticalFigures();
const ownFigure = useMemo(() => figures.find(f => f.is_own_candidate) || null, [figures]);
```

## Datos reales disponibles hoy (Neon, 23-ago 12:00 Lima)

| Fuente | Volumen | Observación para la demo |
|---|---|---|
| `news_articles` | 2 166 total · 213 de Lima · ~345 nuevas/día | El scheduler corre cada 2 h en local y en producción (misma base). |
| `content_classifications` | 224 (desde 21-ago) · crece ~60/día | **Solo 3 días de historia.** Por eso no hay gráfico de tendencia diaria: la evolución se muestra con encuestas. |
| `scraped_surveys` | 14 encuestas municipales con base válidos · promedio RLA 27,8 [25,4–30,2] con 3 encuestas | Última: CIT 13–15 ago. |
| `/race/share-of-voice?days=7` | RLA 14 menciones = 82,4 %; Urresti, Reggiardo | Solo prensa (`social_mentions` = 0 en todos). |
| `/race/sentiment?days=7` | RLA: 0 pos / 0 neu / **14 neg**, net −1.0 | Son las notas sobre los pedidos de exclusión ante el JEE (21–23 ago). **Real.** Ver enmarcado en `02`. |
| `/race/topics?days=7` | transporte 22,6 % (53), inseguridad 15 %… `top_figure` a veces es Keiko Fujimori | Es correcto: se monitorea a la presidenta; desactivó el paro de transportistas. |
| `/territory/districts` | 43 distritos con menciones; `/territory/zones` 5 zonas | Villa El Salvador 20, Cercado 19, Miraflores 15… |
| `/territory/opportunity` (propio) | 43 distritos con score; top: SJL 22,5 · SMP 14,2 · Comas 12,4 | Campo `why` explica cada score en español. |
| `/race/brief/latest` | Brief del 23-ago, `claude-opus-5`, headline sobre el JEE | Anidado en `{brief: {...}}`. Se regenera a las 07:00 (hora Lima) por el scheduler. |
| `/recommendations?figure_id=<RLA>` | 7 recomendaciones, `priority` critical/high, presupuesto, ROI, KPIs | "Blindaje legal ante la exclusión", "Operación SJL"… |
| `/alerts` | **0** | Motor mal calibrado para prensa sola → P-01. |
| `raw_social_posts` | 1 408, todos anteriores a julio | **Fuera de ventana. El Panel no debe mostrar nada "social".** |

## El motor de alertas: por qué no dispara (P-01)

`app/services/alert_engine.py`:
- `:18-20` umbrales: `SPIKE_FACTOR=3.0`, `MIN_MENTIONS=15`, `NEG_SHARE=0.6` (desde env).
- `:29-32` `_params()`: ventana **60 min**, línea base 7 días, mínimo 15 menciones **por hora**.
- `:226-228` ataque: requiere **≥ 5** ataques del mismo origen en la ventana (hardcodeado).
- `:252` `dedup_key` por **hora** → si se amplía la ventana a un día sin tocar esto, la misma alerta se recrearía cada 10 min.

Con prensa sola, RLA tiene ~14 menciones **por semana**. Ningún umbral se alcanza jamás. El diseño es correcto para
redes (miles de menciones/hora) y queda intacto; se añade un **modo prensa** configurable por env.

Cálculo de qué dispararía con ventana 24 h y mínimo 3 (datos del 23-ago): RLA n(24h) ≈ 5–7, base 6 días ≈ 9 → baseline ≈ 1,5/día
→ velocity ≈ 3–4 ≥ 3,0 y neg_share 1,0 ≥ 0,6 → **`crisis`**, severidad `high`/`critical`, con `suggested_response` generada por Claude.
Es exactamente la alerta que la demo necesita.
