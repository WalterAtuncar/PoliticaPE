# R-03 — Filtro por zonas de Lima y limpieza de componentes muertos

## Objetivo

Que el filtro de territorio filtre de verdad (por las 5 zonas reales), que desaparezca el
desplegable demográfico muerto, y que los 3 archivos sin uso salgan del repo.

## Precondiciones

- R-02 cerrado (usa `parseTargetRegion`).

## Archivos a tocar

- `src/components/recommendations/RecommendationsHeader.tsx` — desplegables.
- `src/components/recommendations/RecommendationsPage.tsx` — filtro (línea ~70), imports y el bloque
  de `ImplementationTimeline` (~279-283).
- `src/types/recommendations.ts` — `RecommendationsFilters` (quitar `demographic`).
- **Borrar**: `AIGenerator.tsx`, `PoliticalFiguresManager.tsx`, `ImplementationTimeline.tsx`.

## Pasos

### 1. Desplegable de territorio (`RecommendationsHeader.tsx:24-34`)

Reemplaza el array `regions` nacional por:

```ts
import { ZONES } from '../../data/limaDistricts';

const regionOptions = [
  { value: 'all', label: 'Toda la cartera' },
  ...ZONES.map(z => ({ value: z, label: z })),
  { value: 'metro', label: 'Lima Metropolitana (toda la ciudad)' },
];
```

Etiqueta visible del control: "Zona" (antes "Región" o similar — revisa el label en el JSX).

### 2. Filtro real en la página (`RecommendationsPage.tsx:70`)

```ts
(filters.region === 'all' || rec.targetRegion === filters.region) &&
```
→
```ts
matchesZone(rec, filters.region) &&
```

con un helper local (o en `utils/targetRegion.ts`, mejor):

```ts
export function matchesZone(target: string | null | undefined, filter: string): boolean {
  if (filter === 'all') return true;
  const info = parseTargetRegion(target);
  if (filter === 'metro') return info.metroWide;
  // Una recomendacion metro-wide aplica a toda la ciudad: aparece bajo cualquier zona.
  return info.metroWide || info.zones.includes(filter as Zone);
}
```

### 3. Fuera el desplegable demográfico

- `RecommendationsHeader.tsx:37-45`: borra el array `demographics` y el `<select>` que lo usa.
- `types/recommendations.ts`: quita `demographic: string;` de `RecommendationsFilters`.
- `RecommendationsPage.tsx:23`: quita `demographic: 'all',` de `initialFilters`.
- El dato `targetDemographic` se sigue mostrando en cada tarjeta (línea 173): no lo toques.

### 4. Fuera el cronograma ficticio

`RecommendationsPage.tsx`: borra el import de `ImplementationTimeline` (línea 12) y el bloque
`<ImplementationTimeline recommendations={...} />` (~279-283).

### 5. Borrado de archivos

Antes de cada `git rm`, verifica: `grep -rn "<Nombre>" src --include=*.ts --include=*.tsx` debe
devolver solo el propio archivo. Luego:

```bash
git rm src/components/recommendations/AIGenerator.tsx \
       src/components/recommendations/PoliticalFiguresManager.tsx \
       src/components/recommendations/ImplementationTimeline.tsx
```

Si al compilar queda algún tipo huérfano (p. ej. un `TimelineProps` en `types/recommendations.ts`
que ya nadie usa), bórralo también y anótalo.

## Criterios de aceptación

1. `npx tsc --noEmit && npm run build` pasan.
2. Navegador: filtro "Lima Norte" → solo las recomendaciones de Lima Norte **más** las metro-wide
   (con los datos del 23-ago: las 3 de Lima Norte + 4 metro). "Lima Moderna" → ≥ 1. "Toda la
   cartera" → 15. Ninguna opción deja la lista vacía salvo que de verdad no haya recomendaciones
   de esa zona.
3. El desplegable demográfico ya no existe; el de zona dice "Zona" y lista 7 opciones.
4. `grep -rn "Arequipa\|Cusco\|La Libertad\|Piura\|Puno\|'Nacional'" src/components/recommendations/` → 0.
5. La página ya no renderiza "Próximas 24 semanas" (grep en `src/components/recommendations/` → 0).
6. `git status` muestra los 3 archivos borrados y ningún otro archivo tocado fuera de la lista.

## Commit

```
fix(reco): R-03 filtro por zonas de Lima y limpieza de componentes muertos

El desplegable de territorio ofrecia regiones nacionales (Arequipa, Cusco...) y filtraba por
igualdad exacta contra target_region: cualquier opcion, incluida "Lima", vaciaba la lista.
Ahora filtra por las 5 zonas reales via parseTargetRegion; las recomendaciones que aplican a
toda Lima Metropolitana aparecen bajo cualquier zona y tienen su propia opcion.

Se elimina el desplegable demografico: nunca se aplicaba en el filtrado y sus valores (NSE,
rangos de edad) jamas coinciden con los target_demographic reales, que son texto libre y se
siguen viendo en cada tarjeta.

Se borran tres archivos sin ningun import: AIGenerator y PoliticalFiguresManager (sustituidos
hace tiempo por el modal de focos y FiguresPanel) e ImplementationTimeline, cuyo cronograma
posicionaba las recomendaciones a 2+3n semanas inventadas con horizonte de 24 semanas cuando
la eleccion es en 6.
```
