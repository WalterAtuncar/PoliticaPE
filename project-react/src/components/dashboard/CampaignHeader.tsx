import React from 'react';
import { Calendar, EyeOff, Megaphone } from 'lucide-react';
import { Card } from '../ui/Card';
import { ElectoralConfig, CampaignPhase, formatElectoralDate } from '../../hooks/useElectoralConfig';
import { PoliticalFigure } from '../../types/recommendations';

interface Props {
  config: ElectoralConfig | null;
  ownFigure: PoliticalFigure | null;
  isLoading: boolean;
}

const PHASE_LABEL: Record<CampaignPhase, string> = {
  pre: 'Pre-campaña',
  campaign: 'Campaña',
  poll_blackout: 'Veda de encuestas',
  closing: 'Cierre de campaña',
  election_day: 'Día de la elección',
  post: 'Post-electoral',
};

function pillClasses(days: number): string {
  if (days <= 7) {
    return 'border-red-300 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-900/20';
  }
  if (days <= 21) {
    return 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-900/20';
  }
  return 'border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800/40';
}

const Milestone: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  date: string | null;
  days: number | null;
}> = ({ icon: Icon, label, date, days }) => {
  if (days === null || days <= 0 || !date) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border ${pillClasses(days)}`}>
      <Icon className="h-3.5 w-3.5" />
      {label} · {formatElectoralDate(date)} · {days} d
    </span>
  );
};

export const CampaignHeader: React.FC<Props> = ({ config, ownFigure, isLoading }) => {
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-28" />;
  }

  if (!config) {
    return (
      <Card glass className="p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No se pudo cargar la configuración electoral.
        </p>
      </Card>
    );
  }

  const countdown =
    config.phase === 'election_day'
      ? { big: 'Hoy', small: 'es la elección' }
      : config.phase === 'post'
      ? { big: '—', small: 'elección realizada' }
      : { big: String(Math.max(0, config.days_to_election)), small: 'días para la elección' };

  return (
    <Card glass className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            {ownFigure?.color && (
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: ownFigure.color }}
              />
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {ownFigure?.display_name ?? 'Sin candidatura propia configurada'}
            </h2>
            {ownFigure?.party_name && (
              <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {ownFigure.party_name}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {config.election_name} · {formatElectoralDate(config.election_date)} · Fase:{' '}
            {PHASE_LABEL[config.phase] ?? config.phase}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-4xl font-bold text-gray-900 dark:text-white leading-none">
            {countdown.big}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{countdown.small}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Milestone
          icon={Calendar}
          label="Candidaturas definitivas"
          date={config.candidacy_final_date}
          days={config.days_to_candidacy_final}
        />
        <Milestone
          icon={EyeOff}
          label="Veda de encuestas"
          date={config.poll_blackout_from}
          days={config.days_to_poll_blackout}
        />
        <Milestone
          icon={Megaphone}
          label="Cierre de propaganda"
          date={config.propaganda_deadline}
          days={config.days_to_propaganda_deadline}
        />
      </div>
    </Card>
  );
};
