import { PoliticalMetric, GeographicData, SocialPost, Campaign, Alert } from '../types';

export const mockMetrics: PoliticalMetric[] = [
  {
    id: '1',
    name: 'Sentimiento Positivo',
    value: 68,
    change: 5.2,
    trend: 'up',
    period: 'Últimas 24h',
  },
  {
    id: '2',
    name: 'Menciones Sociales',
    value: 12847,
    change: -2.1,
    trend: 'down',
    period: 'Esta semana',
  },
  {
    id: '3',
    name: 'Engagement Político',
    value: 8.9,
    change: 12.5,
    trend: 'up',
    period: 'Este mes',
  },
  {
    id: '4',
    name: 'Alcance Total',
    value: 245680,
    change: 8.7,
    trend: 'up',
    period: 'Últimas 24h',
  },
];

export const mockGeographicData: GeographicData[] = [
  {
    ubigeo: '150000',
    region: 'Lima',
    sentiment: { positive: 45, negative: 25, neutral: 30, total: 100 },
    engagement: 8.9,
    mentions: 4520,
  },
  {
    ubigeo: '080000',
    region: 'Cusco',
    sentiment: { positive: 52, negative: 18, neutral: 30, total: 100 },
    engagement: 7.2,
    mentions: 1250,
  },
  {
    ubigeo: '130000',
    region: 'La Libertad',
    sentiment: { positive: 38, negative: 32, neutral: 30, total: 100 },
    engagement: 6.8,
    mentions: 980,
  },
  {
    ubigeo: '040000',
    region: 'Arequipa',
    sentiment: { positive: 42, negative: 28, neutral: 30, total: 100 },
    engagement: 7.5,
    mentions: 1180,
  },
];

export const mockSocialPosts: SocialPost[] = [
  {
    id: '1',
    platform: 'twitter',
    content: 'Nueva propuesta de reforma tributaria genera debate en el Congreso #PolíticaPerú',
    author: '@AnalisisPolitico',
    engagement: 245,
    sentiment: 'neutral',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    region: 'Lima',
  },
  {
    id: '2',
    platform: 'facebook',
    content: 'Ciudadanos de Arequipa se pronuncian sobre las nuevas medidas económicas',
    author: 'Radio Local Arequipa',
    engagement: 128,
    sentiment: 'negative',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    region: 'Arequipa',
  },
  {
    id: '3',
    platform: 'instagram',
    content: 'Jóvenes cusqueños organizan foro político para discutir el futuro de la región',
    author: '@juventudcusco',
    engagement: 89,
    sentiment: 'positive',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    region: 'Cusco',
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Campaña Digital Q4',
    status: 'active',
    budget: 50000,
    spent: 32500,
    roi: 2.4,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    metrics: mockMetrics.slice(0, 2),
  },
  {
    id: '2',
    name: 'Análisis Regional Norte',
    status: 'completed',
    budget: 25000,
    spent: 24800,
    roi: 1.8,
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-12-31'),
    metrics: mockMetrics.slice(2, 4),
  },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'crisis',
    title: 'Alerta de Crisis',
    message: 'Incremento significativo en sentimiento negativo en Lima Metropolitana',
    severity: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    isRead: false,
  },
  {
    id: '2',
    type: 'trend',
    title: 'Tendencia Emergente',
    message: 'Nuevo hashtag #ReformaEducativa está ganando tracción',
    severity: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    isRead: false,
  },
  {
    id: '3',
    type: 'mention',
    title: 'Pico de Menciones',
    message: 'Aumento del 150% en menciones sobre política económica',
    severity: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 40),
    isRead: true,
  },
];