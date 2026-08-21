import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, EyeOff, RefreshCw } from 'lucide-react';
import { PollAverageChart } from './PollAverageChart';
import { PollsTable } from './PollsTable';
import { ShareOfVoiceBars } from './ShareOfVoiceBars';
import { ZoneSentimentGrid } from './ZoneSentimentGrid';
import { TopicsToday } from './TopicsToday';
import { BriefPanel } from './BriefPanel';
import { useRace } from '../../hooks/useRace';
import { usePoliticalFigures } from '../../hooks/usePoliticalFigures';
import { useElectoralConfig, formatElectoralDate } from '../../hooks/useElectoralConfig';

const PERIODS = [
  { value: 1, label: '24 h' },
  { value: 7, label: '7 días' },
  { value: 30, label: '30 días' },
];

export const RacePage: React.FC = () => {
  const [days, setDays] = useState(7);
  const [base, setBase] = useState<'validos' | 'total'>('validos');
  const { config } = useElectoralConfig();
  const { figures } = usePoliticalFigures();
  const {
    polls, average, publishable, blackoutFrom, sov, sentiment, topics, brief,
    isLoading, isGenerating, error, refetch, generateBrief,
  } = useRace(days, base);

  const figureColors = useMemo(
    () => Object.fromEntries(figures.filter(f => f.color).map(f => [f.id, f.color as string])),
    [figures]
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-red-600 rounded-lg flex items-center justify-center">
            <Flag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carrera — Alcaldía de Lima 2026</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {config
                ? `Elección ${formatElectoralDate(config.election_date)} · faltan ${config.days_to_election} días · ${config.rounds} vuelta`
                : 'Cargando calendario electoral…'}
            </p>
          </div>
        </div>
        <button
          onClick={refetch}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          title="Actualizar"
        >
          <RefreshCw className={`h-4 w-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {!publishable && (
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
          <EyeOff className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Veda de encuestas</strong> desde el {blackoutFrom ? formatElectoralDate(blackoutFrom) : '—'}.
            Las cifras son de uso interno del equipo: no publicarlas ni difundirlas.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`px-3 py-1.5 text-sm ${
                days === p.value ? 'bg-teal-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
      </div>

      <PollAverageChart polls={polls} average={average} blackoutFrom={blackoutFrom} figureColors={figureColors} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PollsTable polls={polls} base={base} onBaseChange={setBase} />
        <ShareOfVoiceBars figures={sov} days={days} />
        <ZoneSentimentGrid figures={sentiment} />
        <TopicsToday topics={topics} days={days} />
      </div>

      <BriefPanel brief={brief} isGenerating={isGenerating} onGenerate={generateBrief} />
    </motion.div>
  );
};
