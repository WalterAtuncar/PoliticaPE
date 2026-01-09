import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  ChevronRight,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { API_CONFIG } from '../../config/api';

interface HeaderProps {
  isCollapsed: boolean;
  activeSection: string;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  isRead: boolean;
}

const sectionTitles = {
  dashboard: 'Panel Principal',
  analytics: 'Analítica Avanzada',
  geographic: 'Análisis Geográfico',
  monitoring: 'Monitoreo en Tiempo Real',
  recommendations: 'Recomendaciones IA',
  campaigns: 'Gestión de Campañas',
  demographics: 'Análisis Demográfico',
  social: 'Redes Sociales',
  data: 'Gestión de Datos',
  settings: 'Configuración',
};

export const Header: React.FC<HeaderProps> = ({ isCollapsed, activeSection }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${API_CONFIG.SNIFFING_BASE_URL}/api/crisis-alerts`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setAlerts(data.slice(0, 10).map((alert: Record<string, unknown>) => ({
              id: String(alert.id ?? ''),
              title: String(alert.title ?? 'Alerta'),
              message: String(alert.description ?? ''),
              severity: String(alert.severity ?? 'low') as 'low' | 'medium' | 'high',
              timestamp: new Date(String(alert.detected_at ?? new Date())),
              isRead: false,
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };
    fetchAlerts();
  }, []);

  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowUserMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header 
      className={`
        fixed top-0 right-0 h-16 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 
        border-b border-gray-200/50 dark:border-gray-700/50 z-30 transition-all duration-300
        ${isCollapsed ? 'left-20' : 'left-70'}
      `}
      style={{ left: isCollapsed ? '80px' : '280px' }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Inicio</span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">
            {sectionTitles[activeSection as keyof typeof sectionTitles] || 'Dashboard'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 backdrop-blur-sm"
            />
          </div>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200 backdrop-blur-sm"
            title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </motion.div>
          </motion.button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors relative backdrop-blur-sm"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {unreadAlerts > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {unreadAlerts}
                </motion.span>
              )}
            </button>

            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-2xl overflow-hidden z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {alerts.length > 0 ? (
                    alerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors ${
                          !alert.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            alert.severity === 'high' ? 'bg-red-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {alert.title}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                              {alert.message}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                              {alert.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No hay notificaciones
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors backdrop-blur-sm"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
              <span className="text-gray-900 dark:text-white font-medium hidden md:block">
                {user?.name}
              </span>
            </button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-48 backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-2xl overflow-hidden z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                    <Settings className="h-4 w-4" />
                    <span>Configuración</span>
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
