# R-01 — Dinero en soles, formato es-PE

## Objetivo

Que ningún monto de la pantalla se lea en dólares ni con sufijos falsos. "S/ 180 000 – 320 000",
como ya hace el Panel. Y que el eje de eficiencia del comparador vuelva a discriminar.

## Archivos a tocar

- `src/components/recommendations/RecommendationCard.tsx` — línea 183.
- `src/components/recommendations/BudgetCalculator.tsx` — líneas 64, 74, 149.
- `src/components/recommendations/StrategyComparator.tsx` — línea 56 y la fila "Presupuesto" (~208).

## Pasos

1. En los tres archivos, importa `fmtInt` de `../../utils/format`.

2. `RecommendationCard.tsx:183`:
   ```tsx
   ${recommendation.estimatedBudget.min}K - ${recommendation.estimatedBudget.max}K
   ```
   →
   ```tsx
   S/ {fmtInt(recommendation.estimatedBudget.min)} – {fmtInt(recommendation.estimatedBudget.max)}
   ```

3. `BudgetCalculator.tsx`: `${totalMinBudget}K` → `S/ {fmtInt(totalMinBudget)}`; igual el máximo; y la
   línea 149 → `S/ {fmtInt(rec.estimatedBudget.min)} – {fmtInt(rec.estimatedBudget.max)}`. Si alguna
   etiqueta cercana dice "USD" o similar, cámbiala a "S/".

4. `StrategyComparator.tsx:56` — el eje "eficiencia" del radar:
   ```ts
   Math.max(0, 100 - (rec.estimatedBudget.max / 10))
   ```
   →
   ```ts
   // Presupuesto en soles: S/ 1 000 000 (tope del filtro) equivale a eficiencia 0.
   Math.max(0, 100 - rec.estimatedBudget.max / 10000)
   ```
   Con los datos reales: 320 000 → 68 · 280 000 → 72 · 45 000 → 95,5. El eje vuelve a tener rango.

5. `grep -n '\$' src/components/recommendations/StrategyComparator.tsx src/components/recommendations/BudgetCalculator.tsx src/components/recommendations/RecommendationCard.tsx`
   — revisa cada resto: los `${var}` de template strings de clases se quedan; ningún `$` debe quedar
   **como símbolo de moneda visible**. La fila "Presupuesto" de la tabla del comparador pasa a
   `S/ {fmtInt(...)}`.

## Criterios de aceptación

1. `npx tsc --noEmit && npm run build` pasan.
2. En el navegador (Recomendaciones IA): la primera tarjeta muestra "S/ 25 000 – 45 000" (o el rango
   vigente de esa recomendación), nunca "$…K".
3. Selecciona 2 recomendaciones → BudgetCalculator suma y muestra "S/ X – Y" con separador de miles.
4. Abre el comparador con 2-3 seleccionadas: el eje de eficiencia del radar muestra valores distintos
   entre estrategias (no todos 0) y la fila Presupuesto va en S/.
5. `grep -rn '"\$"\|>\$' src/components/recommendations/` sin coincidencias de moneda visible.

## Commit

```
fix(reco): R-01 montos en soles con formato es-PE y eficiencia reescalada

Las tarjetas, la calculadora y el comparador pintaban "$180000K": signo de dolar y sufijo K
sobre montos que el backend ya entrega en soles absolutos — se leia como cientos de millones
de dolares. Todo pasa a "S/ 180 000" con fmtInt (es-PE).

El eje de eficiencia del radar asumia presupuesto en miles (100 - max/10): con soles reales
daba negativo y el clamp lo dejaba clavado en 0 para todas las estrategias. Se reescala a
soles (100 - max/10000) y vuelve a discriminar.
```
