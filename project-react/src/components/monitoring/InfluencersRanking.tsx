import React from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingUp, Users, MessageCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { InfluencerData } from '../../types/monitoring';

interface InfluencersRankingProps {
  influencers: InfluencerData[];
}

export const InfluencersRanking: React.FC<InfluencersRankingProps> = ({ influencers }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    return (
      <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
        {rank}
      </div>
    );
  };

  const getTrendColor = (trend: number) => {
    if (trend > 10) return 'text-green-600 dark:text-green-400';
    if (trend < -10) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getInfluenceColor = (influence: number) => {
    if (influence >= 9) return 'bg-red-500';
    if (influence >= 7) return 'bg-orange-500';
    if (influence >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Influencers Activos
        </h3>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-purple-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Top {influencers.length}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {influencers.slice(0, 6).map((influencer, index) => (
          <motion.div
            key={influencer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
          >
            {/* Influencer Header */}
            <div className="flex items-start space-x-3 mb-3">
              <div className="relative">
                <img
                  src={influencer.avatar}
                  alt={influencer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute -top-1 -right-1">
                  {getRankIcon(index + 1)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {influencer.name}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <div
                      className={`w-2 h-2 rounded-full ${getInfluenceColor(influencer.influence)}`}
                      title={`Influencia: ${influencer.influence}/10`}
                    />
                    <span className="text-xs text-gray-500">
                      {influencer.influence}/10
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {influencer.handle}
                </p>
                
                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{(influencer.followers / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{influencer.posts}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded">
                <p className="text-gray-600 dark:text-gray-400">Menciones</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {influencer.mentions.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded">
                <p className="text-gray-600 dark:text-gray-400">Engagement</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {influencer.engagement.toFixed(1)}%
                </p>
              </div>
              
              <div className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded">
                <p className="text-gray-600 dark:text-gray-400">Tendencia</p>
                <p className={`font-bold ${getTrendColor(influencer.trend)}`}>
                  {influencer.trend > 0 ? '+' : ''}{influencer.trend}%
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            {influencer.recentActivity && (
              <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="font-medium">Última actividad:</span> {influencer.recentActivity}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {influencers.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay influencers activos
          </p>
        </div>
      )}
    </Card>
  );
};