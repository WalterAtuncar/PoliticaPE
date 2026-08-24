# B-01 — Borrado masivo del código muerto

## Objetivo

Eliminar los 83 archivos inalcanzables (12 carpetas presidenciales + hooks con datos inventados +
`types/index.ts`). Cero cambios de comportamiento: nada vivo los importa.

## Pasos

### 1. Re-generar la lista (obligatorio, no te saltes esto)

```bash
cd project-react
node ../docs/plan-barrido-pantallas/referencia/alcanzables.mjs
```

Compara el total de MUERTOS con `referencia/archivos-muertos.txt` (83). Si difiere, un trabajo previo
cambió imports: regenera la lista con el bloque de listado del propio script (o adapta) y usa la
vigente. Excluye siempre `vite-env.d.ts`.

### 2. Medir el bundle ANTES

```bash
npm run build >/dev/null 2>&1 && ls -la dist/assets/index-*.js
```

### 3. Borrar

```bash
cd project-react
# desde la lista (rutas relativas src/...):
tr -d '\r' < ../docs/plan-barrido-pantallas/referencia/archivos-muertos.txt | while read f; do git rm -q "$f"; done
git status --short | head -20
```

Carpetas que deben quedar **vacías y desaparecer**: `components/analytics`, `components/campaigns`,
`components/data`, `components/demographics`, `components/geo-demographics`, `components/geographic`,
`components/government`, `components/surveys`. Y parcialmente: `components/monitoring` (queda solo
`MonitoringPage.tsx`), `components/social` (quedan 7), `components/settings` (quedan 4), `hooks`
(quedan los 12 vivos), `data` (quedan `limaDistricts.ts`, `lima-distritos.geo.json`, `topics.ts`),
`types` (queda todo menos `index.ts`).

### 4. Compilar y medir DESPUÉS

```bash
npx tsc --noEmit && npm run build && ls -la dist/assets/index-*.js
```

Si `tsc` falla, algún vivo importaba un muerto que el análisis no vio (p. ej. import dinámico con
variable). Restaura solo ese archivo (`git checkout -- <ruta>`), anótalo en el reporte y sigue.

## Criterios de aceptación

1. `git status` muestra exactamente los borrados de la lista; ningún archivo modificado.
2. `npx tsc --noEmit && npm run build` pasan.
3. El bundle bajó (reporta KB antes → después).
4. Re-ejecutar `alcanzables.mjs` → **0 muertos** (fuera de `vite-env.d.ts`).
5. Humo rápido en navegador: las 7 pantallas del menú cargan sin pantalla en blanco ni error de consola
   (el recorrido fino es B-04).

## Commit

```
chore(front): B-01 borrar 83 archivos muertos de la era presidencial

Analisis de alcanzabilidad de imports desde las 7 pantallas del menu (script en
docs/plan-barrido-pantallas/referencia/): la mitad del frontend era inalcanzable. Se borran 12
carpetas presidenciales completas (analytics, campaigns, data, demographics, geo-demographics,
geographic, government, surveys y los restos muertos de monitoring, social y settings), 12 hooks
sin uso y types/index.ts.

Entre lo borrado estaban los datos inventados con aspecto real que motivaron el barrido:
useDemographics ("envejecimiento acelerado en Arequipa... 2,8 anios... participacion 88,2 %"),
useRealtimeData con valores por region hardcodeados y el mock GeoJSON nacional. Ningun archivo
vivo importaba nada de esto; el riesgo era que un refactor futuro lo reconectara.

Bundle: <antes> KB -> <despues> KB.
```
