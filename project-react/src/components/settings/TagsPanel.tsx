import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Search,
  X,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useSearchTags, SearchTag } from '../../hooks/useSearchTags';
import toast from 'react-hot-toast';

const platformIcons: Record<string, string> = {
  twitter: '𝕏',
  youtube: '▶',
  instagram: '📷',
  facebook: '📘',
  tiktok: '♪',
};

const platformNames: Record<string, string> = {
  twitter: 'Twitter / X',
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
};

const allPlatforms = ['twitter', 'youtube', 'instagram', 'facebook', 'tiktok'];

export const TagsPanel: React.FC = () => {
  const { tags, isLoading, createTag, updateTag, deleteTag } = useSearchTags();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newPlatforms, setNewPlatforms] = useState<string[]>(['twitter', 'youtube', 'instagram']);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTag, setEditTag] = useState('');
  const [editPlatforms, setEditPlatforms] = useState<string[]>([]);

  const handleCreate = async () => {
    if (!newTag.trim()) {
      toast.error('Ingresa un tag de búsqueda');
      return;
    }
    if (newPlatforms.length === 0) {
      toast.error('Selecciona al menos una plataforma');
      return;
    }
    setSaving(true);
    try {
      await createTag({ tag: newTag.trim(), platforms: newPlatforms, is_active: true });
      toast.success(`Tag "${newTag.trim()}" creado`);
      setNewTag('');
      setNewPlatforms(['twitter', 'youtube', 'instagram']);
      setShowAddForm(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al crear tag');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (tag: SearchTag) => {
    try {
      await updateTag(tag.id, { is_active: !tag.is_active });
      toast.success(tag.is_active ? `Tag "${tag.tag}" desactivado` : `Tag "${tag.tag}" activado`);
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (tag: SearchTag) => {
    if (!confirm(`¿Eliminar el tag "${tag.tag}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteTag(tag.id);
      toast.success(`Tag "${tag.tag}" eliminado`);
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const startEdit = (tag: SearchTag) => {
    setEditingId(tag.id);
    setEditTag(tag.tag);
    setEditPlatforms([...tag.platforms]);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editTag.trim()) {
      toast.error('El tag no puede estar vacío');
      return;
    }
    try {
      await updateTag(editingId, { tag: editTag.trim(), platforms: editPlatforms });
      toast.success('Tag actualizado');
      setEditingId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar');
    }
  };

  const togglePlatform = (platform: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(platform)) {
      setter(current.filter(p => p !== platform));
    } else {
      setter([...current, platform]);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const activeTags = tags.filter(t => t.is_active).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Tag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tags de Búsqueda</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Términos personalizados que los scrapers buscarán en todas las redes sociales
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Tag
        </button>
      </div>

      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{tags.length}</strong> tags totales
            </span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
          <span className="text-sm text-green-600 dark:text-green-400">
            <strong>{activeTags}</strong> activos
          </span>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            El scraping periódico buscará cada tag activo en las plataformas seleccionadas
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Nuevo Tag de Búsqueda</h3>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Término de búsqueda
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder='Ej: "keiko fujimori", "pedro castillo", "elecciones 2026"'
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar en estas plataformas
                </label>
                <div className="flex flex-wrap gap-2">
                  {allPlatforms.map(p => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p, newPlatforms, setNewPlatforms)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                        newPlatforms.includes(p)
                          ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-400 text-purple-700 dark:text-purple-300'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'
                      }`}
                    >
                      <span>{platformIcons[p]}</span>
                      <span>{platformNames[p]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Guardar Tag
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 h-20" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sin tags configurados</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Agrega tags personalizados para que los scrapers busquen términos específicos como nombres de políticos, partidos o temas.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Agregar primer tag
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tags.map((tag, index) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border transition-all ${
                tag.is_active
                  ? 'border-gray-200/50 dark:border-gray-700/50'
                  : 'border-gray-200/30 dark:border-gray-700/30 opacity-60'
              }`}
            >
              {editingId === tag.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTag}
                    onChange={e => setEditTag(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  />
                  <div className="flex flex-wrap gap-2">
                    {allPlatforms.map(p => (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p, editPlatforms, setEditPlatforms)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all ${
                          editPlatforms.includes(p)
                            ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-400 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'
                        }`}
                      >
                        <span>{platformIcons[p]}</span>
                        <span>{platformNames[p]}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      Cancelar
                    </button>
                    <button onClick={saveEdit} className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(tag)}
                          className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        >
                          {tag.tag}
                        </button>
                        <span className={`text-xs font-medium ${tag.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          {tag.is_active ? '● Activo' : '● Inactivo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          {tag.platforms.map(p => (
                            <span key={p} className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded" title={platformNames[p]}>
                              {platformIcons[p]}
                            </span>
                          ))}
                        </div>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {tag.results_count} resultados
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Último uso: {formatDate(tag.last_used_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggle(tag)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={tag.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {tag.is_active ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(tag)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
