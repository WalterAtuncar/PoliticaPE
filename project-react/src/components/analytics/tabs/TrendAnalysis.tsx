import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar, AlertTriangle, Target, Loader2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';
import { useTimeSeries, useTrendingTopics } from '../../../hooks/useAdvancedAnalytics';

interface TrendAnalysisProps {
  filters: AnalyticsFilters;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ filters }) => {
  const periodDays = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
  const { data: timeSeriesData, totalMentions, averageSentiment, isLoading: timeLoading } = useTimeSeries(periodDays);
  const { topics, isLoading: topicsLoading, hasData: hasTopics } = useTrendingTopics(periodDays, 10);

  const isLoading = timeLoading || topicsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando datos de tendencias...</span>
      </div>
    );
  }

  const trendDirection = averageSentiment > 0.05 ? 'Positiva' : averageSentiment < -0.05 ? 'Negativa' : 'Neutral';
  const trendColor = averageSentiment > 0.05 ? 'text-green-600' : averageSentiment < -0.05 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tendencia General
                </p>
                <p className={`text-2xl font-bold ${trendColor} dark:${trendColor.replace('600', '400')}`}>
                  {averageSentiment > 0 ? '↗' : averageSentiment < 0 ? '↘' : '→'} {trendDirection}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Sentiment: {averageSentiment > 0 ? '+' : ''}{averageSentiment.toFixed(2)}
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${trendColor.replace('text-', 'text-')}`} />
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
                  {totalMentions.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Últimos {periodDays} días
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
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
                  Temas Identificados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {topics.length}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Temas tendencia
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Período Analizado
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {periodDays}d
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Datos en tiempo real
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Time Series Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Evolución Temporal - Menciones y Sentiment
          </h3>
          {timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} domain={[-1, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mentions"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Menciones"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Sentiment"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No hay datos de series temporales disponibles
            </div>
          )}
        </Card>
      </motion.div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Temas Tendencia
          </h3>
          {hasTopics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.topic}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {topic.topic}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      topic.sentiment > 0 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : topic.sentiment < 0
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {topic.sentiment > 0 ? '+' : ''}{topic.sentiment.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Menciones</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {topic.count.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No hay temas tendencia disponibles para el período seleccionado
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
