import React, { useState, useEffect } from 'react';

interface LiveChartProps {
  isConnected: boolean;
}

const LiveChart: React.FC<LiveChartProps> = ({ isConnected }) => {
  const [data, setData] = useState<Array<{ time: string; sentiment: number; volume: number }>>([]);

  useEffect(() => {
    // Inicializar con algunos datos
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString('es-ES', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      sentiment: 0.3 + Math.random() * 0.4,
      volume: 20 + Math.random() * 80
    }));
    setData(initialData);
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('es-ES', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          sentiment: Math.max(0, Math.min(1, 0.3 + Math.random() * 0.4)),
          volume: 20 + Math.random() * 80
        };
        
        const newData = [...prev.slice(-19), newPoint];
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const maxSentiment = Math.max(...data.map(d => d.sentiment));
  const minSentiment = Math.min(...data.map(d => d.sentiment));
  const maxVolume = Math.max(...data.map(d => d.volume));

  const getSentimentY = (sentiment: number) => {
    const normalized = (sentiment - minSentiment) / (maxSentiment - minSentiment || 1);
    return 160 - (normalized * 120); // 160 es la altura del gráfico, 120 es la altura utilizable
  };

  const getVolumeHeight = (volume: number) => {
    return (volume / maxVolume) * 120;
  };

  const sentimentPath = data.reduce((path, point, index) => {
    const x = (index / (data.length - 1)) * 400; // 400 es el ancho del gráfico
    const y = getSentimentY(point.sentiment);
    return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');

  return (
    <div className="relative">
      <svg width="100%" height="200" viewBox="0 0 400 200" className="text-gray-400">
        {/* Líneas de cuadrícula */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Barras de volumen */}
        {data.map((point, index) => (
          <rect
            key={`vol-${index}`}
            x={(index / (data.length - 1)) * 400 - 8}
            y={180 - getVolumeHeight(point.volume)}
            width="16"
            height={getVolumeHeight(point.volume)}
            fill="rgb(59, 130, 246)"
            opacity="0.3"
          />
        ))}
        
        {/* Línea de sentimiento */}
        <path
          d={sentimentPath}
          fill="none"
          stroke="rgb(34, 197, 94)"
          strokeWidth="2"
          className="animate-pulse"
        />
        
        {/* Puntos de datos */}
        {data.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={(index / (data.length - 1)) * 400}
            cy={getSentimentY(point.sentiment)}
            r="3"
            fill="rgb(34, 197, 94)"
            className={index === data.length - 1 ? 'animate-pulse' : ''}
          />
        ))}
        
        {/* Indicador de tiempo actual */}
        <line
          x1="380"
          y1="20"
          x2="380"
          y2="180"
          stroke="rgb(239, 68, 68)"
          strokeWidth="1"
          strokeDasharray="5,5"
          opacity="0.5"
        />
      </svg>
      
      {/* Leyenda */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Puntuación de Sentimiento</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 opacity-50 rounded"></div>
            <span>Volumen de Mensajes</span>
          </div>
        </div>
        <div className="text-xs">
          Último: {data[data.length - 1]?.sentiment.toFixed(3) || '0.000'}
        </div>
      </div>
    </div>
  );
};

export default LiveChart;