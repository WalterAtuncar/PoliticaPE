import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Bell, 
  Settings, 
  Volume2, 
  VolumeX, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Database, 
  GitBranch, 
  Link 
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
interface DataNotification {
  id: string;
  timestamp: Date;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  message: string;
  title?: string;
  isRead?: boolean;
  actionRequired?: boolean;
  priority?: string;
}

interface NotificationCenterProps {
  notifications?: DataNotification[];
  onClose: () => void;
}

const priorityFilters = [
  { value: 'all', label: 'Todas las prioridades' },
  { value: 'critical', label: 'Solo críticas' },
  { value: 'high', label: 'Altas y críticas' },
  { value: 'medium', label: 'Medias y superiores' },
];

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onClose,
}) => {
  const [filter, setFilter] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const filteredNotifications = (notifications || []).filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'critical') return notification.severity === 'critical';
    if (filter === 'high') return ['critical', 'high'].includes(notification.severity);
    if (filter === 'medium') return ['critical', 'high', 'medium'].includes(notification.severity);
    return true;
  });

  const formatTimeAgo = (timestamp: Date | string | null | undefined) => {
    if (!timestamp) return 'N/A';
    
    try {
      const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }
      
      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) return 'Ahora';
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      return `${Math.floor(hours / 24)}d`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Error en fecha';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'database': return <Database className="h-5 w-5 text-purple-500" />;
      case 'etl': return <GitBranch className="h-5 w-5 text-orange-500" />;
      case 'connection': return <Link className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Centro de Notificaciones"
      size="lg"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              >
                {priorityFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredNotifications.length} notificaciones
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="outline"
              size="sm"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Configuración de Notificaciones
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Notificaciones de sonido
                </span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${soundEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Notificaciones push
                </span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Solo alertas críticas
                </span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Notificaciones por email
                </span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 ${
                  !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-3">
                    {getTypeIcon(notification.type)}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                      {notification.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                </div>
                
                {notification.actionRequired && (
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No hay notificaciones que coincidan con el filtro
              </p>
            </div>
          )}
        </div>

        {/* Mark All as Read */}
        {filteredNotifications.some(n => !n.isRead) && (
          <div className="flex justify-center">
            <Button variant="outline">
              Marcar todas como leídas
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};