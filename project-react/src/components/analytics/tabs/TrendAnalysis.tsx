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
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, Calendar, AlertTriangle, Target } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';

interface TrendAnalysisProps {
  filters: AnalyticsFilters;
}

const timeSeriesData = [
  { date: '01/11', mentions: 1200, sentiment: 0.12, events: 2 },
  { date: '08/11', mentions: 1350, sentiment: 0.18, events: 1 },
  { date: '15/11', mentions: 2100, sentiment: -0.05, events: 4 },
  { date: '22/11', mentions: 1800, sentiment: 0.08, events: 2 },
  { date: '29/11', mentions: 1950, sentiment: 0.22, events: 3 },
  { date: '06/12', mentions: 2300, sentiment: 0.15, events: 5 },
  { date: '13/12', mentions: 2150, sentiment: 0.28, events: 2 },
];

const politicalEvents = [
  {
    date: '15/11/2024',
    event: 'Debate sobre Reforma Constitucional',
    impact: 'high',
    sentiment_change: -0.17,
    mentions_spike: 75,
  },
  {
    date: '06/12/2024',
    event: 'Anuncio de Medidas Económicas',
    impact: 'high',
    sentiment_change: 0.13,
    mentions_spike: 85,
  },
  {
    date: '29/11/2024',
    event: 'Crisis en el Congreso',
    impact: 'medium',
    sentiment_change: -0.08,
    mentions_spike: 45,
  },
  {
    date: '22/11/2024',
    event: 'Manifestaciones en Lima',
    impact: 'medium',
    sentiment_change: -0.12,
    mentions_spike: 60,
  },
];

const forecastData = [
  { date: '20/12', actual: 2150, predicted: null, confidence: null },
  { date: '27/12', actual: null, predicted: 2280, confidence: 85 },
  { date: '03/01', actual: null, predicted: 2420, confidence: 78 },
  { date: '10/01', actual: null, predicted: 2350, confidence: 72 },
  { date: '17/01', actual: null, predicted: 2500, confidence: 68 },
  { date: '24/01', actual: null, predicted: 2650, confidence: 65 },
];

const cyclicalData = [
  { month: 'Ene', mentions: 1800, sentiment: 0.15, year: '2023' },
  { month: 'Feb', mentions: 1650, sentiment: 0.08, year: '2023' },
  { month: 'Mar', mentions: 1900, sentiment: 0.22, year: '2023' },
  { month: 'Abr', mentions: 2100, sentiment: 0.18, year: '2023' },
  { month: 'May', mentions: 1750, sentiment: 0.12, year: '2023' },
  { month: 'Jun', mentions: 1850, sentiment: 0.25, year: '2023' },
  { month: 'Jul', mentions: 2200, sentiment: -0.05, year: '2023' },
  { month: 'Ago', mentions: 2050, sentiment: 0.08, year: '2023' },
  { month: 'Sep', mentions: 1950, sentiment: 0.18, year: '2023' },
  { month: 'Oct', mentions: 2300, sentiment: 0.12, year: '2023' },
  { month: 'Nov', mentions: 2150, sentiment: 0.28, year: '2023' },
  { month: 'Dic', mentions: 1900, sentiment: 0.15, year: '2023' },
];

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ filters }) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
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
                  Tendencia General
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ↗ Positiva
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +18.5% este mes
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
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
                  Eventos Detectados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  4 de alto impacto
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
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
                  Predicción 30d
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  2.5K
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  65% confianza
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
                  Volatilidad
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Alta
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  ±35% variación
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Time Series Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentions and Sentiment Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Evolución Temporal
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mentions"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Menciones"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Sentiment"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Predicción de Menciones
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Datos Reales"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  name="Predicción"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Political Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Eventos Políticos Significativos
          </h3>
          <div className="space-y-4">
            {politicalEvents.map((event, index) => (
              <motion.div
                key={event.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {event.event}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(event.impact)}`}>
                        {event.impact === 'high' ? 'Alto Impacto' : 
                         event.impact === 'medium' ? 'Impacto Medio' : 'Bajo Impacto'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.date}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cambio en Sentiment</span>
                    <p className={`font-medium ${
                      event.sentiment_change > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {event.sentiment_change > 0 ? '+' : ''}{event.sentiment_change.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Incremento Menciones</span>
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                      +{event.mentions_spike}%
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Cyclical Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Análisis de Ciclos Estacionales
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cyclicalData}>
              <defs>
                <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
              <Area
                type="monotone"
                dataKey="mentions"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMentions)"
                name="Menciones"
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              Patrones Identificados
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Picos de actividad en abril y octubre (períodos electorales)</li>
              <li>• Menor actividad en febrero y mayo (períodos vacacionales)</li>
              <li>• Incremento sostenido en el último trimestre del año</li>
              <li>• Correlación positiva con eventos políticos nacionales</li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};