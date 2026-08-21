import React, { useMemo } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Poll, PollAverage } from '../../hooks/useRace';

interface Props {
  polls: Poll[];
  average: PollAverage[];
  blackoutFrom: string | null;
  figureColors: Record<string, string>;
}

const FALLBACK_COLORS = ['#1F6B73', '#B8741A', '#6A1B9A', '#2E7D4F', '#B4322B', '#0F766E', '#7C3AED'];
const HALF_LIFE = 14;

/** Promedio ponderado a una fecha dada, con la misma formula del backend. */
function weightedAt(polls: Poll[], name: string, at: Date): number | null {
  let w = 0;
  let wp = 0;
  polls.forEach(p => {
    if (!p.published_at) return;
    const pub = new Date(p.published_at);
    const age = (at.getTime() - pub.getTime()) / 86400000;
    if (age < 0 || age > 35) return;
    const c = p.candidates.find(x => x.name === name);
    if (!c || c.pct === null) return;
    const weight = Math.sqrt(p.sample_size || 400) * Math.pow(0.5, age / HALF_LIFE);
    w += weight;
    wp += weight * c.pct;
  });
  return w > 0 ? Number((wp / w).toFixed(1)) : null;
}

export const PollAverageChart: React.FC<Props> = ({ polls, average, blackoutFrom, figureColors }) => {
  const top = average.slice(0, 7);

  const data = useMemo(() => {
    const dates = Array.from(new Set(polls.map(p => p.published_at).filter(Boolean) as string[]))
      .sort()
      .slice(-24);
    return dates.map(iso => {
      const at = new Date(iso);
      const row: Record<string, string | number | null> = {
        date: at.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        iso,
      };
      top.forEach(a => { row[a.name] = weightedAt(polls, a.name, at); });
      return row;
    });
  }, [polls, top]);

  if (!polls.length) {
    return (
      <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sin encuestas municipales cargadas. Ejecuta el scraping de encuestas.
        </p>
      </div>
    );
  }

  const blackoutLabel = blackoutFrom
    ? new Date(blackoutFrom).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
    : null;

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Promedio de encuestas</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ponderado por muestra y antigüedad (semivida 14 días)
        </span>
      </div>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 40]} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip
              formatter={(v: number | string) => (v === null ? '—' : `${v}%`)}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {blackoutLabel && (
              <ReferenceLine
                x={blackoutLabel}
                stroke="#B4322B"
                strokeDasharray="4 4"
                label={{ value: 'veda', fontSize: 10, fill: '#B4322B' }}
              />
            )}
            {top.map((a, i) => (
              <Line
                key={a.name}
                type="monotone"
                dataKey={a.name}
                stroke={(a.figure_id && figureColors[a.figure_id]) || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 2.5 }}
                connectNulls
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {top.map((a, i) => (
          <div key={a.name} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: (a.figure_id && figureColors[a.figure_id]) || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{a.name}</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">{a.pct}%</div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums">
              {a.low}–{a.high} · {a.n_polls} enc.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
