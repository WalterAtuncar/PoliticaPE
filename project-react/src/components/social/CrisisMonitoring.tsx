import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  TrendingUp, 
  MessageSquare,
  Heart,
  Share,
  Eye,
  CheckCircle,
  X,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CrisisAlert, SocialFilters } from '../../types/social';

interface CrisisMonitoringProps {
  alerts: CrisisAlert[];
  isLoading: boolean;
  filters: SocialFilters;
}

const priorityColors = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
};

const priorityLabels = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

const statusColors = {
  active: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  monitoring: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

const statusLabels = {
  active: 'Activa',
  monitoring: 'En monitoreo',
  resolved: 'Resuelta',
  archived: 'Archivada',
};

export const CrisisMonitoring: React.FC<CrisisMonitoringProps> = ({
  alerts,
  isLoading,
  filters,
}) => {
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesPriority && matchesStatus;
  });

  const selectedAlertData = selectedAlert 
    ? alerts.find(a => a.id === selectedAlert) 
    : null;

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
      {/* Header Controls */}
      <Card glass className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monitoreo de Crisis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {alerts.filter(a => a.status === 'active').length} crisis activas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">Todas las prioridades</option>
              <option value="critical">Crítico</option>
              <option value="high">Alto</option>
              <option value="medium">Medio</option>
              <option value="low">Bajo</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="monitoring">En monitoreo</option>
              <option value="resolved">Resueltas</option>
              <option value="archived">Archivadas</option>
            </select>

            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant="outline"
              size="sm"
            >
              {autoRefresh ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Reanudar
                </>
              )}
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Crisis Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crisis Alerts List */}
        <div className="lg:col-span-2">
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Alertas de Crisis
            </h3>
            
            <div className="space-y-4">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
                    className={`p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border-l-4 ${
                      alert.priority === 'critical' ? 'border-red-500' :
                      alert.priority === 'high' ? 'border-orange-500' :
                      alert.priority === 'medium' ? 'border-yellow-500' :
                      'border-blue-500'
                    } hover:shadow-md transition-shadow cursor-pointer ${
                      selectedAlert === alert.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {alert.title}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[alert.priority]}`}>
                            {priorityLabels[alert.priority]}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[alert.status]}`}>
                            {statusLabels[alert.status]}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(alert.detectedAt)}</span>
                          </div>
                          <span>•</span>
                          <span>{alert.region}</span>
                          <span>•</span>
                          <span>{alert.platform}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {alert.status === 'active' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        {alert.status === 'monitoring' && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3 text-red-500" />
                          <span>Volumen: +{alert.metrics.volumeChange}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3 text-red-500" />
                          <span>Sentiment: {alert.metrics.sentiment.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {alert.status === 'active' && (
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Requiere acción
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No hay alertas de crisis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No hay alertas que coincidan con los filtros seleccionados
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setPriorityFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Crisis Details */}
        <div>
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Detalles de Crisis
            </h3>
            
            {selectedAlertData ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedAlertData.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[selectedAlertData.priority]}`}>
                        {priorityLabels[selectedAlertData.priority]}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {selectedAlertData.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Detectado:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedAlertData.detectedAt.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Región:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedAlertData.region}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Plataforma:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedAlertData.platform}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {statusLabels[selectedAlertData.status]}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h4 className="font-medium text-red-900 dark:text-red-300">
                      Métricas de Crisis
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-red-800 dark:text-red-400">Volumen:</span>
                      <p className="font-medium text-red-900 dark:text-red-300">
                        +{selectedAlertData.metrics.volumeChange}% en {selectedAlertData.metrics.timeWindow}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-red-800 dark:text-red-400">Sentiment:</span>
                      <p className="font-medium text-red-900 dark:text-red-300">
                        {selectedAlertData.metrics.sentiment.toFixed(2)} ({selectedAlertData.metrics.sentimentChange > 0 ? '+' : ''}{selectedAlertData.metrics.sentimentChange.toFixed(2)})
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-red-800 dark:text-red-400">Alcance:</span>
                      <p className="font-medium text-red-900 dark:text-red-300">
                        {(selectedAlertData.metrics.reach / 1000).toFixed(1)}K personas
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-red-800 dark:text-red-400">Velocidad:</span>
                      <p className="font-medium text-red-900 dark:text-red-300">
                        {selectedAlertData.metrics.velocity} menciones/min
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-red-800 dark:text-red-400 text-sm">Keywords detectadas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAlertData.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-medium text-blue-900 dark:text-blue-300">
                      Protocolo de Respuesta
                    </h4>
                  </div>
                  
                  <div className="space-y-3 text-sm text-blue-800 dark:text-blue-400">
                    <div className="flex items-start space-x-2">
                      <span className="font-medium">Nivel de escalamiento:</span>
                      <span>{selectedAlertData.responseProtocol?.escalationLevel}</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <span className="font-medium">Tiempo de respuesta:</span>
                      <span>{selectedAlertData.responseProtocol?.responseTime}</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <span className="font-medium">Responsable:</span>
                      <span>{selectedAlertData.responseProtocol?.responsible}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">Acciones recomendadas:</span>
                      <ul className="mt-1 space-y-1">
                        {selectedAlertData.responseProtocol?.recommendedActions.map((action, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {selectedAlertData.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Monitorear
                      </Button>
                    )}
                    
                    {(selectedAlertData.status === 'active' || selectedAlertData.status === 'monitoring') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolver
                      </Button>
                    )}
                    
                    {selectedAlertData.status === 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Archivar
                      </Button>
                    )}
                  </div>
                  
                  <Button variant="primary" size="sm">
                    Ver Plan de Respuesta
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Selecciona una alerta
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Haz clic en una alerta para ver detalles y opciones de respuesta
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Crisis Response Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Plantillas de Respuesta a Crisis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Respuesta a Desinformación',
                description: 'Plantilla para responder a información falsa sobre propuestas políticas',
                tags: ['Desinformación', 'Fact-checking', 'Respuesta rápida'],
                priority: 'high',
              },
              {
                title: 'Gestión de Crisis Mediática',
                description: 'Protocolo para manejar crisis de imagen en medios tradicionales',
                tags: ['Medios', 'Imagen', 'Comunicación'],
                priority: 'critical',
              },
              {
                title: 'Contención de Shitstorm',
                description: 'Estrategia para contener crisis virales en redes sociales',
                tags: ['Viral', 'Contención', 'Redes sociales'],
                priority: 'high',
              },
              {
                title: 'Respuesta a Ataques Políticos',
                description: 'Guía para responder a ataques directos de opositores políticos',
                tags: ['Ataques', 'Oposición', 'Defensa'],
                priority: 'medium',
              },
              {
                title: 'Comunicación de Emergencia',
                description: 'Protocolo para comunicación durante situaciones de emergencia nacional',
                tags: ['Emergencia', 'Nacional', 'Coordinación'],
                priority: 'critical',
              },
              {
                title: 'Aclaración de Declaraciones',
                description: 'Plantilla para aclarar declaraciones malinterpretadas o sacadas de contexto',
                tags: ['Aclaración', 'Contexto', 'Declaraciones'],
                priority: 'medium',
              },
            ].map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {template.title}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    priorityColors[template.priority as keyof typeof priorityColors]
                  }`}>
                    {priorityLabels[template.priority as keyof typeof priorityLabels]}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {template.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  Ver Plantilla
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};