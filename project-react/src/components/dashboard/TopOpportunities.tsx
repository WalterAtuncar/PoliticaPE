import React from 'react';
import { Card } from '../ui/Card';
import { OpportunityDistrict } from '../../hooks/useEvents';
import { topicLabel } from '../../data/topics';
import { fmtInt, fmtPct } from '../../utils/format';

interface Props {
  districts: OpportunityDistrict[];
  isLoading: boolean;
  error: string | null;
  ownName: string | null;
  onRetry: () => void;
}

const AMBER = '#B8741A';
const TOP_N = 5;

export const TopOpportunities: React.FC<Props> = ({ districts, isLoading, error, ownName, onRetry }) => {
  const top = districts.slice(0, TOP_N);
  const maxScore = top.length ? Math.max(...top.map(d => d.score)) : 1;

  return (
    <Card glass className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dónde ganar</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Top {TOP_N} distritos por oportunidad{ownName ? ` para ${ownName}` : ''} · 30 d
      </p>

      {isLoading ? (
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-56" />
      ) : error ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No se pudo cargar.{' '}
          <button onClick={onRetry} className="text-teal-700 dark:text-teal-300 underline">
            Reintentar
          </button>
        </p>
      ) : top.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aún no hay score de oportunidad para la candidatura.
        </p>
      ) : (
        <div>
          {top.map(d => (
            <div
              key={d.ubigeo}
              title={d.why}
              className="flex items-center gap-3 py-2 border-b border-gray-200/60 dark:border-gray-700/60 last:border-0"
            >
              <span
                className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: AMBER }}
              >
                {d.rank}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{d.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {d.zone} · {fmtInt(d.electors)} electores
                  {d.rival_name ? ` · rival: ${d.rival_name}` : ''}
                </p>
              </div>

              <span className="text-[10px] rounded px-1.5 py-0.5 bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200 flex-shrink-0 hidden sm:inline">
                {topicLabel(d.topic)}
              </span>

              <div className="w-20 h-2 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0 hidden md:block">
                <div
                  className="h-2 rounded"
                  style={{ width: `${Math.max(4, (d.score / maxScore) * 100)}%`, backgroundColor: AMBER }}
                />
              </div>

              <span className="text-sm font-semibold text-gray-900 dark:text-white w-10 text-right flex-shrink-0">
                {fmtPct(d.score)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
