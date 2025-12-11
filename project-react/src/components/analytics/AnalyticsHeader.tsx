import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Filter, Download } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AnalyticsFilters } from './AnalyticsPage';

interface AnalyticsHeaderProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

const timeRanges = [
  { value: '24h', label: 'Últimas 24h' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
  { value: 'custom', label: 'Personalizado' },
];

const regions = [
  { value: 'all', label: 'Todo el Perú' },
  { value: '150000', label: 'Lima' },
  { value: '040000', label: 'Arequipa' },
  { value: '080000', label: 'Cusco' },
  { value: '130000', label: 'La Libertad' },
  { value: '200000', label: 'Piura' },
  { value: '210000', label: 'Puno' },
  { value: '110000', label: 'Ica' },
];

const ageGroups = [
  { value: 'all', label: 'Todas las edades' },
  { value: '18-25', label: '18-25 años' },
  { value: '26-35', label: '26-35 años' },
  { value: '36-50', label: '36-50 años' },
  { value: '50+', label: '50+ años' },
];

const nseOptions = [
  { value: 'all', label: 'Todos los NSE' },
  { value: 'A', label: 'NSE A' },
  { value: 'B', label: 'NSE B' },
  { value: 'C', label: 'NSE C' },
  { value: 'D', label: 'NSE D' },
  { value: 'E', label: 'NSE E' },
];

const genderOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
];

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [showCustomDate, setShowCustomDate] = useState(false);

  const updateFilter = (key: keyof AnalyticsFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
    if (key === 'timeRange' && value === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
    }
  };

  return (
    <Card glass className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Avanzado
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análisis profundo del panorama político peruano
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
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

          {/* Region Filter */}
          <div className="relative">
            <select
              value={filters.region}
              onChange={(e) => updateFilter('region', e.target.value)}
              className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
            <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Demographics Filters */}
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={filters.ageGroup}
                onChange={(e) => updateFilter('ageGroup', e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              >
                {ageGroups.map((age) => (
                  <option key={age.value} value={age.value}>
                    {age.label}
                  </option>
                ))}
              </select>
              <Users className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.nse}
                onChange={(e) => updateFilter('nse', e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              >
                {nseOptions.map((nse) => (
                  <option key={nse.value} value={nse.value}>
                    {nse.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.gender}
                onChange={(e) => updateFilter('gender', e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              >
                {genderOptions.map((gender) => (
                  <option key={gender.value} value={gender.value}>
                    {gender.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Button */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Custom Date Range */}
      {showCustomDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50"
        >
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha inicio
              </label>
              <input
                type="date"
                className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha fin
              </label>
              <input
                type="date"
                className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              />
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
};