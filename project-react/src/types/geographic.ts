export interface GeographicFilters {
  timeRange: string;
  metric: string;
  level: 'department' | 'province' | 'district';
  selectedRegions: string[];
}

export interface GeographicMetric {
  regionId: string;
  name: string;
  level: 'department' | 'province' | 'district';
  population: number;
  voters: number;
  sentiment: number;
  engagement: number;
  mentions: number;
  shareOfVoice: number;
  participation: number;
  trend: number;
  ubigeo: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    UBIGEO: string;
    NOMBRE: string;
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}