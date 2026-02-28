import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RecommendationsHeader } from './RecommendationsHeader';
import { RecommendationsTabs } from './RecommendationsTabs';
import { RecommendationCard } from './RecommendationCard';
import { StrategyComparator } from './StrategyComparator';
import { ROIDashboard } from './ROIDashboard';
import { ImpactMap } from './ImpactMap';
import { ImplementationTimeline } from './ImplementationTimeline';
import { BudgetCalculator } from './BudgetCalculator';
import { AIGenerator } from './AIGenerator';
import { PoliticalFiguresManager } from './PoliticalFiguresManager';
import { RecommendationsFilters, AIRecommendation } from '../../types/recommendations';
import { useAIRecommendations } from '../../hooks/useAIRecommendations';
import { usePoliticalFigures } from '../../hooks/usePoliticalFigures';

const initialFilters: RecommendationsFilters = {
  region: 'all',
  demographic: 'all',
  priority: 'all',
  category: 'all',
  status: 'all',
  confidenceMin: 0,
  budgetMax: 1000000,
};

export const RecommendationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('immediate');
  const [filters, setFilters] = useState<RecommendationsFilters>(initialFilters);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [showComparator, setShowComparator] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showFiguresManager, setShowFiguresManager] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const { figures, isLoading: figuresLoading, createFigure, updateFigure, deleteFigure } = usePoliticalFigures();

  const {
    recommendations,
    isLoading,
    generateNewRecommendations,
    updateRecommendationStatus,
    rateRecommendation,
    getROIMetrics
  } = useAIRecommendations(filters);

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesTab = () => {
      switch (activeTab) {
        case 'immediate':
          return rec.category === 'immediate_opportunities';
        case 'regional':
          return rec.category === 'regional_strengthening';
        case 'recovery':
          return rec.category === 'territorial_recovery';
        case 'expansion':
          return rec.category === 'demographic_expansion';
        default:
          return true;
      }
    };

    return matchesTab() &&
           (filters.region === 'all' || rec.targetRegion === filters.region) &&
           (filters.priority === 'all' || rec.priority === filters.priority) &&
           (filters.status === 'all' || rec.status === filters.status) &&
           rec.aiConfidence >= filters.confidenceMin &&
           rec.estimatedBudget.max <= filters.budgetMax;
  });

  const handleGenerateRecommendations = async (figureIds: string[], focusAreas: string[]) => {
    setGenerationError(null);
    try {
      await generateNewRecommendations(figureIds, focusAreas);
      setShowGenerator(false);
    } catch (e: any) {
      setGenerationError(e.message || 'Error al generar recomendaciones');
    }
  };

  const handleSelectRecommendation = (id: string) => {
    setSelectedRecommendations(prev =>
      prev.includes(id)
        ? prev.filter(recId => recId !== id)
        : [...prev, id]
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
      className="space-y-6"
    >
      <RecommendationsHeader
        filters={filters}
        onFiltersChange={setFilters}
        onGenerateNew={() => setShowGenerator(true)}
        isGenerating={isLoading}
        onManageFigures={() => setShowFiguresManager(true)}
        figuresCount={figures.filter(f => f.is_active).length}
      />

      {showGenerator && (
        <AIGenerator
          onClose={() => { setShowGenerator(false); setGenerationError(null); }}
          onGenerate={handleGenerateRecommendations}
          isGenerating={isLoading}
          figures={figures}
          error={generationError}
        />
      )}

      {showFiguresManager && (
        <PoliticalFiguresManager
          figures={figures}
          isLoading={figuresLoading}
          onClose={() => setShowFiguresManager(false)}
          onCreate={createFigure}
          onUpdate={updateFigure}
          onDelete={deleteFigure}
        />
      )}

      <RecommendationsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        recommendations={recommendations}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-48 bg-white/20 dark:bg-gray-800/20 rounded-xl"></div>
              </div>
            ))
          ) : filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No hay recomendaciones disponibles
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {figures.length === 0
                  ? 'Primero agrega figuras políticas y luego genera recomendaciones con IA'
                  : 'Genera nuevas recomendaciones basadas en los datos reales de redes sociales'
                }
              </p>
              <div className="flex items-center justify-center gap-3">
                {figures.length === 0 && (
                  <button
                    onClick={() => setShowFiguresManager(true)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                  >
                    Gestionar Figuras Políticas
                  </button>
                )}
                <button
                  onClick={() => setShowGenerator(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
                >
                  Generar Recomendaciones IA
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <ROIDashboard metrics={getROIMetrics()} />
          <BudgetCalculator
            selectedRecommendations={selectedRecommendationData}
            onShowComparator={() => setShowComparator(true)}
          />
          <ImpactMap recommendations={recommendations} />
        </div>
      </div>

      <ImplementationTimeline
        recommendations={recommendations.filter(rec =>
          ['approved', 'in_progress', 'completed'].includes(rec.status)
        )}
      />

      {showComparator && selectedRecommendations.length > 1 && (
        <StrategyComparator
          recommendations={selectedRecommendationData}
          onClose={() => setShowComparator(false)}
        />
      )}
    </motion.div>
  );
};
