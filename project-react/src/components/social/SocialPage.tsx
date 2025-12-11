import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SocialHeader } from './SocialHeader';
import { SocialTabs } from './SocialTabs';
import { SocialFeed } from './SocialFeed';
import { EngagementAnalysis } from './EngagementAnalysis';
import { InfluencerRanking } from './InfluencerRanking';
import { HashtagAnalysis } from './HashtagAnalysis';
import { ViralContent } from './ViralContent';
import { CompetitorAnalysis } from './CompetitorAnalysis';
import { SentimentDashboard } from './SentimentDashboard';
import { ContentCalendar } from './ContentCalendar';
import { AudienceInsights } from './AudienceInsights';
import { FakeNewsDetection } from './FakeNewsDetection';
import { CrisisMonitoring } from './CrisisMonitoring';
import { SocialListening } from './SocialListening';
import { useSocialData } from '../../hooks/useSocialData';
import { SocialFilters } from '../../types/social';

const initialFilters: SocialFilters = {
  platform: 'all',
  entity: 'all',
  region: 'all',
  dateRange: '7d',
  sentiment: 'all',
  contentType: 'all',
  keywords: [],
};

export const SocialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const [filters, setFilters] = useState<SocialFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { 
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
    refreshData
  } = useSocialData(filters);

  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [filters, activePlatform]);

  const handlePlatformChange = (platform: string) => {
    setActivePlatform(platform);
    setFilters(prev => ({ ...prev, platform }));
  };

  const handleFilterChange = (newFilters: Partial<SocialFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <SocialFeed posts={posts} isLoading={isLoading} filters={filters} />;
      case 'engagement':
        return <EngagementAnalysis metrics={metrics} isLoading={isLoading} filters={filters} />;
      case 'influencers':
        return <InfluencerRanking influencers={influencers} isLoading={isLoading} filters={filters} />;
      case 'hashtags':
        return <HashtagAnalysis hashtags={hashtags} isLoading={isLoading} filters={filters} />;
      case 'viral':
        return <ViralContent content={viralContent} isLoading={isLoading} filters={filters} />;
      case 'competitors':
        return <CompetitorAnalysis competitors={competitors} isLoading={isLoading} filters={filters} />;
      case 'sentiment':
        return <SentimentDashboard metrics={metrics} isLoading={isLoading} filters={filters} />;
      case 'calendar':
        return <ContentCalendar calendar={contentCalendar} isLoading={isLoading} filters={filters} />;
      case 'audience':
        return <AudienceInsights audience={audienceData} isLoading={isLoading} filters={filters} />;
      case 'fakenews':
        return <FakeNewsDetection posts={posts} isLoading={isLoading} filters={filters} />;
      case 'crisis':
        return <CrisisMonitoring alerts={crisisAlerts} isLoading={isLoading} filters={filters} />;
      case 'listening':
        return <SocialListening data={listeningData} isLoading={isLoading} filters={filters} />;
      default:
        return <SocialFeed posts={posts} isLoading={isLoading} filters={filters} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Filters */}
      <SocialHeader 
        filters={filters} 
        onFilterChange={handleFilterChange}
        activePlatform={activePlatform}
        onPlatformChange={handlePlatformChange}
        onRefresh={refreshData}
      />

      {/* Tabs Navigation */}
      <SocialTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        metrics={metrics}
      />

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </motion.div>
  );
};