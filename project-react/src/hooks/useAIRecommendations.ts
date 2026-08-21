import { useState, useEffect, useCallback } from 'react';
import { AIRecommendation, RecommendationsFilters, ROIMetrics } from '../types/recommendations';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';

function mapApiToRecommendation(item: any): AIRecommendation {
  return {
    id: item.id,
    figure_id: item.figure_id,
    title: item.title,
    description: item.description,
    category: item.category,
    priority: item.priority,
    status: item.status || 'generated',
    targetRegion: item.target_region || '',
    targetDemographic: item.target_demographic || '',
    identifiedWeakness: item.identified_weakness || '',
    recommendedAction: item.recommended_action || '',
    estimatedBudget: item.estimated_budget || { min: 0, max: 0 },
    expectedTimeline: item.expected_timeline || '',
    projectedROI: item.projected_roi || 0,
    aiConfidence: item.ai_confidence || 0,
    resourcesNeeded: item.resources_needed || [],
    successKPIs: item.success_kpis || [],
    riskFactors: item.risk_factors || [],
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at || item.created_at),
    userRating: item.user_rating,
    implementationProgress: item.implementation_progress || 0,
  };
}

export const useAIRecommendations = (filters: RecommendationsFilters) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.set('category', filters.category);
      if (filters.status !== 'all') params.set('status', filters.status);
      params.set('limit', '100');

      const res = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.RECOMMENDATIONS}?${params.toString()}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) return;
      const data = await res.json();
      setRecommendations(data.map(mapApiToRecommendation));
    } catch (e) {
      console.error('Error loading recommendations:', e);
    }
  }, [filters.category, filters.status]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const generateNewRecommendations = useCallback(async (figureIds: string[], focusAreas?: string[]) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.RECOMMENDATIONS_GENERATE}`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            figure_ids: figureIds,
            focus_areas: focusAreas || [
              'immediate_opportunities',
              'regional_strengthening',
              'territorial_recovery',
              'demographic_expansion',
            ],
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error generando recomendaciones');
      }
      const data = await res.json();
      const newRecs = (data.recommendations || []).map(mapApiToRecommendation);
      setRecommendations(prev => [...newRecs, ...prev]);
      return newRecs;
    } catch (e) {
      console.error('Error generating recommendations:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRecommendationStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.RECOMMENDATIONS}/${id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setRecommendations(prev =>
          prev.map(rec => (rec.id === id ? mapApiToRecommendation(updated) : rec))
        );
      }
    } catch (e) {
      console.error('Error updating recommendation:', e);
    }
  }, []);

  const rateRecommendation = useCallback(async (id: string, rating: number) => {
    try {
      const res = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.RECOMMENDATIONS}/${id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ user_rating: rating }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setRecommendations(prev =>
          prev.map(rec => (rec.id === id ? mapApiToRecommendation(updated) : rec))
        );
      }
    } catch (e) {
      console.error('Error rating recommendation:', e);
    }
  }, []);

  const getROIMetrics = useCallback((): ROIMetrics => {
    const implemented = recommendations.filter(rec =>
      ['completed', 'in_progress'].includes(rec.status)
    );
    const completed = recommendations.filter(rec => rec.status === 'completed');

    return {
      totalRecommendations: recommendations.length,
      implementedRecommendations: implemented.length,
      averageROI:
        completed.length > 0
          ? completed.reduce((sum, rec) => sum + rec.projectedROI, 0) / completed.length
          : 0,
      successRate:
        completed.length > 0
          ? (completed.filter(rec => rec.userRating && rec.userRating >= 4).length / completed.length) * 100
          : 0,
      totalBudgetAllocated: implemented.reduce((sum, rec) => sum + rec.estimatedBudget.max, 0),
      totalBudgetSpent: completed.reduce((sum, rec) => sum + rec.estimatedBudget.min, 0),
      averageImplementationTime: 45,
    };
  }, [recommendations]);

  return {
    recommendations,
    isLoading,
    generateNewRecommendations,
    updateRecommendationStatus,
    rateRecommendation,
    getROIMetrics,
    refetch: fetchRecommendations,
  };
};
