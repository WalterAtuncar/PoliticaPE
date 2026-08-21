import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';

interface GovernmentDataItem {
  id: string;
  source: string;
  data_type: string;
  title: string;
  content: Record<string, unknown> | null;
  published_at: string | null;
  scraped_at: string;
  url: string | null;
  department: string | null;
}

interface GovernmentData {
  items: GovernmentDataItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

export const useGovernmentData = (limit: number = 50) => {
  const [data, setData] = useState<GovernmentData>({
    items: [],
    total: 0,
    isLoading: true,
    error: null,
    hasData: false,
  });

  const fetchGovernmentData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.GOVERNMENT}?limit=${limit}`,
        { headers: getAuthHeaders() }
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar datos gubernamentales');
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
      console.error('Error fetching government data:', error);
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
    fetchGovernmentData();
  }, [fetchGovernmentData]);

  return { ...data, refetch: fetchGovernmentData };
};
