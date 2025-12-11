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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { X, BarChart3, Target, Download } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { RegionData, RegionComparisonData } from '../../types/demographics';

interface DemographicComparatorProps {
  regions: RegionData[];
  comparisonData: RegionComparisonData;
  onClose: () => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const DemographicComparator: React.FC<DemographicComparatorProps> = ({
  regions,
  comparisonData,
  onClose,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString(undefined, {maximumFractionDigits: 2})}
              {entry.dataKey === 'politicalSentiment' ? '' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Comparador Demográfico"
      size="xl"
    >
      <div className="space-y-6">
        {/* Regions Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regions.map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
              style={{ borderLeftColor: COLORS[index], borderLeftWidth: '4px' }}
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {region.name}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Población:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatNumber(region.population)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Edad promedio:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {region.averageAge} años
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">NSE predominante:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {region.predominantNSE}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Urbanización:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {region.urbanPercentage.toFixed(1)}%
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
              Comparación de Métricas Políticas
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData.politicalMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {regions.map((region, index) => (
                  <Bar 
                    key={region.id} 
                    dataKey={region.id} 
                    name={region.name} 
                    fill={COLORS[index]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Perfil Demográfico
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={comparisonData.demographicProfile}>
                <PolarGrid stroke="#374151" opacity={0.3} />
                <PolarAngleAxis dataKey="attribute" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {regions.map((region, index) => (
                  <Radar
                    key={region.id}
                    name={region.name}
                    dataKey={region.id}
                    stroke={COLORS[index]}
                    fill={COLORS[index]}
                    fillOpacity={0.2}
                  />
                ))}
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                    Métrica
                  </th>
                  {regions.map((region) => (
                    <th key={region.id} className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">
                      {region.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Población</td>
                  {regions.map((region) => (
                    <td key={region.id} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {formatNumber(region.population)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Edad Promedio</td>
                  {regions.map((region) => (
                    <td key={region.id} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {region.averageAge} años
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Urbanización</td>
                  {regions.map((region) => (
                    <td key={region.id} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {region.urbanPercentage.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Educación Superior</td>
                  {regions.map((region) => (
                    <td key={region.id} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {region.higherEducationPercentage.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Sentiment Político</td>
                  {regions.map((region) => (
                    <td key={region.id} className={`py-2 px-3 font-medium ${
                      region.politicalSentiment > 0.1 ? 'text-green-600 dark:text-green-400' :
                      region.politicalSentiment > -0.1 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {region.politicalSentiment > 0 ? '+' : ''}{region.politicalSentiment.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Engagement Político</td>
                  {regions.map((region) => (
                    <td key={region.id} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {region.politicalEngagement.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Participación Electoral</td>
                  {regions.map((region) => (
                    <td key={region.id} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {region.electoralParticipation.toFixed(1)}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategic Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Insights Estratégicos
          </h4>
          
          <div className="space-y-4">
            {comparisonData.strategicInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${
                  insight.type === 'opportunity' ? 'bg-green-100 dark:bg-green-900/20' :
                  insight.type === 'trend' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {insight.type === 'opportunity' ? (
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : insight.type === 'trend' ? (
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Análisis Comparativo
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};