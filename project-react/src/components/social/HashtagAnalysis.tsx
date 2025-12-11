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
  Legend
} from 'recharts';
import { 
  Hash, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Hashtag, SocialFilters } from '../../types/social';

interface HashtagAnalysisProps {
  hashtags: Hashtag[];
  isLoading: boolean;
  filters: SocialFilters;
}

const timeRanges = [
  { value: '1d', label: 'Hoy' },
  { value: '7d', label: 'Semana' },
  { value: '30d', label: 'Mes' },
  { value: '90d', label: '3 Meses' },
];

// Platform icons mapping
const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: MessageSquare, // Using MessageSquare as fallback for TikTok
  whatsapp: MessageSquare,
  telegram: MessageSquare,
  reddit: MessageSquare,
  default: MessageSquare
};

// Platform colors mapping
const platformColors = {
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  whatsapp: '#25D366',
  telegram: '#0088CC',
  reddit: '#FF4500',
  default: '#6B7280'
};

export const HashtagAnalysis: React.FC<HashtagAnalysisProps> = ({
  hashtags,
  isLoading,
  filters,
}) => {
  const [localTimeRange, setLocalTimeRange] = useState('7d');
  const [sortBy, setSortBy] = useState<'volume' | 'growth' | 'engagement'>('volume');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  const sortedHashtags = [...hashtags].sort((a, b) => {
    if (sortBy === 'volume') return b.volume - a.volume;
    if (sortBy === 'growth') return b.growthRate - a.growthRate;
    return b.engagementRate - a.engagementRate;
  });

  const selectedHashtagData = selectedHashtag 
    ? hashtags.find(h => h.id === selectedHashtag) 
    : null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Hash className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Análisis de Hashtags
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hashtags.length} hashtags monitoreados
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Controls */}
            <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setSortBy('volume')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  sortBy === 'volume' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Volumen
              </button>
              <button
                onClick={() => setSortBy('growth')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  sortBy === 'growth' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Crecimiento
              </button>
              <button
                onClick={() => setSortBy('engagement')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  sortBy === 'engagement' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Engagement
              </button>
            </div>

            {/* Time Range */}
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

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Hashtag Cloud */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Nube de Hashtags
          </h3>
          
          <div className="bg-white/30 dark:bg-gray-800/30 rounded-lg p-8 flex flex-wrap items-center justify-center gap-4">
            {sortedHashtags.map((hashtag, index) => {
              const fontSize = 12 + (hashtag.volume / sortedHashtags[0].volume) * 20;
              const color = hashtag.sentiment > 0.2 ? '#10B981' : 
                           hashtag.sentiment > -0.2 ? '#6B7280' : '#EF4444';
              
              return (
                <motion.div
                  key={hashtag.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setSelectedHashtag(selectedHashtag === hashtag.id ? null : hashtag.id)}
                  className="cursor-pointer relative group"
                >
                  <span 
                    style={{ 
                      fontSize: `${fontSize}px`,
                      color: color,
                      fontWeight: hashtag.volume > sortedHashtags[Math.floor(sortedHashtags.length / 3)].volume ? 'bold' : 'normal'
                    }}
                    className="transition-all duration-200 hover:scale-110"
                  >
                    #{hashtag.name}
                  </span>
                  
                  {hashtag.growthRate > 50 && (
                    <div className="absolute -top-2 -right-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    <div className="font-medium">{formatNumber(hashtag.volume)} menciones</div>
                    <div>Crecimiento: {hashtag.growthRate > 0 ? '+' : ''}{hashtag.growthRate}%</div>
                    <div>Engagement: {hashtag.engagementRate.toFixed(1)}%</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Top Hashtags Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Top Hashtags Políticos
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Hashtag
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Volumen
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Crecimiento
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Engagement
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Sentiment
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Plataformas
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedHashtags.slice(0, 10).map((hashtag, index) => (
                  <motion.tr
                    key={hashtag.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedHashtag(selectedHashtag === hashtag.id ? null : hashtag.id)}
                    className={`border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer ${
                      selectedHashtag === hashtag.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                      #{hashtag.name}
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {formatNumber(hashtag.volume)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        {hashtag.growthRate > 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-medium ${
                          hashtag.growthRate > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {hashtag.growthRate > 0 ? '+' : ''}{hashtag.growthRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {hashtag.engagementRate.toFixed(1)}%
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${
                        hashtag.sentiment > 0.2 ? 'text-green-600 dark:text-green-400' :
                        hashtag.sentiment > -0.2 ? 'text-gray-600 dark:text-gray-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {hashtag.sentiment > 0 ? '+' : ''}{hashtag.sentiment.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-1">
                        {hashtag.platforms.map((platform) => {
                          const PlatformIcon = platformIcons[platform as keyof typeof platformIcons] || platformIcons.default;
                          return (
                            <PlatformIcon 
                              key={platform} 
                              className="h-4 w-4" 
                              style={{ color: platformColors[platform as keyof typeof platformColors] || platformColors.default }}
                            />
                          );
                        })}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Selected Hashtag Details */}
      {selectedHashtagData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Análisis de #{selectedHashtagData.name}
              </h3>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Últimos 7 días
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volume Over Time */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Evolución de Volumen
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={selectedHashtagData.volumeOverTime}>
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
                      dataKey="volume" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Platform Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Distribución por Plataforma
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={selectedHashtagData.platformDistribution}>
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
                    <Bar dataKey="volume" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Related Hashtags & Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Hashtags Relacionados
                </h4>
                <div className="space-y-2">
                  {selectedHashtagData.relatedHashtags.map((related, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        #{related.name}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {related.coOccurrenceRate}% co-ocurrencia
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Eventos Relacionados
                </h4>
                <div className="space-y-2">
                  {selectedHashtagData.relatedEvents.map((event, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.name}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {event.date}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Insights */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-blue-900 dark:text-blue-300">
                  Insights
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span>Este hashtag muestra un crecimiento sostenido de {selectedHashtagData.growthRate}% en la última semana, correlacionado con eventos políticos recientes.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span>Mayor actividad en {selectedHashtagData.platformDistribution[0].platform}, sugiriendo enfocar esfuerzos en esta plataforma para maximizar alcance.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500">•</span>
                  <span>El sentiment general es {selectedHashtagData.sentiment > 0 ? 'positivo' : selectedHashtagData.sentiment < 0 ? 'negativo' : 'neutral'}, con oportunidad de amplificar mensajes alineados.</span>
                </li>
              </ul>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Trending Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Análisis de Tendencias
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Hashtags Emergentes
              </h4>
              <div className="space-y-3">
                {sortedHashtags
                  .filter(h => h.growthRate > 50)
                  .slice(0, 5)
                  .map((hashtag, index) => (
                    <motion.div
                      key={hashtag.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          #{hashtag.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-green-600 dark:text-green-400">
                          +{hashtag.growthRate}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatNumber(hashtag.volume)} menciones
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Correlación con Eventos Políticos
              </h4>
              <div className="space-y-3">
                {[
                  { 
                    event: 'Debate Presidencial', 
                    date: '15/12/2024', 
                    hashtags: ['DebatePresidencial2024', 'PerúDecide', 'EleccionesPeru'],
                    impact: 'Alto'
                  },
                  { 
                    event: 'Aprobación Reforma Tributaria', 
                    date: '08/12/2024', 
                    hashtags: ['ReformaTributaria', 'CongresoPerú', 'EconomíaPeruana'],
                    impact: 'Medio'
                  },
                  { 
                    event: 'Manifestaciones Lima Centro', 
                    date: '03/12/2024', 
                    hashtags: ['ProtestasLima', 'DerechosLaborales', 'MovilizaciónNacional'],
                    impact: 'Alto'
                  },
                ].map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {event.event}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {event.date}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {event.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Impacto: <span className="font-medium">{event.impact}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};