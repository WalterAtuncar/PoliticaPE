import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Filter, 
  Download, 
  Calendar, 
  Server,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DataFilters } from '../../types/data';

interface DataHeaderProps {
  filters: DataFilters;
  onFiltersChange: (filters: DataFilters) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const schemas = [
  { value: 'all', label: 'Todos los schemas' },
  { value: 'raw_data', label: 'raw_data' },
  { value: 'realtime_data', label: 'realtime_data' },
  { value: 'analytics', label: 'analytics' },
  { value: 'geography', label: 'geography' },
  { value: 'auth', label: 'auth' },
  { value: 'system', label: 'system' },
];

const timeRanges = [
  { value: '1h', label: 'Última hora' },
  { value: '24h', label: 'Últimas 24h' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: 'custom', label: 'Personalizado' },
];

const statuses = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
  { value: 'maintenance', label: 'Maintenance' },
];

const severities = [
  { value: 'all', label: 'Todas las severidades' },
  { value: 'critical', label: 'Crítica' },
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low', label: 'Baja' },
];

const volumes = [
  { value: 'all', label: 'Todos los volúmenes' },
  { value: 'high', label: 'Alto volumen (>1M registros)' },
  { value: 'medium', label: 'Volumen medio (100K-1M)' },
  { value: 'low', label: 'Bajo volumen (&lt;100K)' },
];

export const DataHeader: React.FC<DataHeaderProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  isRefreshing,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilter = (key: keyof DataFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card glass className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Datos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Monitoreo y administración del ecosistema de datos de PoliticaPE
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Quick Filters */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={filters.schema}
                onChange={(e) => updateFilter('schema', e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              >
                {schemas.map((schema) => (
                  <option key={schema.value} value={schema.value}>
                    {schema.label}
                  </option>
                ))}
              </select>
              <Server className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

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

            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <AlertTriangle className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>

            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              isLoading={isRefreshing}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-600/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severidad
              </label>
              <select
                value={filters.severity}
                onChange={(e) => updateFilter('severity', e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {severities.map((severity) => (
                  <option key={severity.value} value={severity.value}>
                    {severity.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Volumen de datos
              </label>
              <select
                value={filters.volume}
                onChange={(e) => updateFilter('volume', e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {volumes.map((volume) => (
                  <option key={volume.value} value={volume.value}>
                    {volume.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar por nombre
              </label>
              <input
                type="text"
                placeholder="Nombre de tabla, pipeline, fuente..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.timeRange === 'custom' && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha fin
                </label>
                <input
                  type="date"
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
};