import { useState, useEffect, useCallback } from 'react';
import { 
  SocialPost, 
  Alert, 
  MentionData, 
  HashtagData, 
  NewsItem, 
  SentimentData, 
  InfluencerData, 
  DetectedEvent,
  MonitoringFilters 
} from '../types/monitoring';

interface RealtimeData {
  socialPosts: SocialPost[];
  alerts: Alert[];
  mentions: MentionData[];
  hashtags: HashtagData[];
  news: NewsItem[];
  sentiment: SentimentData;
  influencers: InfluencerData[];
  events: DetectedEvent[];
  isConnected: boolean;
  latency: number;
  lastUpdate: Date;
}

// Mock data generators
const generateSocialPost = (): SocialPost => {
  const platforms: ('twitter' | 'facebook' | 'instagram')[] = ['twitter', 'facebook', 'instagram'];
  const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
  const regions = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura'];
  const authors = ['@AnalisisPolitico', '@PeruNoticias', '@CiudadanoActivo', '@VozDelPueblo', '@DebatePublico'];
  const avatars = [
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
  ];

  const contents = [
    'Nueva propuesta de reforma tributaria genera intenso debate en el Congreso. ¿Qué opinan los ciudadanos?',
    'Ciudadanos de Arequipa se movilizan para expresar su posición sobre las nuevas medidas económicas.',
    'Jóvenes cusqueños organizan foro político para discutir el futuro de la región.',
    'Alcalde de Lima presenta plan de modernización del transporte público.',
    'Congresistas debaten sobre la nueva ley de educación superior.',
    'Manifestación pacífica en Plaza San Martín por mejores condiciones laborales.',
  ];

  const hashtags = ['ReformaTributaria', 'PolíticaPerú', 'CongresoPerú', 'EleccionesPeru2024', 'EducacionPublica'];
  const mentions = ['PedroCastillo', 'KeikoFujimori', 'RafaelLopez', 'CesarAcuña'];

  return {
    id: Date.now().toString() + Math.random(),
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    content: contents[Math.floor(Math.random() * contents.length)],
    author: authors[Math.floor(Math.random() * authors.length)],
    authorAvatar: avatars[Math.floor(Math.random() * avatars.length)],
    timestamp: new Date(),
    likes: Math.floor(Math.random() * 5000),
    comments: Math.floor(Math.random() * 1000),
    shares: Math.floor(Math.random() * 2000),
    engagement: Math.random() * 15,
    sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
    region: regions[Math.floor(Math.random() * regions.length)],
    hashtags: hashtags.slice(0, Math.floor(Math.random() * 3) + 1),
    mentions: mentions.slice(0, Math.floor(Math.random() * 2) + 1),
    reach: Math.floor(Math.random() * 100000),
    influence: Math.floor(Math.random() * 10) + 1,
    isViral: Math.random() > 0.8,
  };
};

const generateAlert = (): Alert => {
  const types: ('crisis' | 'trend' | 'mention' | 'sentiment')[] = ['crisis', 'trend', 'mention', 'sentiment'];
  const priorities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];
  const regions = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura'];
  
  const titles = [
    'Alerta de Crisis Política',
    'Tendencia Emergente Detectada',
    'Pico de Menciones Anómalo',
    'Cambio Significativo en Sentiment',
    'Evento Viral en Progreso',
  ];

  const messages = [
    'Incremento significativo en sentimiento negativo detectado en Lima Metropolitana',
    'Nuevo hashtag #ReformaEducativa está ganando tracción rápidamente',
    'Aumento del 150% en menciones sobre política económica en las últimas 2 horas',
    'Caída drástica en sentiment político en región sur del país',
    'Contenido viral relacionado con elecciones municipales',
  ];

  return {
    id: Date.now().toString() + Math.random(),
    type: types[Math.floor(Math.random() * types.length)],
    title: titles[Math.floor(Math.random() * titles.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    timestamp: new Date(),
    region: regions[Math.floor(Math.random() * regions.length)],
    metrics: {
      change: (Math.random() - 0.5) * 100,
      impact: Math.floor(Math.random() * 10) + 1,
    },
  };
};

const mockMentions: MentionData[] = [
  { id: '1', name: 'Pedro Castillo', party: 'Perú Libre', count: 2100, trend: -15, sentiment: -0.15 },
  { id: '2', name: 'Keiko Fujimori', party: 'Fuerza Popular', count: 1850, trend: -8, sentiment: -0.22 },
  { id: '3', name: 'Rafael López Aliaga', party: 'Renovación Popular', count: 1200, trend: 25, sentiment: 0.08 },
  { id: '4', name: 'César Acuña', party: 'APP', count: 890, trend: 12, sentiment: 0.12 },
  { id: '5', name: 'Yonhy Lescano', party: 'Acción Popular', count: 650, trend: 5, sentiment: 0.05 },
];

const mockHashtags: HashtagData[] = [
  { id: '1', tag: 'ReformaConstitucional', count: 1250, trend: 45, sentiment: 0.15, reach: 85000 },
  { id: '2', tag: 'EleccionesPeru2024', count: 980, trend: 22, sentiment: -0.08, reach: 65000 },
  { id: '3', tag: 'CrisisEconomica', count: 850, trend: -12, sentiment: -0.32, reach: 45000 },
  { id: '4', tag: 'EducacionPublica', count: 720, trend: 18, sentiment: 0.22, reach: 38000 },
  { id: '5', tag: 'SaludParaTodos', count: 650, trend: 8, sentiment: 0.18, reach: 32000 },
];

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Congreso aprueba nueva ley de transparencia política',
    summary: 'La medida busca fortalecer la fiscalización de campañas electorales y el financiamiento de partidos políticos.',
    source: 'El Comercio',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    engagement: 2450,
    sentiment: 0.25,
    impact: 8,
    isBreaking: true,
    tags: ['Congreso', 'Transparencia', 'Política'],
  },
  {
    id: '2',
    title: 'Alcaldes regionales se reúnen para discutir presupuesto 2025',
    summary: 'Representantes de 20 regiones analizan la distribución de recursos para proyectos de desarrollo.',
    source: 'La República',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    engagement: 1890,
    sentiment: 0.12,
    impact: 6,
    isBreaking: false,
    tags: ['Presupuesto', 'Regiones', 'Desarrollo'],
  },
];

const mockSentiment: SentimentData = {
  national: 0.18,
  trend: 0.08,
  regional: [
    { region: 'Lima', value: 0.15 },
    { region: 'Arequipa', value: 0.28 },
    { region: 'Cusco', value: 0.34 },
    { region: 'La Libertad', value: -0.12 },
    { region: 'Piura', value: 0.08 },
  ],
};

const mockInfluencers: InfluencerData[] = [
  {
    id: '1',
    name: 'María González',
    handle: '@mariagonzalez',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
    followers: 125000,
    posts: 45,
    mentions: 890,
    engagement: 12.5,
    influence: 9,
    trend: 15,
    recentActivity: 'Comentó sobre la nueva reforma educativa',
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    handle: '@carlosmendoza',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
    followers: 89000,
    posts: 32,
    mentions: 650,
    engagement: 9.8,
    influence: 7,
    trend: 8,
    recentActivity: 'Publicó análisis sobre elecciones municipales',
  },
];

const mockEvents: DetectedEvent[] = [
  {
    id: '1',
    type: 'crisis',
    title: 'Crisis de Confianza Política',
    description: 'Detectado incremento significativo en menciones negativas sobre instituciones políticas',
    confidence: 'high',
    impact: 8,
    velocity: 2.5,
    keywords: ['corrupción', 'desconfianza', 'instituciones'],
    region: 'Lima',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'Oportunidad de Engagement',
    description: 'Alto interés ciudadano en temas de educación presenta oportunidad para campañas',
    confidence: 'medium',
    impact: 6,
    velocity: 1.8,
    keywords: ['educación', 'juventud', 'futuro'],
    region: 'Cusco',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
  },
];

export const useRealtimeData = (filters: MonitoringFilters): RealtimeData => {
  const [data, setData] = useState<RealtimeData>({
    socialPosts: [],
    alerts: [],
    mentions: mockMentions,
    hashtags: mockHashtags,
    news: mockNews,
    sentiment: mockSentiment,
    influencers: mockInfluencers,
    events: mockEvents,
    isConnected: false,
    latency: 0,
    lastUpdate: new Date(),
  });

  const updateData = useCallback(() => {
    const startTime = Date.now();
    
    // Simulate WebSocket latency
    setTimeout(() => {
      const latency = Date.now() - startTime + Math.random() * 100;
      
      setData(prev => {
        const newPosts = [...prev.socialPosts];
        const newAlerts = [...prev.alerts];
        
        // Add new social post occasionally
        if (Math.random() > 0.7) {
          newPosts.unshift(generateSocialPost());
          if (newPosts.length > 20) {
            newPosts.pop();
          }
        }
        
        // Add new alert occasionally
        if (Math.random() > 0.9) {
          newAlerts.unshift(generateAlert());
          if (newAlerts.length > 10) {
            newAlerts.pop();
          }
        }
        
        // Update mentions with random fluctuations
        const updatedMentions = prev.mentions.map(mention => ({
          ...mention,
          count: Math.max(0, mention.count + Math.floor((Math.random() - 0.5) * 50)),
          trend: mention.trend + (Math.random() - 0.5) * 10,
        }));
        
        // Update hashtags
        const updatedHashtags = prev.hashtags.map(hashtag => ({
          ...hashtag,
          count: Math.max(0, hashtag.count + Math.floor((Math.random() - 0.5) * 20)),
          trend: hashtag.trend + (Math.random() - 0.5) * 5,
        }));
        
        // Update sentiment with small fluctuations
        const updatedSentiment = {
          ...prev.sentiment,
          national: Math.max(-1, Math.min(1, prev.sentiment.national + (Math.random() - 0.5) * 0.02)),
          regional: prev.sentiment.regional.map(region => ({
            ...region,
            value: Math.max(-1, Math.min(1, region.value + (Math.random() - 0.5) * 0.03)),
          })),
        };
        
        return {
          ...prev,
          socialPosts: newPosts,
          alerts: newAlerts,
          mentions: updatedMentions,
          hashtags: updatedHashtags,
          sentiment: updatedSentiment,
          latency,
          lastUpdate: new Date(),
        };
      });
    }, Math.random() * 200 + 50);
  }, []);

  useEffect(() => {
    // Simulate connection
    setData(prev => ({ ...prev, isConnected: true }));
    
    if (!filters.autoRefresh) return;
    
    const interval = setInterval(updateData, filters.refreshRate * 1000);
    
    return () => {
      clearInterval(interval);
      setData(prev => ({ ...prev, isConnected: false }));
    };
  }, [filters.autoRefresh, filters.refreshRate, updateData]);

  // Initial data load
  useEffect(() => {
    updateData();
  }, [updateData]);

  return data;
};