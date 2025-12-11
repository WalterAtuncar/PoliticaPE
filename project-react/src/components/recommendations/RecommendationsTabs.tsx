import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  RefreshCw, 
  TrendingUp,
  Target,
  Users,
  MapPin,
  Lightbulb
} from 'lucide-react';
import { AIRecommendation } from '../../types/recommendations';

interface RecommendationsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  recommendations: AIRecommendation[];
}

const tabs = [
  {
    id: 'immediate',
    label: 'Oportunidades Inmediatas',
    icon: Zap,
    description: 'Alto impacto, bajo costo',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  {
    id: 'regional',
    label: 'Fortalecimiento Regional',
    icon: Shield,
    description: 'Consolidar zonas favorables',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  {
    id: 'recovery',
    label: 'Recuperación Territorial',
    icon: RefreshCw,
    description: 'Sentiment negativo',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
  },
  {
    id: 'expansion',
    label: 'Expansión Demográfica',
    icon: TrendingUp,
    description: 'Nuevos segmentos objetivo',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
  },
];

export const RecommendationsTabs: React.FC<RecommendationsTabsProps> = ({
  activeTab,
  onTabChange,
  recommendations,
}) => {
  const getTabCount = (tabId: string) => {
    const categoryMap = {
      immediate: 'immediate_opportunities',
      regional: 'regional_strengthening',
      recovery: 'territorial_recovery',
      expansion: 'demographic_expansion',
    };
    
    return recommendations.filter(rec => 
      rec.category === categoryMap[tabId as keyof typeof categoryMap]
    ).length;
  };

  return (
    <div className="border-b border-gray-200/50 dark:border-gray-700/50">
      <nav className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center space-x-3 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200
                ${isActive
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              <div className={`p-2 rounded-lg ${isActive ? tab.bgColor : 'bg-gray-100 dark:bg-gray-800'}`}>
                <Icon className={`h-4 w-4 ${isActive ? tab.color : 'text-gray-500'}`} />
              </div>
              
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{tab.label}</span>
                  {count > 0 && (
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-bold
                      ${isActive 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }
                    `}>
                      {count}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 hidden lg:block">
                  {tab.description}
                </div>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};