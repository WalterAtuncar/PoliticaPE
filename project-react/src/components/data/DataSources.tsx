import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Link, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  X, 
  RefreshCw, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  Settings,
  Database,
  Globe,
  FileText,
  Zap
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DataSource } from '../../types/data';

interface DataSourcesProps {
  sources?: DataSource[];
  isLoading: boolean;
}

export const DataSources: React.FC<DataSourcesProps> = ({
  sources,
  isLoading,
}) => {
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const handleTestConnection = (sourceId: string) => {
    // Implement connection test
    console.log(`Testing connection for source ${sourceId}`);
  };

  const handleRefreshData = (sourceId: string) => {
    // Implement data refresh
    console.log(`Refreshing data for source ${sourceId}`);
  };

  const statusColors = {
    connected: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    maintenance: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  };

  const statusIcons = {
    connected: <CheckCircle className="h-4 w-4 text-green-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    error: <X className="h-4 w-4 text-red-500" />,
    maintenance: <Clock className="h-4 w-4 text-blue-500" />,
  };

  const statusLabels = {
    connected: 'Conectado',
    warning: 'Advertencia',
    error: 'Error',
    maintenance: 'Mantenimiento',
  };

  const typeIcons = {
    social_media: <Globe className="h-4 w-4" />,
    scraper: <Zap className="h-4 w-4" />,
    government: <Database className="h-4 w-4" />,
    api: <Link className="h-4 w-4" />,
    file_import: <FileText className="h-4 w-4" />,
  };

  const typeLabels = {
    social_media: 'Redes Sociales',
    scraper: 'Web Scraper',
    government: 'Gobierno',
    api: 'API',
    file_import: 'Importación de Archivo',
  };

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

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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

  // If no sources are available, show empty state
  if (!sources || sources.length === 0) {
    return (
      <div className="space-y-6">
        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Link className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Fuentes de Datos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestión de conexiones a APIs y servicios externos
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowNewSourceModal(true)}
              variant="primary"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Fuente
            </Button>
          </div>

          <div className="text-center py-12">
            <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay fuentes de datos configuradas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comienza conectando tu primera fuente de datos para recopilar información.
            </p>
            <Button
              onClick={() => setShowNewSourceModal(true)}
              variant="primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Fuente
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Link className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fuentes de Datos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestión de conexiones a APIs y servicios externos
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowNewSourceModal(true)}
            variant="primary"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Fuente
          </Button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Total Fuentes
              </h4>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {sources?.length || 0}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Conectadas
              </h4>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {sources?.filter(s => s.status === 'connected').length || 0}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Con Advertencias
              </h4>
              <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {sources?.filter(s => s.status === 'warning').length || 0}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Con Errores
              </h4>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                {sources?.filter(s => s.status === 'error').length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Data Sources Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Nombre
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Tipo
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Estado
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Última Sincronización
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Registros/Día
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Tasa de Error
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {sources?.map((source, index) => (
                <motion.tr
                  key={source.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedSource(selectedSource === source.id ? null : source.id)}
                  className={`border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer ${
                    selectedSource === source.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {typeIcons[source.type]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {source.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {source.targetSchema}.{source.targetTable}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    {typeLabels[source.type]}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {statusIcons[source.status]}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        statusColors[source.status]
                      }`}>
                        {statusLabels[source.status]}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(source.lastSync)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    {formatNumber(source.avgRecordsPerDay)}
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (source.errorRate || 0) < 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      (source.errorRate || 0) < 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {(source.errorRate || 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestConnection(source.id);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Probar conexión"
                      >
                        <CheckCircle className="h-4 w-4 text-gray-500" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefreshData(source.id);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Actualizar datos"
                      >
                        <RefreshCw className="h-4 w-4 text-gray-500" />
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
              )) || []}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected Source Details */}
      {selectedSource && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glass className="p-6">
            {(() => {
              const source = sources?.find(s => s.id === selectedSource);
              if (!source) return null;
              
              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {typeIcons[source.type]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {source.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {typeLabels[source.type]} - {source.targetSchema}.{source.targetTable}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visitar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Connection Details */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                        Detalles de Conexión
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {typeLabels[source.type]}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {statusLabels[source.status]}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Schema Destino:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {source.targetSchema}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Tabla Destino:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {source.targetTable}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Última Sincronización:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDate(source.lastSync)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Tasa de Error:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {(source.errorRate || 0).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Configuración:</span>
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-mono overflow-x-auto">
                            {JSON.stringify(source.config, null, 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Data Details */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                        Detalles de Datos
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Registros/Día:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatNumber(source.avgRecordsPerDay)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Tasa de Error:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {(source.errorRate || 0).toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Health Checks */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Verificaciones de Salud
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Conectividad</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            source.healthChecks.connectivity === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            source.healthChecks.connectivity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {source.healthChecks.connectivity === 'passed' ? 'Pasó' :
                             source.healthChecks.connectivity === 'warning' ? 'Advertencia' : 'Falló'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Autenticación</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            source.healthChecks.authentication === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            source.healthChecks.authentication === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {source.healthChecks.authentication === 'passed' ? 'Pasó' :
                             source.healthChecks.authentication === 'warning' ? 'Advertencia' : 'Falló'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Calidad de Datos</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            source.healthChecks.dataQuality === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            source.healthChecks.dataQuality === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {source.healthChecks.dataQuality === 'passed' ? 'Pasó' :
                             source.healthChecks.dataQuality === 'warning' ? 'Advertencia' : 'Falló'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Rendimiento</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            source.healthChecks.performance === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            source.healthChecks.performance === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {source.healthChecks.performance === 'passed' ? 'Pasó' :
                             source.healthChecks.performance === 'warning' ? 'Advertencia' : 'Falló'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>
        </motion.div>
      )}

      {/* New Source Modal */}
      {showNewSourceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Añadir Nueva Fuente de Datos
                </h3>
                <button
                  onClick={() => setShowNewSourceModal(false)}
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
                    placeholder="Nombre de la fuente"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option value="social_media">Redes Sociales</option>
                      <option value="scraper">Web Scraper</option>
                      <option value="government">Gobierno</option>
                      <option value="api">API</option>
                      <option value="file_import">Importación de Archivo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Schema Destino
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="raw_data"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tabla Destino
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="twitter_posts"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Configuración (JSON)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder='{"api_key": "YOUR_API_KEY", "endpoint": "https://api.example.com/data"}'
                  ></textarea>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowNewSourceModal(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Fuente
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};