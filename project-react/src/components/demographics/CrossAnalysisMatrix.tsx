import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Grid, RefreshCw, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { DemographicFilters, DemographicData } from '../../types/demographics';

interface CrossAnalysisMatrixProps {
  data: DemographicData;
  isLoading: boolean;
  filters: DemographicFilters;
}

type AxisVariable = 'age' | 'nse' | 'education' | 'urbanRural' | 'sentiment' | 'engagement' | 'participation';

const axisOptions = [
  { value: 'age', label: 'Edad Promedio' },
  { value: 'nse', label: 'NSE' },
  { value: 'education', label: 'Nivel Educativo' },
  { value: 'urbanRural', label: 'Urbanidad' },
  { value: 'sentiment', label: 'Sentiment Político' },
  { value: 'engagement', label: 'Engagement Político' },
  { value: 'participation', label: 'Participación Electoral' },
];

export const CrossAnalysisMatrix: React.FC<CrossAnalysisMatrixProps> = ({
  data,
  isLoading,
  filters,
}) => {
  const [xAxis, setXAxis] = useState<AxisVariable>('nse');
  const [yAxis, setYAxis] = useState<AxisVariable>('education');

  // Transform data for the scatter plot
  const scatterData = data.regions.map(region => {
    const getAxisValue = (axis: AxisVariable) => {
      switch (axis) {
        case 'age': return region.averageAge;
        case 'nse': return region.nseIndex;
        case 'education': return region.educationIndex;
        case 'urbanRural': return region.urbanPercentage;
        case 'sentiment': return region.politicalSentiment;
        case 'engagement': return region.politicalEngagement;
        case 'participation': return region.electoralParticipation;
        default: return 0;
      }
    };

    return {
      name: region.name,
      x: getAxisValue(xAxis),
      y: getAxisValue(yAxis),
      population: region.population,
      sentiment: region.politicalSentiment,
    };
  });

  const getAxisLabel = (axis: AxisVariable) => {
    return axisOptions.find(option => option.value === axis)?.label || '';
  };

  const getAxisDomain = (axis: AxisVariable): [number, number] => {
    switch (axis) {
      case 'age': return [15, 60];
      case 'nse': return [0, 100];
      case 'education': return [0, 100];
      case 'urbanRural': return [0, 100];
      case 'sentiment': return [-1, 1];
      case 'engagement': return [0, 15];
      case 'participation': return [50, 100];
      default: return [0, 100];
    }
  };

  const getPointColor = (sentiment: number) => {
    if (sentiment > 0.2) return '#10B981'; // Green
    if (sentiment > 0) return '#84CC16'; // Light green
    if (sentiment > -0.2) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getPointSize = (population: number) => {
    const maxPopulation = Math.max(...data.regions.map(r => r.population));
    const minSize = 10;
    const maxSize = 50;
    return minSize + (population / maxPopulation) * (maxSize - minSize);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/90 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
          <p className="text-white font-medium mb-1">{data.name}</p>
          <p className="text-sm text-blue-400">
            {getAxisLabel(xAxis)}: {data.x.toLocaleString(undefined, {maximumFractionDigits: 2})}
          </p>
          <p className="text-sm text-purple-400">
            {getAxisLabel(yAxis)}: {data.y.toLocaleString(undefined, {maximumFractionDigits: 2})}
          </p>
          <p className="text-sm text-gray-300">
            Población: {data.population.toLocaleString()} habitantes
          </p>
          <p className="text-sm" style={{ color: getPointColor(data.sentiment) }}>
            Sentiment: {data.sentiment > 0 ? '+' : ''}{data.sentiment.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Grid className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Matriz de Análisis Cruzado
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const randomX = axisOptions[Math.floor(Math.random() * axisOptions.length)].value as AxisVariable;
              const randomY = axisOptions[Math.floor(Math.random() * axisOptions.length)].value as AxisVariable;
              if (randomX !== randomY) {
                setXAxis(randomX);
                setYAxis(randomY);
              }
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Cambiar variables aleatoriamente"
          >
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </button>
          
          <div className="relative group">
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Info className="h-5 w-5 text-gray-500" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-sm text-gray-600 dark:text-gray-400 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              Cada punto representa una región. El tamaño del punto indica la población, 
              y el color indica el sentiment político (verde = positivo, rojo = negativo).
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Eje X
          </label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value as AxisVariable)}
            className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {axisOptions.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.value === yAxis}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Eje Y
          </label>
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value as AxisVariable)}
            className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {axisOptions.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.value === xAxis}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={getAxisLabel(xAxis)} 
                domain={getAxisDomain(xAxis)}
                label={{ 
                  value: getAxisLabel(xAxis), 
                  position: 'bottom',
                  style: { fill: '#6B7280', fontSize: 12 }
                }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={getAxisLabel(yAxis)} 
                domain={getAxisDomain(yAxis)}
                label={{ 
                  value: getAxisLabel(yAxis), 
                  angle: -90, 
                  position: 'left',
                  style: { fill: '#6B7280', fontSize: 12 }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Regiones" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getPointColor(entry.sentiment)}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Sentiment positivo</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Sentiment neutral</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Sentiment negativo</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Tamaño = Población
        </div>
      </div>
    </Card>
  );
};