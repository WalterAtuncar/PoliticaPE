# B-03 — Flecos en pantallas vivas y barrido final

## Objetivo

Los tres restos menores que quedan en pantallas alcanzables, más el grep de cierre.

## Pasos

### 1. Placeholder presidencial en Recomendaciones

`src/components/recommendations/FiguresPanel.tsx:267`: `placeholder="Ej: Dina Boluarte"` →
`placeholder="Ej: Rafael López Aliaga"`. Revisa el resto del formulario de ese panel por si hay otro
ejemplo de la era presidencial (`grep -n "Ej:" FiguresPanel.tsx`).

### 2. Header global: búsqueda y campana

`src/components/layout/Header.tsx` tiene una caja "Buscar…" y una campana de notificaciones. Audita
qué hacen de verdad:

- **Buscar**: sigue el estado del input. Si no filtra nada ni navega (solo guarda un `useState`),
  **elimínala** — un buscador que no busca es una promesa falsa en una demo. Deja el hueco limpio
  (el header ya tiene el título a la izquierda y los controles a la derecha).
- **Campana**: si despliega notificaciones hardcodeadas o un panel vacío decorativo, reemplaza su
  contenido por las alertas reales: `useAlerts('open', 5)` → lista compacta (título + `timeAgo` +
  chip de severidad, patrón de `AlertsPanel`) y un vacío honesto "Sin alertas abiertas". El punto
  rojo de la campana solo se pinta si `alerts.length > 0`. Si por el contrario ya usa datos reales,
  no la toques y anótalo.
- **Menú de usuario** (avatar "Administrador"): si contiene opciones muertas ("Perfil", "Facturación"…)
  que no navegan a nada, déjalas — está fuera del alcance de este plan salvo que muestren datos
  inventados; anota lo que veas.

### 3. Barrido final de texto

```bash
cd project-react
grep -rnE "Boluarte|Castillo|Arequipa|Cusco|Piura|Puno|Trujillo|Todo el Perú|presidencial|Perú Libre|Acción Popular" src/
```

Objetivo: **0 líneas** (tras B-01 y B-02 no debería quedar nada; "Fuerza Popular" sí puede aparecer
si viene de datos de la base — es el partido de una figura monitoreada — pero no hardcodeada en una
lista de filtro). Cada resto que aparezca: arréglalo si es de una pantalla viva, y si es de un archivo
que debió morir en B-01, bórralo y anota por qué el análisis no lo vio.

## Criterios de aceptación

1. `npx tsc --noEmit && npm run build` pasan.
2. El grep del paso 3 devuelve 0 (con la excepción documentada de datos de la base).
3. Navegador: el Header no tiene buscador muerto; la campana muestra las alertas reales o nada honesto.
4. El formulario de figuras muestra el placeholder municipal.

## Commit

```
fix(front): B-03 flecos presidenciales en pantallas vivas

- Placeholder del formulario de figuras: "Ej: Dina Boluarte" -> "Ej: Rafael Lopez Aliaga".
- Header global: <lo que hayas hecho con buscador y campana, una linea cada uno>.
- Barrido final: cero menciones hardcodeadas de figuras o regiones de la era presidencial en src/.
```
