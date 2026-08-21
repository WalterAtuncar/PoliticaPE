import { useState, useEffect, useCallback } from 'react';
import { Campaign, CampaignFilters, ReachEstimate, CompetitorCampaign } from '../types/campaigns';
import { API_CONFIG, getAuthHeaders } from '../config/api';

interface BackendCampaign {
  id: string;
  name: string;
  description: string | null;
  election: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  tenant_id: string;
  party_id: string;
  created_at: string;
  updated_at: string;
  region_code?: string | null;
  objective?: string | null;
  target_demographics?: any;
  budget_details?: any;
  performance_metrics?: any;
}

const mapBackendToCampaign = (backend: BackendCampaign): Campaign => {
  return {
    id: backend.id,
    name: backend.name,
    description: backend.description || '',
    status: backend.status as Campaign['status'],
    objective: (backend.objective as Campaign['objective']) || 'awareness',
    targetRegions: backend.region_code ? [backend.region_code] : ['Lima'],
    targetDemographics: backend.target_demographics || {
      ageGroups: ['18-25', '26-35'],
      nse: ['C', 'D'],
      gender: ['all'],
      politicalAffinity: ['undecided'],
    },
    budget: backend.budget_details || {
      total: backend.budget || 0,
      allocated: {
        digital: (backend.budget || 0) * 0.4,
        traditional: (backend.budget || 0) * 0.3,
        territorial: (backend.budget || 0) * 0.2,
        contingency: (backend.budget || 0) * 0.1,
      },
      spent: 0,
    },
    timeline: {
      startDate: new Date(backend.start_date),
      endDate: new Date(backend.end_date),
      milestones: [],
    },
    team: [],
    assets: [],
    performance: backend.performance_metrics || {
      reach: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      engagementRate: 0,
      sentimentEvolution: 0,
      mentionsGenerated: 0,
      roi: 0,
    },
    abTests: [],
    crisisProtocol: {
      escalationMatrix: [],
      responseTemplates: [],
      emergencyContacts: [],
      monitoringKeywords: [],
    },
    createdAt: new Date(backend.created_at),
    updatedAt: new Date(backend.updated_at),
    createdBy: 'system',
    lastModifiedBy: 'system',
  };
};

export const useCampaigns = (_filters: CampaignFilters) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [competitorCampaigns, setCompetitorCampaigns] = useState<CompetitorCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/campaigns/`, { headers: getAuthHeaders() });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data: BackendCampaign[] = await response.json();
      
      if (data && data.length > 0) {
        const mappedCampaigns = data.map(mapBackendToCampaign);
        setCampaigns(mappedCampaigns);
        setHasData(true);
      } else {
        setCampaigns([]);
        setHasData(false);
      }

      const competitorsRes = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/competitors/`, { headers: getAuthHeaders() });
      if (competitorsRes.ok) {
        const competitorsData = await competitorsRes.json();
        setCompetitorCampaigns(competitorsData || []);
      }

    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCampaigns([]);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = useCallback(async (campaignData: Partial<Campaign>) => {
    setIsLoading(true);
    
    try {
      const payload = {
        name: campaignData.name || 'Nueva Campaña',
        description: campaignData.description || '',
        election: 'general',
        start_date: campaignData.timeline?.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        end_date: campaignData.timeline?.endDate?.toISOString().split('T')[0] || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: campaignData.status || 'draft',
        budget: campaignData.budget?.total || 0,
        region_code: campaignData.targetRegions?.[0] || null,
        objective: campaignData.objective || null,
      };

      const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/campaigns/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error al crear campaña: ${response.status}`);
      }

      const newCampaign = await response.json();
      const mappedCampaign = mapBackendToCampaign(newCampaign);
      setCampaigns(prev => [mappedCampaign, ...prev]);
      setHasData(true);
      
      return mappedCampaign;
    } catch (err) {
      console.error('Error creating campaign:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    try {
      const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/campaigns/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: updates.name,
          description: updates.description,
          status: updates.status,
          budget: updates.budget?.total,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar: ${response.status}`);
      }

      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id 
            ? { ...campaign, ...updates, updatedAt: new Date() }
            : campaign
        )
      );
    } catch (err) {
      console.error('Error updating campaign:', err);
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id 
            ? { ...campaign, ...updates, updatedAt: new Date() }
            : campaign
        )
      );
    }
  }, []);

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/campaigns/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar: ${response.status}`);
      }

      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    }
  }, []);

  const duplicateCampaign = useCallback(async (id: string) => {
    const original = campaigns.find(c => c.id === id);
    if (original) {
      const duplicateData = {
        ...original,
        name: `${original.name} (Copia)`,
        status: 'draft' as const,
      };
      return await createCampaign(duplicateData);
    }
  }, [campaigns, createCampaign]);

  const getPerformanceMetrics = useCallback((campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.performance || null;
  }, [campaigns]);

  const getReachEstimate = useCallback(async (targetData: any): Promise<ReachEstimate> => {
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
      confidence: 75,
      basedOnHistoricalData: hasData,
    };
  }, [hasData]);

  return {
    campaigns,
    competitorCampaigns,
    isLoading,
    error,
    hasData,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    getPerformanceMetrics,
    getReachEstimate,
    refetch: fetchCampaigns,
  };
};
