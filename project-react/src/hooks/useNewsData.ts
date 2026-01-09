import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';

interface NewsArticle {
  id: string;
  title: string;
  content: string | null;
  source: string;
  url: string;
  published_at: string | null;
  scraped_at: string;
  sentiment_score: number | null;
  category: string | null;
  author: string | null;
  tags: string[] | null;
  political_entities: Record<string, unknown> | null;
}

interface NewsData {
  articles: NewsArticle[];
  total: number;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

export const useNewsData = (limit: number = 20) => {
  const [data, setData] = useState<NewsData>({
    articles: [],
    total: 0,
    isLoading: true,
    error: null,
    hasData: false,
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
      const articles = Array.isArray(result) ? result : (result.articles || []);
      
      setData({
        articles: articles.slice(0, limit),
        total: articles.length,
        isLoading: false,
        error: null,
        hasData: articles.length > 0,
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      setData({
        articles: [],
        total: 0,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        hasData: false,
      });
    }
  }, [limit]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { ...data, refetch: fetchNews };
};
