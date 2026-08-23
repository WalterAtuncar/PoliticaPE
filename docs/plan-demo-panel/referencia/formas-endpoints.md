# Formas exactas de los endpoints que consume el Panel

Sondeadas contra el backend local el 23-ago-2026 con token. Todos bajo `/api/v1`, todos exigen
`Authorization: Bearer <token>` (sin ella: 422 `header Authorization Field required`). Login:
`POST /auth/login {"email","password"}` → `{"success", "token", "user":{id,email,name,role,tenant_id}}`.

Convención de esta ficha: `[n]` = array de n elementos de la forma indicada; `?` = puede ser null.

## `GET /electoral/config`
```
election_name: "Elecciones Municipales de Lima Metropolitana 2026"
election_type: "municipal"            electoral_district: "Lima Metropolitana"     rounds: 1
own_candidate: "Rafael López Aliaga"  election_date: "2026-10-04"                  today: "2026-08-23"
candidacy_final_date: "2026-09-05"    poll_blackout_from: "2026-09-28"
rally_deadline: "2026-10-01"          propaganda_deadline: "2026-10-02"            debate_date: null
phase: "pre"                          (pre|campaign|poll_blackout|closing|election_day|post)
days_to_election: 42   days_to_propaganda_deadline: 40   days_to_poll_blackout: 36   days_to_candidacy_final: 13
polls_publishable: true
```

## `GET /political-figures` → array[24]
```
id (uuid), display_name, full_name, nickname?, party_name, color ("#00AEEF"), is_own_candidate (bool),
figure_role ("candidate"|"incumbent"|...), is_active, list_name?, search_keywords[], ...
```
RLA: `id = 0849e7c7-7850-4b8b-be5d-35e67ac57572`.

## `GET /race/polls?base=validos&days=120`
```
base: "validos"
polls: [14]  { id, pollster: "CIT", source, field_dates: "13–15 ago 2026", published_at: "2026-08-15T00:00:00",
               sample_size: 500, margin_error: 4.4, base, candidates: [9] {name, figure_id?, pct},
               undecided?, blank?, manual: false, internal_only: false }
average: [9] { name: "Rafael López Aliaga", figure_id, pct: 27.8, low: 25.4, high: 30.2, n_polls: 3 }
publishable: true          blackout_from: "2026-09-28"
```
`average` viene ordenado por `pct` desc. `polls` ordenado por `published_at` desc.

## `GET /race/share-of-voice?days=7`
```
period_days: 7
figures: [22] { figure_id, name, party_name?, color?, news_mentions: 14, social_mentions: 0, total: 14,
                share_pct: 82.4, trend_pct: 100.0 }
```
Ordenado por `total` desc. Las figuras sin menciones vienen con ceros (no se omiten).

## `GET /race/sentiment?days=7`
```
period_days: 7     zone: null
figures: [22] { figure_id, name, color?, positive: 0, neutral: 0, negative: 14, total: 14, net_sentiment: -1.0,
                by_zone: { "Lima Sur": {n, net?}, ... } }
```

## `GET /race/topics?days=7`
```
period_days: 7
topics: [14] { topic: "transporte", label: "Transporte y tránsito", mentions: 53, share_pct: 22.6,
               delta_vs_prev_pct: 100.0, net_sentiment: 0.108?, top_figure: "Keiko Fujimori"? }
```
Ordenado por `mentions` desc. **Puede incluir `topic: "otro"`** en cualquier posición: filtrar en cliente.

## `GET /race/brief/latest`
```
brief: {                                   ← anidado; puede ser null si nunca se generó
  id, brief_date: "2026-08-23", generated_at, model: "claude-opus-5",
  headline: "JEE admite dos pedidos de exclusión contra López Aliaga y le da un día para responder",
  body_markdown: "# ...\n\n## Qué pasó ayer\n- ...",
  data: { kind: "daily", phase: "pre",
          top_items: [15] {url, zone?, title, topic, source, stance: "-0.400", summary, relevance: "1.00", content_type, content_published_at},
          topics_1d: [11] {label, topic, mentions, share_pct, top_figure?, net_sentiment?, delta_vs_prev_pct},
          attacks_1d: [2] {count: 3, attacked: "Rafael López Aliaga", attacker: null, example_url},
          race_polls: {latest: [...], average: [...]} },
  sent_channels: {email: false, telegram: false}, status: "generated" }
```
`POST /race/brief/generate?send=false&force=true` → mismo objeto. ~30 s.

## `GET /territory/districts?days=7`
```
period_days: 7
districts: [43] { ubigeo: "150142", name: "Villa El Salvador", zone: "Lima Sur", electors: 366000, mentions: 20,
                  net_sentiment: -0.4?, top_topic: "servicios_basicos"?, topics: {servicios_basicos: 6, ...},
                  figures: { "<figure_id>": {mentions, net?} } }
```
Siempre 43 (los sin menciones vienen con `mentions: 0`). Zonas: Lima Norte, Lima Sur, Lima Este, Lima Centro, Lima Moderna.

## `GET /territory/zones` → `{period_days, zones: [5] {zone, electors, mentions, districts, net_sentiment?}}`

## `GET /territory/opportunity[?figure_id=]`
```
figure_id, period_days: 30
districts: [43] { ubigeo, name, zone, electors, undecided_share: 0.3, own_strength: 27.8, rival_strength: 18.5,
                  rival_name: "Carlos Bruce"?, topic: "inseguridad"?, topic_weight: 1.0, own_mentions: 0,
                  score: 22.5, why: "San Juan de Lurigancho: 823 056 electores · 30 % indecisos ...", rank: 1 }
```
Sin `figure_id` usa la figura `is_own_candidate` (400 si no hay ninguna). Ordenado por `rank`. ~1–2 s.

## `GET /alerts?status=open&limit=5`
```
alerts: [n] { id, figure_id?, figure_name?, figure_color?, kind: crisis|attack|opportunity|spike,
              severity: critical|high|medium|low, title, detail?, metrics: {mentions_1h, baseline_1h, neg_share, pos_share, velocity}?,
              evidence: [≤10] {content_type, content_id, url, snippet, source}?, suggested_response?, status, created_at }
```
`PUT /alerts/{id}` body `{"status": "acknowledged"|"dismissed"}` (lo usa `useAlerts`).

## `GET /data/news?scope=lima_metropolitana&limit=8` → **array** directo
```
[8] { id, source: "Panamericana TV", title, content?, author?, published_at: "2026-08-23T16:48:45", scraped_at, url,
      category?, tags?, sentiment_score?, political_entities?, scope: "lima_metropolitana",
      districts: [2] {name, zone, ubigeo}?, topics: {topic: "servicios_basicos", secondary: ["obras_infraestructura"]}? }
```
`districts` y `topics` son JSON ya parseado (pueden ser null si aún no se clasificó). Ordenado por `published_at` desc.

## `GET /recommendations?figure_id=<uuid>` → **array** directo
```
[n] { id, figure_id, title, description, category: "territorial_priority", priority: critical|high|medium|low,
      status: "generated", target_region?, target_demographic?, identified_weakness?, recommended_action?,
      estimated_budget: {min: 180000, max: 320000}?, expected_timeline?, projected_roi?, ai_confidence: 86.0?,
      resources_needed[], success_kpis[], risk_factors[], created_at }
```
Sin `limit` garantizado: recortar en cliente. `POST /recommendations/generate {"figure_ids":[uuid]}` → `{recommendations: [7], count}` (1–2 min).

## Tiempos medidos (local contra Neon, 23-ago, en frío)
`electoral/config` 2 ms · `political-figures` 260 ms · `race/polls` 510 ms · `race/share-of-voice` 440 ms ·
`race/sentiment` 340 ms · `race/topics` 600 ms · `race/brief/latest` 340 ms · `territory/districts` 430 ms ·
`territory/zones` 430 ms · `territory/opportunity` **1 100 ms** · `data/news` 260 ms · `recommendations` 340 ms.
En paralelo, el Panel completo pinta en ~1,5 s (limitado por `opportunity`). Cada llamada paga ~250 ms de ida y
vuelta a Neon (us-east-1); es el suelo, no se optimiza en este plan.
