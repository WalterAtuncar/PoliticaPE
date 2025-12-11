import React from 'react';
import { motion } from 'framer-motion';
import { Hash, TrendingUp, Eye } from 'lucide-react';
import { Card } from '../ui/Card';
import { HashtagData } from '../../types/monitoring';

interface TrendingHashtagsProps {
  hashtags: HashtagData[];
}

export const TrendingHashtags: React.FC<TrendingHashtagsProps> = ({ hashtags }) => {
  const maxCount = Math.max(...hashtags.map(h => h.count));

  const getHashtagSize = (count: number) => {
    const ratio = count / maxCount;
    return Math.max(12, 12 + (ratio * 8)); // 12px to 20px
  };

  const getHashtagColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-green-600 dark:text-green-400';
    if (sentiment > -0.2) return 'text-blue-600 dark:text-blue-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 10) return <TrendingUp className="h-3 w-3 text-green-500" />;
    return null;
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Hashtags Trending
        </h3>
        <div className="flex items-center space-x-2">
          <Hash className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {hashtags.length} activos
          </span>
        </div>
      </div>

      {/* Word Cloud Style Display */}
      <div className="mb-6 p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg min-h-[200px] flex flex-wrap items-center justify-center gap-3">
        {hashtags.slice(0, 15).map((hashtag, index) => (
          <motion.div
            key={hashtag.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative cursor-pointer group transition-all duration-200 hover:scale-110
              ${getHashtagColor(hashtag.sentiment)}
            `}
            style={{
              fontSize: `${getHashtagSize(hashtag.count)}px`,
              fontWeight: hashtag.count > maxCount * 0.7 ? 'bold' : 'medium',
            }}
          >
            #{hashtag.tag}
            
            {/* Trending indicator */}
            {hashtag.trend > 10 && (
              <div className="absolute -top-1 -right-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
              </div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              <div className="font-medium">{hashtag.count.toLocaleString()} menciones</div>
              <div>Sentiment: {hashtag.sentiment > 0 ? '+' : ''}{hashtag.sentiment.toFixed(2)}</div>
              <div>Tendencia: {hashtag.trend > 0 ? '+' : ''}{hashtag.trend}%</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Hashtags List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Top Hashtags
        </h4>
        {hashtags.slice(0, 5).map((hashtag, index) => (
          <motion.div
            key={hashtag.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {index + 1}
              </div>
              <div>
                <p className={`font-medium text-sm ${getHashtagColor(hashtag.sentiment)}`}>
                  #{hashtag.tag}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <Eye className="h-3 w-3" />
                  <span>{hashtag.reach.toLocaleString()} alcance</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900 dark:text-white">
                  {hashtag.count.toLocaleString()}
                </span>
                {getTrendIcon(hashtag.trend)}
              </div>
              <p className={`text-xs ${
                hashtag.trend > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {hashtag.trend > 0 ? '+' : ''}{hashtag.trend}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};