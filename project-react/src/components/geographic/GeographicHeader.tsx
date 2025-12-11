import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Download, Search, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GeographicFilters } from '../../types/geographic';

interface GeographicHeaderProps {
  filters: GeographicFilters;
  onFiltersChange: (filters: GeographicFilters) => void;
}

const timeRanges = [
  { value: '24h', label: 'Últimas 24h' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
  { value: 'custom', label: 'Personalizado' },
];

const metrics = [
  { value: 'sentiment', label: 'Sentiment Score' },
  { value: 'engagement', label: 'Engagement Rate' },
  { value: 'shareOfVoice', label: 'Share of Voice' },
  { value: 'mentions', label: 'Menciones Totales' },
  { value: 'participation', label: 'Participación Electoral' },
];

const levels = [
  { value: 'department', label: 'Departamentos' },
  { value: 'province', label: 'Provincias' },
  { value: 'district', label: 'Distritos' },
];

export const GeographicHeader: React.FC<GeographicHeaderProps> = ({
  filters,
  onFiltersChange,
}) => {
  const updateFilter = (key: keyof GeographicFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card glass className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Análisis Geográfico
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Inteligencia territorial del panorama político peruano
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar región..."
              className="pl-10 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          {/* Time Range Filter */}
          <div className="relative">
            <select
              value={filters.timeRange}
              onChange={(e) => updateFilter('timeRange', e.target.value)}
              className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Metric Selector */}
          <div className="relative">
            <select
              value={filters.metric}
              onChange={(e) => updateFilter('metric', e.target.value)}
              className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            >
              {metrics.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Level Selector */}
          <div className="relative">
            <select
              value={filters.level}
              onChange={(e) => updateFilter('level', e.target.value)}
              className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            >
              {levels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Export Button */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
    </Card>
  );
};