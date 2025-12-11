import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, Play, Pause } from 'lucide-react';
import { Card } from '../ui/Card';
import { AIRecommendation } from '../../types/recommendations';

interface ImplementationTimelineProps {
  recommendations: AIRecommendation[];
}

const statusIcons = {
  approved: Play,
  in_progress: Clock,
  completed: CheckCircle,
};

const statusColors = {
  approved: 'text-green-600 dark:text-green-400',
  in_progress: 'text-blue-600 dark:text-blue-400',
  completed: 'text-emerald-600 dark:text-emerald-400',
};

export const ImplementationTimeline: React.FC<ImplementationTimelineProps> = ({
  recommendations,
}) => {
  // Sort recommendations by status priority and creation date
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const statusPriority = { approved: 1, in_progress: 2, completed: 3 };
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 4;
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 4;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const getTimelinePosition = (index: number) => {
    const baseDelay = 2; // weeks
    return baseDelay + (index * 3); // 3 weeks between each
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Timeline de Implementación
        </h3>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-6">
          {/* Timeline Header */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Próximas 24 semanas</span>
            <span>{recommendations.length} estrategias en pipeline</span>
          </div>

          {/* Timeline Visualization */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            {/* Timeline Items */}
            <div className="space-y-6">
              {sortedRecommendations.map((recommendation, index) => {
                const Icon = statusIcons[recommendation.status as keyof typeof statusIcons] || Clock;
                const timelineWeek = getTimelinePosition(index);
                
                return (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start space-x-4"
                  >
                    {/* Timeline Dot */}
                    <div className={`
                      relative z-10 w-12 h-12 rounded-full border-4 border-white dark:border-gray-900 
                      bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center
                    `}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {recommendation.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Semana {timelineWeek}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {recommendation.targetRegion} • {recommendation.expectedTimeline}
                      </p>

                      {/* Progress Bar for In Progress Items */}
                      {recommendation.status === 'in_progress' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {recommendation.implementationProgress || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${recommendation.implementationProgress || 0}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Metrics */}
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Presupuesto:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${recommendation.estimatedBudget.min}-${recommendation.estimatedBudget.max}K
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">ROI:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {recommendation.projectedROI}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Confianza:</span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            {recommendation.aiConfidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Timeline Summary */}
          <div className="pt-6 border-t border-gray-200/50 dark:border-gray-600/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {recommendations.filter(r => r.status === 'approved').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Por iniciar</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {recommendations.filter(r => r.status === 'in_progress').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">En progreso</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {recommendations.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Completadas</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay estrategias en implementación
          </p>
        </div>
      )}
    </Card>
  );
};