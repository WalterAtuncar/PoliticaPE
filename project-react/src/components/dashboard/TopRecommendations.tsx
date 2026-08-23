import React from 'react';
import { MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { DashboardRecommendation, RecommendationPriority } from '../../hooks/useDashboard';
import { fmtInt } from '../../utils/format';

interface Props {
  recs: DashboardRecommendation[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const PRIORITY_STYLE: Record<RecommendationPriority, { chip: string; label: string }> = {
  critical: { chip: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', label: 'Crítica' },
  high: { chip: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200', label: 'Alta' },
  medium: { chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200', label: 'Media' },
  low: { chip: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', label: 'Baja' },
};

export const TopRecommendations: React.FC<Props> = ({ recs, isLoading, error, onRetry }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Qué hacer esta semana</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
      Recomendaciones de la IA para la candidatura
    </p>

    {isLoading ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-36" />
        ))}
      </div>
    ) : error ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No se pudo cargar.{' '}
        <button onClick={onRetry} className="text-teal-700 dark:text-teal-300 underline">
          Reintentar
        </button>
      </p>
    ) : recs.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Sin recomendaciones generadas. Genera desde Recomendaciones IA.
      </p>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {recs.map(r => {
          const style = PRIORITY_STYLE[r.priority] ?? PRIORITY_STYLE.low;
          return (
            <Card key={r.id} glass hover className="p-4 h-full flex flex-col">
              <span
                className={`self-start px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${style.chip}`}
              >
                {style.label}
              </span>

              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mt-2">
                {r.title}
              </p>

              {r.target_region && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 line-clamp-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {r.target_region}
                </p>
              )}

              <div className="flex-1" />

              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                {r.estimated_budget &&
                  `S/ ${fmtInt(r.estimated_budget.min)} – ${fmtInt(r.estimated_budget.max)}`}
                {r.estimated_budget && r.ai_confidence != null && ' · '}
                {r.ai_confidence != null && `${Math.round(r.ai_confidence)} % confianza`}
              </p>

              {r.expected_timeline && (
                <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{r.expected_timeline}</p>
              )}
            </Card>
          );
        })}
      </div>
    )}
  </div>
);
