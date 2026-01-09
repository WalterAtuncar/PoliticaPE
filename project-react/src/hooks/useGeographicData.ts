import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../config/api';

interface RegionData {
  id: string;
  name: string;
  sentiment: number;
  mentions: number;
  engagement: number;
  population: number;
}

interface ProvinceData {
  name: string;
  sentiment: number;
  mentions: number;
  districts: number;
}

interface GeographicData {
  regions: RegionData[];
  selectedRegionProvinces: ProvinceData[];
  totalRegions: number;
  activeRegions: number;
  totalPopulation: number;
  coveredPopulation: number;
  leadingRegion: RegionData | null;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

const PERU_REGIONS_REFERENCE: { id: string; name: string; population: number }[] = [
  { id: '010000', name: 'Amazonas', population: 426806 },
  { id: '020000', name: 'Áncash', population: 1180638 },
  { id: '030000', name: 'Apurímac', population: 430736 },
  { id: '040000', name: 'Arequipa', population: 1382730 },
  { id: '050000', name: 'Ayacucho', population: 668213 },
  { id: '060000', name: 'Cajamarca', population: 1453711 },
  { id: '070000', name: 'Callao', population: 1129854 },
  { id: '080000', name: 'Cusco', population: 1357075 },
  { id: '090000', name: 'Huancavelica', population: 365317 },
  { id: '100000', name: 'Huánuco', population: 760267 },
  { id: '110000', name: 'Ica', population: 850765 },
  { id: '120000', name: 'Junín', population: 1361467 },
  { id: '130000', name: 'La Libertad', population: 1905301 },
  { id: '140000', name: 'Lambayeque', population: 1310785 },
  { id: '150000', name: 'Lima', population: 10628470 },
  { id: '160000', name: 'Loreto', population: 1049364 },
  { id: '170000', name: 'Madre de Dios', population: 173811 },
  { id: '180000', name: 'Moquegua', population: 192740 },
  { id: '190000', name: 'Pasco', population: 271904 },
  { id: '200000', name: 'Piura', population: 2047954 },
  { id: '210000', name: 'Puno', population: 1237997 },
  { id: '220000', name: 'San Martín', population: 899648 },
  { id: '230000', name: 'Tacna', population: 370974 },
  { id: '240000', name: 'Tumbes', population: 251521 },
  { id: '250000', name: 'Ucayali', population: 589110 },
];

export const useGeographicData = (periodDays: number = 7): GeographicData => {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [selectedRegionProvinces, setSelectedRegionProvinces] = useState<ProvinceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}/api/v1/analysis/geographic?period_days=${periodDays}`);
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.geographic_distribution && Object.keys(data.geographic_distribution).length > 0) {
        const transformedRegions: RegionData[] = PERU_REGIONS_REFERENCE.map(region => {
          const backendData = data.geographic_distribution[region.name];
          return {
            id: region.id,
            name: region.name,
            population: region.population,
            sentiment: backendData?.sentiment ?? 0,
            mentions: backendData?.mentions ?? 0,
            engagement: backendData?.engagement ?? 0,
          };
        }).filter(r => r.mentions > 0);
        
        setRegions(transformedRegions);
        setHasData(transformedRegions.length > 0);

        if (data.provinces) {
          setSelectedRegionProvinces(data.provinces);
        }
      } else {
        setRegions([]);
        setHasData(false);
      }

    } catch (err) {
      console.error('Error fetching geographic data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setRegions([]);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  }, [periodDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeRegions = regions.length;
  const totalPopulation = PERU_REGIONS_REFERENCE.reduce((sum, r) => sum + r.population, 0);
  const coveredPopulation = regions.reduce((sum, r) => sum + r.population, 0);
  const leadingRegion = regions.length > 0 ? [...regions].sort((a, b) => b.sentiment - a.sentiment)[0] : null;

  return {
    regions,
    selectedRegionProvinces,
    totalRegions: PERU_REGIONS_REFERENCE.length,
    activeRegions,
    totalPopulation,
    coveredPopulation,
    leadingRegion,
    isLoading,
    error,
    hasData,
  };
};
