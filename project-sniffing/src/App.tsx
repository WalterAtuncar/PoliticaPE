import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, TrendingUp, Users, Globe, Database, Wifi } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StreamMonitor from './components/StreamMonitor';
import SentimentAnalysis from './components/SentimentAnalysis';
import CrisisAlerts from './components/CrisisAlerts';
import SystemHealth from './components/SystemHealth';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('conectando');

  useEffect(() => {
    // Simular conexión WebSocket
    const timer = setTimeout(() => {
      setIsConnected(true);
      setConnectionStatus('conectado');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Panel Principal', icon: Activity },
    { id: 'streams', label: 'Monitor de Flujos', icon: Wifi },
    { id: 'sentiment', label: 'Análisis de Sentimiento', icon: TrendingUp },
    { id: 'alerts', label: 'Alertas de Crisis', icon: AlertTriangle },
    { id: 'health', label: 'Estado del Sistema', icon: Database },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard isConnected={isConnected} />;
      case 'streams':
        return <StreamMonitor isConnected={isConnected} />;
      case 'sentiment':
        return <SentimentAnalysis isConnected={isConnected} />;
      case 'alerts':
        return <CrisisAlerts isConnected={isConnected} />;
      case 'health':
        return <SystemHealth isConnected={isConnected} />;
      default:
        return <Dashboard isConnected={isConnected} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Encabezado */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Globe className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">Monitor de Datos Políticos</h1>
                <p className="text-sm text-gray-400">Análisis de sentimiento político en tiempo real</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-yellow-400'
                } animate-pulse`} />
                <span className="capitalize">{connectionStatus}</span>
              </div>
              
              <div className="text-sm text-gray-400">
                Flujo Político Perú
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;