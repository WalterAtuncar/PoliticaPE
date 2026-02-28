import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { ROIMetrics } from '../../types/recommendations';

interface ROIDashboardProps {
  metrics: ROIMetrics;
}

export const ROIDashboard: React.FC<ROIDashboardProps> = ({ metrics }) => {
  return (
    <Card glass className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ROI Dashboard
        </h3>
      </div>

      <div className="space-y-4">
        {/* Success Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Tasa de Éxito</span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              {metrics.successRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.successRate}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Average ROI */}
        <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">ROI Promedio</span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {metrics.averageROI.toFixed(0)}%
          </span>
        </div>

        {/* Implementation Rate */}
        <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Implementadas</span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {metrics.implementedRecommendations}/{metrics.totalRecommendations}
          </span>
        </div>

        {/* Average Implementation Time */}
        <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Tiempo Promedio</span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {metrics.averageImplementationTime} días
          </span>
        </div>

        {/* Budget Overview */}
        <div className="pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Presupuesto
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Asignado</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${(metrics.totalBudgetAllocated / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Ejecutado</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${(metrics.totalBudgetSpent / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${metrics.totalBudgetAllocated > 0 ? Math.min((metrics.totalBudgetSpent / metrics.totalBudgetAllocated) * 100, 100) : 0}%` 
                }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};