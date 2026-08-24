# B-02 — Redes: compuerta municipal y filtros reales

## Objetivo

Que Redes nunca muestre la era presidencial: solo posts desde la ventana municipal (hoy: cero →
compuerta honesta de "pendiente de activación"), y filtros con los candidatos reales y las 5 zonas.
Cuando Walter ponga `TWITTERAPI_IO_KEY`/`YOUTUBE_API_KEY`, la página cobra vida sin tocar código.

## Precondiciones

- B-01 cerrado (los 8 componentes muertos de `social/` ya no existen).

## Archivos a tocar

- `src/hooks/useSocialData.ts` — ventana municipal + filtro de entidad.
- `src/components/social/SocialPage.tsx` — compuerta.
- `src/components/social/SocialHeader.tsx` — listas de filtros.
- `src/types/social.ts` — solo si algún campo de `SocialFilters` queda muerto (ver paso 4).

## Pasos

### 1. Ventana municipal en `useSocialData`

Tras mapear los posts (donde se construye `timestamp`), filtra:

```ts
// Antes del pivote municipal (2026-08-21) la base guarda posts de la campana presidencial
// (enero-mayo) mas ruido de scraping. Nada de eso debe llegar a la UI municipal.
// Mismo corte que CLASSIFY_MIN_DATE en el backend.
const MUNICIPAL_WINDOW_START = new Date('2026-07-01T00:00:00Z');
...
const windowed = mapped.filter(p => p.timestamp >= MUNICIPAL_WINDOW_START);
```

Todo lo derivado (influencers, hashtags, metrics) debe calcularse sobre `windowed`. Revisa dónde se
derivan hoy y muévelo si hace falta. Exporta también `totalInWindow: windowed.length` (para la compuerta).

### 2. Compuerta en `SocialPage`

Si `!isLoading && totalInWindow === 0`: en lugar de `SocialHeader` + tabs + contenido, renderiza una
sola `Card glass p-10 text-center max-w-2xl mx-auto`:

- Icono `MessageSquare` grande en gris.
- Título: **"Monitoreo de redes — pendiente de activación"**.
- Texto: "El módulo está construido: feed unificado, ranking de influencia, hashtags y sentimiento
  por plataforma. Se activa al configurar las claves de X (twitterapi.io) y YouTube en el servidor;
  desde ese momento los posts de la campaña municipal aparecen aquí automáticamente."
- Línea `text-xs text-gray-400`: "Sin publicaciones desde el 1 de julio de 2026 en la base."
- Debajo, **conserva la pestaña de crisis**: el `AlertsPanel` sí tiene datos reales. Píntalo bajo la
  tarjeta con su propio ancho (es el mismo componente del Panel).

Con posts en ventana (futuro), la página se comporta como hoy: header + 5 tabs.

### 3. Filtros reales en `SocialHeader`

- **Entidades** (`:40-47`): borra la lista hardcodeada. Recibe por props (o usa `usePoliticalFigures`
  directamente en el header, como hace `TerritoryPage`) los candidatos:
  `figures.filter(f => f.is_active && (f.figure_role === 'candidate' || f.figure_role === 'incumbent'))`,
  ordenados con `is_own_candidate` primero. `value` = `display_name`. Primera opción
  `{ value: 'all', label: 'Todas las figuras' }`.
- **Regiones** (`:49-56`): reemplaza por `{ value: 'all', label: 'Toda Lima' }` + las 5 `ZONES` de
  `src/data/limaDistricts.ts`. Etiqueta del control: "Zona".

### 4. Cablear el filtro de entidad (hoy es un control muerto)

`filterPosts` en `useSocialData` aplica platform/sentiment/region pero **nunca `entity`**. Añade:

```ts
if (currentFilters.entity !== 'all') {
  const needle = normalize(currentFilters.entity);   // sin tildes, lowercase — copia el patron de utils/targetRegion.ts
  filtered = filtered.filter(p =>
    normalize(p.content).includes(needle) || normalize(p.author).includes(needle));
}
```

Si prefieres, exporta `norm` desde `utils/targetRegion.ts` como `normalizeText` y reúsalo (anótalo).
El campo `keywords` de `SocialFilters`: si nadie lo setea ni lo aplica (verifícalo), bórralo del tipo
y de `initialFilters`.

## Criterios de aceptación

1. `npx tsc --noEmit && npm run build` pasan.
2. Navegador → Redes: **la compuerta**, no las 5 pestañas. Sin rastro de posts de mayo, IELTS ni MLB.
   El AlertsPanel debajo muestra las alertas reales.
3. `grep -nE "Boluarte|Castillo|Arequipa|Todo el Perú|Perú Libre|Acción Popular|Fuerza Popular" src/components/social/` → 0.
4. Simulación de futuro con datos (para probar que la página viva funciona): baja temporalmente
   `MUNICIPAL_WINDOW_START` a `2026-01-01`, recarga → aparecen header + tabs con los posts viejos,
   el filtro de entidad con los candidatos reales funciona (elige "Keiko Fujimori": el feed se reduce a
   sus posts), el de zona lista las 5 zonas. **Restaura `2026-07-01` y verifica la compuerta otra vez
   antes del commit.**
5. Consola sin errores en ambos estados.

## Commit

```
fix(redes): B-02 compuerta municipal y filtros con candidatos reales

La pantalla mostraba los 1408 posts de la era presidencial (enero-mayo), incluido ruido de
scraping (tests de IELTS, iglesias, beisbol), con filtros de Dina Boluarte, Pedro Castillo y
regiones nacionales. Ahora solo considera publicaciones desde la ventana municipal (2026-07-01,
mismo corte que CLASSIFY_MIN_DATE): como aun no hay scraping social activo, muestra una
compuerta honesta de "pendiente de activacion" con la pestania de crisis viva (AlertsPanel),
y cobrara vida sola cuando se configuren TWITTERAPI_IO_KEY y YOUTUBE_API_KEY.

Los filtros pasan a los candidatos reales de la base (propio primero) y a las 5 zonas de Lima,
y el filtro de entidad, que era un control muerto (nunca se aplicaba), queda cableado por
contenido y autor con normalizacion de tildes.
```
