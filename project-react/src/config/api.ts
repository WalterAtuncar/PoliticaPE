const isProduction = import.meta.env.PROD;
const replitDomain = import.meta.env.VITE_REPLIT_DOMAIN || window.location.host;

export const API_CONFIG = {
  SCRAPPING_BASE_URL: isProduction 
    ? `https://${replitDomain}:8000` 
    : 'http://localhost:8000',
  SNIFFING_BASE_URL: isProduction 
    ? `https://${replitDomain}:8080` 
    : 'http://localhost:8080',
  SNIFFING_WS_URL: isProduction 
    ? `wss://${replitDomain}:8080` 
    : 'ws://localhost:8080',
};

export const ENDPOINTS = {
  HEALTH: '/health',
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
