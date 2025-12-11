import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Pause, Play, Settings, RefreshCw } from 'lucide-react';

interface StreamMonitorProps {
  isConnected: boolean;
}

interface StreamData {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'error';
  messagesPerMin: number;
  latency: number;
  keywords: string[];
  lastMessage?: string;
  lastUpdate: Date;
}

const StreamMonitor: React.FC<StreamMonitorProps> = ({ isConnected }) => {
  const [streams, setStreams] = useState<StreamData[]>([
    {
      id: 'twitter-political',
      name: 'Flujo Político de Twitter',
      status: 'active',
      messagesPerMin: 45,
      latency: 125,
      keywords: ['congreso', 'presidente', 'elecciones', 'dina boluarte'],
      lastMessage: 'Nuevo pronunciamiento del Congreso sobre medidas económicas urgentes',
      lastUpdate: new Date()
    },
    {
      id: 'news-sentiment',
      name: 'Análisis de Sentimiento de Noticias',
      status: 'active',
      messagesPerMin: 12,
      latency: 89,
      keywords: ['política', 'gobierno', 'crisis', 'economía'],
      lastMessage: 'Análisis de impacto de nuevas políticas gubernamentales en sector privado',
      lastUpdate: new Date(Date.now() - 2 * 60000)
    },
    {
      id: 'crisis-detection',
      name: 'Flujo de Detección de Crisis',
      status: 'paused',
      messagesPerMin: 0,
      latency: 0,
      keywords: ['protesta', 'violencia', 'emergencia', 'alerta'],
      lastUpdate: new Date(Date.now() - 15 * 60000)
    }
  ]);

  const [selectedStream, setSelectedStream] = useState<string>('twitter-political');

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setStreams(prev => prev.map(stream => {
        if (stream.status === 'active') {
          return {
            ...stream,
            messagesPerMin: Math.max(0, stream.messagesPerMin + Math.floor(Math.random() * 10 - 5)),
            latency: Math.max(50, stream.latency + Math.floor(Math.random() * 40 - 20)),
            lastUpdate: new Date()
          };
        }
        return stream;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900';
      case 'paused': return 'text-yellow-400 bg-yellow-900';
      case 'error': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Wifi className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'error': return <WifiOff className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'activo';
      case 'paused': return 'pausado';
      case 'error': return 'error';
      default: return 'desconocido';
    }
  };

  const toggleStreamStatus = (streamId: string) => {
    setStreams(prev => prev.map(stream => {
      if (stream.id === streamId) {
        const newStatus = stream.status === 'active' ? 'paused' : 'active';
        return { ...stream, status: newStatus };
      }
      return stream;
    }));
  };

  const selectedStreamData = streams.find(s => s.id === selectedStream);

  return (
    <div className="space-y-6">
      {/* Resumen de Flujos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {streams.map((stream) => (
          <div 
            key={stream.id}
            className={`bg-gray-800 rounded-lg border border-gray-700 p-6 cursor-pointer transition-all hover:border-gray-600 ${
              selectedStream === stream.id ? 'ring-2 ring-blue-400' : ''
            }`}
            onClick={() => setSelectedStream(stream.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">{stream.name}</h3>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor(stream.status)}`}>
                {getStatusIcon(stream.status)}
                <span className="capitalize">{getStatusText(stream.status)}</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Mensajes/min:</span>
                <span className="text-white font-medium">{stream.messagesPerMin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Latencia:</span>
                <span className="text-white font-medium">{stream.latency}ms</span>
              </div>
              <div className="text-gray-400">
                Última actualización: {stream.lastUpdate.toLocaleTimeString('es-ES')}
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStreamStatus(stream.id);
                }}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-xs transition-colors ${
                  stream.status === 'active' 
                    ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800' 
                    : 'bg-green-900 text-green-300 hover:bg-green-800'
                }`}
              >
                {stream.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span>{stream.status === 'active' ? 'Pausar' : 'Iniciar'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Detallada del Flujo */}
      {selectedStreamData && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">{selectedStreamData.name} - Detalles</h3>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                <Settings className="h-4 w-4" />
                <span>Configurar</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors">
                <RefreshCw className="h-4 w-4" />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuración del Flujo */}
            <div>
              <h4 className="text-lg font-medium mb-4">Configuración</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Palabras Clave</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedStreamData.keywords.map((keyword) => (
                      <span key={keyword} className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Métricas de Rendimiento</label>
                  <div className="bg-gray-700 rounded p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Tasa de Procesamiento:</span>
                      <span className="font-medium">{selectedStreamData.messagesPerMin} msg/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latencia Promedio:</span>
                      <span className="font-medium">{selectedStreamData.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiempo de Actividad:</span>
                      <span className="font-medium text-green-400">99.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes en Vivo */}
            <div>
              <h4 className="text-lg font-medium mb-4">Feed de Mensajes en Vivo</h4>
              <div className="bg-gray-900 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
                {selectedStreamData.status === 'active' ? (
                  <div className="space-y-2">
                    <div className="text-green-400">[{new Date().toLocaleTimeString('es-ES')}] Flujo activo</div>
                    <div className="text-blue-400">[{new Date(Date.now() - 30000).toLocaleTimeString('es-ES')}] Procesando: "Congreso debate nuevas medidas económicas"</div>
                    <div className="text-yellow-400">[{new Date(Date.now() - 45000).toLocaleTimeString('es-ES')}] Sentimiento: 0.234 (Negativo)</div>
                    <div className="text-blue-400">[{new Date(Date.now() - 60000).toLocaleTimeString('es-ES')}] Procesando: "Presidente anuncia reformas estructurales"</div>
                    <div className="text-yellow-400">[{new Date(Date.now() - 75000).toLocaleTimeString('es-ES')}] Sentimiento: 0.678 (Positivo)</div>
                    <div className="text-green-400">[{new Date(Date.now() - 90000).toLocaleTimeString('es-ES')}] Mensaje Kafka enviado al tópico social_stream</div>
                    {selectedStreamData.lastMessage && (
                      <div className="text-white">
                        [{selectedStreamData.lastUpdate.toLocaleTimeString('es-ES')}] Último: "{selectedStreamData.lastMessage}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    El flujo está {getStatusText(selectedStreamData.status)}. No hay datos en vivo disponibles.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamMonitor;