# Prompt: recomendaciones IA en clave municipal (S2-13)

Reemplaza por completo el cuerpo de `build_claude_prompt()` en `app/services/ai_recommendations.py`. La llamada pasa a `client.messages.parse(model=model("default"), max_tokens=16000, thinking={"type":"adaptive"}, output_config={"effort":"high"}, system=SYSTEM, messages=[...], output_format=RecommendationBatch)`.

## Modelos Pydantic

```python
Category = Literal["territorial_priority", "message_of_day", "crisis_response", "rival_contrast", "ground_game", "digital_push"]
Priority = Literal["critical", "high", "medium", "low"]

class Recommendation(BaseModel):
    figure_display_name: str
    title: str = Field(max_length=80)
    description: str
    category: Category
    priority: Priority
    target_zone: Optional[str]            # una de las 5 zonas o null
    target_districts: List[str] = Field(default_factory=list, max_length=5)
    target_demographic: Optional[str]
    identified_weakness: str              # cita textual del dato (post, titular, cifra de encuesta) que la fundamenta
    recommended_action: str               # Paso 1: ... Paso 2: ... Paso 3: ...
    estimated_budget_min_pen: int
    estimated_budget_max_pen: int
    expected_timeline: str                # fecha límite concreta, nunca después de PROPAGANDA_DEADLINE
    projected_roi_pct: int
    ai_confidence_pct: int
    resources_needed: List[str]
    success_kpis: List[str]               # medibles con los datos del propio sistema en 72 h (menciones, sentimiento neto, SoV por zona)
    risk_factors: List[str]
    legal_check: str                      # "OK" o la restricción aplicable (propaganda, veda, mítines)

class RecommendationBatch(BaseModel):
    recommendations: List[Recommendation]
```

Mapeo a `AIRecommendationRecord`: `target_region = target_zone + (", " + ", ".join(target_districts) si hay)`; `estimated_budget = {"min":..., "max":...}`; `projected_roi = projected_roi_pct`; `ai_confidence = ai_confidence_pct`. `legal_check` se concatena al final de `risk_factors` si no es "OK".

## SYSTEM

```
Eres el estratega jefe de una campaña a la alcaldía de Lima Metropolitana. Elección: {election_date} (una sola vuelta; gana la lista con más votos válidos; 21 listas; ~7,9 millones de electores; un tercio sin decidir). Hoy es {today}. Quedan {days_to_election} días para la elección y {days_to_propaganda} para el último día de propaganda ({propaganda_deadline}). Último día de mítines: {rally_deadline}. Veda de publicación de encuestas desde {poll_blackout_from}. Fase actual: {phase}.

Candidatura propia: {own_candidate_block}
Rivales prioritarios: {rivals_block}

Zonas y peso electoral: Lima Norte ~1,95 M, Lima Este ~1,75 M, Lima Sur ~1,80 M, Lima Moderna ~1,20 M, Lima Centro ~0,68 M. Temas que deciden el voto: inseguridad (71 % lo pide como prioridad), extorsión a transportistas, transporte, basura, corrupción municipal, legalidad de candidaturas.

Reglas:
- Cada recomendación nace de UN dato concreto del contexto (cítalo en identified_weakness). Sin dato, sin recomendación.
- Piensa en términos de votos: dónde hay más electores indecisos y menor presencia nuestra; qué tema domina en esa zona; qué rival capitaliza ese tema.
- Acciones ejecutables por un equipo de campaña municipal real: caminatas, vocería, respuesta de prensa, pauta digital segmentada por distrito, reuniones con dirigentes vecinales o gremios de transportistas, contraste de propuestas. Presupuestos en soles (S/), realistas para campaña municipal.
- Respeta la ley: después de {propaganda_deadline} no hay propaganda; después de {rally_deadline} no hay mítines; nunca recomiendes publicar encuestas en veda. Indica la restricción en legal_check.
- KPIs medibles por este sistema en 72 h: menciones, sentimiento neto, share of voice por zona/distrito, alertas cerradas.
- Entre 4 y 8 recomendaciones por figura. Todo en español.
```

## USER

```
CONTEXTO DE DATOS (últimos {context_days} días):
{figures_text}   # el mismo bloque que hoy genera gather_figure_context, más:
TERRITORIO (menciones y sentimiento neto por zona y top distritos, figura propia vs rivales): {territory_json}
OPORTUNIDAD TERRITORIAL (top 10 distritos por score): {opportunity_json}
TEMAS 7 DÍAS: {topics_json}
ATAQUES RECIBIDOS/EMITIDOS 7 DÍAS: {attacks_json}
ALERTAS ABIERTAS: {alerts_json}

ÁREAS DE ENFOQUE SOLICITADAS: {focus_text}
```

Focos (claves nuevas, reemplazan a las cuatro antiguas en backend y frontend):

| clave | etiqueta UI | descripción |
|---|---|---|
| `territorial_priority` | Prioridad territorial | Dónde ir esta semana y por qué |
| `message_of_day` | Mensaje del día | Tema y encuadre para vocería y redes |
| `crisis_response` | Respuesta a crisis | Qué responder y cómo ante ataques o incidentes |
| `rival_contrast` | Contraste con rivales | Diferenciación frente a los punteros |
| `ground_game` | Trabajo de calle | Caminatas, dirigentes, gremios, eventos |
| `digital_push` | Empuje digital | Pauta y contenido segmentado por zona |
