import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';

interface SentimentAnalysisProps {
  filters: AnalyticsFilters;
}

const sentimentData = [
  { name: 'Positivo', value: 45, color: '#10B981' },
  { name: 'Neutral', value: 30, color: '#6B7280' },
  { name: 'Negativo', value: 25, color: '#EF4444' },
];

const regionSentimentData = [
  { region: 'Lima', sentiment: 0.15, mentions: 4520, trend: 'up' },
  { region: 'Arequipa', sentiment: 0.28, mentions: 1180, trend: 'up' },
  { region: 'Cusco', sentiment: 0.34, mentions: 1250, trend: 'stable' },
  { region: 'La Libertad', sentiment: -0.12, mentions: 980, trend: 'down' },
  { region: 'Piura', sentiment: 0.08, mentions: 750, trend: 'up' },
  { region: 'Puno', sentiment: -0.05, mentions: 650, trend: 'down' },
];

const timeSeriesData = [
  { date: '01/12', Lima: 0.12, Arequipa: 0.25, Cusco: 0.30, LaLibertad: -0.08 },
  { date: '02/12', Lima: 0.18, Arequipa: 0.22, Cusco: 0.32, LaLibertad: -0.12 },
  { date: '03/12', Lima: 0.15, Arequipa: 0.28, Cusco: 0.35, LaLibertad: -0.15 },
  { date: '04/12', Lima: 0.20, Arequipa: 0.30, Cusco: 0.33, LaLibertad: -0.10 },
  { date: '05/12', Lima: 0.15, Arequipa: 0.28, Cusco: 0.34, LaLibertad: -0.12 },
];

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ filters }) => {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-green-600 dark:text-green-400';
    if (sentiment > 0) return 'text-green-500 dark:text-green-300';
    if (sentiment > -0.2) return 'text-red-500 dark:text-red-300';
    return 'text-red-600 dark:text-red-400';
  };

  const getSentimentBg = (sentiment: number) => {
    if (sentiment > 0.2) return 'bg-green-100 dark:bg-green-900/20';
    if (sentiment > 0) return 'bg-green-50 dark:bg-green-900/10';
    if (sentiment > -0.2) return 'bg-red-50 dark:bg-red-900/10';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sentiment Score Promedio
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +0.18
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Rango: -1.0 a +1.0
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Menciones
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  9,330
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +12.5% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Regiones Activas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  24
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  De 25 departamentos
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribución de Sentimientos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Sentiment Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tendencias por Región
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Lima"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Arequipa"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Cusco"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="LaLibertad"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Regional Ranking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Ranking Regional por Sentiment Score
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Región
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Sentiment Score
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Menciones
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Tendencia
                  </th>
                </tr>
              </thead>
              <tbody>
                {regionSentimentData
                  .sort((a, b) => b.sentiment - a.sentiment)
                  .map((region, index) => (
                    <motion.tr
                      key={region.region}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getSentimentBg(region.sentiment)}`} />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {region.region}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-bold ${getSentimentColor(region.sentiment)}`}>
                          {region.sentiment > 0 ? '+' : ''}{region.sentiment.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {region.mentions.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        {getTrendIcon(region.trend)}
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};