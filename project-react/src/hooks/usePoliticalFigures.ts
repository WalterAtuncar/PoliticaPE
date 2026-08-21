import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../config/api';
import { PoliticalFigure } from '../types/recommendations';

export function usePoliticalFigures() {
  const [figures, setFigures] = useState<PoliticalFigure[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFigures = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.POLITICAL_FIGURES}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Error fetching figures');
      const data = await res.json();
      setFigures(data);
    } catch (e) {
      console.error('Error loading political figures:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFigures();
  }, [fetchFigures]);

  const createFigure = async (data: Omit<PoliticalFigure, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.POLITICAL_FIGURES}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al crear figura política');
    }
    const newFigure = await res.json();
    setFigures(prev => [newFigure, ...prev]);
    return newFigure;
  };

  const updateFigure = async (figureId: string, data: Partial<PoliticalFigure>) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.POLITICAL_FIGURES}/${figureId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al actualizar figura');
    }
    const updated = await res.json();
    setFigures(prev => prev.map(f => f.id === figureId ? updated : f));
    return updated;
  };

  const deleteFigure = async (figureId: string) => {
    const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.POLITICAL_FIGURES}/${figureId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar figura');
    setFigures(prev => prev.filter(f => f.id !== figureId));
  };

  return { figures, isLoading, createFigure, updateFigure, deleteFigure, refetch: fetchFigures };
}
