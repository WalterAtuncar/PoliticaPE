import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Heart, MessageCircle, Share, Eye, TrendingUp } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';

interface EngagementMetricsProps {
  filters: AnalyticsFilters;
}

const platformData = [
  { platform: 'Twitter', likes: 12500, shares: 3200, comments: 1800, reach: 45000 },
  { platform: 'Facebook', likes: 8900, shares: 2100, comments: 2400, reach: 32000 },
  { platform: 'Instagram', likes: 15600, shares: 1200, comments: 980, reach: 28000 },
];

const regionEngagementData = [
  { region: 'Lima', engagement: 8.9, posts: 1250 },
  { region: 'Arequipa', engagement: 7.2, posts: 890 },
  { region: 'Cusco', engagement: 6.8, posts: 720 },
  { region: 'La Libertad', engagement: 6.1, posts: 650 },
  { region: 'Piura', engagement: 5.9, posts: 580 },
];

const influencersData = [
  {
    id: 1,
    name: 'María González',
    handle: '@mariagonzalez',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
    followers: 125000,
    engagement: 12.5,
    posts: 45,
  },
  {
    id: 2,
    name: 'Carlos Mendoza',
    handle: '@carlosmendoza',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
    followers: 89000,
    engagement: 9.8,
    posts: 32,
  },
  {
    id: 3,
    name: 'Ana Rodríguez',
    handle: '@anarodriguez',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100&h=100&fit=crop&crop=face',
    followers: 67000,
    engagement: 8.2,
    posts: 28,
  },
];

const viralPosts = [
  {
    id: 1,
    content: 'Nueva propuesta de reforma tributaria genera intenso debate en el Congreso. ¿Qué opinan los ciudadanos? #ReformaTributaria #PolíticaPerú',
    author: '@AnalisisPolitico',
    platform: 'Twitter',
    engagement: 2450,
    timestamp: '2 horas',
  },
  {
    id: 2,
    content: 'Ciudadanos de Arequipa se movilizan para expresar su posición sobre las nuevas medidas económicas implementadas por el gobierno.',
    author: 'Radio Local Arequipa',
    platform: 'Facebook',
    engagement: 1890,
    timestamp: '4 horas',
  },
  {
    id: 3,
    content: 'Jóvenes cusqueños organizan foro político para discutir el futuro de la región y las próximas elecciones municipales.',
    author: '@juventudcusco',
    platform: 'Instagram',
    engagement: 1650,
    timestamp: '6 horas',
  },
];

export const EngagementMetrics: React.FC<EngagementMetricsProps> = ({ filters }) => {
  return (
    <div className="space-y-6">
      {/* Platform Overview */}
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
                  Total Likes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  37K
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +15.2%
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
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
                  Compartidos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  6.5K
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +8.7%
                </p>
              </div>
              <Share className="h-8 w-8 text-blue-500" />
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
                  Comentarios
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  5.2K
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +22.1%
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
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
                  Alcance Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  105K
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +12.8%
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Platform Comparison & Regional Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Engagement por Plataforma
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="platform" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Bar dataKey="likes" fill="#EF4444" name="Likes" />
                <Bar dataKey="shares" fill="#3B82F6" name="Shares" />
                <Bar dataKey="comments" fill="#10B981" name="Comments" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Engagement Rate por Región
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionEngagementData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                <YAxis dataKey="region" type="category" stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Bar dataKey="engagement" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Top Influencers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Influencers Más Activos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {influencersData.map((influencer, index) => (
              <motion.div
                key={influencer.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={influencer.avatar}
                    alt={influencer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {influencer.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {influencer.handle}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Seguidores</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(influencer.followers / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {influencer.engagement}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Posts</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {influencer.posts}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Viral Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Posts Más Virales
          </h3>
          <div className="space-y-4">
            {viralPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {post.author}
                    </span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                      {post.platform}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {post.timestamp}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm leading-relaxed">
                  {post.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{post.engagement} interacciones</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};