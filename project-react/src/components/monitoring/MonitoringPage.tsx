import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MonitoringHeader } from './MonitoringHeader';
import { SocialFeed } from './SocialFeed';
import { AlertsPanel } from './AlertsPanel';
import { MentionsCounter } from './MentionsCounter';
import { ActivityHeatmap } from './ActivityHeatmap';
import { TrendingHashtags } from './TrendingHashtags';
import { NewsStream } from './NewsStream';
import { SentimentMeter } from './SentimentMeter';
import { InfluencersRanking } from './InfluencersRanking';
import { EventDetection } from './EventDetection';
import { NotificationCenter } from './NotificationCenter';
import { ConnectionStatus } from './ConnectionStatus';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { MonitoringFilters } from '../../types/monitoring';

const initialFilters: MonitoringFilters = {
  platforms: ['twitter', 'facebook', 'instagram'],
  regions: ['all'],
  keywords: [],
  timeRange: '1h',
  autoRefresh: true,
  refreshRate: 10,
};

export const MonitoringPage: React.FC = () => {
  const [filters, setFilters] = useState<MonitoringFilters>(initialFilters);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const {
    socialPosts,
    alerts,
    mentions,
    hashtags,
    news,
    sentiment,
    influencers,
    events,
    isConnected,
    latency,
    lastUpdate
  } = useRealtimeData(filters);

  // Play notification sound for critical alerts
  useEffect(() => {
    if (soundEnabled && alerts.length > 0) {
      const criticalAlert = alerts.find(alert => alert.priority === 'critical');
      if (criticalAlert) {
        // Play notification sound (would be implemented with Web Audio API)
        console.log('🔊 Critical alert sound');
      }
    }
  }, [alerts, soundEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Controls */}
      <MonitoringHeader
        filters={filters}
        onFiltersChange={setFilters}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        soundEnabled={soundEnabled}
      />

      {/* Connection Status */}
      <ConnectionStatus
        isConnected={isConnected}
        latency={latency}
        lastUpdate={lastUpdate}
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Social Feed */}
        <div className="col-span-12 lg:col-span-4">
          <SocialFeed posts={socialPosts} filters={filters} />
        </div>

        {/* Center Column - Main Widgets */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Mentions Counter */}
          <MentionsCounter mentions={mentions} />
          
          {/* Activity Heatmap */}
          <ActivityHeatmap />
          
          {/* Trending Hashtags */}
          <TrendingHashtags hashtags={hashtags} />
          
          {/* News Stream */}
          <NewsStream news={news} />
        </div>

        {/* Right Column - Alerts & Analytics */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Alerts Panel */}
          <AlertsPanel alerts={alerts} />
          
          {/* Sentiment Meter */}
          <SentimentMeter sentiment={sentiment} />
          
          {/* Influencers Ranking */}
          <InfluencersRanking influencers={influencers} />
          
          {/* Event Detection */}
          <EventDetection events={events} />
        </div>
      </div>

      {/* Notification Center Modal */}
      {showNotifications && (
        <NotificationCenter
          alerts={alerts}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </motion.div>
  );
};