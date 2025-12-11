import { GeographicMetric, GeoJSONData } from '../types/geographic';

// Simplified GeoJSON data for Peru departments (mock data)
export const peruGeoData = {
  departments: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { UBIGEO: '150000', NOMBRE: 'Lima' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-77.2, -11.8], [-76.8, -11.8], [-76.8, -12.2], [-77.2, -12.2], [-77.2, -11.8]]]
        }
      },
      {
        type: 'Feature',
        properties: { UBIGEO: '040000', NOMBRE: 'Arequipa' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-72.5, -15.8], [-72.1, -15.8], [-72.1, -16.2], [-72.5, -16.2], [-72.5, -15.8]]]
        }
      },
      {
        type: 'Feature',
        properties: { UBIGEO: '080000', NOMBRE: 'Cusco' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-72.2, -13.2], [-71.8, -13.2], [-71.8, -13.6], [-72.2, -13.6], [-72.2, -13.2]]]
        }
      },
      {
        type: 'Feature',
        properties: { UBIGEO: '130000', NOMBRE: 'La Libertad' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-79.2, -7.8], [-78.8, -7.8], [-78.8, -8.2], [-79.2, -8.2], [-79.2, -7.8]]]
        }
      },
      {
        type: 'Feature',
        properties: { UBIGEO: '200000', NOMBRE: 'Piura' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-81.2, -4.8], [-80.8, -4.8], [-80.8, -5.2], [-81.2, -5.2], [-81.2, -4.8]]]
        }
      },
      {
        type: 'Feature',
        properties: { UBIGEO: '210000', NOMBRE: 'Puno' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-70.2, -15.2], [-69.8, -15.2], [-69.8, -15.6], [-70.2, -15.6], [-70.2, -15.2]]]
        }
      },
      {
        type: 'Feature',
        properties: { UBIGEO: '110000', NOMBRE: 'Ica' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-76.2, -13.8], [-75.8, -13.8], [-75.8, -14.2], [-76.2, -14.2], [-76.2, -13.8]]]
        }
      },
      {
        type: 'Feature',
        properties: { UBIGEO: '220000', NOMBRE: 'San Martín' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[-77.2, -6.2], [-76.8, -6.2], [-76.8, -6.6], [-77.2, -6.6], [-77.2, -6.2]]]
        }
      }
    ]
  } as GeoJSONData,
  provinces: {
    type: 'FeatureCollection',
    features: []
  } as GeoJSONData,
  districts: {
    type: 'FeatureCollection',
    features: []
  } as GeoJSONData
};

export const mockGeographicMetrics: GeographicMetric[] = [
  {
    regionId: '150000',
    name: 'Lima',
    level: 'department',
    population: 10628470,
    voters: 7850000,
    sentiment: 0.15,
    engagement: 8.9,
    mentions: 4520,
    shareOfVoice: 35.2,
    participation: 78.5,
    trend: 0.08,
    ubigeo: '150000'
  },
  {
    regionId: '040000',
    name: 'Arequipa',
    level: 'department',
    population: 1382730,
    voters: 1020000,
    sentiment: 0.28,
    engagement: 7.2,
    mentions: 1180,
    shareOfVoice: 8.9,
    participation: 82.1,
    trend: 0.12,
    ubigeo: '040000'
  },
  {
    regionId: '080000',
    name: 'Cusco',
    level: 'department',
    population: 1357075,
    voters: 980000,
    sentiment: 0.34,
    engagement: 6.8,
    mentions: 1250,
    shareOfVoice: 9.5,
    participation: 75.8,
    trend: 0.15,
    ubigeo: '080000'
  },
  {
    regionId: '130000',
    name: 'La Libertad',
    level: 'department',
    population: 1905301,
    voters: 1420000,
    sentiment: -0.12,
    engagement: 6.1,
    mentions: 980,
    shareOfVoice: 7.4,
    participation: 73.2,
    trend: -0.08,
    ubigeo: '130000'
  },
  {
    regionId: '200000',
    name: 'Piura',
    level: 'department',
    population: 2047954,
    voters: 1520000,
    sentiment: 0.08,
    engagement: 5.9,
    mentions: 750,
    shareOfVoice: 5.7,
    participation: 71.5,
    trend: 0.05,
    ubigeo: '200000'
  },
  {
    regionId: '210000',
    name: 'Puno',
    level: 'department',
    population: 1237997,
    voters: 920000,
    sentiment: -0.05,
    engagement: 5.2,
    mentions: 650,
    shareOfVoice: 4.9,
    participation: 69.8,
    trend: -0.03,
    ubigeo: '210000'
  },
  {
    regionId: '110000',
    name: 'Ica',
    level: 'department',
    population: 850765,
    voters: 630000,
    sentiment: 0.22,
    engagement: 6.5,
    mentions: 580,
    shareOfVoice: 4.4,
    participation: 76.3,
    trend: 0.09,
    ubigeo: '110000'
  },
  {
    regionId: '220000',
    name: 'San Martín',
    level: 'department',
    population: 899648,
    voters: 670000,
    sentiment: 0.18,
    engagement: 5.8,
    mentions: 420,
    shareOfVoice: 3.2,
    participation: 68.9,
    trend: 0.06,
    ubigeo: '220000'
  }
];