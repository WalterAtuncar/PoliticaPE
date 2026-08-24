# PLAN BARRIDO-PANTALLAS — Instrucciones para el ejecutor

> Objetivo: cerrar de una vez la deuda presidencial del frontend. Dos frentes: (1) **borrar los 83
> archivos muertos** — 12 carpetas de la era presidencial inalcanzables desde el menú, incluidos los
> hooks con datos inventados; (2) **poner compuerta municipal a Redes**, que hoy mostraría posts de
> enero–mayo con basura de scraping (IELTS, iglesias de EE.UU., MLB) y filtros de Dina Boluarte y
> Pedro Castillo. Más dos flecos menores en pantallas vivas.
>
> Escrito el 23-ago-2026 tras un análisis de alcanzabilidad de imports (script incluido en
> `referencia/alcanzables.mjs`, lista exacta en `referencia/archivos-muertos.txt`). Decisiones ya
> tomadas con Walter: **borrar todo lo muerto** y **compuerta honesta en Redes** (no ocultarla del
> menú). **No re-planifiques. Ejecuta.**

## Regla cero

1. Lee este archivo y `01-DIAGNOSTICO.md`. Ejecuta `jobs/B-01` → `B-04` en orden y cierra con
   `99-CHECKLIST.md`. Rigen las convenciones de `docs/plan-demo-panel/03-CONVENCIONES.md`
   (`npx tsc --noEmit && npm run build` al cierre de cada trabajo, un commit por trabajo, cuerpo en
   español, push a `main`, formato es-PE, estados de carga/vacío/error).
2. **Todo es frontend.** No toques backend ni base.
3. La lista de `referencia/archivos-muertos.txt` fue generada por análisis de imports el 23-ago.
   Antes de borrar, **re-génerala** (paso 1 de B-01): si algún trabajo previo cambió imports, la
   lista vigente manda, no la del archivo.
4. Las 4 pantallas ya limpias (Panel, Carrera, Territorio, Prensa) **no se tocan** salvo lo que
   B-03 lista explícitamente.
5. React StrictMode duplica los fetch en desarrollo (×2). Normal, no lo "arregles".

## Contexto útil

- Stack local corriendo: backend `127.0.0.1:8000`, frontend `127.0.0.1:5000` (IPv4). Login
  `admin@politica.pe` / `password123`, JWT en campo `token`.
- Ya existen y se reutilizan: `usePoliticalFigures` (candidatos reales con `figure_role`,
  `is_own_candidate`, `color`), `ZONES` en `src/data/limaDistricts.ts`, `useAlerts`,
  `fmtInt` en `src/utils/format.ts`, `timeAgo` en `src/utils/time.ts`.
- Bundle actual: **1 229 KB** (`dist/assets/index-*.js`). Se espera que baje tras B-01; mide y
  reporta la diferencia.

## Orden de ejecución

| # | Archivo | Trabajo | Commit |
|---|---|---|---|
| 1 | `jobs/B-01-borrado-masivo.md` | Borrar los 83 archivos muertos (12 carpetas presidenciales) | `chore(front): B-01 ...` |
| 2 | `jobs/B-02-redes-municipal.md` | Compuerta municipal en Redes + filtros con candidatos reales y zonas | `fix(redes): B-02 ...` |
| 3 | `jobs/B-03-flecos-vivos.md` | Placeholder de FiguresPanel, campana/búsqueda del Header, barrido final | `fix(front): B-03 ...` |
| 4 | `jobs/B-04-verificacion-7-pantallas.md` | Recorrido completo de las 7 pantallas, claro/oscuro, capturas | `fix(front): B-04 ...` solo si hubo ajustes |
| 5 | `99-CHECKLIST.md` | Verificación integral, deploy, documentación y memoria | — |

B-01 va primero a propósito: si el borrado rompiera algo (no debería: nada vivo importa nada muerto),
mejor descubrirlo antes de construir encima.

## Formato del reporte por trabajo

```
[B-01] HECHO
Archivos: 83 borrados (12 carpetas), lista re-verificada antes del rm
Criterios: 5/5 OK · bundle 1229 KB → <nuevo> KB
Commit: <hash> chore(front): B-01 ...
Notas: <solo si hubo desviación>
```

## Qué NO hacer

- No borrar nada que no esté en la lista re-generada. En particular: `vite-env.d.ts` (es de Vite),
  `components/settings/*` vivos (SettingsContainer/SettingsPage/SettingsTabs/TagsPanel) y todo
  `components/{dashboard,race,territory,recommendations,monitoring/MonitoringPage,social,layout,ui,auth}` vivo.
- No intentar "arreglar" los componentes muertos antes de borrarlos: se borran, punto.
- No inventar un buscador global ni un centro de notificaciones nuevo para el Header: B-03 dice
  exactamente qué hacer con lo que hay.
- No desplegar antes del 99.
- No añadir librerías.
