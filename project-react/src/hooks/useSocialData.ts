import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';
import { 
  SocialPost, 
  SocialMetrics, 
  Influencer, 
  Hashtag, 
  ViralPost, 
  Competitor, 
  ContentEvent, 
  AudienceData, 
  CrisisAlert, 
  SocialListeningData,
  SocialFilters 
} from '../types/social';

// Helper function to generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random sentiment scores
const randomSentiment = () => {
  return Math.random() * 2 - 1; // Range from -1 to 1
};

// Generate mock social posts
const generateMockPosts = (count: number): SocialPost[] => {
  const platforms = ['twitter', 'facebook', 'instagram', 'tiktok', 'youtube'];
  const authors = [
    'Dina Boluarte', 'Keiko Fujimori', 'Pedro Castillo', 'Rafael López Aliaga', 
    'César Acuña', 'Verónika Mendoza', 'Hernando de Soto', 'George Forsyth'
  ];
  const avatars = [
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
  ];
  const regions = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Puno', 'Ica'];
  const contents = [
    'Hoy presentamos nuestro plan de gobierno con propuestas concretas para mejorar la economía peruana. #PerúAvanza',
    'Nuestro compromiso es con la educación de calidad para todos los peruanos. Invertiremos más en infraestructura educativa.',
    'La seguridad ciudadana es prioridad. Implementaremos un plan integral con participación de gobiernos locales y sociedad civil.',
    'El desarrollo económico debe llegar a todas las regiones. Descentralización efectiva ya! #DesarrolloRegional',
    'Reforma del sistema de salud para garantizar acceso universal y de calidad para todos los peruanos. #SaludParaTodos',
    'La lucha contra la corrupción será frontal e implacable. Tolerancia cero a funcionarios corruptos. #PerúSinCorrupción',
    'Nuestras propuestas para el agro peruano: tecnificación, acceso a créditos y mercados justos. #AgroPeruano',
    'La minería responsable es clave para el desarrollo del país. Promoveremos inversiones con respeto al medio ambiente y comunidades.',
  ];
  const hashtags = [
    'PerúAvanza', 'PerúDecide', 'EleccionesPeru2024', 'DesarrolloRegional', 'SaludParaTodos', 
    'EducaciónDeCalidad', 'SeguridadCiudadana', 'PerúSinCorrupción', 'AgroPeruano'
  ];
  const mentions = [
    'PresidenciaPeru', 'CongresoPerú', 'MEF_Peru', 'MINSA_Peru', 'MineduPeru', 
    'MininterPeru', 'CancilleriaPeru', 'PCM_Peru'
  ];
  
  const posts: SocialPost[] = [];
  
  for (let i = 0; i < count; i++) {
    const sentimentScore = randomSentiment();
    const sentiment = sentimentScore > 0.2 ? 'positive' : sentimentScore < -0.2 ? 'negative' : 'neutral';
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const likes = Math.floor(Math.random() * 10000);
    const comments = Math.floor(Math.random() * 2000);
    const shares = Math.floor(Math.random() * 5000);
    const total = likes + comments + shares;
    const reach = Math.floor(Math.random() * 100000) + 5000;
    
    const post: SocialPost = {
      id: `post-${i}`,
      platform,
      content: contents[Math.floor(Math.random() * contents.length)],
      author: authors[Math.floor(Math.random() * authors.length)],
      handle: `@${authors[Math.floor(Math.random() * authors.length)].toLowerCase().replace(' ', '')}`,
      authorAvatar: avatars[Math.floor(Math.random() * avatars.length)],
      timestamp: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      likes,
      comments,
      shares,
      engagementRate: parseFloat(((total / reach) * 100).toFixed(1)),
      sentiment,
      sentimentScore,
      region: regions[Math.floor(Math.random() * regions.length)],
      hashtags: Array.from({ length: Math.floor(Math.random() * 4) }, () => 
        hashtags[Math.floor(Math.random() * hashtags.length)]
      ),
      mentions: Array.from({ length: Math.floor(Math.random() * 3) }, () => 
        mentions[Math.floor(Math.random() * mentions.length)]
      ),
      reach,
      impressions: reach * (1 + Math.random()),
      isVerified: Math.random() > 0.7,
      isViral: Math.random() > 0.9,
      isFakeNews: Math.random() > 0.9,
      fakeNewsScore: Math.random() > 0.9 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3,
      emotions: ['interés', 'preocupación', 'esperanza', 'frustración'].slice(0, Math.floor(Math.random() * 3) + 1),
      userLiked: Math.random() > 0.7,
    };
    
    // Add fake news details for suspicious posts
    if (post.fakeNewsScore && post.fakeNewsScore > 0.5) {
      post.fakeNewsCategories = ['Información falsa', 'Información engañosa', 'Información manipulada'].slice(0, Math.floor(Math.random() * 2) + 1);
      post.fakeNewsElements = [
        'Datos estadísticos sin fuente verificable',
        'Citas atribuidas incorrectamente',
        'Imágenes manipuladas o fuera de contexto',
        'Información desactualizada presentada como actual'
      ].slice(0, Math.floor(Math.random() * 3) + 1);
      post.factChecking = [
        {
          claim: 'El gobierno ha reducido el presupuesto de educación en 30%',
          verification: 'Falso. El presupuesto de educación aumentó 12% según la Ley de Presupuesto 2024',
          source: 'Ministerio de Economía y Finanzas'
        },
        {
          claim: 'La inflación ha alcanzado niveles históricos del 15%',
          verification: 'Falso. La inflación actual es de 3.2% según el último reporte del INEI',
          source: 'Instituto Nacional de Estadística e Informática'
        }
      ].slice(0, Math.floor(Math.random() * 2) + 1);
    }
    
    // Add media for some posts
    if (Math.random() > 0.6) {
      post.media = [
        {
          type: Math.random() > 0.5 ? 'image' : 'video',
          url: `https://picsum.photos/seed/${i}/500/300`
        }
      ];
      
      // Add multiple media occasionally
      if (Math.random() > 0.8) {
        post.media.push({
          type: 'image',
          url: `https://picsum.photos/seed/${i + 100}/500/300`
        });
      }
    }
    
    posts.push(post);
  }
  
  return posts;
};

// Generate mock metrics
const generateMockMetrics = (): SocialMetrics => {
  return {
    overallEngagementRate: 7.8,
    engagementRateChange: 12.5,
    totalEngagements: 125000,
    engagementsChange: 15.2,
    totalReach: 1850000,
    reachChange: 8.7,
    totalPosts: 320,
    postsChange: 5.3,
    engagementByPlatform: [
      { platform: 'Twitter', likes: 45000, comments: 12000, shares: 18000 },
      { platform: 'Facebook', likes: 32000, comments: 15000, shares: 9000 },
      { platform: 'Instagram', likes: 58000, comments: 8000, shares: 5000 },
      { platform: 'TikTok', likes: 28000, comments: 6000, shares: 12000 },
      { platform: 'YouTube', likes: 15000, comments: 8000, shares: 2000 },
    ],
    engagementByContentType: [
      { name: 'Video', value: 45 },
      { name: 'Imagen', value: 30 },
      { name: 'Texto', value: 15 },
      { name: 'Link', value: 10 },
    ],
    engagementOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      twitter: 5 + Math.random() * 5,
      facebook: 4 + Math.random() * 4,
      instagram: 6 + Math.random() * 6,
      tiktok: 7 + Math.random() * 7,
      youtube: 3 + Math.random() * 3,
    })),
    topPerformingContent: Array.from({ length: 5 }, (_, i) => ({
      id: `content-${i}`,
      platform: ['twitter', 'facebook', 'instagram', 'tiktok', 'youtube'][Math.floor(Math.random() * 5)],
      author: ['Dina Boluarte', 'Keiko Fujimori', 'Pedro Castillo', 'Rafael López Aliaga'][Math.floor(Math.random() * 4)],
      content: [
        'Nuestro compromiso es con la educación de calidad para todos los peruanos. #EducaciónDeCalidad',
        'La seguridad ciudadana es prioridad. Implementaremos un plan integral. #SeguridadCiudadana',
        'El desarrollo económico debe llegar a todas las regiones. #DesarrolloRegional',
        'Reforma del sistema de salud para garantizar acceso universal. #SaludParaTodos',
        'La lucha contra la corrupción será frontal e implacable. #PerúSinCorrupción',
      ][Math.floor(Math.random() * 5)],
      date: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      likes: Math.floor(Math.random() * 10000) + 1000,
      engagementRate: Math.random() * 10 + 5,
    })),
    sentimentDistribution: [
      { name: 'Positivo', value: 45 },
      { name: 'Neutral', value: 30 },
      { name: 'Negativo', value: 25 },
    ],
    averageSentiment: 0.18,
    emotionsDetected: [
      { name: 'Interés', value: 35 },
      { name: 'Esperanza', value: 25 },
      { name: 'Preocupación', value: 20 },
      { name: 'Frustración', value: 15 },
      { name: 'Entusiasmo', value: 10 },
      { name: 'Enojo', value: 8 },
      { name: 'Miedo', value: 5 },
    ],
    sentimentOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      sentiment: Math.random() * 0.6 - 0.2, // Range from -0.2 to 0.4
    })),
    sentimentByRegion: [
      { region: 'Lima', sentiment: 0.25 },
      { region: 'Arequipa', sentiment: 0.32 },
      { region: 'Cusco', sentiment: 0.18 },
      { region: 'La Libertad', sentiment: -0.12 },
      { region: 'Piura', sentiment: 0.08 },
      { region: 'Puno', sentiment: -0.05 },
      { region: 'Ica', sentiment: 0.22 },
    ],
    sentimentByDemographics: {
      age: [
        { group: '18-25', sentiment: 0.28 },
        { group: '26-35', sentiment: 0.15 },
        { group: '36-50', sentiment: 0.05 },
        { group: '50+', sentiment: -0.08 },
      ],
      nse: [
        { group: 'NSE A', sentiment: 0.22 },
        { group: 'NSE B', sentiment: 0.18 },
        { group: 'NSE C', sentiment: 0.05 },
        { group: 'NSE D', sentiment: -0.12 },
        { group: 'NSE E', sentiment: -0.18 },
      ],
    },
    sentimentDrivers: {
      positive: [
        { topic: 'Propuestas económicas', impact: 0.35 },
        { topic: 'Educación', impact: 0.28 },
        { topic: 'Desarrollo regional', impact: 0.22 },
        { topic: 'Salud', impact: 0.18 },
      ],
      negative: [
        { topic: 'Seguridad ciudadana', impact: -0.32 },
        { topic: 'Corrupción', impact: -0.28 },
        { topic: 'Desempleo', impact: -0.25 },
        { topic: 'Transporte público', impact: -0.15 },
      ],
    },
  };
};

// Generate mock influencers
const generateMockInfluencers = (count: number): Influencer[] => {
  const names = [
    'María González', 'Carlos Mendoza', 'Ana Rodríguez', 'Luis Torres', 'Patricia Silva',
    'Roberto Díaz', 'Claudia Vargas', 'Jorge Ramírez', 'Valeria Castro', 'Miguel Sánchez'
  ];
  const avatars = [
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
  ];
  const platforms = ['twitter', 'facebook', 'instagram', 'tiktok', 'youtube'];
  const politicalLeans = ['left', 'center_left', 'center', 'center_right', 'right'];
  const topics = [
    'Política económica', 'Educación', 'Salud', 'Seguridad', 'Medio ambiente',
    'Derechos humanos', 'Corrupción', 'Desarrollo regional', 'Infraestructura', 'Empleo'
  ];
  const locations = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Puno', 'Ica'];
  const audiences = [
    'Jóvenes 18-25', 'Adultos 26-35', 'Adultos 36-50', 'Adultos 50+',
    'NSE A-B', 'NSE C', 'NSE D-E', 'Urbano', 'Rural'
  ];
  
  const influencers: Influencer[] = [];
  
  for (let i = 0; i < count; i++) {
    const followers = Math.floor(Math.random() * 900000) + 100000;
    
    influencers.push({
      id: `influencer-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      handle: `@${names[Math.floor(Math.random() * names.length)].toLowerCase().replace(' ', '')}`,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      mainPlatform: platforms[Math.floor(Math.random() * platforms.length)],
      followers,
      engagementRate: Math.random() * 10 + 2,
      postsCount: Math.floor(Math.random() * 100) + 20,
      influenceScore: Math.floor(Math.random() * 6) + 5,
      politicalLean: politicalLeans[Math.floor(Math.random() * politicalLeans.length)] as any,
      topics: Array.from(
        { length: Math.floor(Math.random() * 3) + 2 },
        () => topics[Math.floor(Math.random() * topics.length)]
      ),
      recentActivity: Math.random() > 0.3 ? 'Publicó sobre reforma educativa y su impacto en regiones' : undefined,
      estimatedReach: followers * (1 + Math.random()),
      mainAudience: audiences[Math.floor(Math.random() * audiences.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      growthTrend: Math.random() * 30 - 5,
    });
  }
  
  return influencers;
};

// Generate mock hashtags
const generateMockHashtags = (count: number): Hashtag[] => {
  const hashtagNames = [
    'PerúAvanza', 'EleccionesPeru2024', 'PerúDecide', 'ReformaTributaria', 'EducaciónDeCalidad',
    'SeguridadCiudadana', 'DesarrolloRegional', 'SaludParaTodos', 'PerúSinCorrupción', 'AgroPeruano',
    'InfraestructuraVial', 'EmpleoJuvenil', 'MineríaResponsable', 'TransportePublico', 'InclusionSocial'
  ];
  const platforms = ['twitter', 'facebook', 'instagram', 'tiktok', 'youtube'];
  
  const hashtags: Hashtag[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = hashtagNames[Math.floor(Math.random() * hashtagNames.length)];
    const volume = Math.floor(Math.random() * 10000) + 500;
    
    hashtags.push({
      id: `hashtag-${i}`,
      name,
      volume,
      growthRate: Math.random() * 100 - 10,
      engagementRate: Math.random() * 10 + 2,
      sentiment: randomSentiment(),
      platforms: Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => platforms[Math.floor(Math.random() * platforms.length)]
      ),
      volumeOverTime: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        volume: Math.floor(Math.random() * 2000) + 500,
      })),
      platformDistribution: platforms.map(platform => ({
        platform,
        volume: Math.floor(Math.random() * 5000) + 100,
      })),
      relatedHashtags: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => ({
        name: hashtagNames[Math.floor(Math.random() * hashtagNames.length)],
        coOccurrenceRate: Math.floor(Math.random() * 80) + 20,
      })),
      relatedEvents: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => ({
        name: [
          'Debate Presidencial', 'Aprobación Reforma Tributaria', 'Manifestaciones Lima Centro',
          'Anuncio Plan Económico', 'Presentación Candidatos Congreso'
        ][Math.floor(Math.random() * 5)],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        description: 'Evento político de alto impacto con cobertura mediática nacional',
      })),
    });
  }
  
  return hashtags;
};

// Generate mock viral posts
const generateMockViralPosts = (count: number): ViralPost[] => {
  const basePosts = generateMockPosts(count);
  
  return basePosts.map((post, index) => {
    const viralityScore = Math.floor(Math.random() * 3) + 8; // 8-10
    
    return {
      ...post,
      viralityScore,
      viralityReason: [
        'Contenido altamente compartible sobre propuesta económica innovadora',
        'Mensaje emotivo que resuena con preocupaciones ciudadanas sobre seguridad',
        'Crítica directa a política gubernamental con datos impactantes',
        'Propuesta disruptiva para reforma educativa con alto engagement',
        'Video testimonial auténtico sobre impacto de políticas públicas'
      ][Math.floor(Math.random() * 5)],
      viralityFactors: [
        { name: 'Emoción', impact: Math.floor(Math.random() * 40) + 60 },
        { name: 'Relevancia', impact: Math.floor(Math.random() * 30) + 70 },
        { name: 'Timing', impact: Math.floor(Math.random() * 20) + 80 },
        { name: 'Autenticidad', impact: Math.floor(Math.random() * 30) + 70 },
        { name: 'Controversia', impact: Math.floor(Math.random() * 50) + 50 },
      ].slice(0, Math.floor(Math.random() * 2) + 3),
      demographics: {
        age: [
          { group: '18-25', percentage: Math.floor(Math.random() * 30) + 20 },
          { group: '26-35', percentage: Math.floor(Math.random() * 25) + 15 },
          { group: '36-50', percentage: Math.floor(Math.random() * 20) + 10 },
          { group: '50+', percentage: Math.floor(Math.random() * 15) + 5 },
        ],
        gender: [
          { group: 'Masculino', percentage: Math.floor(Math.random() * 30) + 35 },
          { group: 'Femenino', percentage: Math.floor(Math.random() * 30) + 35 },
        ],
      },
      strategicRecommendations: [
        'Amplificar mensaje en plataformas similares para maximizar alcance',
        'Desarrollar contenido de seguimiento para mantener momentum',
        'Implementar campaña de micro-targeting a segmentos demográficos receptivos',
        'Preparar respuestas a posibles críticas o desinformación relacionada',
        'Coordinar con influencers afines para amplificar mensaje original'
      ].slice(0, Math.floor(Math.random() * 2) + 3),
    };
  });
};

// Generate mock competitors
const generateMockCompetitors = (count: number): Competitor[] => {
  const names = [
    'Fuerza Popular', 'Perú Libre', 'Renovación Popular', 'Alianza para el Progreso', 'Acción Popular',
    'Somos Perú', 'Podemos Perú', 'Avanza País', 'Juntos por el Perú', 'Victoria Nacional'
  ];
  const types = ['Partido político', 'Movimiento regional', 'Coalición', 'Candidato independiente'];
  
  const competitors: Competitor[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const shareOfVoice = Math.random() * 30 + 5;
    
    competitors.push({
      id: `competitor-${i}`,
      name,
      type: types[Math.floor(Math.random() * types.length)],
      followers: Math.floor(Math.random() * 900000) + 100000,
      engagementRate: Math.random() * 10 + 2,
      postFrequency: Math.floor(Math.random() * 20) + 5,
      shareOfVoice,
      trend: Math.random() * 30 - 10,
      followerGrowth: Math.random() * 20 - 5,
      engagementGrowth: Math.random() * 25 - 5,
      postGrowth: Math.random() * 30 - 10,
      performanceOverTime: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        engagement: Math.random() * 5 + 5,
        shareOfVoice: shareOfVoice + (Math.random() * 10 - 5),
      })),
      contentStrategy: {
        contentTypes: [
          { type: 'Video', percentage: Math.floor(Math.random() * 30) + 20 },
          { type: 'Imagen', percentage: Math.floor(Math.random() * 30) + 20 },
          { type: 'Texto', percentage: Math.floor(Math.random() * 20) + 10 },
          { type: 'Link', percentage: Math.floor(Math.random() * 20) + 10 },
        ],
        topics: [
          { topic: 'Economía', percentage: Math.floor(Math.random() * 30) + 10 },
          { topic: 'Seguridad', percentage: Math.floor(Math.random() * 25) + 10 },
          { topic: 'Educación', percentage: Math.floor(Math.random() * 20) + 10 },
          { topic: 'Salud', percentage: Math.floor(Math.random() * 15) + 10 },
          { topic: 'Infraestructura', percentage: Math.floor(Math.random() * 10) + 5 },
        ],
      },
      topContent: Array.from({ length: 3 }, () => ({
        text: [
          'Nuestras propuestas para reactivar la economía peruana y generar más empleo #PerúAvanza',
          'Plan integral de seguridad ciudadana para combatir la delincuencia en todo el país',
          'Educación de calidad para todos los peruanos, sin importar su condición socioeconómica',
          'Reforma del sistema de salud para garantizar acceso universal y de calidad',
          'Inversión en infraestructura para conectar todas las regiones del Perú'
        ][Math.floor(Math.random() * 5)],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        likes: Math.floor(Math.random() * 10000) + 1000,
        shares: Math.floor(Math.random() * 5000) + 500,
        engagementRate: Math.random() * 10 + 5,
      })),
      insights: [
        'Fuerte enfoque en contenido económico con propuestas concretas',
        'Estrategia de micro-targeting efectiva en segmentos NSE C-D',
        'Mayor presencia territorial en regiones del norte',
        'Uso efectivo de testimonios ciudadanos para generar engagement',
        'Respuesta rápida a coyuntura política nacional'
      ].slice(0, Math.floor(Math.random() * 2) + 3),
    });
  }
  
  return competitors;
};

// Generate mock content calendar
const generateMockContentCalendar = (count: number): ContentEvent[] => {
  const platforms = ['twitter', 'facebook', 'instagram', 'tiktok', 'youtube'];
  const contentTypes = ['text', 'image', 'video', 'link'];
  const statuses = ['draft', 'scheduled', 'published', 'pending_approval', 'rejected'];
  const titles = [
    'Post sobre propuestas económicas',
    'Video explicativo reforma educativa',
    'Infografía plan de seguridad',
    'Testimonial ciudadano',
    'Anuncio evento regional',
    'Respuesta a críticas oposición',
    'Entrevista candidato',
    'Resumen actividades semanales'
  ];
  const contents = [
    'Nuestras propuestas económicas buscan reactivar la economía peruana con énfasis en las MYPES y el empleo juvenil. #PerúAvanza #Economía',
    'La reforma educativa que proponemos garantizará educación de calidad para todos los peruanos, sin importar su condición socioeconómica. #EducaciónDeCalidad',
    'Plan integral de seguridad ciudadana con participación de gobiernos locales y sociedad civil. Tolerancia cero a la delincuencia. #SeguridadCiudadana',
    'El desarrollo económico debe llegar a todas las regiones. Nuestra propuesta de descentralización efectiva. #DesarrolloRegional',
    'Reforma del sistema de salud para garantizar acceso universal y de calidad para todos los peruanos. #SaludParaTodos'
  ];
  const tags = [
    'PerúAvanza', 'EleccionesPeru2024', 'PerúDecide', 'ReformaTributaria', 'EducaciónDeCalidad',
    'SeguridadCiudadana', 'DesarrolloRegional', 'SaludParaTodos', 'PerúSinCorrupción', 'AgroPeruano'
  ];
  const creators = ['María González', 'Carlos Mendoza', 'Ana Rodríguez', 'Luis Torres', 'Patricia Silva'];
  const approvers = ['Roberto Díaz', 'Claudia Vargas', 'Jorge Ramírez'];
  
  const events: ContentEvent[] = [];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const createdAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    const scheduledDate = randomDate(createdAt, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    
    events.push({
      id: `event-${i}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
      content: contents[Math.floor(Math.random() * contents.length)],
      scheduledDate,
      status,
      tags: Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => tags[Math.floor(Math.random() * tags.length)]
      ),
      media: Math.random() > 0.5 ? `https://picsum.photos/seed/${i}/500/300` : undefined,
      createdBy: creators[Math.floor(Math.random() * creators.length)],
      createdAt,
      approvedBy: status === 'published' || status === 'scheduled' 
        ? approvers[Math.floor(Math.random() * approvers.length)] 
        : undefined,
      publishedAt: status === 'published' 
        ? randomDate(scheduledDate, new Date()) 
        : undefined,
    });
  }
  
  return events;
};

// Generate mock audience data
const generateMockAudienceData = (): AudienceData => {
  return {
    totalFollowers: 450000,
    followerGrowth: 12.5,
    engagementRate: 7.8,
    engagementGrowth: 15.2,
    averageReach: 125000,
    reachGrowth: 8.7,
    averageSentiment: 0.18,
    sentimentGrowth: 5.3,
    demographics: {
      ageGender: [
        { age: '18-25', male: 18, female: 22 },
        { age: '26-35', male: 15, female: 17 },
        { age: '36-50', male: 12, female: 10 },
        { age: '50+', male: 4, female: 2 },
      ],
      nse: [
        { name: 'NSE A', value: 8 },
        { name: 'NSE B', value: 22 },
        { name: 'NSE C', value: 35 },
        { name: 'NSE D', value: 25 },
        { name: 'NSE E', value: 10 },
      ],
      geographic: [
        { region: 'Lima', followers: 225000, percentage: 50, engagement: 8.2, sentiment: 0.22 },
        { region: 'Arequipa', followers: 45000, percentage: 10, engagement: 7.5, sentiment: 0.28 },
        { region: 'Cusco', followers: 36000, percentage: 8, engagement: 6.8, sentiment: 0.15 },
        { region: 'La Libertad', followers: 31500, percentage: 7, engagement: 6.2, sentiment: -0.08 },
        { region: 'Piura', followers: 27000, percentage: 6, engagement: 5.9, sentiment: 0.12 },
        { region: 'Puno', followers: 22500, percentage: 5, engagement: 5.5, sentiment: -0.05 },
        { region: 'Ica', followers: 18000, percentage: 4, engagement: 6.8, sentiment: 0.18 },
        { region: 'Otros', followers: 45000, percentage: 10, engagement: 6.1, sentiment: 0.05 },
      ],
    },
    growthOverTime: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }),
      followers: 350000 + (i * 10000) + (Math.random() * 5000),
      engagement: 6 + (i * 0.2) + (Math.random() * 0.5),
    })),
    interests: [
      { topic: 'Economía', percentage: 28 },
      { topic: 'Seguridad', percentage: 22 },
      { topic: 'Educación', percentage: 18 },
      { topic: 'Salud', percentage: 15 },
      { topic: 'Infraestructura', percentage: 12 },
      { topic: 'Medio ambiente', percentage: 10 },
      { topic: 'Cultura', percentage: 8 },
      { topic: 'Deportes', percentage: 5 },
    ],
    politicalAffinity: {
      ideology: [
        { name: 'Izquierda', value: 15 },
        { name: 'Centro-Izquierda', value: 22 },
        { name: 'Centro', value: 30 },
        { name: 'Centro-Derecha', value: 25 },
        { name: 'Derecha', value: 8 },
      ],
      parties: [
        { name: 'Fuerza Popular', percentage: 28, color: '#FF6B35' },
        { name: 'Perú Libre', percentage: 22, color: '#DC2626' },
        { name: 'Renovación Popular', percentage: 18, color: '#3B82F6' },
        { name: 'Alianza para el Progreso', percentage: 15, color: '#10B981' },
        { name: 'Acción Popular', percentage: 12, color: '#8B5CF6' },
      ],
    },
  };
};

// Generate mock crisis alerts
const generateMockCrisisAlerts = (count: number): CrisisAlert[] => {
  const titles = [
    'Spike negativo en menciones sobre reforma tributaria',
    'Crisis de imagen por declaraciones sobre minería',
    'Desinformación viral sobre propuesta educativa',
    'Ataque coordinado en redes sobre política económica',
    'Filtración de audio comprometedor',
    'Controversia por declaraciones sobre seguridad',
    'Críticas masivas a plan de infraestructura',
    'Reacción negativa a postura sobre tema ambiental'
  ];
  const descriptions = [
    'Incremento súbito de menciones negativas sobre reforma tributaria, principalmente en Twitter y Facebook.',
    'Crisis de imagen generada por declaraciones sobre regulación minera interpretadas como anti-inversión.',
    'Campaña de desinformación viral sobre supuestos recortes en presupuesto educativo.',
    'Ataque coordinado en redes sociales criticando propuestas económicas con información manipulada.',
    'Filtración de audio donde supuestamente se escuchan comentarios polémicos sobre política regional.',
    'Controversia generada por declaraciones sobre plan de seguridad ciudadana interpretadas como autoritarias.',
    'Ola de críticas a plan de infraestructura vial por supuesto impacto ambiental negativo.',
    'Reacción negativa en redes a postura sobre protección de reservas naturales vs. desarrollo económico.'
  ];
  const priorities = ['critical', 'high', 'medium', 'low'];
  const statuses = ['active', 'monitoring', 'resolved', 'archived'];
  const platforms = ['Twitter', 'Facebook', 'Instagram', 'TikTok', 'YouTube', 'Medios digitales'];
  const regions = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Puno', 'Ica', 'Nacional'];
  const keywords = [
    'reforma tributaria', 'impuestos', 'minería', 'educación', 'presupuesto', 'economía',
    'seguridad', 'delincuencia', 'infraestructura', 'medio ambiente', 'corrupción'
  ];
  
  const alerts: CrisisAlert[] = [];
  
  for (let i = 0; i < count; i++) {
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const titleIndex = Math.floor(Math.random() * titles.length);
    
    alerts.push({
      id: `crisis-${i}`,
      title: titles[titleIndex],
      description: descriptions[titleIndex],
      priority,
      status,
      detectedAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      region: regions[Math.floor(Math.random() * regions.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      keywords: Array.from(
        { length: Math.floor(Math.random() * 3) + 2 },
        () => keywords[Math.floor(Math.random() * keywords.length)]
      ),
      metrics: {
        volumeChange: Math.floor(Math.random() * 200) + 50,
        timeWindow: ['últimas 2 horas', 'últimas 6 horas', 'últimas 12 horas', 'último día'][Math.floor(Math.random() * 4)],
        sentiment: -0.2 - (Math.random() * 0.6),
        sentimentChange: -(Math.random() * 0.5),
        reach: Math.floor(Math.random() * 500000) + 50000,
        velocity: Math.floor(Math.random() * 50) + 10,
      },
      responseProtocol: status !== 'archived' ? {
        escalationLevel: ['Nivel 1', 'Nivel 2', 'Nivel 3'][Math.floor(Math.random() * 3)],
        responseTime: ['Inmediata (1h)', 'Urgente (3h)', 'Prioritaria (6h)', 'Estándar (12h)'][Math.floor(Math.random() * 4)],
        responsible: ['Director de Comunicaciones', 'Coordinador de Redes Sociales', 'Vocero Oficial', 'Jefe de Prensa'][Math.floor(Math.random() * 4)],
        recommendedActions: [
          'Emitir comunicado oficial aclarando información',
          'Coordinar entrevistas con medios clave',
          'Publicar fact-checking en redes sociales',
          'Activar influencers aliados para amplificar mensaje',
          'Monitorear evolución de crisis cada 30 minutos',
          'Preparar Q&A para voceros',
          'Contactar directamente a líderes de opinión'
        ].slice(0, Math.floor(Math.random() * 3) + 2),
      } : undefined,
    });
  }
  
  return alerts;
};

// Generate mock social listening data
const generateMockSocialListeningData = (): SocialListeningData => {
  return {
    mentionVolumeOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      volume: 1000 + (i * 50) + (Math.random() * 500),
    })),
    sentimentOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      sentiment: -0.1 + (i * 0.01) + (Math.random() * 0.2),
    })),
    monitoredKeywords: [
      {
        id: 'keyword-1',
        name: 'Reforma tributaria',
        mentions: 3250,
        trend: 45,
        sentiment: 0.15,
        alerts: 2,
        relatedTerms: ['impuestos', 'tributos', 'reforma fiscal', 'MEF', 'economía'],
        platformDistribution: [
          { name: 'Twitter', value: 42 },
          { name: 'Facebook', value: 28 },
          { name: 'Instagram', value: 15 },
          { name: 'Medios digitales', value: 15 },
        ],
        sentimentByRegion: [
          { region: 'Lima', sentiment: 0.22 },
          { region: 'Arequipa', sentiment: 0.28 },
          { region: 'Cusco', sentiment: 0.15 },
          { region: 'La Libertad', sentiment: -0.12 },
          { region: 'Piura', sentiment: 0.08 },
        ],
        recentMentions: Array.from({ length: 5 }, (_, i) => ({
          platform: ['twitter', 'facebook', 'instagram'][Math.floor(Math.random() * 3)],
          author: ['@usuario1', '@usuario2', '@usuario3', '@usuario4'][Math.floor(Math.random() * 4)],
          text: [
            'La reforma tributaria propuesta beneficiará principalmente a las MYPES #ReformaTributaria',
            'Necesitamos una reforma tributaria justa que no afecte a los más vulnerables',
            'La propuesta de reforma fiscal parece prometedora para la reactivación económica',
            'Preocupa el impacto de la reforma tributaria en sectores productivos clave',
            'Análisis detallado de la reforma tributaria y sus implicaciones para el Perú'
          ][Math.floor(Math.random() * 5)],
          date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 100) + 10,
          sentiment: randomSentiment(),
        })),
      },
      {
        id: 'keyword-2',
        name: 'Seguridad ciudadana',
        mentions: 4850,
        trend: -12,
        sentiment: -0.32,
        alerts: 5,
        relatedTerms: ['delincuencia', 'inseguridad', 'robos', 'policía', 'crimen'],
        platformDistribution: [
          { name: 'Twitter', value: 35 },
          { name: 'Facebook', value: 40 },
          { name: 'Instagram', value: 10 },
          { name: 'Medios digitales', value: 15 },
        ],
        sentimentByRegion: [
          { region: 'Lima', sentiment: -0.35 },
          { region: 'Arequipa', sentiment: -0.28 },
          { region: 'Cusco', sentiment: -0.22 },
          { region: 'La Libertad', sentiment: -0.42 },
          { region: 'Piura', sentiment: -0.38 },
        ],
        recentMentions: Array.from({ length: 5 }, (_, i) => ({
          platform: ['twitter', 'facebook', 'instagram'][Math.floor(Math.random() * 3)],
          author: ['@usuario1', '@usuario2', '@usuario3', '@usuario4'][Math.floor(Math.random() * 4)],
          text: [
            'La inseguridad en Lima está fuera de control. Necesitamos soluciones ya! #SeguridadCiudadana',
            'Cada día es más peligroso salir a las calles. ¿Dónde están las autoridades?',
            'Propuestas concretas para combatir la delincuencia en nuestro país',
            'La seguridad ciudadana debe ser prioridad en la agenda política nacional',
            'Análisis de las estadísticas de criminalidad en el último trimestre'
          ][Math.floor(Math.random() * 5)],
          date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 100) + 10,
          sentiment: randomSentiment(),
        })),
      },
      {
        id: 'keyword-3',
        name: 'Educación de calidad',
        mentions: 2850,
        trend: 28,
        sentiment: 0.42,
        alerts: 0,
        relatedTerms: ['educación', 'escuelas', 'universidades', 'estudiantes', 'profesores'],
        platformDistribution: [
          { name: 'Twitter', value: 30 },
          { name: 'Facebook', value: 35 },
          { name: 'Instagram', value: 25 },
          { name: 'Medios digitales', value: 10 },
        ],
        sentimentByRegion: [
          { region: 'Lima', sentiment: 0.45 },
          { region: 'Arequipa', sentiment: 0.38 },
          { region: 'Cusco', sentiment: 0.42 },
          { region: 'La Libertad', sentiment: 0.35 },
          { region: 'Piura', sentiment: 0.48 },
        ],
        recentMentions: Array.from({ length: 5 }, (_, i) => ({
          platform: ['twitter', 'facebook', 'instagram'][Math.floor(Math.random() * 3)],
          author: ['@usuario1', '@usuario2', '@usuario3', '@usuario4'][Math.floor(Math.random() * 4)],
          text: [
            'La educación de calidad es clave para el desarrollo del país #EducaciónDeCalidad',
            'Necesitamos mayor inversión en infraestructura educativa en zonas rurales',
            'Propuestas para mejorar la calidad educativa en todos los niveles',
            'La brecha digital en educación debe ser prioridad para el próximo gobierno',
            'Análisis de los resultados educativos en el último año escolar'
          ][Math.floor(Math.random() * 5)],
          date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 100) + 10,
          sentiment: randomSentiment(),
        })),
      },
      {
        id: 'keyword-4',
        name: 'Desarrollo regional',
        mentions: 1950,
        trend: 18,
        sentiment: 0.28,
        alerts: 1,
        relatedTerms: ['descentralización', 'regiones', 'provincias', 'desarrollo local', 'inversión regional'],
        platformDistribution: [
          { name: 'Twitter', value: 25 },
          { name: 'Facebook', value: 45 },
          { name: 'Instagram', value: 15 },
          { name: 'Medios digitales', value: 15 },
        ],
        sentimentByRegion: [
          { region: 'Lima', sentiment: 0.15 },
          { region: 'Arequipa', sentiment: 0.32 },
          { region: 'Cusco', sentiment: 0.38 },
          { region: 'La Libertad', sentiment: 0.25 },
          { region: 'Piura', sentiment: 0.35 },
        ],
        recentMentions: Array.from({ length: 5 }, (_, i) => ({
          platform: ['twitter', 'facebook', 'instagram'][Math.floor(Math.random() * 3)],
          author: ['@usuario1', '@usuario2', '@usuario3', '@usuario4'][Math.floor(Math.random() * 4)],
          text: [
            'El desarrollo regional debe ser prioridad para reducir brechas #DesarrolloRegional',
            'Necesitamos mayor inversión en infraestructura en regiones olvidadas',
            'Propuestas para impulsar el desarrollo económico en todas las regiones',
            'La descentralización efectiva es clave para el desarrollo del país',
            'Análisis de la inversión pública regional en el último año'
          ][Math.floor(Math.random() * 5)],
          date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 100) + 10,
          sentiment: randomSentiment(),
        })),
      },
      {
        id: 'keyword-5',
        name: 'Salud para todos',
        mentions: 2350,
        trend: 22,
        sentiment: 0.35,
        alerts: 0,
        relatedTerms: ['salud', 'hospitales', 'médicos', 'atención médica', 'seguro universal'],
        platformDistribution: [
          { name: 'Twitter', value: 30 },
          { name: 'Facebook', value: 40 },
          { name: 'Instagram', value: 20 },
          { name: 'Medios digitales', value: 10 },
        ],
        sentimentByRegion: [
          { region: 'Lima', sentiment: 0.32 },
          { region: 'Arequipa', sentiment: 0.38 },
          { region: 'Cusco', sentiment: 0.35 },
          { region: 'La Libertad', sentiment: 0.28 },
          { region: 'Piura', sentiment: 0.42 },
        ],
        recentMentions: Array.from({ length: 5 }, (_, i) => ({
          platform: ['twitter', 'facebook', 'instagram'][Math.floor(Math.random() * 3)],
          author: ['@usuario1', '@usuario2', '@usuario3', '@usuario4'][Math.floor(Math.random() * 4)],
          text: [
            'La salud es un derecho fundamental que debe ser garantizado #SaludParaTodos',
            'Necesitamos mayor inversión en infraestructura hospitalaria en zonas rurales',
            'Propuestas para mejorar el sistema de salud pública en el Perú',
            'El acceso a medicamentos debe ser garantizado para todos los peruanos',
            'Análisis de la situación del sistema de salud peruano post-pandemia'
          ][Math.floor(Math.random() * 5)],
          date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 100) + 10,
          sentiment: randomSentiment(),
        })),
      },
    ],
  };
};

export const useSocialData = (filters: SocialFilters) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [metrics, setMetrics] = useState<SocialMetrics>(generateMockMetrics());
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [viralContent, setViralContent] = useState<ViralPost[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [audienceData, setAudienceData] = useState<AudienceData>(generateMockAudienceData());
  const [contentCalendar, setContentCalendar] = useState<ContentEvent[]>([]);
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([]);
  const [listeningData, setListeningData] = useState<SocialListeningData>(generateMockSocialListeningData());
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(true);

  const fetchRealData = async () => {
    try {
      const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SOCIAL}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const realPosts: SocialPost[] = data.map((post: any) => ({
            id: post.id || String(Math.random()),
            platform: post.platform || 'twitter',
            content: post.content || '',
            author: post.author || 'Usuario',
            handle: post.handle || `@usuario`,
            authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
            timestamp: new Date(post.created_at || Date.now()),
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            shares: post.shares_count || 0,
            engagementRate: post.engagement_rate || 0,
            sentiment: post.sentiment_score > 0.2 ? 'positive' : post.sentiment_score < -0.2 ? 'negative' : 'neutral',
            sentimentScore: post.sentiment_score || 0,
            region: post.detected_region || 'Nacional',
            hashtags: post.hashtags || [],
            mentions: post.mentions || [],
            reach: post.reach || 1000,
            impressions: post.impressions || 1500,
            isVerified: post.is_verified || false,
            isViral: post.is_viral || false,
            isFakeNews: false,
            fakeNewsScore: 0,
            emotions: [],
            userLiked: false,
          }));
          setAllPosts(realPosts);
          setPosts(realPosts);
          setIsUsingMockData(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error fetching real social data:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      const hasRealData = await fetchRealData();
      
      if (!hasRealData) {
        const mockPosts = generateMockPosts(50);
        setAllPosts(mockPosts);
        setPosts(mockPosts);
        setIsUsingMockData(true);
      }
      
      setInfluencers(generateMockInfluencers(20));
      setHashtags(generateMockHashtags(15));
      setViralContent(generateMockViralPosts(10));
      setCompetitors(generateMockCompetitors(10));
      setContentCalendar(generateMockContentCalendar(30));
      setCrisisAlerts(generateMockCrisisAlerts(15));
      
      setIsLoading(false);
    };
    
    initializeData();
  }, []);

  const [allPosts, setAllPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    if (allPosts.length === 0) return;
    
    setIsLoading(true);
    
    const filteredPosts = allPosts.filter(post => {
      if (filters.platform !== 'all' && post.platform !== filters.platform) return false;
      if (filters.sentiment !== 'all' && post.sentiment !== filters.sentiment) return false;
      if (filters.region !== 'all' && post.region !== filters.region) return false;
      if (filters.contentType !== 'all' && post.media) {
        if (filters.contentType === 'image' && post.media[0]?.type !== 'image') return false;
        if (filters.contentType === 'video' && post.media[0]?.type !== 'video') return false;
      }
      if (filters.keywords.length > 0) {
        const content = post.content.toLowerCase();
        return filters.keywords.some(keyword => content.includes(keyword.toLowerCase()));
      }
      return true;
    });
    
    setPosts(filteredPosts);
    setIsLoading(false);
  }, [filters, allPosts]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    
    const hasRealData = await fetchRealData();
    
    if (!hasRealData) {
      const mockPosts = generateMockPosts(50);
      setAllPosts(mockPosts);
      setPosts(mockPosts);
      setIsUsingMockData(true);
    }
    
    setMetrics(generateMockMetrics());
    setInfluencers(generateMockInfluencers(20));
    setHashtags(generateMockHashtags(15));
    setViralContent(generateMockViralPosts(10));
    setCompetitors(generateMockCompetitors(10));
    setAudienceData(generateMockAudienceData());
    setContentCalendar(generateMockContentCalendar(30));
    setCrisisAlerts(generateMockCrisisAlerts(15));
    setListeningData(generateMockSocialListeningData());
    
    setIsLoading(false);
  }, []);

  return {
    posts,
    metrics,
    influencers,
    hashtags,
    viralContent,
    competitors,
    audienceData,
    contentCalendar,
    crisisAlerts,
    listeningData,
    isLoading,
    isUsingMockData,
    refreshData,
  };
};