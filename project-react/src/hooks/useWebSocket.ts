import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, SocialPost } from '../types';
import { API_CONFIG, ENDPOINTS } from '../config/api';

interface WebSocketData {
  alerts: Alert[];
  posts: SocialPost[];
  metrics: Record<string, number>;
}

interface StreamData {
  stream_id: string;
  platform: string;
  content: string;
  realtime_sentiment: number;
  is_crisis_indicator: boolean;
  is_trending: boolean;
  detected_keywords: string[];
  political_entities: string[];
  detected_region: string | null;
  message_timestamp: string;
}

export const useWebSocket = () => {
  const [data, setData] = useState<WebSocketData>({
    alerts: [],
    posts: [],
    metrics: {},
  });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const wsUrl = `${API_CONFIG.SNIFFING_WS_URL}${ENDPOINTS.WEBSOCKET}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected to sniffing service');
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const streamData: StreamData = JSON.parse(event.data);
          
          if (streamData.is_crisis_indicator) {
            const newAlert: Alert = {
              id: streamData.stream_id,
              type: 'crisis',
              title: 'Alerta de Crisis Detectada',
              message: streamData.content.substring(0, 100),
              severity: 'high',
              timestamp: new Date(streamData.message_timestamp),
              isRead: false,
            };

            setData(prev => ({
              ...prev,
              alerts: [newAlert, ...prev.alerts.slice(0, 9)],
            }));
          }

          const sentimentType = streamData.realtime_sentiment > 0.1 ? 'positive' : 
                               streamData.realtime_sentiment < -0.1 ? 'negative' : 'neutral';

          const newPost: SocialPost = {
            id: streamData.stream_id,
            platform: streamData.platform as 'twitter' | 'facebook' | 'instagram',
            content: streamData.content,
            author: streamData.political_entities[0] || 'Análisis',
            engagement: Math.floor(Math.random() * 1000),
            sentiment: sentimentType,
            timestamp: new Date(streamData.message_timestamp),
            region: streamData.detected_region || 'Nacional',
          };

          setData(prev => ({
            ...prev,
            posts: [newPost, ...prev.posts.slice(0, 19)],
          }));
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.SNIFFING_BASE_URL}${ENDPOINTS.METRICS}`);
      if (response.ok) {
        const metricsData = await response.json();
        setData(prev => ({
          ...prev,
          metrics: {
            sentiment: 50 + (metricsData.avg_sentiment * 50),
            engagement: metricsData.processed_count,
            mentions: metricsData.trending_topics,
            reach: metricsData.active_streams * 1000,
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, []);

  useEffect(() => {
    connect();
    const metricsInterval = setInterval(fetchMetrics, 5000);
    fetchMetrics();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearInterval(metricsInterval);
    };
  }, [connect, fetchMetrics]);

  return { data, isConnected };
};
