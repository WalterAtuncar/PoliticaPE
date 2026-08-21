import React from 'react';
import { Poll } from '../../hooks/useRace';

interface Props {
  polls: Poll[];
  base: 'validos' | 'total';
  onBaseChange: (b: 'validos' | 'total') => void;
}

export const PollsTable: React.FC<Props> = ({ polls, base, onBaseChange }) => {
  const topNames = React.useMemo(() => {
    const totals: Record<string, number> = {};
    polls.forEach(p => p.candidates.forEach(c => {
      if (c.pct !== null) totals[c.name] = (totals[c.name] || 0) + c.pct;
    }));
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n);
  }, [polls]);

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Encuestas publicadas</h3>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden text-xs">
          {(['validos', 'total'] as const).map(b => (
            <button
              key={b}
              onClick={() => onBaseChange(b)}
              className={`px-2.5 py-1 ${base === b ? 'bg-teal-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              {b === 'validos' ? 'Válidos' : 'Total'}
            </button>
          ))}
        </div>
      </div>

      {polls.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Sin encuestas en esta base.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left font-medium py-1.5 pr-3">Encuestadora</th>
                <th className="text-left font-medium py-1.5 pr-3">Campo</th>
                <th className="text-right font-medium py-1.5 pr-3">n</th>
                {topNames.map(n => (
                  <th key={n} className="text-right font-medium py-1.5 pr-3 whitespace-nowrap">
                    {n.split(' ').slice(-1)[0]}
                  </th>
                ))}
                <th className="text-right font-medium py-1.5">Indec.</th>
              </tr>
            </thead>
            <tbody>
              {polls.slice(0, 14).map(p => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700/60">
                  <td className="py-1.5 pr-3 text-gray-800 dark:text-gray-100 whitespace-nowrap">
                    {p.pollster}
                    {p.manual && <span className="ml-1 text-[10px] px-1 rounded bg-amber-100 text-amber-700">interna</span>}
                    {p.internal_only && <span className="ml-1 text-[10px] px-1 rounded bg-red-100 text-red-700">no publicable</span>}
                  </td>
                  <td className="py-1.5 pr-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{p.field_dates || '—'}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{p.sample_size ?? '—'}</td>
                  {topNames.map(n => {
                    const c = p.candidates.find(x => x.name === n);
                    return (
                      <td key={n} className="py-1.5 pr-3 text-right tabular-nums text-gray-800 dark:text-gray-100">
                        {c && c.pct !== null ? c.pct.toFixed(1) : '–'}
                      </td>
                    );
                  })}
                  <td className="py-1.5 text-right tabular-nums text-gray-500 dark:text-gray-400">
                    {p.undecided !== null ? p.undecided.toFixed(1) : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
