// Generado desde project-scrapping/app/data/lima_districts.json (padron Reniec 2026).
// No editar a mano: regenerar si cambia el gazetteer.

export interface LimaDistrict {
  ubigeo: string;
  name: string;
  zone: string;
  electors: number;
}

export const ZONES = ['Lima Norte', 'Lima Este', 'Lima Centro', 'Lima Moderna', 'Lima Sur'] as const;
export type Zone = (typeof ZONES)[number];

export const LIMA_DISTRICTS: LimaDistrict[] = [
  { ubigeo: '150101', name: "Cercado de Lima", zone: 'Lima Centro', electors: 263000 },
  { ubigeo: '150102', name: "Ancón", zone: 'Lima Norte', electors: 45700 },
  { ubigeo: '150103', name: "Ate", zone: 'Lima Este', electors: 494341 },
  { ubigeo: '150104', name: "Barranco", zone: 'Lima Moderna', electors: 34300 },
  { ubigeo: '150105', name: "Breña", zone: 'Lima Centro', electors: 91500 },
  { ubigeo: '150106', name: "Carabayllo", zone: 'Lima Norte', electors: 274500 },
  { ubigeo: '150107', name: "Chaclacayo", zone: 'Lima Este', electors: 40000 },
  { ubigeo: '150108', name: "Chorrillos", zone: 'Lima Sur', electors: 308800 },
  { ubigeo: '150109', name: "Cieneguilla", zone: 'Lima Este', electors: 34300 },
  { ubigeo: '150110', name: "Comas", zone: 'Lima Norte', electors: 452492 },
  { ubigeo: '150111', name: "El Agustino", zone: 'Lima Este', electors: 183000 },
  { ubigeo: '150112', name: "Independencia", zone: 'Lima Norte', electors: 205900 },
  { ubigeo: '150113', name: "Jesús María", zone: 'Lima Moderna', electors: 80100 },
  { ubigeo: '150114', name: "La Molina", zone: 'Lima Moderna', electors: 148700 },
  { ubigeo: '150115', name: "La Victoria", zone: 'Lima Centro', electors: 183000 },
  { ubigeo: '150116', name: "Lince", zone: 'Lima Moderna', electors: 57200 },
  { ubigeo: '150117', name: "Los Olivos", zone: 'Lima Norte', electors: 343100 },
  { ubigeo: '150118', name: "Lurigancho-Chosica", zone: 'Lima Este', electors: 205900 },
  { ubigeo: '150119', name: "Lurín", zone: 'Lima Sur', electors: 80100 },
  { ubigeo: '150120', name: "Magdalena del Mar", zone: 'Lima Moderna', electors: 62900 },
  { ubigeo: '150121', name: "Pueblo Libre", zone: 'Lima Moderna', electors: 85800 },
  { ubigeo: '150122', name: "Miraflores", zone: 'Lima Moderna', electors: 102900 },
  { ubigeo: '150123', name: "Pachacámac", zone: 'Lima Sur', electors: 102900 },
  { ubigeo: '150124', name: "Pucusana", zone: 'Lima Sur', electors: 13700 },
  { ubigeo: '150125', name: "Puente Piedra", zone: 'Lima Norte', electors: 285900 },
  { ubigeo: '150126', name: "Punta Hermosa", zone: 'Lima Sur', electors: 9100 },
  { ubigeo: '150127', name: "Punta Negra", zone: 'Lima Sur', electors: 8000 },
  { ubigeo: '150128', name: "Rímac", zone: 'Lima Centro', electors: 171600 },
  { ubigeo: '150129', name: "San Bartolo", zone: 'Lima Sur', electors: 8000 },
  { ubigeo: '150130', name: "San Borja", zone: 'Lima Moderna', electors: 114400 },
  { ubigeo: '150131', name: "San Isidro", zone: 'Lima Moderna', electors: 68600 },
  { ubigeo: '150132', name: "San Juan de Lurigancho", zone: 'Lima Este', electors: 823056 },
  { ubigeo: '150133', name: "San Juan de Miraflores", zone: 'Lima Sur', electors: 365920 },
  { ubigeo: '150134', name: "San Luis", zone: 'Lima Centro', electors: 62900 },
  { ubigeo: '150135', name: "San Martín de Porres", zone: 'Lima Norte', electors: 538911 },
  { ubigeo: '150136', name: "San Miguel", zone: 'Lima Moderna', electors: 148700 },
  { ubigeo: '150137', name: "Santa Anita", zone: 'Lima Este', electors: 194400 },
  { ubigeo: '150138', name: "Santa María del Mar", zone: 'Lima Sur', electors: 1700 },
  { ubigeo: '150139', name: "Santa Rosa", zone: 'Lima Norte', electors: 22900 },
  { ubigeo: '150140', name: "Santiago de Surco", zone: 'Lima Moderna', electors: 343100 },
  { ubigeo: '150141', name: "Surquillo", zone: 'Lima Moderna', electors: 102900 },
  { ubigeo: '150142', name: "Villa El Salvador", zone: 'Lima Sur', electors: 366000 },
  { ubigeo: '150143', name: "Villa María del Triunfo", zone: 'Lima Sur', electors: 371159 },
];

export const TOTAL_ELECTORS = LIMA_DISTRICTS.reduce((s, d) => s + d.electors, 0);

export const DISTRICT_BY_UBIGEO: Record<string, LimaDistrict> = Object.fromEntries(
  LIMA_DISTRICTS.map(d => [d.ubigeo, d])
);

export const ZONE_COLORS: Record<string, string> = {
  'Lima Norte': '#1F6B73',
  'Lima Este': '#B8741A',
  'Lima Centro': '#6A1B9A',
  'Lima Moderna': '#2E7D4F',
  'Lima Sur': '#B4322B',
};
