import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, Download, Upload, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SettingsFilters } from '../../types/settings';

interface SettingsHeaderProps {
  filters: SettingsFilters;
  onFiltersChange: (filters: SettingsFilters) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  isRefreshing
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title and Description */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuración del Sistema
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Administración y configuración de PoliticaPE
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar usuarios, roles..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              status: e.target.value as SettingsFilters['status']
            })}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="suspended">Suspendidos</option>
          </select>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => onFiltersChange({ ...filters, role: e.target.value })}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            <option value="super_admin">Super Administrador</option>
            <option value="analytics_manager">Gerente de Analytics</option>
            <option value="campaign_coordinator">Coordinador de Campañas</option>
            <option value="data_analyst">Analista de Datos</option>
            <option value="viewer">Visualizador</option>
          </select>

          {/* Bulk Actions */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>

          {/* Refresh */}
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>

          {/* Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Advanced Filters Row (can be toggled) */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Ordenar por:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
              className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs"
            >
              <option value="name">Nombre</option>
              <option value="email">Email</option>
              <option value="role">Rol</option>
              <option value="lastLogin">Último acceso</option>
              <option value="createdAt">Fecha de creación</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                sortOrder: e.target.value as 'asc' | 'desc'
              })}
              className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Período:</span>
            <input
              type="date"
              value={filters.dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, start: new Date(e.target.value) }
              })}
              className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs"
            />
            <span className="text-gray-400">hasta</span>
            <input
              type="date"
              value={filters.dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, end: new Date(e.target.value) }
              })}
              className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 