# R-05 — Verificación visual de la pantalla completa

## Objetivo

Recorrer Recomendaciones IA como la verá Renovación Popular y corregir lo que desentone.
Mismo método que `plan-demo-panel/jobs/P-07`: mirar, no solo medir.

## Precondiciones

- R-01…R-04 cerrados. Stack local arriba. Sesión iniciada (si la pestaña de Chrome perdió la sesión,
  el ejecutor NO escribe la contraseña: pide a Walter o usa el autocompletado del gestor si ya está
  puesto en los campos).

## Recorrido (claro y oscuro, 1366×768)

1. **Cabecera**: countdown electoral + filtros. El de zona con sus 7 opciones. Probar cada zona y
   volver a "Toda la cartera".
2. **Tarjetas**: 3-4 tarjetas al azar — presupuesto "S/ …", demográfico visible, cronograma en texto,
   confianza, botones de estado. Sin `$`, sin "K", sin inglés.
3. **Seleccionar 3 recomendaciones** → BudgetCalculator suma en S/ → "Comparar estrategias" →
   radar con eje de eficiencia variado, tabla en S/.
4. **Cartera de recomendaciones**: números reales, chips por prioridad, sin ceros muertos.
5. **Mapa de impacto — Lima**: coloreado, SJL/SMP oscuros, resumen por zonas, nota de metro-wide.
   Tooltip/popup del mapa no debe decir cosas de Territorio que aquí no apliquen (si el popup de
   `LimaMap` muestra "menciones", en este contexto significa recomendaciones — si resulta confuso,
   pásale una prop opcional de etiqueta o acepta el texto y anótalo; no rompas Territorio).
6. **Generar**: abrir el modal de focos (no hace falta generar de verdad; ya hay 15).
7. **Capturas**: `docs/plan-demo-panel/capturas/reco-claro-1366.jpg` y `reco-oscuro-1366.jpg`
   (misma carpeta que las del Panel, para tenerlas juntas de cara a la demo).
8. Consola sin errores; Network todo 200 (el ×2 de StrictMode es normal).

## Ajustes permitidos

Solo CSS/textos dentro de `src/components/recommendations/` y props opcionales con default en
componentes compartidos. Nada de lógica de datos nueva.

## Criterios de aceptación

1. Recorrido completo en ambos modos sin: "$", "K" de miles, "Arequipa", "ROI Dashboard",
   "24 semanas", "45 días", desplegable demográfico, texto en inglés.
2. 2 capturas guardadas y referenciadas en el reporte.
3. `npx tsc --noEmit && npm run build` pasan tras los ajustes.
4. Commit solo si hubo ajustes.

## Commit (solo si hubo ajustes)

```
fix(reco): R-05 ajustes visuales tras el ensayo en claro y oscuro

<lista concreta de ajustes>
```
