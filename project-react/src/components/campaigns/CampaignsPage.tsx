import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CampaignsHeader } from './CampaignsHeader';
import { CampaignsList } from './CampaignsList';
import { CampaignWizard } from './CampaignWizard';
import { CampaignDetails } from './CampaignDetails';
import { CampaignPerformance } from './CampaignPerformance';
import { AssetLibrary } from './AssetLibrary';
import { CompetitorMonitor } from './CompetitorMonitor';
import { CampaignFilters, Campaign } from '../../types/campaigns';
import { useCampaigns } from '../../hooks/useCampaigns';

const initialFilters: CampaignFilters = {
  status: 'all',
  region: 'all',
  budget: 'all',
  performance: 'all',
  dateRange: '30d',
};

export const CampaignsPage: React.FC = () => {
  const [filters, setFilters] = useState<CampaignFilters>(initialFilters);
  const [activeView, setActiveView] = useState<'list' | 'wizard' | 'details' | 'performance' | 'assets' | 'competitors'>('list');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const {
    campaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    getPerformanceMetrics,
    getReachEstimate,
    competitorCampaigns
  } = useCampaigns(filters);

  const handleCreateCampaign = () => {
    setShowWizard(true);
    setActiveView('wizard');
  };

  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setActiveView('details');
  };

  const handleViewPerformance = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setActiveView('performance');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'wizard':
        return (
          <CampaignWizard
            onClose={() => {
              setShowWizard(false);
              setActiveView('list');
            }}
            onSave={createCampaign}
            getReachEstimate={getReachEstimate}
          />
        );
      case 'details':
        return selectedCampaign ? (
          <CampaignDetails
            campaign={selectedCampaign}
            onBack={() => setActiveView('list')}
            onUpdate={updateCampaign}
            onViewPerformance={() => setActiveView('performance')}
          />
        ) : null;
      case 'performance':
        return selectedCampaign ? (
          <CampaignPerformance
            campaign={selectedCampaign}
            onBack={() => setActiveView('details')}
            metrics={getPerformanceMetrics(selectedCampaign.id)}
          />
        ) : null;
      case 'assets':
        return (
          <AssetLibrary
            onBack={() => setActiveView('list')}
            campaigns={campaigns}
          />
        );
      case 'competitors':
        return (
          <CompetitorMonitor
            onBack={() => setActiveView('list')}
            competitorCampaigns={competitorCampaigns}
          />
        );
      default:
        return (
          <CampaignsList
            campaigns={campaigns}
            isLoading={isLoading}
            onCampaignSelect={handleCampaignSelect}
            onViewPerformance={handleViewPerformance}
            onDuplicate={duplicateCampaign}
            onDelete={deleteCampaign}
            onUpdate={updateCampaign}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <CampaignsHeader
        filters={filters}
        onFiltersChange={setFilters}
        onCreateCampaign={handleCreateCampaign}
        onViewAssets={() => setActiveView('assets')}
        onViewCompetitors={() => setActiveView('competitors')}
        activeView={activeView}
        onViewChange={setActiveView}
        campaignsCount={campaigns.length}
      />

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </motion.div>
  );
};