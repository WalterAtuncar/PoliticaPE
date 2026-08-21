# Taxonomía de temas municipales (Lima 2026)

Claves estables (`topic`) que usan el clasificador (S1-09), `/race/topics`, el brief y las recomendaciones. **No añadir ni renombrar claves sin actualizar `TOPICS` en `app/services/classifier.py` y `TOPIC_LABELS` en `project-react/src/data/topics.ts`.**

| `topic` | Etiqueta (UI) | Incluye | Palabras guía (para el pre-filtro y el prompt) |
|---|---|---|---|
| `inseguridad` | Inseguridad ciudadana | robos, asaltos, sicariato, bandas, serenazgo, cámaras, policía municipal, patrullaje | inseguridad, delincuencia, robo, asalto, sicario, sicariato, banda, serenazgo, sereno, patrullaje, cámaras, policía municipal, balacera |
| `extorsion` | Extorsión | extorsión a transportistas, comerciantes, cobro de cupos, paros de transportistas | extorsión, extorsion, cupos, cobro de cupo, paro de transportistas, extorsionadores, Los Gallegos, Tren de Aragua |
| `transporte` | Transporte y tránsito | ATU, informales, combis, Metropolitano, corredores, Línea 1/2, tráfico, ciclovías, taxis, peajes | transporte, tránsito, ATU, combi, cúster, Metropolitano, corredor, Línea 1, Línea 2, tráfico, congestión, ciclovía, peaje, Rutas de Lima, Vía Expresa |
| `limpieza_residuos` | Basura y limpieza | recojo de basura, rellenos, reciclaje, contratos de limpieza, puntos críticos | basura, residuos, limpieza pública, recojo, relleno sanitario, reciclaje, acumulación de basura |
| `obras_infraestructura` | Obras e infraestructura | pistas, veredas, puentes, Vía Expresa Sur, parques, alumbrado, obras paralizadas | obras, pistas, veredas, puente, infraestructura, bypass, intercambio vial, alumbrado, parque, obra paralizada, Emape, Invermet |
| `corrupcion` | Corrupción y fiscalización | licitaciones, Contraloría, denuncias, Fiscalía, sobrevaloración | corrupción, Contraloría, licitación, sobrevaloración, denuncia, Fiscalía, investigación, lavado, coima |
| `legalidad_candidatura` | Legalidad de candidaturas | renuncia de Rubio, sucesión de lista, tachas, exclusiones, JNE/JEE, reelección | JNE, JEE, tacha, exclusión, renuncia, sucesión, primer regidor, reelección, inscripción, resolución |
| `comercio_informal` | Comercio informal y ambulantes | ambulantes, Gamarra, Mesa Redonda, desalojos, mercados | ambulantes, comercio informal, desalojo, Gamarra, Mesa Redonda, Las Malvinas, mercado, fiscalización |
| `espacios_publicos_ambiente` | Espacios públicos y ambiente | parques, Costa Verde, playas, áreas verdes, contaminación, ruido | parque, áreas verdes, Costa Verde, playa, contaminación, ruido, arbolado, Pantanos de Villa |
| `servicios_basicos` | Agua, desagüe, servicios | Sedapal, cortes de agua, desagüe, luz, alcantarillado | Sedapal, agua, desagüe, alcantarillado, corte de agua, tubería, aniego |
| `gestion_municipal` | Gestión municipal actual | aprobación de Reggiardo, presupuesto, ejecución, deuda, Concejo | gestión, alcalde Reggiardo, presupuesto municipal, ejecución, Concejo Metropolitano, regidores, ordenanza, deuda municipal |
| `economia_empleo` | Economía y empleo local | empleo, MYPES, formalización, tributos, arbitrios | empleo, MYPE, arbitrios, impuesto predial, SAT, formalización, inversión |
| `vivienda_urbanismo` | Vivienda y urbanismo | invasiones, tráfico de terrenos, habilitación urbana, zonificación | invasión, tráfico de terrenos, habilitación urbana, zonificación, licencia de construcción, asentamiento |
| `campana_electoral` | Campaña y encuestas | encuestas, debates, alianzas, propaganda, mítines, endosos | encuesta, debate, alianza, mitin, propaganda, franja, plan de gobierno, endoso, candidatura |
| `gobierno_nacional` | Gobierno central | medidas del Ejecutivo/Congreso que afectan a Lima | Gobierno, Ejecutivo, presidenta, ministro, Congreso, PCM, estado de emergencia |
| `otro` | Otro | todo lo que no encaje | — |

## Reglas para el clasificador

- Un texto tiene **un** `topic` principal y hasta dos `secondary_topics`.
- `extorsion` prevalece sobre `inseguridad` cuando el texto menciona cupos/extorsión explícitamente.
- `legalidad_candidatura` prevalece sobre `campana_electoral` cuando hay JNE/JEE/tacha/renuncia.
- `gestion_municipal` se usa cuando el sujeto es la gestión actual (Reggiardo/MML), no una promesa de candidato.

## Pesos de tema para el score de oportunidad (S2-12)

Derivados de la encuesta de prioridades (inseguridad 71 %, transporte 9 %) y de la prensa de agosto. Constante `TOPIC_WEIGHTS` en `app/services/territory.py`:

```python
TOPIC_WEIGHTS = {
    "inseguridad": 1.00, "extorsion": 0.95, "transporte": 0.60, "limpieza_residuos": 0.50,
    "corrupcion": 0.45, "obras_infraestructura": 0.40, "servicios_basicos": 0.35,
    "comercio_informal": 0.30, "vivienda_urbanismo": 0.30, "gestion_municipal": 0.30,
    "legalidad_candidatura": 0.25, "espacios_publicos_ambiente": 0.20, "economia_empleo": 0.20,
    "campana_electoral": 0.10, "gobierno_nacional": 0.10, "otro": 0.05,
}
```
