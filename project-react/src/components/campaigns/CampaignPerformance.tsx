import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer,
  Heart,
  MessageCircle,
  Share
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Campaign } from '../../types/campaigns';

interface CampaignPerformanceProps {
  campaign: Campaign;
  onBack: () => void;
  metrics: any;
}

// Mock performance data
const performanceData = [
  { date: '01/12', impressions: 45000, clicks: 2250, conversions: 180, engagement: 5.2 },
  { date: '02/12', impressions: 52000, clicks: 2860, conversions: 220, engagement: 5.8 },
  { date: '03/12', impressions: 48000, clicks: 2640, conversions: 195, engagement: 5.5 },
  { date: '04/12', impressions: 61000, clicks: 3355, conversions: 285, engagement: 6.1 },
  { date: '05/12', impressions: 58000, clicks: 3190, conversions: 265, engagement: 5.9 },
  { date: '06/12', impressions: 67000, clicks: 3685, conversions: 320, engagement: 6.4 },
  { date: '07/12', impressions: 72000, clicks: 4320, conversions: 380, engagement: 7.2 },
];

const platformData = [
  { platform: 'Facebook', impressions: 180000, clicks: 9500, conversions: 850, cost: 12500 },
  { platform: 'Instagram', impressions: 145000, clicks: 8200, conversions: 720, cost: 9800 },
  { platform: 'Google Ads', impressions: 98000, clicks: 5800, conversions: 650, cost: 15200 },
  { platform: 'Twitter', impressions: 67000, clicks: 3200, conversions: 280, cost: 6800 },
];

const regionData = [
  { region: 'Lima', reach: 125000, engagement: 7.8, sentiment: 0.15 },
  { region: 'Arequipa', reach: 45000, engagement: 6.2, sentiment: 0.22 },
  { region: 'Cusco', reach: 38000, engagement: 5.9, sentiment: 0.18 },
  { region: 'La Libertad', reach: 52000, engagement: 6.8, sentiment: 0.08 },
];

const sentimentData = [
  { name: 'Positivo', value: 58, color: '#10B981' },
  { name: 'Neutral', value: 28, color: '#6B7280' },
  { name: 'Negativo', value: 14, color: '#EF4444' },
];

export const CampaignPerformance: React.FC<CampaignPerformanceProps> = ({
  campaign,
  onBack,
  metrics,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const getPerformanceIcon = (current: number, target: number) => {
    const performance = (current / target) * 100;
    if (performance >= 100) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (performance >= 80) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card glass className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Performance: {campaign.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Análisis detallado de métricas y rendimiento
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Alcance Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(campaign.performance.reach)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getPerformanceIcon(campaign.performance.reach, 400000)}
                  <span className="text-xs text-green-600 dark:text-green-400">
                    +12.5% vs objetivo
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
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
                  Impresiones
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(campaign.performance.impressions)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getPerformanceIcon(campaign.performance.impressions, 1500000)}
                  <span className="text-xs text-green-600 dark:text-green-400">
                    +8.3% vs objetivo
                  </span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
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
                  Clicks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(campaign.performance.clicks)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getPerformanceIcon(campaign.performance.clicks, 40000)}
                  <span className="text-xs text-green-600 dark:text-green-400">
                    +15.2% vs objetivo
                  </span>
                </div>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
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
                  ROI
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campaign.performance.roi}%
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getPerformanceIcon(campaign.performance.roi, 200)}
                  <span className="text-xs text-green-600 dark:text-green-400">
                    +25.0% vs objetivo
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tendencias de Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
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
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Impresiones"
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Clicks"
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  name="Conversiones"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Análisis de Sentiment
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
                  label={({ name, value }) => `${name}: ${value}%`}
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
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Platform Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Performance por Plataforma
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Plataforma
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Impresiones
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Clicks
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    CTR
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Conversiones
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Costo
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    CPC
                  </th>
                </tr>
              </thead>
              <tbody>
                {platformData.map((platform, index) => {
                  const ctr = (platform.clicks / platform.impressions) * 100;
                  const cpc = platform.cost / platform.clicks;
                  
                  return (
                    <motion.tr
                      key={platform.platform}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                        {platform.platform}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {formatNumber(platform.impressions)}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {formatNumber(platform.clicks)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${
                          ctr > 5 ? 'text-green-600 dark:text-green-400' :
                          ctr > 3 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {ctr.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {platform.conversions.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {formatCurrency(platform.cost)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${
                          cpc < 2 ? 'text-green-600 dark:text-green-400' :
                          cpc < 4 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          ${cpc.toFixed(2)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Regional Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Performance por Región
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regionData.map((region, index) => (
              <motion.div
                key={region.region}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {region.region}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Alcance</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatNumber(region.reach)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {region.engagement}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sentiment</span>
                    <span className={`font-medium ${
                      region.sentiment > 0.1 ? 'text-green-600 dark:text-green-400' :
                      region.sentiment > -0.1 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {region.sentiment > 0 ? '+' : ''}{region.sentiment.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Engagement Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Desglose de Engagement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatNumber(37000)}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                Likes totales
              </div>
            </div>

            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <MessageCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(5200)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Comentarios
              </div>
            </div>

            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Share className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(6500)}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                Compartidos
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};