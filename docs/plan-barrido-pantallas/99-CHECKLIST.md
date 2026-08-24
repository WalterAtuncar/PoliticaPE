# 99 — Checklist final y deploy

## A. Cierre

- [ ] `git status` limpio; commits B-01…B-03 (y B-04 si hubo) en `main`, empujados.
- [ ] `npx tsc --noEmit && npm run build` limpio. Reporta bundle final vs los 1 229 KB de partida.
- [ ] `node docs/plan-barrido-pantallas/referencia/alcanzables.mjs` (desde `project-react/`) → 0 muertos.
- [ ] Barrido: `grep -rnE "Boluarte|Castillo|Arequipa|Todo el Perú|presidencial" project-react/src/` → 0.
- [ ] `docs/plan-lima-2026/ESTADO-EJECUCION.md`: párrafo nuevo "Barrido de pantallas (fecha)" — 83
  archivos borrados con el método de alcanzabilidad, compuerta municipal en Redes, flecos del Header;
  y **eliminar de "Deuda conocida" la línea de `geographicData.ts`** (ya no existe). La deuda de
  `target_region varchar(100)` se queda: es de backend.

## B. Deploy

1. `railway up --service politicape-web --detach` con working tree limpio.
2. Esperar **SUCCESS** en `railway deployment list` (no confiar en `/health`, responde el contenedor viejo).
3. Verificación en producción:
   - Bundle nuevo: `curl -s $P/ | grep -oE '/assets/index-[^"]+\.js'` → descargarlo y comprobar que
     "Monitoreo de redes — pendiente de activación" está y "Boluarte"/"Todo el Perú" no.
   - Login por API (campo `token`) y `GET /api/v1/alerts?status=open` responde.
4. Walter hace la pasada visual en la URL pública (el ejecutor no escribe contraseñas).

## C. Documentación y memoria

- [ ] Actualizar la memoria del proyecto (`project_demo_panel.md` y `MEMORY.md`): tercer plan ejecutado,
  frontend sin código muerto, Redes con compuerta, y el dato para el guion: la pantalla Redes ahora
  **suma** en la demo — "esto se enciende con dos claves" señalando la compuerta.
- [ ] Nota en el guion (`plan-demo-panel/referencia/guion-demo.md`, sección 10 "Cierre"): al decir
  "lo que falta son las redes sociales: está construido", ahora se puede **abrir Redes** y mostrar la
  compuerta con la pestaña de crisis viva — es la prueba visual de la frase.
