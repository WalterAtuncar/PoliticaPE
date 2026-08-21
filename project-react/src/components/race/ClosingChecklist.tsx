import React, { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { ElectoralConfig, formatElectoralDate } from '../../hooks/useElectoralConfig';

interface Props {
  config: ElectoralConfig;
}

const STORAGE_KEY = 'lima2026_closing_checklist';

function buildItems(config: ElectoralConfig) {
  const prop = formatElectoralDate(config.propaganda_deadline);
  const rally = formatElectoralDate(config.rally_deadline);
  const election = formatElectoralDate(config.election_date);
  return [
    { id: 'propaganda', text: `Retirar propaganda física y pauta digital antes del cierre (${prop}, 23:59)` },
    { id: 'paid', text: 'Suspender publicaciones pagadas; dejar solo contenido informativo (local de votación, horario)' },
    { id: 'personeros', text: 'Acreditar personeros de mesa y de local ante el JNE/ONPE' },
    { id: 'rallies', text: `Último día de mítines y reuniones públicas: ${rally}` },
    { id: 'leyseca', text: `Ley seca desde el día previo hasta el cierre de la jornada (${election})` },
    { id: 'acopio', text: 'Centro de acopio de incidencias: canal de Telegram + teléfono del equipo legal' },
    { id: 'comms', text: 'Plan de comunicaciones para la noche electoral: gana / pierde / resultado ajustado' },
    { id: 'results', text: 'Verificar que la carga de resultados por distrito está configurada' },
  ];
}

export const ClosingChecklist: React.FC<Props> = ({ config }) => {
  const items = buildItems(config);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const toggle = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* almacenamiento no disponible */
    }
  };

  const completed = items.filter(i => done[i.id]).length;

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-red-600" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Checklist de cierre</h3>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
          {completed}/{items.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map(i => (
          <label key={i.id} className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!done[i.id]}
              onChange={() => toggle(i.id)}
              className="mt-0.5 rounded flex-shrink-0"
            />
            <span className={done[i.id] ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
              {i.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
