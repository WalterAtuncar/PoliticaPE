import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  Filter, 
  Download, 
  MapPin, 
  Calendar, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AudienceData, SocialFilters } from '../../types/social';

interface AudienceInsightsProps {
  audience: AudienceData;
  isLoading: boolean;
  filters: SocialFilters;
}

const timeRanges = [
  { value: '1d', label: 'Hoy' },
  { value: '7d', label: 'Semana' },
  { value: '30d', label: 'Mes' },
  { value: '90d', label: '3 Meses' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const AudienceInsights: React.FC<AudienceInsightsProps> = ({
  audience,
  isLoading,
  filters,
}) => {
  const [localTimeRange, setLocalTimeRange] = useState('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Insights de Audiencia
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Análisis demográfico de seguidores
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">Todas las plataformas</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>

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

      {/* Audience Overview */}
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
                  Seguidores Totales
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(audience.totalFollowers / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{audience.followerGrowth.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Engagement Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {audience.engagementRate.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{audience.engagementGrowth.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Alcance Promedio
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(audience.averageReach / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{audience.reachGrowth.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
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
                  Sentiment Promedio
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {audience.averageSentiment > 0 ? '+' : ''}{audience.averageSentiment.toFixed(2)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{audience.sentimentGrowth.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Demographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Distribución por Edad y Género
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={audience.demographics.ageGender}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                <YAxis dataKey="age" type="category" stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Legend />
                <Bar dataKey="male" name="Masculino" fill="#3B82F6" />
                <Bar dataKey="female" name="Femenino" fill="#EC4899" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Distribución por NSE
            </h3>
            
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={audience.demographics.nse}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {audience.demographics.nse.map((entry, index) => (
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
          </Card>
        </motion.div>
      </div>

      {/* Geographic Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribución Geográfica
            </h3>
            <MapPin className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Región
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Seguidores
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    % del Total
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Engagement
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Sentiment
                  </th>
                </tr>
              </thead>
              <tbody>
                {audience.demographics.geographic.map((region, index) => (
                  <motion.tr
                    key={region.region}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                      {region.region}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {(region.followers / 1000).toFixed(1)}K
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {region.percentage.toFixed(1)}%
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {region.engagement.toFixed(1)}%
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${
                        region.sentiment > 0.1 ? 'text-green-600 dark:text-green-400' :
                        region.sentiment > -0.1 ? 'text-gray-600 dark:text-gray-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {region.sentiment > 0 ? '+' : ''}{region.sentiment.toFixed(2)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Audience Growth & Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Crecimiento de Audiencia
            </h3>
            
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={audience.growthOverTime}>
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
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="followers" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Seguidores"
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Engagement %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Intereses de la Audiencia
            </h3>
            
            <div className="space-y-3">
              {audience.interests.map((interest, index) => (
                <motion.div
                  key={interest.topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-32 truncate">
                    {interest.topic}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${interest.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {interest.percentage}%
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Political Affinity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Afinidad Política
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Distribución Ideológica
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={audience.politicalAffinity.ideology}>
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
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Afinidad por Partido
              </h4>
              <div className="space-y-3">
                {audience.politicalAffinity.parties.map((party, index) => (
                  <motion.div
                    key={party.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-32 truncate">
                      {party.name}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${party.percentage}%`,
                          backgroundColor: party.color
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                      {party.percentage}%
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
                Recomendaciones de Audiencia
              </h4>
            </div>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Priorizar contenido sobre economía y empleo, temas de mayor interés para la audiencia actual.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Desarrollar estrategia específica para Lima y Arequipa, regiones con mayor concentración de seguidores y alto engagement.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Incrementar contenido dirigido a segmento 26-35 años, grupo con mayor crecimiento y potencial de engagement.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Adaptar mensajes para audiencia de centro-derecha, segmento con mayor afinidad y receptividad a propuestas económicas.</span>
              </li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};