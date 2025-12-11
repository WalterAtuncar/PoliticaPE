import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Link, 
  GitBranch, 
  CheckCircle, 
  Share2, 
  Save, 
  Lock, 
  CheckSquare, 
  BarChart2, 
  AlertTriangle, 
  TestTube, 
  Book, 
  Activity, 
  Bell, 
  Settings, 
  Shield 
} from 'lucide-react';

interface DataTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertsCount: number;
  onShowNotifications: () => void;
}

const tabs = [
  { id: 'overview', label: 'Visión General', icon: Database, description: 'Dashboard de datos' },
  { id: 'sources', label: 'Fuentes', icon: Link, description: 'Conexiones a APIs' },
  { id: 'etl', label: 'ETL Pipelines', icon: GitBranch, description: 'Flujos de datos' },
  { id: 'quality', label: 'Calidad', icon: CheckCircle, description: 'Métricas de calidad' },
  { id: 'lineage', label: 'Linaje', icon: Share2, description: 'Origen y transformaciones' },
  { id: 'backup', label: 'Backup', icon: Save, description: 'Respaldos y recuperación' },
];

export const DataTabs: React.FC<DataTabsProps> = ({
  activeTab,
  onTabChange,
  alertsCount,
  onShowNotifications,
}) => {
  return (
    <div className="border-b border-gray-200/50 dark:border-gray-700/50">
      <nav className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          // Show alerts indicator for overview tab when there are active alerts
          const hasAlerts = tab.id === 'overview' && alertsCount > 0;
          
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
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{tab.label}</span>
                  {hasAlerts && (
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
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
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                />
              )}
            </button>
          );
        })}
        
        {/* Notifications Button */}
        <button
          onClick={onShowNotifications}
          className="relative flex items-center space-x-2 py-4 px-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {alertsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {alertsCount > 9 ? '9+' : alertsCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};