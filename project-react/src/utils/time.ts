/**
 * El backend escribe en UTC (datetime.utcnow()) pero serializa sin sufijo de zona
 * ("2026-08-23T16:48:45.400865"). El navegador interpreta esa cadena como hora LOCAL,
 * asi que en Lima (UTC-5) toda fecha se adelanta 5 h y las noticias recientes quedan en
 * el futuro. Se marca como UTC cuando la cadena no trae zona propia.
 */
export function parseApiDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso);
  const d = new Date(hasZone || !iso.includes('T') ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "hace 5 min" / "hace 3 h" / "hace 2 d". Devuelve "" si no hay fecha valida. */
export function timeAgo(iso: string | null | undefined): string {
  const d = parseApiDate(iso);
  if (!d) return '';
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.round(mins / 60);
  return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} d`;
}

/**
 * Formatea una fecha suelta "YYYY-MM-DD" sin que la zona horaria la mueva un dia atras:
 * new Date("2026-08-23") es medianoche UTC, que en Lima es el 22 a las 19:00.
 */
export function formatDayMonth(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return '';
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', { day: '2-digit', month: 'long' });
}
