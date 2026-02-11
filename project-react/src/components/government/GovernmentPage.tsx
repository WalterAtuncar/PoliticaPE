import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, Landmark, TrendingUp, Database, FileText, X, ExternalLink, Calendar, Filter, Search, ChevronRight, Eye, BarChart3, Award } from 'lucide-react';
import { useGovernmentData } from '../../hooks/useGovernmentData';

interface GovernmentDataItem {
  id: string;
  source: string;
  data_type: string;
  title: string;
  content: Record<string, unknown> | null;
  published_at: string | null;
  scraped_at: string;
  url: string | null;
  department: string | null;
}

const sourceColors: Record<string, string> = {
  Congreso: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  INEI: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PCM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

const sourceBorderColors: Record<string, string> = {
  Congreso: 'border-l-emerald-500',
  INEI: 'border-l-blue-500',
  PCM: 'border-l-amber-500',
};

interface BancadaData {
  bancada: string;
  escanos: number;
  porcentaje: number;
  congresistas?: string[];
}

interface MinistroData {
  titular: string;
  ministerio: string;
  fecha_juramentacion: string;
}

const BancadaBar: React.FC<{ bancada: BancadaData; rank: number; maxEscanos: number }> = ({ bancada, rank, maxEscanos }) => {
  const barWidth = maxEscanos > 0 ? (bancada.escanos / maxEscanos) * 100 : 0;
  const barColor = rank === 0 ? 'bg-emerald-500' : rank === 1 ? 'bg-teal-400' : rank === 2 ? 'bg-cyan-400' : 'bg-gray-300 dark:bg-gray-600';
  const medalColors = ['text-amber-500', 'text-gray-400', 'text-orange-600'];

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="w-5 text-center">
        {rank < 3 ? (
          <Award className={`w-4 h-4 ${medalColors[rank]}`} />
        ) : (
          <span className="text-xs text-gray-400">{rank + 1}</span>
        )}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300 w-36 truncate font-medium" title={bancada.bancada}>
        {bancada.bancada}
      </span>
      <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.5, delay: rank * 0.05 }}
          className={`h-full ${barColor} rounded-full flex items-center justify-end pr-2`}
        >
          {barWidth > 20 && (
            <span className="text-xs font-bold text-white">{bancada.escanos} ({bancada.porcentaje}%)</span>
          )}
        </motion.div>
      </div>
      {barWidth <= 20 && (
        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-16 text-right">{bancada.escanos} ({bancada.porcentaje}%)</span>
      )}
    </div>
  );
};

const GovernmentDetailModal: React.FC<{ item: GovernmentDataItem; onClose: () => void }> = ({ item, onClose }) => {
  const content = item.content || {};
  const dataType = item.data_type;

  const renderGabinete = () => {
    const ministros = (content.ministros as MinistroData[] | undefined) || [];
    const premier = content.premier as string | undefined;
    const totalMinisterios = content.total_ministerios as number | undefined;

    return (
      <>
        {(premier || totalMinisterios) && (
          <div className="grid grid-cols-2 gap-3">
            {premier && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-1.5 mb-1">
                  <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase">Premier</span>
                </div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{premier}</p>
              </div>
            )}
            {totalMinisterios && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase">Ministerios</span>
                </div>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-300">{totalMinisterios}</p>
              </div>
            )}
          </div>
        )}
        {ministros.length > 0 && (
          <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Ministros del Gabinete ({ministros.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ministerio</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Titular</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Juramentación</th>
                  </tr>
                </thead>
                <tbody>
                  {ministros.map((m, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="py-2 px-2 text-gray-900 dark:text-white font-medium">{m.ministerio}</td>
                      <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{m.titular}</td>
                      <td className="py-2 px-2 text-gray-500 dark:text-gray-400">{m.fecha_juramentacion || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderComposicion = () => {
    const bancadas = (content.bancadas as BancadaData[] | undefined) || [];
    const totalCongresistas = content.total_congresistas as number | undefined;
    const totalBancadas = content.total_bancadas as number | undefined;
    const maxEscanos = bancadas.length > 0 ? Math.max(...bancadas.map(b => b.escanos)) : 0;

    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          {totalCongresistas && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase">Congresistas</span>
              </div>
              <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{totalCongresistas}</p>
            </div>
          )}
          {totalBancadas && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Landmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase">Bancadas</span>
              </div>
              <p className="text-lg font-bold text-blue-800 dark:text-blue-300">{totalBancadas}</p>
            </div>
          )}
        </div>
        {bancadas.length > 0 && (
          <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Distribución por bancadas ({bancadas.length})
            </h4>
            <div className="space-y-1">
              {bancadas.map((b, i) => (
                <BancadaBar key={b.bancada} bancada={b} rank={i} maxEscanos={maxEscanos} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderComisiones = () => {
    const rawComisiones = (content.comisiones as unknown[] | undefined) || [];
    const totalComisiones = content.total_comisiones as number | undefined;

    const comisionNames = rawComisiones.map((c) => {
      if (typeof c === 'string') return c;
      if (c && typeof c === 'object' && 'nombre' in c) return String((c as Record<string, unknown>).nombre);
      return JSON.stringify(c);
    });

    return (
      <>
        {totalComisiones && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800 inline-block">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase">Total comisiones</span>
            </div>
            <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{totalComisiones}</p>
          </div>
        )}
        {comisionNames.length > 0 && (
          <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              Comisiones del Congreso
            </h4>
            <div className="space-y-2">
              {comisionNames.map((name, i) => (
                <div key={i} className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-3 border-l-4 border-l-emerald-400 text-sm text-gray-700 dark:text-gray-300">
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderIndicadores = () => {
    const indicadores = (content.indicadores as Record<string, unknown> | undefined) || {};
    const entries = Object.entries(indicadores);

    const labelMap: Record<string, string> = {
      idh: 'Índice de Desarrollo Humano',
      gini: 'Coeficiente Gini',
      moneda: 'Moneda',
      pib_ppa: 'PIB (PPA)',
      ingresos: 'Ingresos',
      poblacion: 'Población',
      inflacion: 'Inflación',
      desempleo: 'Desempleo',
      pib_nominal: 'PIB Nominal',
      pib_per_capita: 'PIB per cápita',
      deuda_publica: 'Deuda Pública',
      esperanza_vida: 'Esperanza de Vida',
      tasa_pobreza: 'Tasa de Pobreza',
    };

    return entries.length > 0 ? (
      <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Indicadores Económicos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{labelMap[key] || key}</span>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-300 ml-2">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    ) : null;
  };

  const renderEstadistica = () => {
    const datos = (content.datos as Record<string, unknown>[] | undefined) || [];
    const headers = (content.headers as string[] | undefined) || [];

    if (datos.length === 0) return null;

    const keys = headers.length > 0 ? headers : (datos.length > 0 ? Object.keys(datos[0]) : []);

    return (
      <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Datos Históricos ({datos.length} registros)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                {keys.map(h => (
                  <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{String(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.slice(0, 20).map((row, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  {keys.map(k => (
                    <td key={k} className="py-2 px-2 text-gray-700 dark:text-gray-300">{String((row as Record<string, unknown>)[k] ?? '—')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {datos.length > 20 && (
            <p className="text-xs text-gray-400 mt-2 text-center">Mostrando 20 de {datos.length} registros</p>
          )}
        </div>
      </div>
    );
  };

  const renderDatosAbiertos = () => {
    const datasets = (content.datasets as Record<string, unknown>[] | undefined) || [];
    const totalCategoria = content.total_datasets_categoria as number | undefined;
    const descargados = content.datasets_descargados as number | undefined;

    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          {totalCategoria && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium uppercase">Datasets en categoría</span>
              </div>
              <p className="text-lg font-bold text-amber-800 dark:text-amber-300">{totalCategoria}</p>
            </div>
          )}
          {descargados && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="text-[10px] text-green-600 dark:text-green-400 font-medium uppercase">Con datos descargados</span>
              </div>
              <p className="text-lg font-bold text-green-800 dark:text-green-300">{descargados}</p>
            </div>
          )}
        </div>
        {datasets.length > 0 && (
          <div className="space-y-4">
            {datasets.map((ds, i) => {
              const titulo = String((ds as Record<string, unknown>).titulo || '');
              const organizacion = String((ds as Record<string, unknown>).organizacion || '');
              const recursos = ((ds as Record<string, unknown>).recursos as Record<string, unknown>[] | undefined) || [];

              return (
                <div key={i} className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{titulo}</h4>
                      {organizacion && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{organizacion}</p>}
                    </div>
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                      {recursos.length} recurso{recursos.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {recursos.map((rec, j) => {
                    const recursoName = String((rec as Record<string, unknown>).recurso || '');
                    const totalFilas = (rec as Record<string, unknown>).total_filas as number | undefined;
                    const filasMostradas = (rec as Record<string, unknown>).filas_mostradas as number | undefined;
                    const headers = ((rec as Record<string, unknown>).headers as string[] | undefined) || [];
                    const datos = ((rec as Record<string, unknown>).datos as Record<string, unknown>[] | undefined) || [];

                    return (
                      <div key={j} className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {recursoName}
                          </p>
                          {totalFilas && (
                            <span className="text-[10px] text-gray-400">{totalFilas} filas totales{filasMostradas ? ` · ${filasMostradas} mostradas` : ''}</span>
                          )}
                        </div>
                        {datos.length > 0 && headers.length > 0 && (
                          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                  {headers.slice(0, 6).map(h => (
                                    <th key={h} className="text-left py-1.5 px-2 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {datos.slice(0, 15).map((row, ri) => (
                                  <tr key={ri} className="border-t border-gray-100 dark:border-gray-700">
                                    {headers.slice(0, 6).map(h => (
                                      <td key={h} className="py-1 px-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{String((row as Record<string, unknown>)[h] ?? '—')}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {datos.length > 15 && (
                              <p className="text-[10px] text-gray-400 text-center py-1 bg-gray-50 dark:bg-gray-700">
                                Mostrando 15 de {datos.length} filas
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  const renderContent = () => {
    if (dataType === 'Gabinete') return renderGabinete();
    if (dataType === 'Composición') return renderComposicion();
    if (dataType === 'Organización') return renderComisiones();
    if (dataType === 'Indicador') return renderIndicadores();
    if (dataType === 'Estadística') return renderEstadistica();
    if (dataType === 'Datos Abiertos' || dataType === 'Catálogo') return renderDatosAbiertos();

    return (
      <div className="bg-white dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contenido</h4>
        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-x-auto">{JSON.stringify(content, null, 2)}</pre>
      </div>
    );
  };

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
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sourceColors[item.source] || 'bg-gray-100 text-gray-800'}`}>
                  {item.source}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {item.data_type}
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
            {renderContent()}

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

const getCardPreview = (item: GovernmentDataItem): string => {
  const content = item.content || {};
  const dataType = item.data_type;

  if (dataType === 'Gabinete') {
    const premier = content.premier as string | undefined;
    const total = content.total_ministerios as number | undefined;
    return premier ? `Premier: ${premier}${total ? ` · ${total} ministerios` : ''}` : `${total || 0} ministerios`;
  }

  if (dataType === 'Composición') {
    const total = content.total_congresistas as number | undefined;
    const bancadas = content.total_bancadas as number | undefined;
    return `${total || 0} congresistas · ${bancadas || 0} bancadas`;
  }

  if (dataType === 'Organización') {
    const total = content.total_comisiones as number | undefined;
    return `${total || 0} comisiones del Congreso`;
  }

  if (dataType === 'Indicador') {
    const indicadores = content.indicadores as Record<string, unknown> | undefined;
    if (indicadores) {
      const keys = Object.keys(indicadores).slice(0, 3);
      return keys.map(k => `${k}: ${String(indicadores[k])}`).join(' · ');
    }
    return 'Indicadores económicos';
  }

  if (dataType === 'Estadística') {
    const datos = content.datos as unknown[] | undefined;
    return `${datos?.length || 0} registros históricos`;
  }

  if (dataType === 'Datos Abiertos' || dataType === 'Catálogo') {
    const descargados = content.datasets_descargados as number | undefined;
    const totalCategoria = content.total_datasets_categoria as number | undefined;
    if (descargados) return `${descargados} datasets con datos reales${totalCategoria ? ` de ${totalCategoria} disponibles` : ''}`;
    const total = content.total_datasets as number | undefined;
    return `${total || 0} datasets disponibles`;
  }

  return JSON.stringify(content).slice(0, 100) + '...';
};

const getCardIcon = (dataType: string) => {
  switch (dataType) {
    case 'Gabinete': return <Building2 className="w-4 h-4" />;
    case 'Composición': return <Users className="w-4 h-4" />;
    case 'Organización': return <Landmark className="w-4 h-4" />;
    case 'Indicador': return <TrendingUp className="w-4 h-4" />;
    case 'Estadística': return <BarChart3 className="w-4 h-4" />;
    case 'Datos Abiertos':
    case 'Catálogo': return <Database className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

export const GovernmentPage: React.FC = () => {
  const { items, isLoading, error, hasData, refetch } = useGovernmentData(100);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<GovernmentDataItem | null>(null);

  const filteredItems = items.filter(item => {
    const matchesSource = sourceFilter === 'all' || item.source === sourceFilter;
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.data_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.source || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const sources = [...new Set(items.map(i => i.source))];

  const totalMinisterios = items.reduce((acc, item) => {
    if (item.data_type === 'Gabinete' && item.content) {
      const total = item.content.total_ministerios as number | undefined;
      return acc + (total || 0);
    }
    return acc;
  }, 0);

  const totalCongresistas = items.reduce((acc, item) => {
    if (item.data_type === 'Composición' && item.content) {
      const total = item.content.total_congresistas as number | undefined;
      return acc + (total || 0);
    }
    return acc;
  }, 0);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Datos Gubernamentales</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Información oficial del Congreso, INEI y PCM</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
          <Building2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total registros</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-700/50">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Fuentes</p>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{sources.length}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
          <p className="text-sm text-blue-600 dark:text-blue-400">Ministerios</p>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{totalMinisterios}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/50">
          <p className="text-sm text-amber-600 dark:text-amber-400">Congresistas</p>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{totalCongresistas}</p>
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
          <input type="text" placeholder="Buscar por título, tipo o fuente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
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
          <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sin datos gubernamentales</h3>
          <p className="text-gray-500 dark:text-gray-400">Ejecuta el scraping de datos gubernamentales para obtener información.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const borderColor = sourceBorderColors[item.source] || 'border-l-gray-400';
            const preview = getCardPreview(item as GovernmentDataItem);
            const icon = getCardIcon(item.data_type);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedItem(item as GovernmentDataItem)}
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer border-l-4 ${borderColor}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceColors[item.source] || 'bg-gray-100 text-gray-800'}`}>
                        {item.source}
                      </span>
                      {item.data_type && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center gap-1">
                          {icon}
                          {item.data_type}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{preview}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.published_at || item.scraped_at)}
                    </div>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-3 h-3" />
                        Ver fuente
                      </a>
                    )}
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

      {selectedItem && <GovernmentDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </motion.div>
  );
};
