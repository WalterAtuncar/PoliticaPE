# P-06 — Datos frescos para la demo (sin cambios de código)

## Objetivo

Que cada widget tenga el dato más reciente posible el día de la demo. Todo son comandos contra el
backend local y la base real. Se ejecuta al cerrar P-05 **y se repite la mañana de la demo**
(está en `99-CHECKLIST-DEMO`).

## Precondiciones

- P-01 y P-05 cerrados. Backend local arriba (el scheduler vive dentro: clasifica cada 15 min, scrapea
  cada 2 h, alertas cada 10 min, brief a las 07:00 Lima).

## Pasos

Obtén `TOK` como en `03-CONVENCIONES`. `B=http://127.0.0.1:8000/api/v1`.

### 1. Prensa y encuestas al día

```bash
curl -s -X POST -H "Authorization: Bearer $TOK" $B/scraping/trigger/news     | head -c 200; echo
curl -s -X POST -H "Authorization: Bearer $TOK" $B/scraping/trigger/surveys  | head -c 200; echo
```
Espera 2–3 min. Verifica que entraron noticias de Lima en la última hora:
```sql
SELECT count(*) FROM news_articles WHERE scope='lima_metropolitana' AND scraped_at > now() - interval '1 hour';
```
Si hay una encuesta nueva (Ipsos/Datum/CIT/IEP publican casi cada semana en agosto–septiembre),
`/race/polls` la incluirá y el promedio cambiará: **anótalo en el guion** (`referencia/guion-demo.md`) para
no decir un número viejo en voz alta.

### 2. Clasificación sin cola

```bash
cd project-scrapping && python scripts/classify_backlog.py --max 300
```
Salida esperada: `{'classified': N, 'batches': M, ...}` con N pequeño (el scheduler ya va al día) y luego:
```sql
SELECT count(*) FROM news_articles WHERE classified=false AND scope='lima_metropolitana'
  AND coalesce(published_at, scraped_at) >= '2026-07-01';   -- debe ser 0
```

### 3. Brief de hoy

```bash
curl -s -H "Authorization: Bearer $TOK" $B/race/brief/latest | python -c "import sys,json; b=json.load(sys.stdin)['brief']; print(b['brief_date'], '|', b['headline'])"
```
Si la fecha no es hoy (el scheduler lo genera a las 07:00; si el backend no estaba arriba a esa hora no existe):
```bash
curl -s -X POST -H "Authorization: Bearer $TOK" "$B/race/brief/generate?send=false&force=true"
```
Tarda ~30 s. Cuesta ~0,05 USD.

### 4. Alerta viva

```bash
curl -s -H "Authorization: Bearer $TOK" "$B/alerts?status=open" | python -c "import sys,json; a=json.load(sys.stdin)['alerts']; print(len(a)); [print(' ', x['severity'], x['kind'], x['title'], '| respuesta:', bool(x['suggested_response'])) for x in a[:5]]"
```
Si es 0: dispara `run_alert_cycle` como en P-01 paso 6. Las alertas con `status='open'` de días anteriores
siguen abiertas hasta que alguien las atiende; para la demo **deja abiertas solo las de las últimas 48 h**
(marca las viejas como `acknowledged` desde el propio panel con el botón ✓, no por SQL).

### 5. Recomendaciones actualizadas para RLA

Las 7 existentes son del 23-ago. Regenerar la víspera para que citen las noticias más recientes:
```bash
FID=0849e7c7-7850-4b8b-be5d-35e67ac57572
curl -s -X POST -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" -d "{\"figure_ids\":[\"$FID\"]}" $B/recommendations/generate | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('count'), [r['title'][:60] for r in d.get('recommendations',[])[:3]])"
```
Tarda 1–2 min. Cuesta ~0,10 USD. Verifica que la primera recomendación tenga `priority: critical`.
**Decisión**: si el endpoint crea 7 nuevas sin archivar las viejas, el Panel igual muestra solo las 3 de mayor
prioridad y confianza (P-02), así que no hace falta limpiar; pero si `/recommendations?figure_id=` supera 20 filas,
marca las antiguas `status='archived'` vía el endpoint `PUT /recommendations/{id}` (existe, lo usa `useAIRecommendations.ts:99`).

### 6. Oportunidad territorial

No requiere acción: `/territory/opportunity` se calcula al vuelo con 30 días de datos. Comprueba que SJL sigue primero
(cambia solo si otro distrito acumula muchas menciones).

## Criterios de aceptación

1. Cola de clasificación de Lima en 0.
2. Brief con `brief_date` = hoy.
3. `/alerts?status=open` → ≥ 1 alerta de RLA de las últimas 48 h con respuesta sugerida.
4. `/recommendations?figure_id=RLA` → ≥ 3, la primera `critical`.
5. Panel en `127.0.0.1:5000` sin ningún estado vacío salvo, como mucho, "Sin alertas" si realmente no hubo
   cobertura negativa en 24 h (en ese caso, dilo en la demo: "hoy no hay crisis; así se ve cuando hay", y
   muestra una atendida desde la pestaña de alertas si el hook lo permite).

## Reporte

Sin commit. Reporta los 5 números (noticias Lima 1 h, cola, fecha de brief, n.º de alertas, n.º de recomendaciones)
y cualquier encuesta nueva detectada.
