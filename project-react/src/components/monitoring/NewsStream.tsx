import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { NewsItem } from '../../types/monitoring';

interface NewsStreamProps {
  news: NewsItem[];
}

const sourceColors = {
  'El Comercio': '#1e40af',
  'La República': '#dc2626',
  'Gestión': '#059669',
  'RPP': '#7c3aed',
  'Perú21': '#ea580c',
  'Andina': '#0891b2',
};

export const NewsStream: React.FC<NewsStreamProps> = ({ news }) => {
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 8) return 'text-red-600 dark:text-red-400';
    if (impact >= 6) return 'text-orange-600 dark:text-orange-400';
    if (impact >= 4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Stream de Noticias
        </h3>
        <div className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {news.length} noticias
          </span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {news.slice(0, 8).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200 group cursor-pointer"
            >
              {/* News Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: sourceColors[item.source as keyof typeof sourceColors] || '#6b7280' 
                    }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.source}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    •
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(item.timestamp)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.isBreaking && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium rounded">
                      🚨 URGENTE
                    </span>
                  )}
                  <span className={`text-xs font-medium ${getImpactColor(item.impact)}`}>
                    Impacto: {item.impact}/10
                  </span>
                </div>
              </div>

              {/* News Content */}
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h4>
              
              <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
                {item.summary}
              </p>

              {/* News Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>{item.engagement.toLocaleString()} interacciones</span>
                  </div>
                  
                  {item.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {/* Sentiment Indicator */}
              <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Sentiment:</span>
                  <span className={`font-medium ${
                    item.sentiment > 0.1 ? 'text-green-600 dark:text-green-400' :
                    item.sentiment > -0.1 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {item.sentiment > 0 ? '+' : ''}{item.sentiment.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {news.length === 0 && (
        <div className="text-center py-8">
          <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay noticias recientes
          </p>
        </div>
      )}
    </Card>
  );
};