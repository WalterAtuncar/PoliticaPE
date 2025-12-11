import React from 'react';
import { MetricCard } from './MetricCard';
import { TrendChart } from './TrendChart';
import { RealtimeAlerts } from './RealtimeAlerts';
import { GeographicMap } from './GeographicMap';
import { useDashboardData } from '../../hooks/useDashboardData';

export const Dashboard: React.FC = () => {
  const { metrics, isLoading, isUsingMockData } = useDashboardData();

  return (
    <div className="space-y-8">
      {isUsingMockData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-700 dark:text-yellow-300">
          Mostrando datos de demostración. Los datos reales se cargarán cuando estén disponibles.
        </div>
      )}
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-32" />
          ))
        ) : (
          metrics.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))
        )}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendChart />
        <RealtimeAlerts />
      </div>

      {/* Geographic Analysis */}
      <GeographicMap />
    </div>
  );
};