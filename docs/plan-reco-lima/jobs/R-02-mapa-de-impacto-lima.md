# R-02 — Parser de `targetRegion` y mapa de impacto sobre Lima real

## Objetivo

Dos piezas: (1) un parser compartido que convierta el texto libre `targetRegion` en zonas y
distritos del catálogo; (2) `ImpactMap.tsx` reescrito: fuera el SVG del Perú, dentro el mapa
GeoJSON de los 43 distritos coloreado por cuántas recomendaciones tocan cada uno.

## Archivos a tocar

- `src/utils/targetRegion.ts` — **nuevo**.
- `src/components/recommendations/ImpactMap.tsx` — reescribir entero (el nombre de archivo y el
  nombre del componente se conservan para no tocar `RecommendationsPage` más de lo necesario).

## Parte 1 — `src/utils/targetRegion.ts`

```ts
import { LIMA_DISTRICTS, ZONES, LimaDistrict, Zone } from '../data/limaDistricts';

export interface TargetRegionInfo {
  zones: Zone[];          // zonas mencionadas o derivadas de los distritos, sin duplicados
  districts: LimaDistrict[];
  metroWide: boolean;     // la cadena menciona "Lima Metropolitana"
  unmatched: string[];    // partes que no coinciden con nada (diagnostico, no se pintan)
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const DISTRICT_BY_NORM = new Map(LIMA_DISTRICTS.map(d => [norm(d.name), d]));
const ZONE_BY_NORM = new Map(ZONES.map(z => [norm(z), z]));

export function parseTargetRegion(target: string | null | undefined): TargetRegionInfo { ... }
```

Reglas del parser (una pasada por cada parte separada por comas):
- `norm(parte) === 'lima metropolitana'` → `metroWide = true`.
- Si coincide con una zona (`ZONE_BY_NORM`) → añádela a `zones`.
- Si coincide con un distrito (`DISTRICT_BY_NORM`) → añádelo a `districts` **y** su `zone` a `zones`.
- Si no coincide con nada → a `unmatched` (sin romper).
- Sin duplicados (usa `Set` por ubigeo/zona), orden de aparición.

La normalización NFD resuelve tildes ("Rímac" ≈ "Rimac", "Ancón" ≈ "Ancon"). No agregues alias ni
fuzzy matching: los nombres que genera el backend salen del mismo gazetteer que `LIMA_DISTRICTS`.

### Tabla de verificación (contra los `target_region` reales de `referencia/datos-reales.md`)

| Entrada (real) | zones | districts | metroWide |
|---|---|---|---|
| `Lima Este, San Juan de Lurigancho, El Agustino, Ate` | [Lima Este] | [SJL, El Agustino, Ate] | false |
| `Lima Metropolitana, Cercado de Lima` | [Lima Centro] | [Cercado de Lima] | true |
| `Lima Norte, San Martín de Porres, Comas, Independencia, Carabayllo` | [Lima Norte] | 4 distritos | false |
| `Lima Moderna, Santiago de Surco, Miraflores, Lince, Barranco` | [Lima Moderna] | 4 distritos | false |
| `Lima Sur, Villa El Salvador, Villa María del Triunfo, Chorrillos` | [Lima Sur] | 3 distritos | false |

## Parte 2 — `ImpactMap.tsx` reescrito

Props: sin cambio — `{ recommendations: AIRecommendation[] }` (así `RecommendationsPage:275` no se toca).

Estructura del componente:

1. `useMemo`: para cada recomendación, `parseTargetRegion(rec.targetRegion)`. Construye:
   - `countByUbigeo: Record<string, number>` — cuántas recomendaciones mencionan cada distrito.
   - `countByZone: Record<Zone, number>` — por zona mencionada o derivada.
   - `metroCount` — recomendaciones marcadas metroWide.
2. `mapDistricts: DistrictStat[]` — construidos desde `LIMA_DISTRICTS` (import) con
   `mentions: countByUbigeo[d.ubigeo] ?? 0` y el resto de campos en cero/objetos vacíos
   (`net_sentiment: null, top_topic: null, topics: {}, figures: {}`). Es la forma que `LimaMap`
   espera; con `metric="mentions"` colorea por esa cuenta en la escala teal existente.
3. Render, en una `Card glass p-5`:
   - Título "Mapa de impacto — Lima" + subtítulo "Distritos que tocan las {N} recomendaciones".
   - `<LimaMap districts={mapDistricts} metric="mentions" height={260} compact zoom={10} />`.
   - Si `metroCount > 0`: línea `text-xs text-gray-500` — "{metroCount} recomendaciones aplican a
     toda Lima Metropolitana (no se pintan por distrito)". **Nunca** sumar las metro a los 43
     distritos: teñiría el mapa entero y mentiría sobre el foco.
   - Debajo, "Zonas con más trabajo": las 5 zonas ordenadas por cuenta desc, fila
     `zona · N recomendaciones` con barrita proporcional ámbar `#B8741A` (mismo patrón visual que
     `TopOpportunities`). Zonas con 0 no se listan.
   - Top 3 distritos por cuenta (nombre + n) como chips.
   - Estado vacío (`recommendations.length === 0`): "Sin recomendaciones que mapear."
4. Borra del archivo todo lo anterior: `peruRegions`, el SVG del Perú, `getRegionImpact`,
   `getImpactColor`, `getImpactSize`, la leyenda "Alto/Medio/Bajo" y "Regiones Prioritarias".

Nota Leaflet: `LimaMap` ya importa su CSS; el Panel ya lo usa fuera de Territorio sin problema.

## Criterios de aceptación

1. `npx tsc --noEmit && npm run build` pasan; `grep -n "Arequipa\|Cusco\|Piura\|Puno\|peruRegions" src/components/recommendations/ImpactMap.tsx` → 0.
2. En el navegador, con las 15 recomendaciones reales: el mapa de Lima aparece coloreado — **San Juan
   de Lurigancho y San Martín de Porres entre los más oscuros** (son los más mencionados; verifica la
   cuenta exacta con la tabla de `referencia/datos-reales.md`: SJL aparece en ≥ 4 recomendaciones).
3. La línea de metro-wide dice el número correcto (los `target_region` que empiezan con
   "Lima Metropolitana": 4 de 15 al 23-ago; recuenta contra la lista vigente).
4. "Zonas con más trabajo" lista ≥ 4 zonas con cuenta > 0, ordenadas.
5. Con el filtro de categoría en una pestaña con pocas recomendaciones, el mapa se recalcula
   (recibe `recommendations` ya filtradas si la página así lo pasa — verifica qué recibe hoy:
   `RecommendationsPage:275` pasa `recommendations` sin filtrar; **déjalo así** y anótalo: el mapa
   refleja la cartera completa, no el filtro. Es una decisión, no un bug).

## Commit

```
feat(reco): R-02 mapa de impacto sobre los 43 distritos reales de Lima

El mapa de impacto era un SVG del Peru con 7 regiones nacionales hardcodeadas y emparejaba por
igualdad exacta contra target_region: con las recomendaciones municipales reales ("Lima Este,
San Juan de Lurigancho, ...") coincidia 0 de 15 y el widget se pintaba gris y vacio en silencio.

Nuevo parser compartido (utils/targetRegion) que resuelve zonas y distritos contra el catalogo
LIMA_DISTRICTS con normalizacion de tildes, y ImpactMap reescrito sobre LimaMap (GeoJSON real):
distritos coloreados por cuantas recomendaciones los tocan, resumen por zona, top de distritos
y nota explicita para las recomendaciones que aplican a toda la ciudad.
```
