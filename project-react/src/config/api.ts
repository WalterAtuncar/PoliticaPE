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
  TRIGGER_TWITTER: '/api/v1/scraping/trigger/twitterapi-io',
  TRIGGER_YOUTUBE: '/api/v1/scraping/trigger/youtube',
  TRIGGER_INSTAGRAM: '/api/v1/scraping/trigger/instagram',
  TEST_TWITTER: '/api/v1/scraping/test/twitterapi-io',
  TEST_YOUTUBE: '/api/v1/scraping/test/youtube',
  TEST_INSTAGRAM: '/api/v1/scraping/test/instagram',
  TRIGGER_GOVERNMENT: '/api/v1/scraping/trigger/government',
  TRIGGER_SURVEYS: '/api/v1/scraping/trigger/surveys',
  TRIGGER_ALL: '/api/v1/scraping/trigger/all',
  TRIGGER_HISTORICAL: '/api/v1/scraping/trigger/historical',
  HISTORICAL_STATUS: '/api/v1/scraping/historical/status',
  SURVEYS: '/api/v1/data/surveys',
  SENTIMENT: '/api/v1/analysis/sentiment',
  TRENDS: '/api/v1/analysis/trends',
  ANALYZE: '/api/analyze',
  METRICS: '/api/metrics',
  WEBSOCKET: '/ws/stream',
  SETTINGS_PLATFORMS: '/api/v1/settings/platforms',
  SETTINGS_TOKENS: '/api/v1/settings/tokens',
  SETTINGS_TAGS: '/api/v1/settings/tags',
};

export async function fetchFromScrapping(endpoint: string) {
  const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${endpoint}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export async function postToScrapping(endpoint: string, body?: object) {
  const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
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
