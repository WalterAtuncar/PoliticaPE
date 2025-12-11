import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, BarChart3 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AIRecommendation } from '../../types/recommendations';

interface BudgetCalculatorProps {
  selectedRecommendations: AIRecommendation[];
  onShowComparator: () => void;
}

export const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({
  selectedRecommendations,
  onShowComparator,
}) => {
  const totalMinBudget = selectedRecommendations.reduce(
    (sum, rec) => sum + rec.estimatedBudget.min, 0
  );
  
  const totalMaxBudget = selectedRecommendations.reduce(
    (sum, rec) => sum + rec.estimatedBudget.max, 0
  );
  
  const averageROI = selectedRecommendations.length > 0
    ? selectedRecommendations.reduce((sum, rec) => sum + rec.projectedROI, 0) / selectedRecommendations.length
    : 0;

  const averageConfidence = selectedRecommendations.length > 0
    ? selectedRecommendations.reduce((sum, rec) => sum + rec.aiConfidence, 0) / selectedRecommendations.length
    : 0;

  return (
    <Card glass className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Calculator className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Calculadora de Presupuesto
        </h3>
      </div>

      {selectedRecommendations.length > 0 ? (
        <div className="space-y-4">
          {/* Selected Count */}
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {selectedRecommendations.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Recomendaciones seleccionadas
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Presupuesto Mínimo</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ${totalMinBudget}K
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Presupuesto Máximo</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ${totalMaxBudget}K
              </span>
            </div>
          </div>

          {/* Projected Metrics */}
          <div className="pt-4 border-t border-gray-200/50 dark:border-gray-600/50 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">ROI Promedio Proyectado</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {averageROI.toFixed(0)}%
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Confianza IA Promedio</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {averageConfidence.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Confidence Visualization */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Confianza del Portfolio</span>
              <span className="text-sm font-medium">{averageConfidence.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  averageConfidence >= 80 ? 'bg-green-500' :
                  averageConfidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${averageConfidence}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            {selectedRecommendations.length > 1 && (
              <Button
                onClick={onShowComparator}
                variant="primary"
                size="sm"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparar Estrategias
              </Button>
            )}

            <Button variant="outline" size="sm" className="w-full">
              Exportar Plan de Presupuesto
            </Button>
          </div>

          {/* Selected Recommendations List */}
          <div className="pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Recomendaciones Seleccionadas
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex justify-between items-center text-xs p-2 bg-white/20 dark:bg-gray-800/20 rounded"
                >
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                    {rec.title}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    ${rec.estimatedBudget.min}-${rec.estimatedBudget.max}K
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Selecciona recomendaciones para calcular presupuesto
          </p>
        </div>
      )}
    </Card>
  );
};