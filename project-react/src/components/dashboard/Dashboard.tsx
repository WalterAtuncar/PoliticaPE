import React from 'react';
import { MetricCard } from './MetricCard';
import { TrendChart } from './TrendChart';
import { RealtimeAlerts } from './RealtimeAlerts';
import { GeographicMap } from './GeographicMap';
import { mockMetrics } from '../../data/mockData';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMetrics.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
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