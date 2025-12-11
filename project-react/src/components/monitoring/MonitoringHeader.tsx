import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Settings, 
  Bell, 
  Volume2, 
  VolumeX, 
  Download,
  Filter,
  Clock,
  Globe
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MonitoringFilters } from '../../types/monitoring';

interface MonitoringHeaderProps {
  filters: MonitoringFilters;
  onFiltersChange: (filters: MonitoringFilters) => void;
  onToggleNotifications: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
}

const platforms = [
  { value: 'twitter', label: 'Twitter', color: '#1DA1F2' },
  { value: 'facebook', label: 'Facebook', color: '#4267B2' },
  { value: 'instagram', label: 'Instagram', color: '#E4405F' },
];

const regions = [
  { value: 'all', label: 'Todo el Perú' },
  { value: '150000', label: 'Lima' },
  { value: '040000', label: 'Arequipa' },
  { value: '080000', label: 'Cusco' },
  { value: '130000', label: 'La Libertad' },
  { value: '200000', label: 'Piura' },
];

const timeRanges = [
  { value: '5m', label: 'Últimos 5min' },
  { value: '15m', label: 'Últimos 15min' },
  { value: '1h', label: 'Última hora' },
  { value: '6h', label: 'Últimas 6h' },
];

const refreshRates = [
  { value: 5, label: '5 seg' },
  { value: 10, label: '10 seg' },
  { value: 30, label: '30 seg' },
  { value: 60, label: '1 min' },
];

export const MonitoringHeader: React.FC<MonitoringHeaderProps> = ({
  filters,
  onFiltersChange,
  onToggleNotifications,
  onToggleSound,
  soundEnabled,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilter = (key: keyof MonitoringFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const togglePlatform = (platform: string) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    updateFilter('platforms', newPlatforms);
  };

  return (
    <Card glass className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Monitoreo en Tiempo Real
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dashboard 24/7 del pulso político nacional
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Auto-refresh Controls */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => updateFilter('autoRefresh', !filters.autoRefresh)}
              variant={filters.autoRefresh ? 'primary' : 'outline'}
              size="sm"
            >
              {filters.autoRefresh ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {filters.autoRefresh ? 'Pausar' : 'Reanudar'}
            </Button>

            <select
              value={filters.refreshRate}
              onChange={(e) => updateFilter('refreshRate', Number(e.target.value))}
              className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm"
              disabled={!filters.autoRefresh}
            >
              {refreshRates.map((rate) => (
                <option key={rate.value} value={rate.value}>
                  {rate.label}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Filters */}
          <div className="flex items-center space-x-2">
            {platforms.map((platform) => (
              <button
                key={platform.value}
                onClick={() => togglePlatform(platform.value)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${filters.platforms.includes(platform.value)
                    ? 'text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }
                `}
                style={{
                  backgroundColor: filters.platforms.includes(platform.value) 
                    ? platform.color 
                    : undefined
                }}
              >
                {platform.label}
              </button>
            ))}
          </div>

          {/* Time Range */}
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
            <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Region Filter */}
          <div className="relative">
            <select
              value={filters.regions[0] || 'all'}
              onChange={(e) => updateFilter('regions', [e.target.value])}
              className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
            <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={onToggleSound}
              variant="outline"
              size="sm"
              title={soundEnabled ? 'Desactivar sonidos' : 'Activar sonidos'}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>

            <Button
              onClick={onToggleNotifications}
              variant="outline"
              size="sm"
              title="Centro de notificaciones"
            >
              <Bell className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline"
              size="sm"
              title="Filtros avanzados"
            >
              <Filter className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" title="Exportar reporte">
              <Download className="h-4 w-4" />
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
                Keywords específicos
              </label>
              <input
                type="text"
                placeholder="Separar con comas..."
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm"
                value={filters.keywords.join(', ')}
                onChange={(e) => updateFilter('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nivel de prioridad mínimo
              </label>
              <select className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm">
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
                <option value="critical">Crítico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sentiment mínimo
              </label>
              <select className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm">
                <option value="all">Todos</option>
                <option value="positive">Solo positivos</option>
                <option value="negative">Solo negativos</option>
                <option value="neutral">Solo neutrales</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
};