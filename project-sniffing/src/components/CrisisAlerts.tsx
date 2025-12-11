import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Clock, CheckCircle, XCircle, Bell, Activity, TrendingUp } from 'lucide-react';

interface CrisisAlertsProps {
  isConnected: boolean;
}

interface Alert {
  id: string;
  type: 'crisis' | 'trend' | 'spike' | 'anomaly';
  severity: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  keywords: string[];
  timestamp: Date;
  resolved: boolean;
  confidence: number;
  relatedMessages: number;
}

const CrisisAlerts: React.FC<CrisisAlertsProps> = ({ isConnected }) => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'crisis',
      severity: 4,
      title: 'Pico de Tensión Política Detectado',
      description: 'Aumento significativo en el sentimiento negativo respecto a decisiones del congreso, con menciones de protestas y disturbios civiles.',
      keywords: ['protesta', 'congreso', 'tension', 'manifestacion'],
      timestamp: new Date(Date.now() - 15 * 60000),
      resolved: false,
      confidence: 0.87,
      relatedMessages: 234
    },
    {
      id: '2',
      type: 'trend',
      severity: 2,
      title: 'Tema Político Emergente',
      description: 'Nuevo tema en tendencia detectado: "reforma judicial" ganando tracción rápida en plataformas de redes sociales.',
      keywords: ['reforma judicial', 'justicia', 'corte suprema'],
      timestamp: new Date(Date.now() - 45 * 60000),
      resolved: false,
      confidence: 0.72,
      relatedMessages: 89
    },
    {
      id: '3',
      type: 'spike',
      severity: 3,
      title: 'Anomalía de Sentimiento',
      description: 'Patrón de sentimiento inusual detectado para "política económica" - cambio rápido de neutral a negativo.',
      keywords: ['economia', 'inflacion', 'gobierno'],
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      resolved: true,
      confidence: 0.65,
      relatedMessages: 156
    }
  ]);

  const [filterSeverity, setFilterSeverity] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      // Simular nuevas alertas ocasionalmente
      if (Math.random() < 0.1) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: ['crisis', 'trend', 'spike', 'anomaly'][Math.floor(Math.random() * 4)] as Alert['type'],
          severity: (Math.floor(Math.random() * 5) + 1) as Alert['severity'],
          title: 'Nueva Alerta Detectada',
          description: 'Detección en tiempo real de evento político significativo o cambio de sentimiento.',
          keywords: ['nuevo', 'evento', 'politico'],
          timestamp: new Date(),
          resolved: false,
          confidence: 0.5 + Math.random() * 0.4,
          relatedMessages: Math.floor(Math.random() * 300) + 20
        };
        
        setAlerts(prev => [newAlert, ...prev]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return 'text-blue-400 bg-blue-900';
      case 2: return 'text-green-400 bg-green-900';
      case 3: return 'text-yellow-400 bg-yellow-900';
      case 4: return 'text-orange-400 bg-orange-900';
      case 5: return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getSeverityText = (severity: number) => {
    switch (severity) {
      case 1: return 'Muy Baja';
      case 2: return 'Baja';
      case 3: return 'Media';
      case 4: return 'Alta';
      case 5: return 'Crítica';
      default: return 'Desconocida';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crisis': return <AlertTriangle className="h-5 w-5" />;
      case 'trend': return <TrendingUp className="h-5 w-5" />;
      case 'spike': return <Activity className="h-5 w-5" />;
      case 'anomaly': return <Shield className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'crisis': return 'crisis';
      case 'trend': return 'tendencia';
      case 'spike': return 'pico';
      case 'anomaly': return 'anomalía';
      default: return 'desconocido';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity && alert.severity !== filterSeverity) return false;
    if (filterType && alert.type !== filterType) return false;
    if (!showResolved && alert.resolved) return false;
    return true;
  });

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const avgSeverity = activeAlerts.length > 0 
    ? activeAlerts.reduce((sum, a) => sum + a.severity, 0) / activeAlerts.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Panel de Resumen de Crisis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Alertas Activas</h3>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{activeAlerts.length}</div>
          <div className="text-xs text-gray-400 mt-1">
            {alerts.filter(a => a.severity >= 4 && !a.resolved).length} críticas
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Severidad Promedio</h3>
            <Shield className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{avgSeverity.toFixed(1)}</div>
          <div className="text-xs text-gray-400 mt-1">
            {getSeverityText(Math.round(avgSeverity))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Tiempo de Respuesta</h3>
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">2.4m</div>
          <div className="text-xs text-gray-400 mt-1">resolución promedio</div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Estado del Sistema</h3>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">Saludable</div>
          <div className="text-xs text-gray-400 mt-1">monitoreo activo</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-400">Severidad:</label>
            <select 
              value={filterSeverity || ''} 
              onChange={(e) => setFilterSeverity(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option value="">Todas</option>
              <option value="1">Muy Baja</option>
              <option value="2">Baja</option>
              <option value="3">Media</option>
              <option value="4">Alta</option>
              <option value="5">Crítica</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-400">Tipo:</label>
            <select 
              value={filterType || ''} 
              onChange={(e) => setFilterType(e.target.value || null)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option value="">Todos</option>
              <option value="crisis">Crisis</option>
              <option value="trend">Tendencia</option>
              <option value="spike">Pico</option>
              <option value="anomaly">Anomalía</option>
            </select>
          </div>

          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-400">Mostrar resueltas</span>
          </label>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${
              alert.resolved ? 'opacity-60' : ''
            } ${alert.severity >= 4 ? 'ring-1 ring-red-500' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded ${getSeverityColor(alert.severity)}`}>
                  {getTypeIcon(alert.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="capitalize">{getTypeText(alert.type)}</span>
                    <span>Severidad: {getSeverityText(alert.severity)}</span>
                    <span>Confianza: {(alert.confidence * 100).toFixed(0)}%</span>
                    <span>{alert.relatedMessages} mensajes</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">
                  {alert.timestamp.toLocaleString('es-ES')}
                </span>
                {alert.resolved ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <XCircle className="h-5 w-5 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-300 mb-4">{alert.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {alert.keywords.map((keyword) => (
                  <span 
                    key={keyword} 
                    className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              
              {!alert.resolved && (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
                >
                  Marcar como Resuelta
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay alertas que coincidan con los filtros actuales.</p>
        </div>
      )}
    </div>
  );
};

export default CrisisAlerts;