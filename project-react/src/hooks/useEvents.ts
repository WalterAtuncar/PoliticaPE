import { useCallback, useEffect, useState } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';

export interface CampaignEvent {
  id: string;
  title: string;
  event_type: string;
  start_at: string | null;
  end_at: string | null;
  district_ubigeo: string | null;
  district_name: string | null;
  zone: string | null;
  description: string | null;
  expected_attendance: number | null;
  actual_attendance: number | null;
  status: string;
}

export interface EventTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  description: string | null;
}

export interface EventImpact {
  ubigeo: string;
  before: { mentions: number; net: number | null };
  after: { mentions: number; net: number | null };
  delta_mentions_pct: number | null;
  delta_net: number | null;
  partial: boolean;
}

export interface NewEvent {
  title: string;
  event_type: string;
  start_at: string;
  district_ubigeo?: string;
  venue_name?: string;
  expected_attendance?: number;
  description?: string;
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  tour: 'Caminata / recorrido',
  rally: 'Mitin',
  debate: 'Debate',
  press: 'Prensa',
  fundraising: 'Recaudación',
  meeting: 'Reunión',
};

export function useEvents() {
  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.EVENTS}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('No se pudieron cargar los eventos');
      setEvents((await res.json()).events || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const createEvent = useCallback(async (data: NewEvent) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.EVENTS}`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.detail || 'No se pudo crear el evento');
    await fetchEvents();
    return j as CampaignEvent;
  }, [fetchEvents]);

  const deleteEvent = useCallback(async (id: string) => {
    await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.EVENTS}/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    });
    await fetchEvents();
  }, [fetchEvents]);

  const getImpact = useCallback(async (id: string): Promise<EventImpact | null> => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.EVENTS}/${id}/impact`, {
      headers: getAuthHeaders(),
    });
    return res.ok ? res.json() : null;
  }, []);

  const getTasks = useCallback(async (id: string): Promise<EventTask[]> => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.EVENTS}/${id}/tasks`, {
      headers: getAuthHeaders(),
    });
    return res.ok ? (await res.json()).tasks || [] : [];
  }, []);

  const createTask = useCallback(async (eventId: string, title: string, priority = 'medium') => {
    await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.EVENTS}/${eventId}/tasks`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ title, priority }),
    });
  }, []);

  const setTaskStatus = useCallback(async (taskId: string, status: string) => {
    await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.EVENTS}/tasks/${taskId}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ status }),
    });
  }, []);

  return { events, isLoading, error, refetch: fetchEvents, createEvent, deleteEvent, getImpact, getTasks, createTask, setTaskStatus };
}

export function useOpportunity(figureId?: string) {
  const [districts, setDistricts] = useState<OpportunityDistrict[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!figureId) {
      setDistricts([]);
      setError('Selecciona la candidatura propia para calcular la oportunidad territorial.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TERRITORY_OPPORTUNITY}?figure_id=${figureId}`,
        { headers: getAuthHeaders() }
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j.detail || 'No se pudo calcular la oportunidad');
      setDistricts(j.districts || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
      setDistricts([]);
    } finally {
      setIsLoading(false);
    }
  }, [figureId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { districts, isLoading, error, refetch: fetchData };
}

export interface OpportunityDistrict {
  ubigeo: string;
  name: string;
  zone: string;
  electors: number;
  undecided_share: number;
  own_strength: number;
  rival_strength: number;
  rival_name: string | null;
  topic: string | null;
  topic_weight: number;
  own_mentions: number;
  score: number;
  rank: number;
  why: string;
}
