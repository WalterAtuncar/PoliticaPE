import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../config/api';

interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentTrend {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  average: number;
}

interface SentimentData {
  source_type: string;
  total_items: number;
  sentiment_distribution: SentimentDistribution;
  average_sentiment: number;
  sentiment_trend: SentimentTrend[];
}

interface TrendData {
  keyword: string;
  mentions: number;
  sentiment: number;
  change: number;
}

interface AnalyticsData {
  sentiment: SentimentData | null;
  trends: TrendData[];
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

export const useAnalyticsData = (sourceType: string = 'news', periodDays: number = 7): AnalyticsData => {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [sentimentRes, trendsRes] = await Promise.all([
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/sentiment?source_type=${sourceType}&period_days=${periodDays}`),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/trends?period_days=${periodDays}`),
      ]);

      if (!sentimentRes.ok) {
        throw new Error(`Sentiment API error: ${sentimentRes.status}`);
      }

      const sentimentData = await sentimentRes.json();
      
      if (sentimentData.total_items > 0) {
        setSentiment(sentimentData);
        setHasData(true);
      } else {
        setSentiment(null);
        setHasData(false);
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        if (trendsData.trends && trendsData.trends.length > 0) {
          setTrends(trendsData.trends);
        } else {
          setTrends([]);
        }
      } else {
        setTrends([]);
      }

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSentiment(null);
      setTrends([]);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  }, [sourceType, periodDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    sentiment,
    trends,
    isLoading,
    error,
    hasData,
  };
};
