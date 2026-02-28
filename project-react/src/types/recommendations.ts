export interface PoliticalFigure {
  id: string;
  full_name: string;
  display_name: string;
  nickname?: string;
  photo_url?: string;
  party_name?: string;
  current_position?: string;
  region?: string;
  search_keywords: string[];
  social_accounts: SocialAccount[];
  is_active: boolean;
  monitoring_priority: 'high' | 'medium' | 'low';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface SocialAccount {
  platform: string;
  handle: string;
  profile_url?: string;
}

export interface RecommendationsFilters {
  region: string;
  demographic: string;
  priority: string;
  category: string;
  status: string;
  confidenceMin: number;
  budgetMax: number;
}

export interface AIRecommendation {
  id: string;
  figure_id?: string;
  title: string;
  description: string;
  category: 'immediate_opportunities' | 'regional_strengthening' | 'territorial_recovery' | 'demographic_expansion';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'generated' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  targetRegion: string;
  targetDemographic: string;
  identifiedWeakness: string;
  recommendedAction: string;
  estimatedBudget: {
    min: number;
    max: number;
  };
  expectedTimeline: string;
  projectedROI: number;
  aiConfidence: number;
  resourcesNeeded: string[];
  successKPIs: string[];
  riskFactors: string[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  notes?: string;
  userRating?: number;
  implementationProgress?: number;
}

export interface ROIMetrics {
  totalRecommendations: number;
  implementedRecommendations: number;
  averageROI: number;
  successRate: number;
  totalBudgetAllocated: number;
  totalBudgetSpent: number;
  averageImplementationTime: number;
}

export interface ImpactRegion {
  regionId: string;
  regionName: string;
  potentialImpact: number;
  recommendationsCount: number;
  averageConfidence: number;
}

export interface FigureAnalysisContext {
  figure: {
    full_name: string;
    display_name: string;
    party_name: string;
    current_position: string;
    region: string;
    social_accounts: SocialAccount[];
  };
  metrics: {
    total_mentions: number;
    sentiment_average: number;
    sentiment_trend: 'improving' | 'declining' | 'stable';
    total_engagement: number;
    top_platforms: { platform: string; mentions: number }[];
    top_regions: { region: string; mentions: number }[];
    news_mentions: number;
    recent_posts: {
      platform: string;
      content: string;
      sentiment: number;
      engagement: number;
      date: string;
    }[];
  };
}
