import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';
import { 
  SocialPost, 
  Alert, 
  MentionData, 
  HashtagData, 
  NewsItem, 
  SentimentData, 
  InfluencerData, 
  DetectedEvent,
  MonitoringFilters 
} from '../types/monitoring';

interface RealtimeData {
  socialPosts: SocialPost[];
  alerts: Alert[];
  mentions: MentionData[];
  hashtags: HashtagData[];
  news: NewsItem[];
  sentiment: SentimentData;
  influencers: InfluencerData[];
  events: DetectedEvent[];
  isConnected: boolean;
  latency: number;
  lastUpdate: Date;
}

const defaultMentions: MentionData[] = [
  { id: '1', name: 'Dina Boluarte', party: 'Independiente', count: 2100, trend: -15, sentiment: -0.15 },
  { id: '2', name: 'Keiko Fujimori', party: 'Fuerza Popular', count: 1850, trend: -8, sentiment: -0.22 },
  { id: '3', name: 'Congreso', party: 'Institucional', count: 1200, trend: 25, sentiment: 0.08 },
];

const defaultHashtags: HashtagData[] = [
  { id: '1', tag: 'PeruPolitica', count: 1250, trend: 45, sentiment: 0.15, reach: 85000 },
  { id: '2', tag: 'Congreso', count: 980, trend: 22, sentiment: -0.08, reach: 65000 },
];

const defaultSentiment: SentimentData = {
  national: 0.18,
  trend: 0.08,
  regional: [
    { region: 'Lima', value: 0.15 },
    { region: 'Arequipa', value: 0.28 },
    { region: 'Cusco', value: 0.34 },
  ],
};

const defaultInfluencers: InfluencerData[] = [
  {
    id: '1',
    name: 'Analista Politico',
    handle: '@analistaperu',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
    followers: 125000,
    posts: 45,
    mentions: 890,
    engagement: 12.5,
    influence: 9,
    trend: 15,
    recentActivity: 'Comentó sobre la coyuntura política',
  },
];

const defaultEvents: DetectedEvent[] = [];

export const useRealtimeData = (filters: MonitoringFilters): RealtimeData => {
  const [data, setData] = useState<RealtimeData>({
    socialPosts: [],
    alerts: [],
    mentions: defaultMentions,
    hashtags: defaultHashtags,
    news: [],
    sentiment: defaultSentiment,
    influencers: defaultInfluencers,
    events: defaultEvents,
    isConnected: false,
    latency: 0,
    lastUpdate: new Date(),
  });

  const fetchBackendData = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      const [statsRes, sentimentRes, newsRes, metricsRes, crisisRes] = await Promise.allSettled([
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.STATS}`),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SENTIMENT}`),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.NEWS}?limit=10`),
        fetch(`${API_CONFIG.SNIFFING_BASE_URL}${ENDPOINTS.METRICS}`),
        fetch(`${API_CONFIG.SNIFFING_BASE_URL}/api/crisis-alerts`),
      ]);

      const latency = Date.now() - startTime;

      let newsItems: NewsItem[] = [];
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const newsData = await newsRes.value.json();
        newsItems = (newsData.articles || []).map((article: any) => ({
          id: article.id || String(Math.random()),
          title: article.title,
          summary: article.content?.substring(0, 150) || '',
          source: article.source,
          timestamp: new Date(article.published_at),
          engagement: article.engagement || Math.floor(Math.random() * 1000),
          sentiment: article.sentiment_score || 0,
          impact: Math.floor(Math.random() * 10) + 1,
          isBreaking: false,
          tags: [article.category || 'Política'],
        }));
      }

      let updatedSentiment = defaultSentiment;
      if (sentimentRes.status === 'fulfilled' && sentimentRes.value.ok) {
        const sentimentData = await sentimentRes.value.json();
        updatedSentiment = {
          national: sentimentData.overall_sentiment || 0.18,
          trend: sentimentData.trend || 0.08,
          regional: sentimentData.by_region?.map((r: any) => ({
            region: r.region,
            value: r.sentiment,
          })) || defaultSentiment.regional,
        };
      }

      let newAlerts: Alert[] = [];
      if (crisisRes.status === 'fulfilled' && crisisRes.value.ok) {
        const crisisData = await crisisRes.value.json();
        newAlerts = (crisisData.alerts || []).map((alert: any) => ({
          id: alert.stream_id || String(Math.random()),
          type: 'crisis' as const,
          title: 'Alerta de Crisis',
          message: alert.content?.substring(0, 100) || 'Crisis detectada',
          priority: 'high' as const,
          timestamp: new Date(alert.detected_at),
          region: alert.detected_region || 'Nacional',
          metrics: { change: 0, impact: 8 },
        }));
      }

      setData(prev => ({
        ...prev,
        news: newsItems.length > 0 ? newsItems : prev.news,
        sentiment: updatedSentiment,
        alerts: newAlerts.length > 0 ? newAlerts : prev.alerts,
        isConnected: true,
        latency,
        lastUpdate: new Date(),
      }));

    } catch (error) {
      console.error('Error fetching realtime data:', error);
      setData(prev => ({ ...prev, isConnected: false }));
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
    setData(prev => ({ ...prev, isConnected: true }));
    
    if (!filters.autoRefresh) return;
    
    const interval = setInterval(fetchBackendData, filters.refreshRate * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [filters.autoRefresh, filters.refreshRate, fetchBackendData]);

  return data;
};
