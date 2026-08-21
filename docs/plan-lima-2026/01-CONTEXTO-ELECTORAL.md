# 01 — Contexto electoral (verificado al 21-ago-2026)

Todo lo que el sistema debe modelar. Las cifras con fuente están en `referencia/fuentes.md`.

## La elección

| Dato | Valor |
|---|---|
| Proceso | Elecciones Regionales y Municipales 2026 (ERM 2026) |
| Circunscripción objetivo | **Lima Metropolitana** (provincia de Lima, 43 distritos). Callao es circunscripción distinta: **excluir**. |
| Fecha | **Domingo 4 de octubre de 2026** |
| Sistema | **Una sola vuelta**, gana la lista con más votos válidos. Lista cerrada y bloqueada. 39 regidores con premio de mayoría (mitad más uno o D'Hondt, lo que más favorezca). Sin reelección inmediata de alcaldes. Período 2027–2030. |
| Padrón | 7 875 631 electores en Lima Metropolitana |
| Listas inscritas | 21 (42 solicitaron) |
| Alcalde actual | Renzo Reggiardo (Renovación Popular), por sucesión tras la renuncia de López Aliaga en oct-2025 |
| Presidente de la República | Keiko Fujimori (Fuerza Popular), ganó la segunda vuelta del 7-jun-2026 con 50,14 % vs 49,87 % (Roberto Sánchez); proclamada 3-jul, asumió 28-jul-2026 |

## Calendario legal (configurar en S0-03)

| Fecha | Hito | Variable |
|---|---|---|
| 2026-08-05 | Listas admitidas publicadas | — |
| 2026-08-20 | JEE resuelven tachas y exclusiones | — |
| 2026-09-04 | JNE resuelve apelaciones | — |
| **2026-09-05** | Candidaturas definitivas e inmodificables | `CANDIDACY_FINAL_DATE` |
| por confirmar (sep) | Debate JNE Lima Metropolitana; franja electoral | `DEBATE_DATE` (vacío hasta que el JNE publique) |
| **2026-09-27** | Último día en que se pueden **publicar** encuestas (LOE art. 191: hasta el domingo anterior). Veda desde el 28-sep. | `POLL_BLACKOUT_FROM=2026-09-28` |
| **2026-10-01** | Último día de mítines y reuniones públicas (LOE art. 190: prohibidas desde 2 días antes) | `RALLY_DEADLINE` |
| **2026-10-02** | Último día de propaganda electoral (prohibida desde 24 h antes) | `PROPAGANDA_DEADLINE` |
| 2026-10-03 | Último día para exclusión extraordinaria; ley seca | — |
| **2026-10-04** | Elección | `ELECTION_DATE` |
| 2027-01-01 | Inicio de gestión | — |

> Las fechas de veda y cierre siguen la Ley Orgánica de Elecciones y la Ley 27369. Son valores por defecto en configuración precisamente para que, si el JNE publica una resolución específica para ERM 2026 con otra fecha, se cambie una variable y no código.

## La carrera (agosto 2026)

| Candidato | Lista | Ipsos 5–6 ago | Datum 7–9 ago | CIT 13–15 ago | Notas |
|---|---|---|---|---|---|
| Rafael López Aliaga | Renovación Popular (va como **primer regidor**; Luis Rubio renunció el 4-ago; JNE lo admitió por Res. 1758-2026-JNE) | 21 | 16 | 32,0 | Fuerte en Lima Moderna (22,9 %) y Sur (19,7 %); débil en Lima Este (12,4 %). 60 % cree que la renuncia fue para que encabece; 40 % "poco seria", 28 % "ilegal" |
| Carlos Bruce | Somos Perú | 13 | 13 | 17,4 | Alcalde de Surco; lideraba en julio |
| Daniel Urresti | Podemos Perú | 7 | 9,5 | 13,8 | Perdió 2022 por <1 punto |
| Francis Allison | Avanza País | 9 | 9,3 | — | Alcalde de Magdalena |
| Susel Paredes | Ahora Nación | 6 | 8,7 | — | |
| Samuel Daza | Fuerza Popular | 6 | — | — | Cayó de 10 a 6 |
| Ricardo Belmont | Obras | 5 | — | — | |

Ipsos (en % de encuestados): no precisa 21 %, blanco/viciado 4 %; 23 % no conoce a ningún candidato. Datum: indecisos + blanco/viciado ≈ un tercio. CIT en % de votos válidos. **Las cifras entre encuestadoras no son comparables sin normalizar**; por eso el promedio ponderado de S1-10 separa `base = validos | total`.

Lista completa de 21 candidatos con partido: `referencia/candidatos-lima-2026.json`.

## Temas que deciden el voto

- Inseguridad ciudadana: **71 %** pide que sea la prioridad del próximo alcalde. Extorsión a transportistas es el subtema caliente (ago-2026).
- Transporte: 9 %. ATU, transporte informal, Vía Expresa, Línea 1/2, corredores.
- Basura / limpieza: ~29 % lo menciona como preocupación; contratos de limpieza deficientes.
- Corrupción municipal: ~28 %.
- Marco de campaña: **legalidad/seriedad de la candidatura de López Aliaga** (renuncia de Rubio).
- Gobierno central nuevo (Keiko Fujimori desde el 28-jul): cualquier medida en seguridad o presupuesto municipal rebota en Lima.

Taxonomía operativa: `referencia/temas-municipales.md`.

## Zonas de Lima (clasificación Ipsos, usada por las encuestadoras)

| Zona | Distritos | Electores aprox. |
|---|---|---|
| Lima Norte | Ancón, Carabayllo, Comas, Independencia, Los Olivos, Puente Piedra, San Martín de Porres, Santa Rosa | ~1,95 M |
| Lima Este | Ate, Chaclacayo, Cieneguilla, El Agustino, Lurigancho (Chosica), San Juan de Lurigancho, Santa Anita | ~1,75 M |
| Lima Centro | Lima (Cercado), Breña, La Victoria, Rímac, San Luis | ~0,68 M |
| Lima Moderna | Barranco, Jesús María, La Molina, Lince, Magdalena del Mar, Miraflores, Pueblo Libre, San Borja, San Isidro, San Miguel, Santiago de Surco, Surquillo | ~1,20 M |
| Lima Sur | Chorrillos, Lurín, Pachacámac, Pucusana, Punta Hermosa, Punta Negra, San Bartolo, San Juan de Miraflores, Santa María del Mar, Villa El Salvador, Villa María del Triunfo | ~1,80 M |

Detalle con ubigeo, alias y padrón aproximado: `referencia/distritos-lima.json`. **SJL, SMP, Ate, Comas, VMT, VES y SJM concentran ~45 % del voto** y hoy casi no aparecen en los datos.

## Decisión abierta `[WALTER]`: candidatura propia

El plan es agnóstico hasta S2-12 (oportunidad territorial) y S2-13 (recomendaciones), donde hace falta saber **a quién** se asesora. Variable `OWN_CANDIDATE` (display_name exacto del JSON de candidatos). Si no hay respuesta al llegar a S2-12, usar `OWN_CANDIDATE=""` y el sistema opera en modo observador (comparativo entre todos), dejando la nota en el reporte.
