import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnalyticsHeader } from './AnalyticsHeader';
import { AnalyticsTabs } from './AnalyticsTabs';
import { SentimentAnalysis } from './tabs/SentimentAnalysis';
import { EngagementMetrics } from './tabs/EngagementMetrics';
import { ShareOfVoice } from './tabs/ShareOfVoice';
import { GeographicIntelligence } from './tabs/GeographicIntelligence';
import { DemographicInsights } from './tabs/DemographicInsights';
import { TrendAnalysis } from './tabs/TrendAnalysis';

export interface AnalyticsFilters {
  timeRange: string;
  region: string;
  ageGroup: string;
  nse: string;
  gender: string;
}

const initialFilters: AnalyticsFilters = {
  timeRange: '30d',
  region: 'all',
  ageGroup: 'all',
  nse: 'all',
  gender: 'all',
};

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sentiment');
  const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sentiment':
        return <SentimentAnalysis filters={filters} />;
      case 'engagement':
        return <EngagementMetrics filters={filters} />;
      case 'share-of-voice':
        return <ShareOfVoice filters={filters} />;
      case 'geographic':
        return <GeographicIntelligence filters={filters} />;
      case 'demographic':
        return <DemographicInsights filters={filters} />;
      case 'trends':
        return <TrendAnalysis filters={filters} />;
      default:
        return <SentimentAnalysis filters={filters} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <AnalyticsHeader filters={filters} onFiltersChange={setFilters} />
      <AnalyticsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </motion.div>
  );
};