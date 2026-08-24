import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { Card } from '../ui/Card';
import { PortfolioMetrics } from '../../types/recommendations';
import { fmtInt, fmtPct } from '../../utils/format';

interface ROIDashboardProps {
  metrics: PortfolioMetrics;
}

const PRIORITY_STYLE: { key: keyof PortfolioMetrics['byPriority']; label: string; chip: string }[] = [
  { key: 'critical', label: 'Crítica', chip: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
  { key: 'high', label: 'Alta', chip: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
  { key: 'medium', label: 'Media', chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  { key: 'low', label: 'Baja', chip: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
];

const STATUS_LABEL: Record<string, string> = {
  generated: 'generadas',
  approved: 'aprobadas',
  in_progress: 'en curso',
  completed: 'completadas',
  rejected: 'descartadas',
};

export const ROIDashboard: React.FC<ROIDashboardProps> = ({ metrics }) => {
  const statusLine = Object.entries(metrics.byStatus)
    .map(([k, v]) => `${v} ${STATUS_LABEL[k] || k}`)
    .join(' · ');

  return (
    <Card glass className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <Briefcase className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Cartera de recomendaciones
        </h3>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {metrics.total} activas para la candidatura
      </p>

      {metrics.total === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sin recomendaciones generadas todavía.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {PRIORITY_STYLE.filter(p => metrics.byPriority[p.key] > 0).map(p => (
              <span
                key={p.key}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${p.chip}`}
              >
                {p.label} {metrics.byPriority[p.key]}
              </span>
            ))}
          </div>

          <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Presupuesto de la cartera</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
              S/ {fmtInt(metrics.budgetMin)} – {fmtInt(metrics.budgetMax)}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">si se ejecutara todo</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-600 dark:text-gray-400">Confianza media de la IA</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {fmtPct(metrics.avgConfidence)} %
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-[#1F6B73]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, metrics.avgConfidence)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">ROI proyectado medio</div>
              <div className="text-[11px] text-gray-400">estimado por la IA, no verificado</div>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {fmtPct(metrics.avgProjectedROI, 0)} %
            </span>
          </div>

          {statusLine && (
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200/50 dark:border-gray-600/50">
              {statusLine}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
