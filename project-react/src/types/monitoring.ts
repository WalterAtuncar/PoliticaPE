export interface MonitoringFilters {
  platforms: string[];
  regions: string[];
  keywords: string[];
  timeRange: string;
  autoRefresh: boolean;
  refreshRate: number;
}

export interface SocialPost {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram';
  content: string;
  author: string;
  authorAvatar: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  region: string;
  hashtags: string[];
  mentions: string[];
  reach: number;
  influence: number;
  isViral: boolean;
}

export interface Alert {
  id: string;
  type: 'crisis' | 'trend' | 'mention' | 'sentiment';
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  region: string;
  metrics?: {
    change: number;
    impact: number;
  };
}

export interface MentionData {
  id: string;
  name: string;
  party: string;
  count: number;
  trend: number;
  sentiment: number;
}

export interface HashtagData {
  id: string;
  tag: string;
  count: number;
  trend: number;
  sentiment: number;
  reach: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: Date;
  engagement: number;
  sentiment: number;
  impact: number;
  isBreaking: boolean;
  tags: string[];
}

export interface SentimentData {
  national: number;
  trend: number;
  regional: Array<{
    region: string;
    value: number;
  }>;
}

export interface InfluencerData {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  posts: number;
  mentions: number;
  engagement: number;
  influence: number;
  trend: number;
  recentActivity?: string;
}

export interface DetectedEvent {
  id: string;
  type: 'crisis' | 'opportunity' | 'viral' | 'anomaly';
  title: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  impact: number;
  velocity: number;
  keywords: string[];
  region: string;
  timestamp: Date;
}