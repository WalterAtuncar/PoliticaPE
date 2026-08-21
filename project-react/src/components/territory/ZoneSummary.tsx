import React from 'react';
import { ZoneStat } from '../../hooks/useTerritory';
import { ZONE_COLORS } from '../../data/limaDistricts';

interface Props {
  zones: ZoneStat[];
  isLoading: boolean;
}

const fmt = (n: number) => n.toLocaleString('es-PE');

export const ZoneSummary: React.FC<Props> = ({ zones, isLoading }) => {
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-48" />;
  }
  if (!zones.length) {
    return (
      <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-4 text-sm text-gray-500 dark:text-gray-400">
        Sin datos por zona en el periodo.
      </div>
    );
  }

  const maxElectors = Math.max(...zones.map(z => z.electors));

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Zonas de Lima</h3>
      <div className="space-y-3">
        {zones.map(z => (
          <div key={z.zone}>
            <div className="flex items-baseline justify-between text-xs mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-200">{z.zone}</span>
              <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                {fmt(z.electors)} electores · {z.mentions} menciones
                {z.net_sentiment !== null && (
                  <span className={z.net_sentiment < -0.05 ? ' text-red-600 dark:text-red-400' : z.net_sentiment > 0.05 ? ' text-green-600 dark:text-green-400' : ''}>
                    {' '}· neto {z.net_sentiment.toFixed(2)}
                  </span>
                )}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(z.electors / maxElectors) * 100}%`, background: ZONE_COLORS[z.zone] || '#64748b' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
