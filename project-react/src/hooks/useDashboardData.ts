import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';
import { PoliticalMetric } from '../types';

interface DashboardStats {
  total_news_articles: number;
  total_social_posts: number;
  total_government_data: number;
  total_surveys: number;
  recent_news_24h: number;
  recent_social_24h: number;
  recent_government_24h: number;
}

interface SentimentData {
  overall_sentiment: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  trend: number;
}

interface DashboardData {
  metrics: PoliticalMetric[];
  isLoading: boolean;
  error: string | null;
  isUsingMockData: boolean;
}

const mockMetrics: PoliticalMetric[] = [
  {
    id: '1',
    name: 'Sentimiento Positivo',
    value: 68,
    change: 5.2,
    trend: 'up',
    period: 'Últimas 24h',
  },
  {
    id: '2',
    name: 'Menciones Sociales',
    value: 12847,
    change: -2.1,
    trend: 'down',
    period: 'Esta semana',
  },
  {
    id: '3',
    name: 'Engagement Político',
    value: 8.9,
    change: 12.5,
    trend: 'up',
    period: 'Este mes',
  },
  {
    id: '4',
    name: 'Alcance Total',
    value: 245680,
    change: 8.7,
    trend: 'up',
    period: 'Últimas 24h',
  },
];

export const useDashboardData = (): DashboardData => {
  const [data, setData] = useState<DashboardData>({
    metrics: mockMetrics,
    isLoading: true,
    error: null,
    isUsingMockData: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const [statsRes, sentimentRes] = await Promise.allSettled([
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.STATS}`),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SENTIMENT}?source_type=news`),
      ]);

      let stats: DashboardStats | null = null;
      let sentiment: SentimentData | null = null;

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        stats = await statsRes.value.json();
      }

      if (sentimentRes.status === 'fulfilled' && sentimentRes.value.ok) {
        sentiment = await sentimentRes.value.json();
      }

      const hasRealData = stats && (
        stats.total_news_articles > 0 || 
        stats.total_social_posts > 0 || 
        stats.total_government_data > 0
      );

      if (hasRealData && stats) {
        const realMetrics: PoliticalMetric[] = [
          {
            id: '1',
            name: 'Sentimiento Positivo',
            value: sentiment?.positive_percentage ?? 68,
            change: sentiment?.trend ?? 5.2,
            trend: (sentiment?.trend ?? 0) >= 0 ? 'up' : 'down',
            period: 'Últimas 24h',
          },
          {
            id: '2',
            name: 'Menciones Sociales',
            value: stats.total_social_posts + stats.total_news_articles,
            change: stats.total_social_posts > 0 && stats.recent_social_24h > 0 
              ? ((stats.recent_social_24h / stats.total_social_posts) * 100) 
              : 0,
            trend: stats.recent_social_24h > 0 ? 'up' : 'stable',
            period: 'Esta semana',
          },
          {
            id: '3',
            name: 'Noticias Analizadas',
            value: stats.total_news_articles,
            change: stats.recent_news_24h,
            trend: stats.recent_news_24h > 0 ? 'up' : 'stable',
            period: 'Este mes',
          },
          {
            id: '4',
            name: 'Datos Gubernamentales',
            value: stats.total_government_data,
            change: stats.recent_government_24h,
            trend: stats.recent_government_24h > 0 ? 'up' : 'stable',
            period: 'Últimas 24h',
          },
        ];

        setData({
          metrics: realMetrics,
          isLoading: false,
          error: null,
          isUsingMockData: false,
        });
      } else {
        setData({
          metrics: mockMetrics,
          isLoading: false,
          error: null,
          isUsingMockData: true,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData({
        metrics: mockMetrics,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isUsingMockData: true,
      });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data;
};
