# B-04 — Verificación de las 7 pantallas

## Objetivo

Recorrer el menú completo tras el borrado masivo y la compuerta, en claro y oscuro, 1366×768.
Es la red de seguridad de B-01: si el análisis de alcanzabilidad se equivocó en algo, aparece aquí.

## Precondiciones

- B-01…B-03 cerrados. Stack local arriba, sesión iniciada (el ejecutor no escribe contraseñas; si la
  pestaña la perdió, pide a Walter o usa el autocompletado ya presente).

## Recorrido (por pantalla, en ambos temas)

| Pantalla | Qué verificar |
|---|---|
| **Panel** | Las 5 filas de siempre con datos; sin regresión por el borrado. |
| **Prensa** | Lista de noticias carga; filtros de fuente/scope funcionan; enlaces abren. |
| **Redes** | La compuerta de B-02 + AlertsPanel con alertas reales. |
| **Carrera** | Encuestas, promedio, share of voice, temas, brief. |
| **Territorio** | Mapa, pestañas (mapa/oportunidad/eventos/resultados) cargan. |
| **Recomendaciones IA** | Tarjetas en soles, mapa de impacto, cartera, filtro por zona; placeholder nuevo en el formulario de figuras. |
| **Configuración** | Pestañas scraping y tags operativas; "Usuarios" con su placeholder. |

En cada pantalla: consola sin errores rojos, sin textos en inglés visibles, sin scroll horizontal.

## Capturas

`docs/plan-demo-panel/capturas/`: `redes-compuerta-1366.jpg` (la nueva) y una por pantalla solo si
algo cambió visualmente respecto a las capturas existentes.

## Criterios de aceptación

1. 7/7 pantallas operativas en claro y oscuro; consola limpia en todas.
2. Captura de la compuerta de Redes guardada.
3. `npx tsc --noEmit && npm run build` pasan tras cualquier ajuste.
4. Commit solo si hubo ajustes.

## Commit (solo si hubo ajustes)

```
fix(front): B-04 ajustes tras el recorrido de las 7 pantallas

<lista concreta>
```
