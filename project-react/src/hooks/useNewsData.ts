import { useState, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';

export interface NewsArticle {
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
  scope?: string | null;
  districts?: { ubigeo: string; name: string; zone: string }[] | null;
}

export interface NewsFilters {
  source: string;
  category: string;
  scope: 'all' | 'lima_metropolitana' | 'nacional';
  search: string;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface NewsStats {
  totalArticles: number;
  sourceBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  recentCount: number;
}

interface NewsData {
  articles: NewsArticle[];
  stats: NewsStats;
  isLoading: boolean;
  isScraping: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

const SOURCE_TYPES: Record<string, string> = {
  'El Comercio': 'prensa',
  'RPP Noticias': 'prensa',
  'La República': 'prensa',
  'Perú21': 'prensa',
  'Gestión': 'prensa',
  'Infobae Perú': 'prensa',
  'Andina': 'agencia',
  'Canal N': 'tv',
  'América TV': 'tv',
  'Panamericana TV': 'tv',
  'TV Perú': 'tv',
  'Exitosa': 'radio',
};

export const getSourceType = (source: string): string => SOURCE_TYPES[source] || 'prensa';

export const useNewsData = (filters: NewsFilters, limit: number = 200) => {
  const [data, setData] = useState<NewsData>({
    articles: [],
    stats: { totalArticles: 0, sourceBreakdown: {}, categoryBreakdown: {}, recentCount: 0 },
    isLoading: true,
    isScraping: false,
    error: null,
    lastUpdate: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (filters.source && filters.source !== 'all') {
        params.set('source', filters.source);
      }
      if (filters.category && filters.category !== 'all') {
        params.set('category', filters.category);
      }
      if (filters.scope && filters.scope !== 'all') {
        params.set('scope', filters.scope);
      }

      const response = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.NEWS}?${params}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error('Error al cargar noticias');

      const result = await response.json();
      const articles: NewsArticle[] = Array.isArray(result) ? result : (result.articles || []);

      let filtered = articles;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = articles.filter(a =>
          a.title.toLowerCase().includes(search) ||
          (a.content && a.content.toLowerCase().includes(search))
        );
      }

      const sourceBreakdown: Record<string, number> = {};
      const categoryBreakdown: Record<string, number> = {};
      const now = Date.now();
      let recentCount = 0;

      for (const a of articles) {
        sourceBreakdown[a.source] = (sourceBreakdown[a.source] || 0) + 1;
        const cat = a.category || 'Sin categoría';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
        if (a.scraped_at) {
          const diff = now - new Date(a.scraped_at).getTime();
          if (diff < 24 * 60 * 60 * 1000) recentCount++;
        }
      }

      setData(prev => ({
        ...prev,
        articles: filtered,
        stats: {
          totalArticles: articles.length,
          sourceBreakdown,
          categoryBreakdown,
          recentCount,
        },
        isLoading: false,
        error: null,
        lastUpdate: new Date(),
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  }, [limit, filters.source, filters.category, filters.scope, filters.search]);

  const triggerScraping = useCallback(async (sources?: string[]) => {
    setData(prev => ({ ...prev, isScraping: true }));
    try {
      const body = sources ? { sources } : {};
      const response = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TRIGGER_NEWS}`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) throw new Error('Error al iniciar scraping');
      const result = await response.json();

      setTimeout(() => {
        fetchNews();
        setData(prev => ({ ...prev, isScraping: false }));
      }, 15000);

      return result;
    } catch (error) {
      setData(prev => ({ ...prev, isScraping: false }));
      throw error;
    }
  }, [fetchNews]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (filters.autoRefresh) {
      intervalRef.current = setInterval(fetchNews, filters.refreshInterval * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [filters.autoRefresh, filters.refreshInterval, fetchNews]);

  return { ...data, refetch: fetchNews, triggerScraping };
};
