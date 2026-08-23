# 99 — Checklist final y deploy

Se ejecuta cuando Walter dice que el Panel local está como lo quiere. **No antes.**

## A. Cierre de código

- [ ] `git status` limpio; `git log --oneline -8` muestra P-01…P-05 (y P-07 si hubo ajustes).
- [ ] `cd project-react && npm run build` sin errores. Tamaño del bundle principal anotado (hoy ~1,3 MB; si creció > 200 KB, di por qué).
- [ ] `grep -rnE "mock|lorem|dummy|sample" src/components/dashboard src/hooks/useDashboard.ts` → 0.
- [ ] `docs/plan-lima-2026/ESTADO-EJECUCION.md` actualizado con una sección "Panel de campaña (23–26 ago)": qué se construyó, qué se borró, modo prensa de alertas, y los 3 comandos de P-06 como rutina de mañana.

## B. Deploy a Railway (primera y única vez)

1. Variables que producción aún no tiene activas (las de `OWN_*` están guardadas con `--skip-deploys` y **no** están vivas):
   ```bash
   railway variables --service politicape-web \
     --set "ALERT_WINDOW_MINUTES=1440" --set "ALERT_MIN_MENTIONS=3" --set "ALERT_ATTACK_MIN=2" --skip-deploys
   railway variables --service politicape-web | grep -E "OWN_CANDIDATE|OWN_PARTY_SLUG|ALERT_WINDOW|CLASSIFY_MIN_DATE|ANTHROPIC"   # las 5 presentes
   ```
2. `railway up --service politicape-web --detach` desde la raíz del repo (sube el directorio de trabajo: por eso el `git status` limpio).
3. Espera SUCCESS (3–6 min):
   ```bash
   railway deployment list --service politicape-web | head -3     # la primera fila debe pasar a SUCCESS
   ```
   **No** des por bueno el deploy porque `/health` responda: responde el contenedor viejo hasta el cambio.
4. Verifica en producción (`P=https://politicape-web-production.up.railway.app`):
   ```bash
   TOK=$(curl -s -X POST $P/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@politica.pe","password":"password123"}' | python -c "import sys,json;print(json.load(sys.stdin)['token'])")
   curl -s -H "Authorization: Bearer $TOK" $P/api/v1/electoral/config | python -c "import sys,json;print(json.load(sys.stdin)['own_candidate'])"   # Rafael López Aliaga
   curl -s -H "Authorization: Bearer $TOK" "$P/api/v1/territory/opportunity" | python -c "import sys,json;print(json.load(sys.stdin)['districts'][0]['name'])"   # San Juan de Lurigancho
   ```
5. Espera 10 min (ciclo de alertas) y comprueba `$P/api/v1/alerts?status=open` ≥ 1. Si producción crea una alerta
   duplicada de la local (misma figura, mismo día): es el mismo `dedup_key`, la base la rechaza; no habrá duplicado.
6. Abre `$P` en Chrome, login, Panel: las 5 filas con datos. Captura `docs/plan-demo-panel/capturas/prod-1366.png`.

## C. La mañana de la demo (Walter, 30 min antes)

- [ ] Repetir **P-06 pasos 1–5** contra producción (cambia `B` por `$P/api/v1`) o contra local si se presenta local.
- [ ] `curl $P/health` → healthy. Abrir el Panel en producción **y** en local en dos pestañas: si una falla, la otra es el respaldo.
- [ ] Leer `referencia/guion-demo.md` una vez con el Panel delante y actualizar los números en voz alta (el promedio de encuestas y el top de oportunidad cambian).
- [ ] Modo claro para proyectar (más legible en proyector); tener el oscuro listo si preguntan.
- [ ] Cerrar DevTools. Zoom del navegador 100 %. Sidebar abierto.

## D. Preguntas que harán y respuestas honestas (ver también el guion)

| Pregunta | Respuesta |
|---|---|
| ¿De dónde salen los datos? | 12 medios peruanos scrapeados cada 2 h, 14 encuestas municipales publicadas, padrón Reniec 2026 por distrito. Cada noticia del Panel tiene su enlace. |
| ¿Quién clasifica? | Claude (Anthropic). Cada nota: tema municipal, distrito, postura hacia cada candidato, si es ataque. Coste real: ~0,30 USD/día. |
| ¿Y redes sociales? | Listo en código; falta activar las claves de X y YouTube (de pago). Hoy el Panel es 100 % prensa y lo dice explícitamente. |
| ¿Por qué todo sale negativo para RLA? | Porque esta semana la cobertura es sobre los pedidos de exclusión ante el JEE. El sistema no maquilla: detecta, alerta y propone respuesta. Eso es lo que compran. |
| ¿Qué pasa el 4 de octubre? | Carga de resultados ONPE por distrito y comparación con el mapa de oportunidad (pantalla Territorio → Resultados, ya construida). |
| ¿Puede ser para otro candidato? | Sí: es una variable (`OWN_CANDIDATE`) y un seed; 1 minuto. |
