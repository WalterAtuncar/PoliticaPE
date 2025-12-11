import { useState, useEffect, useCallback } from 'react';
import { AIRecommendation, RecommendationsFilters, ROIMetrics } from '../types/recommendations';

// Mock data generator
const generateMockRecommendation = (category: string): AIRecommendation => {
  const regions = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Puno', 'Ica'];
  const demographics = ['18-25', '26-35', '36-50', '50+', 'NSE A', 'NSE B', 'NSE C', 'NSE D', 'NSE E'];
  const priorities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];
  const statuses: ('generated' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected')[] = 
    ['generated', 'under_review', 'approved', 'in_progress', 'completed', 'rejected'];

  const recommendations = {
    immediate_opportunities: {
      titles: [
        'Campaña Digital Viral en TikTok',
        'Activación de Influencers Locales',
        'Evento Comunitario de Alto Impacto',
        'Campaña de Micro-Targeting en Facebook',
        'Alianza Estratégica con Organizaciones Juveniles'
      ],
      descriptions: [
        'Aprovechar el alto engagement de jóvenes 18-25 en redes sociales para generar contenido viral sobre propuestas de empleo juvenil',
        'Activar red de influencers locales con alta credibilidad para amplificar mensajes clave en segmentos específicos',
        'Organizar evento comunitario enfocado en soluciones locales con participación ciudadana directa',
        'Implementar campaña de publicidad digital segmentada por intereses y comportamientos específicos',
        'Establecer alianzas con organizaciones juveniles para co-crear contenido auténtico y relevante'
      ],
      weaknesses: [
        'Baja penetración en segmento juvenil urbano de NSE C-D',
        'Falta de presencia en plataformas digitales emergentes',
        'Desconexión con líderes de opinión locales',
        'Mensajes genéricos sin personalización demográfica',
        'Ausencia de colaboración con organizaciones de base'
      ],
      actions: [
        'Crear contenido nativo para TikTok e Instagram con testimonios reales de jóvenes beneficiados por programas',
        'Identificar y contratar 15 micro-influencers locales con engagement rate >8% en target demográfico',
        'Organizar "Diálogo Ciudadano" en plaza principal con transmisión en vivo y participación interactiva',
        'Lanzar campaña de Facebook/Instagram Ads con 12 variaciones creativas segmentadas por edad y NSE',
        'Firmar convenios con 5 organizaciones juveniles para co-desarrollo de propuestas y contenido'
      ]
    },
    regional_strengthening: {
      titles: [
        'Consolidación de Liderazgo en Zona Norte',
        'Fortalecimiento de Red de Alcaldes Aliados',
        'Programa de Obras Visibles Acelerado',
        'Campaña de Testimonios Ciudadanos',
        'Expansión de Centros de Atención Ciudadana'
      ],
      descriptions: [
        'Fortalecer presencia en departamentos del norte donde ya existe sentiment positivo para maximizar ventaja competitiva',
        'Consolidar alianzas con alcaldes provinciales y distritales para crear red de apoyo territorial sólida',
        'Acelerar ejecución de obras de infraestructura menor con alta visibilidad para reforzar percepción de gestión',
        'Desarrollar campaña de testimonios reales de ciudadanos beneficiados por políticas implementadas',
        'Ampliar red de oficinas de atención ciudadana en distritos clave para mejorar accesibilidad'
      ],
      weaknesses: [
        'Ventaja competitiva no consolidada en regiones favorables',
        'Red de aliados políticos locales fragmentada',
        'Obras en progreso con baja visibilidad pública',
        'Falta de testimonios ciudadanos creíbles y documentados',
        'Limitada presencia física en territorios clave'
      ],
      actions: [
        'Implementar gira intensiva de 15 días por Piura, Tumbes y Lambayeque con eventos masivos',
        'Organizar cumbre de alcaldes aliados con firma de acuerdos de cooperación y agenda común',
        'Priorizar 20 obras menores de alto impacto visual para completar en 60 días con inauguraciones mediáticas',
        'Producir 25 videos testimoniales profesionales con ciudadanos reales en sus contextos cotidianos',
        'Abrir 8 nuevas oficinas de atención en capitales provinciales con personal capacitado y tecnología'
      ]
    },
    territorial_recovery: {
      titles: [
        'Plan de Recuperación para La Libertad',
        'Estrategia de Reconciliación en Zonas Críticas',
        'Campaña de Escucha Activa Ciudadana',
        'Programa de Reparación de Imagen',
        'Iniciativa de Diálogo Territorial'
      ],
      descriptions: [
        'Implementar estrategia integral para revertir sentiment negativo en La Libertad mediante acciones concretas y comunicación directa',
        'Desarrollar programa de reconciliación en zonas con alta conflictividad política mediante mediación y propuestas específicas',
        'Ejecutar campaña de escucha activa para entender preocupaciones ciudadanas y co-crear soluciones',
        'Lanzar programa de reparación de imagen basado en transparencia, rendición de cuentas y nuevos compromisos',
        'Establecer mesas de diálogo permanente con líderes locales, organizaciones y ciudadanía'
      ],
      weaknesses: [
        'Sentiment negativo consolidado por crisis de confianza',
        'Conflictos no resueltos con sectores organizados',
        'Percepción de desconexión con realidad local',
        'Imagen deteriorada por controversias pasadas',
        'Falta de canales de comunicación bidireccional'
      ],
      actions: [
        'Ejecutar plan de 90 días con visitas semanales, reuniones públicas y compromisos específicos medibles',
        'Implementar programa de mediación con facilitadores neutrales y agenda de soluciones concretas',
        'Realizar 50 reuniones de escucha en centros poblados con metodología participativa y registro público',
        'Lanzar campaña "Nuevos Compromisos" con metas específicas, plazos y mecanismos de seguimiento ciudadano',
        'Instalar 5 mesas de diálogo permanente con representantes de todos los sectores y agenda mensual'
      ]
    },
    demographic_expansion: {
      titles: [
        'Penetración en Segmento NSE A-B Urbano',
        'Captación de Voto Femenino Profesional',
        'Estrategia para Adultos Mayores Activos',
        'Programa de Atracción Juvenil Rural',
        'Campaña para Emprendedores Emergentes'
      ],
      descriptions: [
        'Desarrollar estrategia específica para captar segmento NSE A-B urbano mediante propuestas de innovación y desarrollo económico',
        'Implementar programa dirigido a mujeres profesionales con enfoque en equidad, oportunidades y liderazgo femenino',
        'Crear iniciativa para adultos mayores activos con propuestas de envejecimiento digno y participación social',
        'Desarrollar programa específico para jóvenes rurales con enfoque en oportunidades, tecnología y desarrollo territorial',
        'Lanzar campaña dirigida a emprendedores emergentes con propuestas de apoyo, financiamiento y formalización'
      ],
      weaknesses: [
        'Baja penetración en segmentos socioeconómicos altos',
        'Limitada conexión con agenda de género y empoderamiento femenino',
        'Propuestas genéricas para población adulta mayor',
        'Desconexión con juventud rural y sus necesidades específicas',
        'Ausencia de propuestas para sector emprendedor emergente'
      ],
      actions: [
        'Desarrollar agenda de innovación y competitividad con propuestas específicas para profesionales y empresarios',
        'Crear "Plan Mujer Líder" con 15 propuestas específicas y embajadoras en sectores clave',
        'Lanzar "Programa Adulto Mayor Activo" con beneficios, actividades y espacios de participación',
        'Implementar "Juventud Rural Conectada" con tecnología, capacitación y oportunidades de desarrollo',
        'Crear "Ecosistema Emprendedor" con incubadoras, financiamiento y red de mentores'
      ]
    }
  };

  const categoryData = recommendations[category as keyof typeof recommendations];
  const randomIndex = Math.floor(Math.random() * categoryData.titles.length);

  return {
    id: Date.now().toString() + Math.random(),
    title: categoryData.titles[randomIndex],
    description: categoryData.descriptions[randomIndex],
    category: category as any,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    targetRegion: regions[Math.floor(Math.random() * regions.length)],
    targetDemographic: demographics[Math.floor(Math.random() * demographics.length)],
    identifiedWeakness: categoryData.weaknesses[randomIndex],
    recommendedAction: categoryData.actions[randomIndex],
    estimatedBudget: {
      min: Math.floor(Math.random() * 50) + 10,
      max: Math.floor(Math.random() * 200) + 100,
    },
    expectedTimeline: ['2-4 semanas', '1-2 meses', '2-3 meses', '3-6 meses'][Math.floor(Math.random() * 4)],
    projectedROI: Math.floor(Math.random() * 300) + 150,
    aiConfidence: Math.floor(Math.random() * 40) + 60,
    resourcesNeeded: [
      'Equipo de marketing digital',
      'Presupuesto publicitario',
      'Coordinador territorial',
      'Diseñador gráfico',
      'Community manager',
      'Analista de datos'
    ].slice(0, Math.floor(Math.random() * 4) + 2),
    successKPIs: [
      'Incremento del 25% en sentiment positivo',
      'Aumento del 40% en engagement digital',
      'Mejora del 30% en intención de voto',
      'Reducción del 50% en sentiment negativo',
      'Incremento del 35% en reconocimiento'
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    riskFactors: [
      'Resistencia de grupos opositores',
      'Limitaciones presupuestarias',
      'Cambios en contexto político',
      'Competencia mediática',
      'Factores externos impredecibles'
    ].slice(0, Math.floor(Math.random() * 3) + 1),
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    userRating: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : undefined,
    implementationProgress: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : 0,
  };
};

export const useAIRecommendations = (filters: RecommendationsFilters) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    const mockRecommendations: AIRecommendation[] = [];
    
    // Generate recommendations for each category
    const categories = ['immediate_opportunities', 'regional_strengthening', 'territorial_recovery', 'demographic_expansion'];
    
    categories.forEach(category => {
      for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
        mockRecommendations.push(generateMockRecommendation(category));
      }
    });

    setRecommendations(mockRecommendations);
  }, []);

  const generateNewRecommendations = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newRecommendations: AIRecommendation[] = [];
    const categories = ['immediate_opportunities', 'regional_strengthening', 'territorial_recovery', 'demographic_expansion'];
    
    categories.forEach(category => {
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        newRecommendations.push(generateMockRecommendation(category));
      }
    });

    setRecommendations(prev => [...newRecommendations, ...prev]);
    setIsLoading(false);
  }, []);

  const updateRecommendationStatus = useCallback((id: string, status: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id 
          ? { ...rec, status: status as any, updatedAt: new Date() }
          : rec
      )
    );
  }, []);

  const rateRecommendation = useCallback((id: string, rating: number) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id 
          ? { ...rec, userRating: rating, updatedAt: new Date() }
          : rec
      )
    );
  }, []);

  const getROIMetrics = useCallback((): ROIMetrics => {
    const implemented = recommendations.filter(rec => 
      ['completed', 'in_progress'].includes(rec.status)
    );
    
    const completed = recommendations.filter(rec => rec.status === 'completed');
    
    return {
      totalRecommendations: recommendations.length,
      implementedRecommendations: implemented.length,
      averageROI: completed.length > 0 
        ? completed.reduce((sum, rec) => sum + rec.projectedROI, 0) / completed.length 
        : 0,
      successRate: completed.length > 0 
        ? (completed.filter(rec => rec.userRating && rec.userRating >= 4).length / completed.length) * 100 
        : 0,
      totalBudgetAllocated: implemented.reduce((sum, rec) => sum + rec.estimatedBudget.max, 0),
      totalBudgetSpent: completed.reduce((sum, rec) => sum + rec.estimatedBudget.min, 0),
      averageImplementationTime: 45, // Mock average days
    };
  }, [recommendations]);

  return {
    recommendations,
    isLoading,
    generateNewRecommendations,
    updateRecommendationStatus,
    rateRecommendation,
    getROIMetrics,
  };
};