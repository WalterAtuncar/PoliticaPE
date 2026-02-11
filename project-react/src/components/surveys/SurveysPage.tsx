import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, RefreshCw, ExternalLink, Calendar, Users, AlertCircle, Filter, X, FileText, ChevronRight, Eye, TrendingUp, Award, Search, Target } from 'lucide-react';
import { useSurveyData, SurveyItem } from '../../hooks/useSurveyData';

const pollsterColors: Record<string, string> = {
  IEP: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Ipsos Perú': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Ipsos: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Datum: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CPI: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CIT: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  Imasolu: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
};

const pollsterBorderColors: Record<string, string> = {
  IEP: 'border-l-blue-500',
  'Ipsos Perú': 'border-l-purple-500',
  Ipsos: 'border-l-purple-500',
  Datum: 'border-l-amber-500',
  CPI: 'border-l-green-500',
  CIT: 'border-l-rose-500',
  Imasolu: 'border-l-teal-500',
};

const medalColors = ['text-amber-500', 'text-gray-400', 'text-orange-600'];

interface CandidateData {
  candidato: string;
  porcentaje: number;
}

const CandidateBar: React.FC<{ candidate: CandidateData; rank: number; maxPct: number }> = ({ candidate, rank, maxPct }) => {
  const barWidth = maxPct > 0 ? (candidate.porcentaje / maxPct) * 100 : 0;
  const barColor = rank === 0 ? 'bg-blue-500' : rank === 1 ? 'bg-indigo-400' : rank === 2 ? 'bg-purple-400' : 'bg-gray-300 dark:bg-gray-600';

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="w-5 text-center">
        {rank < 3 ? (
          <Award className={`w-4 h-4 ${medalColors[rank]}`} />
        ) : (
          <span className="text-xs text-gray-400">{rank + 1}</span>
        )}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300 w-28 truncate font-medium" title={candidate.candidato}>
        {candidate.candidato}
      </span>
      <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.5, delay: rank * 0.05 }}
          className={`h-full ${barColor} rounded-full flex items-center justify-end pr-2`}
        >
          {barWidth > 15 && (
            <span className="text-xs font-bold text-white">{candidate.porcentaje}%</span>
          )}
        </motion.div>
      </div>
      {barWidth <= 15 && (
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-10 text-right">{candidate.porcentaje}%</span>
      )}
    </div>
  );
};

const SurveyDetailModal: React.FC<{ item: SurveyItem; onClose: () => void }> = ({ item, onClose }) => {
  const results = item.results || {} as Record<string, unknown>;
  const candidates = (results.candidatos as CandidateData[] | undefined) || [];
  const hallazgos = (results.hallazgos_clave as string[] | undefined) || [];
  const porcentajes = (results.porcentajes_mencionados as number[] | undefined) || [];
  const resumen = (results.resumen as string | undefined) || '';
  const tipo = (results.tipo as string | undefined) || 'Estudio';
  const maxPct = candidates.length > 0 ? Math.max(...candidates.map(c => c.porcentaje)) : 0;

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
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {tipo}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                {item.title}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {item.sample_size && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase">Muestra</span>
                  </div>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-300">{item.sample_size.toLocaleString()}</p>
                </div>
              )}
              {item.margin_error && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-100 dark:border-orange-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium uppercase">Margen error</span>
                  </div>
                  <p className="text-lg font-bold text-orange-800 dark:text-orange-300">±{item.margin_error}%</p>
                </div>
              )}
              {item.field_dates && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium uppercase">Fecha campo</span>
                  </div>
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">{item.field_dates}</p>
                </div>
              )}
              {results.diferencia_1_2 !== undefined && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium uppercase">Diferencia 1°-2°</span>
                  </div>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-300">{String(results.diferencia_1_2)} pts</p>
                </div>
              )}
            </div>

            {candidates.length > 0 && (
              <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Intención de voto ({candidates.length} candidatos)
                </h4>
                <div className="space-y-1">
                  {candidates.map((c, i) => (
                    <CandidateBar key={c.candidato} candidate={c} rank={i} maxPct={maxPct} />
                  ))}
                </div>
              </div>
            )}

            {resumen && (
              <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Resumen del análisis
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{resumen}</p>
              </div>
            )}

            {hallazgos.length > 0 && (
              <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Hallazgos clave
                </h4>
                <div className="space-y-2">
                  {hallazgos.map((h, i) => (
                    <div key={i} className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 border-l-4 border-l-amber-400 text-sm text-gray-700 dark:text-gray-300">
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {porcentajes.length > 0 && candidates.length === 0 && (
              <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Cifras mencionadas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {porcentajes.map((p, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-bold">
                      {p}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.url && (
              <div className="pt-2">
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
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

  const pollItems = items.filter(i => ((i.results?.candidatos as CandidateData[] | undefined) || []).length > 0);
  const analysisItems = items.filter(i => !((i.results?.candidatos as CandidateData[] | undefined) || []).length && i.results?.datos_encontrados);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getTopCandidates = (item: SurveyItem): CandidateData[] => {
    return ((item.results?.candidatos as CandidateData[] | undefined) || []).slice(0, 3);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Encuestas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sondeos electorales e informes de opinión pública</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total registros</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
          <p className="text-sm text-blue-600 dark:text-blue-400">Con datos de voto</p>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{pollItems.length}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/50">
          <p className="text-sm text-amber-600 dark:text-amber-400">Informes análisis</p>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{analysisItems.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
          <p className="text-sm text-green-600 dark:text-green-400">Encuestadoras</p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300">{sources.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Todas las fuentes</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input type="text" placeholder="Buscar encuesta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 h-32" />)}
        </div>
      ) : !hasData ? (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sin encuestas disponibles</h3>
          <p className="text-gray-500 dark:text-gray-400">Ejecuta el scraping de encuestas para obtener datos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const topCandidates = getTopCandidates(item);
            const hasCandidates = topCandidates.length > 0;
            const borderColor = pollsterBorderColors[item.source] || 'border-l-gray-400';
            const hallazgos = (item.results?.hallazgos_clave as string[] | undefined) || [];
            const porcentajes = (item.results?.porcentajes_mencionados as number[] | undefined) || [];

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
                      {item.methodology && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {hasCandidates ? 'Intención de voto' : 'Informe de opinión'}
                        </span>
                      )}
                      {item.field_dates && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{item.field_dates}</span>
                      )}
                    </div>

                    {hasCandidates ? (
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          {topCandidates.map((c, i) => (
                            <div key={c.candidato} className="flex items-center gap-1.5">
                              <Award className={`w-4 h-4 ${medalColors[i] || 'text-gray-400'}`} />
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.candidato}</span>
                              <span className={`text-sm font-bold ${i === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                {c.porcentaje}%
                              </span>
                            </div>
                          ))}
                        </div>
                        {item.results?.diferencia_1_2 !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Diferencia: {String(item.results.diferencia_1_2)} pts
                            {item.results.total_candidatos ? ` · ${String(item.results.total_candidatos)} candidatos` : ''}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{item.title}</h3>
                        {hallazgos.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{hallazgos[0]}</p>
                        )}
                        {porcentajes.length > 0 && hallazgos.length === 0 && (
                          <div className="flex gap-1.5 flex-wrap mt-1">
                            {porcentajes.slice(0, 5).map((p, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs font-bold">
                                {p}%
                              </span>
                            ))}
                            {porcentajes.length > 5 && (
                              <span className="text-xs text-gray-400">+{porcentajes.length - 5} más</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {item.sample_size && (
                      <div className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-lg">
                        <Users className="w-3 h-3" />
                        <span className="font-semibold">n={item.sample_size.toLocaleString()}</span>
                      </div>
                    )}
                    {item.margin_error && (
                      <div className="flex items-center gap-1.5 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-lg">
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

      {selectedItem && <SurveyDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </motion.div>
  );
};
