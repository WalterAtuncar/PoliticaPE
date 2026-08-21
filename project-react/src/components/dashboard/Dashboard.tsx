import React from 'react';
import { MetricCard } from './MetricCard';
import { TrendChart } from './TrendChart';
import { AlertsPanel } from './AlertsPanel';
import { GeographicMap } from './GeographicMap';
import { useDashboardData } from '../../hooks/useDashboardData';

export const Dashboard: React.FC = () => {
  const { metrics, isLoading, hasData } = useDashboardData();

  return (
    <div className="space-y-8">
      {!isLoading && !hasData && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-300">
          Aún no hay datos recolectados. Ejecuta el scraping desde Configuración para poblar el panel.
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
        <AlertsPanel />
      </div>

      {/* Geographic Analysis */}
      <GeographicMap />
    </div>
  );
};