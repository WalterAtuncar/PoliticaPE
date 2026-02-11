import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';

export interface PlatformInfo {
  platform: string;
  display_name: string;
  credential_fields: Record<string, string>;
  token_count: number;
  active_count: number;
}

export interface TokenItem {
  id: string;
  platform: string;
  label: string;
  credentials_masked: Record<string, string>;
  is_active: boolean;
  status: string;
  last_used_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface TokenCreateData {
  platform: string;
  label: string;
  credentials: Record<string, string>;
  is_active: boolean;
}

export const useTokenSettings = () => {
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatforms = useCallback(async () => {
    try {
      const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_PLATFORMS}`);
      if (res.ok) {
        const data = await res.json();
        setPlatforms(data);
      }
    } catch (e) {
      console.error('Error fetching platforms:', e);
    }
  }, []);

  const fetchTokens = useCallback(async (platform?: string) => {
    try {
      setIsLoading(true);
      const url = platform
        ? `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_TOKENS}?platform=${platform}`
        : `${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_TOKENS}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTokens(data);
      }
    } catch (e) {
      console.error('Error fetching tokens:', e);
      setError('Error al cargar tokens');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createToken = useCallback(async (data: TokenCreateData) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_TOKENS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al crear token');
    }
    await fetchTokens();
    await fetchPlatforms();
    return res.json();
  }, [fetchTokens, fetchPlatforms]);

  const updateToken = useCallback(async (tokenId: string, data: Partial<TokenCreateData>) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_TOKENS}/${tokenId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar token');
    await fetchTokens();
    await fetchPlatforms();
  }, [fetchTokens, fetchPlatforms]);

  const deleteToken = useCallback(async (tokenId: string) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_TOKENS}/${tokenId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar token');
    await fetchTokens();
    await fetchPlatforms();
  }, [fetchTokens, fetchPlatforms]);

  const testToken = useCallback(async (tokenId: string) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_TOKENS}/${tokenId}/test`, {
      method: 'POST',
    });
    const result = await res.json();
    await fetchTokens();
    return result;
  }, [fetchTokens]);

  useEffect(() => {
    fetchPlatforms();
    fetchTokens();
  }, [fetchPlatforms, fetchTokens]);

  return {
    platforms,
    tokens,
    isLoading,
    error,
    createToken,
    updateToken,
    deleteToken,
    testToken,
    refetch: () => { fetchPlatforms(); fetchTokens(); },
  };
};
