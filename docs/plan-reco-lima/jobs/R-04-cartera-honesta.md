# R-04 — "ROI Dashboard" → "Cartera de recomendaciones"

## Objetivo

El widget de la columna derecha muestra hoy un muro de ceros (sus métricas solo cuentan
recomendaciones `completed`/`in_progress` y todas están en `generated`) coronado por un dato
inventado ("Tiempo Promedio 45 días", constante hardcodeada). Se convierte en un resumen honesto
de la cartera completa.

## Archivos a tocar

- `src/hooks/useAIRecommendations.ts` — `getROIMetrics` (líneas 138-158).
- `src/types/recommendations.ts` — interfaz `ROIMetrics`.
- `src/components/recommendations/ROIDashboard.tsx` — reescribir el contenido (107 líneas).
- `src/components/recommendations/RecommendationsPage.tsx` — solo si cambia el nombre de la prop.

## Diseño

### Nueva interfaz (reemplaza `ROIMetrics` en `types/recommendations.ts`)

```ts
export interface PortfolioMetrics {
  total: number;
  byPriority: { critical: number; high: number; medium: number; low: number };
  byStatus: Record<string, number>;          // generated, approved, in_progress, completed...
  budgetMin: number;                          // suma de min de TODA la cartera, en soles
  budgetMax: number;
  avgConfidence: number;                      // media de ai_confidence sobre toda la cartera
  avgProjectedROI: number;                    // media de projected_roi sobre toda la cartera
}
```

`getROIMetrics` → renómbralo `getPortfolioMetrics` y calcula sobre **todas** las recomendaciones
cargadas, no solo las completadas. Sin `averageImplementationTime` (muere el 45), sin `successRate`
(no hay completadas que medir; cuando las haya, se diseñará con datos reales).

### `ROIDashboard.tsx` reescrito (mismo archivo y nombre de componente, para tocar poco la página)

`Card glass p-5`, título **"Cartera de recomendaciones"**, subtítulo "{total} activas para la candidatura". Contenido:

1. **Por prioridad**: 4 chips con cuenta (Crítica roja, Alta naranja, Media ámbar, Baja gris —
   clases de severidad de `AlertsPanel.tsx:5-10`). Prioridades con 0 no se pintan.
2. **Presupuesto total de la cartera**: "S/ {fmtInt(budgetMin)} – {fmtInt(budgetMax)}" con subtexto
   "si se ejecutara todo". (Con los datos del 23-ago: suma de las 15.)
3. **Confianza media de la IA**: barra de progreso (patrón visual del ROIDashboard actual, líneas
   24-41) con `avgConfidence` — este sí es un dato real por recomendación.
4. **ROI proyectado medio**: "{avgProjectedROI} %" con subtexto "estimado por la IA, no verificado" —
   la honestidad del subtexto importa: es una proyección del modelo, no un resultado.
5. **Por estado**: línea `text-xs` — "15 generadas · 0 aprobadas · 0 en curso". Cuando el equipo
   empiece a aprobar desde las tarjetas, este widget cobra vida sin más cambios.

Fuera: "Tasa de Éxito", "Tiempo Promedio", "Presupuesto asignado/gastado" (todo era 0 o inventado).

## Criterios de aceptación

1. `npx tsc --noEmit && npm run build` pasan; `grep -rn "averageImplementationTime\|45" src/components/recommendations/ROIDashboard.tsx src/hooks/useAIRecommendations.ts` → sin el 45 hardcodeado.
2. Navegador: el widget muestra el total real (15 al 23-ago), chips por prioridad con cuentas que
   suman el total, presupuesto "S/ …" plausible (siete cifras), confianza media entre 75 y 95, y la
   línea de estados.
3. Nada en el widget dice 0 % ni $0 ni "45 días".
4. La palabra "ROI Dashboard" ya no aparece en la UI.

## Commit

```
fix(reco): R-04 cartera honesta en lugar del ROI dashboard de ceros

El widget solo media recomendaciones completadas (todas estan en generated, asi que pintaba
0 %, 0 % y $0) y su unico numero vivo era un "Tiempo Promedio: 45 dias" hardcodeado. Ahora
resume la cartera completa: total, por prioridad, presupuesto agregado en soles, confianza
media de la IA y ROI proyectado medio con la aclaracion de que es una estimacion del modelo.
El desglose por estado deja el widget listo para cobrar vida cuando el equipo apruebe
recomendaciones desde las tarjetas.
```
