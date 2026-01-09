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
} from 'recharts';
import { Users, TrendingUp, Target, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';
import { usePlatformBreakdown, useRegionalEngagement } from '../../../hooks/useAdvancedAnalytics';

interface DemographicInsightsProps {
  filters: AnalyticsFilters;
}

export const DemographicInsights: React.FC<DemographicInsightsProps> = ({ filters }) => {
  const periodDays = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
  const { platforms, totalPosts, isLoading: platformLoading, hasData: hasPlatforms } = usePlatformBreakdown(periodDays);
  const { regions, isLoading: regionLoading, hasData: hasRegions } = useRegionalEngagement(periodDays);

  const isLoading = platformLoading || regionLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando datos demográficos...</span>
      </div>
    );
  }

  const topPlatform = platforms.sort((a, b) => b.posts - a.posts)[0];
  const topRegion = regions[0];

  return (
    <div className="space-y-6">
      {/* Demographic Overview */}
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
                  Total Posts Analizados
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {totalPosts.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Últimos {periodDays} días
                </p>
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
                  Plataforma Dominante
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {topPlatform?.platform ?? 'Sin datos'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {topPlatform ? `${topPlatform.posts} posts` : '--'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
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
                  Región Más Activa
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {topRegion?.region ?? 'Sin datos'}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {topRegion ? `${topRegion.engagement} engagement` : '--'}
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
                  Plataformas Activas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platforms.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Redes sociales
                </p>
              </div>
              <Filter className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Platform and Regional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribución por Plataforma
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
                  <Bar dataKey="posts" fill="#3B82F6" name="Posts" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No hay datos de plataformas disponibles
              </div>
            )}
          </Card>
        </motion.div>

        {/* Regional Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Engagement por Región
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Datos combinados de Twitter y YouTube
            </p>
            {hasRegions ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regions} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis dataKey="region" type="category" stroke="#6B7280" fontSize={10} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                    formatter={(value: number, name: string, props: { payload: { posts?: number; likes?: number } }) => {
                      if (name === 'Engagement Rate') {
                        return [`${value.toFixed(1)}`, 'Engagement Rate'];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Región: ${label}`}
                  />
                  <Bar dataKey="engagement" fill="#8B5CF6" name="Engagement Rate" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="posts" fill="#3B82F6" name="Posts" radius={[0, 4, 4, 0]} />
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

      {/* Demographic Segmentation Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Segmentación Demográfica
          </h3>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-blue-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              La segmentación demográfica avanzada (edad, género, NSE) requiere integración con APIs de enriquecimiento de datos.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 text-center">
              Actualmente mostramos datos de plataforma y región basados en el contenido recopilado.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Platform Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Detalle por Plataforma
          </h3>
          {hasPlatforms ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.platform}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    {platform.platform}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Posts</span>
                      <span className="font-medium text-gray-900 dark:text-white">{platform.posts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Likes</span>
                      <span className="font-medium text-gray-900 dark:text-white">{platform.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shares</span>
                      <span className="font-medium text-gray-900 dark:text-white">{platform.shares.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Comentarios</span>
                      <span className="font-medium text-gray-900 dark:text-white">{platform.comments.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No hay datos de plataformas disponibles
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
