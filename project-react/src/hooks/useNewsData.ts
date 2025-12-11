import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  published_at: string;
  sentiment_score: number;
  region: string;
  category: string;
}

interface NewsData {
  articles: NewsArticle[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export const useNewsData = (limit: number = 20) => {
  const [data, setData] = useState<NewsData>({
    articles: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const fetchNews = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.NEWS}?limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar noticias');
      }
      
      const result = await response.json();
      
      setData({
        articles: result.articles || [],
        total: result.total || 0,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  }, [limit]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { ...data, refetch: fetchNews };
};
