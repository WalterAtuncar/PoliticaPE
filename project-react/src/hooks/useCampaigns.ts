import { useState, useEffect, useCallback } from 'react';
import { Campaign, CampaignFilters, ReachEstimate, CompetitorCampaign } from '../types/campaigns';

// Mock data generator
const generateMockCampaign = (): Campaign => {
  const statuses: Campaign['status'][] = ['draft', 'review', 'approved', 'active', 'paused', 'completed', 'cancelled'];
  const objectives: Campaign['objective'][] = ['sentiment', 'awareness', 'mobilization', 'crisis_defense'];
  const regions = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Puno', 'Ica'];
  
  const campaignNames = [
    'Campaña Digital Lima Norte',
    'Fortalecimiento Regional Cusco',
    'Movilización Juvenil Nacional',
    'Defensa Crisis Medios',
    'Awareness Programa Social',
    'Campaña Territorial Arequipa',
    'Engagement Redes Sociales',
    'Evento Masivo Plaza Mayor',
    'Campaña Anti-Desinformación',
    'Promoción Logros Gestión'
  ];

  const descriptions = [
    'Campaña integral para fortalecer presencia digital en sectores juveniles del norte de Lima',
    'Estrategia territorial para consolidar liderazgo en la región Cusco mediante eventos comunitarios',
    'Movilización nacional de jóvenes 18-25 años enfocada en propuestas de empleo y educación',
    'Respuesta estratégica a crisis mediática con enfoque en transparencia y rendición de cuentas',
    'Campaña de awareness sobre nuevos programas sociales dirigida a familias NSE C-D',
    'Fortalecimiento territorial en Arequipa mediante alianzas con líderes locales',
    'Optimización de engagement en redes sociales con contenido viral y micro-influencers',
    'Evento masivo en Plaza Mayor con transmisión multiplataforma y participación ciudadana',
    'Campaña contra desinformación con fact-checking y educación mediática',
    'Promoción de logros de gestión con testimonios ciudadanos y datos verificables'
  ];

  const id = Date.now().toString() + Math.random();
  const nameIndex = Math.floor(Math.random() * campaignNames.length);
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const totalBudget = Math.floor(Math.random() * 200000) + 50000;
  const spent = status === 'completed' ? totalBudget * 0.95 : Math.floor(Math.random() * totalBudget * 0.8);

  return {
    id,
    name: campaignNames[nameIndex],
    description: descriptions[nameIndex],
    status,
    objective: objectives[Math.floor(Math.random() * objectives.length)],
    targetRegions: regions.slice(0, Math.floor(Math.random() * 3) + 1),
    targetDemographics: {
      ageGroups: ['18-25', '26-35'].slice(0, Math.floor(Math.random() * 2) + 1),
      nse: ['C', 'D'].slice(0, Math.floor(Math.random() * 2) + 1),
      gender: ['all'],
      politicalAffinity: ['undecided', 'favorable'].slice(0, Math.floor(Math.random() * 2) + 1),
    },
    budget: {
      total: totalBudget,
      allocated: {
        digital: totalBudget * 0.4,
        traditional: totalBudget * 0.3,
        territorial: totalBudget * 0.2,
        contingency: totalBudget * 0.1,
      },
      spent,
    },
    timeline: {
      startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
      milestones: [],
    },
    team: [],
    assets: [],
    performance: {
      reach: Math.floor(Math.random() * 500000) + 100000,
      impressions: Math.floor(Math.random() * 2000000) + 500000,
      clicks: Math.floor(Math.random() * 50000) + 10000,
      conversions: Math.floor(Math.random() * 5000) + 1000,
      engagementRate: Math.random() * 10 + 2,
      sentimentEvolution: (Math.random() - 0.5) * 0.4,
      mentionsGenerated: Math.floor(Math.random() * 10000) + 2000,
      roi: Math.floor(Math.random() * 300) + 150,
    },
    abTests: [],
    crisisProtocol: {
      escalationMatrix: [],
      responseTemplates: [],
      emergencyContacts: [],
      monitoringKeywords: [],
    },
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    createdBy: 'user-1',
    lastModifiedBy: 'user-1',
  };
};

const generateMockCompetitorCampaign = (): CompetitorCampaign => {
  const competitors = ['Fuerza Popular', 'Perú Libre', 'Renovación Popular', 'Alianza para el Progreso', 'Acción Popular'];
  const regions = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura'];
  const platforms = ['Facebook', 'Instagram', 'Twitter', 'TikTok', 'YouTube'];
  
  const campaignNames = [
    'Campaña Digital Metropolitana',
    'Fortalecimiento Regional Norte',
    'Movilización Bases Partidarias',
    'Campaña Medios Tradicionales',
    'Estrategia Redes Sociales',
  ];

  return {
    id: Date.now().toString() + Math.random(),
    competitor: competitors[Math.floor(Math.random() * competitors.length)],
    name: campaignNames[Math.floor(Math.random() * campaignNames.length)],
    detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    regions: regions.slice(0, Math.floor(Math.random() * 3) + 1),
    estimatedBudget: Math.floor(Math.random() * 150000) + 30000,
    reach: Math.floor(Math.random() * 300000) + 50000,
    sentiment: (Math.random() - 0.5) * 0.6,
    keyMessages: [
      'Desarrollo económico sostenible',
      'Lucha contra la corrupción',
      'Mejora de servicios públicos',
      'Seguridad ciudadana',
      'Educación de calidad'
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    platforms: platforms.slice(0, Math.floor(Math.random() * 3) + 2),
    status: ['active', 'completed', 'paused'][Math.floor(Math.random() * 3)] as any,
  };
};

export const useCampaigns = (filters: CampaignFilters) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [competitorCampaigns, setCompetitorCampaigns] = useState<CompetitorCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    const mockCampaigns: Campaign[] = [];
    for (let i = 0; i < 12; i++) {
      mockCampaigns.push(generateMockCampaign());
    }
    setCampaigns(mockCampaigns);

    const mockCompetitors: CompetitorCampaign[] = [];
    for (let i = 0; i < 8; i++) {
      mockCompetitors.push(generateMockCompetitorCampaign());
    }
    setCompetitorCampaigns(mockCompetitors);
  }, []);

  const createCampaign = useCallback(async (campaignData: Partial<Campaign>) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newCampaign: Campaign = {
      ...generateMockCampaign(),
      ...campaignData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Campaign;

    setCampaigns(prev => [newCampaign, ...prev]);
    setIsLoading(false);
    
    return newCampaign;
  }, []);

  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === id 
          ? { ...campaign, ...updates, updatedAt: new Date() }
          : campaign
      )
    );
  }, []);

  const deleteCampaign = useCallback(async (id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
  }, []);

  const duplicateCampaign = useCallback(async (id: string) => {
    const original = campaigns.find(c => c.id === id);
    if (original) {
      const duplicate: Campaign = {
        ...original,
        id: Date.now().toString(),
        name: `${original.name} (Copia)`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCampaigns(prev => [duplicate, ...prev]);
      return duplicate;
    }
  }, [campaigns]);

  const getPerformanceMetrics = useCallback((campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.performance || null;
  }, [campaigns]);

  const getReachEstimate = useCallback(async (targetData: any): Promise<ReachEstimate> => {
    // Simulate API call for reach estimation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const baseReach = 100000;
    const regionMultiplier = targetData.regions?.length || 1;
    const demographicMultiplier = (targetData.demographics?.ageGroups?.length || 1) * 0.8;
    
    const totalReach = Math.floor(baseReach * regionMultiplier * demographicMultiplier);
    
    return {
      totalReach,
      byRegion: targetData.regions?.reduce((acc: any, region: string) => ({
        ...acc,
        [region]: Math.floor(totalReach / (targetData.regions?.length || 1))
      }), {}) || {},
      byDemographic: targetData.demographics?.ageGroups?.reduce((acc: any, demo: string) => ({
        ...acc,
        [demo]: Math.floor(totalReach / (targetData.demographics?.ageGroups?.length || 1))
      }), {}) || {},
      confidence: Math.floor(Math.random() * 20) + 75,
      basedOnHistoricalData: true,
    };
  }, []);

  return {
    campaigns,
    competitorCampaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    getPerformanceMetrics,
    getReachEstimate,
  };
};