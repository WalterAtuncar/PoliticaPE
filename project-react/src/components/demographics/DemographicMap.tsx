import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Users, BarChart3 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DemographicFilters, DemographicData } from '../../types/demographics';

interface DemographicMapProps {
  data: DemographicData;
  selectedRegions: string[];
  onRegionSelect: (regionId: string) => void;
  onCompare: () => void;
  isLoading: boolean;
  filters: DemographicFilters;
}

// Peru bounds for map centering
const peruBounds = new LatLngBounds(
  [-18.35, -81.33], // Southwest
  [-0.04, -68.65]   // Northeast
);

type MapMetric = 'population' | 'sentiment' | 'engagement' | 'participation' | 'nse' | 'education';

const metricOptions = [
  { value: 'population', label: 'Densidad Poblacional' },
  { value: 'sentiment', label: 'Sentiment Político' },
  { value: 'engagement', label: 'Engagement Político' },
  { value: 'participation', label: 'Participación Electoral' },
  { value: 'nse', label: 'Nivel Socioeconómico' },
  { value: 'education', label: 'Nivel Educativo' },
];

export const DemographicMap: React.FC<DemographicMapProps> = ({
  data,
  selectedRegions,
  onRegionSelect,
  onCompare,
  isLoading,
  filters,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MapMetric>('population');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const getColorByMetric = (regionId: string): string => {
    const region = data.regions.find(r => r.id === regionId);
    if (!region) return '#E5E7EB'; // Default gray
    
    switch (selectedMetric) {
      case 'population':
        // Population density gradient from light to dark blue
        const maxDensity = Math.max(...data.regions.map(r => r.populationDensity));
        const normalizedDensity = region.populationDensity / maxDensity;
        return getBlueGradient(normalizedDensity);
      
      case 'sentiment':
        // Sentiment from red (negative) to green (positive)
        return getSentimentColor(region.politicalSentiment);
      
      case 'engagement':
        // Engagement from light to dark purple
        const maxEngagement = Math.max(...data.regions.map(r => r.politicalEngagement));
        const normalizedEngagement = region.politicalEngagement / maxEngagement;
        return getPurpleGradient(normalizedEngagement);
      
      case 'participation':
        // Participation from light to dark green
        const normalizedParticipation = (region.electoralParticipation - 50) / 50; // Assuming 50-100% range
        return getGreenGradient(normalizedParticipation);
      
      case 'nse':
        // NSE from light to dark orange
        const normalizedNSE = region.nseIndex / 100;
        return getOrangeGradient(normalizedNSE);
      
      case 'education':
        // Education from light to dark teal
        const normalizedEducation = region.educationIndex / 100;
        return getTealGradient(normalizedEducation);
      
      default:
        return '#E5E7EB';
    }
  };

  const getBlueGradient = (value: number) => {
    const colors = [
      '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', 
      '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', 
      '#1E40AF', '#1E3A8A'
    ];
    const index = Math.min(Math.floor(value * colors.length), colors.length - 1);
    return colors[index];
  };

  const getSentimentColor = (value: number) => {
    if (value > 0.5) return '#10B981'; // Strong positive
    if (value > 0.2) return '#34D399'; // Positive
    if (value > 0) return '#6EE7B7'; // Slight positive
    if (value > -0.2) return '#FCD34D'; // Slight negative
    if (value > -0.5) return '#F87171'; // Negative
    return '#EF4444'; // Strong negative
  };

  const getPurpleGradient = (value: number) => {
    const colors = [
      '#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD', 
      '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9', 
      '#5B21B6', '#4C1D95'
    ];
    const index = Math.min(Math.floor(value * colors.length), colors.length - 1);
    return colors[index];
  };

  const getGreenGradient = (value: number) => {
    const colors = [
      '#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7', 
      '#34D399', '#10B981', '#059669', '#047857', 
      '#065F46', '#064E3B'
    ];
    const index = Math.min(Math.floor(value * colors.length), colors.length - 1);
    return colors[index];
  };

  const getOrangeGradient = (value: number) => {
    const colors = [
      '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74', 
      '#FB923C', '#F97316', '#EA580C', '#C2410C', 
      '#9A3412', '#7C2D12'
    ];
    const index = Math.min(Math.floor(value * colors.length), colors.length - 1);
    return colors[index];
  };

  const getTealGradient = (value: number) => {
    const colors = [
      '#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4', 
      '#2DD4BF', '#14B8A6', '#0D9488', '#0F766E', 
      '#115E59', '#134E4A'
    ];
    const index = Math.min(Math.floor(value * colors.length), colors.length - 1);
    return colors[index];
  };

  const getMetricValue = (regionId: string): number => {
    const region = data.regions.find(r => r.id === regionId);
    if (!region) return 0;
    
    switch (selectedMetric) {
      case 'population': return region.populationDensity;
      case 'sentiment': return region.politicalSentiment;
      case 'engagement': return region.politicalEngagement;
      case 'participation': return region.electoralParticipation;
      case 'nse': return region.nseIndex;
      case 'education': return region.educationIndex;
      default: return 0;
    }
  };

  const getMetricLabel = (metric: MapMetric): string => {
    return metricOptions.find(option => option.value === metric)?.label || '';
  };

  const getMetricUnit = (metric: MapMetric): string => {
    switch (metric) {
      case 'population': return 'hab/km²';
      case 'sentiment': return '';
      case 'engagement': return '%';
      case 'participation': return '%';
      case 'nse': return '/100';
      case 'education': return '/100';
      default: return '';
    }
  };

  const onEachFeature = (feature: any, layer: any) => {
    const regionId = feature.properties.UBIGEO || feature.properties.id;
    const region = data.regions.find(r => r.id === regionId);
    
    if (!region) return;
    
    layer.setStyle({
      fillColor: getColorByMetric(regionId),
      weight: hoveredRegion === regionId || selectedRegions.includes(regionId) ? 3 : 1,
      opacity: 1,
      color: hoveredRegion === regionId ? '#2563EB' : 
             selectedRegions.includes(regionId) ? '#8B5CF6' : '#374151',
      fillOpacity: 0.7,
    });

    layer.on({
      mouseover: () => setHoveredRegion(regionId),
      mouseout: () => setHoveredRegion(null),
      click: () => onRegionSelect(regionId),
    });

    // Tooltip
    layer.bindTooltip(`
      <div class="p-2">
        <h4 class="font-semibold">${region.name}</h4>
        <p class="text-sm">Población: ${region.population.toLocaleString()}</p>
        <p class="text-sm">${getMetricLabel(selectedMetric)}: ${getMetricValue(regionId).toLocaleString(undefined, {maximumFractionDigits: 2})} ${getMetricUnit(selectedMetric)}</p>
      </div>
    `, {
      permanent: false,
      sticky: true,
      className: 'custom-tooltip'
    });
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Map className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mapa Demográfico del Perú
          </h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as MapMetric)}
            className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {metricOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {selectedRegions.length >= 2 && (
            <Button
              onClick={onCompare}
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Comparar Regiones
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Map Container */}
        <div className="col-span-12 lg:col-span-9 relative">
          <div className="h-[500px] rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <MapContainer
                bounds={peruBounds}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <GeoJSON
                  key={`${selectedMetric}-${filters.region}`}
                  data={data.geoJson as any}
                  onEachFeature={onEachFeature}
                />
              </MapContainer>
            )}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-md border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {getMetricLabel(selectedMetric)}
            </h4>
            
            {selectedMetric === 'sentiment' ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Negativo</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Neutral</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Positivo</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-24 h-3 rounded-full bg-gradient-to-r from-gray-200 to-blue-600"></div>
                <div className="flex justify-between w-full text-xs text-gray-600 dark:text-gray-400">
                  <span>Bajo</span>
                  <span>Alto</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Regions */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 p-4 h-full">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Regiones Seleccionadas
            </h4>
            
            {selectedRegions.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {selectedRegions.map((regionId) => {
                  const region = data.regions.find(r => r.id === regionId);
                  if (!region) return null;
                  
                  return (
                    <motion.div
                      key={regionId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {region.name}
                        </h5>
                        <button
                          onClick={() => onRegionSelect(regionId)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Población:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {region.population.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Densidad:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {region.populationDensity.toFixed(1)} hab/km²
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sentiment:</span>
                          <span className={`font-medium ${
                            region.politicalSentiment > 0.1 ? 'text-green-600 dark:text-green-400' :
                            region.politicalSentiment > -0.1 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {region.politicalSentiment > 0 ? '+' : ''}{region.politicalSentiment.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Participación:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {region.electoralParticipation.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <Map className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Selecciona regiones en el mapa para ver detalles y comparar
                </p>
              </div>
            )}
            
            {selectedRegions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {selectedRegions.length === 1 
                    ? 'Selecciona al menos una región más para comparar' 
                    : `${selectedRegions.length} regiones seleccionadas`}
                </div>
                
                {selectedRegions.length >= 2 && (
                  <Button
                    onClick={onCompare}
                    variant="primary"
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Comparar Regiones
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-tooltip {
          background: rgba(17, 24, 39, 0.9) !important;
          border: 1px solid rgba(107, 114, 128, 0.3) !important;
          border-radius: 8px !important;
          color: #f9fafb !important;
          backdrop-filter: blur(10px);
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        
        .leaflet-control-zoom a {
          background: rgba(255, 255, 255, 0.9) !important;
          border: 1px solid rgba(209, 213, 219, 0.5) !important;
          color: #374151 !important;
          backdrop-filter: blur(10px);
        }
        
        .leaflet-control-zoom a:hover {
          background: rgba(255, 255, 255, 1) !important;
          color: #1f2937 !important;
        }
      `}</style>
    </Card>
  );
};