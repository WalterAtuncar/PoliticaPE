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
import { API_CONFIG } from '../../config/api';
import { Loader2, TrendingUp } from 'lucide-react';

interface TrendDataPoint {
  name: string;
  sentiment: number;
  mentions: number;
  engagement: number;
}

export const TrendChart: React.FC = () => {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/time-series?days=180`);
        if (response.ok) {
          const timeSeriesData = await response.json();
          if (Array.isArray(timeSeriesData) && timeSeriesData.length > 0) {
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const monthlyData: Record<string, { sentiment: number[], mentions: number[], engagement: number[] }> = {};
            
            timeSeriesData.forEach((item: Record<string, unknown>) => {
              const date = new Date(String(item.date));
              const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
              
              if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { sentiment: [], mentions: [], engagement: [] };
              }
              
              monthlyData[monthKey].sentiment.push(Number(item.sentiment ?? 0));
              monthlyData[monthKey].mentions.push(Number(item.mentions ?? 0));
              monthlyData[monthKey].engagement.push(Number(item.engagement ?? 0));
            });

            const formattedData: TrendDataPoint[] = Object.entries(monthlyData)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-6)
              .map(([key, values]) => {
                const month = key.split('-')[1];
                return {
                  name: monthNames[parseInt(month)],
                  sentiment: values.sentiment.length > 0 
                    ? Math.round(values.sentiment.reduce((a, b) => a + b, 0) / values.sentiment.length) 
                    : 0,
                  mentions: values.mentions.reduce((a, b) => a + b, 0),
                  engagement: values.engagement.length > 0 
                    ? parseFloat((values.engagement.reduce((a, b) => a + b, 0) / values.engagement.length).toFixed(1))
                    : 0,
                };
              });

            setData(formattedData);
          }
        }
      } catch (error) {
        console.error('Error fetching trends:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrends();
  }, []);

  if (isLoading) {
    return (
      <Card glass className="p-6">
        <div className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando tendencias...</span>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tendencias Mensuales
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
          <TrendingUp className="h-8 w-8 mb-2" />
          <span>No hay datos de tendencias disponibles</span>
        </div>
      </Card>
    );
  }

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
