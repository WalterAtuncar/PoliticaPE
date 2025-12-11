import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Star,
  MoreHorizontal,
  Play,
  Pause,
  Check,
  X
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AIRecommendation } from '../../types/recommendations';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  isSelected: boolean;
  onSelect: () => void;
  onStatusUpdate: (status: string) => void;
  onRate: (rating: number) => void;
}

const priorityColors = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

const statusColors = {
  generated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const statusLabels = {
  generated: 'Generada',
  under_review: 'Bajo revisión',
  approved: 'Aprobada',
  in_progress: 'En progreso',
  completed: 'Completada',
  rejected: 'Rechazada',
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  isSelected,
  onSelect,
  onStatusUpdate,
  onRate,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(recommendation.userRating || 0);

  const handleRating = (newRating: number) => {
    setRating(newRating);
    onRate(newRating);
    setShowRating(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`
        relative transition-all duration-200
        ${isSelected ? 'ring-2 ring-purple-500' : ''}
      `}
    >
      <Card glass className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {recommendation.title}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[recommendation.priority]}`}>
                  {recommendation.priority.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[recommendation.status]}`}>
                  {statusLabels[recommendation.status]}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {recommendation.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* AI Confidence */}
            <div className="text-right">
              <div className={`text-sm font-bold ${getConfidenceColor(recommendation.aiConfidence)}`}>
                {recommendation.aiConfidence}%
              </div>
              <div className="text-xs text-gray-500">Confianza IA</div>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Confidence Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${
                recommendation.aiConfidence >= 80 ? 'bg-green-500' :
                recommendation.aiConfidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${recommendation.aiConfidence}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500">Región</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {recommendation.targetRegion}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-xs text-gray-500">Demográfico</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {recommendation.targetDemographic}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-xs text-gray-500">Presupuesto</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                ${recommendation.estimatedBudget.min}K - ${recommendation.estimatedBudget.max}K
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-xs text-gray-500">ROI Proyectado</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {recommendation.projectedROI}%
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
            >
              {showDetails ? 'Ocultar' : 'Ver'} Detalles
            </Button>

            {recommendation.status === 'generated' && (
              <Button
                onClick={() => onStatusUpdate('approved')}
                variant="primary"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Aprobar
              </Button>
            )}

            {recommendation.status === 'approved' && (
              <Button
                onClick={() => onStatusUpdate('in_progress')}
                variant="primary"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Play className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
            )}

            {recommendation.status === 'completed' && !recommendation.userRating && (
              <Button
                onClick={() => setShowRating(true)}
                variant="outline"
                size="sm"
              >
                <Star className="h-4 w-4 mr-1" />
                Calificar
              </Button>
            )}
          </div>

          {/* User Rating */}
          {recommendation.userRating && (
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < recommendation.userRating! 
                      ? 'text-yellow-500 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rating Modal */}
        {showRating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              ¿Qué tan efectiva fue esta recomendación?
            </h4>
            <div className="flex items-center space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleRating(i + 1)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      i < rating 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
              <button
                onClick={() => setShowRating(false)}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Detailed Information */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-600/50"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weakness Identified */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Debilidad Identificada
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {recommendation.identifiedWeakness}
                </p>
              </div>

              {/* Recommended Action */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Acción Recomendada
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {recommendation.recommendedAction}
                </p>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Timeline Esperado
                </h4>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {recommendation.expectedTimeline}
                  </span>
                </div>
              </div>

              {/* Resources Needed */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Recursos Necesarios
                </h4>
                <div className="flex flex-wrap gap-1">
                  {recommendation.resourcesNeeded.map((resource, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>

              {/* Success KPIs */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  KPIs de Éxito
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {recommendation.successKPIs.map((kpi, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{kpi}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Factores de Riesgo
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {recommendation.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};