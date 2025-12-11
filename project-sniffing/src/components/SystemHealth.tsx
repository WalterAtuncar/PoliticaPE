import React, { useState, useEffect } from 'react';
import { Server, Database, Wifi, Activity, HardDrive, Cpu, MemoryStick, AlertCircle } from 'lucide-react';

interface SystemHealthProps {
  isConnected: boolean;
}

interface HealthMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  unit: string;
  threshold: { warning: number; critical: number };
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  responseTime: number;
  lastCheck: Date;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ isConnected }) => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([
    { name: 'Uso de CPU', value: 23, status: 'healthy', unit: '%', threshold: { warning: 70, critical: 90 } },
    { name: 'Uso de Memoria', value: 45, status: 'healthy', unit: '%', threshold: { warning: 80, critical: 95 } },
    { name: 'Uso de Disco', value: 67, status: 'warning', unit: '%', threshold: { warning: 80, critical: 95 } },
    { name: 'E/S de Red', value: 12, status: 'healthy', unit: 'MB/s', threshold: { warning: 50, critical: 100 } },
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Servidor FastAPI', status: 'online', uptime: '99.8%', responseTime: 45, lastCheck: new Date() },
    { name: 'PostgreSQL', status: 'online', uptime: '99.9%', responseTime: 12, lastCheck: new Date() },
    { name: 'Caché Redis', status: 'online', uptime: '99.7%', responseTime: 3, lastCheck: new Date() },
    { name: 'Broker Kafka', status: 'online', uptime: '98.9%', responseTime: 89, lastCheck: new Date() },
    { name: 'Flujo de Twitter', status: 'online', uptime: '97.2%', responseTime: 156, lastCheck: new Date() },
    { name: 'Pipeline ML', status: 'degraded', uptime: '95.1%', responseTime: 234, lastCheck: new Date() },
  ]);

  const [systemLogs, setSystemLogs] = useState([
    { timestamp: new Date(), level: 'INFO', service: 'FastAPI', message: 'Verificación de salud completada exitosamente' },
    { timestamp: new Date(Date.now() - 30000), level: 'WARN', service: 'Pipeline ML', message: 'Alta latencia detectada en análisis de sentimiento' },
    { timestamp: new Date(Date.now() - 60000), level: 'INFO', service: 'Kafka', message: 'Tópico social_stream procesando normalmente' },
    { timestamp: new Date(Date.now() - 90000), level: 'ERROR', service: 'Flujo Twitter', message: 'Límite de tasa excedido, esperando 60s' },
    { timestamp: new Date(Date.now() - 120000), level: 'INFO', service: 'PostgreSQL', message: 'Limpieza de base de datos completada' },
  ]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      // Simular actualizaciones de métricas de salud en tiempo real
      setHealthMetrics(prev => prev.map(metric => {
        const variance = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, Math.min(100, metric.value + variance));
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        
        if (newValue >= metric.threshold.critical) status = 'critical';
        else if (newValue >= metric.threshold.warning) status = 'warning';
        
        return { ...metric, value: newValue, status };
      }));

      // Actualizar tiempos de respuesta de servicios
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(1, service.responseTime + (Math.random() - 0.5) * 20),
        lastCheck: new Date()
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-400 bg-green-900';
      case 'warning':
      case 'degraded':
        return 'text-yellow-400 bg-yellow-900';
      case 'critical':
      case 'offline':
        return 'text-red-400 bg-red-900';
      default:
        return 'text-gray-400 bg-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'saludable';
      case 'warning': return 'advertencia';
      case 'critical': return 'crítico';
      case 'online': return 'en línea';
      case 'offline': return 'fuera de línea';
      case 'degraded': return 'degradado';
      default: return status;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-blue-400';
      case 'WARN': return 'text-yellow-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'uso de cpu': return <Cpu className="h-5 w-5" />;
      case 'uso de memoria': return <MemoryStick className="h-5 w-5" />;
      case 'uso de disco': return <HardDrive className="h-5 w-5" />;
      case 'e/s de red': return <Wifi className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const overallHealth = services.filter(s => s.status === 'online').length / services.length;

  return (
    <div className="space-y-6">
      {/* Resumen del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Salud General</h3>
            <Server className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(overallHealth * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {services.filter(s => s.status === 'online').length}/{services.length} servicios en línea
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Tiempo de Respuesta Promedio</h3>
            <Activity className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(services.reduce((sum, s) => sum + s.responseTime, 0) / services.length)}ms
          </div>
          <div className="text-xs text-gray-400 mt-1">en todos los servicios</div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Alertas Activas</h3>
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {healthMetrics.filter(m => m.status !== 'healthy').length}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {healthMetrics.filter(m => m.status === 'critical').length} críticas
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Datos Procesados</h3>
            <Database className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">47.2GB</div>
          <div className="text-xs text-gray-400 mt-1">últimas 24 horas</div>
        </div>
      </div>

      {/* Métricas del Sistema */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Métricas del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthMetrics.map((metric) => (
            <div key={metric.name} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getMetricIcon(metric.name)}
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${getStatusColor(metric.status)}`}>
                  {getStatusText(metric.status)}
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>{metric.value.toFixed(1)}{metric.unit}</span>
                  <span className="text-gray-400">
                    {metric.unit === '%' ? '100%' : `${metric.threshold.critical}${metric.unit}`}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      metric.status === 'critical' ? 'bg-red-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (metric.value / (metric.unit === '%' ? 100 : metric.threshold.critical)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estado de Servicios */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Estado de Servicios</h3>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded text-sm ${getStatusColor(service.status)}`}>
                  {getStatusText(service.status)}
                </div>
                <div>
                  <h4 className="font-medium text-white">{service.name}</h4>
                  <p className="text-sm text-gray-400">
                    Tiempo activo: {service.uptime} • Respuesta: {service.responseTime}ms
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Última verificación: {service.lastCheck.toLocaleTimeString('es-ES')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registros del Sistema */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Registros Recientes del Sistema</h3>
        <div className="bg-gray-900 rounded p-4 font-mono text-sm max-h-64 overflow-y-auto">
          {systemLogs.map((log, index) => (
            <div key={index} className="mb-2">
              <span className="text-gray-400">[{log.timestamp.toLocaleTimeString('es-ES')}]</span>
              <span className={`ml-2 font-bold ${getLogLevelColor(log.level)}`}>{log.level}</span>
              <span className="ml-2 text-blue-400">{log.service}:</span>
              <span className="ml-2 text-gray-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;