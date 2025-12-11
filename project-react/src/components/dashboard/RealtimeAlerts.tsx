import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, MessageSquare, Activity } from 'lucide-react';
import { Alert } from '../../types';
import { Card } from '../ui/Card';
import { useWebSocket } from '../../hooks/useWebSocket';

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'crisis':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'trend':
      return <TrendingUp className="h-5 w-5 text-blue-500" />;
    case 'mention':
      return <MessageSquare className="h-5 w-5 text-green-500" />;
    default:
      return <Activity className="h-5 w-5 text-purple-500" />;
  }
};

const getSeverityColor = (severity: Alert['severity']) => {
  switch (severity) {
    case 'critical':
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    case 'high':
      return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
    case 'medium':
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    default:
      return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
  }
};

export const RealtimeAlerts: React.FC = () => {
  const { data, isConnected } = useWebSocket();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alertas en Tiempo Real
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {data.alerts.slice(0, 5).map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {data.alerts.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay alertas recientes
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};