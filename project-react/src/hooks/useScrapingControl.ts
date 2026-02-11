import { useState, useCallback } from 'react';
import { ENDPOINTS, API_CONFIG, fetchFromScrapping } from '../config/api';

interface ScrapingLog {
  id: string;
  source: string;
  scraping_type: string;
  status: string;
  items_scraped: number;
  errors_count: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

interface ScrapingResult {
  message: string;
  task_id: string;
  platform: string;
}

interface PlatformStatus {
  platform: string;
  configured: boolean;
  lastScrape: string | null;
  itemsScraped: number;
}

export function useScrapingControl() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const triggerScraping = useCallback(async (platform: 'twitter' | 'youtube' | 'instagram', maxResults: number = 50, igUserId?: string): Promise<ScrapingResult | null> => {
    setLoading(prev => ({ ...prev, [platform]: true }));
    setError(null);

    try {
      let url = '';
      
      if (platform === 'twitter') {
        url = `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TRIGGER_TWITTER}?max_results=${maxResults}`;
      } else if (platform === 'youtube') {
        url = `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TRIGGER_YOUTUBE}?max_results=${maxResults}`;
      } else if (platform === 'instagram') {
        url = `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TRIGGER_INSTAGRAM}?max_results=${maxResults}&ig_user_id=${igUserId || ''}`;
      }
      
      const response = await fetch(url, { method: 'POST' });

      if (!response.ok) {
        throw new Error(`Error al iniciar scraping de ${platform}`);
      }

      const result = await response.json();
      setTimeout(() => { fetchLogs(); }, 3000);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  }, []);

  const triggerGovernment = useCallback(async () => {
    setLoading(prev => ({ ...prev, government: true }));
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TRIGGER_GOVERNMENT}`, { method: 'POST' });
      if (!response.ok) throw new Error('Error al iniciar scraping gubernamental');
      const result = await response.json();
      setTimeout(() => { fetchLogs(); }, 3000);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, government: false }));
    }
  }, []);

  const triggerSurveys = useCallback(async () => {
    setLoading(prev => ({ ...prev, surveys: true }));
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TRIGGER_SURVEYS}`, { method: 'POST' });
      if (!response.ok) throw new Error('Error al iniciar scraping de encuestas');
      const result = await response.json();
      setTimeout(() => { fetchLogs(); }, 3000);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, surveys: false }));
    }
  }, []);

  const triggerAll = useCallback(async () => {
    setLoading(prev => ({ ...prev, all: true }));
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.TRIGGER_ALL}`, { method: 'POST' });
      if (!response.ok) throw new Error('Error al iniciar scraping completo');
      const result = await response.json();
      setTimeout(() => { fetchLogs(); }, 5000);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  }, []);

  const testConnection = useCallback(async (platform: 'twitter' | 'youtube' | 'instagram') => {
    try {
      let endpoint = ENDPOINTS.TEST_TWITTER;
      if (platform === 'youtube') endpoint = ENDPOINTS.TEST_YOUTUBE;
      if (platform === 'instagram') endpoint = ENDPOINTS.TEST_INSTAGRAM;
      return await fetchFromScrapping(endpoint);
    } catch (err) {
      return { status: 'error', message: 'Error de conexión' };
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await fetchFromScrapping(`${ENDPOINTS.SCRAPING_LOGS}?limit=20`);
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  }, []);

  const getPlatformStatus = useCallback((): PlatformStatus[] => {
    const platforms = ['twitter', 'youtube', 'instagram', 'government', 'surveys'];
    
    return platforms.map(platform => {
      const platformLogs = logs.filter(log => log.source === platform);
      const lastLog = platformLogs[0];
      
      return {
        platform,
        configured: true,
        lastScrape: lastLog?.completed_at || lastLog?.started_at || null,
        itemsScraped: platformLogs.reduce((sum, log) => sum + (log.items_scraped || 0), 0),
      };
    });
  }, [logs]);

  return {
    loading,
    logs,
    error,
    triggerScraping,
    triggerGovernment,
    triggerSurveys,
    triggerAll,
    testConnection,
    fetchLogs,
    getPlatformStatus,
  };
}
