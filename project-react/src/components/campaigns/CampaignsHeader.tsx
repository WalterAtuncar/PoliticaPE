import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  Filter, 
  Download, 
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  Image,
  Users,
  Eye,
  Settings
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CampaignFilters } from '../../types/campaigns';

interface CampaignsHeaderProps {
  filters: CampaignFilters;
  onFiltersChange: (filters: CampaignFilters) => void;
  onCreateCampaign: () => void;
  onViewAssets: () => void;
  onViewCompetitors: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  campaignsCount: number;
}

const statuses = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'review', label: 'En revisión' },
  { value: 'approved', label: 'Aprobada' },
  { value: 'active', label: 'Activa' },
  { value: 'paused', label: 'Pausada' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
];

const regions = [
  { value: 'all', label: 'Todas las regiones' },
  { value: '150000', label: 'Lima' },
  { value: '040000', label: 'Arequipa' },
  { value: '080000', label: 'Cusco' },
  { value: '130000', label: 'La Libertad' },
  { value: '200000', label: 'Piura' },
  { value: '210000', label: 'Puno' },
  { value: '110000', label: 'Ica' },
];

const budgetRanges = [
  { value: 'all', label: 'Todos los presupuestos' },
  { value: '0-50', label: 'Hasta $50K' },
  { value: '50-100', label: '$50K - $100K' },
  { value: '100-250', label: '$100K - $250K' },
  { value: '250+', label: 'Más de $250K' },
];

const performanceFilters = [
  { value: 'all', label: 'Todos los rendimientos' },
  { value: 'high', label: 'Alto rendimiento' },
  { value: 'medium', label: 'Rendimiento medio' },
  { value: 'low', label: 'Bajo rendimiento' },
  { value: 'underperforming', label: 'Bajo expectativas' },
];

const dateRanges = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
  { value: 'custom', label: 'Rango personalizado' },
];

export const CampaignsHeader: React.FC<CampaignsHeaderProps> = ({
  filters,
  onFiltersChange,
  onCreateCampaign,
  onViewAssets,
  onViewCompetitors,
  activeView,
  onViewChange,
  campaignsCount,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilter = (key: keyof CampaignFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const navigationItems = [
    { id: 'list', label: 'Campañas', icon: Megaphone, count: campaignsCount },
    { id: 'assets', label: 'Biblioteca', icon: Image, count: null },
    { id: 'competitors', label: 'Competencia', icon: Eye, count: null },
  ];

  return (
    <Card glass className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Megaphone className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Campañas
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Planifica, ejecuta y optimiza campañas políticas territoriales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Navigation Pills */}
          <div className="flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.count !== null && (
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-bold
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }
                    `}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Filters */}
          {activeView === 'list' && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <TrendingUp className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filters.region}
                  onChange={(e) => updateFilter('region', e.target.value)}
                  className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
                >
                  {regions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

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

            {activeView === 'list' && (
              <Button
                onClick={onCreateCampaign}
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Campaña
              </Button>
            )}

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
      {showAdvancedFilters && activeView === 'list' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-600/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rango de presupuesto
              </label>
              <div className="relative">
                <select
                  value={filters.budget}
                  onChange={(e) => updateFilter('budget', e.target.value)}
                  className="w-full appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {budgetRanges.map((budget) => (
                    <option key={budget.value} value={budget.value}>
                      {budget.label}
                    </option>
                  ))}
                </select>
                <DollarSign className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rendimiento
              </label>
              <select
                value={filters.performance}
                onChange={(e) => updateFilter('performance', e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {performanceFilters.map((perf) => (
                  <option key={perf.value} value={perf.value}>
                    {perf.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período de tiempo
              </label>
              <div className="relative">
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilter('dateRange', e.target.value)}
                  className="w-full appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Búsqueda por nombre
              </label>
              <input
                type="text"
                placeholder="Buscar campañas..."
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha fin
                </label>
                <input
                  type="date"
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
};