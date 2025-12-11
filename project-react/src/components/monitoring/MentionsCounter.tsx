import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, User, Hash } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui/Card';
import { MentionData } from '../../types/monitoring';

interface MentionsCounterProps {
  mentions: MentionData[];
}

export const MentionsCounter: React.FC<MentionsCounterProps> = ({ mentions }) => {
  const totalMentions = mentions.reduce((sum, item) => sum + item.count, 0);
  const topCandidate = mentions.reduce((prev, current) => 
    prev.count > current.count ? prev : current
  );

  const chartData = mentions.map(item => ({
    name: item.name.split(' ')[0], // First name only for chart
    count: item.count,
    trend: item.trend,
  }));

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600 dark:text-green-400';
    if (trend < -5) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Menciones en Vivo
        </h3>
        <div className="flex items-center space-x-2">
          <Hash className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalMentions.toLocaleString()} total
          </span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Líder</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {topCandidate.name}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {topCandidate.count.toLocaleString()} menciones
              </p>
            </div>
            <User className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tendencia</p>
              <p className={`text-lg font-bold ${getTrendColor(topCandidate.trend)}`}>
                {topCandidate.trend > 0 ? '+' : ''}{topCandidate.trend}%
              </p>
              <p className="text-sm text-gray-500">vs hora anterior</p>
            </div>
            {getTrendIcon(topCandidate.trend)}
          </div>
        </div>
      </div>

      {/* Animated Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis 
              dataKey="name" 
              stroke="#6B7280" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed List */}
      <div className="space-y-3">
        {mentions.slice(0, 5).map((mention, index) => (
          <motion.div
            key={mention.id}
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
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {mention.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {mention.party}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900 dark:text-white">
                  {mention.count.toLocaleString()}
                </span>
                {getTrendIcon(mention.trend)}
              </div>
              <p className={`text-xs ${getTrendColor(mention.trend)}`}>
                {mention.trend > 0 ? '+' : ''}{mention.trend}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};