import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { CampaignHeader } from './CampaignHeader';
import { KpiStrip } from './KpiStrip';
import { AlertsPanel } from './AlertsPanel';
import { TopOpportunities } from './TopOpportunities';
import { LatestLimaNews } from './LatestLimaNews';
import { TopRecommendations } from './TopRecommendations';
import { PollAverageChart } from '../race/PollAverageChart';
import { TopicsToday } from '../race/TopicsToday';
import { BriefPanel } from '../race/BriefPanel';
import { LimaMap } from '../territory/LimaMap';

export const Dashboard: React.FC = () => {
  const d = useDashboard();
  const ownName = d.ownFigure?.display_name ?? null;

  return (
    <div className="space-y-6">
      <CampaignHeader config={d.config} ownFigure={d.ownFigure} isLoading={d.isLoading} />

      <KpiStrip kpis={d.kpis} ownColor={d.ownFigure?.color ?? null} isLoading={d.race.isLoading} />

      {/* Evolución de la carrera + lo que exige reacción ahora */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {d.race.isLoading ? (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-[420px]" />
          ) : (
            <PollAverageChart
              polls={d.race.polls}
              average={d.race.average}
              blackoutFrom={d.race.blackoutFrom}
              figureColors={d.figureColors}
            />
          )}
        </div>
        <AlertsPanel />
      </div>

      {/* Dónde ganar + de qué habla Lima */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Mapa de oportunidad
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              43 distritos de Lima Metropolitana · padrón Reniec 2026
            </p>
            <LimaMap
              districts={d.territory.districts}
              metric="opportunity"
              scores={d.opportunityScores}
              height={340}
              zoom={10}
              compact
            />
          </div>
          <TopOpportunities
            districts={d.opportunity.districts}
            isLoading={d.opportunity.isLoading}
            error={d.opportunity.error}
            ownName={ownName}
            onRetry={d.opportunity.refetch}
          />
        </div>

        {d.race.isLoading ? (
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-[420px]" />
        ) : (
          <TopicsToday topics={d.kpis.topics} days={7} />
        )}
      </div>

      {/* Lo que la IA escribió + la materia prima */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BriefPanel
          brief={d.race.brief}
          isGenerating={d.race.isGenerating}
          onGenerate={d.race.generateBrief}
        />
        <LatestLimaNews
          news={d.news}
          isLoading={d.newsLoading}
          error={d.newsError}
          onRetry={d.refetchNews}
        />
      </div>

      <TopRecommendations
        recs={d.recs}
        isLoading={d.recsLoading}
        error={d.recsError}
        onRetry={d.refetchRecs}
      />
    </div>
  );
};
