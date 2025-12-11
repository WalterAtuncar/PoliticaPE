import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Link, 
  Bell, 
  Shield, 
  HardDrive, 
  Settings, 
  Activity
} from 'lucide-react';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertsCount?: number;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  activeTab,
  onTabChange,
  alertsCount = 0
}) => {
  const tabs = [
    {
      id: 'users',
      name: 'Usuarios y Accesos',
      icon: Users,
      description: 'Gestión de usuarios, roles y permisos'
    },
    {
      id: 'integrations',
      name: 'Integraciones',
      icon: Link,
      description: 'APIs, bases de datos y servicios externos'
    },
    {
      id: 'notifications',
      name: 'Notificaciones',
      icon: Bell,
      description: 'Configuración de alertas y notificaciones'
    },
    {
      id: 'security',
      name: 'Seguridad',
      icon: Shield,
      description: 'Políticas de seguridad y autenticación'
    },
    {
      id: 'backup',
      name: 'Backup',
      icon: HardDrive,
      description: 'Respaldos y recuperación de datos'
    },
    {
      id: 'general',
      name: 'General',
      icon: Settings,
      description: 'Configuración general del sistema'
    },
    {
      id: 'audit',
      name: 'Auditoría',
      icon: Activity,
      description: 'Logs de auditoría y actividad',
      badge: alertsCount > 0 ? alertsCount : undefined
    }
  ];

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex-shrink-0 px-6 py-4 text-left transition-all duration-200
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <div className="relative flex items-start space-x-3 min-w-[200px]">
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                  ${isActive 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }
                `}>
                  <Icon className="h-5 w-5" />
                  {tab.badge && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    font-medium text-sm leading-tight
                    ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}
                  `}>
                    {tab.name}
                  </h3>
                  <p className={`
                    text-xs mt-1 leading-tight
                    ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}
                  `}>
                    {tab.description}
                  </p>
                </div>
              </div>

              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  layoutId="activeTabIndicator"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Mobile scroll indicator */}
      <div className="md:hidden flex justify-center py-2">
        <div className="flex space-x-1">
          {tabs.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === tabs.findIndex(tab => tab.id === activeTab)
                  ? 'bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 