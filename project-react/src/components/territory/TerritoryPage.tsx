import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw } from 'lucide-react';
import { LimaMap, MapMetric } from './LimaMap';
import { DistrictPanel } from './DistrictPanel';
import { ZoneSummary } from './ZoneSummary';
import { useTerritory } from '../../hooks/useTerritory';
import { usePoliticalFigures } from '../../hooks/usePoliticalFigures';
import { TOTAL_ELECTORS } from '../../data/limaDistricts';

const PERIODS = [
  { value: 1, label: '24 h' },
  { value: 7, label: '7 días' },
  { value: 30, label: '30 días' },
  { value: 365, label: 'Todo' },
];

const METRICS: { value: MapMetric; label: string }[] = [
  { value: 'mentions', label: 'Menciones' },
  { value: 'sentiment', label: 'Sentimiento' },
];

export const TerritoryPage: React.FC = () => {
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState<MapMetric>('mentions');
  const [figureId, setFigureId] = useState<string>('');
  const [selected, setSelected] = useState<string | null>(null);

  const { figures } = usePoliticalFigures();
  const { districts, zones, isLoading, error, refetch } = useTerritory({ days, figureId: figureId || undefined });

  const localFigures = useMemo(
    () => figures.filter(f => f.figure_role === 'candidate' || f.figure_role === 'incumbent'),
    [figures]
  );

  const selectedDistrict = useMemo(
    () => districts.find(d => d.ubigeo === selected) || null,
    [districts, selected]
  );

  const covered = districts.filter(d => d.mentions > 0).length;
  const totalMentions = districts.reduce((s, d) => s + d.mentions, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Territorio — Lima Metropolitana</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              43 distritos · {TOTAL_ELECTORS.toLocaleString('es-PE')} electores · {covered} distritos con conversación
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

        <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          {METRICS.map(m => (
            <button
              key={m.value}
              onClick={() => setMetric(m.value)}
              className={`px-3 py-1.5 text-sm ${
                metric === m.value ? 'bg-teal-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <select
          value={figureId}
          onChange={e => setFigureId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
        >
          <option value="">Todas las figuras</option>
          {localFigures.map(f => (
            <option key={f.id} value={f.id}>{f.display_name}</option>
          ))}
        </select>

        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto tabular-nums">
          {totalMentions} menciones georreferenciadas
        </span>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && totalMentions === 0 && !error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
          Sin menciones con distrito en el periodo seleccionado. Amplía el rango o espera al siguiente ciclo de scraping.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LimaMap
            districts={districts}
            metric={metric}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
        <div className="space-y-4">
          <ZoneSummary zones={zones} isLoading={isLoading} />
          <DistrictPanel district={selectedDistrict} figures={figures} />
        </div>
      </div>
    </motion.div>
  );
};
