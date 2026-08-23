import React from 'react';
import { FileText, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Brief } from '../../hooks/useRace';
import { formatDayMonth } from '../../utils/time';

interface Props {
  brief: Brief | null;
  isGenerating: boolean;
  onGenerate: (send: boolean) => Promise<Brief>;
}

/** Render minimo de Markdown: encabezados, listas, negrita y citas. Sin dependencias nuevas. */
function renderMarkdown(md: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let list: string[] = [];

  const bold = (s: string): React.ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        : <React.Fragment key={i}>{part}</React.Fragment>
    );

  const flush = () => {
    if (!list.length) return;
    out.push(
      <ul key={`ul-${out.length}`} className="list-disc pl-5 space-y-1 my-2 text-sm text-gray-700 dark:text-gray-300">
        {list.map((li, i) => <li key={i}>{bold(li)}</li>)}
      </ul>
    );
    list = [];
  };

  md.split('\n').forEach(raw => {
    const line = raw.trimEnd();
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''));
      return;
    }
    flush();
    if (line.startsWith('## ')) {
      out.push(<h4 key={out.length} className="text-sm font-semibold text-gray-900 dark:text-white mt-4 mb-1">{line.slice(3)}</h4>);
    } else if (line.startsWith('# ')) {
      out.push(<h3 key={out.length} className="text-base font-bold text-gray-900 dark:text-white mb-2">{line.slice(2)}</h3>);
    } else if (line.startsWith('> ')) {
      out.push(
        <p key={out.length} className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 pl-3 py-1.5 my-2 text-sm text-amber-800 dark:text-amber-200">
          {bold(line.slice(2))}
        </p>
      );
    } else if (line.trim()) {
      out.push(<p key={out.length} className="text-sm text-gray-700 dark:text-gray-300 my-1.5">{bold(line)}</p>);
    }
  });
  flush();
  return out;
}

export const BriefPanel: React.FC<Props> = ({ brief, isGenerating, onGenerate }) => {
  const handle = async (send: boolean) => {
    try {
      await onGenerate(send);
      toast.success(send ? 'Brief generado y enviado' : 'Brief generado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo generar el brief');
    }
  };

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 p-4">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Brief diario</h3>
          {brief && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDayMonth(brief.brief_date)}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handle(false)}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 text-white disabled:opacity-50 flex items-center gap-1.5"
          >
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Generar ahora
          </button>
          <button
            onClick={() => handle(true)}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="h-3 w-3" />
            Generar y enviar
          </button>
        </div>
      </div>

      {!brief ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aún no hay brief. Se genera automáticamente a las 07:00 (hora de Lima) o con el botón.
        </p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto pr-1">{renderMarkdown(brief.body_markdown)}</div>
      )}
    </div>
  );
};
