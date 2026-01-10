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
      let endpoint = ENDPOINTS.TRIGGER_TWITTER;
      let url = '';
      
      if (platform === 'twitter') {
        endpoint = ENDPOINTS.TRIGGER_TWITTER;
        url = `${API_CONFIG.SCRAPPING_BASE_URL}${endpoint}?max_results=${maxResults}`;
      } else if (platform === 'youtube') {
        endpoint = ENDPOINTS.TRIGGER_YOUTUBE;
        url = `${API_CONFIG.SCRAPPING_BASE_URL}${endpoint}?max_results=${maxResults}`;
      } else if (platform === 'instagram') {
        endpoint = ENDPOINTS.TRIGGER_INSTAGRAM;
        url = `${API_CONFIG.SCRAPPING_BASE_URL}${endpoint}?max_results=${maxResults}&ig_user_id=${igUserId}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Error al iniciar scraping de ${platform}`);
      }

      const result = await response.json();
      
      setTimeout(() => {
        fetchLogs();
      }, 3000);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
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
      const data = await fetchFromScrapping(`${ENDPOINTS.SCRAPING_LOGS}?limit=10`);
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  }, []);

  const getPlatformStatus = useCallback((): PlatformStatus[] => {
    const platforms = ['twitter', 'youtube', 'instagram'];
    
    return platforms.map(platform => {
      const platformLogs = logs.filter(log => log.source === platform);
      const lastLog = platformLogs[0];
      
      return {
        platform,
        configured: true,
        lastScrape: lastLog?.completed_at || null,
        itemsScraped: platformLogs.reduce((sum, log) => sum + (log.items_scraped || 0), 0),
      };
    });
  }, [logs]);

  return {
    loading,
    logs,
    error,
    triggerScraping,
    testConnection,
    fetchLogs,
    getPlatformStatus,
  };
}
