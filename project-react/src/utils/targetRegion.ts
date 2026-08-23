import { LIMA_DISTRICTS, ZONES, LimaDistrict, Zone } from '../data/limaDistricts';

/**
 * El backend entrega `target_region` como texto libre con la forma
 * "Zona, Distrito, Distrito, ..." (p. ej. "Lima Este, San Juan de Lurigancho, Ate"),
 * o "Lima Metropolitana, ..." cuando la recomendacion aplica a toda la ciudad.
 * Este parser lo resuelve contra el catalogo real de 43 distritos y 5 zonas.
 */
export interface TargetRegionInfo {
  zones: Zone[];
  districts: LimaDistrict[];
  metroWide: boolean;
  unmatched: string[];
}

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const DISTRICT_BY_NORM = new Map(LIMA_DISTRICTS.map(d => [norm(d.name), d]));
const ZONE_BY_NORM = new Map(ZONES.map(z => [norm(z), z]));
const METRO = norm('Lima Metropolitana');

/**
 * `target_region` es varchar(100) en la base y el generador la desborda: el ultimo nombre
 * llega cortado ("... Santiago de Sur" por "Santiago de Surco"). Solo se acepta el prefijo
 * cuando es el ultimo fragmento (el unico que puede truncarse), tiene al menos 5 caracteres
 * y resuelve a un unico distrito; asi no se confunden distritos de nombre parecido.
 */
function districtByTruncatedName(part: string): LimaDistrict | undefined {
  if (part.length < 5) return undefined;
  const hits = LIMA_DISTRICTS.filter(d => norm(d.name).startsWith(part));
  return hits.length === 1 ? hits[0] : undefined;
}

export function parseTargetRegion(target: string | null | undefined): TargetRegionInfo {
  const info: TargetRegionInfo = { zones: [], districts: [], metroWide: false, unmatched: [] };
  if (!target) return info;

  const seenZones = new Set<string>();
  const seenDistricts = new Set<string>();

  const addZone = (z: Zone) => {
    if (!seenZones.has(z)) {
      seenZones.add(z);
      info.zones.push(z);
    }
  };

  const parts = target.split(',');
  for (let i = 0; i < parts.length; i += 1) {
    const raw = parts[i];
    const part = norm(raw);
    if (!part) continue;
    const isLast = i === parts.length - 1;

    if (part === METRO) {
      info.metroWide = true;
      continue;
    }

    const zone = ZONE_BY_NORM.get(part);
    if (zone) {
      addZone(zone);
      continue;
    }

    const district = DISTRICT_BY_NORM.get(part) ?? (isLast ? districtByTruncatedName(part) : undefined);
    if (district) {
      if (!seenDistricts.has(district.ubigeo)) {
        seenDistricts.add(district.ubigeo);
        info.districts.push(district);
      }
      addZone(district.zone as Zone);
      continue;
    }

    info.unmatched.push(raw.trim());
  }

  return info;
}

/**
 * Filtro por zona de la pantalla de recomendaciones. Una recomendacion que aplica a toda
 * Lima Metropolitana aparece bajo cualquier zona: no es de ninguna en particular, es de todas.
 */
export function matchesZone(target: string | null | undefined, filter: string): boolean {
  if (filter === 'all') return true;
  const info = parseTargetRegion(target);
  if (filter === 'metro') return info.metroWide;
  return info.metroWide || info.zones.includes(filter as Zone);
}
