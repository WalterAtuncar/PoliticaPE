# 01 — Diagnóstico del barrido (23-ago-2026)

## Método

Análisis de alcanzabilidad de imports: BFS desde `src/pages/MainApp.tsx` (las 7 pantallas del menú),
`App.tsx`, `main.tsx` y las páginas de auth/legales. Todo archivo `.ts/.tsx` bajo `src/` que ningún
camino de imports alcanza es código muerto. Script: `referencia/alcanzables.mjs` (ejecutar desde
`project-react/`). Resultado del 23-ago: **91 alcanzables, 83 muertos** (de 172, excluido `vite-env.d.ts`).

## Los muertos (lista exacta en `referencia/archivos-muertos.txt`)

| Carpeta | Archivos | Qué era |
|---|---|---|
| `components/analytics` (+`/tabs`) | 9 | Analítica presidencial |
| `components/campaigns` | 8 | Gestor de campañas con activos ficticios ("Video Testimonial Arequipa") |
| `components/data` | 10 | "ETL pipelines", "Data quality" — nunca conectados |
| `components/demographics` | 10 | Demografía nacional con datos inventados |
| `components/geo-demographics` | 1 | ídem |
| `components/geographic` | 6 | Mapa de 25 regiones (mock GeoJSON) |
| `components/government` | 1 | Datos gubernamentales presidenciales |
| `components/monitoring` (muertos) | 12 | La vieja Prensa: ActivityHeatmap nacional, SocialFeed, etc. `MonitoringPage.tsx` vivo NO los importa (es autocontenido desde S0-06) |
| `components/settings` (muertos) | 3 | SettingsHeader, ScrapingPanel, UsersManagement — el contenedor vivo no los usa |
| `components/social` (muertos) | 8 | AudienceInsights, CompetitorAnalysis, FakeNewsDetection… con textos "estrategia para Lima y Arequipa" |
| `components/surveys` | 1 | Encuestas presidenciales |
| `data/geographicData.ts` | 1 | Mock GeoJSON nacional |
| `hooks` (muertos) | 12 | **useDemographics** (insights inventados: "envejecimiento en Arequipa… 2,8 años… participación 88,2 %"), useRealtimeData (valores por región hardcodeados), useSettings ("Arequipa, Perú"), useAnalyticsData, useCampaigns, useDataManagement, useGeographicData, useGovernmentData, useAdvancedAnalytics, useScrapingControl, useSurveyData, useWebSocket |
| `types/index.ts` | 1 | Tipos de la era presidencial (PoliticalMetric, Campaign…) — sin imports desde P-05 |

Riesgo que esto elimina: cualquier refactor futuro puede reconectar un componente muerto y sus datos
inventados aparecen en pantalla con aspecto de reales. Además viajan en el bundle (1 229 KB).

## Las 7 pantallas vivas

| Pantalla | Veredicto | Evidencia |
|---|---|---|
| Panel | ✅ limpia | reconstruida en `plan-demo-panel` |
| Prensa | ✅ limpia | `MonitoringPage.tsx` autocontenido, filtro con scope `lima_metropolitana` (`useNewsData.ts:84-85`), tipos de medio prensa/tv/radio/agencia |
| **Redes** | ❌ **B-02** | ver abajo |
| Carrera | ✅ limpia | reconstruida en el pivote (S1-10) |
| Territorio | ✅ limpia | ídem (S1-08) |
| Recomendaciones IA | ✅ salvo 1 fleco | `FiguresPanel.tsx:267` placeholder «Ej: Dina Boluarte» → B-03 |
| Configuración | ✅ | scraping y tags funcionales; "Usuarios" es un placeholder honesto "Módulo en desarrollo" |

`components/layout/Header.tsx`: tiene caja "Buscar…" y campana de notificaciones; B-03 verifica si
son funcionales o cosméticas y actúa según lo que encuentre (instrucciones exactas en el job).

## Redes: la evidencia

- **Datos**: `useSocialData` pide `/data/social?limit=500` sin filtro de fecha. Los 1 408 posts de la
  base son todos ≤ 24-may (era presidencial). Los más recientes que pintaría el feed hoy, verificados
  contra la base: *"Animal sanchez habla de Juan soto y Ronal acuña #mlb"*, *"IELTS LISTENING PRACTICE
  TEST 2026"*, *"Local Church Forsyth - 9:45AM"*, y campaña de segunda vuelta de Keiko. Influencers,
  hashtags y sentimiento se calculan sobre esa misma basura.
- **Filtros** (`SocialHeader.tsx`): entidades = Dina Boluarte, Keiko Fujimori, Pedro Castillo, Fuerza
  Popular, Perú Libre, Acción Popular (`:40-47`); regiones = Todo el Perú, Lima, Arequipa, Cusco,
  La Libertad, Piura… (`:49-56`).
- **Lo que sí sirve**: la estructura de la página (tabs feed/influencers/hashtags/sentiment/crisis),
  `SocialFeed`/`InfluencerRanking`/`HashtagAnalysis`/`SentimentDashboard` derivan todo de los posts
  (sin datos hardcodeados propios), y la pestaña crisis ya usa el `AlertsPanel` bueno del Panel.
  Cuando entren posts municipales, la página funciona.

**Decisión de Walter**: compuerta honesta — con cero posts en la ventana municipal se muestra una sola
pantalla de "pendiente de activación", no cinco pestañas de contenido viejo. Filtros re-apuntados a
candidatos reales y zonas. La pantalla queda en el menú como argumento de venta.
