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
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  BarChart2, 
  Calendar, 
  Filter, 
  Download,
  MessageSquare,
  Heart,
  Share,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Competitor, SocialFilters } from '../../types/social';

interface CompetitorAnalysisProps {
  competitors: Competitor[];
  isLoading: boolean;
  filters: SocialFilters;
}

const timeRanges = [
  { value: '1d', label: 'Hoy' },
  { value: '7d', label: 'Semana' },
  { value: '30d', label: 'Mes' },
  { value: '90d', label: '3 Meses' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({
  competitors,
  isLoading,
  filters,
}) => {
  const [localTimeRange, setLocalTimeRange] = useState('30d');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const selectedCompetitorData = selectedCompetitor 
    ? competitors.find(c => c.id === selectedCompetitor) 
    : null;

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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-600 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Análisis de Competencia
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {competitors.length} competidores monitoreados
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

      {/* Share of Voice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Share of Voice
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={competitors.map(c => ({ name: c.name, value: c.shareOfVoice }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {competitors.map((entry, index) => (
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
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Competidores por Share of Voice
              </h4>
              <div className="space-y-3">
                {competitors
                  .sort((a, b) => b.shareOfVoice - a.shareOfVoice)
                  .map((competitor, index) => (
                    <motion.div
                      key={competitor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedCompetitor(selectedCompetitor === competitor.id ? null : competitor.id)}
                      className={`flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg cursor-pointer ${
                        selectedCompetitor === competitor.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {competitor.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {competitor.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {competitor.shareOfVoice.toFixed(1)}%
                        </div>
                        <div className="flex items-center text-xs">
                          {competitor.trend > 0 ? (
                            <>
                              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-green-600 dark:text-green-400">
                                +{competitor.trend}%
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-3 w-3 text-red-500 mr-1 transform rotate-180" />
                              <span className="text-red-600 dark:text-red-400">
                                {competitor.trend}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Engagement Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Comparativa de Engagement
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={competitors}>
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
              <Legend />
              <Bar dataKey="engagementRate" fill="#3B82F6" name="Engagement Rate %" />
              <Bar dataKey="postFrequency" fill="#10B981" name="Posts por Semana" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Selected Competitor Details */}
      {selectedCompetitorData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Análisis de {selectedCompetitorData.name}
              </h3>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Últimos 30 días
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Seguidores</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(selectedCompetitorData.followers)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      +{selectedCompetitorData.followerGrowth}%
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedCompetitorData.engagementRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      +{selectedCompetitorData.engagementGrowth}%
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </div>
              
              <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Posts/Semana</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedCompetitorData.postFrequency}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      +{selectedCompetitorData.postGrowth}%
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              
              <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Share of Voice</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedCompetitorData.shareOfVoice.toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      +{selectedCompetitorData.trend}%
                    </p>
                  </div>
                  <BarChart2 className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Over Time */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Evolución de Performance
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={selectedCompetitorData.performanceOverTime}>
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
                      dataKey="engagement" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Engagement"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="shareOfVoice" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Share of Voice"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Content Strategy */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Estrategia de Contenido
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Tipo de Contenido</span>
                      <span className="text-gray-900 dark:text-white">% del total</span>
                    </div>
                    {selectedCompetitorData.contentStrategy.contentTypes.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-16">
                          {item.type}
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white w-8 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Temas Principales</span>
                      <span className="text-gray-900 dark:text-white">% del total</span>
                    </div>
                    {selectedCompetitorData.contentStrategy.topics.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-24 truncate">
                          {item.topic}
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-purple-500"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white w-8 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Performing Content */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Contenido con Mejor Performance
              </h4>
              <div className="space-y-3">
                {selectedCompetitorData.topContent.map((content, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg"
                  >
                    <p className="text-sm text-gray-900 dark:text-white mb-2">
                      {content.text}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3 text-red-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatNumber(content.likes)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share className="h-3 w-3 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatNumber(content.shares)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3 text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {content.engagementRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-500">
                        {content.date}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Competitive Insights */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-blue-900 dark:text-blue-300">
                  Insights Competitivos
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                {selectedCompetitorData.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Competitive Landscape */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Panorama Competitivo
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Competidor
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Seguidores
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Engagement
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Posts/Semana
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Share of Voice
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Tendencia
                  </th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((competitor, index) => (
                  <motion.tr
                    key={competitor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedCompetitor(selectedCompetitor === competitor.id ? null : competitor.id)}
                    className={`border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer ${
                      selectedCompetitor === competitor.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {competitor.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {competitor.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {formatNumber(competitor.followers)}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {competitor.engagementRate.toFixed(1)}%
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {competitor.postFrequency}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                      {competitor.shareOfVoice.toFixed(1)}%
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        {competitor.trend > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />
                        )}
                        <span className={`font-medium ${
                          competitor.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {competitor.trend > 0 ? '+' : ''}{competitor.trend}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Content Gap Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Análisis de Content Gaps
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Oportunidades Temáticas
              </h4>
              <div className="space-y-3">
                {[
                  { 
                    topic: 'Propuestas de Educación Superior', 
                    competitorCoverage: 25, 
                    audienceInterest: 78,
                    opportunity: 'Alta'
                  },
                  { 
                    topic: 'Desarrollo Económico Regional', 
                    competitorCoverage: 35, 
                    audienceInterest: 82,
                    opportunity: 'Alta'
                  },
                  { 
                    topic: 'Seguridad Ciudadana', 
                    competitorCoverage: 65, 
                    audienceInterest: 90,
                    opportunity: 'Media'
                  },
                  { 
                    topic: 'Infraestructura Vial', 
                    competitorCoverage: 30, 
                    audienceInterest: 65,
                    opportunity: 'Media'
                  },
                  { 
                    topic: 'Políticas Ambientales', 
                    competitorCoverage: 20, 
                    audienceInterest: 72,
                    opportunity: 'Alta'
                  },
                ].map((topic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {topic.topic}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        topic.opportunity === 'Alta' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {topic.opportunity}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Cobertura competidores</span>
                          <span className="font-medium text-gray-900 dark:text-white">{topic.competitorCoverage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-red-500"
                            style={{ width: `${topic.competitorCoverage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Interés audiencia</span>
                          <span className="font-medium text-gray-900 dark:text-white">{topic.audienceInterest}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-green-500"
                            style={{ width: `${topic.audienceInterest}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Gaps por Plataforma
              </h4>
              <div className="space-y-3">
                {[
                  { 
                    platform: 'TikTok', 
                    competitorPresence: 35, 
                    audiencePresence: 85,
                    opportunity: 'Alta'
                  },
                  { 
                    platform: 'Instagram', 
                    competitorPresence: 65, 
                    audiencePresence: 80,
                    opportunity: 'Media'
                  },
                  { 
                    platform: 'Twitter', 
                    competitorPresence: 85, 
                    audiencePresence: 75,
                    opportunity: 'Baja'
                  },
                  { 
                    platform: 'YouTube', 
                    competitorPresence: 45, 
                    audiencePresence: 70,
                    opportunity: 'Media'
                  },
                  { 
                    platform: 'Facebook', 
                    competitorPresence: 80, 
                    audiencePresence: 65,
                    opportunity: 'Baja'
                  },
                ].map((platform, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {platform.platform}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        platform.opportunity === 'Alta' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : platform.opportunity === 'Media'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {platform.opportunity}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Presencia competidores</span>
                          <span className="font-medium text-gray-900 dark:text-white">{platform.competitorPresence}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${platform.competitorPresence}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Presencia audiencia</span>
                          <span className="font-medium text-gray-900 dark:text-white">{platform.audiencePresence}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-purple-500"
                            style={{ width: `${platform.audiencePresence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Strategic Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-blue-900 dark:text-blue-300">
                Recomendaciones Estratégicas
              </h4>
            </div>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Incrementar presencia en TikTok con contenido enfocado en propuestas educativas para captar audiencia joven sub-representada por competidores.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Desarrollar serie de contenidos sobre políticas ambientales y desarrollo económico regional, temas con alto interés de audiencia y baja cobertura competitiva.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Aumentar frecuencia de publicación en Instagram con enfoque en contenido visual de alta calidad para competir con el creciente engagement de Fuerza Popular en esta plataforma.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Implementar estrategia de respuesta rápida a temas de coyuntura para mejorar share of voice, aprovechando que los competidores tardan en promedio 6 horas en reaccionar a eventos políticos.</span>
              </li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};