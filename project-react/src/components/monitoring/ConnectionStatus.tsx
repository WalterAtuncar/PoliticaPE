import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Clock, Activity } from 'lucide-react';
import { Card } from '../ui/Card';

interface ConnectionStatusProps {
  isConnected: boolean;
  latency: number;
  lastUpdate: Date;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  latency,
  lastUpdate,
}) => {
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h`;
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-600 dark:text-green-400';
    if (latency < 300) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLatencyLabel = (latency: number) => {
    if (latency < 100) return 'Excelente';
    if (latency < 300) return 'Buena';
    return 'Lenta';
  };

  return (
    <Card glass className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
              transition={{ repeat: isConnected ? Infinity : 0, duration: 2 }}
            >
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
            </motion.div>
            <div>
              <span className={`text-sm font-medium ${
                isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                WebSocket en tiempo real
              </p>
            </div>
          </div>

          {/* Latency */}
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <div>
              <span className={`text-sm font-medium ${getLatencyColor(latency)}`}>
                {latency}ms
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getLatencyLabel(latency)}
              </p>
            </div>
          </div>

          {/* Last Update */}
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatTimeAgo(lastUpdate)}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Última actualización
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Datos en vivo' : 'Sin conexión'}
          </span>
        </div>
      </div>
    </Card>
  );
};