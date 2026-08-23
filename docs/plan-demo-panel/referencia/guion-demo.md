# Guion de la demo para Renovación Popular (8–10 minutos sobre el Panel)

Para Walter. Los números entre corchetes son los del 23-ago: **actualízalos la mañana de la demo** con el
Panel delante (P-06 en `99-CHECKLIST`). Una idea por fila; el Panel se recorre de arriba abajo, sin cambiar
de pantalla hasta el cierre.

## 0. Apertura (30 s)

"Esto no es una presentación: es la pantalla que su jefe de campaña abriría mañana a las 8. Todo lo que van a
ver sale de prensa peruana real, encuestas publicadas y el padrón de Reniec, procesado por inteligencia
artificial cada 15 minutos. Nada está inventado; cada noticia tiene su enlace."

## 1. Cabecera — el reloj (30 s)

"Faltan [42] días. La fase es pre-campaña. Y estos tres chips son los plazos que no se pueden fallar:
candidaturas definitivas el 5 de septiembre [en 13 días], veda de encuestas el 28, cierre de propaganda el 2 de
octubre. El sistema cambia de modo solo al cruzarlos: en veda, deja de mostrar encuestas al público."

## 2. KPIs — cuatro preguntas, cuatro números (1 min)

- "Intención de voto: [27,8 %], con un rango de [25,4 a 30,2], promedio ponderado de [3] encuestas recientes.
  Ventaja de [+10] puntos sobre [Bruce]."
- "Share of voice: [82 %] de lo que Lima leyó esta semana sobre la alcaldía fue sobre ustedes. [14] notas."
- **Pausa aquí.** "Presión mediática: [14 de 14] negativas. No lo escondemos. Esta semana la cobertura es
  sobre los pedidos de exclusión ante el JEE. Lo importante es lo que viene después: qué hizo el sistema con eso."
- "Tema dominante de Lima: [transporte, 22,6 %], luego [inseguridad]. Es la agenda real de la ciudad, no la del partido."

## 3. Encuestas — la carrera en el tiempo (1 min)

"[14] encuestas desde [febrero], cada candidato con su color, y la línea gris es el promedio ponderado: las
recientes pesan más. La línea roja vertical es la veda. Si mañana sale Ipsos, a las 2 horas está aquí."

## 4. Alertas — la crisis, detectada (1,5 min) ← el momento de la demo

"Esto apareció solo. [Pico negativo sobre López Aliaga: 6 menciones, 4 veces lo normal]. Severidad [crítica].
Abro la evidencia: [Infobae, La República, Exitosa], con enlace. Y abajo, la respuesta sugerida por la IA para
el equipo de comunicación." Léela en voz alta, 3 líneas. "Esto llega por Telegram al grupo de campaña en el
momento en que se dispara." (Si preguntan: Telegram está listo, falta el token del grupo de ellos.)

## 5. Dónde ganar — el mapa (1,5 min)

"43 distritos, padrón 2026. El color es la oportunidad para ustedes: electores, indecisos, fuerza propia vs.
rival y el tema que mueve cada zona. [San Juan de Lurigancho] primero: [823 mil] electores, [30 %] indecisos,
tema [inseguridad], rival [Bruce]. Luego [San Martín de Porres], [Comas]. Pasen el ratón: el sistema explica
el porqué de cada puntaje." Señala el `why` del tooltip.

## 6. Temas de la semana (30 s)

"De qué habla Lima, con cuánto creció cada tema y quién lo capitaliza. [Transporte +100 %]: el carril del
Corredor Azul y el paro desactivado. Hoy lo capitaliza [Keiko Fujimori], no un candidato municipal. Ahí hay
un espacio vacío."

## 7. Brief — lo que la IA escribió esta mañana (1 min)

"A las 7 de la mañana, sin que nadie lo pida: [titular]. Qué pasó ayer, tema del día, ataques, encuestas,
y qué hacer hoy. Dos páginas que el jefe de campaña lee en el taxi." Scroll de 5 segundos por el cuerpo.

## 8. Noticias — la materia prima (30 s)

"Para que no tengan que creerme: las últimas [8] notas de Lima, con el medio, la hora, el tema que detectó la
IA y el distrito. Clic y se abre la nota original." Abre una.

## 9. Qué hacer — recomendaciones (1 min)

"Y el cierre del ciclo. Tres acciones priorizadas para esta semana, con presupuesto, zona, cronograma y
confianza: [Blindaje legal ante la exclusión — crítica], [Operación SJL — crítica], [...]. Cada una tiene
pasos, KPIs y riesgos en la pantalla de Recomendaciones."

## 10. Cierre (30 s)

"Detectó la crisis, la explicó, dijo dónde ir y qué hacer. Todo con datos públicos, a [0,30 dólares] al día de
IA. Lo que falta para tener la foto completa son las redes sociales: está construido, se enciende con dos claves."

## Si algo falla en vivo

- Un widget en "No se pudo cargar": clic en "Reintentar". Si persiste, sigue con el siguiente; al final vuelve.
- Sin alertas abiertas ese día: "hoy no hay crisis, y eso también es información" → muestra el brief, que siempre existe.
- Producción caída: pestaña local ya abierta (`127.0.0.1:5000`).
- Te preguntan un número que no está en el Panel: la pantalla Carrera tiene la tabla completa de encuestas y Territorio el detalle por distrito.

## Frases que no hay que decir

- "Sentimiento" (di "presión mediática" o "cobertura negativa"). "Mock", "demo data", "ejemplo".
- "Tiempo real" para la prensa: es "cada 2 horas" (el scraping) y "cada 15 minutos" (la clasificación). Lo honesto vende más.
