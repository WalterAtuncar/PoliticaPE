import { useState, useEffect, useCallback } from 'react';
import { AIRecommendation, RecommendationsFilters, PortfolioMetrics } from '../types/recommendations';
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
              'territorial_priority',
              'message_of_day',
              'crisis_response',
              'rival_contrast',
              'ground_game',
              'digital_push',
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

  const getPortfolioMetrics = useCallback((): PortfolioMetrics => {
    const total = recommendations.length;
    const byPriority = { critical: 0, high: 0, medium: 0, low: 0 };
    const byStatus: Record<string, number> = {};
    let budgetMin = 0;
    let budgetMax = 0;
    let confidence = 0;
    let roi = 0;

    recommendations.forEach(rec => {
      if (rec.priority in byPriority) byPriority[rec.priority as keyof typeof byPriority] += 1;
      byStatus[rec.status] = (byStatus[rec.status] || 0) + 1;
      budgetMin += rec.estimatedBudget?.min || 0;
      budgetMax += rec.estimatedBudget?.max || 0;
      confidence += rec.aiConfidence || 0;
      roi += rec.projectedROI || 0;
    });

    return {
      total,
      byPriority,
      byStatus,
      budgetMin,
      budgetMax,
      avgConfidence: total ? confidence / total : 0,
      avgProjectedROI: total ? roi / total : 0,
    };
  }, [recommendations]);

  return {
    recommendations,
    isLoading,
    generateNewRecommendations,
    updateRecommendationStatus,
    rateRecommendation,
    getPortfolioMetrics,
    refetch: fetchRecommendations,
  };
};
