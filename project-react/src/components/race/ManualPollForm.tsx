import React, { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_CONFIG, ENDPOINTS, getAuthHeaders } from '../../config/api';

interface Props {
  candidateNames: string[];
  onSaved: () => void;
}

export const ManualPollForm: React.FC<Props> = ({ candidateNames, onSaved }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pollster, setPollster] = useState('');
  const [fieldDates, setFieldDates] = useState('');
  const [sample, setSample] = useState('');
  const [undecided, setUndecided] = useState('');
  const [pcts, setPcts] = useState<Record<string, string>>({});

  // Sin nombres desde la base no inventamos candidatos: el formulario queda vacio
  // y avisa, en vez de sugerir una carrera que puede no ser la actual.
  const names = candidateNames.slice(0, 10);

  const submit = async () => {
    const candidates = names
      .filter(n => pcts[n] !== undefined && pcts[n] !== '')
      .map(n => ({ name: n, pct: Number(pcts[n]) }));
    if (!pollster.trim() || !fieldDates.trim() || candidates.length === 0) {
      toast.error('Encuestadora, fechas de campo y al menos un porcentaje son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_CONFIG.SCRAPPING_BASE_URL}${ENDPOINTS.RACE_POLLS_MANUAL}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          pollster: pollster.trim(),
          field_dates: fieldDates.trim(),
          sample_size: sample ? Number(sample) : undefined,
          base: 'validos',
          candidates,
          undecided: undecided ? Number(undecided) : undefined,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.detail || 'No se pudo registrar');
      toast.success('Encuesta interna registrada');
      setPollster(''); setFieldDates(''); setSample(''); setUndecided(''); setPcts({});
      setOpen(false);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al registrar');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white';

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/10 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Encuesta interna</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">uso del equipo, no publicable</span>
        </div>
        <button onClick={() => setOpen(o => !o)} className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs">
          {open ? 'Cancelar' : 'Cargar encuesta interna'}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input className={input} placeholder="Encuestadora" value={pollster} onChange={e => setPollster(e.target.value)} />
            <input className={input} placeholder="Fechas de campo (ej. 20-21 sep 2026)" value={fieldDates} onChange={e => setFieldDates(e.target.value)} />
            <input className={input} type="number" placeholder="Muestra" value={sample} onChange={e => setSample(e.target.value)} />
            <input className={input} type="number" step="0.1" placeholder="% indecisos" value={undecided} onChange={e => setUndecided(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {names.length === 0 && (
              <p className="col-span-full text-xs text-amber-600 dark:text-amber-400">
                No hay candidatos cargados: siembra el padron de figuras antes de registrar una encuesta.
              </p>
            )}
            {names.map(n => (
              <div key={n}>
                <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-0.5 truncate" title={n}>{n}</label>
                <input
                  className={input}
                  type="number"
                  step="0.1"
                  placeholder="%"
                  value={pcts[n] ?? ''}
                  onChange={e => setPcts(p => ({ ...p, [n]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <button onClick={submit} disabled={saving} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};
