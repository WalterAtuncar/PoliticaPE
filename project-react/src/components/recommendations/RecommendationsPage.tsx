import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap, Target, Users as UsersIcon, AlertCircle } from 'lucide-react';
import { ElectoralCountdown } from './ElectoralCountdown';
import { FiguresPanel } from './FiguresPanel';
import { RecommendationsHeader } from './RecommendationsHeader';
import { RecommendationsTabs } from './RecommendationsTabs';
import { RecommendationCard } from './RecommendationCard';
import { StrategyComparator } from './StrategyComparator';
import { ROIDashboard } from './ROIDashboard';
import { ImpactMap } from './ImpactMap';
import { BudgetCalculator } from './BudgetCalculator';
import { RecommendationsFilters, AIRecommendation } from '../../types/recommendations';
import { useAIRecommendations } from '../../hooks/useAIRecommendations';
import { usePoliticalFigures } from '../../hooks/usePoliticalFigures';
import { useElectoralConfig } from '../../hooks/useElectoralConfig';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { matchesZone } from '../../utils/targetRegion';

const initialFilters: RecommendationsFilters = {
  region: 'all',
  priority: 'all',
  category: 'all',
  status: 'all',
  confidenceMin: 0,
  budgetMax: 1000000,
};

const focusAreaOptions = [
  { id: 'territorial_priority', label: 'Prioridad territorial', icon: Target, color: 'text-amber-600' },
  { id: 'message_of_day', label: 'Mensaje del día', icon: Zap, color: 'text-yellow-600' },
  { id: 'crisis_response', label: 'Respuesta a crisis', icon: Brain, color: 'text-red-600' },
  { id: 'rival_contrast', label: 'Contraste con rivales', icon: UsersIcon, color: 'text-purple-600' },
  { id: 'ground_game', label: 'Trabajo de calle', icon: Target, color: 'text-green-600' },
  { id: 'digital_push', label: 'Empuje digital', icon: Zap, color: 'text-blue-600' },
];

export const RecommendationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<RecommendationsFilters>(initialFilters);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [showComparator, setShowComparator] = useState(false);
  const [selectedFigureIds, setSelectedFigureIds] = useState<string[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);

  const { figures, isLoading: figuresLoading, createFigure, updateFigure, deleteFigure } = usePoliticalFigures();
  const { config: electoralConfig } = useElectoralConfig();

  // La pantalla solo muestra las recomendaciones de la candidatura propia, asi que
  // preseleccionarla evita generar para un rival y que el resultado no aparezca.
  const ownFigureId = figures.find(f => f.is_own_candidate)?.id;
  useEffect(() => {
    if (ownFigureId) setSelectedFigureIds(prev => (prev.length ? prev : [ownFigureId]));
  }, [ownFigureId]);

  // Cerrada la ventana de propaganda, los focos de calle y pauta ya no son legales.
  const availableFocusAreas = focusAreaOptions.filter(
    f => electoralConfig?.propaganda_allowed !== false || !['ground_game', 'digital_push'].includes(f.id)
  );

  const {
    recommendations,
    isLoading,
    generateNewRecommendations,
    updateRecommendationStatus,
    rateRecommendation,
    getPortfolioMetrics,
  } = useAIRecommendations(filters);

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesTab = () => activeTab === 'all' || rec.category === activeTab;
    return matchesTab() &&
      matchesZone(rec.targetRegion, filters.region) &&
      (filters.priority === 'all' || rec.priority === filters.priority) &&
      (filters.status === 'all' || rec.status === filters.status) &&
      rec.aiConfidence >= filters.confidenceMin &&
      rec.estimatedBudget.max <= filters.budgetMax;
  });

  const handleToggleFigureSelection = (id: string) => {
    setSelectedFigureIds(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSelectAllFigures = () => {
    setSelectedFigureIds(figures.filter(f => f.is_active).map(f => f.id));
  };

  const handleOpenGenerator = () => {
    setGenerationError(null);
    setSelectedFocus([]);
    setShowFocusModal(true);
  };

  const handleGenerate = async () => {
    setGenerationError(null);
    setShowFocusModal(false);
    try {
      const areas = selectedFocus.length > 0
        ? selectedFocus
        : availableFocusAreas.map(f => f.id);
      await generateNewRecommendations(selectedFigureIds, areas);
    } catch (e: any) {
      setGenerationError(e.message || 'Error al generar recomendaciones');
    }
  };

  const handleSelectRecommendation = (id: string) => {
    setSelectedRecommendations(prev =>
      prev.includes(id) ? prev.filter(recId => recId !== id) : [...prev, id]
    );
  };

  const toggleFocus = (id: string) => {
    setSelectedFocus(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const selectedRecommendationData = recommendations.filter(rec =>
    selectedRecommendations.includes(rec.id)
  );

  const figureMap = Object.fromEntries(figures.map(f => [f.id, f]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <ElectoralCountdown />

      {generationError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">Error al generar recomendaciones</p>
            <p className="text-xs mt-0.5">{generationError}</p>
          </div>
          <button onClick={() => setGenerationError(null)} className="text-red-400 hover:text-red-600">
            <span className="sr-only">Cerrar</span>&times;
          </button>
        </motion.div>
      )}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/30"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center"
            >
              <Brain className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Claude IA analizando datos...
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Procesando {selectedFigureIds.length} figura(s) con datos reales de redes sociales
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              'Recopilando posts...',
              'Analizando sentimiento...',
              'Evaluando regiones...',
              'Consultando Claude...',
              'Generando estrategias...'
            ].map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.6 }}
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.4 }}
                  className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"
                />
                <span>{step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-3">
          <FiguresPanel
            figures={figures}
            isLoading={figuresLoading}
            onCreate={createFigure}
            onUpdate={updateFigure}
            onDelete={deleteFigure}
            selectedFigureIds={selectedFigureIds}
            onToggleSelection={handleToggleFigureSelection}
            onSelectAll={handleSelectAllFigures}
            onClearSelection={() => setSelectedFigureIds([])}
            onGenerate={handleOpenGenerator}
            isGenerating={isLoading}
          />
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-5">
          <RecommendationsHeader
            filters={filters}
            onFiltersChange={setFilters}
            onGenerateNew={handleOpenGenerator}
            isGenerating={isLoading}
          />

          <RecommendationsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            recommendations={recommendations}
          />

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 xl:col-span-8 space-y-4">
              {!isLoading && filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RecommendationCard
                      recommendation={recommendation}
                      isSelected={selectedRecommendations.includes(recommendation.id)}
                      onSelect={() => handleSelectRecommendation(recommendation.id)}
                      onStatusUpdate={(status) => updateRecommendationStatus(recommendation.id, status)}
                      onRate={(rating) => rateRecommendation(recommendation.id, rating)}
                      figureName={recommendation.figure_id ? figureMap[recommendation.figure_id]?.display_name : undefined}
                    />
                  </motion.div>
                ))
              ) : !isLoading ? (
                <Card glass className="p-10 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {figures.length === 0
                      ? 'Comienza registrando figuras políticas'
                      : 'Sin recomendaciones en esta categoría'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
                    {figures.length === 0
                      ? 'Registra figuras políticas en el panel izquierdo, selecciónalas y genera recomendaciones estratégicas con Claude IA.'
                      : 'Selecciona figuras políticas en el panel izquierdo y genera nuevas recomendaciones para ver resultados aquí.'}
                  </p>
                </Card>
              ) : null}
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-5">
              <ROIDashboard metrics={getPortfolioMetrics()} />
              <BudgetCalculator
                selectedRecommendations={selectedRecommendationData}
                onShowComparator={() => setShowComparator(true)}
              />
              <ImpactMap recommendations={recommendations} />
            </div>
          </div>
        </div>
      </div>

      {showFocusModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowFocusModal(false)}
          title="Configurar Generación IA"
          size="md"
        >
          <div className="space-y-5">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Análisis con Claude IA</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedFigureIds.length} figura(s) seleccionada(s) para análisis
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedFigureIds.map(id => {
                  const fig = figureMap[id];
                  return fig ? (
                    <span key={id} className="inline-flex items-center px-2 py-1 rounded-lg bg-white/70 dark:bg-gray-800/50 text-sm font-medium text-purple-700 dark:text-purple-300">
                      {fig.display_name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Áreas de enfoque (opcional - si no seleccionas ninguna se analizan todas)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {availableFocusAreas.map((area) => {
                  const Icon = area.icon;
                  const isSelected = selectedFocus.includes(area.id);
                  return (
                    <button
                      key={area.id}
                      onClick={() => toggleFocus(area.id)}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-200 text-left
                        ${isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-purple-600' : area.color}`} />
                        <span className={`font-medium text-xs ${isSelected ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                          {area.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowFocusModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Generar con Claude IA
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showComparator && selectedRecommendations.length > 1 && (
        <StrategyComparator
          recommendations={selectedRecommendationData}
          onClose={() => setShowComparator(false)}
        />
      )}
    </motion.div>
  );
};
