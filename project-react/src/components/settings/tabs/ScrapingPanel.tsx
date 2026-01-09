import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, XCircle, Clock, Database, Twitter, Youtube } from 'lucide-react';
import { useScrapingControl } from '../../../hooks/useScrapingControl';

interface PlatformCardProps {
  platform: 'twitter' | 'youtube';
  name: string;
  icon: React.ReactNode;
  color: string;
  onTrigger: (platform: 'twitter' | 'youtube', maxResults: number) => Promise<void>;
  loading: boolean;
  lastScrape: string | null;
  itemsScraped: number;
}

function PlatformCard({ platform, name, icon, color, onTrigger, loading, lastScrape, itemsScraped }: PlatformCardProps) {
  const [maxResults, setMaxResults] = useState(50);
  const [message, setMessage] = useState<string | null>(null);

  const handleTrigger = async () => {
    setMessage(null);
    await onTrigger(platform, maxResults);
    setMessage(`Scraping de ${name} iniciado`);
    setTimeout(() => setMessage(null), 5000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    const date = new Date(dateStr);
    return date.toLocaleString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">Importar contenido político</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-600">Configurado</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Clock className="w-4 h-4" />
            Último scraping
          </div>
          <p className="font-medium text-gray-900">{formatDate(lastScrape)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Database className="w-4 h-4" />
            Items importados
          </div>
          <p className="font-medium text-gray-900">{itemsScraped.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-sm text-gray-600 mb-1 block">Cantidad máxima</label>
          <select
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={20}>20 items</option>
            <option value={50}>50 items</option>
            <option value={100}>100 items</option>
            <option value={200}>200 items</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm text-gray-600 mb-1 block">&nbsp;</label>
          <button
            onClick={handleTrigger}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          {message}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ScrapingPanel() {
  const { loading, logs, fetchLogs, triggerScraping, getPlatformStatus } = useScrapingControl();
  const [platformStatus, setPlatformStatus] = useState<ReturnType<typeof getPlatformStatus>>([]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPlatformStatus(getPlatformStatus());
  }, [logs, getPlatformStatus]);

  const handleTrigger = async (platform: 'twitter' | 'youtube', maxResults: number) => {
    await triggerScraping(platform, maxResults);
    setTimeout(() => fetchLogs(), 5000);
  };

  const getStatusForPlatform = (platform: string) => {
    return platformStatus.find(p => p.platform === platform) || {
      platform,
      configured: false,
      lastScrape: null,
      itemsScraped: 0,
    };
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      completed: { label: 'Completado', color: 'text-green-600 bg-green-50' },
      running: { label: 'En progreso', color: 'text-blue-600 bg-blue-50' },
      failed: { label: 'Error', color: 'text-red-600 bg-red-50' },
    };
    return statusMap[status] || { label: status, color: 'text-gray-600 bg-gray-50' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Panel de Scraping</h2>
        <p className="text-gray-600">Importa datos de redes sociales para análisis político</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlatformCard
          platform="twitter"
          name="Twitter / X"
          icon={<Twitter className="w-6 h-6 text-white" />}
          color="bg-sky-500"
          onTrigger={handleTrigger}
          loading={loading.twitter || false}
          lastScrape={getStatusForPlatform('twitter').lastScrape}
          itemsScraped={getStatusForPlatform('twitter').itemsScraped}
        />
        <PlatformCard
          platform="youtube"
          name="YouTube"
          icon={<Youtube className="w-6 h-6 text-white" />}
          color="bg-red-500"
          onTrigger={handleTrigger}
          loading={loading.youtube || false}
          lastScrape={getStatusForPlatform('youtube').lastScrape}
          itemsScraped={getStatusForPlatform('youtube').itemsScraped}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Historial de Scraping</h3>
          <button
            onClick={() => fetchLogs()}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay registros de scraping</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Fuente</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Estado</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Items</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const status = formatStatus(log.status);
                  return (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <span className="capitalize font-medium">{log.source}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-2">{log.items_scraped || 0}</td>
                      <td className="py-3 px-2 text-gray-500">
                        {new Date(log.started_at).toLocaleString('es-PE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
