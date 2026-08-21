# S0-07 — Recorte del menú a lo que dice la verdad

**Objetivo:** que el equipo electoral vea solo pantallas con datos reales. Se ocultan (no se borran) componentes con datos de ejemplo.

**Precondiciones:** S0-06.

**Archivos a tocar:** `project-react/src/components/layout/Sidebar.tsx`, `components/layout/Header.tsx`, `pages/MainApp.tsx`, `components/geo-demographics/GeoDemographicsPage.tsx`, `components/social/SocialTabs.tsx`, `components/social/SocialPage.tsx` (si enruta por id), `components/settings/SettingsTabs.tsx`, `components/dashboard/Dashboard.tsx`.

## Pasos

1. `Sidebar.tsx` `menuItems` queda exactamente así (iconos de lucide-react ya importados salvo `Flag`/`Map`; importarlos):
   ```ts
   const menuItems = [
     { id: 'dashboard', label: 'Panel', icon: Home },
     { id: 'monitoring', label: 'Prensa', icon: Activity },
     { id: 'social', label: 'Redes', icon: MessageSquare },
     { id: 'surveys', label: 'Encuestas', icon: BarChart3 },          // S1-10 lo reemplaza por 'race' (Carrera)
     { id: 'geo-demographics', label: 'Territorio', icon: MapPin },  // S1-08 lo reemplaza por 'territory'
     { id: 'recommendations', label: 'Recomendaciones IA', icon: Brain },
     { id: 'settings', label: 'Configuración', icon: Settings },
   ];
   ```
   Subtítulo bajo el logo: `Lima 2026 · Cuarto de guerra`.
2. `Header.tsx` (mapa de títulos líneas 32-39): `dashboard: 'Panel'`, `monitoring: 'Prensa — Lima Metropolitana'`, `social: 'Redes sociales'`, `surveys: 'Encuestas'`, `'geo-demographics': 'Territorio'`, `recommendations: 'Recomendaciones IA'`, `settings: 'Configuración'`. Eliminar `government`.
3. `MainApp.tsx`: eliminar el `case 'government'` y su import de `GovernmentPage` (el archivo se conserva).
4. `GeoDemographicsPage.tsx`: dejar solo la pestaña `geographic` (eliminar `demographics` del array `tabs` y su render; conservar el import comentado no — eliminarlo para que `tsc` no avise de import sin uso). En S1-08 esta página se reemplaza entera.
5. `SocialTabs.tsx` `tabs`: conservar **exactamente** `feed`, `sentiment`, `hashtags`, `influencers`, `crisis`; eliminar `engagement`, `viral`, `competitors`, `calendar`, `audience`, `fakenews`, `listening`. En `SocialPage.tsx` eliminar los `case` y los imports de los componentes retirados (si algún `case` queda sin tab no hace daño, pero elimina imports no usados).
6. `SettingsTabs.tsx`: conservar `scraping`, `tags`, `users`, `general`; eliminar `integrations`, `notifications`, `security`, `backup`, `audit` (y sus renders/imports en `SettingsContainer.tsx` o `SettingsPage.tsx`, donde estén).
7. `Dashboard.tsx`: eliminar el banner `isUsingMockData` (el hook ya no expone esa propiedad; hoy TypeScript no se queja porque la destructuración de una propiedad inexistente en un objeto tipado sí da error → comprobar con `tsc`; si da error, es precisamente lo que hay que quitar). `GeographicMap` del dashboard: si usa `mockGeographicMetrics`, reemplazar por un estado vacío con texto "El mapa territorial llega en el Sprint 1" hasta S1-08.
8. `npm run build` y revisar que el bundle sigue compilando (`dist/` no se commitea).

## Criterios de aceptación

1. `grep -c "id: '" project-react/src/components/layout/Sidebar.tsx` = 7.
2. `grep -n "government\|demographics\|fakenews\|listening\|calendar\|audience" project-react/src/pages/MainApp.tsx project-react/src/components/social/SocialTabs.tsx project-react/src/components/layout/Sidebar.tsx` → sin resultados.
3. `cd project-react && npx tsc --noEmit && npm run build` sin errores ni warnings de imports sin usar (ESLint: `npx eslint src --max-warnings=50` no sube de lo que había).
4. Navegación manual: las 7 entradas abren sin pantalla en blanco (levantar `npm run dev` y comprobar en consola del navegador que no hay errores de render; si no puedes abrir navegador, al menos `npm run build` + sin errores de TS).

## Commit

`feat(lima2026): S0-07 menú reducido a pantallas con datos reales`
