# P-03 — `CampaignHeader` y `KpiStrip`

## Objetivo

Las dos primeras filas del Panel: quién es el candidato, cuánto falta y qué plazos legales vienen;
y los 4 KPI de campaña. Solo presentación: todo el dato viene de `useDashboard` (P-02).

## Precondiciones

- P-02 cerrado (`useDashboard` exporta `config`, `ownFigure`, `kpis`).

## Archivos a tocar

- `src/components/dashboard/CampaignHeader.tsx` — nuevo.
- `src/components/dashboard/KpiStrip.tsx` — nuevo.
- `src/utils/format.ts` — nuevo: `fmtInt(n)`, `fmtPct(n, decimals=1)`, `fmtSignedPts(n)` (formato es-PE).

## `CampaignHeader`

Props: `{ config: ElectoralConfig | null; ownFigure: PoliticalFigure | null; isLoading: boolean }`.
(`PoliticalFigure` es el tipo de `src/types/recommendations.ts` que usa `usePoliticalFigures`; impórtalo de donde lo exporta el hook.)

Estructura (una `Card glass` de ancho completo, `p-5`):

- Izquierda: punto de 12 px con `background: ownFigure.color`, luego `<h2 className="text-xl font-bold">{ownFigure.display_name}</h2>`
  y `<span className="text-sm text-gray-500">{ownFigure.party_name}</span>`. Debajo, en `text-sm text-gray-600 dark:text-gray-300`:
  `{config.election_name} · {formatElectoralDate(config.election_date)} · Fase: {PHASE_LABEL[config.phase]}`.
- Derecha: número grande `config.days_to_election` con `text-4xl font-bold` y debajo "días para la elección".
  Si `phase === 'election_day'` → "Hoy es la elección"; si `'post'` → "Elección realizada".
- Fila inferior: tres "píldoras" de hito (`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border`),
  cada una con icono `lucide-react` + texto, y **solo si el hito es futuro** (`days_to_* > 0`):
  - `Calendar` · "Candidaturas definitivas · {formatElectoralDate(candidacy_final_date)} · {days_to_candidacy_final} d"
  - `EyeOff` · "Veda de encuestas · {formatElectoralDate(poll_blackout_from)} · {days_to_poll_blackout} d"
  - `Megaphone` · "Cierre de propaganda · {formatElectoralDate(propaganda_deadline)} · {days_to_propaganda_deadline} d"
  Color de la píldora: `border-red-300 text-red-700 bg-red-50 dark:…` si faltan ≤ 7 días; ámbar si ≤ 21; gris si no.

`PHASE_LABEL`: `{ pre: 'Pre-campaña', campaign: 'Campaña', poll_blackout: 'Veda de encuestas', closing: 'Cierre de campaña', election_day: 'Día de la elección', post: 'Post-electoral' }`.

Estados: `isLoading` → `animate-pulse h-28`. `!config` → texto "No se pudo cargar la configuración electoral".
`!ownFigure` → cabecera sin punto ni nombre, con "Sin candidatura propia configurada" en lugar del nombre.

## `KpiStrip`

Props: `{ kpis: OwnKpis; ownColor: string | null; isLoading: boolean; ownName: string | null }`.

Rejilla `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4`. Cada KPI es una `Card glass hover className="p-5"`
con un componente interno `Kpi({title, value, line2, line3, accent, trendIcon?})`:

- `title`: `text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400`
- `value`: `text-3xl font-bold` con `style={{color: accent}}` cuando `accent` es hex; si es clase Tailwind, úsala.
- `line2`, `line3`: `text-xs text-gray-600 dark:text-gray-300`; `line3` con icono `TrendingUp`/`TrendingDown`/`Minus` según signo.

Contenido exacto (textos y formatos de `02-DISENO-OBJETIVO` → "Los 4 KPI"):

| KPI | `title` | `value` | `line2` | `line3` |
|---|---|---|---|---|
| 1 | Intención de voto | `fmtPct(poll.pct)` + " %" | `[${fmtPct(low)}–${fmtPct(high)}] · ${n_polls} encuestas` | `leads ? "+${fmtPct(gap)} pts sobre ${vsName}" : "${fmtSignedPts(gap)} pts bajo ${vsName}"` |
| 2 | Share of voice · 7 d | `fmtPct(sov.share_pct)` + " %" | `${fmtInt(news_mentions)} menciones en prensa` | `${fmtSignedPts(trend_pct)} % vs. semana previa` |
| 3 | Presión mediática · 7 d | `${negative} de ${total}` | "notas negativas en prensa" | `attacks24h != null ? "${attacks24h} ataques en 24 h" : ""` |
| 4 | Tema dominante · 7 d | `topics[0].label` (`text-2xl` si supera 18 caracteres) | `${fmtPct(topics[0].share_pct)} % de la conversación` | `topics[1] ? "↑ ${topics[1].label} ${fmtPct(topics[1].share_pct)} %" : ""` |

Acentos: 1 y 2 → `ownColor ?? '#1F6B73'`; 3 → ratio `negative/total`: ≥ 0,6 `#DC2626`, ≥ 0,3 `#B8741A`, si no `#2E7D4F`; 4 → `#1F6B73`.

Vacíos (cuando el slice es `null`/vacío): el `value` se sustituye por el texto de vacío en `text-sm text-gray-500`
y `line2`/`line3` se omiten. Textos: "Sin encuestas publicadas", "Sin menciones esta semana", "Sin cobertura esta semana", "Sin temas clasificados".

## `src/utils/format.ts`

```ts
const ES = 'es-PE';
export const fmtInt = (n: number) => Math.round(n).toLocaleString(ES);
export const fmtPct = (n: number, d = 1) => n.toLocaleString(ES, { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtSignedPts = (n: number, d = 1) => (n > 0 ? '+' : '') + fmtPct(n, d);
```

## Criterios de aceptación

1. `npx tsc --noEmit && npm run build` pasan; sin `any`.
2. Monta temporalmente ambos componentes al inicio del `Dashboard.tsx` actual (encima de la rejilla vieja) con
   datos de `useDashboard()`; en el navegador:
   - Cabecera muestra "Rafael López Aliaga", "Renovación Popular", punto celeste, "42" (o el valor del día) y
     **3 píldoras** con las fechas 5 sep / 28 sep / 2 oct; la de candidaturas en ámbar (≤ 21 d).
   - KPI 1: "27,8 %" · "[25,4–30,2] · 3 encuestas" · "+X,X pts sobre Carlos Bruce" (o el segundo vigente).
   - KPI 2: porcentaje > 0 y "N menciones en prensa".
   - KPI 3: "14 de 14" (o el vigente) en rojo y "3 ataques en 24 h" si hay brief del día.
   - KPI 4: "Transporte y tránsito" (o el vigente), nunca "Otro".
3. Modo oscuro (toggle del Header): todos los textos legibles, sin fondos blancos sólidos.
4. Ancho 1366 px con sidebar abierto: las 4 tarjetas en una fila sin corte (`xl:grid-cols-4` aplica desde 1280).
5. `grep -rn "mock\|TODO\|lorem" src/components/dashboard/CampaignHeader.tsx src/components/dashboard/KpiStrip.tsx` → 0.

## Si falla

- `formatElectoralDate` devuelve "—" para null: correcto, pero los hitos con fecha null no deben pintarse (condición `days_to_* != null && > 0`).
- Si `poll.gapPts` es 0 (empate), `line3` = "Empate con {vsName}".

## Commit

```
feat(panel): P-03 cabecera de campana y KPIs de la candidatura propia

Primera y segunda fila del nuevo Panel. La cabecera muestra candidato, partido, fase legal,
cuenta regresiva e hitos futuros (candidaturas definitivas, veda, cierre de propaganda) con
urgencia por color. Los 4 KPI salen de useDashboard: intencion de voto con rango y ventaja
sobre el segundo, share of voice en prensa, presion mediatica (notas negativas y ataques en
24 h) y tema dominante de la semana. Formato es-PE. Sin datos de ejemplo: cada KPI tiene su
estado vacio explicito.
```
