import { ReactNode } from 'react';

export interface SocialFilters {
  platform: string;
  entity: string;
  region: string;
  dateRange: string;
  sentiment: string;
  contentType: string;
  keywords: string[];
}

export interface SocialPost {
  id: string;
  platform: string;
  content: string;
  author: string;
  handle?: string;
  authorAvatar: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  region: string;
  hashtags?: string[];
  mentions?: string[];
  reach: number;
  impressions: number;
  clicks?: number;
  isVerified?: boolean;
  isViral?: boolean;
  isFakeNews?: boolean;
  fakeNewsScore?: number;
  fakeNewsCategories?: string[];
  fakeNewsElements?: string[];
  factChecking?: {
    claim: string;
    verification: string;
    source?: string;
  }[];
  emotions?: string[];
  media?: {
    type: 'image' | 'video';
    url: string;
  }[];
  userLiked?: boolean;
}

export interface SocialMetrics {
  overallEngagementRate: number;
  engagementRateChange: number;
  totalEngagements: number;
  engagementsChange: number;
  totalReach: number;
  reachChange: number;
  totalPosts: number;
  postsChange: number;
  engagementByPlatform: {
    platform: string;
    likes: number;
    comments: number;
    shares: number;
  }[];
  engagementByContentType: {
    name: string;
    value: number;
  }[];
  engagementOverTime: {
    date: string;
    twitter: number;
    facebook: number;
    instagram: number;
    tiktok: number;
    youtube: number;
  }[];
  topPerformingContent: {
    id: string;
    platform: string;
    author: string;
    content: string;
    date: Date;
    likes: number;
    engagementRate: number;
  }[];
  sentimentDistribution: {
    name: string;
    value: number;
  }[];
  averageSentiment: number;
  emotionsDetected: {
    name: string;
    value: number;
  }[];
  sentimentOverTime: {
    date: string;
    sentiment: number;
  }[];
  sentimentByRegion: {
    region: string;
    sentiment: number;
  }[];
  sentimentByDemographics: {
    age: {
      group: string;
      sentiment: number;
    }[];
    nse: {
      group: string;
      sentiment: number;
    }[];
  };
  sentimentDrivers: {
    positive: {
      topic: string;
      impact: number;
    }[];
    negative: {
      topic: string;
      impact: number;
    }[];
  };
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  mainPlatform: string;
  followers: number;
  engagementRate: number;
  postsCount: number;
  influenceScore: number;
  politicalLean: 'left' | 'center_left' | 'center' | 'center_right' | 'right';
  topics: string[];
  recentActivity?: string;
  estimatedReach: number;
  mainAudience: string;
  location: string;
  growthTrend: number;
}

export interface Hashtag {
  id: string;
  name: string;
  volume: number;
  growthRate: number;
  engagementRate: number;
  sentiment: number;
  platforms: string[];
  volumeOverTime: {
    date: string;
    volume: number;
  }[];
  platformDistribution: {
    platform: string;
    volume: number;
  }[];
  relatedHashtags: {
    name: string;
    coOccurrenceRate: number;
  }[];
  relatedEvents: {
    name: string;
    date: string;
    description: string;
  }[];
}

export interface ViralPost extends SocialPost {
  viralityScore: number;
  viralityReason: string;
  viralityFactors: {
    name: string;
    impact: number;
  }[];
  demographics: {
    age: {
      group: string;
      percentage: number;
    }[];
    gender: {
      group: string;
      percentage: number;
    }[];
  };
  strategicRecommendations: string[];
}

export interface Competitor {
  id: string;
  name: string;
  type: string;
  followers: number;
  engagementRate: number;
  postFrequency: number;
  shareOfVoice: number;
  trend: number;
  followerGrowth: number;
  engagementGrowth: number;
  postGrowth: number;
  performanceOverTime: {
    date: string;
    engagement: number;
    shareOfVoice: number;
  }[];
  contentStrategy: {
    contentTypes: {
      type: string;
      percentage: number;
    }[];
    topics: {
      topic: string;
      percentage: number;
    }[];
  };
  topContent: {
    text: string;
    date: string;
    likes: number;
    shares: number;
    engagementRate: number;
  }[];
  insights: string[];
}

export interface ContentEvent {
  id: string;
  title: string;
  platform: string;
  contentType: string;
  content: string;
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published' | 'pending_approval' | 'rejected';
  tags?: string[];
  media?: string;
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  publishedAt?: Date;
}

export interface AudienceData {
  totalFollowers: number;
  followerGrowth: number;
  engagementRate: number;
  engagementGrowth: number;
  averageReach: number;
  reachGrowth: number;
  averageSentiment: number;
  sentimentGrowth: number;
  demographics: {
    ageGender: {
      age: string;
      male: number;
      female: number;
    }[];
    nse: {
      name: string;
      value: number;
    }[];
    geographic: {
      region: string;
      followers: number;
      percentage: number;
      engagement: number;
      sentiment: number;
    }[];
  };
  growthOverTime: {
    date: string;
    followers: number;
    engagement: number;
  }[];
  interests: {
    topic: string;
    percentage: number;
  }[];
  politicalAffinity: {
    ideology: {
      name: string;
      value: number;
    }[];
    parties: {
      name: string;
      percentage: number;
      color: string;
    }[];
  };
}

export interface CrisisAlert {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'monitoring' | 'resolved' | 'archived';
  detectedAt: Date;
  region: string;
  platform: string;
  keywords: string[];
  metrics: {
    volumeChange: number;
    timeWindow: string;
    sentiment: number;
    sentimentChange: number;
    reach: number;
    velocity: number;
  };
  responseProtocol?: {
    escalationLevel: string;
    responseTime: string;
    responsible: string;
    recommendedActions: string[];
  };
}

export interface SocialListeningData {
  mentionVolumeOverTime: {
    date: string;
    volume: number;
  }[];
  sentimentOverTime: {
    date: string;
    sentiment: number;
  }[];
  monitoredKeywords: {
    id: string;
    name: string;
    mentions: number;
    trend: number;
    sentiment: number;
    alerts: number;
    relatedTerms: string[];
    platformDistribution: {
      name: string;
      value: number;
    }[];
    sentimentByRegion: {
      region: string;
      sentiment: number;
    }[];
    recentMentions: {
      platform: string;
      author: string;
      text: string;
      date: string;
      likes: number;
      comments: number;
      sentiment: number;
    }[];
  }[];
}