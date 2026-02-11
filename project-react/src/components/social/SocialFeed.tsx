import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageSquare, 
  Share, 
  Bookmark, 
  MoreHorizontal, 
  ExternalLink, 
  ThumbsUp, 
  Twitter, 
  Facebook, 
  Instagram, 
  Youtube,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SocialPost, SocialFilters } from '../../types/social';

interface SocialFeedProps {
  posts: SocialPost[];
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

const sentimentColors = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const sentimentEmojis = {
  positive: '😊',
  neutral: '😐',
  negative: '😞',
};

export const SocialFeed: React.FC<SocialFeedProps> = ({ posts, isLoading, filters }) => {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  const toggleSavePost = (postId: string) => {
    setSavedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

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
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.length > 0 ? (
        <AnimatePresence>
          {posts.map((post, index) => {
            const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons] || MessageSquare;
            const isExpanded = expandedPost === post.id;
            const isSaved = savedPosts.includes(post.id);
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card glass className="p-6 hover:shadow-lg transition-all duration-200">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || post.platform)}&background=random&color=fff&size=96&bold=true`}
                        alt={post.author}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author || post.platform)}&background=6366f1&color=fff&size=96&bold=true`;
                        }}
                      />
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {post.author}
                          </h3>
                          <PlatformIcon 
                            className="h-4 w-4" 
                            style={{ color: platformColors[post.platform as keyof typeof platformColors] || '#6B7280' }}
                          />
                          {post.isVerified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${sentimentColors[post.sentiment]}`}>
                        {sentimentEmojis[post.sentiment]} {post.sentimentScore.toFixed(2)}
                      </span>
                      
                      {post.isFakeNews && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded text-xs font-medium flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Desinformación
                        </span>
                      )}
                      
                      {post.isViral && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded text-xs font-medium flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Viral
                        </span>
                      )}
                      
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <MoreHorizontal className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-line">
                      {post.content}
                    </p>
                    
                    {post.media && post.media.length > 0 && (
                      <div className={`grid ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 rounded-lg overflow-hidden`}>
                        {post.media.map((media, idx) => (
                          <div key={idx} className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            {media.type === 'image' ? (
                              <img 
                                src={media.url} 
                                alt="Post media" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                <Youtube className="h-8 w-8 text-red-500" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Metrics */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Heart className={`h-5 w-5 ${post.userLiked ? 'text-red-500 fill-current' : ''}`} />
                        <span>{formatNumber(post.likes)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-5 w-5" />
                        <span>{formatNumber(post.comments)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share className="h-5 w-5" />
                        <span>{formatNumber(post.shares)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-5 w-5" />
                        <span>{post.engagementRate.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSavePost(post.id)}
                        className={`p-1 rounded-full ${
                          isSaved ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                      >
                        <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
                      >
                        {isExpanded ? (
                          <motion.div
                            animate={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </motion.div>
                        ) : (
                          <MoreHorizontal className="h-5 w-5" />
                        )}
                      </button>
                      
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

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Métricas Detalladas
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Alcance</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatNumber(post.reach)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Impresiones</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatNumber(post.impressions)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {post.engagementRate.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Clicks</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatNumber(post.clicks || 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Análisis de Contenido
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400 text-sm">Hashtags</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {post.hashtags?.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {(!post.hashtags || post.hashtags.length === 0) && (
                                  <span className="text-xs text-gray-500">No hay hashtags</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600 dark:text-gray-400 text-sm">Menciones</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {post.mentions?.map((mention, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded"
                                  >
                                    @{mention}
                                  </span>
                                ))}
                                {(!post.mentions || post.mentions.length === 0) && (
                                  <span className="text-xs text-gray-500">No hay menciones</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Análisis de Sentiment
                        </h4>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Sentiment Score</span>
                            <span className={`text-sm font-medium ${
                              post.sentimentScore > 0.2 ? 'text-green-600 dark:text-green-400' :
                              post.sentimentScore > -0.2 ? 'text-gray-600 dark:text-gray-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {post.sentimentScore.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                post.sentimentScore > 0.2 ? 'bg-green-500' :
                                post.sentimentScore > -0.2 ? 'bg-gray-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${((post.sentimentScore + 1) / 2) * 100}%` }}
                            ></div>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            <span>Emociones detectadas: </span>
                            {post.emotions?.map((emotion, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded mx-1"
                              >
                                {emotion}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay posts disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No se encontraron publicaciones que coincidan con los filtros seleccionados
          </p>
          <Button variant="outline">
            Modificar filtros
          </Button>
        </div>
      )}
      
      {posts.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline">
            Cargar más posts
          </Button>
        </div>
      )}
    </div>
  );
};