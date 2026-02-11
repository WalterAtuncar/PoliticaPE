import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';

export interface SurveyItem {
  id: string;
  source: string;
  title: string;
  methodology: string | null;
  sample_size: number | null;
  margin_error: number | null;
  field_dates: string | null;
  results: Record<string, unknown> | null;
  published_at: string | null;
  scraped_at: string;
  url: string | null;
  pollster: string | null;
}

interface SurveyData {
  items: SurveyItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

export const useSurveyData = (limit: number = 50) => {
  const [data, setData] = useState<SurveyData>({
    items: [],
    total: 0,
    isLoading: true,
    error: null,
    hasData: false,
  });

  const fetchSurveyData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SURVEYS}?limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar datos de encuestas');
      }
      
      const result = await response.json();
      const items = Array.isArray(result) ? result : (result.items || []);
      
      setData({
        items: items.slice(0, limit),
        total: items.length,
        isLoading: false,
        error: null,
        hasData: items.length > 0,
      });
    } catch (error) {
      console.error('Error fetching survey data:', error);
      setData({
        items: [],
        total: 0,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        hasData: false,
      });
    }
  }, [limit]);

  useEffect(() => {
    fetchSurveyData();
  }, [fetchSurveyData]);

  return { ...data, refetch: fetchSurveyData };
};
