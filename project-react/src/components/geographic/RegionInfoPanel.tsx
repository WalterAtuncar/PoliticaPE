import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, MessageSquare, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui/Card';
import { GeographicMetric, GeographicFilters } from '../../types/geographic';

interface RegionInfoPanelProps {
  selectedRegion: string | null;
  metrics: GeographicMetric[];
  filters: GeographicFilters;
}

const mockTrendData = [
  { date: '01/12', sentiment: 0.12, engagement: 6.8 },
  { date: '02/12', sentiment: 0.15, engagement: 7.2 },
  { date: '03/12', sentiment: 0.18, engagement: 7.5 },
  { date: '04/12', sentiment: 0.22, engagement: 8.1 },
  { date: '05/12', sentiment: 0.25, engagement: 8.4 },
];

export const RegionInfoPanel: React.FC<RegionInfoPanelProps> = ({
  selectedRegion,
  metrics,
  filters,
}) => {
  const regionData = selectedRegion ? metrics.find(m => m.regionId === selectedRegion) : null;

  if (!regionData) {
    return (
      <Card glass className="p-6 h-[600px] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Selecciona una región en el mapa para ver información detallada
          </p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Region Header */}
      <Card glass className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {regionData.name}
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Población</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {regionData.population.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Votantes</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {regionData.voters.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card glass className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sentiment</p>
              <p className={`text-lg font-bold ${
                regionData.sentiment > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {regionData.sentiment > 0 ? '+' : ''}{regionData.sentiment.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card glass className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {regionData.engagement.toFixed(1)}%
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card glass className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Menciones</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {regionData.mentions.toLocaleString()}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card glass className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Share of Voice</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {regionData.shareOfVoice.toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card glass className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Tendencia Temporal
        </h4>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={mockTrendData}>
            <XAxis dataKey="date" fontSize={10} stroke="#6B7280" />
            <YAxis fontSize={10} stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Demographics */}
      <Card glass className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Demografía
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Edad promedio</span>
            <span className="font-medium text-gray-900 dark:text-white">32 años</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">NSE predominante</span>
            <span className="font-medium text-gray-900 dark:text-white">C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Participación 2021</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {regionData.participation.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Political Context */}
      <Card glass className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Contexto Político
        </h4>
        <div className="space-y-2 text-xs">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="font-medium text-blue-800 dark:text-blue-400">Tendencia Actual</p>
            <p className="text-blue-600 dark:text-blue-300">
              Incremento en menciones sobre políticas económicas
            </p>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <p className="font-medium text-yellow-800 dark:text-yellow-400">Recomendación</p>
            <p className="text-yellow-600 dark:text-yellow-300">
              Enfocar campaña en temas de empleo y desarrollo local
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};