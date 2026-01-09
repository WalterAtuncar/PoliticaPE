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
  isUsingMockData: boolean;
}

const mockSentimentData: SentimentData = {
  source_type: 'all',
  total_items: 9330,
  sentiment_distribution: {
    positive: 45,
    neutral: 30,
    negative: 25,
  },
  average_sentiment: 0.18,
  sentiment_trend: [
    { date: '01/12', positive: 42, neutral: 32, negative: 26, average: 0.12 },
    { date: '02/12', positive: 44, neutral: 31, negative: 25, average: 0.15 },
    { date: '03/12', positive: 45, neutral: 30, negative: 25, average: 0.18 },
    { date: '04/12', positive: 46, neutral: 29, negative: 25, average: 0.20 },
    { date: '05/12', positive: 45, neutral: 30, negative: 25, average: 0.18 },
  ],
};

const mockTrendsData: TrendData[] = [
  { keyword: 'Congreso', mentions: 2450, sentiment: 0.12, change: 15 },
  { keyword: 'Gobierno', mentions: 1890, sentiment: -0.08, change: -5 },
  { keyword: 'Economía', mentions: 1560, sentiment: 0.22, change: 28 },
  { keyword: 'Educación', mentions: 1230, sentiment: 0.35, change: 12 },
  { keyword: 'Salud', mentions: 980, sentiment: 0.18, change: -3 },
];

export const useAnalyticsData = (sourceType: string = 'news', periodDays: number = 7): AnalyticsData => {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

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
        setIsUsingMockData(false);
      } else {
        setSentiment(mockSentimentData);
        setIsUsingMockData(true);
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        if (trendsData.trends && trendsData.trends.length > 0) {
          setTrends(trendsData.trends);
        } else {
          setTrends(mockTrendsData);
        }
      } else {
        setTrends(mockTrendsData);
      }

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSentiment(mockSentimentData);
      setTrends(mockTrendsData);
      setIsUsingMockData(true);
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
    isUsingMockData,
  };
};
