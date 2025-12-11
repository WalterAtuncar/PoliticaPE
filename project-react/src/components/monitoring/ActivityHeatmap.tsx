import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';

const peruRegions = [
  { id: '150000', name: 'Lima', activity: 95, x: 30, y: 60 },
  { id: '040000', name: 'Arequipa', activity: 78, x: 25, y: 80 },
  { id: '080000', name: 'Cusco', activity: 82, x: 35, y: 75 },
  { id: '130000', name: 'La Libertad', activity: 65, x: 28, y: 45 },
  { id: '200000', name: 'Piura', activity: 58, x: 20, y: 25 },
  { id: '210000', name: 'Puno', activity: 45, x: 40, y: 85 },
  { id: '110000', name: 'Ica', activity: 52, x: 32, y: 70 },
  { id: '220000', name: 'San Martín', activity: 38, x: 45, y: 40 },
];

export const ActivityHeatmap: React.FC = () => {
  const getActivityColor = (activity: number) => {
    if (activity > 80) return '#dc2626'; // Red - High activity
    if (activity > 60) return '#f59e0b'; // Orange - Medium activity
    if (activity > 40) return '#eab308'; // Yellow - Low activity
    return '#6b7280'; // Gray - Very low activity
  };

  const getActivitySize = (activity: number) => {
    return Math.max(8, (activity / 100) * 20);
  };

  const maxActivity = Math.max(...peruRegions.map(r => r.activity));
  const hotspot = peruRegions.find(r => r.activity === maxActivity);

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Mapa de Calor - Actividad
        </h3>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-red-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Hotspot: {hotspot?.name}
          </span>
        </div>
      </div>

      {/* Simplified Peru Map */}
      <div className="relative bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 mb-6" style={{ height: '300px' }}>
        {/* Peru outline (simplified) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        >
          <path
            d="M20,20 L50,15 L70,25 L75,40 L70,60 L65,80 L45,90 L25,85 L15,70 L18,50 Z"
            fill="rgba(156, 163, 175, 0.3)"
            stroke="rgba(107, 114, 128, 0.5)"
            strokeWidth="0.5"
          />
        </svg>

        {/* Activity Points */}
        {peruRegions.map((region, index) => (
          <motion.div
            key={region.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
            }}
          >
            <div
              className="rounded-full animate-pulse"
              style={{
                width: `${getActivitySize(region.activity)}px`,
                height: `${getActivitySize(region.activity)}px`,
                backgroundColor: getActivityColor(region.activity),
                boxShadow: `0 0 ${getActivitySize(region.activity)}px ${getActivityColor(region.activity)}40`,
              }}
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              <div className="font-medium">{region.name}</div>
              <div>{region.activity}% actividad</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Alta (80%+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Media (60-80%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Baja (40-60%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Muy baja (&lt;40%)</span>
          </div>
        </div>
      </div>

      {/* Top Regions */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Regiones Más Activas
        </h4>
        {peruRegions
          .sort((a, b) => b.activity - a.activity)
          .slice(0, 3)
          .map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 bg-white/30 dark:bg-gray-800/30 rounded"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {region.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getActivityColor(region.activity) }}
                />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {region.activity}%
                </span>
              </div>
            </motion.div>
          ))}
      </div>
    </Card>
  );
};