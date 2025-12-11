import React, { useState, useEffect } from 'react';
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
import { RecommendationsFilters, AIRecommendation } from '../../types/recommendations';
import { useAIRecommendations } from '../../hooks/useAIRecommendations';

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
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    try {
      await generateNewRecommendations();
    } finally {
      setIsGenerating(false);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Filters and AI Generator */}
      <RecommendationsHeader
        filters={filters}
        onFiltersChange={setFilters}
        onGenerateNew={() => setShowGenerator(true)}
        isGenerating={isGenerating}
      />

      {/* AI Generator Modal */}
      {showGenerator && (
        <AIGenerator
          onClose={() => setShowGenerator(false)}
          onGenerate={handleGenerateRecommendations}
          isGenerating={isGenerating}
        />
      )}

      {/* Tabs Navigation */}
      <RecommendationsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        recommendations={recommendations}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recommendations List */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {isLoading ? (
            // Loading Skeletons
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
                Genera nuevas recomendaciones basadas en los datos actuales
              </p>
              <button
                onClick={() => setShowGenerator(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
              >
                Generar Recomendaciones IA
              </button>
            </div>
          )}
        </div>

        {/* Sidebar with Tools */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* ROI Dashboard */}
          <ROIDashboard metrics={getROIMetrics()} />

          {/* Budget Calculator */}
          <BudgetCalculator
            selectedRecommendations={selectedRecommendationData}
            onShowComparator={() => setShowComparator(true)}
          />

          {/* Impact Map */}
          <ImpactMap recommendations={recommendations} />
        </div>
      </div>

      {/* Implementation Timeline */}
      <ImplementationTimeline
        recommendations={recommendations.filter(rec => 
          ['approved', 'in_progress', 'completed'].includes(rec.status)
        )}
      />

      {/* Strategy Comparator Modal */}
      {showComparator && selectedRecommendations.length > 1 && (
        <StrategyComparator
          recommendations={selectedRecommendationData}
          onClose={() => setShowComparator(false)}
        />
      )}
    </motion.div>
  );
};