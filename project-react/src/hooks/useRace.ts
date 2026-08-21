import { useCallback, useEffect, useState } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';

export interface PollCandidate {
  name: string;
  figure_id: string | null;
  pct: number | null;
}

export interface Poll {
  id: string;
  pollster: string;
  source: string;
  field_dates: string | null;
  published_at: string | null;
  sample_size: number | null;
  margin_error: number | null;
  base: string;
  candidates: PollCandidate[];
  undecided: number | null;
  blank: number | null;
  manual: boolean;
  internal_only: boolean;
}

export interface PollAverage {
  name: string;
  figure_id: string | null;
  pct: number;
  low: number;
  high: number;
  n_polls: number;
}

export interface SovFigure {
  figure_id: string;
  name: string;
  party_name: string | null;
  color: string | null;
  news_mentions: number;
  social_mentions: number;
  total: number;
  share_pct: number;
  trend_pct: number;
}

export interface SentimentFigure {
  figure_id: string;
  name: string;
  color: string | null;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  net_sentiment: number | null;
  by_zone: Record<string, { n: number; net: number | null }>;
}

export interface TopicRow {
  topic: string;
  label: string;
  mentions: number;
  share_pct: number;
  delta_vs_prev_pct: number;
  net_sentiment: number | null;
  top_figure: string | null;
}

export interface Brief {
  brief_date: string;
  generated_at: string;
  headline: string | null;
  body_markdown: string;
  model: string | null;
  sent_channels: Record<string, boolean> | null;
  status: string;
}

export function useRace(days: number = 7, base: 'validos' | 'total' = 'validos') {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [average, setAverage] = useState<PollAverage[]>([]);
  const [publishable, setPublishable] = useState(true);
  const [blackoutFrom, setBlackoutFrom] = useState<string | null>(null);
  const [sov, setSov] = useState<SovFigure[]>([]);
  const [sentiment, setSentiment] = useState<SentimentFigure[]>([]);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const headers = getAuthHeaders();
    const b = API_CONFIG.SCRAPPING_BASE_URL;
    try {
      const [pRes, sRes, senRes, tRes, brRes] = await Promise.all([
        fetch(`${b}${ENDPOINTS.RACE_POLLS}?base=${base}&days=120`, { headers }),
        fetch(`${b}${ENDPOINTS.RACE_SOV}?days=${days}`, { headers }),
        fetch(`${b}${ENDPOINTS.RACE_SENTIMENT}?days=${days}`, { headers }),
        fetch(`${b}${ENDPOINTS.RACE_TOPICS}?days=${days}`, { headers }),
        fetch(`${b}${ENDPOINTS.RACE_BRIEF_LATEST}`, { headers }),
      ]);
      if (pRes.ok) {
        const j = await pRes.json();
        setPolls(j.polls || []);
        setAverage(j.average || []);
        setPublishable(j.publishable ?? true);
        setBlackoutFrom(j.blackout_from ?? null);
      }
      if (sRes.ok) setSov((await sRes.json()).figures || []);
      if (senRes.ok) setSentiment((await senRes.json()).figures || []);
      if (tRes.ok) setTopics((await tRes.json()).topics || []);
      if (brRes.ok) setBrief((await brRes.json()).brief || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando la carrera');
    } finally {
      setIsLoading(false);
    }
  }, [days, base]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const generateBrief = useCallback(async (send: boolean = false) => {
    setIsGenerating(true);
    try {
      const res = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.RACE_BRIEF_GENERATE}?send=${send}`,
        { method: 'POST', headers: getAuthHeaders() }
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j.detail || 'No se pudo generar el brief');
      setBrief(j.brief);
      return j.brief as Brief;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    polls, average, publishable, blackoutFrom, sov, sentiment, topics, brief,
    isLoading, isGenerating, error, refetch: fetchAll, generateBrief,
  };
}
