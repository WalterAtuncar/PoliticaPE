import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Clock, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { DemographicFilters, DemographicData } from '../../types/demographics';

interface DemographicTimelineProps {
  data: DemographicData;
  isLoading: boolean;
  filters: DemographicFilters;
}

export const DemographicTimeline: React.FC<DemographicTimelineProps> = ({
  data,
  isLoading,
  filters,
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString(undefined, {maximumFractionDigits: 2})}
              {entry.name === 'Sentiment' ? '' : entry.name === 'Participación' || entry.name === 'Engagement' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Evolución Demográfica
          </h3>
        </div>
        
        <div className="relative group">
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Info className="h-5 w-5 text-gray-500" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-sm text-gray-600 dark:text-gray-400 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            Este gráfico muestra la evolución de métricas demográficas y políticas clave a lo largo del tiempo.
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.timelineData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[-1, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="urbanPercentage"
                name="Urbanización"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="participation"
                name="Participación"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="engagement"
                name="Engagement"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sentiment"
                name="Sentiment"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Tendencias Demográficas
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>Incremento sostenido de la urbanización (+{data.trends.urbanizationChange}% en {filters.timeRange === '1y' ? 'el último año' : `los últimos ${filters.timeRange.replace('y', '')} años`})</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Envejecimiento gradual de la población (+{data.trends.agingRate} años en promedio)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Aumento del nivel educativo (+{data.trends.educationChange}% con educación superior)</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Tendencias Políticas
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-green-500 font-bold">•</span>
              <span>Cambio en sentiment político ({data.trends.sentimentChange > 0 ? '+' : ''}{data.trends.sentimentChange.toFixed(2)} puntos)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-500 font-bold">•</span>
              <span>Variación en engagement ({data.trends.engagementChange > 0 ? '+' : ''}{data.trends.engagementChange.toFixed(1)}% puntos)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Cambio en participación electoral ({data.trends.participationChange > 0 ? '+' : ''}{data.trends.participationChange.toFixed(1)}% puntos)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Análisis de Tendencias
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {data.trends.analysis || 
           'Los datos muestran una clara correlación entre el aumento de la urbanización y el incremento en el engagement político. Las regiones con mayor crecimiento educativo también presentan mejoras en el sentiment político, sugiriendo que la educación es un factor clave en la percepción política.'}
        </p>
      </div>
    </Card>
  );
};