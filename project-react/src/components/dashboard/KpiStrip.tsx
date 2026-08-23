import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../ui/Card';
import { OwnKpis } from '../../hooks/useDashboard';
import { fmtInt, fmtPct, fmtSignedPts } from '../../utils/format';

interface Props {
  kpis: OwnKpis;
  ownColor: string | null;
  isLoading: boolean;
}

const TEAL = '#1F6B73';

interface KpiProps {
  title: string;
  value: string;
  empty?: boolean;
  line2?: string;
  line3?: string;
  trend?: number | null;
  accent?: string;
  small?: boolean;
}

const Kpi: React.FC<KpiProps> = ({ title, value, empty, line2, line3, trend, accent, small }) => {
  const TrendIcon = trend == null ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  return (
    <Card glass hover className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </p>
      {empty ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{value}</p>
      ) : (
        <>
          <p
            className={`${small ? 'text-2xl' : 'text-3xl'} font-bold mt-1 leading-tight`}
            style={{ color: accent }}
          >
            {value}
          </p>
          {line2 && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{line2}</p>}
          {line3 && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 flex items-center gap-1">
              {TrendIcon && <TrendIcon className="h-3.5 w-3.5" />}
              {line3}
            </p>
          )}
        </>
      )}
    </Card>
  );
};

export const KpiStrip: React.FC<Props> = ({ kpis, ownColor, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-32" />
        ))}
      </div>
    );
  }

  const own = ownColor ?? TEAL;
  const { poll, sov, pressure, topics } = kpis;

  // KPI 1 — intencion de voto
  const pollGap = poll?.gapPts ?? null;
  const pollLine3 =
    poll && pollGap !== null && poll.vsName
      ? pollGap === 0
        ? `Empate con ${poll.vsName}`
        : poll.leads
        ? `${fmtSignedPts(pollGap)} pts sobre ${poll.vsName}`
        : `${fmtSignedPts(pollGap)} pts bajo ${poll.vsName}`
      : undefined;

  // KPI 3 — presion mediatica
  const ratio = pressure && pressure.total > 0 ? pressure.negative / pressure.total : 0;
  const pressureAccent = ratio >= 0.6 ? '#DC2626' : ratio >= 0.3 ? '#B8741A' : '#2E7D4F';

  // KPI 4 — tema dominante
  const t0 = topics[0];
  const t1 = topics[1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Kpi
        title="Intención de voto"
        value={poll ? `${fmtPct(poll.pct)} %` : 'Sin encuestas publicadas'}
        empty={!poll}
        line2={poll ? `[${fmtPct(poll.low)}–${fmtPct(poll.high)}] · ${poll.n_polls} encuestas` : undefined}
        line3={pollLine3}
        trend={pollGap}
        accent={own}
      />

      <Kpi
        title="Share of voice · 7 d"
        value={sov ? `${fmtPct(sov.share_pct)} %` : 'Sin menciones esta semana'}
        empty={!sov}
        line2={sov ? `${fmtInt(sov.news_mentions)} menciones en prensa` : undefined}
        line3={sov ? `${fmtSignedPts(sov.trend_pct)} % vs. semana previa` : undefined}
        trend={sov?.trend_pct ?? null}
        accent={own}
      />

      <Kpi
        title="Presión mediática · 7 d"
        value={pressure ? `${pressure.negative} de ${pressure.total}` : 'Sin cobertura esta semana'}
        empty={!pressure}
        line2={pressure ? 'notas negativas en prensa' : undefined}
        line3={
          pressure && pressure.attacks24h != null && pressure.attacks24h > 0
            ? `${pressure.attacks24h} ataques en 24 h`
            : undefined
        }
        accent={pressureAccent}
      />

      <Kpi
        title="Tema dominante · 7 d"
        value={t0 ? t0.label : 'Sin temas clasificados'}
        empty={!t0}
        small={!!t0 && t0.label.length > 18}
        line2={t0 ? `${fmtPct(t0.share_pct)} % de la conversación` : undefined}
        line3={t1 ? `↑ ${t1.label} ${fmtPct(t1.share_pct)} %` : undefined}
        accent={TEAL}
      />
    </div>
  );
};
