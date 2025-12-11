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