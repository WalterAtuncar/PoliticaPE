import React from 'react';
import { Card } from '../ui/Card';
import { LimaNewsItem } from '../../hooks/useDashboard';
import { topicLabel } from '../../data/topics';
import { timeAgo } from '../../utils/time';

interface Props {
  news: LimaNewsItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const MAX_DISTRICTS = 2;

export const LatestLimaNews: React.FC<Props> = ({ news, isLoading, error, onRetry }) => (
  <Card glass className="p-5">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Últimas noticias de Lima</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
      Clasificadas por IA · {news.length} más recientes
    </p>

    {isLoading ? (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-72" />
    ) : error ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No se pudo cargar.{' '}
        <button onClick={onRetry} className="text-teal-700 dark:text-teal-300 underline">
          Reintentar
        </button>
      </p>
    ) : news.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Sin noticias de Lima en las últimas horas.
      </p>
    ) : (
      <div>
        {news.map(n => (
          <div
            key={n.id}
            className="py-2 border-b border-gray-200/60 dark:border-gray-700/60 last:border-0"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-[#1F6B73] dark:text-teal-300">{n.source}</span>
              <span className="text-xs text-gray-400">{timeAgo(n.published_at)}</span>
            </div>

            <a
              href={n.url}
              target="_blank"
              rel="noreferrer"
              className="block text-sm text-gray-900 dark:text-white hover:underline line-clamp-2 mt-0.5"
            >
              {n.title}
            </a>

            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              {n.topics?.topic && (
                <span className="text-[10px] rounded px-1.5 py-0.5 bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
                  {topicLabel(n.topics.topic)}
                </span>
              )}
              {(n.districts || []).slice(0, MAX_DISTRICTS).map(d => (
                <span
                  key={d.ubigeo}
                  className="text-[10px] rounded px-1.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
);
