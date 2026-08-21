import { useCallback, useEffect, useState } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';

export interface FigureStat {
  mentions: number;
  net: number | null;
}

export interface DistrictStat {
  ubigeo: string;
  name: string;
  zone: string;
  electors: number;
  mentions: number;
  net_sentiment: number | null;
  top_topic: string | null;
  topics: Record<string, number>;
  figures: Record<string, FigureStat>;
}

export interface ZoneStat {
  zone: string;
  electors: number;
  mentions: number;
  districts: number;
  net_sentiment: number | null;
}

interface Options {
  days?: number;
  figureId?: string;
}

export function useTerritory({ days = 7, figureId }: Options = {}) {
  const [districts, setDistricts] = useState<DistrictStat[]>([]);
  const [zones, setZones] = useState<ZoneStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ days: String(days) });
      if (figureId) qs.set('figure_id', figureId);
      const headers = getAuthHeaders();
      const [dRes, zRes] = await Promise.all([
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TERRITORY_DISTRICTS}?${qs}`, { headers }),
        fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TERRITORY_ZONES}?${qs}`, { headers }),
      ]);
      if (!dRes.ok || !zRes.ok) throw new Error('No se pudieron cargar los datos territoriales');
      const dJson = await dRes.json();
      const zJson = await zRes.json();
      setDistricts(dJson.districts || []);
      setZones(zJson.zones || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
      setDistricts([]);
      setZones([]);
    } finally {
      setIsLoading(false);
    }
  }, [days, figureId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { districts, zones, isLoading, error, refetch: fetchData };
}
