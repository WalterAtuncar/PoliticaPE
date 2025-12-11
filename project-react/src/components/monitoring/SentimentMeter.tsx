import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { SentimentData } from '../../types/monitoring';

interface SentimentMeterProps {
  sentiment: SentimentData;
}

export const SentimentMeter: React.FC<SentimentMeterProps> = ({ sentiment }) => {
  const getSentimentColor = (value: number) => {
    if (value > 0.2) return '#10b981'; // Green
    if (value > -0.2) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getSentimentLabel = (value: number) => {
    if (value > 0.2) return 'Positivo';
    if (value > -0.2) return 'Neutral';
    return 'Negativo';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0.05) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -0.05) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  // Convert sentiment (-1 to 1) to gauge angle (-90 to 90 degrees)
  const gaugeAngle = sentiment.national * 90;
  
  // Convert sentiment to percentage for progress bar (0 to 100)
  const sentimentPercentage = ((sentiment.national + 1) / 2) * 100;

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sentiment Nacional
        </h3>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Tiempo real
          </span>
        </div>
      </div>

      {/* Gauge Chart */}
      <div className="relative mb-6">
        <div className="w-32 h-32 mx-auto relative">
          {/* Gauge Background */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(156, 163, 175, 0.3)"
              strokeWidth="8"
              strokeDasharray="126 126"
              strokeDashoffset="63"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={getSentimentColor(sentiment.national)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="126 126"
              initial={{ strokeDashoffset: 63 }}
              animate={{ 
                strokeDashoffset: 63 - (sentimentPercentage / 100) * 126 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          
          {/* Gauge Needle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-1 h-12 bg-gray-800 dark:bg-white origin-bottom"
              style={{ transformOrigin: '50% 100%' }}
              initial={{ rotate: 0 }}
              animate={{ rotate: gaugeAngle }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          {/* Center Value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold`} style={{ color: getSentimentColor(sentiment.national) }}>
                {sentiment.national > 0 ? '+' : ''}{sentiment.national.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {getSentimentLabel(sentiment.national)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Breakdown */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Por Región
        </h4>
        {sentiment.regional.map((region, index) => (
          <motion.div
            key={region.region}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 bg-white/30 dark:bg-gray-800/30 rounded"
          >
            <span className="text-sm text-gray-900 dark:text-white">
              {region.region}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: getSentimentColor(region.value) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${((region.value + 1) / 2) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              <span 
                className="text-sm font-medium w-12 text-right"
                style={{ color: getSentimentColor(region.value) }}
              >
                {region.value > 0 ? '+' : ''}{region.value.toFixed(2)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trend Analysis */}
      <div className="pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Tendencia (24h)
          </span>
          <div className="flex items-center space-x-2">
            {getTrendIcon(sentiment.trend)}
            <span className={`text-sm font-medium ${
              sentiment.trend > 0.05 ? 'text-green-600 dark:text-green-400' :
              sentiment.trend < -0.05 ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {sentiment.trend > 0 ? '+' : ''}{sentiment.trend.toFixed(3)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};