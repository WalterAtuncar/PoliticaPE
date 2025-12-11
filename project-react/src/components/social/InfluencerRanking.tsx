import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Filter, 
  Download, 
  Twitter, 
  Facebook, 
  Instagram, 
  Youtube, 
  MessageSquare,
  Star,
  Eye,
  Heart,
  ExternalLink
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Influencer, SocialFilters } from '../../types/social';

interface InfluencerRankingProps {
  influencers: Influencer[];
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

const politicalLeanColors = {
  left: '#EF4444',
  center_left: '#F97316',
  center: '#6B7280',
  center_right: '#3B82F6',
  right: '#10B981',
};

const politicalLeanLabels = {
  left: 'Izquierda',
  center_left: 'Centro-Izquierda',
  center: 'Centro',
  center_right: 'Centro-Derecha',
  right: 'Derecha',
};

export const InfluencerRanking: React.FC<InfluencerRankingProps> = ({
  influencers,
  isLoading,
  filters,
}) => {
  const [sortBy, setSortBy] = useState<'influence' | 'followers' | 'engagement'>('influence');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterPoliticalLean, setFilterPoliticalLean] = useState<string>('all');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);

  const handleSortChange = (value: 'influence' | 'followers' | 'engagement') => {
    setSortBy(value);
  };

  const filteredInfluencers = influencers
    .filter(inf => filterPlatform === 'all' || inf.mainPlatform === filterPlatform)
    .filter(inf => filterPoliticalLean === 'all' || inf.politicalLean === filterPoliticalLean)
    .sort((a, b) => {
      if (sortBy === 'influence') return b.influenceScore - a.influenceScore;
      if (sortBy === 'followers') return b.followers - a.followers;
      return b.engagementRate - a.engagementRate;
    });

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
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ranking de Influencers Políticos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredInfluencers.length} influencers activos
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Controls */}
            <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => handleSortChange('influence')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  sortBy === 'influence' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Influencia
              </button>
              <button
                onClick={() => handleSortChange('followers')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  sortBy === 'followers' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Seguidores
              </button>
              <button
                onClick={() => handleSortChange('engagement')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  sortBy === 'engagement' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Engagement
              </button>
            </div>

            {/* Platform Filter */}
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">Todas las plataformas</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>

            {/* Political Lean Filter */}
            <select
              value={filterPoliticalLean}
              onChange={(e) => setFilterPoliticalLean(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">Todas las tendencias</option>
              <option value="left">Izquierda</option>
              <option value="center_left">Centro-Izquierda</option>
              <option value="center">Centro</option>
              <option value="center_right">Centro-Derecha</option>
              <option value="right">Derecha</option>
            </select>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Influencers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInfluencers.map((influencer, index) => {
          const PlatformIcon = platformIcons[influencer.mainPlatform as keyof typeof platformIcons] || MessageSquare;
          const isSelected = selectedInfluencer === influencer.id;
          
          return (
            <motion.div
              key={influencer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedInfluencer(isSelected ? null : influencer.id)}
              className={`cursor-pointer transition-all duration-200 ${isSelected ? 'scale-[1.02]' : ''}`}
            >
              <Card glass className={`p-6 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                {/* Influencer Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src={influencer.avatar}
                      alt={influencer.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-800"
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: platformColors[influencer.mainPlatform as keyof typeof platformColors] || '#6B7280',
                        border: '2px solid white',
                      }}
                    >
                      <PlatformIcon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {influencer.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: politicalLeanColors[influencer.politicalLean as keyof typeof politicalLeanColors] + '20',
                            color: politicalLeanColors[influencer.politicalLean as keyof typeof politicalLeanColors]
                          }}
                        >
                          {politicalLeanLabels[influencer.politicalLean as keyof typeof politicalLeanLabels]}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {influencer.handle}
                    </p>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < Math.round(influencer.influenceScore / 2) 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {influencer.influenceScore}/10 influencia
                      </span>
                    </div>
                  </div>
                </div>

                {/* Influencer Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Seguidores</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatNumber(influencer.followers)}
                    </p>
                  </div>
                  
                  <div className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Engagement</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {influencer.engagementRate.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Posts</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {influencer.postsCount}
                    </p>
                  </div>
                </div>

                {/* Topics & Tags */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Temas principales:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {influencer.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                {influencer.recentActivity && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    <p className="font-medium mb-1">Actividad reciente:</p>
                    <p className="line-clamp-2">{influencer.recentActivity}</p>
                  </div>
                )}

                {/* Expanded Details */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50"
                  >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Alcance estimado:
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatNumber(influencer.estimatedReach)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Audiencia principal:
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {influencer.mainAudience}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Ubicación:
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {influencer.location}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Tendencia:
                        </p>
                        <div className="flex items-center space-x-1">
                          {influencer.growthTrend > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />
                          )}
                          <span className={`text-sm font-medium ${
                            influencer.growthTrend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {influencer.growthTrend > 0 ? '+' : ''}{influencer.growthTrend}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver perfil completo
                      </Button>
                      
                      <a 
                        href="#" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center"
                      >
                        Visitar perfil
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredInfluencers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron influencers
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No hay influencers que coincidan con los filtros seleccionados
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setFilterPlatform('all');
              setFilterPoliticalLean('all');
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
};