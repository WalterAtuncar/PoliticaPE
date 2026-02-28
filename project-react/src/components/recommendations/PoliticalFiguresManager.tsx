import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, Edit2, Trash2, X, Save, Search, Hash, 
  Globe, Award, MapPin, Eye, EyeOff 
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PoliticalFigure, SocialAccount } from '../../types/recommendations';

interface PoliticalFiguresManagerProps {
  figures: PoliticalFigure[];
  isLoading: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

interface FigureFormData {
  full_name: string;
  display_name: string;
  nickname: string;
  photo_url: string;
  party_name: string;
  current_position: string;
  region: string;
  search_keywords: string[];
  social_accounts: SocialAccount[];
  is_active: boolean;
  monitoring_priority: 'high' | 'medium' | 'low';
  notes: string;
}

const emptyForm: FigureFormData = {
  full_name: '',
  display_name: '',
  nickname: '',
  photo_url: '',
  party_name: '',
  current_position: '',
  region: '',
  search_keywords: [],
  social_accounts: [],
  is_active: true,
  monitoring_priority: 'medium',
  notes: '',
};

const priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export const PoliticalFiguresManager: React.FC<PoliticalFiguresManagerProps> = ({
  figures,
  isLoading,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [editingFigure, setEditingFigure] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FigureFormData>(emptyForm);
  const [keywordInput, setKeywordInput] = useState('');
  const [socialInput, setSocialInput] = useState({ platform: 'twitter', handle: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !form.search_keywords.includes(kw)) {
      setForm(prev => ({ ...prev, search_keywords: [...prev.search_keywords, kw] }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setForm(prev => ({ ...prev, search_keywords: prev.search_keywords.filter(k => k !== kw) }));
  };

  const handleAddSocial = () => {
    const handle = socialInput.handle.trim();
    if (handle) {
      setForm(prev => ({
        ...prev,
        social_accounts: [...prev.social_accounts, { platform: socialInput.platform, handle }],
      }));
      setSocialInput({ platform: 'twitter', handle: '' });
    }
  };

  const handleRemoveSocial = (index: number) => {
    setForm(prev => ({
      ...prev,
      social_accounts: prev.social_accounts.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = (fig: PoliticalFigure) => {
    setForm({
      full_name: fig.full_name,
      display_name: fig.display_name,
      nickname: fig.nickname || '',
      photo_url: fig.photo_url || '',
      party_name: fig.party_name || '',
      current_position: fig.current_position || '',
      region: fig.region || '',
      search_keywords: fig.search_keywords || [],
      social_accounts: fig.social_accounts || [],
      is_active: fig.is_active,
      monitoring_priority: fig.monitoring_priority,
      notes: fig.notes || '',
    });
    setEditingFigure(fig.id);
    setShowForm(true);
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditingFigure(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.display_name.trim()) {
      setError('Nombre completo y nombre de visualización son obligatorios');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingFigure) {
        await onUpdate(editingFigure, form);
      } else {
        await onCreate(form);
      }
      setShowForm(false);
      setEditingFigure(null);
      setForm(emptyForm);
    } catch (e: any) {
      setError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta figura política?')) return;
    try {
      await onDelete(id);
    } catch (e: any) {
      setError(e.message || 'Error al eliminar');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Gestión de Figuras Políticas" size="xl">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {!showForm ? (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {figures.length} figura(s) registrada(s) · {figures.filter(f => f.is_active).length} activa(s)
              </p>
              <Button onClick={handleNew} variant="primary" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Nueva Figura
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {figures.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No hay figuras políticas registradas. Agrega la primera para comenzar.
                </div>
              )}
              {figures.map(fig => (
                <Card key={fig.id} glass className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {fig.display_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{fig.display_name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[fig.monitoring_priority]}`}>
                          {priorityLabels[fig.monitoring_priority]}
                        </span>
                        {!fig.is_active && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            Inactiva
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {fig.party_name || 'Independiente'}
                        {fig.current_position && ` · ${fig.current_position}`}
                        {fig.region && ` · ${fig.region}`}
                      </div>
                      {fig.search_keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {fig.search_keywords.slice(0, 5).map(kw => (
                            <span key={kw} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                              <Hash className="h-3 w-3 mr-0.5" />{kw}
                            </span>
                          ))}
                          {fig.search_keywords.length > 5 && (
                            <span className="text-xs text-gray-400">+{fig.search_keywords.length - 5} más</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => handleEdit(fig)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(fig.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {editingFigure ? 'Editar Figura Política' : 'Nueva Figura Política'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo *</label>
                <input
                  value={form.full_name}
                  onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Nombre completo oficial"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de visualización *</label>
                <input
                  value={form.display_name}
                  onChange={e => setForm(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Nombre corto para mostrar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apodo</label>
                <input
                  value={form.nickname}
                  onChange={e => setForm(prev => ({ ...prev, nickname: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Apodo popular (opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partido político</label>
                <input
                  value={form.party_name}
                  onChange={e => setForm(prev => ({ ...prev, party_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Nombre del partido"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cargo actual</label>
                <input
                  value={form.current_position}
                  onChange={e => setForm(prev => ({ ...prev, current_position: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Congresista, Gobernador"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Región</label>
                <input
                  value={form.region}
                  onChange={e => setForm(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Lima, Arequipa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad de monitoreo</label>
                <select
                  value={form.monitoring_priority}
                  onChange={e => setForm(prev => ({ ...prev, monitoring_priority: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Monitoreo activo</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Search className="h-4 w-4 inline mr-1" />
                Keywords de búsqueda (se usan para scraping)
              </label>
              <div className="flex gap-2">
                <input
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Dina Boluarte, #Boluarte"
                />
                <Button onClick={handleAddKeyword} variant="outline" size="sm">Agregar</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.search_keywords.map(kw => (
                  <span key={kw} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs">
                    <Hash className="h-3 w-3" />{kw}
                    <button onClick={() => handleRemoveKeyword(kw)} className="text-blue-400 hover:text-blue-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Globe className="h-4 w-4 inline mr-1" />
                Cuentas de redes sociales
              </label>
              <div className="flex gap-2">
                <select
                  value={socialInput.platform}
                  onChange={e => setSocialInput(prev => ({ ...prev, platform: e.target.value }))}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="twitter">Twitter/X</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                </select>
                <input
                  value={socialInput.handle}
                  onChange={e => setSocialInput(prev => ({ ...prev, handle: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSocial())}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="@usuario o URL del perfil"
                />
                <Button onClick={handleAddSocial} variant="outline" size="sm">Agregar</Button>
              </div>
              <div className="space-y-1 mt-2">
                {form.social_accounts.map((acc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium capitalize">{acc.platform}</span>
                    <span className="text-gray-600 dark:text-gray-400">{acc.handle}</span>
                    <button onClick={() => handleRemoveSocial(i)} className="text-red-400 hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                placeholder="Notas adicionales sobre esta figura..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => { setShowForm(false); setEditingFigure(null); setError(null); }} variant="outline">
                Cancelar
              </Button>
              <Button onClick={handleSave} variant="primary" isLoading={saving}>
                <Save className="h-4 w-4 mr-2" />
                {editingFigure ? 'Guardar Cambios' : 'Crear Figura'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};
