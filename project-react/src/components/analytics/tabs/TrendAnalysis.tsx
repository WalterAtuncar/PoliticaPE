import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, AlertTriangle, Target, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';

interface TrendAnalysisProps {
  filters: AnalyticsFilters;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ filters }) => {
  const periodDays = filters.timeRange === '7d' ? 7 : filters.timeRange === '30d' ? 30 : 90;
  const { trends, isLoading } = useAnalyticsData('news', periodDays);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando datos de tendencias...</span>
      </div>
    );
  }

  const hasData = trends && trends.trending_topics && trends.trending_topics.length > 0;

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
                <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                  --
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Pendiente de análisis
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
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
                  Eventos Detectados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {trends?.trending_topics?.length ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Temas identificados
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
                  Período Analizado
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {periodDays}d
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Últimos días
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
                  Estado
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {hasData ? 'Activo' : 'Sin datos'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Análisis de tendencias
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Temas Tendencia
          </h3>
          {hasData ? (
            <div className="space-y-4">
              {trends.trending_topics.map((topic: { topic: string; count: number; sentiment: number }, index: number) => (
                <motion.div
                  key={topic.topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {topic.topic}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {topic.count} menciones
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      topic.sentiment > 0 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : topic.sentiment < 0
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {topic.sentiment > 0 ? '+' : ''}{topic.sentiment.toFixed(2)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-center">
                No hay datos de tendencias disponibles para el período seleccionado.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Los datos aparecerán cuando se procesen noticias y publicaciones.
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Political Events Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Eventos Políticos Significativos
          </h3>
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Los eventos políticos se detectarán automáticamente cuando haya suficiente actividad.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              El sistema identifica picos de actividad y correlaciones con eventos noticiosos.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Cyclical Analysis Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Análisis de Ciclos Estacionales
          </h3>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              Información
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              El análisis de ciclos estacionales requiere datos históricos de al menos 3 meses para identificar patrones. 
              Esta sección se activará cuando se acumule suficiente información.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
