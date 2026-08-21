import React, { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { Layer, PathOptions } from 'leaflet';
import type { Feature, GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import limaGeo from '../../data/lima-distritos.geo.json';
import { DistrictStat } from '../../hooks/useTerritory';

export type MapMetric = 'mentions' | 'sentiment' | 'opportunity';

interface Props {
  districts: DistrictStat[];
  metric: MapMetric;
  selected?: string | null;
  onSelect?: (ubigeo: string) => void;
  scores?: Record<string, number>;
  height?: number;
  compact?: boolean;
}

const NEUTRAL = '#e5e7eb';

// Escalas de 5 pasos. Menciones y oportunidad son secuenciales; sentimiento es divergente.
const MENTION_SCALE = ['#e6f0f1', '#b7d6d9', '#7fb9bf', '#47969e', '#1F6B73'];
const OPPORTUNITY_SCALE = ['#faf0e0', '#f0d9b0', '#e0bc78', '#cf9a40', '#B8741A'];

function sentimentColor(net: number): string {
  if (net <= -0.4) return '#B4322B';
  if (net <= -0.12) return '#d98079';
  if (net < 0.12) return '#cbd5d8';
  if (net < 0.4) return '#79b894';
  return '#2E7D4F';
}

function stepColor(value: number, max: number, scale: string[]): string {
  if (!max || value <= 0) return NEUTRAL;
  const idx = Math.min(scale.length - 1, Math.floor((value / max) * scale.length));
  return scale[idx];
}

export const LimaMap: React.FC<Props> = ({
  districts, metric, selected, onSelect, scores, height = 520, compact = false,
}) => {
  const byUbigeo = useMemo(() => {
    const m: Record<string, DistrictStat> = {};
    districts.forEach(d => { m[d.ubigeo] = d; });
    return m;
  }, [districts]);

  const maxMentions = useMemo(() => Math.max(1, ...districts.map(d => d.mentions)), [districts]);
  const maxScore = useMemo(() => Math.max(1, ...Object.values(scores || {})), [scores]);

  const colorFor = (ubigeo: string): string => {
    const d = byUbigeo[ubigeo];
    if (metric === 'opportunity') return stepColor(scores?.[ubigeo] ?? 0, maxScore, OPPORTUNITY_SCALE);
    if (!d || d.mentions === 0) return NEUTRAL;
    if (metric === 'sentiment') return d.net_sentiment === null ? NEUTRAL : sentimentColor(d.net_sentiment);
    return stepColor(d.mentions, maxMentions, MENTION_SCALE);
  };

  const style = (feature?: Feature): PathOptions => {
    const ubigeo = String(feature?.properties?.UBIGEO || '');
    const isSelected = selected === ubigeo;
    return {
      fillColor: colorFor(ubigeo),
      weight: isSelected ? 3 : 1,
      color: isSelected ? '#111827' : '#94a3b8',
      fillOpacity: 0.78,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const ubigeo = String(feature.properties?.UBIGEO || '');
    const d = byUbigeo[ubigeo];
    const name = d?.name || String(feature.properties?.NOMBRE || '');
    const net = d?.net_sentiment;
    const score = scores?.[ubigeo];
    const rows = [
      `<strong>${name}</strong>`,
      d ? `${d.zone} · ${d.electors.toLocaleString('es-PE')} electores` : '',
      d ? `${d.mentions} menciones` : '',
      net !== null && net !== undefined ? `sentimiento neto ${net.toFixed(2)}` : '',
      score !== undefined ? `oportunidad ${score.toFixed(1)}` : '',
    ].filter(Boolean);
    layer.bindTooltip(rows.join('<br/>'), { sticky: true });
    if (onSelect) {
      layer.on('click', () => onSelect(ubigeo));
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60" style={{ height }}>
      <MapContainer
        center={[-12.02, -76.94]}
        zoom={compact ? 9 : 10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!compact}
        zoomControl={!compact}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <GeoJSON
          key={`${metric}-${districts.length}-${selected ?? ''}-${maxMentions}`}
          data={limaGeo as unknown as GeoJsonObject}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
};
