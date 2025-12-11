import React from 'react';
import { motion } from 'framer-motion';
import { X, BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Modal } from '../ui/Modal';
import { GeographicMetric } from '../../types/geographic';

interface RegionComparatorProps {
  selectedRegions: string[];
  metrics: GeographicMetric[];
  onClose: () => void;
}

export const RegionComparator: React.FC<RegionComparatorProps> = ({
  selectedRegions,
  metrics,
  onClose,
}) => {
  const selectedMetrics = metrics.filter(m => selectedRegions.includes(m.regionId));

  const comparisonData = selectedMetrics.map(metric => ({
    name: metric.name,
    sentiment: metric.sentiment,
    engagement: metric.engagement,
    mentions: metric.mentions / 1000, // Scale down for better visualization
    shareOfVoice: metric.shareOfVoice,
    participation: metric.participation,
  }));

  const radarData = [
    {
      metric: 'Sentiment',
      ...selectedMetrics.reduce((acc, metric, index) => ({
        ...acc,
        [`region${index}`]: (metric.sentiment + 1) * 50, // Normalize to 0-100
      }), {})
    },
    {
      metric: 'Engagement',
      ...selectedMetrics.reduce((acc, metric, index) => ({
        ...acc,
        [`region${index}`]: metric.engagement,
      }), {})
    },
    {
      metric: 'Share of Voice',
      ...selectedMetrics.reduce((acc, metric, index) => ({
        ...acc,
        [`region${index}`]: metric.shareOfVoice,
      }), {})
    },
    {
      metric: 'Participación',
      ...selectedMetrics.reduce((acc, metric, index) => ({
        ...acc,
        [`region${index}`]: metric.participation,
      }), {})
    },
  ];

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Comparador de Regiones"
      size="xl"
    >
      <div className="space-y-6">
        {/* Selected Regions Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedMetrics.map((metric, index) => (
            <motion.div
              key={metric.regionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {metric.name}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sentiment</span>
                  <span className={`font-medium ${
                    metric.sentiment > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {metric.sentiment > 0 ? '+' : ''}{metric.sentiment.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metric.engagement.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Menciones</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metric.mentions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Población</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(metric.population / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart Comparison */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Comparación de Métricas
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Bar dataKey="engagement" fill="#3B82F6" name="Engagement %" />
                <Bar dataKey="shareOfVoice" fill="#10B981" name="Share of Voice %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Análisis Multidimensional
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                {selectedMetrics.map((_, index) => (
                  <Radar
                    key={index}
                    name={selectedMetrics[index].name}
                    dataKey={`region${index}`}
                    stroke={colors[index]}
                    fill={colors[index]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Comparación Detallada
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                    Métrica
                  </th>
                  {selectedMetrics.map((metric) => (
                    <th key={metric.regionId} className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                      {metric.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Sentiment Score</td>
                  {selectedMetrics.map((metric) => (
                    <td key={metric.regionId} className={`py-2 px-3 font-medium ${
                      metric.sentiment > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {metric.sentiment > 0 ? '+' : ''}{metric.sentiment.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Engagement Rate</td>
                  {selectedMetrics.map((metric) => (
                    <td key={metric.regionId} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {metric.engagement.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Total Menciones</td>
                  {selectedMetrics.map((metric) => (
                    <td key={metric.regionId} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {metric.mentions.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Share of Voice</td>
                  {selectedMetrics.map((metric) => (
                    <td key={metric.regionId} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {metric.shareOfVoice.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Población</td>
                  {selectedMetrics.map((metric) => (
                    <td key={metric.regionId} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {(metric.population / 1000000).toFixed(1)}M
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};