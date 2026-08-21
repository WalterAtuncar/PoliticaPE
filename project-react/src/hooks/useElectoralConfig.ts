import { useEffect, useState } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';

export type CampaignPhase = 'pre' | 'campaign' | 'poll_blackout' | 'closing' | 'election_day' | 'post';

export interface ElectoralConfig {
  election_name: string;
  election_type: string;
  electoral_district: string;
  rounds: number;
  own_candidate: string;
  election_date: string;
  candidacy_final_date: string | null;
  poll_blackout_from: string | null;
  rally_deadline: string;
  propaganda_deadline: string;
  debate_date: string | null;
  today: string;
  phase: CampaignPhase;
  days_to_election: number;
  days_to_propaganda_deadline: number;
  days_to_poll_blackout: number | null;
  days_to_candidacy_final: number | null;
  polls_publishable: boolean;
  propaganda_allowed: boolean;
  rallies_allowed: boolean;
}

let cache: ElectoralConfig | null = null;

export function formatElectoralDate(iso: string | null): string {
  if (!iso) return 'por confirmar';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function useElectoralConfig() {
  const [config, setConfig] = useState<ElectoralConfig | null>(cache);
  const [isLoading, setIsLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let active = true;
    fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.ELECTORAL_CONFIG}`, { headers: getAuthHeaders() })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data && active) {
          cache = data;
          setConfig(data);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { config, isLoading };
}
