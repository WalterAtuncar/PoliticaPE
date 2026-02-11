import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS } from '../config/api';

export interface SearchTag {
  id: string;
  tag: string;
  platforms: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  last_used_at: string | null;
  results_count: number;
}

export function useSearchTags() {
  const [tags, setTags] = useState<SearchTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_TAGS}`);
      if (!res.ok) throw new Error('Error fetching tags');
      const data = await res.json();
      setTags(data);
    } catch (e) {
      console.error('Error loading tags:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (data: { tag: string; platforms: string[]; is_active: boolean }) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_TAGS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al crear tag');
    }
    const newTag = await res.json();
    setTags(prev => [newTag, ...prev]);
    return newTag;
  };

  const updateTag = async (tagId: string, data: { tag?: string; platforms?: string[]; is_active?: boolean }) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_TAGS}/${tagId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al actualizar tag');
    }
    const updated = await res.json();
    setTags(prev => prev.map(t => t.id === tagId ? updated : t));
    return updated;
  };

  const deleteTag = async (tagId: string) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.SETTINGS_TAGS}/${tagId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar tag');
    setTags(prev => prev.filter(t => t.id !== tagId));
  };

  return { tags, isLoading, createTag, updateTag, deleteTag, refetch: fetchTags };
}
