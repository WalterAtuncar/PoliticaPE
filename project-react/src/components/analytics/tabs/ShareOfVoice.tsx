import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Hash, User, Loader2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';
import { useShareOfVoice } from '../../../hooks/useAdvancedAnalytics';

interface ShareOfVoiceProps {
  filters: AnalyticsFilters;
}

export const ShareOfVoice: React.FC<ShareOfVoiceProps> = ({ filters }) => {
  const periodDays = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
  const { parties, hashtags, figures, totalMentions, isLoading, hasData } = useShareOfVoice(periodDays);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'text-green-600 dark:text-green-400';
    if (sentiment > -0.1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando datos de Share of Voice...</span>
      </div>
    );
  }

  const topParty = parties[0];
  const topHashtag = hashtags[0];
  const topFigure = figures[0];

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
                  Partido Dominante
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {topParty?.party ?? 'Sin datos'}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {topParty ? `${topParty.share}% del share` : '--'}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
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
                  Hashtag Trending
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {topHashtag?.hashtag ?? 'Sin datos'}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {topHashtag ? `${topHashtag.mentions.toLocaleString()} menciones` : '--'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Hash className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                  Figura Más Mencionada
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {topFigure?.name ?? 'Sin datos'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {topFigure ? `${topFigure.mentions.toLocaleString()} menciones` : '--'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Share of Voice Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Party Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Share of Voice por Partido
            </h3>
            {hasData && parties.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={parties}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="share"
                    label={({ party, share }) => `${party}: ${share}%`}
                    labelLine={false}
                  >
                    {parties.map((entry, index) => (
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
                    formatter={(value: number) => [`${value}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hay datos de partidos disponibles
              </div>
            )}
          </Card>
        </motion.div>

        {/* Party Mentions Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Menciones por Partido
            </h3>
            {hasData && parties.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={parties} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis dataKey="party" type="category" stroke="#6B7280" fontSize={10} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                  />
                  <Bar dataKey="mentions" fill="#3B82F6" name="Menciones" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Hashtags Trending */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Hashtags Trending
          </h3>
          {hashtags.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hashtags.map((hashtag, index) => (
                <motion.div
                  key={hashtag.hashtag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-600 dark:text-blue-400">
                      {hashtag.hashtag}
                    </h4>
                    <Hash className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Menciones</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {hashtag.mentions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sentiment</span>
                      <span className={`font-medium ${getSentimentColor(hashtag.sentiment)}`}>
                        {hashtag.sentiment > 0 ? '+' : ''}{hashtag.sentiment.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No se encontraron hashtags en el contenido analizado
            </div>
          )}
        </Card>
      </motion.div>

      {/* Political Figures */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Figuras Políticas Más Mencionadas
          </h3>
          {figures.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Figura Política
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Menciones
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Sentiment
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Tendencia
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {figures.map((figure, index) => (
                    <motion.tr
                      key={figure.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                        {figure.name}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {figure.mentions.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${getSentimentColor(figure.sentiment)}`}>
                          {figure.sentiment > 0 ? '+' : ''}{figure.sentiment.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          figure.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          figure.trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {figure.trend === 'up' ? '↗' : figure.trend === 'down' ? '↘' : '→'} {figure.trend}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No se encontraron menciones de figuras políticas
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
