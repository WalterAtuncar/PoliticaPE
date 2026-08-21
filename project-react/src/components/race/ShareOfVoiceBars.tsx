import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SovFigure } from '../../hooks/useRace';

interface Props {
  figures: SovFigure[];
  days: number;
}

export const ShareOfVoiceBars: React.FC<Props> = ({ figures, days }) => {
  const withData = figures.filter(f => f.total > 0);
  const max = Math.max(1, ...withData.map(f => f.total));

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Share of voice</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">últimos {days} días · prensa + redes</span>
      </div>

      {withData.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sin menciones clasificadas todavía. Requiere la clasificación con IA activa.
        </p>
      ) : (
        <div className="space-y-2.5">
          {withData.map(f => {
            const Icon = f.trend_pct > 5 ? TrendingUp : f.trend_pct < -5 ? TrendingDown : Minus;
            const trendColor = f.trend_pct > 5 ? 'text-green-600' : f.trend_pct < -5 ? 'text-red-600' : 'text-gray-400';
            return (
              <div key={f.figure_id}>
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{f.name}</span>
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 tabular-nums">
                    {f.share_pct}% · {f.total}
                    <Icon className={`h-3 w-3 ${trendColor}`} />
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex">
                  <div
                    className="h-full"
                    style={{ width: `${(f.news_mentions / max) * 100}%`, background: f.color || '#1F6B73' }}
                    title={`${f.news_mentions} en prensa`}
                  />
                  <div
                    className="h-full opacity-50"
                    style={{ width: `${(f.social_mentions / max) * 100}%`, background: f.color || '#1F6B73' }}
                    title={`${f.social_mentions} en redes`}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-[11px] text-gray-400 pt-1">Barra sólida: prensa · barra clara: redes</p>
        </div>
      )}
    </div>
  );
};
