import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { Card } from '../ui/Card';
import { DetectedEvent } from '../../types/monitoring';

interface EventDetectionProps {
  events: DetectedEvent[];
}

const eventIcons = {
  crisis: AlertTriangle,
  opportunity: Target,
  viral: TrendingUp,
  anomaly: Zap,
};

const eventColors = {
  crisis: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  opportunity: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  viral: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
  anomaly: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
};

const confidenceColors = {
  high: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-red-600 dark:text-red-400',
};

export const EventDetection: React.FC<EventDetectionProps> = ({ events }) => {
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
          Detección de Eventos
        </h3>
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {events.length} detectados
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {events.slice(0, 4).map((event, index) => {
          const Icon = eventIcons[event.type];
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-lg border-l-4
                ${eventColors[event.type]}
              `}
            >
              <div className="flex items-start space-x-3">
                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {event.title}
                    </h4>
                    <span className={`text-xs font-medium ${confidenceColors[event.confidence]}`}>
                      {event.confidence === 'high' ? 'Alta' : 
                       event.confidence === 'medium' ? 'Media' : 'Baja'} confianza
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-3">
                    {event.description}
                  </p>
                  
                  {/* Event Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Impacto</span>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {event.impact}/10
                      </p>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Velocidad</span>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {event.velocity}x
                      </p>
                    </div>
                  </div>
                  
                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {event.keywords.slice(0, 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-500">
                      {event.region}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500">
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay eventos detectados
          </p>
        </div>
      )}
    </Card>
  );
};