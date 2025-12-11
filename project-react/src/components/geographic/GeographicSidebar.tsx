import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, BarChart3, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GeographicFilters, GeographicMetric } from '../../types/geographic';

interface GeographicSidebarProps {
  filters: GeographicFilters;
  onFiltersChange: (filters: GeographicFilters) => void;
  metrics: GeographicMetric[];
  selectedRegion: string | null;
  onRegionSelect: (regionId: string) => void;
  onShowComparator: () => void;
}

export const GeographicSidebar: React.FC<GeographicSidebarProps> = ({
  filters,
  onFiltersChange,
  metrics,
  selectedRegion,
  onRegionSelect,
  onShowComparator,
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'sentiment' | 'engagement' | 'mentions'>('sentiment');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedMetrics = [...metrics].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'sentiment':
        aValue = a.sentiment;
        bValue = b.sentiment;
        break;
      case 'engagement':
        aValue = a.engagement;
        bValue = b.engagement;
        break;
      case 'mentions':
        aValue = a.mentions;
        bValue = b.mentions;
        break;
      default:
        aValue = a.sentiment;
        bValue = b.sentiment;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

  const getTrendIcon = (trend: number) => {
    if (trend > 0.05) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -0.05) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-green-600 dark:text-green-400';
    if (sentiment > 0) return 'text-green-500 dark:text-green-300';
    if (sentiment > -0.2) return 'text-red-500 dark:text-red-300';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card glass className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resumen Nacional
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Regiones Activas</span>
            <span className="font-medium text-gray-900 dark:text-white">24/25</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sentiment Promedio</span>
            <span className="font-medium text-green-600 dark:text-green-400">+0.18</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Menciones</span>
            <span className="font-medium text-gray-900 dark:text-white">125.4K</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Engagement Promedio</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">7.2%</span>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card glass className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ranking Regional
          </h3>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded px-2 py-1"
            >
              <option value="sentiment">Sentiment</option>
              <option value="engagement">Engagement</option>
              <option value="mentions">Menciones</option>
              <option value="name">Nombre</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedMetrics.slice(0, 10).map((metric, index) => (
            <motion.div
              key={metric.regionId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onRegionSelect(metric.regionId)}
              className={`
                p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]
                ${selectedRegion === metric.regionId 
                  ? 'bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-600' 
                  : 'bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {metric.name}
                </span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Sentiment</span>
                  <p className={`font-medium ${getSentimentColor(metric.sentiment)}`}>
                    {metric.sentiment > 0 ? '+' : ''}{metric.sentiment.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {metric.engagement.toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Comparator */}
      {filters.selectedRegions.length > 1 && (
        <Card glass className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Regiones Seleccionadas
            </h3>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
              {filters.selectedRegions.length}
            </span>
          </div>
          <Button
            onClick={onShowComparator}
            variant="primary"
            size="sm"
            className="w-full"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Comparar Regiones
          </Button>
        </Card>
      )}

      {/* Alerts */}
      <Card glass className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Alertas Geográficas
        </h3>
        <div className="space-y-2">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
            <p className="font-medium text-red-800 dark:text-red-400">La Libertad</p>
            <p className="text-red-600 dark:text-red-300">Caída significativa en sentiment (-15%)</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs">
            <p className="font-medium text-green-800 dark:text-green-400">Cusco</p>
            <p className="text-green-600 dark:text-green-300">Incremento en engagement (+22%)</p>
          </div>
        </div>
      </Card>
    </div>
  );
};