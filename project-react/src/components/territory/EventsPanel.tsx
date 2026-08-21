import React, { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { CampaignEvent, EventImpact, EventTask, EVENT_TYPE_LABELS, useEvents } from '../../hooks/useEvents';
import { LIMA_DISTRICTS } from '../../data/limaDistricts';

interface Props {
  presetUbigeo?: string | null;
  onPresetUsed?: () => void;
}

const EventRow: React.FC<{
  event: CampaignEvent;
  getImpact: (id: string) => Promise<EventImpact | null>;
  getTasks: (id: string) => Promise<EventTask[]>;
  createTask: (id: string, title: string) => Promise<void>;
  setTaskStatus: (taskId: string, status: string) => Promise<void>;
  onDelete: (id: string) => void;
}> = ({ event, getImpact, getTasks, createTask, setTaskStatus, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [impact, setImpact] = useState<EventImpact | null>(null);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (!open) return;
    getImpact(event.id).then(setImpact);
    getTasks(event.id).then(setTasks);
  }, [open, event.id, getImpact, getTasks]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    await createTask(event.id, newTask.trim());
    setNewTask('');
    setTasks(await getTasks(event.id));
  };

  const toggle = async (t: EventTask) => {
    await setTaskStatus(t.id, t.status === 'done' ? 'todo' : 'done');
    setTasks(await getTasks(event.id));
  };

  const when = event.start_at
    ? new Date(event.start_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => setOpen(o => !o)} className="text-left min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {EVENT_TYPE_LABELS[event.event_type] || event.event_type} · {event.district_name || 'sin distrito'} · {when}
            {event.expected_attendance ? ` · ${event.expected_attendance} esperados` : ''}
          </p>
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 flex-shrink-0"
          title="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="mt-2 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-2">
          {impact && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Impacto 48 h:</span>{' '}
              {impact.before.mentions} → {impact.after.mentions} menciones
              {impact.delta_mentions_pct !== null && (
                <span className={impact.delta_mentions_pct >= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                  {impact.delta_mentions_pct >= 0 ? <TrendingUp className="h-3 w-3 inline" /> : <TrendingDown className="h-3 w-3 inline" />}
                  {' '}{impact.delta_mentions_pct}%
                </span>
              )}
              {impact.delta_net !== null && <span className="ml-2">Δ sentimiento {impact.delta_net}</span>}
              {impact.partial && <span className="ml-2 text-amber-600">(ventana incompleta)</span>}
            </div>
          )}

          <div className="space-y-1">
            {tasks.map(t => (
              <label key={t.id} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={t.status === 'done'} onChange={() => toggle(t)} className="rounded" />
                <span className={t.status === 'done' ? 'line-through text-gray-400' : ''}>{t.title}</span>
                <span className="text-[10px] px-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">{t.priority}</span>
              </label>
            ))}
            <div className="flex gap-1">
              <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="Nueva tarea…"
                className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
              <button onClick={addTask} className="px-2 py-1 rounded bg-teal-600 text-white text-xs">
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const EventsPanel: React.FC<Props> = ({ presetUbigeo, onPresetUsed }) => {
  const { events, isLoading, createEvent, deleteEvent, getImpact, getTasks, createTask, setTaskStatus } = useEvents();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', event_type: 'tour', start_at: '', district_ubigeo: '', venue_name: '', expected_attendance: '',
  });

  useEffect(() => {
    if (presetUbigeo) {
      setForm(f => ({ ...f, district_ubigeo: presetUbigeo }));
      setShowForm(true);
      onPresetUsed?.();
    }
  }, [presetUbigeo, onPresetUsed]);

  const submit = async () => {
    if (!form.title.trim() || !form.start_at) {
      toast.error('Título y fecha son obligatorios');
      return;
    }
    setSaving(true);
    try {
      await createEvent({
        title: form.title.trim(),
        event_type: form.event_type,
        start_at: new Date(form.start_at).toISOString(),
        district_ubigeo: form.district_ubigeo || undefined,
        venue_name: form.venue_name || undefined,
        expected_attendance: form.expected_attendance ? Number(form.expected_attendance) : undefined,
      });
      toast.success('Evento creado');
      setForm({ title: '', event_type: 'tour', start_at: '', district_ubigeo: '', venue_name: '', expected_attendance: '' });
      setShowForm(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white';

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-teal-600" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Eventos de campaña</h3>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs">
          {showForm ? 'Cancelar' : 'Nuevo evento'}
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40">
          <input className={input} placeholder="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <select className={input} value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}>
            {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input className={input} type="datetime-local" value={form.start_at} onChange={e => setForm(f => ({ ...f, start_at: e.target.value }))} />
          <select className={input} value={form.district_ubigeo} onChange={e => setForm(f => ({ ...f, district_ubigeo: e.target.value }))}>
            <option value="">Sin distrito</option>
            {LIMA_DISTRICTS.map(d => <option key={d.ubigeo} value={d.ubigeo}>{d.name}</option>)}
          </select>
          <input className={input} placeholder="Lugar (opcional)" value={form.venue_name} onChange={e => setForm(f => ({ ...f, venue_name: e.target.value }))} />
          <input className={input} type="number" placeholder="Asistencia esperada" value={form.expected_attendance} onChange={e => setForm(f => ({ ...f, expected_attendance: e.target.value }))} />
          <button onClick={submit} disabled={saving} className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Guardar evento
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-16" />
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sin eventos registrados. Prográmalos desde la lista de oportunidad territorial.
        </p>
      ) : (
        <div className="space-y-2">
          {events.map(e => (
            <EventRow
              key={e.id}
              event={e}
              getImpact={getImpact}
              getTasks={getTasks}
              createTask={createTask}
              setTaskStatus={setTaskStatus}
              onDelete={deleteEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
};
