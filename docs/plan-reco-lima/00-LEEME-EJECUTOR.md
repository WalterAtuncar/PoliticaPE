# PLAN RECO-LIMA — Instrucciones para el ejecutor

> Objetivo: que la pantalla **Recomendaciones IA** deje de mezclar datos municipales reales con
> presentación de la era presidencial. El backend ya genera recomendaciones perfectas para Lima
> (zonas y distritos reales, montos en soles); lo roto es **solo presentación**: un mapa del Perú
> que nunca coincide, un filtro nacional que vacía la lista, montos pintados como "$180000K",
> un eje de eficiencia que siempre da 0, un "45 días" inventado y tres componentes muertos.
>
> Escrito el 23-ago-2026 por el planner tras sondear el código y las 15 recomendaciones reales de
> la base. Decisiones ya tomadas con Walter: **limpieza completa** y **el cronograma de 24 semanas
> se elimina** (no se reconstruye). **No re-planifiques. Ejecuta.**

## Regla cero

1. Lee este archivo y `01-DIAGNOSTICO.md`. Ejecuta `jobs/R-01` → `R-05` en orden y cierra con
   `99-CHECKLIST.md`. Rige todo lo de `docs/plan-demo-panel/03-CONVENCIONES.md` (fetch con token,
   estados de carga/vacío/error, paleta Lima, formato es-PE, `npx tsc --noEmit && npm run build`,
   un commit por trabajo con cuerpo en español, push a `main`).
2. **Todo es frontend.** No toques el backend, no regeneres recomendaciones, no borres filas de Neon.
3. Cero datos inventados. La regla incluye quitar los que ya existían: el "45 días" hardcodeado
   muere en este plan.
4. Los valores reales contra los que verificar están en `referencia/datos-reales.md` (sondeados el
   23-ago con token). Las 15 recomendaciones actuales son la materia de prueba; no las alteres.
5. En desarrollo, React StrictMode duplica cada fetch (×2). No es un bug tuyo; no lo "arregles".

## Contexto que ya tienes a favor

- `src/data/limaDistricts.ts` — `LIMA_DISTRICTS` (43 distritos con `ubigeo`, `name`, `zone`,
  `electors`) y `ZONES` (las 5 zonas). Es la fuente para parsear `targetRegion`.
- `src/components/territory/LimaMap.tsx` — mapa GeoJSON real de Lima, con props `districts`,
  `metric`, `height`, `compact`, `zoom`.
- `src/utils/format.ts` — `fmtInt`, `fmtPct` (es-PE).
- Stack local corriendo: backend `127.0.0.1:8000`, frontend `127.0.0.1:5000` (IPv4).
  Login `admin@politica.pe` / `password123`, JWT en el campo `token`.

## Orden de ejecución

| # | Archivo | Trabajo | Commit |
|---|---|---|---|
| 1 | `jobs/R-01-dinero-en-soles.md` | Montos en soles con formato es-PE; eficiencia del comparador reescalada | `fix(reco): R-01 ...` |
| 2 | `jobs/R-02-mapa-de-impacto-lima.md` | Parser de `targetRegion` + ImpactMap reescrito sobre el mapa real de Lima | `feat(reco): R-02 ...` |
| 3 | `jobs/R-03-filtros-por-zona-y-limpieza.md` | Filtro por las 5 zonas; fuera el desplegable demográfico muerto; borrar 3 archivos sin uso | `fix(reco): R-03 ...` |
| 4 | `jobs/R-04-cartera-honesta.md` | "ROI Dashboard" → "Cartera de recomendaciones" sin ceros vacíos ni el 45 inventado | `fix(reco): R-04 ...` |
| 5 | `jobs/R-05-verificacion-visual.md` | Recorrido en navegador, claro/oscuro, capturas | `fix(reco): R-05 ...` solo si hubo ajustes |
| 6 | `99-CHECKLIST.md` | Verificación integral, deploy a Railway, actualizar documentación | — |

El orden importa: R-01 primero porque es el bug más grave para la demo y no depende de nada;
R-02 crea el parser que R-03 reutiliza.

## Formato del reporte por trabajo

```
[R-02] HECHO
Archivos: src/utils/targetRegion.ts (nuevo), src/components/recommendations/ImpactMap.tsx (reescrito)
Criterios: 5/5 OK
Commit: <hash> feat(reco): R-02 ...
Notas: <solo si hubo desviación o decisión>
```

## Qué NO hacer

- No tocar `RecommendationCard` más allá de la línea del presupuesto (el resto de la tarjeta está bien).
- No tocar `FiguresPanel` ni el flujo de generación (funcionan y son municipales desde S2-13).
- No "mejorar" `ElectoralCountdown` ni `RecommendationsTabs`: ya están en clave municipal.
- No tocar `src/data/geographicData.ts` (mock nacional): pertenece a `GeographicPage`, que no está
  en el menú desde S0-07. Queda anotado como deuda en el checklist, no se resuelve aquí.
- No desplegar antes del 99.
- No añadir librerías.
