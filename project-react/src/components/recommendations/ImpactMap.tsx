import React from 'react';
import { motion } from 'framer-motion';
import { Map, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { AIRecommendation } from '../../types/recommendations';

interface ImpactMapProps {
  recommendations: AIRecommendation[];
}

const peruRegions = [
  { name: 'Lima', x: 30, y: 60 },
  { name: 'Arequipa', x: 25, y: 80 },
  { name: 'Cusco', x: 35, y: 75 },
  { name: 'La Libertad', x: 28, y: 45 },
  { name: 'Piura', x: 20, y: 25 },
  { name: 'Puno', x: 40, y: 85 },
  { name: 'Ica', x: 32, y: 70 },
];

export const ImpactMap: React.FC<ImpactMapProps> = ({ recommendations }) => {
  const getRegionImpact = (regionName: string) => {
    const regionRecs = recommendations.filter(rec => rec.targetRegion === regionName);
    if (regionRecs.length === 0) return 0;
    
    const avgConfidence = regionRecs.reduce((sum, rec) => sum + rec.aiConfidence, 0) / regionRecs.length;
    const avgROI = regionRecs.reduce((sum, rec) => sum + rec.projectedROI, 0) / regionRecs.length;
    
    return (avgConfidence + avgROI / 3) / 2; // Normalize to 0-100
  };

  const getImpactColor = (impact: number) => {
    if (impact > 70) return '#10b981'; // Green
    if (impact > 50) return '#f59e0b'; // Orange
    if (impact > 30) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  const getImpactSize = (impact: number) => {
    return Math.max(8, (impact / 100) * 16);
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Map className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Mapa de Impacto
        </h3>
      </div>

      {/* Simplified Peru Map */}
      <div className="relative bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 mb-4" style={{ height: '200px' }}>
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

        {/* Impact Points */}
        {peruRegions.map((region, index) => {
          const impact = getRegionImpact(region.name);
          const regionRecs = recommendations.filter(rec => rec.targetRegion === region.name);
          
          return (
            <motion.div
              key={region.name}
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
                className="rounded-full"
                style={{
                  width: `${getImpactSize(impact)}px`,
                  height: `${getImpactSize(impact)}px`,
                  backgroundColor: getImpactColor(impact),
                  boxShadow: `0 0 ${getImpactSize(impact)}px ${getImpactColor(impact)}40`,
                }}
              />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                <div className="font-medium">{region.name}</div>
                <div>{regionRecs.length} recomendaciones</div>
                <div>Impacto: {impact.toFixed(0)}%</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Potencial de Impacto
        </h4>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Alto (70%+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Medio (50-70%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Bajo (&lt;50%)</span>
          </div>
        </div>
      </div>

      {/* Top Regions */}
      <div className="pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Regiones Prioritarias
        </h4>
        <div className="space-y-2">
          {peruRegions
            .map(region => ({
              ...region,
              impact: getRegionImpact(region.name),
              count: recommendations.filter(rec => rec.targetRegion === region.name).length
            }))
            .filter(region => region.count > 0)
            .sort((a, b) => b.impact - a.impact)
            .slice(0, 3)
            .map((region, index) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-white/30 dark:bg-gray-800/30 rounded"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getImpactColor(region.impact) }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {region.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {region.count} recomendaciones
                  </div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    {region.impact.toFixed(0)}% impacto
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </Card>
  );
};