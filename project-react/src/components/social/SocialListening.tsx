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
  Ear, 
  Filter, 
  Download, 
  Calendar, 
  TrendingUp, 
  MessageSquare,
  Heart,
  AlertCircle,
  Search,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SocialListeningData, SocialFilters } from '../../types/social';

interface SocialListeningProps {
  data: SocialListeningData;
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

export const SocialListening: React.FC<SocialListeningProps> = ({
  data,
  isLoading,
  filters,
}) => {
  const [localTimeRange, setLocalTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewKeywordModal, setShowNewKeywordModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Ear className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Social Listening
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.monitoredKeywords.length} keywords monitoreados
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar menciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500"
              />
            </form>

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

            <Button
              onClick={() => setShowNewKeywordModal(true)}
              variant="primary"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Keyword
            </Button>
          </div>
        </div>
      </Card>

      {/* Mention Volume & Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Volumen de Menciones
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.mentionVolumeOverTime}>
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
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Sentiment de Menciones
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.sentimentOverTime}>
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
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Monitored Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Topics Monitoreados
            </h3>
            <Button
              onClick={() => setShowNewKeywordModal(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Topic
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.monitoredKeywords.map((keyword, index) => (
              <motion.div
                key={keyword.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTopic(selectedTopic === keyword.id ? null : keyword.id)}
                className={`p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedTopic === keyword.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {keyword.name}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Edit className="h-3 w-3 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Trash2 className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Menciones:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {keyword.mentions.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tendencia:</span>
                    <div className="flex items-center space-x-1">
                      {keyword.trend > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />
                      )}
                      <span className={`font-medium ${
                        keyword.trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {keyword.trend > 0 ? '+' : ''}{keyword.trend}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Sentiment:</span>
                    <p className={`font-medium ${
                      keyword.sentiment > 0.1 ? 'text-green-600 dark:text-green-400' :
                      keyword.sentiment > -0.1 ? 'text-gray-600 dark:text-gray-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {keyword.sentiment > 0 ? '+' : ''}{keyword.sentiment.toFixed(2)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Alertas:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {keyword.alerts}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {keyword.relatedTerms.slice(0, 3).map((term, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                    >
                      {term}
                    </span>
                  ))}
                  {keyword.relatedTerms.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                      +{keyword.relatedTerms.length - 3}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Topic Details */}
      {selectedTopic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glass className="p-6">
            {(() => {
              const topic = data.monitoredKeywords.find(k => k.id === selectedTopic);
              if (!topic) return null;
              
              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Análisis de Topic: {topic.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Últimos 30 días
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                        Volumen por Plataforma
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={topic.platformDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          >
                            {topic.platformDistribution.map((entry, index) => (
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
                        Sentiment por Región
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topic.sentimentByRegion}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                          <XAxis dataKey="region" stroke="#6B7280" fontSize={12} />
                          <YAxis stroke="#6B7280" fontSize={12} domain={[-1, 1]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(17, 24, 39, 0.8)',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#F9FAFB',
                            }}
                          />
                          <Bar 
                            dataKey="sentiment" 
                            fill="#8B5CF6"
                            name="Sentiment"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Menciones Recientes
                    </h4>
                    <div className="space-y-3">
                      {topic.recentMentions.map((mention, index) => {
                        const PlatformIcon = platformIcons[mention.platform as keyof typeof platformIcons] || MessageSquare;
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg"
                          >
                            <div className="flex items-start space-x-3">
                              <PlatformIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                                    {mention.author}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(mention.date).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {mention.text}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Heart className="h-3 w-3" />
                                    <span>{mention.likes}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>{mention.comments}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className={`${
                                      mention.sentiment > 0.1 ? 'text-green-600 dark:text-green-400' :
                                      mention.sentiment > -0.1 ? 'text-gray-600 dark:text-gray-400' :
                                      'text-red-600 dark:text-red-400'
                                    }`}>
                                      Sentiment: {mention.sentiment > 0 ? '+' : ''}{mention.sentiment.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                        Términos Relacionados
                      </h4>
                      <div className="space-y-2">
                        {topic.relatedTerms.map((term, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {term}
                            </span>
                            <Button variant="outline" size="sm" className="h-7 px-2 py-0">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                        Insights
                      </h4>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <h5 className="font-medium text-blue-900 dark:text-blue-300">
                            Análisis de Tendencia
                          </h5>
                        </div>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>Este topic muestra un incremento del {topic.trend}% en menciones durante la última semana, correlacionado con eventos políticos recientes.</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>Mayor actividad en Twitter (42%), sugiriendo enfocar esfuerzos de respuesta en esta plataforma.</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>El sentiment general es {topic.sentiment > 0 ? 'positivo' : topic.sentiment < 0 ? 'negativo' : 'neutral'}, con variaciones significativas por región.</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>Se recomienda desarrollar contenido educativo sobre este tema para mejorar percepción en regiones con sentiment negativo.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>
        </motion.div>
      )}

      {/* New Keyword Modal */}
      {showNewKeywordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Añadir Nuevo Keyword
                </h3>
                <button
                  onClick={() => setShowNewKeywordModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keyword o frase
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Ej: reforma tributaria"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Términos relacionados (separados por coma)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Ej: impuestos, tributos, reforma fiscal"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plataformas a monitorear
                  </label>
                  <div className="space-y-2">
                    {['Twitter', 'Facebook', 'Instagram', 'TikTok', 'YouTube'].map((platform) => (
                      <label key={platform} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {platform}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nivel de alerta
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="high">Alto</option>
                    <option value="medium">Medio</option>
                    <option value="low">Bajo</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowNewKeywordModal(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                >
                  Añadir Keyword
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};