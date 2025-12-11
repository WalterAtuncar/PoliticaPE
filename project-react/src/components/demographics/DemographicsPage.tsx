import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DemographicsHeader } from './DemographicsHeader';
import { PopulationPyramid } from './PopulationPyramid';
import { CrossAnalysisMatrix } from './CrossAnalysisMatrix';
import { DemographicSegmentation } from './DemographicSegmentation';
import { DemographicMap } from './DemographicMap';
import { DemographicTimeline } from './DemographicTimeline';
import { DemographicInsights } from './DemographicInsights';
import { DemographicComparator } from './DemographicComparator';
import { DemographicScenarios } from './DemographicScenarios';
import { DemographicFilters, DemographicData } from '../../types/demographics';
import { useDemographics } from '../../hooks/useDemographics';

const initialFilters: DemographicFilters = {
  region: 'all',
  ageGroup: 'all',
  nse: 'all',
  gender: 'all',
  education: 'all',
  zone: 'all',
  timeRange: '1y',
};

export const DemographicsPage: React.FC = () => {
  const [filters, setFilters] = useState<DemographicFilters>(initialFilters);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [showComparator, setShowComparator] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'segmentation' | 'insights' | 'scenarios'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const {
    demographicData,
    segmentationData,
    insightsData,
    getRegionData,
    getComparisonData,
    generateScenario
  } = useDemographics(filters);

  const handleFiltersChange = (newFilters: DemographicFilters) => {
    setIsLoading(true);
    setFilters(newFilters);
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegions(prev => 
      prev.includes(regionId) 
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    );
  };

  const handleCompareRegions = () => {
    if (selectedRegions.length >= 2) {
      setShowComparator(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Filters */}
      <DemographicsHeader 
        filters={filters} 
        onFiltersChange={handleFiltersChange}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Content */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Population Pyramid */}
          <div className="col-span-12 lg:col-span-6">
            <PopulationPyramid 
              data={demographicData} 
              isLoading={isLoading}
              filters={filters}
            />
          </div>

          {/* Cross Analysis Matrix */}
          <div className="col-span-12 lg:col-span-6">
            <CrossAnalysisMatrix 
              data={demographicData}
              isLoading={isLoading}
              filters={filters}
            />
          </div>

          {/* Demographic Map */}
          <div className="col-span-12">
            <DemographicMap 
              data={demographicData}
              selectedRegions={selectedRegions}
              onRegionSelect={handleRegionSelect}
              onCompare={handleCompareRegions}
              isLoading={isLoading}
              filters={filters}
            />
          </div>

          {/* Demographic Timeline */}
          <div className="col-span-12">
            <DemographicTimeline 
              data={demographicData}
              isLoading={isLoading}
              filters={filters}
            />
          </div>
        </div>
      )}

      {activeView === 'segmentation' && (
        <DemographicSegmentation 
          data={segmentationData}
          isLoading={isLoading}
          filters={filters}
        />
      )}

      {activeView === 'insights' && (
        <DemographicInsights 
          data={insightsData}
          isLoading={isLoading}
          filters={filters}
        />
      )}

      {activeView === 'scenarios' && (
        <DemographicScenarios 
          data={demographicData}
          onGenerateScenario={generateScenario}
          isLoading={isLoading}
          filters={filters}
        />
      )}

      {/* Region Comparator Modal */}
      {showComparator && (
        <DemographicComparator
          regions={selectedRegions.map(id => getRegionData(id))}
          comparisonData={getComparisonData(selectedRegions)}
          onClose={() => setShowComparator(false)}
        />
      )}
    </motion.div>
  );
};