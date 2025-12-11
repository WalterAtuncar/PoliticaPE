export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PoliticalMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface GeographicData {
  ubigeo: string;
  region: string;
  province?: string;
  district?: string;
  sentiment: SentimentData;
  engagement: number;
  mentions: number;
}

export interface SocialPost {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram';
  content: string;
  author: string;
  engagement: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: Date;
  region: string;
}

export interface Alert {
  id: string;
  type: 'crisis' | 'trend' | 'mention' | 'sentiment';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  isRead: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  roi: number;
  startDate: Date;
  endDate: Date;
  metrics: PoliticalMetric[];
}

// Export all settings types
export * from './campaigns';
export * from './data';
export * from './demographics';
export * from './geographic';
export * from './monitoring';
export * from './recommendations';
export * from './social';
export * from './settings';