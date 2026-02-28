import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Edit2, Trash2, X, Save, Search, Hash,
  Globe, ChevronDown, ChevronUp, Check, Sparkles, Users
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PoliticalFigure, SocialAccount } from '../../types/recommendations';

interface FiguresPanelProps {
  figures: PoliticalFigure[];
  isLoading: boolean;
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  selectedFigureIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
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
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export const FiguresPanel: React.FC<FiguresPanelProps> = ({
  figures,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  selectedFigureIds,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onGenerate,
  isGenerating,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingFigure, setEditingFigure] = useState<string | null>(null);
  const [form, setForm] = useState<FigureFormData>(emptyForm);
  const [keywordInput, setKeywordInput] = useState('');
  const [socialInput, setSocialInput] = useState({ platform: 'twitter', handle: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedForm, setExpandedForm] = useState(false);

  const activeFigures = figures.filter(f => f.is_active);

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
    setExpandedForm(false);
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditingFigure(null);
    setShowForm(true);
    setExpandedForm(false);
    setError(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFigure(null);
    setForm(emptyForm);
    setError(null);
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
    <div className="space-y-4">
      <Card glass className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Figuras Políticas</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {figures.length} registrada{figures.length !== 1 ? 's' : ''} · {activeFigures.length} activa{activeFigures.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button onClick={handleNew} variant="primary" size="sm" className="text-xs">
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            Nueva
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {editingFigure ? 'Editar Figura' : 'Nueva Figura Política'}
                </h4>

                {error && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <input
                    value={form.full_name}
                    onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                    placeholder="Nombre completo *"
                  />
                  <input
                    value={form.display_name}
                    onChange={e => setForm(prev => ({ ...prev, display_name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                    placeholder="Nombre corto de visualización *"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={form.party_name}
                      onChange={e => setForm(prev => ({ ...prev, party_name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                      placeholder="Partido político"
                    />
                    <input
                      value={form.region}
                      onChange={e => setForm(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                      placeholder="Región"
                    />
                  </div>
                  <input
                    value={form.current_position}
                    onChange={e => setForm(prev => ({ ...prev, current_position: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                    placeholder="Cargo actual (ej: Congresista, Gobernador)"
                  />

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Keywords de búsqueda (para scraping)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        value={keywordInput}
                        onChange={e => setKeywordInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Ej: Dina Boluarte"
                      />
                      <button onClick={handleAddKeyword} className="px-2.5 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50">
                        +
                      </button>
                    </div>
                    {form.search_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {form.search_keywords.map(kw => (
                          <span key={kw} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs">
                            <Hash className="h-2.5 w-2.5" />{kw}
                            <button onClick={() => handleRemoveKeyword(kw)} className="text-blue-400 hover:text-blue-600 ml-0.5">
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setExpandedForm(!expandedForm)}
                    className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                  >
                    {expandedForm ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {expandedForm ? 'Menos opciones' : 'Más opciones (apodo, redes sociales, notas)'}
                  </button>

                  <AnimatePresence>
                    {expandedForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={form.nickname}
                            onChange={e => setForm(prev => ({ ...prev, nickname: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                            placeholder="Apodo popular"
                          />
                          <select
                            value={form.monitoring_priority}
                            onChange={e => setForm(prev => ({ ...prev, monitoring_priority: e.target.value as any }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="high">Prioridad Alta</option>
                            <option value="medium">Prioridad Media</option>
                            <option value="low">Prioridad Baja</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            <Globe className="h-3 w-3 inline mr-1" />Redes sociales
                          </label>
                          <div className="flex gap-1.5">
                            <select
                              value={socialInput.platform}
                              onChange={e => setSocialInput(prev => ({ ...prev, platform: e.target.value }))}
                              className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
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
                              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                              placeholder="@usuario"
                            />
                            <button onClick={handleAddSocial} className="px-2.5 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200">
                              +
                            </button>
                          </div>
                          {form.social_accounts.length > 0 && (
                            <div className="space-y-1 mt-1.5">
                              {form.social_accounts.map((acc, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs">
                                  <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize font-medium">{acc.platform}</span>
                                  <span className="text-gray-500 dark:text-gray-400">{acc.handle}</span>
                                  <button onClick={() => handleRemoveSocial(i)} className="text-red-400 hover:text-red-600">
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="h-3.5 w-3.5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Monitoreo activo</span>
                        </label>

                        <textarea
                          value={form.notes}
                          onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                          placeholder="Notas adicionales..."
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={handleCancel} className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    Cancelar
                  </button>
                  <Button onClick={handleSave} variant="primary" size="sm" isLoading={saving} className="text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    {editingFigure ? 'Guardar' : 'Crear'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {figures.length === 0 && !isLoading && !showForm && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Users className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium">Sin figuras registradas</p>
            <p className="text-xs mt-1">Registra figuras políticas para generar recomendaciones con IA</p>
          </div>
        )}

        <div className="space-y-2 max-h-[calc(100vh-520px)] overflow-y-auto">
          {figures.map((fig) => {
            const isSelected = selectedFigureIds.includes(fig.id);
            return (
              <motion.div
                key={fig.id}
                layout
                className={`
                  relative p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10'
                    : 'border-transparent bg-white dark:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700'
                  }
                `}
                onClick={() => fig.is_active && onToggleSelection(fig.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                    ${isSelected
                      ? 'bg-purple-500 text-white'
                      : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-600 dark:text-gray-300'
                    }
                  `}>
                    {isSelected ? <Check className="h-4 w-4" /> : fig.display_name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {fig.display_name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityColors[fig.monitoring_priority]}`}>
                        {priorityLabels[fig.monitoring_priority]}
                      </span>
                      {!fig.is_active && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {fig.party_name || 'Independiente'}
                      {fig.current_position && ` · ${fig.current_position}`}
                    </div>
                    {fig.search_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {fig.search_keywords.slice(0, 3).map(kw => (
                          <span key={kw} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                            <Hash className="h-2.5 w-2.5 mr-0.5" />{kw}
                          </span>
                        ))}
                        {fig.search_keywords.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{fig.search_keywords.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleEdit(fig)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(fig.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {activeFigures.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                <button
                  onClick={onSelectAll}
                  className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  Seleccionar todas
                </button>
                <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                <button
                  onClick={onClearSelection}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Limpiar
                </button>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedFigureIds.length} seleccionada{selectedFigureIds.length !== 1 ? 's' : ''}
              </span>
            </div>

            <Button
              onClick={onGenerate}
              variant="primary"
              size="sm"
              isLoading={isGenerating}
              disabled={selectedFigureIds.length === 0 || isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generando con Claude IA...' : `Generar Recomendaciones IA (${selectedFigureIds.length})`}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
