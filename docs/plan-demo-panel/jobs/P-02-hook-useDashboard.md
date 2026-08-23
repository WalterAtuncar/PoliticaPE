# P-02 — Hook `useDashboard`

## Objetivo

Un solo hook que entregue al Panel todo lo que necesita, en paralelo, con degradación por widget.
No crea endpoints: compone los que existen.

## Precondiciones

- Backend local arriba y login hecho (token en `localStorage.auth_token`).

## Archivos a tocar

- `src/hooks/useDashboard.ts` — **nuevo**.
- `src/config/api.ts` — nada que añadir (todos los endpoints ya están en `ENDPOINTS`: `ELECTORAL_CONFIG`,
  `RACE_POLLS`, `RACE_SOV`, `RACE_SENTIMENT`, `RACE_TOPICS`, `RACE_BRIEF_LATEST`, `TERRITORY_DISTRICTS`,
  `TERRITORY_OPPORTUNITY`, `NEWS`, `RECOMMENDATIONS`, `POLITICAL_FIGURES`).

## Diseño

No reimplementes `useRace`/`useTerritory`/`useOpportunity`: **compónlos**. El hook nuevo solo añade lo
que no existe (noticias de Lima, recomendaciones propias, figura propia, comparativas de KPI).

```ts
// src/hooks/useDashboard.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';
import { useElectoralConfig } from './useElectoralConfig';
import { usePoliticalFigures } from './usePoliticalFigures';
import { useRace, PollAverage, SovFigure, SentimentFigure, TopicRow } from './useRace';
import { useTerritory } from './useTerritory';
import { useOpportunity } from './useEvents';

export interface LimaNewsItem {
  id: string; source: string; title: string; url: string; published_at: string | null;
  districts: { name: string; zone: string; ubigeo: string }[] | null;
  topics: { topic: string; secondary?: string[] } | null;
}

export interface DashboardRecommendation {
  id: string; title: string; priority: 'critical' | 'high' | 'medium' | 'low'; category: string;
  target_region: string | null; estimated_budget: { min: number; max: number } | null;
  expected_timeline: string | null; ai_confidence: number | null;
}

export interface OwnKpis {
  poll: { pct: number; low: number; high: number; n_polls: number; gapPts: number | null; vsName: string | null; leads: boolean } | null;
  sov: SovFigure | null;
  pressure: { negative: number; total: number; attacks24h: number | null } | null;
  topics: TopicRow[];   // sin 'otro', ya ordenados por share_pct desc (el backend ya ordena; no reordenar)
}

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function useDashboard() {
  const { config, isLoading: cfgLoading } = useElectoralConfig();
  const { figures } = usePoliticalFigures();
  const ownFigure = useMemo(() => figures.find(f => f.is_own_candidate) || null, [figures]);
  const race = useRace(7, 'validos');                       // polls 120 d, sov/sentiment/topics 7 d, brief
  const territory = useTerritory({ days: 7 });
  const opportunity = useOpportunity(ownFigure?.id);

  const [news, setNews] = useState<LimaNewsItem[]>([]);
  const [recs, setRecs] = useState<DashboardRecommendation[]>([]);
  const [extraLoading, setExtraLoading] = useState(true);
  const [extraError, setExtraError] = useState<string | null>(null);

  const fetchExtras = useCallback(async () => { /* ver abajo */ }, [ownFigure?.id]);
  useEffect(() => { fetchExtras(); }, [fetchExtras]);

  const figureColors = useMemo(() => { /* name -> color, desde figures con color */ }, [figures]);
  const opportunityScores = useMemo(() => Object.fromEntries(opportunity.districts.map(d => [d.ubigeo, d.score])), [opportunity.districts]);
  const kpis: OwnKpis = useMemo(() => { /* ver reglas */ }, [race.average, race.sov, race.sentiment, race.topics, race.brief, config?.own_candidate, ownFigure?.id]);

  return {
    config, ownFigure, figureColors, kpis,
    race,               // {polls, average, blackoutFrom, sov, sentiment, topics, brief, isLoading, isGenerating, generateBrief, refetch}
    territory,          // {districts, zones, isLoading, error, refetch}
    opportunity,        // {districts, isLoading, error, refetch}
    opportunityScores,
    news, recs, extraLoading, extraError, refetchExtras: fetchExtras,
    isLoading: cfgLoading || race.isLoading,
  };
}
```

### `fetchExtras` (noticias + recomendaciones)

```ts
setExtraLoading(true); setExtraError(null);
const b = API_CONFIG.SCRAPPING_BASE_URL; const headers = getAuthHeaders();
const [nRes, rRes] = await Promise.allSettled([
  fetch(`${b}${ENDPOINTS.NEWS}?scope=lima_metropolitana&limit=8`, { headers }),
  ownFigure?.id ? fetch(`${b}${ENDPOINTS.RECOMMENDATIONS}?figure_id=${ownFigure.id}`, { headers }) : Promise.reject(new Error('sin figura propia')),
]);
if (nRes.status === 'fulfilled' && nRes.value.ok) setNews(await nRes.value.json());
if (rRes.status === 'fulfilled' && rRes.value.ok) {
  const all: DashboardRecommendation[] = await rRes.value.json();
  setRecs([...all].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9) || (b.ai_confidence ?? 0) - (a.ai_confidence ?? 0)).slice(0, 3));
}
if (nRes.status === 'rejected' && rRes.status === 'rejected') setExtraError('No se pudo cargar');
setExtraLoading(false);
```

**Verifica la forma real de `/data/news`**: en el sondeo del 23-ago devolvió un **array** directo de
artículos (no `{items: []}`). Si en tu prueba viene envuelto, adapta una línea y anótalo. Los campos
`districts` (array de `{name, zone, ubigeo}`) y `topics` (`{topic, secondary}`) vienen **ya parseados**
como JSON, no como string.

### Reglas de `kpis`

- `poll`: `own = race.average.find(a => a.name === config?.own_candidate)`. Si no existe → `null`.
  `sorted = [...race.average].sort((a,b)=>b.pct-a.pct)`; `leads = sorted[0]?.name === own.name`;
  `vs = leads ? sorted[1] : sorted[0]`; `gapPts = vs ? +(own.pct - vs.pct).toFixed(1) : null`; `vsName = vs?.name ?? null`.
- `sov`: `race.sov.find(f => f.figure_id === ownFigure?.id) ?? null`.
- `pressure`: `s = race.sentiment.find(f => f.figure_id === ownFigure?.id)`; si no hay o `s.total === 0` → `null`.
  `attacks24h`: `race.brief?.data?.attacks_1d` — **ojo**: el tipo `Brief` de `useRace` no declara `data`.
  Amplía la interfaz `Brief` en `useRace.ts` con `data?: { attacks_1d?: { attacked: string; attacker: string | null; count: number }[] } | null`
  (cambio aditivo, no rompe nada). `attacks24h = sum(count) where attacked === config.own_candidate`, o `null` si no hay brief.
- `topics`: `race.topics.filter(t => t.topic !== 'otro')`.

## Criterios de aceptación

1. `npx tsc --noEmit && npm run build` pasan.
2. Añade temporalmente en `Dashboard.tsx` actual un `console.log(useDashboard())` (quítalo después) y en
   la consola del navegador verifica, con el backend local: `ownFigure.display_name === 'Rafael López Aliaga'`;
   `kpis.poll.pct === 27.8` (o el valor vigente de `/race/polls` → `average`); `kpis.poll.leads === true`;
   `kpis.sov.share_pct > 0`; `kpis.pressure.total > 0`; `kpis.topics[0].topic !== 'otro'`;
   `news.length === 8`; `recs.length === 3` y `recs[0].priority === 'critical'`; `opportunityScores['150132'] > 0` (SJL).
3. Network: exactamente estas llamadas al entrar al Panel, todas 200: `electoral/config`, `political-figures`,
   `race/polls`, `race/share-of-voice`, `race/sentiment`, `race/topics`, `race/brief/latest`,
   `territory/districts`, `territory/zones`, `territory/opportunity`, `data/news`, `recommendations`.
   (`useRace` dispara 5, `useTerritory` 2.) Ninguna duplicada.
4. Apaga el backend (`taskkill`), recarga: el hook no lanza excepción; `news` y `recs` quedan `[]`,
   `extraError` no nulo, `race.error` no nulo. Vuelve a levantarlo.
5. `grep -n "any" src/hooks/useDashboard.ts` → 0 resultados (o solo en comentarios).

## Si falla

- `/recommendations?figure_id=` devuelve 422: el backend espera UUID; `ownFigure.id` lo es. Si devuelve
  lista vacía, es que no hay recomendaciones para RLA → P-06 las genera; el hook está bien.
- `useOpportunity(undefined)` debe no llamar (ya hace `return` si no hay id: `useEvents.ts:131-132`).

## Commit

```
feat(panel): P-02 hook useDashboard que compone los endpoints de Carrera y Territorio

Un solo hook para el Panel: compone useRace, useTerritory, useOpportunity, useElectoralConfig y
usePoliticalFigures, y añade lo que faltaba (ultimas noticias de Lima, top 3 recomendaciones de
la candidatura propia, KPIs derivados). Promise.allSettled: un endpoint caido degrada su widget,
no la pantalla. Sin endpoint agregador nuevo en el backend.
```
