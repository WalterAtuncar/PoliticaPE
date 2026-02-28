import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import { Card } from '../ui/Card';

const ELECTION_DATE = new Date('2026-04-12T00:00:00');
const CAMPAIGN_DEADLINE = new Date('2026-04-10T23:59:59');

export const ElectoralCountdown: React.FC = () => {
  const now = new Date();
  const daysToDeadline = Math.max(0, Math.ceil((CAMPAIGN_DEADLINE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const daysToElection = Math.max(0, Math.ceil((ELECTION_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const totalCampaignDays = 120;
  const progressPercent = Math.min(100, ((totalCampaignDays - daysToDeadline) / totalCampaignDays) * 100);

  const urgencyLevel = daysToDeadline <= 7 ? 'critical' : daysToDeadline <= 21 ? 'high' : daysToDeadline <= 41 ? 'medium' : 'low';
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

  if (daysToDeadline === 0) {
    return (
      <Card glass className="p-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5" />
          <span className="font-medium">La ventana de campaña ha finalizado. Las recomendaciones ahora son de análisis post-electoral.</span>
        </div>
      </Card>
    );
  }

  return (
    <div className={`rounded-xl bg-gradient-to-r ${urgencyColors[urgencyLevel]} p-4 text-white`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          {urgencyLevel === 'critical' && (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              <AlertTriangle className="h-6 w-6" />
            </motion.div>
          )}
          {urgencyLevel !== 'critical' && <Calendar className="h-6 w-6 flex-shrink-0" />}
          <div>
            <div className="font-bold text-lg">
              {daysToDeadline} días restantes para campaña
            </div>
            <div className="text-white/80 text-sm">
              Elecciones: 12 de abril 2026 · Cierre de campaña: 10 de abril 2026
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{daysToElection} días para elecciones</span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>Progreso de campaña</span>
          <span>Cierre: 10 de abril 2026</span>
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
