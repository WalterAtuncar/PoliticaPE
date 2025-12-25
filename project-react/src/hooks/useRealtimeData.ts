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

const defaultSocialPosts: SocialPost[] = [
  {
    id: '1',
    platform: 'twitter',
    content: 'Análisis del panorama político actual en el Perú. La situación económica sigue siendo tema central en la agenda.',
    author: 'Analista Político',
    authorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
    timestamp: new Date(),
    likes: 245,
    comments: 89,
    shares: 45,
    engagement: 8.5,
    sentiment: 'neutral',
    region: 'Lima',
    hashtags: ['PeruPolitica', 'Economia'],
    mentions: ['congreso'],
    reach: 15000,
    influence: 7,
    isViral: false,
  },
  {
    id: '2',
    platform: 'facebook',
    content: 'Nueva propuesta legislativa genera debate en redes sociales. Ciudadanos expresan opiniones diversas.',
    author: 'Observatorio Político',
    authorAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop&crop=face',
    timestamp: new Date(Date.now() - 300000),
    likes: 567,
    comments: 234,
    shares: 123,
    engagement: 12.3,
    sentiment: 'positive',
    region: 'Arequipa',
    hashtags: ['Congreso', 'Debate'],
    mentions: ['legislacion'],
    reach: 45000,
    influence: 8,
    isViral: true,
  },
  {
    id: '3',
    platform: 'instagram',
    content: 'Encuesta revela tendencias de opinión pública sobre gestión gubernamental.',
    author: 'Datos Perú',
    authorAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=100&h=100&fit=crop&crop=face',
    timestamp: new Date(Date.now() - 600000),
    likes: 890,
    comments: 156,
    shares: 78,
    engagement: 6.7,
    sentiment: 'negative',
    region: 'Cusco',
    hashtags: ['Encuesta', 'Opinion'],
    mentions: ['gobierno'],
    reach: 28000,
    influence: 6,
    isViral: false,
  },
];

export const useRealtimeData = (filters: MonitoringFilters): RealtimeData => {
  const [data, setData] = useState<RealtimeData>({
    socialPosts: [],
    alerts: [],
    mentions: [],
    hashtags: [],
    news: [],
    sentiment: defaultSentiment, // Keep sentiment default structure for null safety
    influencers: [],
    events: [],
    isConnected: false,
    latency: 0,
    lastUpdate: new Date(),
  });

  const fetchBackendData = useCallback(async () => {
    const startTime = Date.now();

    try {
      const [statsRes, sentimentRes, newsRes, metricsRes, crisisRes, socialRes, recentRes] = await Promise.allSettled([
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.STATS}`),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SENTIMENT}`),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.NEWS}?limit=10`),
        fetch(`${API_CONFIG.SNIFFING_BASE_URL}${ENDPOINTS.METRICS}`),
        fetch(`${API_CONFIG.SNIFFING_BASE_URL}/api/crisis-alerts`),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SOCIAL}?limit=10`),
        fetch(`${API_CONFIG.SNIFFING_BASE_URL}/api/recent?limit=10`),
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

      const platformOptions: Array<'twitter' | 'facebook' | 'instagram'> = ['twitter', 'facebook', 'instagram'];
      const normalizePlatform = (p: string | undefined | null): 'twitter' | 'facebook' | 'instagram' => {
        if (!p) return 'twitter';
        const lower = p.toLowerCase();
        if (lower === 'twitter' || lower === 'x') return 'twitter';
        if (lower === 'facebook' || lower === 'fb') return 'facebook';
        if (lower === 'instagram' || lower === 'ig') return 'instagram';
        return platformOptions[Math.floor(Math.random() * platformOptions.length)];
      };

      const normalizeSentiment = (score: number | undefined | null): 'positive' | 'negative' | 'neutral' => {
        if (score === undefined || score === null) return 'neutral';
        if (score > 0.1) return 'positive';
        if (score < -0.1) return 'negative';
        return 'neutral';
      };

      let socialPosts: SocialPost[] = [];
      if (socialRes.status === 'fulfilled' && socialRes.value.ok) {
        const socialData = await socialRes.value.json();
        socialPosts = (socialData.posts || [])
          .filter((post: any) => post && (post.content || post.text))
          .map((post: any) => {
            const postId = post.id || String(Date.now() + Math.random());
            return {
              id: postId,
              platform: normalizePlatform(post.platform),
              content: post.content || post.text || '',
              author: post.author || post.username || 'Usuario',
              authorAvatar: post.avatar || `https://i.pravatar.cc/100?u=${postId}`,
              timestamp: new Date(post.created_at || post.timestamp || Date.now()),
              likes: typeof post.likes === 'number' ? post.likes : Math.floor(Math.random() * 500) + 10,
              comments: typeof post.comments === 'number' ? post.comments : Math.floor(Math.random() * 100) + 5,
              shares: typeof post.shares === 'number' ? post.shares : Math.floor(Math.random() * 50) + 2,
              engagement: typeof post.engagement_rate === 'number' ? post.engagement_rate : Math.random() * 10 + 1,
              sentiment: normalizeSentiment(post.sentiment_score),
              region: post.region || 'Lima',
              hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
              mentions: Array.isArray(post.mentions) ? post.mentions : [],
              reach: typeof post.reach === 'number' ? post.reach : Math.floor(Math.random() * 20000) + 1000,
              influence: typeof post.influence === 'number' ? post.influence : Math.floor(Math.random() * 10) + 1,
              isViral: Boolean(post.is_viral) || (typeof post.engagement === 'number' && post.engagement > 1000),
            };
          });
      }

      if (recentRes.status === 'fulfilled' && recentRes.value.ok) {
        const recentData = await recentRes.value.json();
        const recentPosts: SocialPost[] = (recentData.recent_items || [])
          .filter((item: any) => item && item.content)
          .map((item: any) => {
            const itemId = item.stream_id || String(Date.now() + Math.random());
            return {
              id: itemId,
              platform: normalizePlatform(item.platform),
              content: item.content || '',
              author: (item.political_entities && item.political_entities[0]) || 'Análisis en Vivo',
              authorAvatar: `https://i.pravatar.cc/100?u=${itemId}`,
              timestamp: new Date(item.message_timestamp || Date.now()),
              likes: Math.floor(Math.random() * 500) + 10,
              comments: Math.floor(Math.random() * 100) + 5,
              shares: Math.floor(Math.random() * 50) + 2,
              engagement: Math.random() * 10 + 1,
              sentiment: normalizeSentiment(item.realtime_sentiment),
              region: item.detected_region || 'Nacional',
              hashtags: Array.isArray(item.detected_keywords) ? item.detected_keywords : [],
              mentions: Array.isArray(item.political_entities) ? item.political_entities : [],
              reach: Math.floor(Math.random() * 20000) + 1000,
              influence: Math.floor(Math.random() * 10) + 1,
              isViral: Boolean(item.is_trending),
            };
          });
        socialPosts = [...recentPosts, ...socialPosts];
      }

      setData(prev => ({
        ...prev,
        news: newsItems,
        sentiment: updatedSentiment,
        alerts: newAlerts,
        socialPosts: socialPosts,
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
