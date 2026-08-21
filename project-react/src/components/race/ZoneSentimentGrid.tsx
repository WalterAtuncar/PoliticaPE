import React from 'react';
import { SentimentFigure } from '../../hooks/useRace';
import { ZONES } from '../../data/limaDistricts';

interface Props {
  figures: SentimentFigure[];
}

function cellColor(net: number | null): string {
  if (net === null) return 'bg-gray-50 dark:bg-gray-700/40 text-gray-400';
  if (net <= -0.4) return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200';
  if (net <= -0.12) return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
  if (net < 0.12) return 'bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300';
  if (net < 0.4) return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
  return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200';
}

export const ZoneSentimentGrid: React.FC<Props> = ({ figures }) => {
  const withData = figures.filter(f => f.total > 0);

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sentimiento neto por zona</h3>

      {withData.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sin datos de sentimiento. Requiere la clasificación con IA activa.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400">
                <th className="text-left font-medium pb-2 pr-3">Figura</th>
                <th className="text-right font-medium pb-2 pr-3">Neto</th>
                {ZONES.map(z => (
                  <th key={z} className="text-center font-medium pb-2 px-1 whitespace-nowrap">
                    {z.replace('Lima ', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withData.map(f => (
                <tr key={f.figure_id}>
                  <td className="py-1 pr-3 text-gray-800 dark:text-gray-100 whitespace-nowrap">{f.name}</td>
                  <td className="py-1 pr-3 text-right tabular-nums font-medium text-gray-900 dark:text-white">
                    {f.net_sentiment === null ? '—' : f.net_sentiment.toFixed(2)}
                  </td>
                  {ZONES.map(z => {
                    const cell = f.by_zone[z];
                    return (
                      <td key={z} className="py-1 px-1">
                        <div className={`rounded px-1.5 py-1 text-center tabular-nums text-xs ${cellColor(cell?.net ?? null)}`}>
                          {cell?.net === null || cell === undefined ? '—' : cell.net.toFixed(2)}
                          {cell && <span className="block text-[10px] opacity-70">n={cell.n}</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
