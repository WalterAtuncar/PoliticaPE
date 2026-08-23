import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';
import { useElectoralConfig } from './useElectoralConfig';
import { usePoliticalFigures } from './usePoliticalFigures';
import { useRace, SovFigure, TopicRow } from './useRace';
import { useTerritory } from './useTerritory';
import { useOpportunity } from './useEvents';

export interface LimaNewsItem {
  id: string;
  source: string;
  title: string;
  url: string;
  published_at: string | null;
  districts: { name: string; zone: string; ubigeo: string }[] | null;
  topics: { topic: string; secondary?: string[] } | null;
}

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface DashboardRecommendation {
  id: string;
  title: string;
  priority: RecommendationPriority;
  category: string;
  target_region: string | null;
  estimated_budget: { min: number; max: number } | null;
  expected_timeline: string | null;
  ai_confidence: number | null;
}

export interface PollKpi {
  pct: number;
  low: number;
  high: number;
  n_polls: number;
  gapPts: number | null;
  vsName: string | null;
  leads: boolean;
}

export interface PressureKpi {
  negative: number;
  total: number;
  attacks24h: number | null;
}

export interface OwnKpis {
  poll: PollKpi | null;
  sov: SovFigure | null;
  pressure: PressureKpi | null;
  topics: TopicRow[];
}

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const NEWS_LIMIT = 8;
const RECS_LIMIT = 3;

export function useDashboard() {
  const { config, isLoading: cfgLoading } = useElectoralConfig();
  const { figures } = usePoliticalFigures();
  const ownFigure = useMemo(() => figures.find(f => f.is_own_candidate) || null, [figures]);

  const race = useRace(7, 'validos');
  const territory = useTerritory({ days: 7 });
  const opportunity = useOpportunity(ownFigure?.id);

  const [news, setNews] = useState<LimaNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [recs, setRecs] = useState<DashboardRecommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [recsError, setRecsError] = useState<string | null>(null);

  const ownId = ownFigure?.id;

  // Las noticias no dependen de la candidatura: van en su propio efecto para no volver a
  // pedirlas cuando llega ownId (antes se pedian dos veces, una sin figura y otra con ella).
  const fetchNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const res = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.NEWS}?scope=lima_metropolitana&limit=${NEWS_LIMIT}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error('No se pudieron cargar las noticias');
      const j = await res.json();
      setNews(Array.isArray(j) ? j : j.items || []);
      setNewsError(null);
    } catch (e) {
      setNews([]);
      setNewsError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const fetchRecs = useCallback(async () => {
    if (!ownId) {
      setRecs([]);
      setRecsLoading(false);
      return;
    }
    setRecsLoading(true);
    try {
      const res = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.RECOMMENDATIONS}?figure_id=${ownId}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error('No se pudieron cargar las recomendaciones');
      const j = await res.json();
      const all: DashboardRecommendation[] = Array.isArray(j) ? j : j.items || [];
      setRecs(
        [...all]
          .sort(
            (a, b) =>
              (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9) ||
              (b.ai_confidence ?? 0) - (a.ai_confidence ?? 0)
          )
          .slice(0, RECS_LIMIT)
      );
      setRecsError(null);
    } catch (e) {
      setRecs([]);
      setRecsError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setRecsLoading(false);
    }
  }, [ownId]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  // El grafico de encuestas colorea por nombre de candidato, no por id.
  const figureColors = useMemo(() => {
    const map: Record<string, string> = {};
    figures.forEach(f => {
      if (f.color) map[f.display_name] = f.color;
    });
    return map;
  }, [figures]);

  const opportunityScores = useMemo(() => {
    const map: Record<string, number> = {};
    opportunity.districts.forEach(d => {
      map[d.ubigeo] = d.score;
    });
    return map;
  }, [opportunity.districts]);

  const kpis: OwnKpis = useMemo(() => {
    const ownName = config?.own_candidate;

    let poll: PollKpi | null = null;
    const own = ownName ? race.average.find(a => a.name === ownName) : undefined;
    if (own) {
      const sorted = [...race.average].sort((a, b) => b.pct - a.pct);
      const leads = sorted[0]?.name === own.name;
      const vs = leads ? sorted[1] : sorted[0];
      poll = {
        pct: own.pct,
        low: own.low,
        high: own.high,
        n_polls: own.n_polls,
        gapPts: vs ? Number((own.pct - vs.pct).toFixed(1)) : null,
        vsName: vs?.name ?? null,
        leads,
      };
    }

    const sov = race.sov.find(f => f.figure_id === ownId) ?? null;

    let pressure: PressureKpi | null = null;
    const sen = race.sentiment.find(f => f.figure_id === ownId);
    if (sen && sen.total > 0) {
      const attacks = race.brief?.data?.attacks_1d;
      const attacks24h = attacks
        ? attacks
            .filter(a => a.attacked === ownName)
            .reduce((sum, a) => sum + (a.count || 0), 0)
        : null;
      pressure = { negative: sen.negative, total: sen.total, attacks24h };
    }

    return {
      poll,
      sov,
      pressure,
      topics: race.topics.filter(t => t.topic !== 'otro'),
    };
  }, [race.average, race.sov, race.sentiment, race.topics, race.brief, config?.own_candidate, ownId]);

  return {
    config,
    ownFigure,
    figureColors,
    kpis,
    race,
    territory,
    opportunity,
    opportunityScores,
    news,
    newsLoading,
    newsError,
    refetchNews: fetchNews,
    recs,
    recsLoading,
    recsError,
    refetchRecs: fetchRecs,
    isLoading: cfgLoading || race.isLoading,
  };
}
