import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Clock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Modal } from '../ui/Modal';
import { AIRecommendation } from '../../types/recommendations';
import { fmtInt } from '../../utils/format';

interface StrategyComparatorProps {
  recommendations: AIRecommendation[];
  onClose: () => void;
}

export const StrategyComparator: React.FC<StrategyComparatorProps> = ({
  recommendations,
  onClose,
}) => {
  const comparisonData = recommendations.map((rec, index) => ({
    name: `Estrategia ${index + 1}`,
    title: rec.title,
    confidence: rec.aiConfidence,
    roi: rec.projectedROI,
    budget: rec.estimatedBudget.max,
    timeline: rec.expectedTimeline === '2-4 semanas' ? 3 : 
              rec.expectedTimeline === '1-2 meses' ? 6 : 
              rec.expectedTimeline === '2-3 meses' ? 10 : 16,
  }));

  const radarData = [
    {
      metric: 'Confianza IA',
      ...recommendations.reduce((acc, rec, index) => ({
        ...acc,
        [`strategy${index}`]: rec.aiConfidence,
      }), {})
    },
    {
      metric: 'ROI Proyectado',
      ...recommendations.reduce((acc, rec, index) => ({
        ...acc,
        [`strategy${index}`]: Math.min(rec.projectedROI, 300), // Cap at 300 for visualization
      }), {})
    },
    {
      metric: 'Velocidad',
      ...recommendations.reduce((acc, rec, index) => ({
        ...acc,
        [`strategy${index}`]: rec.expectedTimeline === '2-4 semanas' ? 100 : 
                              rec.expectedTimeline === '1-2 meses' ? 75 : 
                              rec.expectedTimeline === '2-3 meses' ? 50 : 25,
      }), {})
    },
    {
      metric: 'Costo-Efectividad',
      ...recommendations.reduce((acc, rec, index) => ({
        ...acc,
        // Presupuesto en soles: S/ 1 000 000 (tope del filtro) equivale a eficiencia 0.
        [`strategy${index}`]: Math.max(0, 100 - rec.estimatedBudget.max / 10000),
      }), {})
    },
  ];

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Comparador de Estrategias"
      size="xl"
    >
      <div className="space-y-6">
        {/* Strategy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
              style={{ borderLeftColor: colors[index], borderLeftWidth: '4px' }}
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                Estrategia {index + 1}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {rec.title}
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Región:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{rec.targetRegion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Prioridad:</span>
                  <span className={`font-medium ${
                    rec.priority === 'critical' ? 'text-red-600' :
                    rec.priority === 'high' ? 'text-orange-600' :
                    rec.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart Comparison */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Comparación de Métricas
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Bar dataKey="confidence" fill="#3B82F6" name="Confianza IA %" />
                <Bar dataKey="roi" fill="#10B981" name="ROI Proyectado %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Análisis Multidimensional
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                {recommendations.map((_, index) => (
                  <Radar
                    key={index}
                    name={`Estrategia ${index + 1}`}
                    dataKey={`strategy${index}`}
                    stroke={colors[index]}
                    fill={colors[index]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Comparación Detallada
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                    Métrica
                  </th>
                  {recommendations.map((_, index) => (
                    <th key={index} className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                      Estrategia {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Confianza IA</td>
                  {recommendations.map((rec, index) => (
                    <td key={index} className="py-2 px-3 text-purple-600 dark:text-purple-400 font-medium">
                      {rec.aiConfidence}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">ROI Proyectado</td>
                  {recommendations.map((rec, index) => (
                    <td key={index} className="py-2 px-3 text-green-600 dark:text-green-400 font-medium">
                      {rec.projectedROI}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Presupuesto</td>
                  {recommendations.map((rec, index) => (
                    <td key={index} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      S/ {fmtInt(rec.estimatedBudget.min)} – {fmtInt(rec.estimatedBudget.max)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Timeline</td>
                  {recommendations.map((rec, index) => (
                    <td key={index} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {rec.expectedTimeline}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Región Objetivo</td>
                  {recommendations.map((rec, index) => (
                    <td key={index} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {rec.targetRegion}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Demográfico</td>
                  {recommendations.map((rec, index) => (
                    <td key={index} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {rec.targetDemographic}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendation Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Recomendación IA
          </h4>
          
          {(() => {
            const bestStrategy = recommendations.reduce((best, current) => {
              const bestScore = (best.aiConfidence + best.projectedROI) / 2;
              const currentScore = (current.aiConfidence + current.projectedROI) / 2;
              return currentScore > bestScore ? current : best;
            });
            
            const bestIndex = recommendations.indexOf(bestStrategy);
            
            return (
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium" style={{ color: colors[bestIndex] }}>
                    Estrategia {bestIndex + 1}
                  </span> presenta la mejor combinación de confianza IA ({bestStrategy.aiConfidence}%) 
                  y ROI proyectado ({bestStrategy.projectedROI}%).
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enfocada en {bestStrategy.targetRegion} con segmento {bestStrategy.targetDemographic}, 
                  esta estrategia ofrece el mejor balance entre efectividad y viabilidad.
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </Modal>
  );
};