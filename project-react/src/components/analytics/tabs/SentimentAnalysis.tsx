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
import { TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';

interface SentimentAnalysisProps {
  filters: AnalyticsFilters;
}


export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ filters }) => {
  const periodDays = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
  const { sentiment, isLoading, isUsingMockData } = useAnalyticsData('news', periodDays);

  const sentimentData = sentiment ? [
    { name: 'Positivo', value: sentiment.sentiment_distribution.positive, color: '#10B981' },
    { name: 'Neutral', value: sentiment.sentiment_distribution.neutral, color: '#6B7280' },
    { name: 'Negativo', value: sentiment.sentiment_distribution.negative, color: '#EF4444' },
  ] : [];

  const timeSeriesData = sentiment?.sentiment_trend?.map(t => ({
    date: t.date,
    Positivo: t.positive,
    Neutral: t.neutral,
    Negativo: t.negative,
  })) ?? [
    { date: '01/12', Positivo: 42, Neutral: 32, Negativo: 26 },
    { date: '02/12', Positivo: 44, Neutral: 31, Negativo: 25 },
    { date: '03/12', Positivo: 45, Neutral: 30, Negativo: 25 },
    { date: '04/12', Positivo: 46, Neutral: 29, Negativo: 25 },
    { date: '05/12', Positivo: 45, Neutral: 30, Negativo: 25 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando datos...</span>
      </div>
    );
  }

  const averageSentiment = sentiment?.average_sentiment ?? 0.18;
  const totalMentions = sentiment?.total_items ?? 9330;

  return (
    <div className="space-y-6">
      {isUsingMockData && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-700 dark:text-amber-300">
            Mostrando datos de ejemplo. Los datos reales aparecerán cuando haya información en la base de datos.
          </span>
        </div>
      )}

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
                <p className={`text-2xl font-bold ${averageSentiment >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {averageSentiment >= 0 ? '+' : ''}{averageSentiment.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Rango: -1.0 a +1.0
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                {averageSentiment >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
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
                  {totalMentions.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Últimos {periodDays} días
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
              Tendencias de Sentimiento
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
                  dataKey="Positivo"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Neutral"
                  stroke="#6B7280"
                  strokeWidth={2}
                  dot={{ fill: '#6B7280', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Negativo"
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
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Los datos de sentimiento por región estarán disponibles cuando se procesen publicaciones con información geográfica.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Visite la sección de Inteligencia Geográfica para ver el análisis regional.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};