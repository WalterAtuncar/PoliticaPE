import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  RefreshCw,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useTokenSettings, PlatformInfo } from '../../hooks/useTokenSettings';
import toast from 'react-hot-toast';

const platformIcons: Record<string, string> = {
  twitter: '𝕏',
  youtube: '▶',
  instagram: '📷',
  facebook: '📘',
  tiktok: '♪',
};

const platformColors: Record<string, string> = {
  twitter: 'from-gray-800 to-black',
  youtube: 'from-red-500 to-red-700',
  instagram: 'from-pink-500 to-purple-600',
  facebook: 'from-blue-600 to-blue-800',
  tiktok: 'from-gray-900 to-pink-600',
};

const statusColors: Record<string, string> = {
  active: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
};

export const SettingsPage: React.FC = () => {
  const { platforms, tokens, isLoading, createToken, updateToken, deleteToken, testToken, refetch } = useTokenSettings();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const filteredTokens = selectedPlatform
    ? tokens.filter(t => t.platform === selectedPlatform)
    : tokens;

  const handleTest = async (tokenId: string) => {
    setTestingId(tokenId);
    try {
      const result = await testToken(tokenId);
      if (result.success) {
        toast.success(result.message || 'Conexión exitosa');
      } else {
        toast.error(result.message || 'Error de conexión');
      }
    } catch {
      toast.error('Error al probar la conexión');
    } finally {
      setTestingId(null);
    }
  };

  const handleToggle = async (token: { id: string; label: string; is_active: boolean }) => {
    try {
      await updateToken(token.id, { is_active: !token.is_active });
      toast.success(token.is_active ? 'Token desactivado' : 'Token activado');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (token: { id: string; label: string }) => {
    if (!confirm(`¿Eliminar el token "${token.label}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteToken(token.id);
      toast.success('Token eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona tokens de API para múltiples cuentas de redes sociales
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Token
          </button>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          El scraping periódico iterará <strong>todos los tokens activos</strong> de cada plataforma, recopilando datos de múltiples cuentas simultáneamente. Agrega tantos tokens como necesites por red social.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedPlatform(null)}
          className={`p-4 rounded-xl border transition-all text-center ${
            !selectedPlatform
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
              : 'bg-white/60 dark:bg-gray-800/60 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{tokens.length}</p>
          <p className="text-xs text-gray-500 mt-1">Todos</p>
        </button>
        {platforms.map(p => (
          <button
            key={p.platform}
            onClick={() => setSelectedPlatform(p.platform === selectedPlatform ? null : p.platform)}
            className={`p-4 rounded-xl border transition-all text-center ${
              selectedPlatform === p.platform
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                : 'bg-white/60 dark:bg-gray-800/60 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300'
            }`}
          >
            <div className="text-xl mb-1">{platformIcons[p.platform] || '🔗'}</div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{p.token_count}</p>
            <p className="text-xs text-gray-500">{p.display_name}</p>
            <p className="text-xs text-green-600">{p.active_count} activos</p>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 h-24" />
          ))}
        </div>
      ) : filteredTokens.length === 0 ? (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sin tokens configurados</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Agrega tokens de API para que el scraping periódico recopile datos de múltiples cuentas.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Agregar primer token
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTokens.map((token, index) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${platformColors[token.platform] || 'from-gray-500 to-gray-700'} rounded-lg flex items-center justify-center text-white text-lg`}>
                    {platformIcons[token.platform] || '🔗'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{token.label}</h3>
                      <span className={`text-xs font-medium ${statusColors[token.status] || 'text-gray-400'}`}>
                        {token.status === 'active' ? '● Activo' : token.status === 'error' ? '● Error' : '● Inactivo'}
                      </span>
                      {!token.is_active && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">Desactivado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="capitalize">{platforms.find(p => p.platform === token.platform)?.display_name || token.platform}</span>
                      <span>Creado: {formatDate(token.created_at)}</span>
                      <span>Último uso: {formatDate(token.last_used_at)}</span>
                    </div>
                    {token.last_error && (
                      <p className="text-xs text-red-500 mt-1 line-clamp-1">{token.last_error}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {Object.entries(token.credentials_masked).map(([key, val]) => (
                        <span key={key} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTest(token.id)}
                    disabled={testingId === token.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Probar conexión"
                  >
                    {testingId === token.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleToggle(token)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={token.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {token.is_active ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(token)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <AddTokenModal
            platforms={platforms}
            onClose={() => setShowAddModal(false)}
            onSave={createToken}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface AddTokenModalProps {
  platforms: PlatformInfo[];
  onClose: () => void;
  onSave: (data: { platform: string; label: string; credentials: Record<string, string>; is_active: boolean }) => Promise<unknown>;
}

const AddTokenModal: React.FC<AddTokenModalProps> = ({ platforms, onClose, onSave }) => {
  const [platform, setPlatform] = useState(platforms[0]?.platform || 'twitter');
  const [label, setLabel] = useState('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showValues, setShowValues] = useState(false);

  const selectedPlatform = platforms.find(p => p.platform === platform);
  const fields = selectedPlatform?.credential_fields || {};

  const handleSave = async () => {
    if (!label.trim()) {
      toast.error('Ingresa un nombre descriptivo');
      return;
    }
    setSaving(true);
    try {
      await onSave({ platform, label, credentials, is_active: true });
      toast.success('Token agregado correctamente');
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agregar Token de API</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plataforma</label>
              <div className="grid grid-cols-5 gap-2">
                {platforms.map(p => (
                  <button
                    key={p.platform}
                    onClick={() => { setPlatform(p.platform); setCredentials({}); }}
                    className={`p-3 rounded-lg text-center transition-all border ${
                      platform === p.platform
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400'
                        : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl">{platformIcons[p.platform]}</div>
                    <div className="text-xs mt-1">{p.display_name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre descriptivo</label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Ej: Cuenta principal, Token campaña norte..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Credenciales</label>
                <button
                  onClick={() => setShowValues(!showValues)}
                  className="text-xs text-blue-600 flex items-center gap-1"
                >
                  {showValues ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showValues ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries(fields).map(([key, fieldLabel]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{fieldLabel}</label>
                    <input
                      type={showValues ? 'text' : 'password'}
                      value={credentials[key] || ''}
                      onChange={e => setCredentials(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Ingresa ${fieldLabel}`}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Guardar Token
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
