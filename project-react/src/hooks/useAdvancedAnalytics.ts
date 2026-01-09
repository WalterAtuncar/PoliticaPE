import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

interface TimeSeriesData {
  date: string;
  mentions: number;
  sentiment: number;
  events: number;
}

interface PlatformData {
  platform: string;
  posts: number;
  likes: number;
  shares: number;
  comments: number;
  reach: number;
}

interface PartyData {
  party: string;
  mentions: number;
  share: number;
  color: string;
}

interface HashtagData {
  hashtag: string;
  mentions: number;
  sentiment: number;
}

interface FigureData {
  name: string;
  mentions: number;
  sentiment: number;
  trend: string;
}

interface TopPost {
  id: string;
  content: string;
  author: string;
  platform: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    total: number;
  };
  timestamp: string | null;
  sentiment: number | null;
}

interface TrendingTopic {
  topic: string;
  count: number;
  sentiment: number;
}

interface RegionalData {
  region: string;
  posts: number;
  engagement: number;
}

export function useTimeSeries(days: number = 30) {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [totalMentions, setTotalMentions] = useState(0);
  const [averageSentiment, setAverageSentiment] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/time-series?days=${days}`);
        if (!response.ok) throw new Error('Failed to fetch time series data');
        const result = await response.json();
        setData(result.time_series || []);
        setTotalMentions(result.total_mentions || 0);
        setAverageSentiment(result.average_sentiment || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [days]);

  return { data, totalMentions, averageSentiment, isLoading, error, hasData: data.length > 0 };
}

export function usePlatformBreakdown(days: number = 30) {
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/platform-breakdown?days=${days}`);
        if (!response.ok) throw new Error('Failed to fetch platform breakdown');
        const result = await response.json();
        setPlatforms(result.platforms || []);
        setTotalPosts(result.total_posts || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPlatforms([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [days]);

  return { platforms, totalPosts, isLoading, error, hasData: platforms.length > 0 };
}

export function useShareOfVoice(days: number = 30) {
  const [parties, setParties] = useState<PartyData[]>([]);
  const [hashtags, setHashtags] = useState<HashtagData[]>([]);
  const [figures, setFigures] = useState<FigureData[]>([]);
  const [totalMentions, setTotalMentions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/share-of-voice?days=${days}`);
        if (!response.ok) throw new Error('Failed to fetch share of voice');
        const result = await response.json();
        setParties(result.parties || []);
        setHashtags(result.hashtags || []);
        setFigures(result.figures || []);
        setTotalMentions(result.total_mentions || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setParties([]);
        setHashtags([]);
        setFigures([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [days]);

  return { parties, hashtags, figures, totalMentions, isLoading, error, hasData: parties.length > 0 };
}

export function useTopPosts(days: number = 7, limit: number = 10) {
  const [posts, setPosts] = useState<TopPost[]>([]);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/top-posts?days=${days}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch top posts');
        const result = await response.json();
        setPosts(result.posts || []);
        setTotalAnalyzed(result.total_analyzed || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [days, limit]);

  return { posts, totalAnalyzed, isLoading, error, hasData: posts.length > 0 };
}

export function useTrendingTopics(days: number = 7, limit: number = 20) {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/trending-topics?days=${days}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch trending topics');
        const result = await response.json();
        setTopics(result.trending_topics || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [days, limit]);

  return { topics, isLoading, error, hasData: topics.length > 0 };
}

export function useRegionalEngagement(days: number = 30) {
  const [regions, setRegions] = useState<RegionalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/regional-engagement?days=${days}`);
        if (!response.ok) throw new Error('Failed to fetch regional engagement');
        const result = await response.json();
        setRegions(result.regions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRegions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [days]);

  return { regions, isLoading, error, hasData: regions.length > 0 };
}

export function useEngagementSummary(days: number = 7) {
  const [engagement, setEngagement] = useState<{
    total_posts: number;
    posts_with_metrics: number;
    average_engagement: { likes: number; shares: number; comments: number; views: number };
    total_engagement: { likes: number; shares: number; comments: number; views: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/engagement?days=${days}`);
        if (!response.ok) throw new Error('Failed to fetch engagement summary');
        const result = await response.json();
        setEngagement(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setEngagement(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [days]);

  return { engagement, isLoading, error, hasData: engagement !== null && engagement.total_posts > 0 };
}
