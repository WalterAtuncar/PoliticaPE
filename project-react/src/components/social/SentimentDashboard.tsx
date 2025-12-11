import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Heart, 
  Calendar, 
  Filter, 
  Download, 
  MapPin, 
  Users, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SocialMetrics, SocialFilters } from '../../types/social';

interface SentimentDashboardProps {
  metrics: SocialMetrics;
  isLoading: boolean;
  filters: SocialFilters;
}

const timeRanges = [
  { value: '1d', label: 'Hoy' },
  { value: '7d', label: 'Semana' },
  { value: '30d', label: 'Mes' },
  { value: '90d', label: '3 Meses' },
];

const COLORS = ['#10B981', '#6B7280', '#EF4444'];

export const SentimentDashboard: React.FC<SentimentDashboardProps> = ({
  metrics,
  isLoading,
  filters,
}) => {
  const [localTimeRange, setLocalTimeRange] = useState('30d');

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return '#10B981'; // Green
    if (sentiment > -0.2) return '#6B7280'; // Gray
    return '#EF4444'; // Red
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.2) return 'Positivo';
    if (sentiment > -0.2) return 'Neutral';
    return 'Negativo';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Card glass className="p-6">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card glass className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Análisis de Sentiment
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitoreo de percepción en redes sociales
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <select
                value={localTimeRange}
                onChange={(e) => setLocalTimeRange(e.target.value)}
                className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-1 text-sm"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass className="p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Distribución de Sentiment
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.sentimentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {metrics.sentimentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Positivo</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Neutral</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Negativo</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card glass className="p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Sentiment Score Promedio
            </h3>
            <div className="flex flex-col items-center justify-center h-48">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="10"
                  />
                  
                  {/* Colored arc based on sentiment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getSentimentColor(metrics.averageSentiment)}
                    strokeWidth="10"
                    strokeDasharray={`${Math.abs(metrics.averageSentiment) * 141.3} 283`}
                    strokeDashoffset={metrics.averageSentiment < 0 ? 0 : 141.3}
                    transform="rotate(-90 50 50)"
                  />
                  
                  {/* Needle */}
                  <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="10"
                    stroke="#1F2937"
                    strokeWidth="2"
                    transform={`rotate(${metrics.averageSentiment * 90 + 90} 50 50)`}
                  />
                  
                  {/* Center circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="5"
                    fill="#1F2937"
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: getSentimentColor(metrics.averageSentiment) }}
                  >
                    {metrics.averageSentiment.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getSentimentLabel(metrics.averageSentiment)}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-4">
                Escala: -1.0 (Negativo) a +1.0 (Positivo)
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card glass className="p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Emociones Detectadas
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.emotionsDetected}>
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
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Sentiment Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Evolución del Sentiment
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.sentimentOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} domain={[-1, 1]} />
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
                dataKey="sentiment" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {/* Event Markers */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              Eventos Clave
            </h4>
            <div className="space-y-2">
              {[
                { date: '15/12/2024', event: 'Debate Presidencial', impact: -0.15 },
                { date: '08/12/2024', event: 'Aprobación Reforma Tributaria', impact: 0.22 },
                { date: '03/12/2024', event: 'Manifestaciones Lima Centro', impact: -0.18 },
              ].map((event, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-800 dark:text-blue-400">{event.date}</span>
                    <span className="text-blue-800 dark:text-blue-400">-</span>
                    <span className="text-blue-800 dark:text-blue-400">{event.event}</span>
                  </div>
                  <span className={`font-medium ${
                    event.impact > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {event.impact > 0 ? '+' : ''}{event.impact.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Sentiment by Region and Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sentiment por Región
              </h3>
              <MapPin className="h-5 w-5 text-gray-500" />
            </div>
            
            <div className="space-y-3">
              {metrics.sentimentByRegion.map((region, index) => (
                <motion.div
                  key={region.region}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-24">
                    {region.region}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${((region.sentiment + 1) / 2) * 100}%`,
                        backgroundColor: getSentimentColor(region.sentiment)
                      }}
                    ></div>
                  </div>
                  <span 
                    className="text-sm font-medium w-16 text-right"
                    style={{ color: getSentimentColor(region.sentiment) }}
                  >
                    {region.sentiment.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sentiment por Demografía
              </h3>
              <Users className="h-5 w-5 text-gray-500" />
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Por Edad
                </h4>
                <div className="space-y-3">
                  {metrics.sentimentByDemographics.age.map((item, index) => (
                    <motion.div
                      key={item.group}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-24">
                        {item.group}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${((item.sentiment + 1) / 2) * 100}%`,
                            backgroundColor: getSentimentColor(item.sentiment)
                          }}
                        ></div>
                      </div>
                      <span 
                        className="text-sm font-medium w-16 text-right"
                        style={{ color: getSentimentColor(item.sentiment) }}
                      >
                        {item.sentiment.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Por NSE
                </h4>
                <div className="space-y-3">
                  {metrics.sentimentByDemographics.nse.map((item, index) => (
                    <motion.div
                      key={item.group}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-24">
                        {item.group}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${((item.sentiment + 1) / 2) * 100}%`,
                            backgroundColor: getSentimentColor(item.sentiment)
                          }}
                        ></div>
                      </div>
                      <span 
                        className="text-sm font-medium w-16 text-right"
                        style={{ color: getSentimentColor(item.sentiment) }}
                      >
                        {item.sentiment.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Sentiment Drivers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Drivers de Sentiment
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Factores Positivos
              </h4>
              <div className="space-y-3">
                {metrics.sentimentDrivers.positive.map((driver, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <span className="text-sm font-medium text-green-900 dark:text-green-300">
                      {driver.topic}
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      +{driver.impact.toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Factores Negativos
              </h4>
              <div className="space-y-3">
                {metrics.sentimentDrivers.negative.map((driver, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  >
                    <span className="text-sm font-medium text-red-900 dark:text-red-300">
                      {driver.topic}
                    </span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      {driver.impact.toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-blue-900 dark:text-blue-300">
                Recomendaciones para Mejorar Sentiment
              </h4>
            </div>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Incrementar comunicación sobre propuestas de desarrollo económico regional y generación de empleo, temas con impacto positivo significativo.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Desarrollar narrativa proactiva sobre seguridad ciudadana para contrarrestar sentiment negativo, enfocando en soluciones concretas y resultados medibles.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Priorizar comunicación dirigida a segmentos NSE C y D, donde el sentiment muestra tendencia negativa, con mensajes adaptados a sus preocupaciones específicas.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Implementar estrategia de gestión de crisis para La Libertad, región con sentiment más bajo, mediante contenido localizado y abordaje directo de problemáticas regionales.</span>
              </li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};