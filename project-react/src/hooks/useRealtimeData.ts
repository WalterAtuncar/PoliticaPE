import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';
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


const defaultSentiment: SentimentData = {
  national: 0.18,
  trend: 0.08,
  regional: [
    { region: 'Lima', value: 0.15 },
    { region: 'Arequipa', value: 0.28 },
    { region: 'Cusco', value: 0.34 },
  ],
};


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
      const headers = getAuthHeaders();
      const [, sentimentRes, newsRes, , crisisRes, socialRes, recentRes] = await Promise.allSettled([
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.STATS}`, { headers }),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SENTIMENT}?source_type=news`, { headers }),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.NEWS}?limit=10`, { headers }),
        fetch(`${API_CONFIG.SNIFFING_BASE_URL}${ENDPOINTS.METRICS}`, { headers }),
        fetch(`${API_CONFIG.SNIFFING_BASE_URL}/api/crisis-alerts`, { headers }),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SOCIAL}?limit=10`, { headers }),
        fetch(`${API_CONFIG.SNIFFING_BASE_URL}/api/recent?limit=10`, { headers }),
      ]);

      const latency = Date.now() - startTime;

      let newsItems: NewsItem[] = [];
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const newsData = await newsRes.value.json();
        const newsArray = Array.isArray(newsData) ? newsData : (newsData.articles || []);
        newsItems = newsArray.map((article: any) => ({
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
        const socialArray = Array.isArray(socialData) ? socialData : (socialData.posts || []);
        socialPosts = socialArray
          .filter((post: any) => post && (post.content || post.text))
          .map((post: any) => {
            const metrics = post.engagement_metrics || {};
            const postId = post.id || String(Date.now() + Math.random());
            const likes = metrics.likes ?? post.likes ?? Math.floor(Math.random() * 500) + 10;
            const comments = metrics.comments ?? post.comments ?? Math.floor(Math.random() * 100) + 5;
            const shares = metrics.shares ?? post.shares ?? Math.floor(Math.random() * 50) + 2;
            return {
              id: postId,
              platform: normalizePlatform(post.platform),
              content: post.content || post.text || '',
              author: post.author || post.username || 'Usuario',
              authorAvatar: post.avatar || `https://i.pravatar.cc/100?u=${postId}`,
              timestamp: new Date(post.created_at || post.timestamp || Date.now()),
              likes,
              comments,
              shares,
              engagement: typeof post.engagement_rate === 'number' ? post.engagement_rate : Math.random() * 10 + 1,
              sentiment: normalizeSentiment(post.sentiment_score),
              region: post.geographic_location || post.region || 'Lima',
              hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
              mentions: Array.isArray(post.mentions) ? post.mentions : [],
              reach: typeof post.reach === 'number' ? post.reach : Math.floor(Math.random() * 20000) + 1000,
              influence: typeof post.influence === 'number' ? post.influence : Math.floor(Math.random() * 10) + 1,
              isViral: Boolean(post.is_viral) || (likes + comments + shares > 1000),
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
