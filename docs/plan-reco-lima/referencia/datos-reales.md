# Datos reales de la pantalla (sondeados el 23-ago-2026, con token)

Materia de prueba para los criterios de aceptación. Si al ejecutar hay más recomendaciones (se
regeneran en cada P-06 del plan del Panel), **recuenta contra la lista vigente** con el mismo query;
la estructura no cambia.

## Las 15 recomendaciones: `target_region` (13 valores distintos)

```
GET /api/v1/recommendations?figure_id=0849e7c7-7850-4b8b-be5d-35e67ac57572
```

```
Lima Centro, Cercado de Lima, La Victoria, Rímac
Lima Este, San Juan de Lurigancho, Ate
Lima Este, San Juan de Lurigancho, El Agustino, Ate
Lima Metropolitana, Cercado de Lima
Lima Metropolitana, Cercado de Lima, La Victoria, Santiago de Surco
Lima Metropolitana, San Juan de Lurigancho, San Martín de Porres, Comas, Villa El Salvador, Santiago de Surco
Lima Metropolitana, San Juan de Lurigancho, San Martín de Porres, Villa El Salvador, Santiago de Surco
Lima Moderna, Santiago de Surco, Miraflores, Lince, Barranco
Lima Norte, Comas, San Martín de Porres, Independencia, Carabayllo
Lima Norte, San Martín de Porres, Comas, Independencia, Carabayllo
Lima Norte, San Martín de Porres, Independencia, Carabayllo
Lima Sur, Villa El Salvador, Villa María del Triunfo, Chorrillos
Lima Sur, Villa El Salvador, Villa María del Triunfo, San Juan de Miraflores
```

Derivados (para verificar parser, mapa y filtro):
- **metroWide**: las 4 que empiezan con "Lima Metropolitana".
- **SJL** aparece en ≥ 4; **SMP** en ≥ 4; **VES** en ≥ 4 → los más oscuros del mapa.
- Por zona (mención directa o vía distrito): Norte ≥ 3, Sur ≥ 2, Este ≥ 2, Centro ≥ 2, Moderna ≥ 2.
- Coincidencia con las 7 regiones del componente viejo (`Lima`, `Arequipa`, …): **0 de 15** — es la
  prueba de que el ImpactMap nacional nunca pintó nada.

## Presupuestos y métricas

- `estimated_budget`: soles absolutos — ej. `{"min": 180000, "max": 320000}`, rangos entre ~15 000 y
  ~320 000. Con `${min}K` el render actual da "$180000K".
- `ai_confidence`: 75–90. `projected_roi`: valores tipo 180–260 (%). `priority`: critical/high/medium.
- `status`: **todas `generated`** → todo widget que solo cuente completed/in_progress da 0 hoy.
- `target_demographic`: texto libre en español ("Transportistas, mototaxistas y comerciantes víctimas
  de cupos", "Electores indecisos de Lima Norte (30 % de indecisión declarada)") — jamás coincide con
  los valores del desplegable NSE/edades.

## Categorías (reales en base, coinciden con las tabs)

```
crisis_response 4 · ground_game 3 · rival_contrast 2 · territorial_priority 2 · digital_push 2 · message_of_day 2
```

## Catálogo local para el parser

`src/data/limaDistricts.ts` → `LIMA_DISTRICTS` (43, con `ubigeo/name/zone/electors`, generado del
gazetteer Reniec del backend) y `ZONES = ['Lima Norte','Lima Este','Lima Centro','Lima Moderna','Lima Sur']`.
Los nombres que emite el generador de recomendaciones salen del mismo gazetteer: la coincidencia es
exacta salvo tildes → normalización NFD basta, sin alias.
