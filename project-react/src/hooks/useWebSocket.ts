import { useState, useEffect, useCallback } from 'react';
import { Alert, SocialPost } from '../types';

interface WebSocketData {
  alerts: Alert[];
  posts: SocialPost[];
  metrics: Record<string, number>;
}

export const useWebSocket = () => {
  const [data, setData] = useState<WebSocketData>({
    alerts: [],
    posts: [],
    metrics: {},
  });
  const [isConnected, setIsConnected] = useState(false);

  const simulateRealtimeData = useCallback(() => {
    // Simulate new alert
    if (Math.random() > 0.95) {
      const newAlert: Alert = {
        id: Date.now().toString(),
        type: ['crisis', 'trend', 'mention', 'sentiment'][Math.floor(Math.random() * 4)] as Alert['type'],
        title: 'Nueva actividad detectada',
        message: 'Incremento significativo en menciones políticas en Lima',
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as Alert['severity'],
        timestamp: new Date(),
        isRead: false,
      };

      setData(prev => ({
        ...prev,
        alerts: [newAlert, ...prev.alerts.slice(0, 9)],
      }));
    }

    // Simulate new social post
    if (Math.random() > 0.9) {
      const newPost: SocialPost = {
        id: Date.now().toString(),
        platform: ['twitter', 'facebook', 'instagram'][Math.floor(Math.random() * 3)] as SocialPost['platform'],
        content: 'Nueva propuesta política genera debate en redes sociales...',
        author: `Usuario${Math.floor(Math.random() * 1000)}`,
        engagement: Math.floor(Math.random() * 1000),
        sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as SocialPost['sentiment'],
        timestamp: new Date(),
        region: 'Lima',
      };

      setData(prev => ({
        ...prev,
        posts: [newPost, ...prev.posts.slice(0, 19)],
      }));
    }

    // Update metrics
    setData(prev => ({
      ...prev,
      metrics: {
        sentiment: 65 + Math.random() * 10,
        engagement: 1250 + Math.random() * 100,
        mentions: 850 + Math.random() * 50,
        reach: 15600 + Math.random() * 500,
      },
    }));
  }, []);

  useEffect(() => {
    setIsConnected(true);
    const interval = setInterval(simulateRealtimeData, 3000);
    
    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [simulateRealtimeData]);

  return { data, isConnected };
};