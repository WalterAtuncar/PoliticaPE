import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Settings, Volume2, VolumeX, Filter } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Alert } from '../../types/monitoring';

interface NotificationCenterProps {
  alerts: Alert[];
  onClose: () => void;
}

const priorityFilters = [
  { value: 'all', label: 'Todas las prioridades' },
  { value: 'critical', label: 'Solo críticas' },
  { value: 'high', label: 'Altas y críticas' },
  { value: 'medium', label: 'Medias y superiores' },
];

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  alerts,
  onClose,
}) => {
  const [filter, setFilter] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'critical') return alert.priority === 'critical';
    if (filter === 'high') return ['critical', 'high'].includes(alert.priority);
    if (filter === 'medium') return ['critical', 'high', 'medium'].includes(alert.priority);
    return true;
  });

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
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
              {filteredAlerts.length} notificaciones
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
            </div>
          </motion.div>
        )}

        {/* Notifications List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {alert.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                    {alert.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(alert.timestamp)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                {alert.message}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {alert.region}
                </span>
                <div className="flex items-center space-x-2">
                  <Bell className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-500">
                    {alert.type}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay notificaciones que coincidan con el filtro
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};