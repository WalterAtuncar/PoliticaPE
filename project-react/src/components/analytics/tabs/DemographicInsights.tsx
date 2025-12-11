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
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, TrendingUp, Target, Filter } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';

interface DemographicInsightsProps {
  filters: AnalyticsFilters;
}

const ageGroupData = [
  { age: '18-25', positive: 35, negative: 45, neutral: 20, total: 2800 },
  { age: '26-35', positive: 42, negative: 38, neutral: 20, total: 3200 },
  { age: '36-50', positive: 48, negative: 32, neutral: 20, total: 2900 },
  { age: '50+', positive: 52, negative: 28, neutral: 20, total: 1850 },
];

const nseData = [
  { nse: 'NSE A', sentiment: 0.25, engagement: 9.2, population: 850000 },
  { nse: 'NSE B', sentiment: 0.18, engagement: 8.5, population: 2100000 },
  { nse: 'NSE C', sentiment: 0.08, engagement: 7.1, population: 8900000 },
  { nse: 'NSE D', sentiment: -0.05, engagement: 6.2, population: 12500000 },
  { nse: 'NSE E', sentiment: -0.12, engagement: 5.8, population: 4200000 },
];

const genderData = [
  { gender: 'Masculino', mentions: 5200, sentiment: 0.12, engagement: 7.8 },
  { gender: 'Femenino', mentions: 4800, sentiment: 0.18, engagement: 8.2 },
];

const correlationData = [
  { nse: 'A', age: 35, sentiment: 0.25, size: 850 },
  { nse: 'B', age: 32, sentiment: 0.18, size: 2100 },
  { nse: 'C', age: 38, sentiment: 0.08, size: 8900 },
  { nse: 'D', age: 42, sentiment: -0.05, size: 12500 },
  { nse: 'E', age: 45, sentiment: -0.12, size: 4200 },
];

const segmentationData = [
  {
    segment: 'Jóvenes Urbanos (18-35, NSE A-B)',
    size: 1250000,
    sentiment: 0.22,
    engagement: 9.1,
    topics: ['Tecnología', 'Empleo', 'Educación'],
  },
  {
    segment: 'Clase Media (26-50, NSE C)',
    size: 4200000,
    sentiment: 0.08,
    engagement: 7.2,
    topics: ['Economía', 'Salud', 'Seguridad'],
  },
  {
    segment: 'Adultos Mayores (50+, NSE C-D)',
    size: 2800000,
    sentiment: 0.15,
    engagement: 6.5,
    topics: ['Pensiones', 'Salud', 'Familia'],
  },
  {
    segment: 'Sectores Populares (NSE D-E)',
    size: 8900000,
    sentiment: -0.08,
    engagement: 5.9,
    topics: ['Trabajo', 'Servicios Básicos', 'Transporte'],
  },
];

export const DemographicInsights: React.FC<DemographicInsightsProps> = ({ filters }) => {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'text-green-600 dark:text-green-400';
    if (sentiment > -0.1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Demographic Overview */}
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
                  Segmento Dominante
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  26-35 años
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  32% del total
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
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
                  NSE Más Activo
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  NSE A
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  9.2% engagement
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
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
                  Género Líder
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  Femenino
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  8.2% engagement
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
                  Segmentos Activos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  De 15 identificados
                </p>
              </div>
              <Filter className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Age and NSE Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Group Sentiment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sentiment por Grupo Etario
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageGroupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="age" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Bar dataKey="positive" fill="#10B981" name="Positivo" />
                <Bar dataKey="negative" fill="#EF4444" name="Negativo" />
                <Bar dataKey="neutral" fill="#6B7280" name="Neutral" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* NSE Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Análisis por NSE
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nseData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                <YAxis dataKey="nse" type="category" stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Bar dataKey="engagement" fill="#8B5CF6" name="Engagement %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Gender Analysis and Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Análisis por Género
            </h3>
            <div className="space-y-4">
              {genderData.map((gender, index) => (
                <motion.div
                  key={gender.gender}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {gender.gender}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      gender.sentiment > 0 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {gender.sentiment > 0 ? '+' : ''}{gender.sentiment.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Menciones</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {gender.mentions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {gender.engagement}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Correlation Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Correlación NSE vs Sentiment
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="sentiment" 
                  stroke="#6B7280" 
                  fontSize={12}
                  name="Sentiment"
                />
                <YAxis 
                  dataKey="age" 
                  stroke="#6B7280" 
                  fontSize={12}
                  name="Edad Promedio"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                  formatter={(value, name) => [
                    name === 'sentiment' ? `${value}` : `${value} años`,
                    name === 'sentiment' ? 'Sentiment' : 'Edad Promedio'
                  ]}
                />
                <Scatter 
                  dataKey="sentiment" 
                  fill="#3B82F6"
                  r={8}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Segmentation Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Segmentación Demográfica Avanzada
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {segmentationData.map((segment, index) => (
              <motion.div
                key={segment.segment}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {segment.segment}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(segment.sentiment).includes('green') ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : segment.sentiment > -0.1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {segment.sentiment > 0 ? '+' : ''}{segment.sentiment.toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Tamaño</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {(segment.size / 1000000).toFixed(1)}M personas
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {segment.engagement}%
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Temas principales</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {segment.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};