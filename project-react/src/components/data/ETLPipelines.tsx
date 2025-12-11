import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GitBranch, 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ETLPipeline, DataFilters } from '../../types/data';

interface ETLPipelinesProps {
  pipelines: ETLPipeline[];
  isLoading: boolean;
  filters: DataFilters;
}

export const ETLPipelines: React.FC<ETLPipelinesProps> = ({
  pipelines,
  isLoading,
}) => {
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error en fecha';
    }
  };
  const [showNewPipelineModal, setShowNewPipelineModal] = useState(false);

  const statusColors = {
    running: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    retrying: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    paused: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };

  const statusIcons = {
    running: <Play className="h-4 w-4 text-green-500" />,
    completed: <CheckCircle className="h-4 w-4 text-blue-500" />,
    failed: <X className="h-4 w-4 text-red-500" />,
    retrying: <RefreshCw className="h-4 w-4 text-yellow-500" />,
    paused: <Pause className="h-4 w-4 text-gray-500" />,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Card glass className="p-6">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg flex items-center justify-center">
              <GitBranch className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ETL Pipelines
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestión de flujos de datos desde ingesta hasta procesamiento
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowNewPipelineModal(true)}
            variant="primary"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pipeline
          </Button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Total Pipelines
              </h4>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {pipelines.length}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                En Ejecución
              </h4>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {pipelines.filter(p => p.status === 'running').length}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Completados
              </h4>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {pipelines.filter(p => p.status === 'completed').length}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Fallidos
              </h4>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                {pipelines.filter(p => p.status === 'failed').length}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Reintentando
              </h4>
              <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {pipelines.filter(p => p.status === 'retrying').length}
              </span>
            </div>
          </div>
        </div>

        {/* ETL Pipelines Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Nombre
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Fuente
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Destino
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Estado
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Última Ejecución
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Duración
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Registros
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {pipelines.map((pipeline, index) => (
                <motion.tr
                  key={pipeline.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedPipeline(selectedPipeline === pipeline.id ? null : pipeline.id)}
                  className={`border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer ${
                    selectedPipeline === pipeline.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                    {pipeline.name}
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    {pipeline.source}
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    {pipeline.destination}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {statusIcons[pipeline.status as keyof typeof statusIcons]}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        statusColors[pipeline.status as keyof typeof statusColors]
                      }`}>
                        {pipeline.status === 'running' ? 'En ejecución' : 
                         pipeline.status === 'completed' ? 'Completado' : 
                         pipeline.status === 'failed' ? 'Fallido' : 
                         pipeline.status === 'retrying' ? 'Reintentando' : 'Pausado'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(pipeline.lastRun)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    {pipeline.duration}
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    {pipeline.recordsProcessed}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Implement run/pause logic
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title={pipeline.status === 'running' ? 'Pausar' : 'Ejecutar'}
                      >
                        {pipeline.status === 'running' ? (
                          <Pause className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Play className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Ver logs"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected Pipeline Details */}
      {selectedPipeline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glass className="p-6">
            {(() => {
              const pipeline = pipelines.find(p => p.id === selectedPipeline);
              if (!pipeline) return null;
              
              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Pipeline: {pipeline.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pipeline.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={pipeline.status === 'running' ? 'outline' : 'primary'}
                        size="sm"
                      >
                        {pipeline.status === 'running' ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Ejecutar
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reintentar
                      </Button>
                    </div>
                  </div>
                  
                  {/* Pipeline Flow Visualization */}
                  <div className="mb-6 p-6 bg-white/30 dark:bg-gray-800/30 rounded-lg overflow-x-auto">
                    <div className="flex items-center justify-between min-w-[800px]">
                      {pipeline.steps.map((step, index) => (
                        <React.Fragment key={index}>
                          <div className={`p-4 rounded-lg border ${
                            step.status === 'completed' ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20' :
                            step.status === 'running' ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' :
                            step.status === 'pending' ? 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20' :
                            'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                          }`}>
                            <div className="flex items-center space-x-2 mb-2">
                              {step.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : step.status === 'running' ? (
                                <Play className="h-4 w-4 text-blue-500" />
                              ) : step.status === 'pending' ? (
                                <Clock className="h-4 w-4 text-gray-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {step.name}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {step.description}
                            </p>
                            {step.metrics && (
                              <div className="mt-2 text-xs text-gray-500">
                                <div>Duración: {step.metrics.duration}</div>
                                <div>Registros: {step.metrics.records}</div>
                              </div>
                            )}
                          </div>
                          
                          {index < pipeline.steps.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Pipeline Details */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                        Detalles del Pipeline
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {pipeline.type}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Programación:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {pipeline.schedule}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Última Ejecución:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDate(pipeline.lastRun)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Próxima Ejecución:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDate(pipeline.nextRun)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Duración:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {pipeline.duration}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Registros Procesados:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {pipeline.recordsProcessed}
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Dependencias:</span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {pipeline.dependencies.map((dep, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                              >
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Execution History */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                        Historial de Ejecución
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {pipeline.executionHistory.map((execution, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg ${
                              execution.status === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                              execution.status === 'failed' ? 'bg-red-50 dark:bg-red-900/20' :
                              'bg-yellow-50 dark:bg-yellow-900/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                {execution.status === 'success' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : execution.status === 'failed' ? (
                                  <X className="h-4 w-4 text-red-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                                <span className={`text-sm font-medium ${
                                  execution.status === 'success' ? 'text-green-800 dark:text-green-400' :
                                  execution.status === 'failed' ? 'text-red-800 dark:text-red-400' :
                                  'text-yellow-800 dark:text-yellow-400'
                                }`}>
                                  {execution.status === 'success' ? 'Exitoso' : 
                                   execution.status === 'failed' ? 'Fallido' : 'Advertencia'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(execution.timestamp)}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className={`${
                                  execution.status === 'success' ? 'text-green-700 dark:text-green-300' :
                                  execution.status === 'failed' ? 'text-red-700 dark:text-red-300' :
                                  'text-yellow-700 dark:text-yellow-300'
                                }`}>Duración:</span>
                                <span className="ml-1 font-medium">{execution.duration}</span>
                              </div>
                              <div>
                                <span className={`${
                                  execution.status === 'success' ? 'text-green-700 dark:text-green-300' :
                                  execution.status === 'failed' ? 'text-red-700 dark:text-red-300' :
                                  'text-yellow-700 dark:text-yellow-300'
                                }`}>Registros:</span>
                                <span className="ml-1 font-medium">{execution.records}</span>
                              </div>
                              <div>
                                <span className={`${
                                  execution.status === 'success' ? 'text-green-700 dark:text-green-300' :
                                  execution.status === 'failed' ? 'text-red-700 dark:text-red-300' :
                                  'text-yellow-700 dark:text-yellow-300'
                                }`}>Errores:</span>
                                <span className="ml-1 font-medium">{execution.errors}</span>
                              </div>
                            </div>
                            {execution.message && (
                              <p className={`mt-1 text-xs ${
                                execution.status === 'success' ? 'text-green-700 dark:text-green-300' :
                                execution.status === 'failed' ? 'text-red-700 dark:text-red-300' :
                                'text-yellow-700 dark:text-yellow-300'
                              }`}>
                                {execution.message}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Logs */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Logs Recientes
                      </h4>
                      <Button variant="outline" size="sm">
                        Ver todos los logs
                      </Button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs text-gray-800 dark:text-gray-300 h-40 overflow-y-auto">
                      {pipeline.logs.map((log, idx) => (
                        <div key={idx} className={`mb-1 ${
                          log.level === 'INFO' ? 'text-blue-600 dark:text-blue-400' :
                          log.level === 'WARNING' ? 'text-yellow-600 dark:text-yellow-400' :
                          log.level === 'ERROR' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          [{formatDate(log.timestamp)}] {log.level}: {log.message}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>
        </motion.div>
      )}

      {/* New Pipeline Modal */}
      {showNewPipelineModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Crear Nuevo Pipeline
                </h3>
                <button
                  onClick={() => setShowNewPipelineModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Nombre del pipeline"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Descripción breve"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="batch">Batch</option>
                      <option value="streaming">Streaming</option>
                      <option value="incremental">Incremental</option>
                      <option value="full_refresh">Full Refresh</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Programación
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="realtime">Tiempo real</option>
                      <option value="5min">Cada 5 minutos</option>
                      <option value="15min">Cada 15 minutos</option>
                      <option value="1h">Cada hora</option>
                      <option value="6h">Cada 6 horas</option>
                      <option value="12h">Cada 12 horas</option>
                      <option value="1d">Diario</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fuente
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="">Seleccionar fuente</option>
                      <option value="twitter_api">Twitter API</option>
                      <option value="facebook_api">Facebook API</option>
                      <option value="inei_data">INEI Data</option>
                      <option value="onpe_data">ONPE Data</option>
                      <option value="news_scraper">News Scraper</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Destino
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="">Seleccionar destino</option>
                      <option value="raw_data.twitter_posts">raw_data.twitter_posts</option>
                      <option value="raw_data.facebook_posts">raw_data.facebook_posts</option>
                      <option value="raw_data.demographic_data">raw_data.demographic_data</option>
                      <option value="raw_data.electoral_data">raw_data.electoral_data</option>
                      <option value="raw_data.news_articles">raw_data.news_articles</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transformaciones
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Descripción de transformaciones aplicadas"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dependencias (otros pipelines)
                  </label>
                  <select 
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    size={3}
                  >
                    {pipelines.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowNewPipelineModal(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Pipeline
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};