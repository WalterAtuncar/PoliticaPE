# Guía de Integración WebSocket (Frontend)

## Objetivo

Sustituir los datos simulados del monitoreo en tiempo real por una conexión WebSocket al microservicio de streaming, manteniendo estabilidad, reconexión y métricas de latencia.

Contexto actual:

- Hook con mocks: `project-react/src/hooks/useRealtimeData.ts:222-321`.
- WebSocket del microservicio: `GET /ws` publicado en `http://localhost:8000` (`project-sniffing/microservice/README.md:74-75`).
- Almacenamiento en tiempo real: `db/ddl_postgres.sql:104-139`.

## Endpoint y Protocolo

- Desarrollo: `ws://localhost:8000/ws`.
- Producción: usar `wss://` detrás de proxy TLS.
- Mensajes JSON enriquecidos con campos compatibles con `realtime_data.live_streams` y el modelo de UI.

### Esquema de mensaje sugerido

```json
{
  "stream_id": "uuid",
  "platform": "twitter|facebook|instagram|youtube",
  "stream_type": "post|comment|video|news",
  "content": "texto del mensaje",
  "author_handle": "@usuario",
  "author_name": "Nombre",
  "immediate_likes": 123,
  "immediate_comments": 45,
  "immediate_shares": 67,
  "realtime_sentiment": 0.23,
  "sentiment_confidence": 0.87,
  "political_relevance_score": 0.72,
  "urgency_score": 0.35,
  "is_trending": true,
  "is_crisis_indicator": false,
  "is_opportunity": true,
  "detected_region": "Lima",
  "location_confidence": 0.65,
  "hashtags": ["ReformaTributaria"],
  "detected_keywords": ["congreso"],
  "political_entities": ["Congreso de la República"],
  "message_timestamp": "2025-12-11T12:34:56Z",
  "processing_latency_ms": 85
}
```

## Paso a Paso (Hook de datos en tiempo real)

1. Crear un nuevo hook `useRealtimeStreamData.ts` que gestione la conexión WebSocket, reconexión con backoff y actualización de estado de monitoreo.
2. Mapear el mensaje JSON a los tipos existentes (`SocialPost`, `Alert`, etc.).
3. Sustituir el uso de `useRealtimeData` por el nuevo hook en `MonitoringPage.tsx`.

### Ejemplo de implementación del hook

```ts
import { useEffect, useRef, useState } from 'react';
import { SocialPost, SentimentData, HashtagData, MentionData, InfluencerData, DetectedEvent, MonitoringFilters } from '../types/monitoring';

interface RealtimeData {
  socialPosts: SocialPost[];
  alerts: DetectedEvent[]; // reutilizamos DetectedEvent para eventos/alertas
  mentions: MentionData[];
  hashtags: HashtagData[];
  news: { id: string; title: string; summary: string; source: string; timestamp: Date; engagement: number; sentiment: number; impact: number; isBreaking: boolean; tags: string[] }[];
  sentiment: SentimentData;
  influencers: InfluencerData[];
  events: DetectedEvent[];
  isConnected: boolean;
  latency: number;
  lastUpdate: Date;
}

export const useRealtimeStreamData = (filters: MonitoringFilters): RealtimeData => {
  const [data, setData] = useState<RealtimeData>({
    socialPosts: [], alerts: [], mentions: [], hashtags: [], news: [],
    sentiment: { national: 0, trend: 0, regional: [] }, influencers: [], events: [],
    isConnected: false, latency: 0, lastUpdate: new Date()
  });

  const wsRef = useRef<WebSocket | null>(null);
  const lastPingRef = useRef<number>(0);
  const retryRef = useRef<number>(0);

  useEffect(() => {
    const url = process.env.NODE_ENV === 'production' ? 'wss://tu-dominio/ws' : 'ws://localhost:8000/ws';
    wsRef.current = new WebSocket(url);
    lastPingRef.current = Date.now();

    wsRef.current.onopen = () => {
      setData(prev => ({ ...prev, isConnected: true }));
      retryRef.current = 0;
      // opcional: enviar filtros iniciales
      wsRef.current?.send(JSON.stringify({ type: 'subscribe', filters }));
    };

    wsRef.current.onmessage = (evt) => {
      const now = Date.now();
      const payload = JSON.parse(evt.data);

      const newPost: SocialPost = {
        id: payload.stream_id ?? String(now),
        platform: payload.platform,
        content: payload.content,
        author: payload.author_handle ?? payload.author_name ?? 'desconocido',
        authorAvatar: undefined,
        timestamp: new Date(payload.message_timestamp ?? now),
        likes: payload.immediate_likes ?? 0,
        comments: payload.immediate_comments ?? 0,
        shares: payload.immediate_shares ?? 0,
        engagement: (payload.immediate_likes + payload.immediate_comments + payload.immediate_shares) / 100 || 0,
        sentiment: payload.realtime_sentiment > 0.1 ? 'positive' : (payload.realtime_sentiment < -0.1 ? 'negative' : 'neutral'),
        region: payload.detected_region ?? 'all',
        hashtags: payload.hashtags ?? [],
        mentions: payload.political_entities ?? [],
        reach: 0,
        influence: 0,
        isViral: payload.is_trending ?? false
      };

      setData(prev => ({
        ...prev,
        socialPosts: [newPost, ...prev.socialPosts].slice(0, 50),
        latency: now - lastPingRef.current,
        lastUpdate: new Date()
      }));
    };

    wsRef.current.onclose = () => {
      setData(prev => ({ ...prev, isConnected: false }));
      // reconexión exponencial con jitter
      retryRef.current = Math.min(retryRef.current + 1, 6);
      const backoff = Math.pow(2, retryRef.current) * 500 + Math.random() * 300;
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          wsRef.current = null; // se recreará por el efecto
        }
      }, backoff);
    };

    wsRef.current.onerror = () => {
      wsRef.current?.close();
    };

    const pingInterval = setInterval(() => { lastPingRef.current = Date.now(); }, 1000);

    return () => {
      clearInterval(pingInterval);
      wsRef.current?.close();
      wsRef.current = null;
      setData(prev => ({ ...prev, isConnected: false }));
    };
  }, [filters.platforms?.join(','), filters.regions?.join(','), filters.keywords?.join(','), filters.timeRange]);

  return data;
};
```

## Integración en el Frontend

- Cambiar el import en `MonitoringPage.tsx`:

```ts
// import { useRealtimeData } from '../../hooks/useRealtimeData';
import { useRealtimeStreamData as useRealtimeData } from '../../hooks/useRealtimeStreamData';
```

- Mantener la misma API de retorno para minimizar cambios.
- Enviar filtros activos al servidor tras `onopen` y cuando cambien.

## Consideraciones de Producción

- TLS y `wss://` detrás de reverse proxy.
- Autenticación (token en query o header vía upgrade) si se requiere.
- Backpressure: limitar tamaño de buffers y frecuencia de mensajes.
- Observabilidad: exponer métricas y latencias en el frontend y servidor.

## Fallback

- Si el WebSocket falla, recuperar datos vía REST:
  - Estadísticas: `GET /api/v1/stats` (`project-scrapping/app/api/endpoints/data.py:94-116`).
  - Feeds: `GET /api/v1/data/social`, `GET /api/v1/data/news`.

