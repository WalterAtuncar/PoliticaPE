import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';
import { 
  SocialPost, 
  SocialMetrics, 
  Influencer, 
  Hashtag, 
  ViralPost, 
  Competitor, 
  ContentEvent, 
  AudienceData, 
  CrisisAlert, 
  SocialListeningData,
  SocialFilters 
} from '../types/social';

const defaultFilters: SocialFilters = {
  platform: 'all',
  sentiment: 'all',
  timeRange: '7d',
  region: 'all',
  keywords: [],
  contentType: 'all',
  political_party: null,
  political_figure: null,
};

export const useSocialData = (initialFilters: Partial<SocialFilters> = {}) => {
  const [filters] = useState<SocialFilters>({ ...defaultFilters, ...initialFilters });
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [influencers] = useState<Influencer[]>([]);
  const [hashtags] = useState<Hashtag[]>([]);
  const [viralContent] = useState<ViralPost[]>([]);
  const [competitors] = useState<Competitor[]>([]);
  const [audienceData] = useState<AudienceData | null>(null);
  const [contentCalendar] = useState<ContentEvent[]>([]);
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([]);
  const [listeningData] = useState<SocialListeningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const fetchRealData = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SOCIAL}`);
      
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : [];
        
        if (items.length > 0) {
          const transformedPosts: SocialPost[] = items.map((item: Record<string, unknown>) => {
            const engagementMetrics = item.engagement_metrics as Record<string, unknown> | null;
            const likes = Number(engagementMetrics?.likes ?? 0);
            const comments = Number(engagementMetrics?.comments ?? 0);
            const shares = Number(engagementMetrics?.shares ?? 0);
            const reach = Number(engagementMetrics?.reach ?? 1000);
            const total = likes + comments + shares;
            const sentimentScore = Number(item.sentiment_score ?? 0);

            return {
              id: String(item.id),
              platform: String(item.platform ?? 'unknown'),
              content: String(item.content ?? ''),
              author: String(item.username ?? 'unknown'),
              handle: `@${String(item.username ?? 'unknown')}`,
              authorAvatar: '',
              timestamp: item.created_at ? new Date(String(item.created_at)) : new Date(),
              likes,
              comments,
              shares,
              engagementRate: reach > 0 ? parseFloat(((total / reach) * 100).toFixed(1)) : 0,
              sentiment: sentimentScore > 0.1 ? 'positive' : sentimentScore < -0.1 ? 'negative' : 'neutral',
              sentimentScore,
              region: String(item.region ?? 'Nacional'),
              hashtags: Array.isArray(item.hashtags) ? item.hashtags.map(String) : [],
              mentions: Array.isArray(item.mentions) ? item.mentions.map(String) : [],
              reach,
              impressions: reach * 1.5,
              isVerified: Boolean(item.is_verified),
              isViral: false,
              isFakeNews: false,
              fakeNewsScore: 0,
              emotions: [],
              userLiked: false,
            };
          });

          setPosts(transformedPosts);
          setHasData(true);

          const totalLikes = transformedPosts.reduce((sum, p) => sum + p.likes, 0);
          const totalComments = transformedPosts.reduce((sum, p) => sum + p.comments, 0);
          const totalShares = transformedPosts.reduce((sum, p) => sum + p.shares, 0);
          const avgEngagement = transformedPosts.reduce((sum, p) => sum + p.engagementRate, 0) / (transformedPosts.length || 1);

          const platformStats: Record<string, { likes: number; comments: number; shares: number }> = {};
          transformedPosts.forEach(post => {
            if (!platformStats[post.platform]) {
              platformStats[post.platform] = { likes: 0, comments: 0, shares: 0 };
            }
            platformStats[post.platform].likes += post.likes;
            platformStats[post.platform].comments += post.comments;
            platformStats[post.platform].shares += post.shares;
          });

          const engagementByPlatform = Object.entries(platformStats).map(([platform, stats]) => ({
            platform: platform.charAt(0).toUpperCase() + platform.slice(1),
            ...stats,
          }));

          setMetrics({
            overallEngagementRate: avgEngagement,
            engagementRateChange: 0,
            totalEngagements: totalLikes + totalComments + totalShares,
            engagementsChange: 0,
            totalReach: transformedPosts.reduce((sum, p) => sum + p.reach, 0),
            reachChange: 0,
            totalPosts: transformedPosts.length,
            postsChange: 0,
            engagementByPlatform,
            engagementByContentType: [],
            engagementOverTime: [],
            topPerformingContent: [],
            sentimentDistribution: [],
            averageSentiment: transformedPosts.reduce((sum, p) => sum + p.sentimentScore, 0) / (transformedPosts.length || 1),
            emotionsDetected: [],
            sentimentOverTime: [],
            sentimentByRegion: [],
            sentimentByDemographics: { age: [], nse: [] },
            sentimentDrivers: { positive: [], negative: [] },
          });

          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error fetching real social data:', error);
      return false;
    }
  };

  const fetchCrisisAlerts = async () => {
    try {
      const response = await fetch(`${API_CONFIG.SNIFFING_BASE_URL}/api/crisis-alerts`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCrisisAlerts(data.map((alert: Record<string, unknown>) => ({
            id: String(alert.id ?? ''),
            type: String(alert.type ?? 'reputational'),
            severity: String(alert.severity ?? 'low') as 'low' | 'medium' | 'high' | 'critical',
            title: String(alert.title ?? ''),
            description: String(alert.description ?? ''),
            detectedAt: new Date(String(alert.detected_at ?? new Date())),
            status: 'active' as const,
            affectedPlatforms: [],
            affectedRegions: [],
            sentimentImpact: 0,
            estimatedReach: 0,
            recommendations: [],
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching crisis alerts:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchRealData(),
        fetchCrisisAlerts(),
      ]);
      setIsLoading(false);
    };
    
    initializeData();
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchRealData(),
      fetchCrisisAlerts(),
    ]);
    setIsLoading(false);
  }, []);

  return {
    posts,
    metrics,
    influencers,
    hashtags,
    viralContent,
    competitors,
    audienceData,
    contentCalendar,
    crisisAlerts,
    listeningData,
    isLoading,
    hasData,
    refreshData,
  };
};
