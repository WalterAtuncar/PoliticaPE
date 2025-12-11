import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';

interface SentimentAnalysisProps {
  isConnected: boolean;
}

interface SentimentData {
  timestamp: Date;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ isConnected }) => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('6h');
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [currentSentiment, setCurrentSentiment] = useState({
    positive: 28,
    negative: 45,
    neutral: 27,
    trend: -2.3
  });

  const [topicAnalysis, setTopicAnalysis] = useState([
    { topic: 'Congreso Nacional', positive: 15, negative: 78, neutral: 7, total: 1247 },
    { topic: 'Política Económica', positive: 32, negative: 41, neutral: 27, total: 892 },
    { topic: 'Dina Boluarte', positive: 23, negative: 52, neutral: 25, total: 734 },
    { topic: 'Elecciones 2026', positive: 67, negative: 18, neutral: 15, total: 543 },
    { topic: 'Reformas Sociales', positive: 45, negative: 31, neutral: 24, total: 389 }
  ]);

  useEffect(() => {
    // Generar datos de sentimiento de muestra
    const generateData = (hours: number) => {
      const data: SentimentData[] = [];
      const now = new Date();
      
      for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        const total = 800 + Math.random() * 400;
        const positive = Math.random() * 0.4 + 0.1;
        const negative = Math.random() * 0.5 + 0.2;
        const neutral = 1 - positive - negative;
        
        data.push({
          timestamp,
          positive: Math.round(total * positive),
          negative: Math.round(total * negative),
          neutral: Math.round(total * neutral),
          total: Math.round(total)
        });
      }
      
      return data;
    };

    const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : timeRange === '24h' ? 24 : 168;
    setSentimentData(generateData(hours));
  }, [timeRange]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setCurrentSentiment(prev => ({
        positive: Math.max(0, Math.min(100, prev.positive + (Math.random() - 0.5) * 4)),
        negative: Math.max(0, Math.min(100, prev.negative + (Math.random() - 0.5) * 4)),
        neutral: Math.max(0, Math.min(100, prev.neutral + (Math.random() - 0.5) * 2)),
        trend: (Math.random() - 0.5) * 6
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getSentimentColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      case 'neutral': return 'bg-yellow-500';
    }
  };

  const getTopicSentimentColor = (positive: number, negative: number) => {
    if (positive > negative + 10) return 'border-l-green-500';
    if (negative > positive + 10) return 'border-l-red-500';
    return 'border-l-yellow-500';
  };

  const timeRangeLabels = {
    '1h': '1 hora',
    '6h': '6 horas',
    '24h': '24 horas',
    '7d': '7 días'
  };

  return (
    <div className="space-y-6">
      {/* Selector de Rango de Tiempo */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Análisis de Sentimiento</h2>
        <div className="flex space-x-2">
          {(['1h', '6h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {timeRangeLabels[range]}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen de Sentimiento Actual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Positivo</h3>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            {currentSentiment.positive.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentSentiment.positive}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Negativo</h3>
            <TrendingDown className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400 mb-2">
            {currentSentiment.negative.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentSentiment.negative}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Neutral</h3>
            <BarChart3 className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {currentSentiment.neutral.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentSentiment.neutral}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tendencia</h3>
            <PieChart className="h-5 w-5 text-blue-400" />
          </div>
          <div className={`text-3xl font-bold mb-2 ${
            currentSentiment.trend > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {currentSentiment.trend > 0 ? '+' : ''}{currentSentiment.trend.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">vs última hora</div>
        </div>
      </div>

      {/* Gráfico de Línea de Tiempo de Sentimiento */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Línea de Tiempo de Sentimiento</h3>
        <div className="h-64 relative">
          <svg width="100%" height="100%" viewBox="0 0 800 240" className="text-gray-400">
            {/* Cuadrícula */}
            <defs>
              <pattern id="sentiment-grid" width="80" height="24" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sentiment-grid)" />
            
            {/* Áreas de Sentimiento */}
            {sentimentData.length > 1 && (
              <g>
                {/* Área positiva */}
                <path
                  d={`M 0 240 ${sentimentData.map((d, i) => 
                    `L ${(i / (sentimentData.length - 1)) * 800} ${240 - (d.positive / d.total) * 200}`
                  ).join(' ')} L 800 240 Z`}
                  fill="rgb(34, 197, 94)"
                  opacity="0.3"
                />
                
                {/* Área negativa */}
                <path
                  d={`M 0 240 ${sentimentData.map((d, i) => 
                    `L ${(i / (sentimentData.length - 1)) * 800} ${240 - ((d.positive + d.negative) / d.total) * 200}`
                  ).join(' ')} L 800 240 Z`}
                  fill="rgb(239, 68, 68)"
                  opacity="0.3"
                />
                
                {/* Líneas */}
                <path
                  d={`M ${sentimentData.map((d, i) => 
                    `${i === 0 ? 'M' : 'L'} ${(i / (sentimentData.length - 1)) * 800} ${240 - (d.positive / d.total) * 200}`
                  ).join(' ')}`}
                  fill="none"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="2"
                />
                
                <path
                  d={`M ${sentimentData.map((d, i) => 
                    `${i === 0 ? 'M' : 'L'} ${(i / (sentimentData.length - 1)) * 800} ${240 - (d.negative / d.total) * 200}`
                  ).join(' ')}`}
                  fill="none"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>
        
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Positivo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Negativo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Neutral</span>
          </div>
        </div>
      </div>

      {/* Análisis de Sentimiento por Tema */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Sentimiento por Tema</h3>
        <div className="space-y-4">
          {topicAnalysis.map((topic) => (
            <div key={topic.topic} className={`border-l-4 pl-4 py-3 ${getTopicSentimentColor(topic.positive, topic.negative)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{topic.topic}</h4>
                <span className="text-sm text-gray-400">{topic.total} mensajes</span>
              </div>
              
              <div className="flex space-x-4 text-sm mb-2">
                <span className="text-green-400">{topic.positive}% positivo</span>
                <span className="text-red-400">{topic.negative}% negativo</span>
                <span className="text-yellow-400">{topic.neutral}% neutral</span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 flex overflow-hidden">
                <div 
                  className="bg-green-500 h-2"
                  style={{ width: `${topic.positive}%` }}
                />
                <div 
                  className="bg-red-500 h-2"
                  style={{ width: `${topic.negative}%` }}
                />
                <div 
                  className="bg-yellow-500 h-2"
                  style={{ width: `${topic.neutral}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;