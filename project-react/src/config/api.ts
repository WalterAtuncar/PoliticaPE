const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

export const API_CONFIG = {
  SCRAPPING_BASE_URL: '',
  SNIFFING_BASE_URL: '',
  SNIFFING_WS_URL: `${wsProtocol}//${window.location.host}`,
};

export const ENDPOINTS = {
  HEALTH: '/health',
  LOGIN: '/api/v1/auth/login',
  STATS: '/api/v1/data/stats',
  NEWS: '/api/v1/data/news',
  SOCIAL: '/api/v1/data/social',
  GOVERNMENT: '/api/v1/data/government',
  SCRAPING_LOGS: '/api/v1/scraping/logs',
  TRIGGER_NEWS: '/api/v1/scraping/trigger/news',
  TRIGGER_SOCIAL: '/api/v1/scraping/trigger/social',
  SENTIMENT: '/api/v1/analysis/sentiment',
  TRENDS: '/api/v1/analysis/trends',
  ANALYZE: '/api/analyze',
  METRICS: '/api/metrics',
  WEBSOCKET: '/ws/stream',
};

export async function fetchFromScrapping(endpoint: string) {
  const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${endpoint}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function fetchFromSniffing(endpoint: string) {
  const response = await fetch(`${API_CONFIG.SNIFFING_BASE_URL}${endpoint}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function analyzeText(text: string, platform: string = 'manual') {
  const response = await fetch(`${API_CONFIG.SNIFFING_BASE_URL}${ENDPOINTS.ANALYZE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, platform }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}
