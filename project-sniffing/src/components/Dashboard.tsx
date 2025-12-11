import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Users, MessageSquare } from 'lucide-react';
import LiveChart from './LiveChart';
import MetricsCard from './MetricsCard';

interface DashboardProps {
  isConnected: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isConnected }) => {
  const [metrics, setMetrics] = useState({
    totalStreams: 3,
    processedToday: 12847,
    avgSentiment: 0.42,
    crisisAlerts: 2,
    activeConnections: 156,
    trendingTopics: [
      { keyword: 'congreso', count: 847, sentiment: 0.23 },
      { keyword: 'dina boluarte', count: 623, sentiment: 0.31 },
      { keyword: 'elecciones', count: 445, sentiment: 0.67 },
      { keyword: 'protestas', count: 334, sentiment: 0.15 },
      { keyword: 'economia', count: 267, sentiment: 0.48 }
    ]
  });

  const [recentEvents, setRecentEvents] = useState([
    {
      id: '1',
      content: 'Nuevo pronunciamiento del Congreso sobre la situación económica nacional',
      sentiment: 0.25,
      timestamp: new Date(Date.now() - 5 * 60000),
      source: 'twitter',
      keywords: ['congreso', 'economia']
    },
    {
      id: '2', 
      content: 'Ciudadanos expresan opiniones sobre las próximas elecciones regionales',
      sentiment: 0.72,
      timestamp: new Date(Date.now() - 12 * 60000),
      source: 'twitter',
      keywords: ['elecciones', 'regionales']
    },
    {
      id: '3',
      content: 'Análisis de las medidas económicas implementadas por el gobierno',
      sentiment: 0.45,
      timestamp: new Date(Date.now() - 18 * 60000),
      source: 'noticias',
      keywords: ['gobierno', 'economia']
    }
  ]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      // Simular actualizaciones en tiempo real
      setMetrics(prev => ({
        ...prev,
        processedToday: prev.processedToday + Math.floor(Math.random() * 3),
        avgSentiment: Math.max(0, Math.min(1, prev.avgSentiment + (Math.random() - 0.5) * 0.02)),
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 5 - 2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment < 0.3) return 'text-red-400';
    if (sentiment < 0.6) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSentimentBg = (sentiment: number) => {
    if (sentiment < 0.3) return 'bg-red-900';
    if (sentiment < 0.6) return 'bg-yellow-900';
    return 'bg-green-900';
  };

  return (
    <div className="space-y-8">
      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Flujos Activos"
          value={metrics.totalStreams}
          icon={Activity}
          color="blue"
          trend="+2.1%"
        />
        
        <MetricsCard
          title="Procesados Hoy"
          value={metrics.processedToday.toLocaleString()}
          icon={MessageSquare}
          color="green"
          trend="+15.3%"
        />
        
        <MetricsCard
          title="Sentimiento Promedio"
          value={metrics.avgSentiment.toFixed(3)}
          icon={metrics.avgSentiment > 0.5 ? TrendingUp : TrendingDown}
          color={metrics.avgSentiment > 0.5 ? "green" : "red"}
          trend={metrics.avgSentiment > 0.5 ? "+4.2%" : "-2.1%"}
        />
        
        <MetricsCard
          title="Alertas de Crisis"
          value={metrics.crisisAlerts}
          icon={AlertTriangle}
          color="red"
          trend="0%"
        />
      </div>

      {/* Sección de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Línea de Tiempo de Sentimiento */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Línea de Tiempo de Sentimiento</h3>
          <LiveChart isConnected={isConnected} />
        </div>

        {/* Temas Tendencia */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Temas en Tendencia</h3>
          <div className="space-y-3">
            {metrics.trendingTopics.map((topic, index) => (
              <div key={topic.keyword} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-medium">{topic.keyword}</div>
                    <div className="text-sm text-gray-400">{topic.count} menciones</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getSentimentBg(topic.sentiment)} ${getSentimentColor(topic.sentiment)}`}>
                  {(topic.sentiment * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Eventos Recientes */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Eventos Políticos Recientes</h3>
        <div className="space-y-4">
          {recentEvents.map((event) => (
            <div key={event.id} className="border-l-4 border-blue-400 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-300">{event.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span>{event.source}</span>
                    <span>{event.timestamp.toLocaleTimeString()}</span>
                    <div className="flex space-x-1">
                      {event.keywords.map(keyword => (
                        <span key={keyword} className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentBg(event.sentiment)} ${getSentimentColor(event.sentiment)}`}>
                  {event.sentiment < 0.3 ? 'Negativo' : event.sentiment > 0.6 ? 'Positivo' : 'Neutral'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;