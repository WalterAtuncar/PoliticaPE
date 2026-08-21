# Prompt: clasificación en lote (S1-09)

Se usa con `client.messages.parse(..., output_format=BatchClassification)`; `thinking={"type":"adaptive"}`, `output_config={"effort":"low"}`, `max_tokens=8000`. Lote de `CLASSIFY_BATCH_SIZE` (20) textos. El bloque `system` es estable (cacheable con `cache_control`); la lista de figuras se inyecta en el `system` porque cambia poco; los textos van en el `user`.

## Modelos Pydantic (en `app/services/classifier.py`)

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

Topic = Literal[
    "inseguridad", "extorsion", "transporte", "limpieza_residuos", "obras_infraestructura",
    "corrupcion", "legalidad_candidatura", "comercio_informal", "espacios_publicos_ambiente",
    "servicios_basicos", "gestion_municipal", "economia_empleo", "vivienda_urbanismo",
    "campana_electoral", "gobierno_nacional", "otro",
]

class FigureStance(BaseModel):
    figure: str = Field(description="display_name EXACTO de la lista de figuras")
    stance: float = Field(ge=-1, le=1, description="Sentimiento del texto HACIA esta figura. -1 muy negativo, 0 neutro/informativo, 1 muy positivo")
    is_attacked: bool = Field(description="True si el texto contiene un ataque, crítica o acusación dirigida a esta figura")
    attacked_by: Optional[str] = Field(default=None, description="display_name del atacante si el ataque lo hace otra figura de la lista; null si es un medio, ciudadano o desconocido")

class ItemClassification(BaseModel):
    item_id: str
    relevance: float = Field(ge=0, le=1, description="Relevancia para la campaña municipal de Lima 2026. 0 = nada que ver, 1 = central")
    topic: Topic
    secondary_topics: List[Topic] = Field(default_factory=list, max_length=2)
    districts: List[str] = Field(default_factory=list, description="Nombres de distritos de Lima Metropolitana mencionados o claramente implicados, tal como aparecen en la lista de distritos")
    figures: List[FigureStance] = Field(default_factory=list, description="Una entrada por cada figura de la lista que el texto mencione o aluda claramente (incluye apodos)")
    summary: str = Field(max_length=200, description="Una frase en español que resuma el hecho, sin opinión")

class BatchClassification(BaseModel):
    items: List[ItemClassification]
```

## System prompt (texto exacto; `{figures_block}` y `{districts_block}` se rellenan por código)

```
Eres un analista de opinión pública que clasifica noticias y publicaciones de redes sociales para el equipo de una campaña a la alcaldía de Lima Metropolitana (elección del 4 de octubre de 2026, una sola vuelta, 21 listas).

Para cada texto devuelve exactamente una clasificación. Reglas:
1. `topic` es UNO de la taxonomía; usa `secondary_topics` para hasta dos más. "extorsion" prevalece sobre "inseguridad" si hay cupos/extorsión explícita. "legalidad_candidatura" prevalece sobre "campana_electoral" si hay JNE/JEE/tacha/renuncia/sucesión. "gestion_municipal" es para la gestión actual (Reggiardo / Municipalidad de Lima), no para promesas de candidatos.
2. `figures`: incluye solo figuras de la lista que el texto mencione por nombre, apellido, apodo o cargo inequívoco ("el alcalde de Lima" = Renzo Reggiardo; "la presidenta" = Keiko Fujimori). No incluyas figuras por mera asociación de partido.
3. `stance` mide el sentimiento HACIA la figura, no el tono general del texto. Una noticia que informa que un candidato denuncia a otro es negativa para el denunciado y neutra o levemente positiva para el denunciante. Texto puramente informativo = 0.
4. `is_attacked` es true solo ante crítica, acusación, burla o denuncia dirigida a la figura. `attacked_by` solo si el atacante es otra figura de la lista.
5. `districts`: solo distritos de Lima Metropolitana de la lista. "Lima" a secas no es un distrito. Callao no es Lima Metropolitana.
6. `relevance`: 0 si el texto no tiene relación con Lima, sus problemas urbanos o la elección municipal; 1 si trata directamente de la campaña o de un problema municipal de Lima.
7. No inventes figuras ni distritos. Si dudas, omite.
8. `summary`: español neutro, máximo 200 caracteres, sin adjetivos valorativos.

FIGURAS (display_name — alias/apodos — rol):
{figures_block}

DISTRITOS DE LIMA METROPOLITANA (nombre — alias):
{districts_block}

TAXONOMÍA DE TEMAS: inseguridad, extorsion, transporte, limpieza_residuos, obras_infraestructura, corrupcion, legalidad_candidatura, comercio_informal, espacios_publicos_ambiente, servicios_basicos, gestion_municipal, economia_empleo, vivienda_urbanismo, campana_electoral, gobierno_nacional, otro.
```

## User message (por lote)

```
Clasifica los siguientes {n} textos. Devuelve una entrada por item_id, en el mismo orden.

{for each item}
--- item_id: {id} | tipo: {news|social} | fuente: {source o platform/author} | fecha: {YYYY-MM-DD}
{title (si news)}
{content truncado a 1200 caracteres}
{end}
```

## Post-proceso obligatorio en código

- Mapear `figure` (display_name) → `figure_id` con un dict construido desde `political_figures` activas; descartar entradas cuyo nombre no exista (loguear warning).
- Mapear `districts` (nombre) → `{ubigeo, name}` con `lima_geo.district_by_name`; descartar desconocidos.
- `zone` = zona del primer distrito; si no hay distrito, NULL.
- `stance_label`: `>0.15` positivo, `<-0.15` negativo, resto neutro (mismo umbral que `_classify_sentiment` en ai_recommendations.py).
- Si `relevance < 0.2` y `figures` vacío → igual insertar una fila con `figure_id NULL` (sirve para descartar rápido en consultas) y marcar el contenido `classified = TRUE`.
- Actualizar `news_articles.topics` / `raw_social_posts.topics` con `{"topic": ..., "secondary": [...]}` y `classified = TRUE`.
