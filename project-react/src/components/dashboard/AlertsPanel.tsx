import React, { useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ChevronUp, ExternalLink, Shield, TrendingUp, Swords, X } from 'lucide-react';
import { CampaignAlert, useAlerts } from '../../hooks/useAlerts';
import { timeAgo } from '../../utils/time';

const SEVERITY_STYLE: Record<string, { bar: string; chip: string; label: string }> = {
  critical: { bar: 'bg-red-600', chip: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', label: 'Crítica' },
  high: { bar: 'bg-orange-500', chip: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200', label: 'Alta' },
  medium: { bar: 'bg-amber-400', chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200', label: 'Media' },
  low: { bar: 'bg-gray-400', chip: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', label: 'Baja' },
};

const KIND_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  crisis: AlertTriangle,
  attack: Swords,
  opportunity: TrendingUp,
  spike: Shield,
};

const KIND_LABEL: Record<string, string> = {
  crisis: 'Crisis', attack: 'Ataque', opportunity: 'Oportunidad', spike: 'Pico',
};

const AlertCard: React.FC<{
  alert: CampaignAlert;
  onAck: (id: string) => void;
  onDismiss: (id: string) => void;
}> = ({ alert, onAck, onDismiss }) => {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.low;
  const Icon = KIND_ICON[alert.kind] || Shield;

  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70">
      <div className={`w-1.5 flex-shrink-0 ${sev.bar}`} />
      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${sev.chip}`}>{sev.label}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">{KIND_LABEL[alert.kind] || alert.kind}</span>
              {alert.figure_name && (
                <span className="text-[11px] text-gray-500 dark:text-gray-400">· {alert.figure_name}</span>
              )}
              <span className="text-[11px] text-gray-400">· {timeAgo(alert.created_at)}</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{alert.title}</p>
            {alert.detail && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{alert.detail}</p>}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onAck(alert.id)}
              title="Marcar como atendida"
              className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDismiss(alert.id)}
              title="Descartar"
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {(alert.evidence?.length || alert.suggested_response) && (
          <button
            onClick={() => setOpen(o => !o)}
            className="mt-2 text-[11px] text-teal-700 dark:text-teal-300 flex items-center gap-1"
          >
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {open ? 'Ocultar' : 'Ver evidencia y respuesta sugerida'}
          </button>
        )}

        {open && (
          <div className="mt-2 space-y-2">
            {(alert.evidence || []).slice(0, 3).map(e => (
              <div key={e.content_id} className="text-xs text-gray-600 dark:text-gray-400 border-l-2 border-gray-200 dark:border-gray-600 pl-2">
                <span className="font-medium">{e.source}</span>: {e.snippet}
                {e.url && (
                  <a href={e.url} target="_blank" rel="noreferrer" className="ml-1 inline-flex text-teal-600">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
            {alert.suggested_response && (
              <div className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded p-2 whitespace-pre-wrap">
                {alert.suggested_response}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const AlertsPanel: React.FC = () => {
  const { alerts, isLoading, acknowledge, dismiss } = useAlerts('open', 5);

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Alertas abiertas</h3>
        {alerts.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200">
            {alerts.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-20" />
      ) : alerts.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sin alertas abiertas en las últimas 24 h.
        </p>
      ) : (
        <div className="space-y-2">
          {alerts.map(a => (
            <AlertCard key={a.id} alert={a} onAck={acknowledge} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </div>
  );
};
