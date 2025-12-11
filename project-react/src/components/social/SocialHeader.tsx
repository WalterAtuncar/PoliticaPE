import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Youtube, 
  RefreshCw, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  MapPin, 
  Users, 
  MessageSquare,
  Settings
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SocialFilters } from '../../types/social';

interface SocialHeaderProps {
  filters: SocialFilters;
  onFilterChange: (filters: Partial<SocialFilters>) => void;
  activePlatform: string;
  onPlatformChange: (platform: string) => void;
  onRefresh: () => void;
}

const platforms = [
  { id: 'all', label: 'Todas', icon: MessageSquare, color: '#6B7280' },
  { id: 'twitter', label: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#4267B2' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'tiktok', label: 'TikTok', icon: MessageSquare, color: '#000000' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
];

const entities = [
  { value: 'all', label: 'Todos' },
  { value: 'dina-boluarte', label: 'Dina Boluarte' },
  { value: 'keiko-fujimori', label: 'Keiko Fujimori' },
  { value: 'pedro-castillo', label: 'Pedro Castillo' },
  { value: 'fuerza-popular', label: 'Fuerza Popular' },
  { value: 'peru-libre', label: 'Perú Libre' },
  { value: 'accion-popular', label: 'Acción Popular' },
];

const regions = [
  { value: 'all', label: 'Todo el Perú' },
  { value: 'lima', label: 'Lima' },
  { value: 'arequipa', label: 'Arequipa' },
  { value: 'cusco', label: 'Cusco' },
  { value: 'la-libertad', label: 'La Libertad' },
  { value: 'piura', label: 'Piura' },
];

const dateRanges = [
  { value: '1d', label: 'Último día' },
  { value: '7d', label: 'Última semana' },
  { value: '30d', label: 'Último mes' },
  { value: '90d', label: 'Últimos 3 meses' },
  { value: 'custom', label: 'Personalizado' },
];

const sentiments = [
  { value: 'all', label: 'Todos los sentimientos' },
  { value: 'positive', label: 'Positivo' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negativo' },
];

const contentTypes = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'text', label: 'Texto' },
  { value: 'image', label: 'Imagen' },
  { value: 'video', label: 'Video' },
  { value: 'poll', label: 'Encuesta' },
  { value: 'link', label: 'Enlace' },
];

export const SocialHeader: React.FC<SocialHeaderProps> = ({
  filters,
  onFilterChange,
  activePlatform,
  onPlatformChange,
  onRefresh,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ keywords: searchTerm.split(' ') });
  };

  return (
    <Card glass className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Redes Sociales
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitoreo y análisis de contenido político en plataformas sociales
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500"
            />
          </form>

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
              onClick={handleRefresh}
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

      {/* Platform Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isActive = activePlatform === platform.id;
          
          return (
            <button
              key={platform.id}
              onClick={() => onPlatformChange(platform.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }
              `}
              style={{
                backgroundColor: isActive ? platform.color : undefined
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{platform.label}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-600/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Entidad política
              </label>
              <select
                value={filters.entity}
                onChange={(e) => onFilterChange({ entity: e.target.value })}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {entities.map((entity) => (
                  <option key={entity.value} value={entity.value}>
                    {entity.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Región
              </label>
              <div className="relative">
                <select
                  value={filters.region}
                  onChange={(e) => onFilterChange({ region: e.target.value })}
                  className="w-full appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período de tiempo
              </label>
              <div className="relative">
                <select
                  value={filters.dateRange}
                  onChange={(e) => onFilterChange({ dateRange: e.target.value })}
                  className="w-full appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Sentiment
              </label>
              <select
                value={filters.sentiment}
                onChange={(e) => onFilterChange({ sentiment: e.target.value })}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sentiments.map((sentiment) => (
                  <option key={sentiment.value} value={sentiment.value}>
                    {sentiment.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de contenido
              </label>
              <select
                value={filters.contentType}
                onChange={(e) => onFilterChange({ contentType: e.target.value })}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {contentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Keywords (separados por coma)
              </label>
              <input
                type="text"
                value={filters.keywords.join(', ')}
                onChange={(e) => onFilterChange({ keywords: e.target.value.split(', ').filter(k => k) })}
                className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reforma, educación, salud..."
              />
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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