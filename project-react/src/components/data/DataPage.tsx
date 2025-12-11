import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DataHeader } from "./DataHeader";
import { DataTabs } from "./DataTabs";
import { DatabaseOverview } from "./DatabaseOverview";
import { DataSources } from "./DataSources";
import { ETLPipelines } from "./ETLPipelines";
import { DataQuality } from "./DataQuality";
import { DataLineage } from "./DataLineage";
import { BackupSystem } from "./BackupSystem";
import { NotificationCenter } from "./NotificationCenter";
import { DataFilters } from '../../types/data';
import { useDataManagement } from '../../hooks/useDataManagement';

const initialFilters: DataFilters = {
  schema: 'all',
  timeRange: '24h',
  status: 'all',
  severity: 'all',
  volume: 'all',
  search: '',
};

export const DataPage: React.FC = () => {
  const [filters, setFilters] = useState<DataFilters>(initialFilters);
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'etl' | 'quality' | 'lineage' | 'backup'>('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const {
    databaseMetrics,
    schemas,
    tables,
    dataSources,
    etlPipelines,
    alerts,
    dataQualityMetrics,
    backups,
    dataLineage,
    isLoading,
    isRefreshing,
    refreshData,
  } = useDataManagement(filters);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DatabaseOverview
            metrics={databaseMetrics}
            schemas={schemas}
            tables={tables}
            alerts={alerts}
            isLoading={isLoading}
          />
        );
      case 'sources':
        return (
          <DataSources
            sources={dataSources}
            isLoading={isLoading}
          />
        );
      case 'etl':
        return (
          <ETLPipelines
            pipelines={etlPipelines}
            isLoading={isLoading}
          />
        );
      case 'quality':
        return (
          <DataQuality
            metrics={dataQualityMetrics}
            isLoading={isLoading}
          />
        );
      case 'lineage':
        return (
          <DataLineage
            dataLineage={dataLineage}
            isLoading={isLoading}
          />
        );
      case 'backup':
        return (
          <BackupSystem
            backups={backups}
            isLoading={isLoading}
          />
        );
      default:
        return (
          <DatabaseOverview
            metrics={databaseMetrics}
            schemas={schemas}
            tables={tables}
            alerts={alerts}
            isLoading={isLoading}
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
      {/* Header with Filters */}
      <DataHeader
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
      />

      {/* Tabs Navigation */}
      <DataTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertsCount={alerts.filter(a => a.status === 'active').length}
        onShowNotifications={() => setShowNotifications(true)}
      />

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderContent()}
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