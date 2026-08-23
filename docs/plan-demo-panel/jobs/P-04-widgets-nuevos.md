# P-04 — Widgets nuevos: `TopOpportunities`, `LatestLimaNews`, `TopRecommendations`

## Objetivo

Los tres widgets que no existen en ninguna pantalla. Pequeños, de solo lectura, con enlace a la pantalla
completa correspondiente cuando aplica.

## Precondiciones

- P-02 cerrado. Tipos `OpportunityDistrict` (`useEvents.ts`), `LimaNewsItem` y `DashboardRecommendation` (`useDashboard.ts`).

## Archivos a tocar

- `src/components/dashboard/TopOpportunities.tsx` — nuevo.
- `src/components/dashboard/LatestLimaNews.tsx` — nuevo.
- `src/components/dashboard/TopRecommendations.tsx` — nuevo.
- `src/utils/time.ts` — nuevo: mover aquí `timeAgo` desde `AlertsPanel.tsx:23-28` y que `AlertsPanel` lo importe.
- `src/components/dashboard/AlertsPanel.tsx` — solo el import de `timeAgo`.

Etiquetas de tema: reutiliza el diccionario que ya usa `race/TopicsToday` o `territory/DistrictPanel`
(busca `TOPIC_LABELS` o similar con `grep -rn "inseguridad" src/components | head`). Si está duplicado
en dos sitios, **no** lo unifiques ahora; importa uno y anótalo.

## `TopOpportunities`

Props: `{ districts: OpportunityDistrict[]; isLoading: boolean; error: string | null; ownName: string | null; onRetry: () => void }`.

`Card glass p-5`. Título "Dónde ganar" + subtítulo "Top 5 distritos por oportunidad para {ownName} · 30 d".
Lista de `districts.slice(0, 5)` (ya vienen ordenados por `rank`): fila `flex items-center gap-3 py-2 border-b last:border-0`:

- `rank` en círculo `w-6 h-6 rounded-full bg-[#B8741A] text-white text-xs font-bold`.
- `name` `font-medium` + `zone` `text-xs text-gray-500` debajo.
- `fmtInt(electors)` electores `text-xs`.
- Barra horizontal de `score` relativa al máximo (`w-24 h-2 rounded bg-gray-200` con relleno `#B8741A`).
- `score` `text-sm font-semibold` con 1 decimal.
- Chip del `topic` (etiqueta en español) y, si `rival_name`, `text-xs text-gray-500` "rival: {rival_name}".
- `title={why}` en la fila (tooltip nativo con la explicación que genera el backend).

Vacío: "Aún no hay score de oportunidad para la candidatura." Error: "No se pudo cargar. Reintentar".

## `LatestLimaNews`

Props: `{ news: LimaNewsItem[]; isLoading: boolean; error: string | null; onRetry: () => void }`.

`Card glass p-5`. Título "Últimas noticias de Lima" + subtítulo "Clasificadas por IA · {news.length} más recientes".
Fila por noticia (`py-2 border-b last:border-0`):

- Línea 1: `source` `text-xs font-medium text-[#1F6B73]` · `timeAgo(published_at)` `text-xs text-gray-400`.
- Línea 2: `<a href={url} target="_blank" rel="noreferrer" className="text-sm text-gray-900 dark:text-white hover:underline line-clamp-2">{title}</a>`.
- Línea 3: chips `text-[10px] rounded px-1.5 py-0.5`: tema (`topics.topic` → etiqueta, fondo teal claro) y hasta 2 distritos
  (`districts[].name`, fondo gris). Si `topics` es null (noticia aún sin clasificar) no pintes chip de tema.

Vacío: "Sin noticias de Lima en las últimas horas."

## `TopRecommendations`

Props: `{ recs: DashboardRecommendation[]; isLoading: boolean; error: string | null; onRetry: () => void }`.

Fila de ancho completo: título "Qué hacer esta semana" `text-sm font-semibold` + subtítulo "Recomendaciones de la IA para la candidatura" y
`grid grid-cols-1 lg:grid-cols-3 gap-4` con una `Card glass hover p-4` por recomendación:

- Chip de prioridad (clases de severidad de `AlertsPanel.tsx:5-10`: critical→red, high→orange, medium→amber, low→gray; etiquetas Crítica/Alta/Media/Baja).
- `title` `font-medium text-sm line-clamp-2`.
- `target_region` `text-xs text-gray-500` con icono `MapPin`.
- Pie `text-xs text-gray-600 dark:text-gray-300`: `S/ {fmtInt(min)} – {fmtInt(max)}` si hay presupuesto · `{ai_confidence} % confianza` si hay.
- `expected_timeline` `text-[11px] text-gray-400 line-clamp-1`.

Vacío: "Sin recomendaciones generadas. Genera desde Recomendaciones IA."

## Criterios de aceptación

1. `npx tsc --noEmit && npm run build` pasan; sin `any`; `AlertsPanel` sigue compilando con `timeAgo` importado de `utils/time`.
2. Montados temporalmente en el `Dashboard.tsx` actual con `useDashboard()`:
   - `TopOpportunities`: 5 filas, la primera "San Juan de Lurigancho · Lima Este · 823 056" con score 22,5 (o el vigente);
     tooltip al pasar el ratón muestra el texto `why`.
   - `LatestLimaNews`: 8 filas, todas con fuente y enlace que abre en pestaña nueva; ≥ 6 con chip de tema y ≥ 6 con chip de distrito.
   - `TopRecommendations`: 3 tarjetas, la primera con chip "Crítica"; presupuesto con formato "S/ 180 000 – 320 000".
3. Modo oscuro legible.
4. Sin scroll horizontal a 1366 px.

## Si falla

- `published_at` null en alguna noticia: `timeAgo` debe devolver "" (no "NaN"). Añade el guard en `utils/time.ts`.
- Si `/data/news` trae noticias sin `topics` (recién scrapeadas, aún no clasificadas), es normal: el chip de tema se omite.

## Commit

```
feat(panel): P-04 top oportunidades, ultimas noticias de Lima y top recomendaciones

Tres widgets de solo lectura para el Panel. Oportunidad: top 5 distritos con score, electores,
tema y rival (tooltip con el porque del backend). Noticias: las 8 ultimas de Lima con fuente,
enlace, tema y distritos detectados por la IA, para que el equipo vea la materia prima.
Recomendaciones: las 3 de mayor prioridad para la candidatura con presupuesto y confianza.
timeAgo pasa a utils/time para compartirlo con AlertsPanel.
```
