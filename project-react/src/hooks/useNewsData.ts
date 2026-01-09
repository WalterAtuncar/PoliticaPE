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
  isUsingMockData: boolean;
}

const mockArticles: NewsArticle[] = [
  {
    id: 'mock-1',
    title: 'Gobierno anuncia nuevas medidas económicas',
    content: 'El gobierno presentó un paquete de medidas para reactivar la economía...',
    source: 'El Comercio',
    url: 'https://elcomercio.pe/example',
    published_at: new Date().toISOString(),
    scraped_at: new Date().toISOString(),
    sentiment_score: 0.45,
    category: 'Economía',
    author: null,
    tags: ['economía', 'gobierno'],
    political_entities: null,
  },
  {
    id: 'mock-2',
    title: 'Congreso debate reforma electoral',
    content: 'Los parlamentarios discuten cambios importantes en el sistema electoral...',
    source: 'RPP',
    url: 'https://rpp.pe/example',
    published_at: new Date().toISOString(),
    scraped_at: new Date().toISOString(),
    sentiment_score: -0.12,
    category: 'Política',
    author: null,
    tags: ['congreso', 'reforma'],
    political_entities: null,
  },
];

export const useNewsData = (limit: number = 20) => {
  const [data, setData] = useState<NewsData>({
    articles: [],
    total: 0,
    isLoading: true,
    error: null,
    isUsingMockData: false,
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
      
      if (articles.length > 0) {
        setData({
          articles: articles.slice(0, limit),
          total: articles.length,
          isLoading: false,
          error: null,
          isUsingMockData: false,
        });
      } else {
        setData({
          articles: mockArticles,
          total: mockArticles.length,
          isLoading: false,
          error: null,
          isUsingMockData: true,
        });
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setData({
        articles: mockArticles,
        total: mockArticles.length,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isUsingMockData: true,
      });
    }
  }, [limit]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { ...data, refetch: fetchNews };
};
