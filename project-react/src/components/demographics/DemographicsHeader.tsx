import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Filter, 
  Download, 
  Calendar, 
  MapPin, 
  Briefcase,
  GraduationCap,
  Home,
  BarChart3,
  PieChart,
  Lightbulb,
  FlaskConical
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DemographicFilters } from '../../types/demographics';

interface DemographicsHeaderProps {
  filters: DemographicFilters;
  onFiltersChange: (filters: DemographicFilters) => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

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

const educationOptions = [
  { value: 'all', label: 'Todos los niveles' },
  { value: 'primary', label: 'Primaria' },
  { value: 'secondary', label: 'Secundaria' },
  { value: 'higher', label: 'Superior' },
  { value: 'postgrad', label: 'Posgrado' },
];

const zoneOptions = [
  { value: 'all', label: 'Todas las zonas' },
  { value: 'urban', label: 'Urbana' },
  { value: 'rural', label: 'Rural' },
];

const timeRanges = [
  { value: '1y', label: 'Último año' },
  { value: '3y', label: '3 años' },
  { value: '5y', label: '5 años' },
  { value: '10y', label: '10 años' },
];

const viewOptions = [
  { id: 'overview', label: 'Visión General', icon: BarChart3 },
  { id: 'segmentation', label: 'Segmentación', icon: PieChart },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'scenarios', label: 'Escenarios', icon: FlaskConical },
];

export const DemographicsHeader: React.FC<DemographicsHeaderProps> = ({
  filters,
  onFiltersChange,
  activeView,
  onViewChange,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilter = (key: keyof DemographicFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card glass className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Análisis Demográfico
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Inteligencia demográfica del electorado peruano
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* View Selector */}
          <div className="flex items-center space-x-2">
            {viewOptions.map((view) => {
              const Icon = view.icon;
              const isActive = activeView === view.id;
              
              return (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{view.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-3">
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

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grupo etario
              </label>
              <select
                value={filters.ageGroup}
                onChange={(e) => updateFilter('ageGroup', e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ageGroups.map((age) => (
                  <option key={age.value} value={age.value}>
                    {age.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nivel socioeconómico
              </label>
              <select
                value={filters.nse}
                onChange={(e) => updateFilter('nse', e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {nseOptions.map((nse) => (
                  <option key={nse.value} value={nse.value}>
                    {nse.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Género
              </label>
              <select
                value={filters.gender}
                onChange={(e) => updateFilter('gender', e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {genderOptions.map((gender) => (
                  <option key={gender.value} value={gender.value}>
                    {gender.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nivel educativo
              </label>
              <select
                value={filters.education}
                onChange={(e) => updateFilter('education', e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {educationOptions.map((edu) => (
                  <option key={edu.value} value={edu.value}>
                    {edu.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zona
              </label>
              <select
                value={filters.zone}
                onChange={(e) => updateFilter('zone', e.target.value)}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {zoneOptions.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => onFiltersChange(initialFilters)}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Restablecer filtros
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
};