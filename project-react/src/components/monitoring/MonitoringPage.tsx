import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, RefreshCw, Play, Pause, Search, Filter,
  ExternalLink, Clock, TrendingUp, TrendingDown, Minus,
  Tv, Radio, Building2, Globe, AlertCircle, ChevronDown,
  BarChart3, Loader2, CheckCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { useNewsData, NewsFilters, NewsArticle, getSourceType } from '../../hooks/useNewsData';

const SOURCE_COLORS: Record<string, string> = {
  'El Comercio': '#1e40af',
  'La República': '#dc2626',
  'Gestión': '#059669',
  'RPP Noticias': '#7c3aed',
  'Perú21': '#ea580c',
  'Infobae Perú': '#0d9488',
  'Andina': '#0891b2',
  'Canal N': '#b91c1c',
  'América TV': '#2563eb',
  'Panamericana TV': '#c026d3',
  'TV Perú': '#16a34a',
  'Exitosa': '#d97706',
};

const SOURCE_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  prensa: { icon: Newspaper, label: 'Prensa', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  tv: { icon: Tv, label: 'TV', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
  radio: { icon: Radio, label: 'Radio', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
  agencia: { icon: Building2, label: 'Agencia', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400' },
};

const initialFilters: NewsFilters = {
  source: 'all',
  category: 'all',
  search: '',
  autoRefresh: false,
  refreshInterval: 60,
};

const formatTimeAgo = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
};

const SentimentBadge: React.FC<{ score: number | null }> = ({ score }) => {
  if (score === null || score === undefined) return null;
  const isPositive = score > 0.1;
  const isNegative = score < -0.1;
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const color = isPositive
    ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
    : isNegative
    ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
    : 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {score > 0 ? '+' : ''}{score.toFixed(2)}
    </span>
  );
};

const SourceTypeBadge: React.FC<{ source: string }> = ({ source }) => {
  const type = getSourceType(source);
  const config = SOURCE_TYPE_CONFIG[type];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.color}`}>
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
};

export const MonitoringPage: React.FC = () => {
  const [filters, setFilters] = useState<NewsFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [scrapingMessage, setScrapingMessage] = useState<string | null>(null);

  const {
    articles, stats, isLoading, isScraping, error, lastUpdate,
    refetch, triggerScraping
  } = useNewsData(filters, 300);

  const handleTriggerScraping = async () => {
    try {
      setScrapingMessage(null);
      await triggerScraping();
      setScrapingMessage('Scraping iniciado. Las noticias se actualizarán en unos segundos...');
      setTimeout(() => setScrapingMessage(null), 20000);
    } catch {
      setScrapingMessage('Error al iniciar el scraping de noticias');
    }
  };

  const sources = Object.keys(stats.sourceBreakdown).sort();
  const categories = Object.keys(stats.categoryBreakdown).sort();

  const typeStats = { prensa: 0, tv: 0, radio: 0, agencia: 0 };
  for (const [src, count] of Object.entries(stats.sourceBreakdown)) {
    const type = getSourceType(src);
    if (type in typeStats) typeStats[type as keyof typeof typeStats] += count;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-white" />
            </div>
            Monitoreo de Noticias
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cobertura en tiempo real de medios peruanos
            {lastUpdate && (
              <span className="ml-2 text-xs">
                · Actualizado: {lastUpdate.toLocaleTimeString('es-PE')}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilters(f => ({ ...f, autoRefresh: !f.autoRefresh }))}
            className={`p-2 rounded-lg border transition-colors ${
              filters.autoRefresh
                ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
                : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
            }`}
            title={filters.autoRefresh ? 'Pausar auto-actualización' : 'Activar auto-actualización'}
          >
            {filters.autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Actualizar noticias"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleTriggerScraping}
            disabled={isScraping}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {isScraping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            {isScraping ? 'Scrapeando...' : 'Scrapear Noticias'}
          </button>
        </div>
      </div>

      {scrapingMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-400 text-sm"
        >
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {scrapingMessage}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(SOURCE_TYPE_CONFIG).map(([type, config]) => {
          const Icon = config.icon;
          const count = typeStats[type as keyof typeof typeStats] || 0;
          return (
            <Card key={type} glass className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{config.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card glass className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Buscar noticias..."
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filters.source}
              onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todas las fuentes ({stats.totalArticles})</option>
              {sources.map(s => (
                <option key={s} value={s}>{s} ({stats.sourceBreakdown[s]})</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(c => (
                <option key={c} value={c}>{c} ({stats.categoryBreakdown[c]})</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  Fuentes por tipo
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sources.map(source => {
                    const type = getSourceType(source);
                    const config = SOURCE_TYPE_CONFIG[type];
                    const Icon = config?.icon || Newspaper;
                    const isActive = filters.source === source;
                    return (
                      <button
                        key={source}
                        onClick={() => setFilters(f => ({ ...f, source: isActive ? 'all' : source }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isActive
                            ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: SOURCE_COLORS[source] || '#6b7280' }}
                        />
                        <Icon className="h-3 w-3" />
                        {source}
                        <span className="text-gray-400 dark:text-gray-500">
                          {stats.sourceBreakdown[source] || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8">
          {isLoading && articles.length === 0 ? (
            <Card glass className="p-12 text-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Cargando noticias...</p>
            </Card>
          ) : articles.length === 0 ? (
            <Card glass className="p-12 text-center">
              <Newspaper className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sin noticias
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                No hay noticias disponibles. Presiona "Scrapear Noticias" para obtener artículos de medios peruanos.
              </p>
              <button
                onClick={handleTriggerScraping}
                disabled={isScraping}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium text-sm disabled:opacity-50"
              >
                Scrapear Noticias Ahora
              </button>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {articles.length} noticia{articles.length !== 1 ? 's' : ''}
                  {filters.source !== 'all' && ` de ${filters.source}`}
                  {filters.category !== 'all' && ` en ${filters.category}`}
                </p>
              </div>

              <AnimatePresence mode="popLayout">
                {articles.map((article, index) => (
                  <NewsCard key={article.id} article={article} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-5">
          <SourcesPanel sourceBreakdown={stats.sourceBreakdown} />
          <CategoriesPanel categoryBreakdown={stats.categoryBreakdown} />
          <SentimentOverview articles={articles} />
        </div>
      </div>
    </motion.div>
  );
};

const NewsCard: React.FC<{ article: NewsArticle; index: number }> = ({ article, index }) => {
  const sourceType = getSourceType(article.source);
  const sourceColor = SOURCE_COLORS[article.source] || '#6b7280';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
    >
      <Card glass className="p-4 hover:shadow-md transition-shadow group">
        <div className="flex items-start gap-3">
          <div
            className="w-1 self-stretch rounded-full flex-shrink-0"
            style={{ backgroundColor: sourceColor }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="text-xs font-semibold"
                style={{ color: sourceColor }}
              >
                {article.source}
              </span>
              <SourceTypeBadge source={article.source} />
              {article.category && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  {article.category}
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 ml-auto">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(article.scraped_at)}
              </span>
            </div>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group/link"
            >
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug mb-1 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors">
                {article.title}
              </h3>
            </a>

            {article.content && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                {article.content}
              </p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <SentimentBadge score={article.sentiment_score} />
              {article.published_at && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  Publicado: {formatDate(article.published_at)}
                </span>
              )}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const SourcesPanel: React.FC<{ sourceBreakdown: Record<string, number> }> = ({ sourceBreakdown }) => {
  const sorted = Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, c]) => s + c, 0);

  return (
    <Card glass className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Fuentes</h3>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{total} total</span>
      </div>
      <div className="space-y-2.5">
        {sorted.map(([source, count]) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          const color = SOURCE_COLORS[source] || '#6b7280';
          const type = getSourceType(source);
          const config = SOURCE_TYPE_CONFIG[type];
          const Icon = config?.icon || Newspaper;
          return (
            <div key={source}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                    {source}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{count}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const CategoriesPanel: React.FC<{ categoryBreakdown: Record<string, number> }> = ({ categoryBreakdown }) => {
  const sorted = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <Card glass className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-purple-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Categorías</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map(([cat, count], i) => (
          <span
            key={cat}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            {cat}
            <span className="text-gray-400">{count}</span>
          </span>
        ))}
      </div>
    </Card>
  );
};

const SentimentOverview: React.FC<{ articles: NewsArticle[] }> = ({ articles }) => {
  const withScore = articles.filter(a => a.sentiment_score !== null && a.sentiment_score !== undefined);
  if (withScore.length === 0) return null;

  const avg = withScore.reduce((s, a) => s + (a.sentiment_score || 0), 0) / withScore.length;
  const positive = withScore.filter(a => (a.sentiment_score || 0) > 0.1).length;
  const negative = withScore.filter(a => (a.sentiment_score || 0) < -0.1).length;
  const neutral = withScore.length - positive - negative;

  const pctPos = (positive / withScore.length) * 100;
  const pctNeu = (neutral / withScore.length) * 100;

  return (
    <Card glass className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-green-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Sentimiento</h3>
      </div>

      <div className="text-center mb-3">
        <p className={`text-3xl font-bold ${
          avg > 0.1 ? 'text-green-600' : avg < -0.1 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {avg > 0 ? '+' : ''}{avg.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Promedio general</p>
      </div>

      <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex mb-3">
        <div className="h-full bg-green-500" style={{ width: `${pctPos}%` }} />
        <div className="h-full bg-gray-400" style={{ width: `${pctNeu}%` }} />
        <div className="h-full bg-red-500" style={{ width: `${100 - pctPos - pctNeu}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-sm font-bold text-green-600">{positive}</p>
          <p className="text-[10px] text-gray-500">Positivo</p>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{neutral}</p>
          <p className="text-[10px] text-gray-500">Neutral</p>
        </div>
        <div>
          <p className="text-sm font-bold text-red-600">{negative}</p>
          <p className="text-[10px] text-gray-500">Negativo</p>
        </div>
      </div>
    </Card>
  );
};
