import React, { useMemo } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { LimaMap } from '../territory/LimaMap';
import { DistrictStat } from '../../hooks/useTerritory';
import { LIMA_DISTRICTS, ZONES, Zone } from '../../data/limaDistricts';
import { parseTargetRegion } from '../../utils/targetRegion';
import { AIRecommendation } from '../../types/recommendations';

interface ImpactMapProps {
  recommendations: AIRecommendation[];
}

const AMBER = '#B8741A';
const TOP_DISTRICTS = 3;

export const ImpactMap: React.FC<ImpactMapProps> = ({ recommendations }) => {
  const { mapDistricts, zoneRows, topDistricts, metroCount, touched } = useMemo(() => {
    const byUbigeo: Record<string, number> = {};
    const byZone: Record<string, number> = {};
    let metro = 0;

    recommendations.forEach(rec => {
      const info = parseTargetRegion(rec.targetRegion);
      if (info.metroWide) metro += 1;
      info.districts.forEach(d => {
        byUbigeo[d.ubigeo] = (byUbigeo[d.ubigeo] || 0) + 1;
      });
      info.zones.forEach(z => {
        byZone[z] = (byZone[z] || 0) + 1;
      });
    });

    // LimaMap espera DistrictStat; aqui "mentions" son recomendaciones que tocan el distrito.
    const districts: DistrictStat[] = LIMA_DISTRICTS.map(d => ({
      ubigeo: d.ubigeo,
      name: d.name,
      zone: d.zone,
      electors: d.electors,
      mentions: byUbigeo[d.ubigeo] || 0,
      net_sentiment: null,
      top_topic: null,
      topics: {},
      figures: {},
    }));

    const rows = (ZONES as readonly Zone[])
      .map(z => ({ zone: z, count: byZone[z] || 0 }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count);

    const top = districts
      .filter(d => d.mentions > 0)
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, TOP_DISTRICTS);

    return {
      mapDistricts: districts,
      zoneRows: rows,
      topDistricts: top,
      metroCount: metro,
      touched: districts.filter(d => d.mentions > 0).length,
    };
  }, [recommendations]);

  const maxZone = zoneRows.length ? zoneRows[0].count : 1;

  return (
    <Card glass className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <MapIcon className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Mapa de impacto — Lima</h3>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {recommendations.length === 0
          ? 'Sin recomendaciones que mapear.'
          : `${touched} distritos tocados por ${recommendations.length} recomendaciones`}
      </p>

      {recommendations.length > 0 && (
        <>
          <LimaMap districts={mapDistricts} metric="mentions" height={260} zoom={10} compact />

          {metroCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {metroCount} {metroCount === 1 ? 'recomendación aplica' : 'recomendaciones aplican'} a
              toda Lima Metropolitana (no se pintan por distrito).
            </p>
          )}

          {zoneRows.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                Zonas con más trabajo
              </h4>
              <div className="space-y-1.5">
                {zoneRows.map(r => (
                  <div key={r.zone} className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 dark:text-gray-300 w-24 flex-shrink-0">
                      {r.zone}
                    </span>
                    <div className="flex-1 h-2 rounded bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded"
                        style={{ width: `${(r.count / maxZone) * 100}%`, backgroundColor: AMBER }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white w-4 text-right">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topDistricts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                Distritos más trabajados
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {topDistricts.map(d => (
                  <span
                    key={d.ubigeo}
                    className="text-[10px] rounded px-1.5 py-0.5 bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                  >
                    {d.name} · {d.mentions}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
