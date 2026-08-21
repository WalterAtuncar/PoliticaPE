import React from 'react';
import { MapPin } from 'lucide-react';
import { DistrictStat } from '../../hooks/useTerritory';
import { PoliticalFigure } from '../../types/recommendations';
import { TOPIC_LABELS } from '../../data/topics';

interface Props {
  district: DistrictStat | null;
  figures: PoliticalFigure[];
}

export const DistrictPanel: React.FC<Props> = ({ district, figures }) => {
  if (!district) {
    return (
      <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-6 text-center">
        <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Haz clic en un distrito del mapa para ver su detalle.
        </p>
      </div>
    );
  }

  const figureById: Record<string, PoliticalFigure> = Object.fromEntries(figures.map(f => [f.id, f]));
  const rows = Object.entries(district.figures)
    .map(([id, s]) => ({ id, name: figureById[id]?.display_name || 'Figura desconocida', ...s }))
    .sort((a, b) => b.mentions - a.mentions);

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{district.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {district.zone} · {district.electors.toLocaleString('es-PE')} electores
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Menciones</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{district.mentions}</p>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Sentimiento neto</p>
          <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
            {district.net_sentiment === null ? '—' : district.net_sentiment.toFixed(2)}
          </p>
        </div>
      </div>

      {district.top_topic && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Temas</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(district.topics).map(([t, n]) => (
              <span key={t} className="px-2 py-0.5 rounded text-xs bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                {TOPIC_LABELS[t] || t} · {n}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Figuras</p>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">Sin menciones atribuidas a una figura.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400">
                <th className="text-left font-medium pb-1">Figura</th>
                <th className="text-right font-medium pb-1">Menc.</th>
                <th className="text-right font-medium pb-1">Neto</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="py-1 text-gray-700 dark:text-gray-200">{r.name}</td>
                  <td className="py-1 text-right tabular-nums text-gray-700 dark:text-gray-200">{r.mentions}</td>
                  <td className="py-1 text-right tabular-nums text-gray-700 dark:text-gray-200">
                    {r.net === null ? '—' : r.net.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
