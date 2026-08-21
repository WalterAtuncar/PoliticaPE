import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, Clock, EyeOff } from 'lucide-react';
import { Card } from '../ui/Card';
import { useElectoralConfig, formatElectoralDate } from '../../hooks/useElectoralConfig';

const TOTAL_CAMPAIGN_DAYS = 60;

export const ElectoralCountdown: React.FC = () => {
  const { config } = useElectoralConfig();

  if (!config) return null;

  const daysToDeadline = Math.max(0, config.days_to_propaganda_deadline);
  const daysToElection = Math.max(0, config.days_to_election);

  if (config.phase === 'post') {
    return (
      <Card glass className="p-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5" />
          <span className="font-medium">
            La elección del {formatElectoralDate(config.election_date)} ya pasó. Las recomendaciones son de análisis post-electoral.
          </span>
        </div>
      </Card>
    );
  }

  const urgencyLevel =
    config.phase === 'election_day' || daysToDeadline <= 7
      ? 'critical'
      : daysToDeadline <= 21
      ? 'high'
      : daysToDeadline <= 41
      ? 'medium'
      : 'low';

  const urgencyColors = {
    critical: 'from-red-600 to-red-800',
    high: 'from-orange-500 to-red-600',
    medium: 'from-amber-500 to-orange-500',
    low: 'from-blue-500 to-purple-600',
  };
  const barColors = {
    critical: 'from-red-400 to-red-600',
    high: 'from-orange-400 to-red-500',
    medium: 'from-amber-400 to-orange-500',
    low: 'from-blue-400 to-purple-500',
  };

  const progressPercent = Math.min(100, Math.max(0, ((TOTAL_CAMPAIGN_DAYS - daysToDeadline) / TOTAL_CAMPAIGN_DAYS) * 100));

  const headline =
    config.phase === 'election_day'
      ? 'Hoy es el día de la elección'
      : config.phase === 'closing'
      ? 'Propaganda cerrada — solo respuesta de prensa'
      : `${daysToDeadline} días restantes para propaganda`;

  return (
    <div className={`rounded-xl bg-gradient-to-r ${urgencyColors[urgencyLevel]} p-4 text-white`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          {urgencyLevel === 'critical' ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <AlertTriangle className="h-6 w-6" />
            </motion.div>
          ) : (
            <Calendar className="h-6 w-6 flex-shrink-0" />
          )}
          <div>
            <div className="font-bold text-lg">{headline}</div>
            <div className="text-white/80 text-sm">
              {config.election_name} · Elección: {formatElectoralDate(config.election_date)} · Cierre de propaganda:{' '}
              {formatElectoralDate(config.propaganda_deadline)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {!config.polls_publishable && (
            <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <EyeOff className="h-4 w-4" />
              <span className="font-medium">Veda de encuestas</span>
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{daysToElection} días para la elección</span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>Progreso de campaña</span>
          <span>Cierre: {formatElectoralDate(config.propaganda_deadline)}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full bg-gradient-to-r ${barColors[urgencyLevel]}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
};
