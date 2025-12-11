import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeographicHeader } from './GeographicHeader';
import { GeographicSidebar } from './GeographicSidebar';
import { GeographicLegend } from './GeographicLegend';
import { RegionInfoPanel } from './RegionInfoPanel';
import { RegionComparator } from './RegionComparator';
import { peruGeoData, mockGeographicMetrics } from '../../data/geographicData';
import { GeographicFilters, GeographicMetric } from '../../types/geographic';

const initialFilters: GeographicFilters = {
  timeRange: '30d',
  metric: 'sentiment',
  level: 'department',
  selectedRegions: [],
};

// Peru bounds for map centering
const peruBounds = new LatLngBounds(
  [-18.35, -81.33], // Southwest
  [-0.04, -68.65]   // Northeast
);

export const GeographicPage: React.FC = () => {
  const [filters, setFilters] = useState<GeographicFilters>(initialFilters);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [showComparator, setShowComparator] = useState(false);
  const [mapData, setMapData] = useState(peruGeoData.departments);
  const [metrics, setMetrics] = useState(mockGeographicMetrics);
  const [isLoading, setIsLoading] = useState(false);

  // Update map data based on selected level
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      switch (filters.level) {
        case 'department':
          setMapData(peruGeoData.departments);
          break;
        case 'province':
          setMapData(peruGeoData.provinces);
          break;
        case 'district':
          setMapData(peruGeoData.districts);
          break;
      }
      setIsLoading(false);
    }, 500);
  }, [filters.level]);

  const getMetricValue = (regionId: string): number => {
    const metric = metrics.find(m => m.regionId === regionId);
    if (!metric) return 0;
    
    switch (filters.metric) {
      case 'sentiment':
        return metric.sentiment;
      case 'engagement':
        return metric.engagement;
      case 'shareOfVoice':
        return metric.shareOfVoice;
      case 'mentions':
        return metric.mentions;
      case 'participation':
        return metric.participation;
      default:
        return 0;
    }
  };

  const getColorByValue = (value: number): string => {
    const colors = {
      sentiment: [
        '#dc2626', '#ef4444', '#f87171', '#fca5a5', 
        '#fed7d7', '#f3f4f6', '#dbeafe', '#93c5fd', 
        '#60a5fa', '#3b82f6', '#2563eb'
      ],
      engagement: [
        '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af',
        '#6b7280', '#374151', '#1f2937', '#111827'
      ],
      shareOfVoice: [
        '#fef3c7', '#fde68a', '#fcd34d', '#f59e0b',
        '#d97706', '#b45309', '#92400e', '#78350f'
      ],
      mentions: [
        '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7',
        '#34d399', '#10b981', '#059669', '#047857'
      ],
      participation: [
        '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc',
        '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1'
      ]
    };

    const colorScale = colors[filters.metric as keyof typeof colors] || colors.sentiment;
    const normalizedValue = Math.max(0, Math.min(1, (value + 1) / 2)); // Normalize -1 to 1 range
    const index = Math.floor(normalizedValue * (colorScale.length - 1));
    return colorScale[index];
  };

  const onEachFeature = (feature: any, layer: any) => {
    const regionId = feature.properties.UBIGEO || feature.properties.id;
    const value = getMetricValue(regionId);
    
    layer.setStyle({
      fillColor: getColorByValue(value),
      weight: hoveredRegion === regionId ? 3 : 1,
      opacity: 1,
      color: hoveredRegion === regionId ? '#2563eb' : '#374151',
      fillOpacity: 0.7,
    });

    layer.on({
      mouseover: () => setHoveredRegion(regionId),
      mouseout: () => setHoveredRegion(null),
      click: () => {
        setSelectedRegion(regionId);
        if (filters.selectedRegions.includes(regionId)) {
          setFilters(prev => ({
            ...prev,
            selectedRegions: prev.selectedRegions.filter(id => id !== regionId)
          }));
        } else {
          setFilters(prev => ({
            ...prev,
            selectedRegions: [...prev.selectedRegions, regionId]
          }));
        }
      },
    });

    // Tooltip
    const metric = metrics.find(m => m.regionId === regionId);
    if (metric) {
      layer.bindTooltip(`
        <div class="p-2">
          <h4 class="font-semibold">${feature.properties.NOMBRE || feature.properties.name}</h4>
          <p class="text-sm">Población: ${metric.population.toLocaleString()}</p>
          <p class="text-sm">Sentiment: ${metric.sentiment.toFixed(2)}</p>
          <p class="text-sm">Engagement: ${metric.engagement.toFixed(1)}%</p>
          <p class="text-sm">Menciones: ${metric.mentions.toLocaleString()}</p>
        </div>
      `, {
        permanent: false,
        sticky: true,
        className: 'custom-tooltip'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col space-y-6"
    >
      <GeographicHeader filters={filters} onFiltersChange={setFilters} />
      
      <div className="flex-1 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <GeographicSidebar
            filters={filters}
            onFiltersChange={setFilters}
            metrics={metrics}
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            onShowComparator={() => setShowComparator(true)}
          />
        </div>

        {/* Map Container */}
        <div className="col-span-6 relative">
          <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
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
                  key={`${filters.level}-${filters.metric}`}
                  data={mapData as any}
                  onEachFeature={onEachFeature}
                />
              </MapContainer>
            )}
          </div>

          {/* Legend */}
          <GeographicLegend
            metric={filters.metric}
            getColorByValue={getColorByValue}
          />
        </div>

        {/* Info Panel */}
        <div className="col-span-3">
          <RegionInfoPanel
            selectedRegion={selectedRegion}
            metrics={metrics}
            filters={filters}
          />
        </div>
      </div>

      {/* Region Comparator Modal */}
      {showComparator && (
        <RegionComparator
          selectedRegions={filters.selectedRegions}
          metrics={metrics}
          onClose={() => setShowComparator(false)}
        />
      )}

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
    </motion.div>
  );
};