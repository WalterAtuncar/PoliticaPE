import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Bookmark,
  BookmarkPlus,
  Download,
  Filter
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DemographicFilters, DemographicInsightsData } from '../../types/demographics';

interface DemographicInsightsProps {
  data: DemographicInsightsData;
  isLoading: boolean;
  filters: DemographicFilters;
}

const insightTypes = [
  { id: 'all', label: 'Todos los insights' },
  { id: 'opportunity', label: 'Oportunidades', icon: Target },
  { id: 'trend', label: 'Tendencias', icon: TrendingUp },
  { id: 'risk', label: 'Riesgos', icon: AlertTriangle },
];

const insightColors = {
  opportunity: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  trend: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  risk: 'border-red-500 bg-red-50 dark:bg-red-900/20',
};

const insightIcons = {
  opportunity: Target,
  trend: TrendingUp,
  risk: AlertTriangle,
};

export const DemographicInsights: React.FC<DemographicInsightsProps> = ({
  data,
  isLoading,
  filters,
}) => {
  const [selectedType, setSelectedType] = useState('all');
  const [bookmarkedInsights, setBookmarkedInsights] = useState<string[]>([]);
  const [showBookmarked, setShowBookmarked] = useState(false);

  const toggleBookmark = (insightId: string) => {
    setBookmarkedInsights(prev => 
      prev.includes(insightId) 
        ? prev.filter(id => id !== insightId)
        : [...prev, insightId]
    );
  };

  const filteredInsights = data.insights.filter(insight => {
    const matchesType = selectedType === 'all' || insight.type === selectedType;
    const matchesBookmark = !showBookmarked || bookmarkedInsights.includes(insight.id);
    return matchesType && matchesBookmark;
  });

  return (
    <div className="space-y-6">
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Insights Demográficos
            </h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBookmarked(!showBookmarked)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${showBookmarked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${showBookmarked ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Solo guardados
              </span>
            </div>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Insight Type Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {insightTypes.map((type) => {
            const Icon = type.icon;
            const isActive = selectedType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }
                `}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{type.label}</span>
                {type.id !== 'all' && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {data.insights.filter(i => i.type === type.id).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Insights Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-48 bg-white/20 dark:bg-gray-800/20 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInsights.map((insight, index) => {
              const Icon = insightIcons[insight.type as keyof typeof insightIcons];
              const isBookmarked = bookmarkedInsights.includes(insight.id);
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-6 border-l-4 ${insightColors[insight.type as keyof typeof insightColors]}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'opportunity' ? 'bg-green-100 dark:bg-green-900/20' :
                          insight.type === 'trend' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            insight.type === 'opportunity' ? 'text-green-600 dark:text-green-400' :
                            insight.type === 'trend' ? 'text-blue-600 dark:text-blue-400' :
                            'text-red-600 dark:text-red-400'
                          }`} />
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {insight.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {insight.region}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {insight.segment}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleBookmark(insight.id)}
                        className={`p-1 rounded-full ${
                          isBookmarked 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                      >
                        {isBookmarked ? (
                          <Bookmark className="h-5 w-5 fill-current" />
                        ) : (
                          <BookmarkPlus className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                      {insight.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {insight.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 rounded font-medium ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {insight.priority === 'high' ? 'Alta' : 
                           insight.priority === 'medium' ? 'Media' : 'Baja'} prioridad
                        </span>
                      </div>
                      
                      <span className="text-gray-500">
                        Actualizado {new Date(insight.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No se encontraron insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {showBookmarked 
                ? 'No tienes insights guardados. Guarda algunos insights para verlos aquí.' 
                : 'Prueba ajustando los filtros para ver más insights.'}
            </p>
            {showBookmarked && (
              <Button
                onClick={() => setShowBookmarked(false)}
                variant="outline"
              >
                <Filter className="h-4 w-4 mr-2" />
                Ver todos los insights
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Opportunity Spotlight */}
      {!isLoading && filteredInsights.some(i => i.type === 'opportunity') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Oportunidad Destacada
              </h3>
            </div>

            {(() => {
              const spotlight = filteredInsights.find(i => i.type === 'opportunity' && i.isSpotlight);
              if (!spotlight) return null;
              
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {spotlight.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                      {spotlight.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-green-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Segmento Objetivo
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {spotlight.segment}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Potencial de Crecimiento
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {spotlight.growthPotential}% de incremento en engagement
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Factores de Riesgo
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {spotlight.riskFactors.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Recomendación Estratégica
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      {spotlight.recommendation}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {spotlight.actionItems.map((action, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Impacto estimado: <span className="font-medium text-green-600 dark:text-green-400">Alto</span>
                      </span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Plan
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </motion.div>
      )}
    </div>
  );
};