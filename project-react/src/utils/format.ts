const ES = 'es-PE';

export const fmtInt = (n: number): string => Math.round(n).toLocaleString(ES);

export const fmtPct = (n: number, d = 1): string =>
  n.toLocaleString(ES, { minimumFractionDigits: d, maximumFractionDigits: d });

export const fmtSignedPts = (n: number, d = 1): string => (n > 0 ? '+' : '') + fmtPct(n, d);
