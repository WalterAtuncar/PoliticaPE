import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BarChart3, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../../config/api';

interface ResultsList {
  list_name: string;
  votes: number;
  pct_valid: number;
}

interface ResultsZone {
  zone: string;
  votes: number;
  winner: string;
  winner_pct: number;
}

export interface ResultsDistrict {
  ubigeo: string;
  name: string;
  zone: string;
  votes: number;
  winner: string | null;
  winner_pct: number;
  lists: Record<string, number>;
}

interface Summary {
  source: string;
  total_votes: number;
  actas_pct: number | null;
  lists: ResultsList[];
  zones: ResultsZone[];
  districts: ResultsDistrict[];
}

interface VsOpportunityRow {
  ubigeo: string;
  name: string;
  zone: string;
  score: number;
  score_rank: number;
  own_pct: number;
  winner: string | null;
  won: boolean;
}

interface VsOpportunity {
  own_list: string | null;
  spearman: number | null;
  won_districts: number;
  districts: VsOpportunityRow[];
}

interface Props {
  onDistrictsLoaded?: (districts: ResultsDistrict[]) => void;
}

const fmt = (n: number) => n.toLocaleString('es-PE');

export const ResultsPanel: React.FC<Props> = ({ onDistrictsLoaded }) => {
  const [sources, setSources] = useState<{ source: string; rows: number }[]>([]);
  const [source, setSource] = useState('onpe');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [vs, setVs] = useState<VsOpportunity | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const headers = getAuthHeaders();
    const b = API_CONFIG.SCRAPPING_BASE_URL;
    const sRes = await fetch(`${b}${ENDPOINTS.RESULTS}/sources`, { headers });
    if (sRes.ok) {
      const list = (await sRes.json()).sources || [];
      setSources(list);
      if (list.length && !list.some((x: { source: string }) => x.source === source)) {
        setSource(list[0].source);
        return;
      }
    }
    const res = await fetch(`${b}${ENDPOINTS.RESULTS}?source=${source}`, { headers });
    if (res.ok) {
      const j: Summary = await res.json();
      setSummary(j);
      onDistrictsLoaded?.(j.districts || []);
    }
    const vRes = await fetch(`${b}${ENDPOINTS.RESULTS_VS_OPPORTUNITY}?source=${source}`, { headers });
    setVs(vRes.ok ? await vRes.json() : null);
  }, [source, onDistrictsLoaded]);

  useEffect(() => { load(); }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.RESULTS_UPLOAD}?source=${source}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.detail || 'No se pudo cargar el CSV');
      toast.success(j.detail);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setUploading(false);
    }
  };

  const input = 'px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Resultados por distrito</h3>
            {summary?.actas_pct !== null && summary?.actas_pct !== undefined && (
              <span className="text-xs text-gray-500 dark:text-gray-400">actas {summary.actas_pct}%</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select className={input} value={source} onChange={e => setSource(e.target.value)}>
              {sources.length === 0 && <option value="onpe">onpe</option>}
              {sources.map(s => <option key={s.source} value={s.source}>{s.source} ({s.rows})</option>)}
            </select>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => e.target.files?.[0] && upload(e.target.files[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-2.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              Cargar CSV
            </button>
          </div>
        </div>

        {!summary || summary.total_votes === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sin resultados cargados para «{source}». Sube un CSV con columnas
            <code className="mx-1 text-xs">ubigeo, distrito, lista, votos, pct_validos, actas_pct</code>
            o espera la carga automática de ONPE.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 tabular-nums">
              {fmt(summary.total_votes)} votos en {summary.districts.length} distritos
            </p>
            <div className="space-y-1.5 mb-4">
              {summary.lists.slice(0, 8).map(l => (
                <div key={l.list_name}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-700 dark:text-gray-200">{l.list_name}</span>
                    <span className="tabular-nums text-gray-500 dark:text-gray-400">{l.pct_valid}% · {fmt(l.votes)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${l.pct_valid}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left font-medium py-1">Zona</th>
                    <th className="text-right font-medium py-1">Votos</th>
                    <th className="text-left font-medium py-1 pl-3">Ganador</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.zones.map(z => (
                    <tr key={z.zone} className="border-b border-gray-100 dark:border-gray-700/60">
                      <td className="py-1 text-gray-700 dark:text-gray-200">{z.zone}</td>
                      <td className="py-1 text-right tabular-nums text-gray-600 dark:text-gray-300">{fmt(z.votes)}</td>
                      <td className="py-1 pl-3 text-gray-700 dark:text-gray-200">{z.winner} ({z.winner_pct}%)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {vs && vs.districts?.length > 0 && (
        <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Oportunidad vs. resultado</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Spearman {vs.spearman ?? '—'} · {vs.won_districts} distritos ganados
              {vs.own_list ? ` · lista ${vs.own_list}` : ''}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">
            Correlación entre el ranking de oportunidad y el porcentaje obtenido: cerca de 1 significa que
            invertimos donde efectivamente rendía.
          </p>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-gray-800">
                <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right font-medium py-1 pr-2">#</th>
                  <th className="text-left font-medium py-1">Distrito</th>
                  <th className="text-right font-medium py-1">Score</th>
                  <th className="text-right font-medium py-1">% propio</th>
                  <th className="text-left font-medium py-1 pl-3">Ganó</th>
                </tr>
              </thead>
              <tbody>
                {vs.districts.map(r => (
                  <tr key={r.ubigeo} className="border-b border-gray-100 dark:border-gray-700/60">
                    <td className="py-1 pr-2 text-right tabular-nums text-gray-400">{r.score_rank}</td>
                    <td className="py-1 text-gray-700 dark:text-gray-200">{r.name}</td>
                    <td className="py-1 text-right tabular-nums text-gray-600 dark:text-gray-300">{r.score.toFixed(1)}</td>
                    <td className="py-1 text-right tabular-nums text-gray-700 dark:text-gray-200">{r.own_pct}%</td>
                    <td className="py-1 pl-3">
                      {r.won
                        ? <span className="text-green-600 text-xs font-medium">sí</span>
                        : <span className="text-gray-400 text-xs">{r.winner || '—'}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
