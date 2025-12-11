import { useState, useEffect, useCallback } from 'react';
import { 
  DemographicFilters, 
  DemographicData, 
  DemographicSegmentationData, 
  DemographicInsightsData,
  RegionData,
  RegionComparisonData,
  DemographicScenario
} from '../types/demographics';

// Mock Peru GeoJSON (simplified for this example)
const mockGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { UBIGEO: '150000', NOMBRE: 'Lima' },
      geometry: { type: 'Polygon', coordinates: [[[-77.2, -11.8], [-76.8, -11.8], [-76.8, -12.2], [-77.2, -12.2], [-77.2, -11.8]]] }
    },
    {
      type: 'Feature',
      properties: { UBIGEO: '040000', NOMBRE: 'Arequipa' },
      geometry: { type: 'Polygon', coordinates: [[[-72.5, -15.8], [-72.1, -15.8], [-72.1, -16.2], [-72.5, -16.2], [-72.5, -15.8]]] }
    },
    {
      type: 'Feature',
      properties: { UBIGEO: '080000', NOMBRE: 'Cusco' },
      geometry: { type: 'Polygon', coordinates: [[[-72.2, -13.2], [-71.8, -13.2], [-71.8, -13.6], [-72.2, -13.6], [-72.2, -13.2]]] }
    },
    {
      type: 'Feature',
      properties: { UBIGEO: '130000', NOMBRE: 'La Libertad' },
      geometry: { type: 'Polygon', coordinates: [[[-79.2, -7.8], [-78.8, -7.8], [-78.8, -8.2], [-79.2, -8.2], [-79.2, -7.8]]] }
    },
    {
      type: 'Feature',
      properties: { UBIGEO: '200000', NOMBRE: 'Piura' },
      geometry: { type: 'Polygon', coordinates: [[[-81.2, -4.8], [-80.8, -4.8], [-80.8, -5.2], [-81.2, -5.2], [-81.2, -4.8]]] }
    },
    {
      type: 'Feature',
      properties: { UBIGEO: '210000', NOMBRE: 'Puno' },
      geometry: { type: 'Polygon', coordinates: [[[-70.2, -15.2], [-69.8, -15.2], [-69.8, -15.6], [-70.2, -15.6], [-70.2, -15.2]]] }
    },
    {
      type: 'Feature',
      properties: { UBIGEO: '110000', NOMBRE: 'Ica' },
      geometry: { type: 'Polygon', coordinates: [[[-76.2, -13.8], [-75.8, -13.8], [-75.8, -14.2], [-76.2, -14.2], [-76.2, -13.8]]] }
    }
  ]
};

// Generate mock demographic data based on real Peru statistics
const generateMockDemographicData = (filters: DemographicFilters): DemographicData => {
  // Base data for Peru
  const baseData = {
    totalPopulation: 32625948, // Peru's population
    regionName: filters.region === 'all' ? 'Perú' : getRegionName(filters.region),
    averageAge: 31,
    genderRatio: 0.98, // Males per female
    predominantNSE: 'C',
    urbanPercentage: 78.3,
    higherEducationPercentage: 22.5,
    electoralParticipation: 82.1,
  };

  // Adjust data based on selected region
  let adjustedData = { ...baseData };
  
  if (filters.region === '150000') { // Lima
    adjustedData = {
      ...baseData,
      totalPopulation: 10628470,
      averageAge: 33,
      predominantNSE: 'C',
      urbanPercentage: 98.2,
      higherEducationPercentage: 32.8,
      electoralParticipation: 84.5,
    };
  } else if (filters.region === '040000') { // Arequipa
    adjustedData = {
      ...baseData,
      totalPopulation: 1382730,
      averageAge: 32,
      predominantNSE: 'B',
      urbanPercentage: 90.3,
      higherEducationPercentage: 28.5,
      electoralParticipation: 86.2,
    };
  } else if (filters.region === '080000') { // Cusco
    adjustedData = {
      ...baseData,
      totalPopulation: 1357075,
      averageAge: 29,
      predominantNSE: 'D',
      urbanPercentage: 55.7,
      higherEducationPercentage: 18.3,
      electoralParticipation: 80.4,
    };
  }

  // Generate population by age data
  const populationByAge = [
    { ageGroup: '0-9', male: adjustedData.totalPopulation * 0.09, female: adjustedData.totalPopulation * 0.087, malePolitical: 0, femalePolitical: 0 },
    { ageGroup: '10-17', male: adjustedData.totalPopulation * 0.08, female: adjustedData.totalPopulation * 0.078, malePolitical: 0, femalePolitical: 0 },
    { ageGroup: '18-25', male: adjustedData.totalPopulation * 0.075, female: adjustedData.totalPopulation * 0.074, malePolitical: adjustedData.totalPopulation * 0.03, femalePolitical: adjustedData.totalPopulation * 0.028 },
    { ageGroup: '26-35', male: adjustedData.totalPopulation * 0.085, female: adjustedData.totalPopulation * 0.084, malePolitical: adjustedData.totalPopulation * 0.042, femalePolitical: adjustedData.totalPopulation * 0.038 },
    { ageGroup: '36-50', male: adjustedData.totalPopulation * 0.095, female: adjustedData.totalPopulation * 0.096, malePolitical: adjustedData.totalPopulation * 0.055, femalePolitical: adjustedData.totalPopulation * 0.048 },
    { ageGroup: '51-65', male: adjustedData.totalPopulation * 0.065, female: adjustedData.totalPopulation * 0.068, malePolitical: adjustedData.totalPopulation * 0.04, femalePolitical: adjustedData.totalPopulation * 0.035 },
    { ageGroup: '65+', male: adjustedData.totalPopulation * 0.045, female: adjustedData.totalPopulation * 0.048, malePolitical: adjustedData.totalPopulation * 0.025, femalePolitical: adjustedData.totalPopulation * 0.02 },
  ];

  // Generate regions data
  const regions: RegionData[] = [
    {
      id: '150000',
      name: 'Lima',
      population: 10628470,
      populationDensity: 3480.2,
      averageAge: 33,
      genderRatio: 0.96,
      predominantNSE: 'C',
      urbanPercentage: 98.2,
      higherEducationPercentage: 32.8,
      politicalSentiment: 0.15,
      politicalEngagement: 8.9,
      electoralParticipation: 84.5,
      nseIndex: 68,
      educationIndex: 72,
    },
    {
      id: '040000',
      name: 'Arequipa',
      population: 1382730,
      populationDensity: 21.8,
      averageAge: 32,
      genderRatio: 0.97,
      predominantNSE: 'B',
      urbanPercentage: 90.3,
      higherEducationPercentage: 28.5,
      politicalSentiment: 0.28,
      politicalEngagement: 7.2,
      electoralParticipation: 86.2,
      nseIndex: 72,
      educationIndex: 68,
    },
    {
      id: '080000',
      name: 'Cusco',
      population: 1357075,
      populationDensity: 18.9,
      averageAge: 29,
      genderRatio: 0.99,
      predominantNSE: 'D',
      urbanPercentage: 55.7,
      higherEducationPercentage: 18.3,
      politicalSentiment: 0.34,
      politicalEngagement: 6.8,
      electoralParticipation: 80.4,
      nseIndex: 45,
      educationIndex: 52,
    },
    {
      id: '130000',
      name: 'La Libertad',
      population: 1905301,
      populationDensity: 72.9,
      averageAge: 30,
      genderRatio: 0.98,
      predominantNSE: 'C',
      urbanPercentage: 78.2,
      higherEducationPercentage: 22.1,
      politicalSentiment: -0.12,
      politicalEngagement: 6.1,
      electoralParticipation: 79.8,
      nseIndex: 58,
      educationIndex: 60,
    },
    {
      id: '200000',
      name: 'Piura',
      population: 2047954,
      populationDensity: 51.7,
      averageAge: 28,
      genderRatio: 1.01,
      predominantNSE: 'D',
      urbanPercentage: 77.5,
      higherEducationPercentage: 19.8,
      politicalSentiment: 0.08,
      politicalEngagement: 5.9,
      electoralParticipation: 78.2,
      nseIndex: 48,
      educationIndex: 55,
    },
    {
      id: '210000',
      name: 'Puno',
      population: 1237997,
      populationDensity: 17.6,
      averageAge: 27,
      genderRatio: 0.97,
      predominantNSE: 'E',
      urbanPercentage: 50.3,
      higherEducationPercentage: 16.5,
      politicalSentiment: -0.05,
      politicalEngagement: 5.2,
      electoralParticipation: 82.7,
      nseIndex: 38,
      educationIndex: 48,
    },
    {
      id: '110000',
      name: 'Ica',
      population: 850765,
      populationDensity: 39.8,
      averageAge: 31,
      genderRatio: 0.98,
      predominantNSE: 'C',
      urbanPercentage: 89.3,
      higherEducationPercentage: 24.2,
      politicalSentiment: 0.22,
      politicalEngagement: 6.5,
      electoralParticipation: 81.5,
      nseIndex: 62,
      educationIndex: 64,
    },
  ];

  // Generate timeline data
  const timelineData = [];
  const currentYear = new Date().getFullYear();
  const yearsBack = filters.timeRange === '1y' ? 1 : 
                    filters.timeRange === '3y' ? 3 : 
                    filters.timeRange === '5y' ? 5 : 10;
  
  for (let i = yearsBack; i >= 0; i--) {
    const year = (currentYear - i).toString();
    timelineData.push({
      year,
      urbanPercentage: adjustedData.urbanPercentage - (i * 0.8),
      participation: adjustedData.electoralParticipation - (i * 0.3),
      engagement: (filters.region === '150000' ? 8.9 : 7.2) - (i * 0.2),
      sentiment: (filters.region === '150000' ? 0.15 : 0.28) - (i * 0.03),
    });
  }

  // Generate trends data
  const trends = {
    urbanizationChange: 4.8,
    agingRate: 1.2,
    educationChange: 5.5,
    sentimentChange: 0.18,
    engagementChange: 1.2,
    participationChange: -0.8,
    analysis: 'Los datos muestran una clara correlación entre el aumento de la urbanización y el incremento en el engagement político. Las regiones con mayor crecimiento educativo también presentan mejoras en el sentiment político, sugiriendo que la educación es un factor clave en la percepción política.',
  };

  return {
    ...adjustedData,
    populationByAge,
    regions,
    geoJson: mockGeoJson,
    timelineData,
    trends,
  };
};

// Generate mock segmentation data
const generateMockSegmentationData = (filters: DemographicFilters): DemographicSegmentationData => {
  const totalPopulation = filters.region === 'all' ? 32625948 : 
                          filters.region === '150000' ? 10628470 : 
                          filters.region === '040000' ? 1382730 : 1357075;
  
  const segments = [
    {
      id: '1',
      name: 'Jóvenes Urbanos (18-25, NSE B-C)',
      population: Math.round(totalPopulation * 0.12),
      averageAge: 22,
      urbanPercentage: 95.8,
      educationIndex: 68,
      nseIndex: 72,
      sentiment: 0.22,
      engagement: 9.1,
      participation: 76.5,
      influence: 65,
      characteristics: ['18-25 años', 'NSE B-C', 'Urbano', 'Educación superior'],
      keyTopics: ['Empleo', 'Educación', 'Tecnología', 'Medio ambiente'],
      preferredChannels: ['Instagram', 'TikTok', 'YouTube', 'Streaming'],
      strategicRecommendation: 'Enfoque en propuestas de primer empleo, educación digital y sostenibilidad. Comunicación visual, dinámica y auténtica a través de plataformas digitales con influencers jóvenes como embajadores.',
    },
    {
      id: '2',
      name: 'Clase Media Consolidada (36-50, NSE B)',
      population: Math.round(totalPopulation * 0.18),
      averageAge: 43,
      urbanPercentage: 92.3,
      educationIndex: 75,
      nseIndex: 78,
      sentiment: 0.08,
      engagement: 7.2,
      participation: 85.4,
      influence: 82,
      characteristics: ['36-50 años', 'NSE B', 'Urbano', 'Educación superior/posgrado'],
      keyTopics: ['Economía', 'Seguridad', 'Salud', 'Educación'],
      preferredChannels: ['Facebook', 'LinkedIn', 'Prensa digital', 'Radio'],
      strategicRecommendation: 'Comunicación enfocada en propuestas económicas concretas, seguridad ciudadana y mejora de servicios públicos. Mensajes racionales con datos verificables y testimonios de expertos.',
    },
    {
      id: '3',
      name: 'Adultos Mayores (50+, NSE C-D)',
      population: Math.round(totalPopulation * 0.15),
      averageAge: 62,
      urbanPercentage: 75.2,
      educationIndex: 45,
      nseIndex: 52,
      sentiment: 0.15,
      engagement: 6.5,
      participation: 88.2,
      influence: 70,
      characteristics: ['50+ años', 'NSE C-D', 'Urbano/Rural', 'Educación básica/media'],
      keyTopics: ['Pensiones', 'Salud', 'Seguridad', 'Familia'],
      preferredChannels: ['Televisión', 'Radio', 'Prensa escrita', 'Reuniones comunitarias'],
      strategicRecommendation: 'Enfoque en propuestas de protección social, sistema de pensiones y acceso a salud. Comunicación clara, directa y respetuosa a través de medios tradicionales y contacto directo.',
    },
    {
      id: '4',
      name: 'Sectores Populares Urbanos (26-50, NSE D)',
      population: Math.round(totalPopulation * 0.22),
      averageAge: 38,
      urbanPercentage: 88.5,
      educationIndex: 42,
      nseIndex: 38,
      sentiment: -0.08,
      engagement: 5.9,
      participation: 79.8,
      influence: 58,
      characteristics: ['26-50 años', 'NSE D', 'Urbano periférico', 'Educación básica/técnica'],
      keyTopics: ['Empleo', 'Transporte', 'Servicios básicos', 'Costo de vida'],
      preferredChannels: ['Facebook', 'WhatsApp', 'Radio local', 'Activaciones'],
      strategicRecommendation: 'Comunicación centrada en soluciones prácticas para problemas cotidianos: empleo, transporte, acceso a servicios. Mensajes directos con propuestas concretas y testimonios de pares.',
    },
    {
      id: '5',
      name: 'Población Rural (26-65, NSE D-E)',
      population: Math.round(totalPopulation * 0.14),
      averageAge: 45,
      urbanPercentage: 0,
      educationIndex: 32,
      nseIndex: 28,
      sentiment: 0.05,
      engagement: 4.8,
      participation: 76.2,
      influence: 45,
      characteristics: ['26-65 años', 'NSE D-E', 'Rural', 'Educación básica'],
      keyTopics: ['Agricultura', 'Agua', 'Caminos', 'Precios agrícolas'],
      preferredChannels: ['Radio comunitaria', 'Reuniones locales', 'Altoparlantes', 'Ferias'],
      strategicRecommendation: 'Enfoque en desarrollo rural, apoyo al agro, infraestructura básica y conectividad. Comunicación simple, en lenguas originarias cuando sea necesario, y con fuerte presencia territorial.',
    },
    {
      id: '6',
      name: 'Profesionales Jóvenes (26-35, NSE A-B)',
      population: Math.round(totalPopulation * 0.08),
      averageAge: 30,
      urbanPercentage: 98.7,
      educationIndex: 88,
      nseIndex: 85,
      sentiment: 0.18,
      engagement: 8.2,
      participation: 82.5,
      influence: 75,
      characteristics: ['26-35 años', 'NSE A-B', 'Urbano', 'Educación superior/posgrado'],
      keyTopics: ['Innovación', 'Emprendimiento', 'Política internacional', 'Medio ambiente'],
      preferredChannels: ['LinkedIn', 'Twitter', 'Podcasts', 'Eventos profesionales'],
      strategicRecommendation: 'Comunicación sofisticada enfocada en desarrollo económico, innovación y posicionamiento internacional. Mensajes basados en datos, con referentes internacionales y propuestas de vanguardia.',
    },
  ];

  const regions = [
    { id: '150000', name: 'Lima' },
    { id: '040000', name: 'Arequipa' },
    { id: '080000', name: 'Cusco' },
    { id: '130000', name: 'La Libertad' },
    { id: '200000', name: 'Piura' },
    { id: '210000', name: 'Puno' },
    { id: '110000', name: 'Ica' },
  ];

  return {
    totalPopulation,
    segments,
    regions,
  };
};

// Generate mock insights data
const generateMockInsightsData = (filters: DemographicFilters): DemographicInsightsData => {
  const insights = [
    {
      id: '1',
      title: 'Crecimiento del segmento joven urbano en Lima Norte',
      description: 'El segmento de jóvenes urbanos (18-25) en distritos de Lima Norte muestra un crecimiento del 8.5% en los últimos 3 años, con un incremento significativo en nivel educativo superior (+12.3%) y engagement político (+3.2 puntos).',
      type: 'opportunity',
      priority: 'high',
      region: 'Lima',
      segment: 'Jóvenes Urbanos (18-25)',
      tags: ['crecimiento', 'educación', 'engagement', 'Lima Norte'],
      updatedAt: '2024-12-01',
      isSpotlight: true,
      growthPotential: 15.8,
      riskFactors: ['Alta volatilidad en preferencias', 'Sensibilidad a crisis económicas'],
      recommendation: 'Desarrollar campaña digital enfocada en empleo juvenil y educación superior con micro-targeting en distritos de Lima Norte, utilizando testimonios de jóvenes locales e influencers con alta credibilidad en el segmento.',
      actionItems: ['Campaña TikTok/Instagram', 'Micro-influencers locales', 'Propuestas de primer empleo', 'Eventos universitarios'],
    },
    {
      id: '2',
      title: 'Envejecimiento acelerado en Arequipa urbana',
      description: 'La población de Arequipa urbana muestra un envejecimiento acelerado con incremento de 2.8 años en la edad promedio durante el último quinquenio, superando la media nacional. Este segmento presenta alta participación electoral (88.2%) y sentiment positivo (0.22).',
      type: 'trend',
      priority: 'medium',
      region: 'Arequipa',
      segment: 'Adultos Mayores (50+)',
      tags: ['envejecimiento', 'participación', 'sentiment positivo'],
      updatedAt: '2024-11-28',
    },
    {
      id: '3',
      title: 'Brecha digital en zonas rurales de Cusco',
      description: 'Persiste una significativa brecha digital en zonas rurales de Cusco, con solo 38.5% de conectividad, limitando el alcance de campañas digitales. Este segmento muestra baja exposición a mensajes políticos digitales (-65% vs urbano) pero alta receptividad a comunicación territorial.',
      type: 'risk',
      priority: 'high',
      region: 'Cusco',
      segment: 'Población Rural (26-65)',
      tags: ['brecha digital', 'rural', 'comunicación territorial'],
      updatedAt: '2024-11-25',
    },
    {
      id: '4',
      title: 'Emergencia de clase media en Piura',
      description: 'Crecimiento sostenido de NSE C en Piura urbana (+8.2% en 5 años) con incremento paralelo en educación superior (+6.5%) y engagement político (+2.8 puntos), creando un nuevo segmento de votantes informados con demandas específicas.',
      type: 'opportunity',
      priority: 'medium',
      region: 'Piura',
      segment: 'Clase Media Emergente (26-50, NSE C)',
      tags: ['clase media', 'educación', 'engagement'],
      updatedAt: '2024-11-22',
    },
    {
      id: '5',
      title: 'Deterioro de sentiment en La Libertad',
      description: 'Caída significativa del sentiment político en La Libertad (-0.28 puntos en 12 meses), especialmente en segmentos urbanos de NSE C-D, correlacionado con percepción de inseguridad ciudadana y desempleo creciente.',
      type: 'risk',
      priority: 'high',
      region: 'La Libertad',
      segment: 'Sectores Populares Urbanos (26-50, NSE D)',
      tags: ['sentiment negativo', 'inseguridad', 'desempleo'],
      updatedAt: '2024-11-20',
    },
    {
      id: '6',
      title: 'Incremento de participación femenina en Ica',
      description: 'Aumento sostenido de participación política femenina en Ica (+7.2% en engagement, +4.5% en liderazgos locales) con mayor presencia en segmentos jóvenes y profesionales, creando oportunidad para mensajes de equidad y liderazgo.',
      type: 'opportunity',
      priority: 'medium',
      region: 'Ica',
      segment: 'Mujeres Profesionales (26-50)',
      tags: ['participación femenina', 'liderazgo', 'equidad'],
      updatedAt: '2024-11-18',
    },
    {
      id: '7',
      title: 'Migración interna hacia Lima Metropolitana',
      description: 'Flujo migratorio sostenido desde regiones del sur hacia Lima Metropolitana, con predominio de jóvenes (18-30 años) de NSE C-D en busca de oportunidades educativas y laborales, modificando la composición demográfica de distritos periféricos.',
      type: 'trend',
      priority: 'medium',
      region: 'Lima',
      segment: 'Migrantes Internos (18-30, NSE C-D)',
      tags: ['migración', 'jóvenes', 'oportunidades'],
      updatedAt: '2024-11-15',
    },
    {
      id: '8',
      title: 'Desconexión política en jóvenes rurales',
      description: 'Preocupante desconexión política en jóvenes rurales de Puno, con engagement 45% menor que sus pares urbanos y sentiment negativo (-0.18), asociado a percepción de abandono estatal y falta de oportunidades locales.',
      type: 'risk',
      priority: 'high',
      region: 'Puno',
      segment: 'Jóvenes Rurales (18-25)',
      tags: ['desconexión', 'rural', 'sentiment negativo'],
      updatedAt: '2024-11-12',
    },
  ];

  const regions = [
    { id: '150000', name: 'Lima' },
    { id: '040000', name: 'Arequipa' },
    { id: '080000', name: 'Cusco' },
    { id: '130000', name: 'La Libertad' },
    { id: '200000', name: 'Piura' },
    { id: '210000', name: 'Puno' },
    { id: '110000', name: 'Ica' },
  ];

  return {
    insights,
    regions,
  };
};

// Helper function to get region name
const getRegionName = (regionId: string): string => {
  const regions: Record<string, string> = {
    '150000': 'Lima',
    '040000': 'Arequipa',
    '080000': 'Cusco',
    '130000': 'La Libertad',
    '200000': 'Piura',
    '210000': 'Puno',
    '110000': 'Ica',
  };
  
  return regions[regionId] || 'Región desconocida';
};

export const useDemographics = (filters: DemographicFilters) => {
  const [demographicData, setDemographicData] = useState<DemographicData>(generateMockDemographicData(filters));
  const [segmentationData, setSegmentationData] = useState<DemographicSegmentationData>(generateMockSegmentationData(filters));
  const [insightsData, setInsightsData] = useState<DemographicInsightsData>(generateMockInsightsData(filters));

  // Update data when filters change
  useEffect(() => {
    setDemographicData(generateMockDemographicData(filters));
    setSegmentationData(generateMockSegmentationData(filters));
    setInsightsData(generateMockInsightsData(filters));
  }, [filters]);

  // Get data for a specific region
  const getRegionData = useCallback((regionId: string): RegionData => {
    const region = demographicData.regions.find(r => r.id === regionId);
    if (!region) {
      // Return default data if region not found
      return {
        id: regionId,
        name: getRegionName(regionId),
        population: 0,
        populationDensity: 0,
        averageAge: 0,
        genderRatio: 0,
        predominantNSE: '',
        urbanPercentage: 0,
        higherEducationPercentage: 0,
        politicalSentiment: 0,
        politicalEngagement: 0,
        electoralParticipation: 0,
        nseIndex: 0,
        educationIndex: 0,
      };
    }
    return region;
  }, [demographicData]);

  // Get comparison data for multiple regions
  const getComparisonData = useCallback((regionIds: string[]): RegionComparisonData => {
    const regions = regionIds.map(id => getRegionData(id));
    
    // Political metrics comparison
    const politicalMetrics = [
      {
        name: 'Sentiment',
        ...regions.reduce((acc, region) => ({ ...acc, [region.id]: region.politicalSentiment }), {}),
      },
      {
        name: 'Engagement',
        ...regions.reduce((acc, region) => ({ ...acc, [region.id]: region.politicalEngagement }), {}),
      },
      {
        name: 'Participación',
        ...regions.reduce((acc, region) => ({ ...acc, [region.id]: region.electoralParticipation }), {}),
      },
    ];
    
    // Demographic profile comparison
    const demographicProfile = [
      {
        attribute: 'Urbanización',
        ...regions.reduce((acc, region) => ({ ...acc, [region.id]: region.urbanPercentage }), {}),
      },
      {
        attribute: 'Educación',
        ...regions.reduce((acc, region) => ({ ...acc, [region.id]: region.higherEducationPercentage }), {}),
      },
      {
        attribute: 'NSE',
        ...regions.reduce((acc, region) => ({ ...acc, [region.id]: region.nseIndex }), {}),
      },
      {
        attribute: 'Juventud',
        ...regions.reduce((acc, region) => ({ ...acc, [region.id]: 100 - region.averageAge * 1.5 }), {}),
      },
    ];
    
    // Generate strategic insights based on comparison
    const strategicInsights = [
      {
        text: `${regions[0].name} muestra un sentiment político ${regions[0].politicalSentiment > regions[1].politicalSentiment ? 'superior' : 'inferior'} a ${regions[1].name}, correlacionado con su ${regions[0].higherEducationPercentage > regions[1].higherEducationPercentage ? 'mayor' : 'menor'} nivel educativo.`,
        type: regions[0].politicalSentiment > regions[1].politicalSentiment ? 'opportunity' : 'risk',
      },
      {
        text: `La diferencia de ${Math.abs(regions[0].urbanPercentage - regions[1].urbanPercentage).toFixed(1)}% en urbanización entre regiones sugiere estrategias de comunicación diferenciadas, con mayor énfasis digital en ${regions[0].urbanPercentage > regions[1].urbanPercentage ? regions[0].name : regions[1].name}.`,
        type: 'trend',
      },
      {
        text: `${regions[0].electoralParticipation > regions[1].electoralParticipation ? regions[0].name : regions[1].name} presenta mayor participación electoral, sugiriendo un electorado más movilizado y comprometido políticamente.`,
        type: 'opportunity',
      },
    ];
    
    return {
      politicalMetrics,
      demographicProfile,
      strategicInsights,
    };
  }, [getRegionData]);

  // Generate demographic scenario
  const generateScenario = useCallback(async (parameters: any): Promise<DemographicScenario> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scenarioId = Date.now().toString();
    const timeframe = parameters.timeframe;
    const currentYear = new Date().getFullYear();
    
    // Calculate projected population based on parameters
    const basePopulation = demographicData.totalPopulation;
    const growthRate = 1.1 + (parameters.migrationRate / 100);
    const projectedPopulation = Math.round(basePopulation * Math.pow(growthRate, timeframe));
    
    // Generate political projection data
    const politicalProjection = [];
    let currentSentiment = 0.18;
    let currentEngagement = 7.2;
    let currentParticipation = 82.1;
    
    // Education impact on sentiment and engagement
    const educationImpact = parameters.educationChange * 0.01;
    // Urbanization impact on engagement
    const urbanizationImpact = parameters.urbanizationChange * 0.02;
    
    for (let i = 0; i <= timeframe; i++) {
      const year = (currentYear + i).toString();
      
      // Progressive changes based on parameters
      currentSentiment += (educationImpact - (parameters.ageStructureChange * 0.005)) / timeframe;
      currentEngagement += (educationImpact + urbanizationImpact) / timeframe;
      currentParticipation += (parameters.ageStructureChange * 0.1) / timeframe;
      
      politicalProjection.push({
        year,
        sentiment: Math.max(-1, Math.min(1, currentSentiment)),
        engagement: Math.max(0, Math.min(15, currentEngagement)),
        participation: Math.max(50, Math.min(95, currentParticipation)),
      });
    }
    
    // Generate segment impact data
    const segmentImpact = [
      {
        segment: 'Jóvenes Urbanos (18-25)',
        currentEngagement: 9.1,
        projectedEngagement: 9.1 + (parameters.urbanizationChange * 0.1) + (parameters.educationChange * 0.15),
      },
      {
        segment: 'Clase Media (26-50)',
        currentEngagement: 7.2,
        projectedEngagement: 7.2 + (parameters.educationChange * 0.12) + (parameters.migrationRate * 0.05),
      },
      {
        segment: 'Adultos Mayores (50+)',
        currentEngagement: 6.5,
        projectedEngagement: 6.5 + (parameters.ageStructureChange * 0.2),
      },
      {
        segment: 'Población Rural',
        currentEngagement: 4.8,
        projectedEngagement: 4.8 - (parameters.urbanizationChange * 0.1) + (parameters.educationChange * 0.08),
      },
    ];
    
    return {
      id: scenarioId,
      name: `Escenario ${timeframe} años (${parameters.urbanizationChange > 0 ? '+' : ''}${parameters.urbanizationChange}% urb, ${parameters.educationChange > 0 ? '+' : ''}${parameters.educationChange}% edu)`,
      timeframe,
      modelConfidence: 85 - (timeframe * 2), // Confidence decreases with longer timeframes
      projectedPopulation,
      parameters: {
        urbanizationChange: parameters.urbanizationChange,
        educationChange: parameters.educationChange,
        ageStructureChange: parameters.ageStructureChange,
        migrationRate: parameters.migrationRate,
      },
      demographicChanges: [
        {
          description: `Incremento de ${parameters.urbanizationChange}% en población urbana, con mayor concentración en ciudades principales`,
          impact: parameters.urbanizationChange > 0 ? 'positive' : 'negative',
        },
        {
          description: `Aumento de ${parameters.educationChange}% en nivel educativo superior, especialmente en segmentos jóvenes`,
          impact: 'positive',
        },
        {
          description: `Envejecimiento promedio de la población en ${parameters.ageStructureChange} años`,
          impact: parameters.ageStructureChange > 3 ? 'negative' : 'neutral',
        },
        {
          description: `Tasa de migración ${parameters.migrationRate > 0 ? 'positiva' : 'negativa'} del ${Math.abs(parameters.migrationRate)}%, ${parameters.migrationRate > 0 ? 'aumentando' : 'reduciendo'} la población`,
          impact: parameters.migrationRate > 0 ? 'positive' : 'negative',
        },
      ],
      politicalProjection,
      electoralImpact: `Los cambios demográficos proyectados sugieren un ${politicalProjection[timeframe].sentiment > 0.2 ? 'incremento significativo' : politicalProjection[timeframe].sentiment > 0 ? 'ligero incremento' : 'deterioro'} en el sentiment político (${politicalProjection[timeframe].sentiment > 0 ? '+' : ''}${politicalProjection[timeframe].sentiment.toFixed(2)}), con ${politicalProjection[timeframe].engagement > 8 ? 'alto' : politicalProjection[timeframe].engagement > 6 ? 'moderado' : 'bajo'} engagement (${politicalProjection[timeframe].engagement.toFixed(1)}%) y ${politicalProjection[timeframe].participation > 85 ? 'alta' : politicalProjection[timeframe].participation > 75 ? 'moderada' : 'baja'} participación electoral (${politicalProjection[timeframe].participation.toFixed(1)}%).`,
      segmentImpact,
      strategicRecommendation: `Basado en las proyecciones demográficas, se recomienda priorizar estrategias dirigidas al segmento ${segmentImpact.sort((a, b) => b.projectedEngagement - a.projectedEngagement)[0].segment}, que muestra el mayor potencial de engagement (${segmentImpact.sort((a, b) => b.projectedEngagement - a.projectedEngagement)[0].projectedEngagement.toFixed(1)}%). Desarrollar mensajes enfocados en ${parameters.educationChange > 5 ? 'educación y desarrollo profesional' : parameters.urbanizationChange > 5 ? 'desarrollo urbano y servicios' : 'estabilidad económica y protección social'}, adaptados a las características demográficas proyectadas.`,
    };
  }, [demographicData]);

  return {
    demographicData,
    segmentationData,
    insightsData,
    getRegionData,
    getComparisonData,
    generateScenario,
  };
};