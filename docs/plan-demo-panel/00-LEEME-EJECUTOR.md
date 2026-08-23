# PLAN DEMO PANEL — Instrucciones para el ejecutor

> Objetivo: que la pantalla **Panel** (`activeSection === 'dashboard'`) deje de ser un resto de la
> etapa presidencial y se convierta en la **sala de guerra de la campaña de Rafael López Aliaga
> (Renovación Popular) para la elección municipal de Lima del 4-oct-2026**, pintada 100 % con datos
> reales de la base Neon. Se presenta como demo a Renovación Popular en 1–3 días.
>
> Escrito el 23-ago-2026 por el planner tras leer el código, sondear los 12 endpoints reales y
> consultar la base. **No re-planifiques. Ejecuta.**

## Regla cero

1. Lee este archivo, luego `01-ESTADO-ACTUAL.md`, `02-DISENO-OBJETIVO.md`, `03-CONVENCIONES.md`.
   Después ejecuta los trabajos de `jobs/` **en el orden exacto** de la tabla. Cada uno depende del anterior.
2. Cada trabajo termina con **criterios de aceptación ejecutables por comando o verificables en el
   navegador**. No marques un trabajo como hecho si un criterio falla. Si falla y no está cubierto
   por "Si falla", toma la mejor decisión tú, anótala en el reporte y sigue.
3. **Un commit por trabajo**, con el mensaje indicado. Cuerpo del commit en español, explicando el
   porqué. Push a `origin main` al cerrar cada trabajo.
4. No toques nada fuera de "Archivos a tocar". Si necesitas un cambio mínimo en otro archivo para
   que compile, hazlo y anótalo.
5. **Cero datos de ejemplo.** Ningún número, nombre, porcentaje o texto inventado en el frontend.
   Si un dato no existe, el widget muestra su estado vacío honesto (definido en `03-CONVENCIONES`).
   Walter fue explícito: *"data real no data mock"*.
6. Las formas exactas de cada endpoint están en `referencia/formas-endpoints.md`. Son la fuente de
   verdad: fueron sondeadas contra el backend vivo el 23-ago. No inventes campos.
7. Todo texto visible al usuario en **español**. Código, tipos y variables en inglés, como el repo.
8. El entorno de trabajo y de verificación es **local** (`127.0.0.1`). El deploy a Railway es el
   **último** trabajo, después de que Walter refine en local. No despliegues antes.

## Directorio de trabajo y entorno

- Raíz del repo: `D:\Documentos\GitHub\PoliticaPE\PoliticaPE`. Rutas relativas a esa raíz.
- Shell: Git Bash. Python 3.11, Node 22. Walter tiene `PORT=3010` global: **siempre** `PORT=` explícito.
- Servicios locales (ya deberían estar corriendo; si no, ver `03-CONVENCIONES` → "Levantar el stack"):
  backend `127.0.0.1:8000`, sniffing `127.0.0.1:8080`, frontend **`127.0.0.1:5000`** (no `localhost`:
  Vite escucha solo IPv4).
- Base: Neon (cadena en `.env`). Es la base real compartida con producción. **No borres nada.**
- Login demo: `admin@politica.pe` / `password123`. El JWT viene en el campo `token`.
- `.env` ya tiene `ANTHROPIC_API_KEY`, `OWN_CANDIDATE=Rafael López Aliaga`, `OWN_PARTY_SLUG=renovacion-popular`,
  `CLASSIFY_MIN_DATE=2026-07-01`. La figura ya está marcada `is_own_candidate=true` en la base.

## Orden de ejecución

| # | Archivo | Trabajo | Capa | Commit |
|---|---|---|---|---|
| 1 | `jobs/P-01-alertas-modo-prensa.md` | Motor de alertas con ventana diaria para operación solo-prensa | backend | `fix(alertas): P-01 ...` |
| 2 | `jobs/P-02-hook-useDashboard.md` | Hook único `useDashboard` que agrega los 9 endpoints con degradación por widget | frontend | `feat(panel): P-02 ...` |
| 3 | `jobs/P-03-cabecera-y-kpis.md` | `CampaignHeader` (candidato, cuenta regresiva, hitos legales) + `KpiStrip` (4 KPI) | frontend | `feat(panel): P-03 ...` |
| 4 | `jobs/P-04-widgets-nuevos.md` | `TopOpportunities`, `LatestLimaNews`, `TopRecommendations` | frontend | `feat(panel): P-04 ...` |
| 5 | `jobs/P-05-composicion-del-panel.md` | Nuevo `Dashboard.tsx`: rejilla completa reutilizando Carrera/Territorio + borrado de restos presidenciales | frontend | `feat(panel): P-05 ...` |
| 6 | `jobs/P-06-datos-frescos-para-demo.md` | Preparación de datos: clasificación al día, brief de hoy, recomendaciones, alerta disparada | datos | (sin commit de código) |
| 7 | `jobs/P-07-ensayo-visual.md` | Ensayo en navegador a 1366×768 y 1920×1080, claro/oscuro, sin scroll horizontal, sin ceros falsos | QA | `fix(panel): P-07 ...` solo si hubo ajustes |
| 8 | `99-CHECKLIST-DEMO.md` | Checklist final, **deploy a Railway** (recién aquí) y verificación en la URL pública | deploy | — |

Tiempo estimado de ejecución: 3–4 horas de trabajo efectivo de ejecutor. Los trabajos 2→5 son
secuenciales (cada uno importa lo que el anterior exporta). El 1 es independiente y va primero
porque su resultado (una alerta real) tarda hasta 10 min en aparecer por el scheduler.

## Formato del reporte por trabajo

```
[P-03] HECHO
Archivos: src/components/dashboard/CampaignHeader.tsx (nuevo), src/components/dashboard/KpiStrip.tsx (nuevo)
Criterios: 6/6 OK
Commit: <hash> feat(panel): P-03 cabecera de campaña y KPIs
Notas: <solo si hubo desviación o decisión tomada>
```

## Qué NO hacer

- No crear un endpoint agregador `/dashboard` en el backend. Los 9 endpoints existen, son rápidos
  (<1,5 s cada uno, en paralelo) y ya tienen hooks/tipos. Un agregador nuevo es superficie de riesgo
  a 3 días de la demo.
- No tocar `RacePage`, `TerritoryPage` ni sus componentes salvo para **exportar** lo que el Panel reutiliza.
  Si un componente reutilizado necesita una prop nueva (p. ej. `compact`), añádela con valor por defecto
  que preserve el comportamiento actual.
- No añadir librerías. Todo lo necesario está: `recharts`, `framer-motion`, `lucide-react`, Tailwind.
- No ocultar ni suavizar datos negativos sobre López Aliaga (hoy 14 de 14 menciones son negativas por
  los pedidos de exclusión ante el JEE). **Es el argumento de venta**: el sistema detectó la crisis,
  la alertó, la resumió en el brief y propuso la respuesta. Ver `02-DISENO-OBJETIVO` → "Enmarcado".
- No desplegar a Railway antes del trabajo 8.
- No borrar filas de Neon. No correr `seed_lima_2026.py` sin `--own "Rafael López Aliaga"`.
