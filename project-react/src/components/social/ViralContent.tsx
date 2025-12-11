import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Filter, 
  Calendar, 
  Twitter, 
  Facebook, 
  Instagram, 
  Youtube, 
  MessageSquare,
  Heart,
  Share,
  Eye,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ViralPost, SocialFilters } from '../../types/social';

interface ViralContentProps {
  content: ViralPost[];
  isLoading: boolean;
  filters: SocialFilters;
}

const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: MessageSquare,
  youtube: Youtube,
};

const platformColors = {
  twitter: '#1DA1F2',
  facebook: '#4267B2',
  instagram: '#E4405F',
  tiktok: '#000000',
  youtube: '#FF0000',
};

const timeRanges = [
  { value: '1d', label: 'Hoy' },
  { value: '7d', label: 'Semana' },
  { value: '30d', label: 'Mes' },
  { value: '90d', label: '3 Meses' },
];

export const ViralContent: React.FC<ViralContentProps> = ({
  content,
  isLoading,
  filters,
}) => {
  const [localTimeRange, setLocalTimeRange] = useState('7d');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
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
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contenido Viral
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {content.length} posts virales detectados
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
          </div>
        </div>
      </Card>

      {/* Viral Content Timeline */}
      <div className="space-y-6">
        {content.map((post, index) => {
          const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons] || MessageSquare;
          const isSelected = selectedPost === post.id;
          
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card glass className="p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={post.authorAvatar}
                        alt={post.author}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800"
                      />
                      <div 
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: platformColors[post.platform as keyof typeof platformColors] || '#6B7280',
                          border: '2px solid white',
                        }}
                      >
                        <PlatformIcon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {post.author}
                        </h3>
                        <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded text-xs font-medium flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          VIRAL
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{post.handle}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(post.timestamp)}</span>
                        <span>•</span>
                        <span>{post.region}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Viralidad: {post.viralityScore}/10
                    </span>
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-line">
                    {post.content}
                  </p>
                  
                  {post.media && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={post.media} 
                        alt="Post media" 
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Viral Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="text-xs text-gray-500">Likes</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatNumber(post.likes)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-500">Comentarios</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatNumber(post.comments)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Share className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-xs text-gray-500">Compartidos</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatNumber(post.shares)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="text-xs text-gray-500">Alcance</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatNumber(post.reach)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Viral Analysis */}
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <h4 className="font-medium text-orange-900 dark:text-orange-300">
                      ¿Por qué se volvió viral?
                    </h4>
                  </div>
                  <p className="text-sm text-orange-800 dark:text-orange-400">
                    {post.viralityReason}
                  </p>
                </div>

                {/* View Details Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => setSelectedPost(isSelected ? null : post.id)}
                    variant="outline"
                    size="sm"
                  >
                    {isSelected ? 'Ocultar detalles' : 'Ver análisis completo'}
                  </Button>
                </div>

                {/* Expanded Details */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-600/50"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                          Demografía de Engagement
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Edad</span>
                              <span className="text-gray-900 dark:text-white">% del total</span>
                            </div>
                            {post.demographics.age.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-2 mb-2">
                                <span className="text-xs text-gray-600 dark:text-gray-400 w-16">
                                  {item.group}
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
                              <span className="text-gray-600 dark:text-gray-400">Género</span>
                              <span className="text-gray-900 dark:text-white">% del total</span>
                            </div>
                            {post.demographics.gender.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-2 mb-2">
                                <span className="text-xs text-gray-600 dark:text-gray-400 w-16">
                                  {item.group}
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
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                          Factores de Viralidad
                        </h4>
                        <div className="space-y-3">
                          {post.viralityFactors.map((factor, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                              <span className="text-sm text-gray-900 dark:text-white">
                                {factor.name}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full bg-green-500"
                                    style={{ width: `${factor.impact}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white w-8 text-right">
                                  {factor.impact}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Recomendaciones Estratégicas
                      </h4>
                      <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                        {post.strategicRecommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {content.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay contenido viral
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No se ha detectado contenido viral en el período seleccionado
          </p>
          <Button variant="outline">
            Cambiar filtros
          </Button>
        </div>
      )}
    </div>
  );
};