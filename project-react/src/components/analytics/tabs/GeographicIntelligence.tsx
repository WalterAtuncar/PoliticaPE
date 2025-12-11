import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, TrendingUp, Eye } from 'lucide-react';
import { Card } from '../../ui/Card';
import { AnalyticsFilters } from '../AnalyticsPage';

interface GeographicIntelligenceProps {
  filters: AnalyticsFilters;
}

const peruRegions = [
  { id: '150000', name: 'Lima', sentiment: 0.15, mentions: 4520, engagement: 8.9, population: 10628470 },
  { id: '040000', name: 'Arequipa', sentiment: 0.28, mentions: 1180, engagement: 7.2, population: 1382730 },
  { id: '080000', name: 'Cusco', sentiment: 0.34, mentions: 1250, engagement: 6.8, population: 1357075 },
  { id: '130000', name: 'La Libertad', sentiment: -0.12, mentions: 980, engagement: 6.1, population: 1905301 },
  { id: '200000', name: 'Piura', sentiment: 0.08, mentions: 750, engagement: 5.9, population: 2047954 },
  { id: '210000', name: 'Puno', sentiment: -0.05, mentions: 650, engagement: 5.2, population: 1237997 },
  { id: '110000', name: 'Ica', sentiment: 0.22, mentions: 580, engagement: 6.5, population: 850765 },
  { id: '220000', name: 'San Martín', sentiment: 0.18, mentions: 420, engagement: 5.8, population: 899648 },
];

const selectedRegionData = {
  name: 'Lima',
  provinces: [
    { name: 'Lima', sentiment: 0.12, mentions: 3200, districts: 43 },
    { name: 'Callao', sentiment: 0.18, mentions: 890, districts: 7 },
    { name: 'Cañete', sentiment: 0.25, mentions: 180, districts: 16 },
    { name: 'Huarochirí', sentiment: 0.08, mentions: 120, districts: 32 },
    { name: 'Yauyos', sentiment: 0.15, mentions: 85, districts: 33 },
  ],
};

export const GeographicIntelligence: React.FC<GeographicIntelligenceProps> = ({ filters }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('150000');
  const [viewLevel, setViewLevel] = useState<'department' | 'province' | 'district'>('department');

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return '#10B981';
    if (sentiment > 0) return '#84CC16';
    if (sentiment > -0.2) return '#F59E0B';
    return '#EF4444';
  };

  const getSentimentIntensity = (sentiment: number) => {
    return Math.min(Math.abs(sentiment) * 2, 1);
  };

  return (
    <div className="space-y-6">
      {/* Geographic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Regiones Activas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  24/25
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  96% cobertura
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Población Cubierta
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  28.5M
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  89% del total nacional
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Región Líder
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  Cusco
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +0.34 sentiment
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Engagement Promedio
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  6.8%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +2.1% vs nacional
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Interactive Map and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mapa Interactivo del Perú
              </h3>
              <div className="flex space-x-2">
                {['department', 'province', 'district'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setViewLevel(level as any)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      viewLevel === level
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {level === 'department' ? 'Departamentos' : 
                     level === 'province' ? 'Provincias' : 'Distritos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Simplified Peru Map Representation */}
            <div className="relative bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 min-h-[400px]">
              <div className="grid grid-cols-3 gap-4 h-full">
                {peruRegions.slice(0, 9).map((region, index) => (
                  <motion.div
                    key={region.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`
                      relative p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105
                      ${selectedRegion === region.id ? 'ring-2 ring-blue-500' : ''}
                    `}
                    style={{
                      backgroundColor: getSentimentColor(region.sentiment),
                      opacity: 0.3 + getSentimentIntensity(region.sentiment) * 0.7,
                    }}
                  >
                    <div className="text-center">
                      <h4 className="font-medium text-white text-sm mb-1">
                        {region.name}
                      </h4>
                      <p className="text-xs text-white/90">
                        {region.mentions} menciones
                      </p>
                      <p className="text-xs text-white/90">
                        {region.sentiment > 0 ? '+' : ''}{region.sentiment.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Sentiment Score
                </h4>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Negativo</span>
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Neutral</span>
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Positivo</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Region Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detalles de Región
            </h3>
            
            {viewLevel === 'department' && (
              <div className="space-y-4">
                {peruRegions
                  .filter(region => region.id === selectedRegion)
                  .map(region => (
                    <div key={region.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {region.name}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          region.sentiment > 0 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {region.sentiment > 0 ? '+' : ''}{region.sentiment.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Población</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {(region.population / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Menciones</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {region.mentions.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {region.engagement}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Menciones per cápita</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {(region.mentions / region.population * 100000).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {viewLevel === 'province' && selectedRegion === '150000' && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Provincias de Lima
                </h4>
                {selectedRegionData.provinces.map((province, index) => (
                  <motion.div
                    key={province.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {province.name}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        province.sentiment > 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {province.sentiment > 0 ? '+' : ''}{province.sentiment.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{province.mentions} menciones</span>
                      <span>{province.districts} distritos</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Regional Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Comparativa Regional Completa
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Región
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Población
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Menciones
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Sentiment
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Engagement
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                    Per Cápita
                  </th>
                </tr>
              </thead>
              <tbody>
                {peruRegions
                  .sort((a, b) => b.mentions - a.mentions)
                  .map((region, index) => (
                    <motion.tr
                      key={region.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                        {region.name}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {(region.population / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {region.mentions.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${
                          region.sentiment > 0.1 ? 'text-green-600 dark:text-green-400' :
                          region.sentiment > -0.1 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {region.sentiment > 0 ? '+' : ''}{region.sentiment.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {region.engagement}%
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {(region.mentions / region.population * 100000).toFixed(1)}
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};