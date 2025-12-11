import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share, ExternalLink, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { SocialPost, MonitoringFilters } from '../../types/monitoring';

interface SocialFeedProps {
  posts: SocialPost[];
  filters: MonitoringFilters;
}

const platformIcons: Record<string, string> = {
  twitter: '🐦',
  facebook: '📘',
  instagram: '📷',
};

const sentimentColors = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

export const SocialFeed: React.FC<SocialFeedProps> = ({ posts, filters }) => {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const filteredPosts = posts.filter(post => 
    filters.platforms.includes(post.platform) &&
    (filters.regions.includes('all') || filters.regions.includes(post.region))
  );

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

  return (
    <Card glass className="p-6 h-[800px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Feed en Tiempo Real
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredPosts.length} posts activos
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <AnimatePresence>
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 
                hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200 cursor-pointer
                ${selectedPost === post.id ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {post.author}
                      </span>
                      <span 
                        className="text-lg"
                        title={post.platform}
                      >
                        {platformIcons[post.platform]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{post.region}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(post.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${sentimentColors[post.sentiment]}`}>
                    {post.sentiment === 'positive' ? '😊' : post.sentiment === 'negative' ? '😞' : '😐'}
                  </span>
                  {post.isViral && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded text-xs font-medium">
                      🔥 Viral
                    </span>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                {post.content}
              </p>

              {/* Post Metrics */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share className="h-4 w-4" />
                    <span>{post.shares.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{post.engagement.toFixed(1)}%</span>
                  </div>
                </div>

                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {/* Expanded Details */}
              {selectedPost === post.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Alcance estimado</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {post.reach.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Influencia</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {post.influence}/10
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Hashtags</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.hashtags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Menciones</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.mentions.map((mention) => (
                          <span
                            key={mention}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded"
                          >
                            @{mention}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
};