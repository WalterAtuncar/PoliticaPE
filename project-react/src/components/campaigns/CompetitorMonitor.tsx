import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CompetitorCampaign } from '../../types/campaigns';

interface CompetitorMonitorProps {
  onBack: () => void;
  competitorCampaigns: CompetitorCampaign[];
}

const competitorColors = {
  'Fuerza Popular': '#FF6B35',
  'Perú Libre': '#DC2626',
  'Renovación Popular': '#3B82F6',
  'Alianza para el Progreso': '#10B981',
  'Acción Popular': '#8B5CF6',
};

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  paused: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
};

const statusLabels = {
  active: 'Activa',
  completed: 'Completada',
  paused: 'Pausada',
};

export const CompetitorMonitor: React.FC<CompetitorMonitorProps> = ({
  onBack,
  competitorCampaigns,
}) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('detectedAt');

  const competitors = Array.from(new Set(competitorCampaigns.map(c => c.competitor)));

  const filteredCampaigns = competitorCampaigns
    .filter(campaign => {
      const matchesCompetitor = selectedCompetitor === 'all' || campaign.competitor === selectedCompetitor;
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.keyMessages.some(msg => msg.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCompetitor && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'detectedAt':
          return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
        case 'budget':
          return b.estimatedBudget - a.estimatedBudget;
        case 'reach':
          return b.reach - a.reach;
        default:
          return 0;
      }
    });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatBudget = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'text-green-600 dark:text-green-400';
    if (sentiment > -0.1) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (sentiment > -0.1) return <div className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  // Calculate competitor summary stats
  const competitorStats = competitors.map(competitor => {
    const campaigns = competitorCampaigns.filter(c => c.competitor === competitor);
    const totalBudget = campaigns.reduce((sum, c) => sum + c.estimatedBudget, 0);
    const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0);
    const avgSentiment = campaigns.reduce((sum, c) => sum + c.sentiment, 0) / campaigns.length;
    
    return {
      competitor,
      campaignsCount: campaigns.length,
      totalBudget,
      totalReach,
      avgSentiment,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    };
  }).sort((a, b) => b.totalBudget - a.totalBudget);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Monitor de Competencia
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Análisis de campañas detectadas de partidos políticos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Monitoreo activo
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar campañas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>

            {/* Competitor Filter */}
            <div className="relative">
              <select
                value={selectedCompetitor}
                onChange={(e) => setSelectedCompetitor(e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
              >
                <option value="all">Todos los partidos</option>
                {competitors.map((competitor) => (
                  <option key={competitor} value={competitor}>
                    {competitor}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="detectedAt">Más recientes</option>
              <option value="budget">Mayor presupuesto</option>
              <option value="reach">Mayor alcance</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredCampaigns.length} campañas detectadas
          </div>
        </div>
      </Card>

      {/* Competitor Overview */}
      <Card glass className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Resumen por Competidor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitorStats.map((stat, index) => (
            <motion.div
              key={stat.competitor}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
              style={{ 
                borderLeftColor: competitorColors[stat.competitor as keyof typeof competitorColors] || '#6B7280',
                borderLeftWidth: '4px'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {stat.competitor}
                </h4>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                  {stat.activeCampaigns} activas
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Campañas</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stat.campaignsCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Presupuesto est.</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatBudget(stat.totalBudget)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Alcance</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatNumber(stat.totalReach)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sentiment prom.</span>
                  <span className={`font-medium ${getSentimentColor(stat.avgSentiment)}`}>
                    {stat.avgSentiment > 0 ? '+' : ''}{stat.avgSentiment.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card glass className="p-6 hover:shadow-lg transition-all duration-200">
              {/* Campaign Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div 
                    className="w-4 h-16 rounded"
                    style={{ 
                      backgroundColor: competitorColors[campaign.competitor as keyof typeof competitorColors] || '#6B7280'
                    }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {campaign.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[campaign.status]}`}>
                        {statusLabels[campaign.status]}
                      </span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {campaign.competitor}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Detectado {formatDate(campaign.detectedAt)}</span>
                      </div>
                      <span>•</span>
                      <span>{campaign.regions.join(', ')}</span>
                    </div>

                    {/* Key Messages */}
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mensajes clave detectados:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {campaign.keyMessages.map((message, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm rounded-full"
                          >
                            {message}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Plataformas:</span>
                      <div className="flex space-x-2">
                        {campaign.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Analizar
                  </Button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-xs text-gray-500">Presupuesto est.</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatBudget(campaign.estimatedBudget)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-gray-500">Alcance est.</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(campaign.reach)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getSentimentIcon(campaign.sentiment)}
                  <div>
                    <div className="text-xs text-gray-500">Sentiment</div>
                    <div className={`text-sm font-medium ${getSentimentColor(campaign.sentiment)}`}>
                      {campaign.sentiment > 0 ? '+' : ''}{campaign.sentiment.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-xs text-gray-500">Nivel de amenaza</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {campaign.estimatedBudget > 100000 ? 'Alto' : 
                       campaign.estimatedBudget > 50000 ? 'Medio' : 'Bajo'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert if high threat */}
              {campaign.estimatedBudget > 100000 && campaign.status === 'active' && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900 dark:text-red-300">
                      Campaña de alto impacto detectada
                    </span>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-400 mt-1">
                    Esta campaña tiene un presupuesto significativo y está activa en regiones clave. 
                    Considera ajustar tu estrategia para mantener competitividad.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No se detectaron campañas
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || selectedCompetitor !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'El sistema está monitoreando activamente la competencia'
            }
          </p>
        </div>
      )}
    </motion.div>
  );
};