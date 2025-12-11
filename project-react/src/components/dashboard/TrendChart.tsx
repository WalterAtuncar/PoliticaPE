import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card } from '../ui/Card';
import { API_CONFIG, ENDPOINTS } from '../../config/api';

interface TrendDataPoint {
  name: string;
  sentiment: number;
  mentions: number;
  engagement: number;
}

const mockData: TrendDataPoint[] = [
  { name: 'Ene', sentiment: 65, mentions: 1200, engagement: 8.2 },
  { name: 'Feb', sentiment: 59, mentions: 1100, engagement: 7.8 },
  { name: 'Mar', sentiment: 72, mentions: 1350, engagement: 9.1 },
  { name: 'Abr', sentiment: 68, mentions: 1280, engagement: 8.7 },
  { name: 'May', sentiment: 70, mentions: 1420, engagement: 9.5 },
  { name: 'Jun', sentiment: 75, mentions: 1580, engagement: 10.2 },
];

export const TrendChart: React.FC = () => {
  const [data, setData] = useState<TrendDataPoint[]>(mockData);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TRENDS}`);
        if (response.ok) {
          const trendsData = await response.json();
          if (trendsData.trends && Array.isArray(trendsData.trends) && trendsData.trends.length > 0) {
            const formattedData = trendsData.trends.map((t: any) => ({
              name: t.period ?? t.month ?? t.name ?? 'N/A',
              sentiment: t.sentiment ?? t.sentiment_score ?? 50,
              mentions: t.mentions ?? t.count ?? 0,
              engagement: t.engagement ?? t.engagement_rate ?? 0,
            }));
            setData(formattedData);
          }
        }
      } catch (error) {
        console.error('Error fetching trends:', error);
      }
    };
    fetchTrends();
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tendencias Mensuales
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Sentimiento</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Engagement</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSentiment)"
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="#8B5CF6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEngagement)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
};