import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { API_CONFIG, ENDPOINTS } from '../../config/api';
import { Loader2, MapPin } from 'lucide-react';

interface RegionData {
  ubigeo: string;
  region: string;
  mentions: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  engagement: number;
}

export const GeographicMap: React.FC = () => {
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchRegionData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SENTIMENT}?source_type=news`);
        if (response.ok) {
          const sentimentData = await response.json();
          if (sentimentData.by_region && Array.isArray(sentimentData.by_region) && sentimentData.by_region.length > 0) {
            const formattedData: RegionData[] = sentimentData.by_region.map((r: Record<string, unknown>, index: number) => {
              const sentimentValue = Number(r.sentiment ?? 0);
              const calculatedPositive = Math.max(0, Math.min(100, (sentimentValue + 1) * 25));
              const calculatedNegative = Math.max(0, Math.min(100, (1 - sentimentValue) * 25));
              const calculatedNeutral = Math.max(0, 100 - calculatedPositive - calculatedNegative);
              
              return {
                ubigeo: String(r.ubigeo ?? String(index + 1).padStart(2, '0')),
                region: String(r.region ?? `Región ${index + 1}`),
                mentions: Number(r.mentions ?? r.count ?? 0),
                sentiment: {
                  positive: Number(r.positive ?? calculatedPositive),
                  negative: Number(r.negative ?? calculatedNegative),
                  neutral: Number(r.neutral ?? calculatedNeutral),
                },
                engagement: Number(r.engagement ?? 0),
              };
            });
            setRegionData(formattedData);
            setHasData(true);
          }
        }
      } catch (error) {
        console.error('Error fetching region data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegionData();
  }, []);

  if (isLoading) {
    return (
      <Card glass className="p-6">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando datos regionales...</span>
        </div>
      </Card>
    );
  }

  if (!hasData || regionData.length === 0) {
    return (
      <Card glass className="p-6">
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <MapPin className="h-8 w-8 mb-2" />
          <span>No hay datos regionales disponibles</span>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Análisis por Regiones
          </h3>
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Positivo</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Negativo</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Neutral</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {regionData.map((region, index) => (
            <motion.div
              key={region.ubigeo}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/30 dark:border-gray-600/30"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {region.region}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {region.mentions.toLocaleString()} menciones
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div className="h-3 rounded-full flex overflow-hidden">
                  <div
                    className="bg-green-500"
                    style={{ width: `${region.sentiment.positive}%` }}
                  ></div>
                  <div
                    className="bg-red-500"
                    style={{ width: `${region.sentiment.negative}%` }}
                  ></div>
                  <div
                    className="bg-gray-400"
                    style={{ width: `${region.sentiment.neutral}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-green-600 dark:text-green-400">
                    {region.sentiment.positive}% Positivo
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    {region.sentiment.negative}% Negativo
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {region.engagement}% Engagement
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
