import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PoliticalMetric } from '../../types';
import { Card } from '../ui/Card';

interface MetricCardProps {
  metric: PoliticalMetric;
  index: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, index }) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatValue = (value: number) => {
    if (value > 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value > 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card glass hover className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {metric.name}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {formatValue(metric.value)}
              {metric.id === '1' || metric.id === '3' ? '%' : ''}
            </p>
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {metric.period}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            {getTrendIcon()}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};