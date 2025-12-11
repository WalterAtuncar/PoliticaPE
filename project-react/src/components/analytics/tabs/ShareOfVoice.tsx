import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Hash, User } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';

interface ShareOfVoiceProps {
  filters: AnalyticsFilters;
}

const partyData = [
  { party: 'Perú Libre', mentions: 3200, share: 28.5, color: '#EF4444' },
  { party: 'Fuerza Popular', mentions: 2800, share: 24.9, color: '#F97316' },
  { party: 'Renovación Popular', mentions: 1900, share: 16.9, color: '#3B82F6' },
  { party: 'Alianza para el Progreso', mentions: 1200, share: 10.7, color: '#10B981' },
  { party: 'Acción Popular', mentions: 980, share: 8.7, color: '#8B5CF6' },
  { party: 'Otros', mentions: 1170, share: 10.3, color: '#6B7280' },
];

const timeSeriesData = [
  { date: '01/12', 'Perú Libre': 25, 'Fuerza Popular': 22, 'Renovación Popular': 18, 'APP': 12, 'Otros': 23 },
  { date: '02/12', 'Perú Libre': 28, 'Fuerza Popular': 24, 'Renovación Popular': 16, 'APP': 11, 'Otros': 21 },
  { date: '03/12', 'Perú Libre': 30, 'Fuerza Popular': 23, 'Renovación Popular': 17, 'APP': 12, 'Otros': 18 },
  { date: '04/12', 'Perú Libre': 27, 'Fuerza Popular': 26, 'Renovación Popular': 19, 'APP': 10, 'Otros': 18 },
  { date: '05/12', 'Perú Libre': 29, 'Fuerza Popular': 25, 'Renovación Popular': 17, 'APP': 11, 'Otros': 18 },
];

const hashtagsData = [
  { hashtag: '#ReformaConstitucional', mentions: 1250, sentiment: 0.15 },
  { hashtag: '#EleccionesPeru2024', mentions: 980, sentiment: -0.08 },
  { hashtag: '#CrisisEconomica', mentions: 850, sentiment: -0.32 },
  { hashtag: '#EducacionPublica', mentions: 720, sentiment: 0.22 },
  { hashtag: '#SaludParaTodos', mentions: 650, sentiment: 0.18 },
  { hashtag: '#CorrupcionCero', mentions: 580, sentiment: 0.35 },
];

const politicalFigures = [
  { name: 'Pedro Castillo', mentions: 2100, sentiment: -0.15, trend: 'down' },
  { name: 'Keiko Fujimori', mentions: 1850, sentiment: -0.22, trend: 'stable' },
  { name: 'Rafael López Aliaga', mentions: 1200, sentiment: 0.08, trend: 'up' },
  { name: 'César Acuña', mentions: 890, sentiment: 0.12, trend: 'up' },
  { name: 'Yonhy Lescano', mentions: 650, sentiment: 0.05, trend: 'stable' },
];

export const ShareOfVoice: React.FC<ShareOfVoiceProps> = ({ filters }) => {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'text-green-600 dark:text-green-400';
    if (sentiment > -0.1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
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
                  Partido Dominante
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  Perú Libre
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  28.5% del share
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
                  #ReformaConstitucional
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  1,250 menciones
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
                  Pedro Castillo
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  2,100 menciones
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={partyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="share"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {partyData.map((entry, index) => (
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
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Temporal Evolution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Evolución Temporal del Share
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
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
                <Area
                  type="monotone"
                  dataKey="Perú Libre"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="Fuerza Popular"
                  stackId="1"
                  stroke="#F97316"
                  fill="#F97316"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="Renovación Popular"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="APP"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="Otros"
                  stackId="1"
                  stroke="#6B7280"
                  fill="#6B7280"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hashtagsData.map((hashtag, index) => (
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
                {politicalFigures.map((figure, index) => (
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
        </Card>
      </motion.div>
    </div>
  );
};