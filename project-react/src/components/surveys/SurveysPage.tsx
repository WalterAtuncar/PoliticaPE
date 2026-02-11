import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, RefreshCw, ExternalLink, Calendar, Users, AlertCircle, Filter } from 'lucide-react';
import { useSurveyData } from '../../hooks/useSurveyData';

const pollsterColors: Record<string, string> = {
  IEP: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Ipsos: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Datum: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CPI: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export const SurveysPage: React.FC = () => {
  const { items, isLoading, error, hasData, refetch } = useSurveyData(100);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => {
    const matchesSource = sourceFilter === 'all' || item.source === sourceFilter;
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.pollster || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const sources = [...new Set(items.map(i => i.source))];

  const stats = {
    total: items.length,
    bySource: sources.map(s => ({
      source: s,
      count: items.filter(i => i.source === s).length,
    })),
    withSampleSize: items.filter(i => i.sample_size).length,
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getResultsSummary = (results: Record<string, unknown> | null) => {
    if (!results) return '';
    if (results.raw_text) return String(results.raw_text).slice(0, 150);
    if (results.summary) return String(results.summary);
    return JSON.stringify(results).slice(0, 150);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Encuestas
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sondeos y encuestas de IEP, Ipsos, Datum y CPI
            </p>
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total encuestas</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        {stats.bySource.map(s => (
          <div key={s.source} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.source}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las encuestadoras</option>
            {sources.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Buscar por título o encuestadora..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500">{filteredItems.length} resultados</span>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 h-32" />
          ))}
        </div>
      ) : !hasData ? (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sin encuestas disponibles</h3>
          <p className="text-gray-500 dark:text-gray-400">Importa datos de encuestadoras para ver los resultados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pollsterColors[item.source] || 'bg-gray-100 text-gray-800'}`}>
                      {item.source}
                    </span>
                    {item.pollster && item.pollster !== item.source && (
                      <span className="text-xs text-gray-500">{item.pollster}</span>
                    )}
                    {item.methodology && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {item.methodology}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.results && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {getResultsSummary(item.results)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {item.sample_size && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      Muestra: {item.sample_size.toLocaleString()}
                    </div>
                  )}
                  {item.margin_error && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <AlertCircle className="w-3 h-3" />
                      Margen: ±{item.margin_error}%
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.published_at)}
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver fuente
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
