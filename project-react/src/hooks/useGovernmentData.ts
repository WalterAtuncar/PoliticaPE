import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';

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
  isUsingMockData: boolean;
}

const mockGovernmentData: GovernmentDataItem[] = [
  {
    id: 'mock-gov-1',
    source: 'MEF',
    data_type: 'Indicador',
    title: 'Indicadores Económicos Regionales',
    content: { value: 45000, summary: 'Datos económicos' },
    published_at: new Date().toISOString(),
    scraped_at: new Date().toISOString(),
    url: 'https://mef.gob.pe/example',
    department: 'Lima',
  },
  {
    id: 'mock-gov-2',
    source: 'INEI',
    data_type: 'Estadística',
    title: 'Censo de Población y Vivienda',
    content: { value: 35000000, summary: 'Población total' },
    published_at: new Date().toISOString(),
    scraped_at: new Date().toISOString(),
    url: 'https://inei.gob.pe/example',
    department: 'Nacional',
  },
];

export const useGovernmentData = (limit: number = 50) => {
  const [data, setData] = useState<GovernmentData>({
    items: [],
    total: 0,
    isLoading: true,
    error: null,
    isUsingMockData: false,
  });

  const fetchGovernmentData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.GOVERNMENT}?limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar datos gubernamentales');
      }
      
      const result = await response.json();
      const items = Array.isArray(result) ? result : (result.items || []);
      
      if (items.length > 0) {
        setData({
          items: items.slice(0, limit),
          total: items.length,
          isLoading: false,
          error: null,
          isUsingMockData: false,
        });
      } else {
        setData({
          items: mockGovernmentData,
          total: mockGovernmentData.length,
          isLoading: false,
          error: null,
          isUsingMockData: true,
        });
      }
    } catch (error) {
      console.error('Error fetching government data:', error);
      setData({
        items: mockGovernmentData,
        total: mockGovernmentData.length,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isUsingMockData: true,
      });
    }
  }, [limit]);

  useEffect(() => {
    fetchGovernmentData();
  }, [fetchGovernmentData]);

  return { ...data, refetch: fetchGovernmentData };
};
