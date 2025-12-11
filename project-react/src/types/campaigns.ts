export interface CampaignFilters {
  status: string;
  region: string;
  budget: string;
  performance: string;
  dateRange: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'review' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled';
  objective: 'sentiment' | 'awareness' | 'mobilization' | 'crisis_defense';
  targetRegions: string[];
  targetDemographics: {
    ageGroups: string[];
    nse: string[];
    gender: string[];
    politicalAffinity: string[];
  };
  budget: {
    total: number;
    allocated: {
      digital: number;
      traditional: number;
      territorial: number;
      contingency: number;
    };
    spent: number;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    milestones: CampaignMilestone[];
  };
  team: CampaignTeamMember[];
  assets: CampaignAsset[];
  performance: {
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    engagementRate: number;
    sentimentEvolution: number;
    mentionsGenerated: number;
    roi: number;
  };
  abTests: ABTest[];
  crisisProtocol: CrisisProtocol;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface CampaignMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  type: 'event' | 'content' | 'media' | 'meeting';
}

export interface CampaignTeamMember {
  id: string;
  name: string;
  role: 'coordinator' | 'community_manager' | 'pr_specialist' | 'territorial_coordinator' | 'analyst';
  email: string;
  avatar?: string;
  permissions: string[];
}

export interface CampaignAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'creative';
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  tags: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  targetRegions: string[];
  results?: ABTestResults;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  creative: string;
  message: string;
  trafficAllocation: number;
}

export interface ABTestResults {
  winner: string;
  confidence: number;
  metrics: {
    [variantId: string]: {
      impressions: number;
      clicks: number;
      conversions: number;
      engagementRate: number;
    };
  };
}

export interface CrisisProtocol {
  escalationMatrix: EscalationLevel[];
  responseTemplates: ResponseTemplate[];
  emergencyContacts: EmergencyContact[];
  monitoringKeywords: string[];
}

export interface EscalationLevel {
  level: number;
  name: string;
  criteria: string;
  responseTime: string;
  approvers: string[];
  actions: string[];
}

export interface ResponseTemplate {
  id: string;
  name: string;
  scenario: string;
  template: string;
  approvalRequired: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  availability: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  type: 'launch' | 'crisis_defense' | 'achievement_promotion' | 'counter_attack';
  defaultObjective: string;
  suggestedBudget: {
    digital: number;
    traditional: number;
    territorial: number;
    contingency: number;
  };
  timeline: number; // days
  requiredAssets: string[];
  targetDemographics: any;
  keyMessages: string[];
}

export interface ReachEstimate {
  totalReach: number;
  byRegion: { [region: string]: number };
  byDemographic: { [demographic: string]: number };
  confidence: number;
  basedOnHistoricalData: boolean;
}

export interface CompetitorCampaign {
  id: string;
  competitor: string;
  name: string;
  detectedAt: Date;
  regions: string[];
  estimatedBudget: number;
  reach: number;
  sentiment: number;
  keyMessages: string[];
  platforms: string[];
  status: 'active' | 'completed' | 'paused';
}