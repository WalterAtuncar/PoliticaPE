import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SocialHeader } from './SocialHeader';
import { SocialTabs } from './SocialTabs';
import { SocialFeed } from './SocialFeed';
import { InfluencerRanking } from './InfluencerRanking';
import { HashtagAnalysis } from './HashtagAnalysis';
import { SentimentDashboard } from './SentimentDashboard';
import { AlertsPanel } from '../dashboard/AlertsPanel';
import { useSocialData } from '../../hooks/useSocialData';
import { SocialFilters } from '../../types/social';
import { Card } from '../ui/Card';
import { MessageSquare } from 'lucide-react';

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
    totalInWindow,
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
      case 'influencers':
        return <InfluencerRanking influencers={influencers} isLoading={isLoading} filters={filters} />;
      case 'hashtags':
        return <HashtagAnalysis hashtags={hashtags} isLoading={isLoading} filters={filters} />;
      case 'sentiment':
        return <SentimentDashboard metrics={metrics} isLoading={isLoading} filters={filters} />;
      case 'crisis':
        return <AlertsPanel />;
      default:
        return <SocialFeed posts={posts} isLoading={isLoading} filters={filters} />;
    }
  };

  // Sin publicaciones en la ventana municipal no hay nada honesto que mostrar en feed,
  // influencers, hashtags ni sentimiento: se explica el estado en vez de pintar la etapa anterior.
  if (!isLoading && totalInWindow === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card glass className="p-10 text-center max-w-2xl mx-auto">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Monitoreo de redes — pendiente de activación
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            El módulo está construido: feed unificado, ranking de influencia, hashtags y sentimiento
            por plataforma. Se activa al configurar las claves de X (twitterapi.io) y YouTube en el
            servidor; desde ese momento los posts de la campaña municipal aparecen aquí automáticamente.
          </p>
          <p className="text-xs text-gray-400 mt-3">
            Sin publicaciones desde el 1 de julio de 2026 en la base.
          </p>
        </Card>

        <AlertsPanel />
      </motion.div>
    );
  }

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