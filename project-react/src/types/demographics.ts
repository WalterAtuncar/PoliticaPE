export interface DemographicFilters {
  region: string;
  ageGroup: string;
  nse: string;
  gender: string;
  education: string;
  zone: string;
  timeRange: string;
}

export interface RegionData {
  id: string;
  name: string;
  population: number;
  populationDensity: number;
  averageAge: number;
  genderRatio: number;
  predominantNSE: string;
  urbanPercentage: number;
  higherEducationPercentage: number;
  politicalSentiment: number;
  politicalEngagement: number;
  electoralParticipation: number;
  nseIndex: number;
  educationIndex: number;
}

export interface DemographicData {
  totalPopulation: number;
  regionName: string;
  averageAge: number;
  genderRatio: number;
  predominantNSE: string;
  urbanPercentage: number;
  higherEducationPercentage: number;
  electoralParticipation: number;
  populationByAge: {
    ageGroup: string;
    male: number;
    female: number;
    malePolitical: number;
    femalePolitical: number;
  }[];
  regions: RegionData[];
  geoJson: any;
  timelineData: {
    year: string;
    urbanPercentage: number;
    participation: number;
    engagement: number;
    sentiment: number;
  }[];
  trends: {
    urbanizationChange: number;
    agingRate: number;
    educationChange: number;
    sentimentChange: number;
    engagementChange: number;
    participationChange: number;
    analysis: string;
  };
}

export interface DemographicSegment {
  id: string;
  name: string;
  population: number;
  averageAge: number;
  urbanPercentage: number;
  educationIndex: number;
  nseIndex: number;
  sentiment: number;
  engagement: number;
  participation: number;
  influence: number;
  characteristics: string[];
  keyTopics: string[];
  preferredChannels: string[];
  strategicRecommendation: string;
}

export interface DemographicSegmentationData {
  totalPopulation: number;
  segments: DemographicSegment[];
  regions: {
    id: string;
    name: string;
  }[];
}

export interface DemographicInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'trend' | 'risk';
  priority: 'high' | 'medium' | 'low';
  region: string;
  segment: string;
  tags: string[];
  updatedAt: string;
  isSpotlight?: boolean;
  growthPotential?: number;
  riskFactors?: string[];
  recommendation?: string;
  actionItems?: string[];
}

export interface DemographicInsightsData {
  insights: DemographicInsight[];
  regions: {
    id: string;
    name: string;
  }[];
}

export interface RegionComparisonData {
  politicalMetrics: {
    name: string;
    [regionId: string]: number | string;
  }[];
  demographicProfile: {
    attribute: string;
    [regionId: string]: number | string;
  }[];
  strategicInsights: {
    text: string;
    type: 'opportunity' | 'trend' | 'risk';
  }[];
}

export interface DemographicScenario {
  id: string;
  name: string;
  timeframe: number;
  modelConfidence: number;
  projectedPopulation: number;
  parameters: {
    urbanizationChange: number;
    educationChange: number;
    ageStructureChange: number;
    migrationRate: number;
  };
  demographicChanges: {
    description: string;
    impact: 'positive' | 'neutral' | 'negative';
  }[];
  politicalProjection: {
    year: string;
    participation: number;
    engagement: number;
    sentiment: number;
  }[];
  electoralImpact: string;
  segmentImpact: {
    segment: string;
    currentEngagement: number;
    projectedEngagement: number;
  }[];
  strategicRecommendation: string;
}