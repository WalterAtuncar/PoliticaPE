# 02 — Diseño objetivo: la sala de guerra

## Enmarcado (léelo antes de pintar nada)

La demo es para **Renovación Popular**. El Panel se lee como *"la campaña de López Aliaga, hoy"*.
Cada widget responde una pregunta que un jefe de campaña hace a las 8 de la mañana:

1. ¿Cuánto falta y qué plazo legal se me viene? → **Cabecera**
2. ¿Cómo vamos en intención de voto, cuánto hablan de nosotros, con qué signo, de qué habla Lima? → **KPIs**
3. ¿Cómo ha evolucionado la carrera? → **Encuestas** (meses de historia real)
4. ¿Qué está pasando AHORA que requiere reacción? → **Alertas** (con respuesta sugerida)
5. ¿Dónde debo poner el próximo mitin? → **Mapa de oportunidad + top 5 distritos**
6. ¿De qué habla Lima esta semana? → **Temas**
7. ¿Qué dice la IA que pasó ayer? → **Brief diario**
8. ¿Esto sale de datos reales? → **Últimas noticias de Lima clasificadas** (la materia prima, con enlace)
9. ¿Y qué hago? → **Top 3 recomendaciones IA**

**El dato negativo es el argumento de venta.** Hoy el 100 % de la cobertura sobre RLA es negativa por los
pedidos de exclusión admitidos por el JEE Lima Centro. El Panel lo muestra así, sin suavizar, y la
historia que cuenta es: *detectamos la crisis (alerta) → la resumimos (brief) → propusimos la
respuesta (recomendación "Blindaje legal")*. El KPI se etiqueta **"Presión mediática"**, no
"Sentimiento", porque mide la carga negativa en prensa sobre el candidato, que es lo que un equipo
quiere vigilar. No se usa la palabra "negativo" como título de tarjeta.

## Wireframe (ancho útil ≈ 1 056 px con sidebar abierto en 1366, ≈ 1 610 px en 1920)

```
+---------------------------------------------------------------------------------------+
| CampaignHeader  * Rafael Lopez Aliaga · Renovacion Popular             Faltan 42 dias |
|   Elecciones Municipales de Lima Metropolitana · dom 4 oct 2026 · Fase: pre-campana   |
|   Hitos: Candidaturas definitivas 5 sep (13 d) · Veda de encuestas 28 sep (36 d)       |
|          Cierre de propaganda 2 oct (40 d)                                             |
+------------------+------------------+------------------+------------------------------+
| KPI Intencion    | KPI Share of     | KPI Presion      | KPI Tema dominante           |
| de voto          | voice (7 d)      | mediatica (7 d)  | (7 d)                        |
| 27,8 %           | 82,4 %           | 14 de 14         | Transporte y transito        |
| [25,4-30,2]      | 14 menciones     | notas negativas  | 22,6 % de la conversacion    |
| +10,4 vs Bruce   | en prensa        | 3 ataques en 24h | ^ Inseguridad 15 %           |
+------------------+------------------+---------+--------+------------------------------+
| Evolucion de encuestas  (PollAverageChart)    | Alertas abiertas  (AlertsPanel)        |
| 14 encuestas · promedio ponderado · veda      | [!] Critica · Crisis · RLA · hace 2 h  |
|                                  [col-span-2] |   Pico negativo: 6 menciones (4x)      |
|                                               |   > Ver evidencia y respuesta sugerida |
+-----------------------------------------------+----------------------------------------+
| Donde ganar  (LimaMap compact, opportunity)   | Temas de la semana  (TopicsToday)      |
| + TopOpportunities: 5 filas                   | transporte 22,6 % ^ · inseguridad ...  |
|   1 SJL 823 056 · 22,5 · inseguridad          |                                        |
+-----------------------------------------------+----------------------------------------+
| Brief de hoy  (BriefPanel)                    | Ultimas noticias de Lima               |
| "JEE admite dos pedidos de exclusion..."      | (LatestLimaNews, 8 filas)              |
| Que paso ayer · Tema del dia · ...            | Panamericana · VES y VMT en emergencia |
|                                               |   servicios_basicos · Villa El Salvador|
+-----------------------------------------------+----------------------------------------+
| Que hacer esta semana  (TopRecommendations, 3 tarjetas)                                |
| [Critica] Blindaje legal ante la exclusion  [Critica] Operacion SJL  [Alta] Mensaje... |
+---------------------------------------------------------------------------------------+
```

Rejilla Tailwind: contenedor `space-y-6`; fila 2 en `grid grid-cols-1 lg:grid-cols-3 gap-6`
(encuestas `lg:col-span-2`), filas 3–4 en `lg:grid-cols-2`, fila 5 `lg:grid-cols-3`. En < 1024 px todo
apila en una columna. **Sin scroll horizontal** en 1366 × 768 con sidebar abierto (280 px).

## Widget por widget: fuente, campos, estado vacío

| Widget | Archivo | Fuente (endpoint · hook) | Campos usados | Estado vacío (texto exacto) |
|---|---|---|---|---|
| `CampaignHeader` | `dashboard/CampaignHeader.tsx` (nuevo) | `/electoral/config` · `useElectoralConfig` + `ownFigure` | `own_candidate`, `election_name`, `election_date`, `phase`, `days_to_election`, `days_to_candidacy_final`, `days_to_poll_blackout`, `days_to_propaganda_deadline`, `candidacy_final_date`, `poll_blackout_from`, `propaganda_deadline`; de la figura: `party_name`, `color` | Si no hay `ownFigure`: "Sin candidatura propia configurada" y se omite el punto de color. |
| `KpiStrip` | `dashboard/KpiStrip.tsx` (nuevo) | ver tabla de KPIs abajo | | cada KPI tiene el suyo |
| Encuestas | `race/PollAverageChart` (reuso) | `/race/polls?base=validos&days=120` · `useRace` | `polls`, `average`, `blackoutFrom`; `figureColors` = mapa `name → color` construido desde `figures` | El componente ya gestiona "sin encuestas". |
| Alertas | `dashboard/AlertsPanel` (reuso) | `/alerts?status=open` · `useAlerts('open', 5)` | todo | Ya existe: "Sin alertas abiertas. El motor revisa cada 10 minutos." **Cambiar a** "Sin alertas abiertas en las últimas 24 h." (P-05). |
| Mapa | `territory/LimaMap` (reuso) | `/territory/districts?days=7` + `/territory/opportunity?figure_id=` | `districts`, `scores = {ubigeo: score}`, `metric='opportunity'`, `compact`, `height=360` | Mapa gris + "Sin datos territoriales aún" |
| `TopOpportunities` | `dashboard/TopOpportunities.tsx` (nuevo) | `/territory/opportunity?figure_id=` · `useOpportunity(ownFigure.id)` | `rank`, `name`, `zone`, `electors`, `score`, `topic`, `rival_name`, `why` (atributo `title` para tooltip) | "Aún no hay score de oportunidad para la candidatura." |
| Temas | `race/TopicsToday` (reuso) | `/race/topics?days=7` · `useRace(7)` | `topics` | Ya lo gestiona. |
| Brief | `race/BriefPanel` (reuso) | `/race/brief/latest` · `useRace` | `brief`, `isGenerating`, `onGenerate` | Ya lo gestiona (muestra botón "Generar brief"). |
| `LatestLimaNews` | `dashboard/LatestLimaNews.tsx` (nuevo) | `/data/news?scope=lima_metropolitana&limit=8` (fetch directo en `useDashboard`) | `source`, `title`, `url`, `published_at`, `districts[].name`, `topics.topic` | "Sin noticias de Lima en las últimas horas." |
| `TopRecommendations` | `dashboard/TopRecommendations.tsx` (nuevo) | `/recommendations?figure_id=<own>` (fetch directo) | `title`, `priority`, `category`, `target_region`, `estimated_budget.{min,max}`, `expected_timeline`, `ai_confidence` | "Sin recomendaciones generadas. Genera desde Recomendaciones IA." |

`/recommendations` filtra por `figure_id` pero no tiene `limit` garantizado: recortar en el cliente a 3 tras
ordenar por `priority` (critical > high > medium > low) y luego `ai_confidence` desc. `/data/news` sí acepta `limit`.

## Los 4 KPI (exactos)

| # | Título | Valor grande | Línea 2 | Línea 3 (comparativa) | Fuente | Vacío |
|---|---|---|---|---|---|---|
| 1 | Intención de voto | `avg.pct` con 1 decimal + " %" | "[`low`–`high`] · `n_polls` encuestas" | "+X,X pts vs `segundo.name`" o "−X,X pts vs `primero.name`" si no lidera | `average` de `useRace`, entrada cuyo `name === own_candidate` | "Sin encuestas publicadas" |
| 2 | Share of voice · 7 d | `share_pct` + " %" | "`news_mentions` menciones en prensa" | "`trend_pct` % vs. semana previa" con flecha | `sov` de `useRace(7)`, `figure_id === ownFigure.id` | "Sin menciones esta semana" |
| 3 | Presión mediática · 7 d | "`negative` de `total`" | "notas negativas en prensa" | "`attacks24h` ataques en 24 h" — `attacks24h` = suma de `count` en `brief.data.attacks_1d` donde `attacked === own_candidate`; si no hay brief, omitir la línea | `sentiment` de `useRace(7)` | "Sin cobertura esta semana" |
| 4 | Tema dominante · 7 d | `topics[0].label` | "`share_pct` % de la conversación" | "↑ `topics[1].label` `share_pct` %" | `topics` de `useRace(7)`, excluyendo `topic === 'otro'` | "Sin temas clasificados" |

Números en formato peruano: coma decimal, espacio fino de miles (`toLocaleString('es-PE')`).

Color de acento de cada tarjeta: KPI 1 y 2 usan `ownFigure.color` (#00AEEF); KPI 3 usa rojo
(`text-red-600`) si `negative/total ≥ 0.6`, ámbar si ≥ 0.3, verde si no; KPI 4 usa teal `#1F6B73`.

## Lo que NO va en el Panel y por qué

- **Nada social** (Twitter/YouTube/Instagram). No hay datos en ventana. Mostrar un "0" sería un cero falso.
- **Tendencia diaria de menciones.** Solo hay 3–6 días de clasificación; un gráfico de 3 puntos
  debilita la demo. La evolución la cuentan las encuestas (meses reales).
- **Datos gubernamentales** (`government_data`, 15 filas presidenciales). Concepto muerto.
- **Eventos/voluntarios.** Tablas vacías (0). Si RP quiere verlos, la pantalla Territorio → Eventos los tiene.
