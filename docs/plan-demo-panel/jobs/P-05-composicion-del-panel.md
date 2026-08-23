# P-05 — Composición del Panel y limpieza de restos presidenciales

## Objetivo

Reescribir `Dashboard.tsx` con la rejilla de `02-DISENO-OBJETIVO`, reutilizando los componentes de
Carrera y Territorio, y borrar los 5 archivos de la era presidencial. Al cerrar este trabajo el Panel
está completo.

## Precondiciones

- P-02, P-03, P-04 cerrados. P-01 cerrado (para que Alertas tenga contenido).

## Archivos a tocar

- `src/components/dashboard/Dashboard.tsx` — reescribir entero.
- `src/components/dashboard/AlertsPanel.tsx:110` — `useAlerts('open', 20)` → `useAlerts('open', 5)`;
  `:126-128` texto vacío → "Sin alertas abiertas en las últimas 24 h."
- `src/components/layout/Header.tsx:32` — `dashboard: 'Panel'` → `dashboard: 'Panel de campaña — Lima 2026'`.
- **Borrar**: `src/hooks/useDashboardData.ts`, `src/components/dashboard/TrendChart.tsx`,
  `src/components/dashboard/GeographicMap.tsx`, `src/components/dashboard/MetricCard.tsx`,
  `src/components/dashboard/RealtimeAlerts.tsx`. Antes de borrar cada uno: `grep -rn "<Nombre>" src` debe
  devolver solo su propio archivo y `Dashboard.tsx`. Si algún otro archivo lo importa, **no lo borres**, anótalo.
- `src/types/index.ts` (o donde viva `PoliticalMetric`): si tras borrar `MetricCard` y `useDashboardData` el tipo
  `PoliticalMetric` queda sin usos (`grep -rn PoliticalMetric src`), bórralo también.

## `Dashboard.tsx` nuevo

```tsx
import React, { useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { CampaignHeader } from './CampaignHeader';
import { KpiStrip } from './KpiStrip';
import { AlertsPanel } from './AlertsPanel';
import { TopOpportunities } from './TopOpportunities';
import { LatestLimaNews } from './LatestLimaNews';
import { TopRecommendations } from './TopRecommendations';
import { PollAverageChart } from '../race/PollAverageChart';
import { TopicsToday } from '../race/TopicsToday';
import { BriefPanel } from '../race/BriefPanel';
import { LimaMap } from '../territory/LimaMap';
import { Card } from '../ui/Card';

export const Dashboard: React.FC = () => {
  const d = useDashboard();
  const ownName = d.ownFigure?.display_name ?? null;

  return (
    <div className="space-y-6">
      <CampaignHeader config={d.config} ownFigure={d.ownFigure} isLoading={d.isLoading} />
      <KpiStrip kpis={d.kpis} ownColor={d.ownFigure?.color ?? null} ownName={ownName} isLoading={d.race.isLoading} />

      {/* Fila 2: encuestas (2/3) + alertas (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Evolución de encuestas" subtitle={`${d.race.polls.length} encuestas · promedio ponderado · base válidos`}>
            <PollAverageChart polls={d.race.polls} average={d.race.average} blackoutFrom={d.race.blackoutFrom} figureColors={d.figureColors} />
          </SectionCard>
        </div>
        <AlertsPanel />
      </div>

      {/* Fila 3: mapa + top oportunidades (1/2) · temas (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <SectionCard title="Dónde ganar" subtitle="Oportunidad por distrito · 30 d">
            <LimaMap districts={d.territory.districts} metric="opportunity" scores={d.opportunityScores} height={340} compact />
          </SectionCard>
          <TopOpportunities districts={d.opportunity.districts} isLoading={d.opportunity.isLoading} error={d.opportunity.error} ownName={ownName} onRetry={d.opportunity.refetch} />
        </div>
        <SectionCard title="Temas de la semana" subtitle="De qué habla Lima · 7 d">
          <TopicsToday topics={d.kpis.topics} days={7} />
        </SectionCard>
      </div>

      {/* Fila 4: brief (1/2) · noticias (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BriefPanel brief={d.race.brief} isGenerating={d.race.isGenerating} onGenerate={d.race.generateBrief} />
        <LatestLimaNews news={d.news} isLoading={d.extraLoading} error={d.extraError} onRetry={d.refetchExtras} />
      </div>

      {/* Fila 5: recomendaciones */}
      <TopRecommendations recs={d.recs} isLoading={d.extraLoading} error={d.extraError} onRetry={d.refetchExtras} />
    </div>
  );
};
```

`SectionCard` es un componente local (mismo archivo, 10 líneas): `Card glass p-5` con `h3` título y `p` subtítulo
según `03-CONVENCIONES`, y `children`. **Revisa antes** si `PollAverageChart`, `TopicsToday` o `BriefPanel` ya
pintan su propia `Card` con título (abre cada uno). Si lo hacen, **no los envuelvas** en `SectionCard`: úsalos
directos para no duplicar tarjeta dentro de tarjeta. Anota en el reporte cuál fue el caso.

`LimaMap` pinta los distritos de `districts` y colorea con `scores` (`metric="opportunity"`). Si `districts` está
vacío mientras carga, muestra el mapa gris: aceptable. `height={340}` con `compact` (zoom 9, sin controles).
Si el mapa es Leaflet y necesita `leaflet.css`, ya está importado donde lo usa `TerritoryPage` — comprueba que el
Panel lo vea (si el CSS está importado en `TerritoryPage.tsx` y no globalmente, muévelo a `src/main.tsx`).

**`TopicsToday` con `d.kpis.topics`** (sin "otro") y no con `d.race.topics`: la tabla de temas no debe arrancar con "Otro".

## Criterios de aceptación

1. `npx tsc --noEmit && npm run build` pasan. `grep -rn "useDashboardData\|TrendChart\|GeographicMap\|MetricCard\|RealtimeAlerts" src` → 0.
2. Navegador, Panel, backend local, ventana 1366×768, sidebar abierto:
   - Se ven **las 5 filas** del wireframe sin scroll horizontal (`document.documentElement.scrollWidth === window.innerWidth` en consola).
   - Ninguna tarjeta dice "No hay datos", "Aún no hay datos recolectados", "Ejecuta el scraping", "Región", "Datos Gubernamentales", "Menciones Sociales".
   - Encuestas: el gráfico pinta ≥ 5 líneas de candidato con colores de partido y la línea de veda en 28-sep.
   - Alertas: ≥ 1 alerta de RLA con "Ver evidencia y respuesta sugerida" que despliega evidencia con enlace y texto de respuesta.
   - Mapa: distritos coloreados en escala ámbar; SJL es el más oscuro.
   - Temas: primera fila no es "Otro".
   - Brief: headline del día y cuerpo con scroll interno; botón "Generar ahora" visible.
   - Noticias: 8 filas con enlaces.
   - Recomendaciones: 3 tarjetas.
3. Consola del navegador: 0 errores. Network: 12 llamadas `/api/v1/*` en 200, **ninguna duplicada** (si `useRace`
   o `useTerritory` se montan dos veces porque `AlertsPanel` u otro hijo también los llama, eleva la llamada al
   hook padre y pasa props).
4. Modo oscuro: recorrer las 5 filas; sin bloques blancos sólidos ni texto ilegible.
5. Tiempo hasta pintado completo con backend local < 4 s (Network → Finish). `territory/opportunity` es el más lento (30 d); si supera 2 s, es aceptable porque el mapa y el top 5 muestran su skeleton mientras tanto.
6. Ancho 1920: la rejilla se expande sin huecos raros (las tarjetas crecen; no quedan columnas vacías).

## Si falla

- Tarjeta dentro de tarjeta (doble borde): quita el `SectionCard` envolvente para ese componente.
- El mapa no aparece (altura 0): Leaflet necesita altura explícita en el contenedor; `LimaMap` ya la fija por `height`. Si el contenedor padre es `flex`, envuélvelo en un `div` con `min-h-[340px]`.
- `PollAverageChart` vacío: `useRace` pide `days=120`; si `polls.length === 0`, revisa que el backend devuelva `polls` con `base=validos` (sí lo hace: 14).

## Commit

```
feat(panel): P-05 sala de guerra municipal y borrado de los restos presidenciales

Nuevo Dashboard: cabecera de campana, 4 KPI, evolucion de encuestas (14 reales, promedio
ponderado y veda), alertas abiertas con respuesta sugerida, mapa de oportunidad con top 5
distritos, temas de la semana, brief diario de la IA, ultimas noticias de Lima clasificadas y
top 3 recomendaciones. Todo reutiliza los hooks y componentes de Carrera y Territorio via
useDashboard; cero datos de ejemplo.

Se borran useDashboardData, TrendChart, GeographicMap, MetricCard y RealtimeAlerts: eran de la
etapa presidencial (metricas genericas, mapa de 25 regiones, serie sin token que devolvia 422).
```
