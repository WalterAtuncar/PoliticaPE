import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  BarChart2, 
  Users, 
  Hash, 
  TrendingUp, 
  Eye, 
  Heart, 
  Calendar, 
  PieChart, 
  AlertTriangle, 
  Activity, 
  Ear 
} from 'lucide-react';
import { SocialMetrics } from '../../types/social';

interface SocialTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  metrics: SocialMetrics;
}

const tabs = [
  { id: 'feed', label: 'Feed Unificado', icon: MessageSquare, description: 'Posts de todas las plataformas' },
  { id: 'influencers', label: 'Influencers', icon: Users, description: 'Ranking de influencia' },
  { id: 'hashtags', label: 'Hashtags', icon: Hash, description: 'Análisis de tendencias' },
  { id: 'sentiment', label: 'Sentiment', icon: Heart, description: 'Análisis de sentimiento' },
  { id: 'crisis', label: 'Crisis', icon: Activity, description: 'Monitoreo de crisis' },
];

export const SocialTabs: React.FC<SocialTabsProps> = ({
  activeTab,
  onTabChange,
  metrics,
}) => {
  return (
    <div className="border-b border-gray-200/50 dark:border-gray-700/50">
      <nav className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200
                ${isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs text-gray-400 hidden lg:block">
                  {tab.description}
                </div>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};