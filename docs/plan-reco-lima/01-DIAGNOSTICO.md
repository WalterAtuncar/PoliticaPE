# 01 — Diagnóstico verificado (23-ago-2026)

Todo comprobado contra el código y las 15 recomendaciones reales de la base. Confía en esto.

## La pantalla y sus piezas

`MainApp` → `RecommendationsPage` (379 líneas). Composición: `ElectoralCountdown` + `FiguresPanel`
(izquierda) + `RecommendationsHeader` (filtros) + `RecommendationsTabs` (categorías) + tarjetas
(`RecommendationCard`) + columna derecha (`ROIDashboard`, `BudgetCalculator`, `ImpactMap`) +
`ImplementationTimeline` (abajo) + `StrategyComparator` (modal).

**Lo que está bien y no se toca**: countdown, panel de figuras, tabs (categorías municipales de
S2-13: prioridad territorial, mensaje del día, crisis, contraste, calle, digital — coinciden con la
base), el flujo de generación con focos, las tarjetas salvo una línea.

## Defecto por defecto, con evidencia

### D1 — Montos ilegibles (el peor para la demo)

`RecommendationCard.tsx:183`:
```tsx
${recommendation.estimatedBudget.min}K - ${recommendation.estimatedBudget.max}K
```
El backend manda soles absolutos (`{"min": 180000, "max": 320000}`). En pantalla: **"$180000K - $320000K"**
— se lee como 180–320 millones de dólares. Doble error: moneda ($ en vez de S/) y sufijo K sobre un
valor que no está en miles.

Mismo patrón en `BudgetCalculator.tsx:64` (`${totalMinBudget}K`), `:74` (`${totalMaxBudget}K`) y
`:149` (`${rec.estimatedBudget.min}-${rec.estimatedBudget.max}K`). Y en la tabla del comparador
(`StrategyComparator.tsx`, fila "Presupuesto", ~línea 208 — grep `\$` en el archivo para no dejar ninguno).

### D2 — Eje de eficiencia siempre en 0

`StrategyComparator.tsx:56`:
```ts
[`strategy${index}`]: Math.max(0, 100 - (rec.estimatedBudget.max / 10)),  // Inverse of budget
```
Asume presupuesto en miles. Con soles reales: `100 − 320000/10 = −31900` → `Math.max(0, …)` → **0**.
El radar compara estrategias con un eje muerto.

### D3 — Mapa de impacto nacional

`ImpactMap.tsx:11-19`: 7 regiones hardcodeadas (Lima, Arequipa, Cusco, La Libertad, Piura, Puno, Ica)
con coordenadas sobre un SVG con la silueta del Perú (`:62-67`). Emparejamiento por igualdad exacta
(`:23`): `rec.targetRegion === region.name`.

Los `target_region` reales **nunca** son un nombre suelto (ver `referencia/datos-reales.md`): son
cadenas "Zona, Distrito, Distrito, …" (p. ej. `"Lima Este, San Juan de Lurigancho, El Agustino, Ate"`).
**Coincidencias: 0 de 15.** Resultado: 7 puntos grises tamaño mínimo, "Regiones Prioritarias" vacía,
leyenda que aparenta una escala en uso.

### D4 — Filtro de región nacional que vacía la lista

`RecommendationsHeader.tsx:24-34`: desplegable con Nacional, Lima, Arequipa, Cusco, La Libertad,
Piura, Puno, Ica. `RecommendationsPage.tsx:70` filtra por igualdad exacta → **cualquier opción
distinta de "Todas" deja la lista en cero**, incluida "Lima".

### D5 — Desplegable demográfico doblemente muerto

`RecommendationsHeader.tsx:37-45`: edades y NSE A–D. Dos motivos de muerte: (1) `filters.demographic`
**no se aplica en ningún filtro** (el `filteredRecommendations` de la página no lo menciona);
(2) los `target_demographic` reales son texto libre ("Transportistas, mototaxistas y comerciantes
víctimas de cupos") que jamás coincidiría con "nse-b". Se elimina el control y el campo del tipo;
el dato demográfico se sigue viendo en cada tarjeta, donde sí aporta.

### D6 — "45 días" inventado y muro de ceros

`useAIRecommendations.ts:157`: `averageImplementationTime: 45` — constante inventada que
`ROIDashboard` pinta como "Tiempo Promedio 45 días". Además, `successRate`, `averageROI` y los
presupuestos del dashboard solo consideran recomendaciones `completed`/`in_progress` — **todas las
reales están en `generated`**, así que el widget muestra 0 %, 0 %, $0 y el único número "vivo" es el
falso. R-04 lo convierte en una cartera honesta sobre el total.

### D7 — Cronograma ficticio

`ImplementationTimeline.tsx:36-38`: posición = `2 + índice×3` semanas ("Próximas 24 semanas") — la
elección es en **6 semanas**. Solo muestra `approved/in_progress/completed` → hoy se pinta vacío; si
alguien aprueba una recomendación, mostraría fechas inventadas. **Decisión de Walter: se elimina.**
Cada tarjeta ya trae su cronograma real en texto (`expected_timeline`).

### D8 — Archivos muertos

`AIGenerator.tsx` (251 líneas) y `PoliticalFiguresManager.tsx` (414 líneas, con placeholder
"Ej: Lima, Arequipa"): **nadie los importa** (verificado por grep; el generador real es el modal de
focos de `RecommendationsPage` y la gestión de figuras vive en `FiguresPanel`). Se borran, junto con
`ImplementationTimeline.tsx` por D7.

## Nota fuera de alcance

`src/data/geographicData.ts` es un mock nacional ("Simplified GeoJSON data for Peru departments
(mock data)") usado solo por `GeographicPage`, que no está en el menú desde S0-07. No se toca aquí;
queda registrado en el 99 como deuda.
