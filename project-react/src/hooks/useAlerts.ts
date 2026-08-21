import { useCallback, useEffect, useState } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';

export interface AlertEvidence {
  content_type: string;
  content_id: string;
  url: string;
  snippet: string;
  source: string;
}

export interface CampaignAlert {
  id: string;
  figure_id: string | null;
  figure_name: string | null;
  figure_color: string | null;
  kind: 'crisis' | 'opportunity' | 'attack' | 'spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  detail: string | null;
  metrics: Record<string, number> | null;
  evidence: AlertEvidence[] | null;
  suggested_response: string | null;
  status: string;
  created_at: string;
}

const POLL_MS = 60_000;

export function useAlerts(status: string = 'open', limit: number = 50) {
  const [alerts, setAlerts] = useState<CampaignAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.ALERTS}?status=${status}&limit=${limit}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error('No se pudieron cargar las alertas');
      const j = await res.json();
      setAlerts(j.alerts || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [status, limit]);

  useEffect(() => {
    fetchAlerts();
    const t = setInterval(fetchAlerts, POLL_MS);
    return () => clearInterval(t);
  }, [fetchAlerts]);

  const setStatus = useCallback(async (id: string, newStatus: string) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.ALERTS}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    alerts,
    isLoading,
    error,
    refetch: fetchAlerts,
    acknowledge: (id: string) => setStatus(id, 'acknowledged'),
    dismiss: (id: string) => setStatus(id, 'dismissed'),
  };
}
