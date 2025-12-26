import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Globe, 
  Activity, 
  Brain, 
  Database, 
  Settings, 
  ChevronLeft,
  Home,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';
import logo from '../../assets/logo.png';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Panel Principal', icon: Home },
  { id: 'analytics', label: 'Analítica', icon: BarChart3 },
  { id: 'geographic', label: 'Análisis Geográfico', icon: Globe },
  { id: 'monitoring', label: 'Monitoreo Tiempo Real', icon: Activity },
  { id: 'recommendations', label: 'Recomendaciones IA', icon: Brain },
  { id: 'campaigns', label: 'Campañas', icon: TrendingUp },
  { id: 'demographics', label: 'Demografía', icon: Users },
  { id: 'social', label: 'Redes Sociales', icon: MessageSquare },
  { id: 'data', label: 'Gestión de Datos', icon: Database },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  activeSection,
  onSectionChange,
}) => {
  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen backdrop-blur-lg bg-white/10 dark:bg-gray-900/20 border-r border-white/20 dark:border-gray-700/30 z-40"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <motion.div
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            className="flex items-center space-x-3"
          >
            <img src={logo} alt="PoliticaPE Logo" className="w-10 h-10 object-contain" />
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">PolíticaPE</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Plataforma de Análisis</p>
              </div>
            )}
          </motion.div>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-white/20 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </motion.div>
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                whileHover={{ x: 4 }}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <motion.span
                  animate={{ opacity: isCollapsed ? 0 : 1 }}
                  className="font-medium truncate"
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
};