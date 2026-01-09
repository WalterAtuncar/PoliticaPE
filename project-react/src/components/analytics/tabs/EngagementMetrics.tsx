import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';
import { useSocialData } from '../../../hooks/useSocialData';

interface EngagementMetricsProps {
  filters: AnalyticsFilters;
}

export const EngagementMetrics: React.FC<EngagementMetricsProps> = ({ filters }) => {
  const { posts, isLoading, isUsingMockData } = useSocialData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando métricas de engagement...</span>
      </div>
    );
  }

  const hasData = posts && posts.length > 0 && !isUsingMockData;

  const totalLikes = hasData ? posts.reduce((acc, p) => acc + (p.engagement?.likes ?? 0), 0) : 0;
  const totalShares = hasData ? posts.reduce((acc, p) => acc + (p.engagement?.shares ?? 0), 0) : 0;
  const totalComments = hasData ? posts.reduce((acc, p) => acc + (p.engagement?.comments ?? 0), 0) : 0;
  const totalReach = hasData ? posts.reduce((acc, p) => acc + (p.engagement?.reach ?? 0), 0) : 0;

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
                  {hasData ? (totalLikes >= 1000 ? `${(totalLikes/1000).toFixed(1)}K` : totalLikes) : '--'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {hasData ? 'De todas las plataformas' : 'Sin datos'}
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
                  {hasData ? (totalShares >= 1000 ? `${(totalShares/1000).toFixed(1)}K` : totalShares) : '--'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {hasData ? 'Total compartidos' : 'Sin datos'}
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
                  {hasData ? (totalComments >= 1000 ? `${(totalComments/1000).toFixed(1)}K` : totalComments) : '--'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {hasData ? 'Total comentarios' : 'Sin datos'}
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
                  {hasData ? (totalReach >= 1000 ? `${(totalReach/1000).toFixed(1)}K` : totalReach) : '--'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {hasData ? 'Personas alcanzadas' : 'Sin datos'}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Platform Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Engagement por Plataforma
          </h3>
          {hasData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['twitter', 'facebook', 'instagram'].map((platform) => {
                const platformPosts = posts.filter(p => p.platform.toLowerCase() === platform);
                const platformLikes = platformPosts.reduce((acc, p) => acc + (p.engagement?.likes ?? 0), 0);
                return (
                  <div key={platform} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize mb-2">
                      {platform}
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {platformPosts.length}
                    </p>
                    <p className="text-sm text-gray-500">publicaciones</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {platformLikes} likes totales
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-center">
                No hay datos de engagement disponibles.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Los datos aparecerán cuando se recopilen publicaciones de redes sociales.
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Top Influencers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Influencers Más Activos
          </h3>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              El análisis de influencers estará disponible cuando se procesen suficientes publicaciones.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Se identificarán automáticamente los usuarios con mayor engagement.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Viral Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Posts Más Virales
          </h3>
          {hasData && posts.length > 0 ? (
            <div className="space-y-4">
              {posts
                .sort((a, b) => ((b.engagement?.likes ?? 0) + (b.engagement?.shares ?? 0)) - ((a.engagement?.likes ?? 0) + (a.engagement?.shares ?? 0)))
                .slice(0, 5)
                .map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          @{post.author}
                        </span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                          {post.platform}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{post.engagement?.likes ?? 0} likes</span>
                      <span>{post.engagement?.shares ?? 0} shares</span>
                    </div>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-center">
                No hay publicaciones virales para mostrar.
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
