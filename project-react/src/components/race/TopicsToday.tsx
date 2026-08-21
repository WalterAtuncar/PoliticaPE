import React from 'react';
import { TopicRow } from '../../hooks/useRace';

interface Props {
  topics: TopicRow[];
  days: number;
}

export const TopicsToday: React.FC<Props> = ({ topics, days }) => {
  const max = Math.max(1, ...topics.map(t => t.mentions));

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Temas dominantes</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">últimos {days} días</span>
      </div>

      {topics.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sin temas clasificados. Requiere la clasificación con IA activa.
        </p>
      ) : (
        <div className="space-y-2.5">
          {topics.slice(0, 8).map(t => (
            <div key={t.topic}>
              <div className="flex items-baseline justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-200">{t.label}</span>
                <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                  {t.share_pct}%
                  <span className={t.delta_vs_prev_pct > 0 ? ' text-green-600' : t.delta_vs_prev_pct < 0 ? ' text-red-600' : ''}>
                    {' '}({t.delta_vs_prev_pct > 0 ? '+' : ''}{t.delta_vs_prev_pct}%)
                  </span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div className="h-full rounded-full bg-teal-600" style={{ width: `${(t.mentions / max) * 100}%` }} />
              </div>
              {t.top_figure && (
                <p className="text-[11px] text-gray-400 mt-0.5">lo capitaliza: {t.top_figure}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
