# S0-03 — Calendario electoral a configuración

**Objetivo:** eliminar las fechas presidenciales hardcodeadas (H1, H2) y centralizar el calendario en un módulo + endpoint que consumen el prompt de IA, el countdown del frontend y, más adelante, alertas y modo veda.

**Precondiciones:** S0-01.

**Archivos a tocar:**
- nuevo `project-scrapping/app/electoral_config.py`
- nuevo `project-scrapping/app/api/endpoints/electoral.py`
- `project-scrapping/app/api/__init__.py`
- `project-scrapping/app/services/ai_recommendations.py` (función `build_claude_prompt`, líneas ~633-660 y el texto del prompt en 711, 713, 729)
- nuevo `project-react/src/hooks/useElectoralConfig.ts`
- `project-react/src/components/recommendations/ElectoralCountdown.tsx` (reescritura)
- `project-react/src/config/api.ts` (clave `ELECTORAL_CONFIG`)
- `.env.example`, `.env`, variables Railway

## Pasos

1. Crear `app/electoral_config.py` con este contenido exacto:
   ```python
   import os
   from datetime import date
   from typing import Optional


   def _d(name: str, default: str) -> Optional[date]:
       raw = os.getenv(name, default).strip()
       return date.fromisoformat(raw) if raw else None


   ELECTION_NAME = os.getenv("ELECTION_NAME", "Elecciones Municipales de Lima Metropolitana 2026")
   ELECTION_TYPE = os.getenv("ELECTION_TYPE", "municipal")
   ELECTORAL_DISTRICT = os.getenv("ELECTORAL_DISTRICT", "Lima Metropolitana")
   ELECTION_ROUNDS = int(os.getenv("ELECTION_ROUNDS", "1"))
   OWN_CANDIDATE = os.getenv("OWN_CANDIDATE", "").strip()

   ELECTION_DATE = _d("ELECTION_DATE", "2026-10-04")
   CANDIDACY_FINAL_DATE = _d("CANDIDACY_FINAL_DATE", "2026-09-05")
   POLL_BLACKOUT_FROM = _d("POLL_BLACKOUT_FROM", "2026-09-28")
   RALLY_DEADLINE = _d("RALLY_DEADLINE", "2026-10-01")
   PROPAGANDA_DEADLINE = _d("PROPAGANDA_DEADLINE", "2026-10-02")
   DEBATE_DATE = _d("DEBATE_DATE", "")

   MESES_ES = {1: "enero", 2: "febrero", 3: "marzo", 4: "abril", 5: "mayo", 6: "junio",
               7: "julio", 8: "agosto", 9: "septiembre", 10: "octubre", 11: "noviembre", 12: "diciembre"}


   def fmt_es(d: Optional[date]) -> str:
       return f"{d.day} de {MESES_ES[d.month]} de {d.year}" if d else "por confirmar"


   def days_to(d: Optional[date], today: Optional[date] = None) -> Optional[int]:
       if d is None:
           return None
       today = today or date.today()
       return (d - today).days


   def campaign_phase(today: Optional[date] = None) -> str:
       """pre | campaign | poll_blackout | closing | election_day | post"""
       today = today or date.today()
       if today > ELECTION_DATE:
           return "post"
       if today == ELECTION_DATE:
           return "election_day"
       if today > PROPAGANDA_DEADLINE:
           return "closing"
       if POLL_BLACKOUT_FROM and today >= POLL_BLACKOUT_FROM:
           return "poll_blackout"
       if CANDIDACY_FINAL_DATE and today < CANDIDACY_FINAL_DATE:
           return "pre"
       return "campaign"


   def polls_publishable(today: Optional[date] = None) -> bool:
       today = today or date.today()
       return not (POLL_BLACKOUT_FROM and today >= POLL_BLACKOUT_FROM and today <= ELECTION_DATE)


   def propaganda_allowed(today: Optional[date] = None) -> bool:
       today = today or date.today()
       return today <= PROPAGANDA_DEADLINE


   def rallies_allowed(today: Optional[date] = None) -> bool:
       today = today or date.today()
       return today <= RALLY_DEADLINE


   def as_dict(today: Optional[date] = None) -> dict:
       today = today or date.today()
       return {
           "election_name": ELECTION_NAME,
           "election_type": ELECTION_TYPE,
           "electoral_district": ELECTORAL_DISTRICT,
           "rounds": ELECTION_ROUNDS,
           "own_candidate": OWN_CANDIDATE,
           "election_date": ELECTION_DATE.isoformat(),
           "candidacy_final_date": CANDIDACY_FINAL_DATE.isoformat() if CANDIDACY_FINAL_DATE else None,
           "poll_blackout_from": POLL_BLACKOUT_FROM.isoformat() if POLL_BLACKOUT_FROM else None,
           "rally_deadline": RALLY_DEADLINE.isoformat(),
           "propaganda_deadline": PROPAGANDA_DEADLINE.isoformat(),
           "debate_date": DEBATE_DATE.isoformat() if DEBATE_DATE else None,
           "today": today.isoformat(),
           "phase": campaign_phase(today),
           "days_to_election": days_to(ELECTION_DATE, today),
           "days_to_propaganda_deadline": days_to(PROPAGANDA_DEADLINE, today),
           "days_to_poll_blackout": days_to(POLL_BLACKOUT_FROM, today),
           "days_to_candidacy_final": days_to(CANDIDACY_FINAL_DATE, today),
           "polls_publishable": polls_publishable(today),
           "propaganda_allowed": propaganda_allowed(today),
           "rallies_allowed": rallies_allowed(today),
       }
   ```
2. Crear `app/api/endpoints/electoral.py`:
   ```python
   from fastapi import APIRouter, Depends
   from app.api.deps import get_current_user
   from app import electoral_config

   router = APIRouter()


   @router.get("/config")
   def get_electoral_config(current_user: dict = Depends(get_current_user)):
       return electoral_config.as_dict()
   ```
3. En `app/api/__init__.py`: importar `electoral` y añadir `api_router.include_router(electoral.router, prefix="/electoral", tags=["electoral"])`.
4. En `ai_recommendations.py`, dentro de `build_claude_prompt`:
   - Borrar el dict `MESES_ES` local y las líneas `campaign_deadline = date(2026, 4, 10)` / `days_remaining = ...` / `today_str = ...`.
   - Añadir al inicio del archivo `from app import electoral_config as ec`.
   - Reemplazar por:
     ```python
     today = date.today()
     days_remaining = max(0, ec.days_to(ec.PROPAGANDA_DEADLINE, today) or 0)
     today_str = ec.fmt_es(today)
     deadline_str = ec.fmt_es(ec.PROPAGANDA_DEADLINE)
     election_str = ec.fmt_es(ec.ELECTION_DATE)
     ```
   - En `urgency_block`, `CONTEXTO ELECTORAL CRÍTICO`, y en las tres reglas del JSON/REGLAS FINALES, sustituir todo "10 de abril de 2026"/"10/04/2026" por `{deadline_str}` (o `{ec.PROPAGANDA_DEADLINE.strftime('%d/%m/%Y')}`) y "Elecciones generales en Perú: 12 de abril de 2026" por `f"- {ec.ELECTION_NAME}: {election_str} ({ec.ELECTION_ROUNDS} vuelta{'s' if ec.ELECTION_ROUNDS > 1 else ''}, circunscripción {ec.ELECTORAL_DISTRICT})"`.
   - Resultado: `grep -n "abril" app/services/ai_recommendations.py` devuelve **solo** la entrada del diccionario de meses si quedara alguno (no debe quedar; el dict ahora vive en electoral_config).
5. Frontend. En `config/api.ts` añadir `ELECTORAL_CONFIG: '/api/v1/electoral/config',` dentro de `ENDPOINTS`.
6. Crear `hooks/useElectoralConfig.ts`:
   ```ts
   import { useEffect, useState } from 'react';
   import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';

   export interface ElectoralConfig {
     election_name: string; election_type: string; electoral_district: string; rounds: number; own_candidate: string;
     election_date: string; candidacy_final_date: string | null; poll_blackout_from: string | null;
     rally_deadline: string; propaganda_deadline: string; debate_date: string | null; today: string;
     phase: 'pre' | 'campaign' | 'poll_blackout' | 'closing' | 'election_day' | 'post';
     days_to_election: number; days_to_propaganda_deadline: number; days_to_poll_blackout: number | null; days_to_candidacy_final: number | null;
     polls_publishable: boolean; propaganda_allowed: boolean; rallies_allowed: boolean;
   }

   let cache: ElectoralConfig | null = null;

   export function useElectoralConfig() {
     const [config, setConfig] = useState<ElectoralConfig | null>(cache);
     const [isLoading, setIsLoading] = useState(!cache);
     useEffect(() => {
       if (cache) return;
       fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.ELECTORAL_CONFIG}`, { headers: getAuthHeaders() })
         .then(r => (r.ok ? r.json() : null))
         .then(data => { if (data) { cache = data; setConfig(data); } })
         .finally(() => setIsLoading(false));
     }, []);
     return { config, isLoading };
   }
   ```
7. Reescribir `ElectoralCountdown.tsx` manteniendo el mismo diseño (gradiente por urgencia, barra de progreso, icono `AlertTriangle` en crítico), pero:
   - Usa `useElectoralConfig()`; si `config` es null renderiza `null`.
   - `daysToDeadline = config.days_to_propaganda_deadline`, `daysToElection = config.days_to_election`.
   - Texto: `Elecciones: {fecha larga es-PE de election_date} · Cierre de propaganda: {propaganda_deadline}`; si `phase === 'poll_blackout'` añade chip "Veda de encuestas"; si `phase === 'closing'` muestra "Propaganda cerrada — solo respuesta de prensa"; si `post` muestra el mensaje de análisis post-electoral.
   - `totalCampaignDays = 60` (del 5-sep al 4-oct, aproximado) para la barra.
   - Eliminar las constantes `ELECTION_DATE` y `CAMPAIGN_DEADLINE`.
8. Añadir al `.env.example` (y a `.env` local y Railway) el bloque `# S0-03` de `03-DISENO-OBJETIVO.md`. En Railway:
   ```bash
   railway variables --service politicape-web --set "ELECTION_DATE=2026-10-04" --set "CANDIDACY_FINAL_DATE=2026-09-05" --set "POLL_BLACKOUT_FROM=2026-09-28" --set "RALLY_DEADLINE=2026-10-01" --set "PROPAGANDA_DEADLINE=2026-10-02" --set "ELECTION_TYPE=municipal" --set "ELECTION_ROUNDS=1" --set "ELECTORAL_DISTRICT=Lima Metropolitana" --set "ELECTION_NAME=Elecciones Municipales de Lima Metropolitana 2026"
   ```

## Criterios de aceptación

1. `grep -rn "2026-04\|abril de 2026\|10/04/2026" project-scrapping/app project-react/src` → sin resultados.
2. `curl -s -H "Authorization: Bearer $TOKEN" localhost:8000/api/v1/electoral/config` devuelve `"phase":"pre"` si hoy < 5-sep o `"campaign"` después, `"days_to_election"` correcto y `"polls_publishable":true`.
3. Test de fases (desde `project-scrapping`): 
   ```bash
   python -c "from datetime import date; from app import electoral_config as ec; print([ec.campaign_phase(date(2026,8,21)), ec.campaign_phase(date(2026,9,10)), ec.campaign_phase(date(2026,9,28)), ec.campaign_phase(date(2026,10,3)), ec.campaign_phase(date(2026,10,4)), ec.campaign_phase(date(2026,10,5))])"
   ```
   imprime `['pre', 'campaign', 'poll_blackout', 'closing', 'election_day', 'post']`.
4. `cd project-react && npx tsc --noEmit` sin errores; la pantalla Recomendaciones muestra el countdown con "4 de octubre".
5. `python -c "from app.services.ai_recommendations import build_claude_prompt; print(build_claude_prompt([], {})[:600])"` contiene "Elecciones Municipales de Lima Metropolitana 2026" y "2 de octubre de 2026".

## Commit

`feat(lima2026): S0-03 calendario electoral a configuración (electoral_config, /electoral/config, countdown)`
