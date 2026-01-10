import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Heart, MessageCircle, Share, Eye, Loader2, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';
import { useEngagementSummary, usePlatformBreakdown, useTopPosts, useRegionalEngagement } from '../../../hooks/useAdvancedAnalytics';

interface EngagementMetricsProps {
  filters: AnalyticsFilters;
}

export const EngagementMetrics: React.FC<EngagementMetricsProps> = ({ filters }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const periodDays = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
  const { engagement, isLoading: engagementLoading, hasData: hasEngagement } = useEngagementSummary(periodDays);
  const { platforms, isLoading: platformLoading, hasData: hasPlatforms } = usePlatformBreakdown(periodDays);
  const { posts: topPosts, totalPages, totalPosts, isLoading: postsLoading, hasData: hasPosts } = useTopPosts(periodDays, 5, currentPage);
  const { regions, isLoading: regionsLoading, hasData: hasRegions } = useRegionalEngagement(periodDays);

  const isLoading = engagementLoading || platformLoading || postsLoading || regionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando métricas de engagement...</span>
      </div>
    );
  }

  const totalLikes = engagement?.total_engagement?.likes ?? 0;
  const totalShares = engagement?.total_engagement?.shares ?? 0;
  const totalComments = engagement?.total_engagement?.comments ?? 0;
  const totalViews = engagement?.total_engagement?.views ?? 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

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
                  {formatNumber(totalLikes)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {hasEngagement ? 'Datos reales' : 'Sin datos'}
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
                  {formatNumber(totalShares)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total compartidos
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
                  {formatNumber(totalComments)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total comentarios
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
                  {formatNumber(totalViews)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Visualizaciones
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
            {hasPlatforms ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platforms}>
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
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hay datos de plataformas disponibles
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Engagement por Región
            </h3>
            {hasRegions ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regions} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis dataKey="region" type="category" stroke="#6B7280" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                  />
                  <Bar dataKey="engagement" fill="#8B5CF6" name="Engagement Rate" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hay datos regionales disponibles
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Top Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Posts con Mayor Engagement
            </h3>
            {hasPosts && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalPosts} posts totales
              </span>
            )}
          </div>
          {hasPosts ? (
            <>
              <div className="space-y-4">
                {topPosts.map((post, index) => (
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
                          @{post.author}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          post.platform === 'instagram' 
                            ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                            : post.platform === 'youtube'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        }`}>
                          {post.platform}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Sin fecha'}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm leading-relaxed">
                      {post.content}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{formatNumber(post.engagement.likes)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share className="h-4 w-4" />
                        <span>{formatNumber(post.engagement.shares)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{formatNumber(post.engagement.comments)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Total: {formatNumber(post.engagement.total)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No hay posts con engagement disponibles
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
