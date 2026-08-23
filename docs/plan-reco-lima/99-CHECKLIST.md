# 99 — Checklist final y deploy

## A. Cierre

- [ ] `git status` limpio; commits R-01…R-04 (y R-05 si hubo ajustes) en `main`, empujados.
- [ ] `cd project-react && npx tsc --noEmit && npm run build` limpio.
- [ ] Barrido final de restos en la pantalla:
  ```bash
  grep -rnE "Arequipa|Cusco|La Libertad|Piura|Puno|'Nacional'|24 semanas|45 dias|averageImplementationTime|\}K" src/components/recommendations/
  # → 0 lineas
  ```
- [ ] `docs/plan-lima-2026/ESTADO-EJECUCION.md`: añadir bajo la sección "Panel de campaña" un párrafo
  "Recomendaciones IA (fecha)": qué se arregló (mapa Lima, filtro por zonas, soles, cartera honesta)
  y qué se borró. En "Deuda conocida" añadir: *"`src/data/geographicData.ts` es un mock nacional de
  `GeographicPage`, pantalla fuera del menú desde S0-07; borrar ambos cuando se confirme que no
  vuelven."*

## B. Deploy a Railway

Igual que en `plan-demo-panel/99` — no hay variables nuevas esta vez:

1. `railway up --service politicape-web --detach` desde la raíz (working tree limpio).
2. Esperar **SUCCESS** en `railway deployment list --service politicape-web | head -3`.
   `/health` responde desde el contenedor viejo hasta el cambio: no vale como confirmación.
3. Verificar en producción (login por API, campo `token`):
   `GET /api/v1/recommendations?figure_id=0849e7c7-7850-4b8b-be5d-35e67ac57572` → ≥ 15 filas
   (el backend no cambió; esto solo confirma que el servicio volvió sano).
4. Abrir la URL pública → Recomendaciones IA → verificar visualmente mapa de Lima + "S/" en tarjetas.
   (El login en producción lo hace Walter; el ejecutor no escribe contraseñas.)

## C. Nota para el guion de la demo

Con esto, la pantalla Recomendaciones IA **entra al recorrido de la demo** (antes la instrucción era
evitarla). Sugerencia de inserción: tras el punto 9 del guion (`plan-demo-panel/referencia/guion-demo.md`),
al hablar de las 3 recomendaciones del Panel, saltar a esta pantalla para mostrar: la cartera completa,
el filtro por zona ("¿qué tenemos para Lima Norte?"), el mapa de dónde se concentra el trabajo, y el
comparador con 2-3 estrategias seleccionadas (presupuesto agregado en soles). Añadir esa nota al final
del guion como sección "9-bis".
