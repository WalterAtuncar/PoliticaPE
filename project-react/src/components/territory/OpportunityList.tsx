import React from 'react';
import { Target, CalendarPlus } from 'lucide-react';
import { OpportunityDistrict } from '../../hooks/useEvents';
import { topicLabel } from '../../data/topics';

interface Props {
  districts: OpportunityDistrict[];
  isLoading: boolean;
  error: string | null;
  onScheduleEvent: (ubigeo: string, name: string) => void;
}

export const OpportunityList: React.FC<Props> = ({ districts, isLoading, error, onScheduleEvent }) => {
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-64" />;
  }
  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
      </div>
    );
  }

  const top = districts.slice(0, 15);
  const max = Math.max(1, ...top.map(d => d.score));

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Target className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dónde invertir esfuerzo</h3>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Padrón × indecisos × brecha con el rival × peso del tema local × presencia propia
      </p>

      <div className="space-y-2">
        {top.map(d => (
          <div key={d.ubigeo} className="rounded-lg border border-gray-100 dark:border-gray-700 p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono text-gray-400 tabular-nums">#{d.rank}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{d.zone}</span>
                  {d.topic && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                      {topicLabel(d.topic)}
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden my-1.5">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${(d.score / max) * 100}%` }} />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{d.why}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm font-bold text-amber-600 tabular-nums">{d.score.toFixed(1)}</span>
                <button
                  onClick={() => onScheduleEvent(d.ubigeo, d.name)}
                  title="Programar evento aquí"
                  className="p-1 rounded hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600"
                >
                  <CalendarPlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
