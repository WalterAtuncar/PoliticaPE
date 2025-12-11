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
  BarChart2, 
  TrendingUp, 
  Heart, 
  MessageSquare, 
  Share, 
  Bookmark, 
  Eye, 
  Calendar,
  Filter,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Music
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SocialMetrics, SocialFilters } from '../../types/social';

interface EngagementAnalysisProps {
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

const contentTypes = [
  { value: 'all', label: 'Todo' },
  { value: 'text', label: 'Texto' },
  { value: 'image', label: 'Imagen' },
  { value: 'video', label: 'Video' },
  { value: 'link', label: 'Enlaces' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Platform icons mapping
const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music,
  linkedin: MessageSquare,
};

// Platform colors mapping
const platformColors = {
  twitter: '#1DA1F2',
  facebook: '#4267B2',
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#000000',
  linkedin: '#0077B5',
};

// Helper function to format time ago
const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `hace ${minutes} min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `hace ${hours}h`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `hace ${days}d`;
  }
};

export const EngagementAnalysis: React.FC<EngagementAnalysisProps> = ({
  metrics,
  isLoading,
  filters,
}) => {
  const [localTimeRange, setLocalTimeRange] = useState('30d');
  const [contentType, setContentType] = useState('all');

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
      {/* Overview Metrics */}
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
                  Engagement Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.overallEngagementRate.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{metrics.engagementRateChange.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                  Total Interacciones
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(metrics.totalEngagements / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{metrics.engagementsChange.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                  Alcance Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(metrics.totalReach / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{metrics.reachChange.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                  Publicaciones
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalPosts}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{metrics.postsChange.toFixed(1)}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Engagement by Platform */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Engagement por Plataforma
              </h3>
              <div className="flex items-center space-x-2">
                <select
                  value={localTimeRange}
                  onChange={(e) => setLocalTimeRange(e.target.value)}
                  className="text-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-1"
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.engagementByPlatform}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="platform" stroke="#6B7280" fontSize={12} />
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
                <Bar dataKey="likes" fill="#EF4444" name="Likes" />
                <Bar dataKey="comments" fill="#3B82F6" name="Comentarios" />
                <Bar dataKey="shares" fill="#10B981" name="Compartidos" />
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Engagement por Tipo de Contenido
              </h3>
              <div className="flex items-center space-x-2">
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="text-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-1"
                >
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.engagementByContentType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {metrics.engagementByContentType.map((entry, index) => (
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
          </Card>
        </motion.div>
      </div>

      {/* Engagement Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Evolución del Engagement
            </h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Últimos 30 días
              </span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.engagementOverTime}>
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
                dataKey="twitter" 
                stroke="#1DA1F2" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="facebook" 
                stroke="#4267B2" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="instagram" 
                stroke="#E4405F" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="tiktok" 
                stroke="#000000" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="youtube" 
                stroke="#FF0000" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Top Performing Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contenido con Mejor Performance
            </h3>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
          
          <div className="space-y-4">
            {metrics.topPerformingContent.map((content, index) => {
              const PlatformIcon = platformIcons[content.platform as keyof typeof platformIcons] || MessageSquare;
              
              return (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <PlatformIcon 
                        className="h-5 w-5" 
                        style={{ color: platformColors[content.platform as keyof typeof platformColors] || '#6B7280' }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-2">
                        {content.content}
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{content.author}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(content.date)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {(content.likes / 1000).toFixed(1)}K
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {content.engagementRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="outline">
              Ver más contenido
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Engagement Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Insights de Engagement
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3">
                Mejores Horarios para Publicar
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800 dark:text-blue-400">Twitter</span>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Lun-Vie 7-9am, 6-8pm
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800 dark:text-blue-400">Facebook</span>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Lun-Jue 12-3pm, Dom 9-11am
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800 dark:text-blue-400">Instagram</span>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Lun-Vie 11am-1pm, 7-9pm
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-300 mb-3">
                Tipos de Contenido Más Efectivos
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800 dark:text-green-400">Jóvenes (18-25)</span>
                  <span className="text-sm font-medium text-green-900 dark:text-green-300">
                    Videos cortos, Infografías
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800 dark:text-green-400">Adultos (26-45)</span>
                  <span className="text-sm font-medium text-green-900 dark:text-green-300">
                    Artículos, Testimonios
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800 dark:text-green-400">Adultos (46+)</span>
                  <span className="text-sm font-medium text-green-900 dark:text-green-300">
                    Noticias, Entrevistas
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-3">
              Recomendaciones para Aumentar Engagement
            </h4>
            <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-400">
              <li className="flex items-start space-x-2">
                <span className="text-purple-500">•</span>
                <span>Incrementar frecuencia de publicación en Twitter durante horarios matutinos (7-9am) para captar audiencia profesional.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500">•</span>
                <span>Priorizar contenido visual (infografías, videos cortos) para audiencia joven en Instagram y TikTok.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500">•</span>
                <span>Implementar estrategia de hashtags regionales para incrementar alcance en zonas específicas (Lima, Arequipa, Cusco).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500">•</span>
                <span>Aumentar interacción con comentarios para mejorar algoritmo de visibilidad, especialmente en Facebook.</span>
              </li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};