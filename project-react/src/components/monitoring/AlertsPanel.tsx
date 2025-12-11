import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, MessageSquare, Activity, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Alert } from '../../types/monitoring';

interface AlertsPanelProps {
  alerts: Alert[];
}

const alertIcons = {
  crisis: AlertTriangle,
  trend: TrendingUp,
  mention: MessageSquare,
  sentiment: Activity,
};

const alertColors = {
  critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  high: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
  medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  low: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
};

const priorityLabels = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const [dismissedAlerts, setDismissedAlerts] = React.useState<string[]>([]);

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

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

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alertas Críticas
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {visibleAlerts.length} activas
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {visibleAlerts.slice(0, 8).map((alert, index) => {
            const Icon = alertIcons[alert.type];
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  p-4 rounded-lg border-l-4 relative group
                  ${alertColors[alert.priority]}
                `}
              >
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-3 w-3" />
                </button>

                <div className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {alert.title}
                      </p>
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${alert.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          alert.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }
                      `}>
                        {priorityLabels[alert.priority]}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-500">
                        {alert.region}
                      </span>
                      <span className="text-gray-500 dark:text-gray-500">
                        {formatTimeAgo(alert.timestamp)}
                      </span>
                    </div>
                    
                    {alert.metrics && (
                      <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Cambio</span>
                            <p className={`font-medium ${
                              alert.metrics.change > 0 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {alert.metrics.change > 0 ? '+' : ''}{alert.metrics.change}%
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Impacto</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {alert.metrics.impact}/10
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {visibleAlerts.length === 0 && (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay alertas activas
          </p>
        </div>
      )}
    </Card>
  );
};