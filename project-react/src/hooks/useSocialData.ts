import { useState, useEffect, useCallback, useMemo } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';
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

export const useSocialData = (filters: SocialFilters) => {
  const [allPosts, setAllPosts] = useState<SocialPost[]>([]);
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

  const getAvatarUrl = (author: string, platform: string) => {
    const name = author && author !== '' ? author : platform;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=96&bold=true`;
  };

  const transformItem = (item: Record<string, unknown>): SocialPost => {
    const engagementMetrics = item.engagement_metrics as Record<string, unknown> | null;
    const likes = Number(engagementMetrics?.likes ?? 0);
    const commentsCount = Number(engagementMetrics?.comments ?? 0);
    const shares = Number(engagementMetrics?.shares ?? 0);
    const views = Number(engagementMetrics?.views ?? 0);
    const reach = views > 0 ? views : Math.max(likes + commentsCount + shares, 100);
    const total = likes + commentsCount + shares;
    const sentimentScore = Number(item.sentiment_score ?? 0);
    const authorName = String(item.author ?? '').trim();
    const platform = String(item.platform ?? 'unknown');
    const displayAuthor = authorName || platform.charAt(0).toUpperCase() + platform.slice(1);

    return {
      id: String(item.id),
      platform,
      content: String(item.content ?? ''),
      author: displayAuthor,
      handle: `@${displayAuthor.toLowerCase().replace(/\s+/g, '')}`,
      authorAvatar: getAvatarUrl(displayAuthor, platform),
      timestamp: item.created_at ? new Date(String(item.created_at)) : (item.scraped_at ? new Date(String(item.scraped_at)) : new Date()),
      likes,
      comments: commentsCount,
      shares,
      engagementRate: reach > 0 ? parseFloat(((total / reach) * 100).toFixed(1)) : 0,
      sentiment: sentimentScore > 0.1 ? 'positive' : sentimentScore < -0.1 ? 'negative' : 'neutral',
      sentimentScore,
      region: String(item.region ?? 'Nacional'),
      hashtags: Array.isArray(item.hashtags) ? item.hashtags.map(String) : [],
      mentions: Array.isArray(item.mentions) ? item.mentions.map(String) : [],
      reach,
      impressions: Math.round(reach * 1.5),
      isVerified: Boolean(item.is_verified),
      isViral: false,
      isFakeNews: false,
      fakeNewsScore: 0,
      emotions: [],
      userLiked: false,
    };
  };

  const filterPosts = useCallback((all: SocialPost[], currentFilters: SocialFilters) => {
    let filtered = [...all];

    if (currentFilters.platform && currentFilters.platform !== 'all') {
      filtered = filtered.filter(p => p.platform === currentFilters.platform);
    }

    if (currentFilters.sentiment && currentFilters.sentiment !== 'all') {
      filtered = filtered.filter(p => p.sentiment === currentFilters.sentiment);
    }

    if (currentFilters.region && currentFilters.region !== 'all') {
      filtered = filtered.filter(p => p.region.toLowerCase().includes(currentFilters.region.toLowerCase()));
    }

    if (currentFilters.keywords && currentFilters.keywords.length > 0) {
      const kws = currentFilters.keywords.filter(k => k.trim());
      if (kws.length > 0) {
        filtered = filtered.filter(p =>
          kws.some(kw => p.content.toLowerCase().includes(kw.toLowerCase()))
        );
      }
    }

    return filtered;
  }, []);

  const posts = useMemo(() => filterPosts(allPosts, filters), [allPosts, filters, filterPosts]);

  const metrics = useMemo((): SocialMetrics | null => {
    if (allPosts.length === 0) return null;
    const postsData = posts;
    const totalLikes = postsData.reduce((sum, p) => sum + p.likes, 0);
    const totalComments = postsData.reduce((sum, p) => sum + p.comments, 0);
    const totalShares = postsData.reduce((sum, p) => sum + p.shares, 0);
    const avgEngagement = postsData.reduce((sum, p) => sum + p.engagementRate, 0) / (postsData.length || 1);

    const platformStats: Record<string, { likes: number; comments: number; shares: number }> = {};
    postsData.forEach(post => {
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

    return {
      overallEngagementRate: avgEngagement,
      engagementRateChange: 0,
      totalEngagements: totalLikes + totalComments + totalShares,
      engagementsChange: 0,
      totalReach: postsData.reduce((sum, p) => sum + p.reach, 0),
      reachChange: 0,
      totalPosts: postsData.length,
      postsChange: 0,
      engagementByPlatform,
      engagementByContentType: [],
      engagementOverTime: [],
      topPerformingContent: [],
      sentimentDistribution: [],
      averageSentiment: postsData.reduce((sum, p) => sum + p.sentimentScore, 0) / (postsData.length || 1),
      emotionsDetected: [],
      sentimentOverTime: [],
      sentimentByRegion: [],
      sentimentByDemographics: { age: [], nse: [] },
      sentimentDrivers: { positive: [], negative: [] },
    };
  }, [posts, allPosts.length]);

  const fetchRealData = async (): Promise<boolean> => {
    try {
      const url = `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SOCIAL}?limit=500`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : [];
        
        if (items.length > 0) {
          const transformedPosts: SocialPost[] = items.map((item: Record<string, unknown>) => transformItem(item));
          setAllPosts(transformedPosts);
          setHasData(true);
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
      const response = await fetch(`${API_CONFIG.SNIFFING_BASE_URL}/api/crisis-alerts`, { headers: getAuthHeaders() });
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
