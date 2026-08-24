import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Filter,
  Download,
  MapPin,
  DollarSign,
  Target
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RecommendationsFilters } from '../../types/recommendations';
import { ZONES } from '../../data/limaDistricts';

interface RecommendationsHeaderProps {
  filters: RecommendationsFilters;
  onFiltersChange: (filters: RecommendationsFilters) => void;
  onGenerateNew: () => void;
  isGenerating: boolean;
}

const regionOptions = [
  { value: 'all', label: 'Toda la cartera' },
  ...ZONES.map(z => ({ value: z as string, label: z as string })),
  { value: 'metro', label: 'Lima Metropolitana (toda la ciudad)' },
];


const priorities = [
  { value: 'all', label: 'Todas las prioridades' },
  { value: 'critical', label: 'Crítico' },
  { value: 'high', label: 'Alto' },
  { value: 'medium', label: 'Medio' },
  { value: 'low', label: 'Bajo' },
];

const statuses = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'generated', label: 'Generada' },
  { value: 'under_review', label: 'Bajo revisión' },
  { value: 'approved', label: 'Aprobada' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'rejected', label: 'Rechazada' },
];

export const RecommendationsHeader: React.FC<RecommendationsHeaderProps> = ({
  filters,
  onFiltersChange,
  onGenerateNew,
  isGenerating,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilter = (key: keyof RecommendationsFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card glass className="p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Recomendaciones IA
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 ml-12">
            Estrategias de campaña generadas con Claude IA basadas en datos reales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filters.region}
                onChange={(e) => updateFilter('region', e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
              >
                {regionOptions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.priority}
                onChange={(e) => updateFilter('priority', e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
              <Target className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-1.5" />
              Filtros
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {showAdvancedFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-600/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado de implementación
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confianza IA mínima (%)
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.confidenceMin}
                  onChange={(e) => updateFilter('confidenceMin', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filters.confidenceMin}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Presupuesto máximo
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={filters.budgetMax}
                  onChange={(e) => updateFilter('budgetMax', Number(e.target.value))}
                  className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pl-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="100000"
                />
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
};
