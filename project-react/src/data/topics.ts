// Taxonomia de temas municipales. Debe coincidir con TOPICS en
// project-scrapping/app/services/classifier.py

export const TOPIC_LABELS: Record<string, string> = {
  inseguridad: 'Inseguridad ciudadana',
  extorsion: 'Extorsión',
  transporte: 'Transporte y tránsito',
  limpieza_residuos: 'Basura y limpieza',
  obras_infraestructura: 'Obras e infraestructura',
  corrupcion: 'Corrupción y fiscalización',
  legalidad_candidatura: 'Legalidad de candidaturas',
  comercio_informal: 'Comercio informal',
  espacios_publicos_ambiente: 'Espacios públicos y ambiente',
  servicios_basicos: 'Agua, desagüe y servicios',
  gestion_municipal: 'Gestión municipal',
  economia_empleo: 'Economía y empleo',
  vivienda_urbanismo: 'Vivienda y urbanismo',
  campana_electoral: 'Campaña y encuestas',
  gobierno_nacional: 'Gobierno central',
  otro: 'Otro',
};

export const TOPIC_ORDER = Object.keys(TOPIC_LABELS);

export function topicLabel(topic: string | null | undefined): string {
  if (!topic) return 'Sin tema';
  return TOPIC_LABELS[topic] || topic;
}
