# P-07 — Ensayo visual en navegador

## Objetivo

Ver el Panel como lo verá Renovación Popular y corregir lo que desentone. Es el único trabajo donde el
ejecutor mira, no solo mide. Usa las herramientas de Chrome (`tabs_context_mcp` → `navigate` →
`computer` screenshot) o abre el navegador a mano y captura.

## Precondiciones

- P-05 y P-06 cerrados. Login hecho en `http://127.0.0.1:5000` (Walter entra con `admin@politica.pe`; el
  ejecutor **no escribe la contraseña en el formulario** — pide a Walter que lo haga o usa una sesión ya abierta).

## Recorrido (hazlo dos veces: claro y oscuro)

1. **1366 × 768** (`resize_window` o DevTools → device toolbar). Sidebar abierto.
   - Captura el Panel completo en 3 scrolls. Guarda en `docs/plan-demo-panel/capturas/1366-claro-{1,2,3}.png` (y `-oscuro-`).
   - Lista de verificación visual (marca cada una en el reporte):
     - [ ] Cabecera: nombre, partido, punto celeste, número de días grande, 3 píldoras en una sola línea (si saltan a dos, reduce `gap` o `text-xs`).
     - [ ] KPIs en una fila de 4; ningún valor cortado; "27,8 %" no se parte del "%".
     - [ ] Gráfico de encuestas: leyenda legible, líneas con color de partido, línea de veda visible y etiquetada.
     - [ ] Alertas: la alerta de RLA con chip "Crítica"/"Alta"; desplegar "Ver evidencia": 1–3 evidencias con enlace y la respuesta sugerida completa sin cortarse.
     - [ ] Mapa: Lima completa visible en 340 px de alto, sin controles de zoom, sin atribución gigante de Leaflet tapando distritos (si tapa: `attributionControl={false}` solo en modo `compact`).
     - [ ] Top 5 oportunidades alineado con el mapa; barras proporcionales.
     - [ ] Temas: ≥ 6 filas, "Otro" ausente.
     - [ ] Brief: headline en negrita, cuerpo con scroll interno, no estira la fila.
     - [ ] Noticias: 8 filas, títulos a 2 líneas máximo, chips no se desbordan.
     - [ ] Recomendaciones: 3 tarjetas de igual altura (`h-full` en la Card + `grid` con `items-stretch`).
     - [ ] Sin scroll horizontal. Sin tarjeta dentro de tarjeta.
2. **1920 × 1080**: repite la captura (1 o 2 scrolls). Verifica que nada queda desproporcionado (un KPI enorme con texto diminuto, un mapa achatado).
3. **Sidebar colapsado** (80 px) a 1366: la rejilla se ensancha sin romper.
4. **Latencia**: recarga con DevTools → Network abierto, "Disable cache". Anota el tiempo hasta que desaparece el último skeleton. Objetivo < 4 s. Si `territory/opportunity` tarda > 3 s, acéptalo pero anótalo.
5. **Tipografía y copy**: lee cada texto en voz alta. Nada en inglés, nada técnico (`net_sentiment`, `share_pct`, `ubigeo`) visible al usuario. Tildes correctas.

## Ajustes permitidos

Solo CSS/Tailwind y textos dentro de `src/components/dashboard/*` y `src/hooks/useDashboard.ts`. Nada de lógica de datos
nueva. Si un componente reutilizado (`PollAverageChart`, `LimaMap`, `TopicsToday`, `BriefPanel`) necesita un ajuste,
hazlo mediante una **prop opcional con default que preserve su aspecto en su pantalla original**.

## Criterios de aceptación

1. Las 11 casillas marcadas en ambos modos.
2. Capturas guardadas (6 archivos mínimo) y referenciadas en el reporte.
3. `npx tsc --noEmit && npm run build` pasan tras los ajustes.
4. Si no hubo ajustes, no hay commit; si los hubo, un solo commit.

## Commit (solo si hubo ajustes)

```
fix(panel): P-07 ajustes visuales tras ensayo en 1366 y 1920, claro y oscuro

<lista de los ajustes concretos, uno por línea>
```
