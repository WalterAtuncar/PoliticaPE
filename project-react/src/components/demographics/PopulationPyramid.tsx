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
  Legend
} from 'recharts';
import { Users, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { DemographicFilters, DemographicData } from '../../types/demographics';

interface PopulationPyramidProps {
  data: DemographicData;
  isLoading: boolean;
  filters: DemographicFilters;
}

export const PopulationPyramid: React.FC<PopulationPyramidProps> = ({
  data,
  isLoading,
  filters,
}) => {
  const [showPoliticalOverlay, setShowPoliticalOverlay] = useState(true);
  
  // Transform data for the population pyramid
  const pyramidData = data.populationByAge.map(item => ({
    ageGroup: item.ageGroup,
    male: -item.male, // Negative for left side of pyramid
    female: item.female,
    malePolitical: -item.malePolitical,
    femalePolitical: item.femalePolitical,
  }));

  const formatYAxis = (value: number) => {
    return Math.abs(value).toString();
  };

  const formatTooltipValue = (value: number) => {
    return Math.abs(value).toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            const value = Math.abs(entry.value);
            const name = entry.name === 'male' ? 'Hombres' : 
                         entry.name === 'female' ? 'Mujeres' : 
                         entry.name === 'malePolitical' ? 'Hombres (Afinidad Política)' : 
                         'Mujeres (Afinidad Política)';
            
            const color = entry.name === 'male' || entry.name === 'malePolitical' ? '#3B82F6' : '#EC4899';
            
            return (
              <p key={index} className="text-sm" style={{ color }}>
                {name}: {value.toLocaleString()} <span className="text-gray-400 text-xs">
                  ({((value / data.totalPopulation) * 100).toFixed(1)}%)
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pirámide Poblacional
          </h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPoliticalOverlay(!showPoliticalOverlay)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${showPoliticalOverlay ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${showPoliticalOverlay ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Overlay político
            </span>
          </div>
          
          <div className="relative group">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Info className="h-5 w-5 text-gray-500" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-sm text-gray-600 dark:text-gray-400 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              La pirámide muestra la distribución de la población por edad y género. 
              El overlay político muestra la proporción con afinidad política activa.
            </div>
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
            <BarChart
              data={pyramidData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                type="number" 
                tickFormatter={formatYAxis}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                dataKey="ageGroup" 
                type="category" 
                width={60}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={formatTooltipValue}
              />
              <Legend 
                formatter={(value) => {
                  return value === 'male' ? 'Hombres' : 
                         value === 'female' ? 'Mujeres' : 
                         value === 'malePolitical' ? 'Hombres (Afinidad Política)' : 
                         'Mujeres (Afinidad Política)';
                }}
              />
              
              {/* Base population bars */}
              <Bar 
                dataKey="male" 
                fill="#93C5FD" 
                name="male"
                radius={[0, 4, 4, 0]}
              />
              <Bar 
                dataKey="female" 
                fill="#F9A8D4" 
                name="female"
                radius={[4, 0, 0, 4]}
              />
              
              {/* Political overlay bars */}
              {showPoliticalOverlay && (
                <>
                  <Bar 
                    dataKey="malePolitical" 
                    fill="#3B82F6" 
                    name="malePolitical"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar 
                    dataKey="femalePolitical" 
                    fill="#EC4899" 
                    name="femalePolitical"
                    radius={[4, 0, 0, 4]}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Población Total
            </span>
            <span className="text-sm font-bold text-blue-900 dark:text-blue-300">
              {data.totalPopulation.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-400">
            {filters.region === 'all' ? 'Perú' : data.regionName}
          </div>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
              Participación Electoral
            </span>
            <span className="text-sm font-bold text-purple-900 dark:text-purple-300">
              {data.electoralParticipation.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-400">
            Elecciones generales 2021
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Características demográficas clave
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Edad promedio: {data.averageAge} años</li>
          <li>• Ratio de género: {data.genderRatio.toFixed(2)} (H/M)</li>
          <li>• NSE predominante: {data.predominantNSE}</li>
          <li>• Población urbana: {data.urbanPercentage.toFixed(1)}%</li>
          <li>• Educación superior: {data.higherEducationPercentage.toFixed(1)}%</li>
        </ul>
      </div>
    </Card>
  );
};