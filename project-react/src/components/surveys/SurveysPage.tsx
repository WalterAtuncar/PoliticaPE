import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, RefreshCw, ExternalLink, Calendar, Users, AlertCircle, Filter, X, FileText, Globe, ChevronRight, Eye, Hash, Search } from 'lucide-react';
import { useSurveyData, SurveyItem } from '../../hooks/useSurveyData';

const pollsterColors: Record<string, string> = {
  IEP: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Ipsos: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Datum: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CPI: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const pollsterBorderColors: Record<string, string> = {
  IEP: 'border-l-blue-500',
  Ipsos: 'border-l-purple-500',
  Datum: 'border-l-amber-500',
  CPI: 'border-l-green-500',
};

const SurveyDetailModal: React.FC<{ item: SurveyItem; onClose: () => void }> = ({ item, onClose }) => {
  const rawText = item.results?.raw_text ? String(item.results.raw_text) : '';
  const summary = item.results?.summary ? String(item.results.summary) : '';
  const allResults = item.results || {};

  const contentSections = rawText.split(/(?:MÁS INFORMACIÓN|:)/).filter(Boolean).map(s => s.trim());

  const otherKeys = Object.keys(allResults).filter(k => k !== 'raw_text' && k !== 'summary');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-5 flex items-start justify-between z-10">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pollsterColors[item.source] || 'bg-gray-100 text-gray-800'}`}>
                  {item.source}
                </span>
                {item.methodology && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {item.methodology}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                {item.title.length > 80 ? item.title.substring(0, 80) + '...' : item.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {item.sample_size && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Tamaño de muestra</span>
                  </div>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-300">{item.sample_size.toLocaleString()}</p>
                </div>
              )}
              {item.margin_error && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-100 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Margen de error</span>
                  </div>
                  <p className="text-xl font-bold text-orange-800 dark:text-orange-300">±{item.margin_error}%</p>
                </div>
              )}
              {item.field_dates && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Fecha de campo</span>
                  </div>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">{item.field_dates}</p>
                </div>
              )}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Fecha de publicación</span>
                </div>
                <p className="text-sm font-bold text-purple-800 dark:text-purple-300">
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
                    : 'Sin fecha'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Recopilado</span>
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {new Date(item.scraped_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {item.pollster && (
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3 border border-teal-100 dark:border-teal-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">Encuestadora</span>
                  </div>
                  <p className="text-sm font-bold text-teal-800 dark:text-teal-300">{item.pollster}</p>
                </div>
              )}
            </div>

            {summary && (
              <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Resumen
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{summary}</p>
              </div>
            )}

            {rawText && (
              <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Contenido completo
                </h4>
                {contentSections.length > 1 ? (
                  <div className="space-y-3">
                    {contentSections.map((section, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border-l-4 border-l-amber-400">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{section}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{rawText}</p>
                )}
              </div>
            )}

            {otherKeys.length > 0 && (
              <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Datos adicionales
                </h4>
                <div className="space-y-2">
                  {otherKeys.map(key => {
                    const value = allResults[key];
                    return (
                      <div key={key} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[100px]">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {item.url && (
              <div className="pt-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir fuente original
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const SurveysPage: React.FC = () => {
  const { items, isLoading, error, hasData, refetch } = useSurveyData(100);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<SurveyItem | null>(null);

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
    withResults: items.filter(i => i.results && Object.keys(i.results).length > 0).length,
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getContentPreview = (item: SurveyItem): string => {
    if (!item.results) return '';
    const raw = item.results.raw_text ? String(item.results.raw_text) : '';
    const summary = item.results.summary ? String(item.results.summary) : '';
    const text = summary || raw;
    if (text.length > 120) return text.substring(0, 120) + '...';
    return text;
  };

  const getContentType = (item: SurveyItem): string => {
    const raw = item.results?.raw_text ? String(item.results.raw_text) : '';
    if (raw.toLowerCase().includes('encuesta')) return 'Encuesta';
    if (raw.toLowerCase().includes('focus group')) return 'Focus Group';
    if (raw.toLowerCase().includes('listening') || raw.toLowerCase().includes('digital')) return 'Digital';
    if (raw.toLowerCase().includes('comunidades')) return 'Comunidades';
    if (raw.toLowerCase().includes('behavioral') || raw.toLowerCase().includes('comportamiento')) return 'Comportamiento';
    if (raw.toLowerCase().includes('research') || raw.toLowerCase().includes('investigación')) return 'Investigación';
    return 'Estudio';
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total encuestas</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">Con datos</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.withResults}</p>
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
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título o encuestadora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
          {filteredItems.map((item, index) => {
            const contentPreview = getContentPreview(item);
            const contentType = getContentType(item);
            const borderColor = pollsterBorderColors[item.source] || 'border-l-gray-400';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedItem(item)}
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer border-l-4 ${borderColor}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pollsterColors[item.source] || 'bg-gray-100 text-gray-800'}`}>
                        {item.source}
                      </span>
                      {item.pollster && item.pollster !== item.source && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {item.pollster}
                        </span>
                      )}
                      {item.methodology && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {item.methodology}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {contentType}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-1">
                      {item.title.length > 100 ? item.title.substring(0, 100) + '...' : item.title}
                    </h3>
                    {contentPreview && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {contentPreview}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {item.sample_size && (
                      <div className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg">
                        <Users className="w-3 h-3" />
                        <span className="font-semibold">{item.sample_size.toLocaleString()}</span>
                      </div>
                    )}
                    {item.margin_error && (
                      <div className="flex items-center gap-1.5 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-lg">
                        <AlertCircle className="w-3 h-3" />
                        <span className="font-semibold">±{item.margin_error}%</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.published_at || item.scraped_at)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      <Eye className="w-3 h-3" />
                      Ver detalle
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <SurveyDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </motion.div>
  );
};
