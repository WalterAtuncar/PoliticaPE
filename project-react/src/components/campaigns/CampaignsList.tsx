import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Campaign } from '../../types/campaigns';

interface CampaignsListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onCampaignSelect: (campaign: Campaign) => void;
  onViewPerformance: (campaign: Campaign) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Campaign>) => void;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  paused: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const statusLabels = {
  draft: 'Borrador',
  review: 'En revisión',
  approved: 'Aprobada',
  active: 'Activa',
  paused: 'Pausada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const objectiveLabels = {
  sentiment: 'Mejorar Sentiment',
  awareness: 'Generar Awareness',
  mobilization: 'Movilización',
  crisis_defense: 'Defensa de Crisis',
};

export const CampaignsList: React.FC<CampaignsListProps> = ({
  campaigns,
  isLoading,
  onCampaignSelect,
  onViewPerformance,
  onDuplicate,
  onDelete,
  onUpdate,
}) => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [showActions, setShowActions] = useState<string | null>(null);

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(id) 
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  const handleToggleStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    onUpdate(campaign.id, { status: newStatus });
  };

  const formatBudget = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getPerformanceIcon = (roi: number) => {
    if (roi > 200) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (roi < 150) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getBudgetProgress = (campaign: Campaign) => {
    return (campaign.budget.spent / campaign.budget.total) * 100;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Card glass className="p-6">
              <div className="h-6 bg-white/20 dark:bg-gray-800/20 rounded mb-4"></div>
              <div className="h-4 bg-white/20 dark:bg-gray-800/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 dark:bg-gray-800/20 rounded w-3/4"></div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedCampaigns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
            {selectedCampaigns.length} campañas seleccionadas
          </span>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline">
              Pausar todas
            </Button>
            <Button size="sm" variant="outline">
              Exportar
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
              Eliminar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card glass className="p-6 hover:shadow-lg transition-all duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(campaign.id)}
                    onChange={() => handleSelectCampaign(campaign.id)}
                    className="mt-1 h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 
                        className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        onClick={() => onCampaignSelect(campaign)}
                      >
                        {campaign.name}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[campaign.status]}`}>
                        {statusLabels[campaign.status]}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2">
                      {campaign.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{objectiveLabels[campaign.objective]}</span>
                      <span>•</span>
                      <span>{campaign.targetRegions.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowActions(showActions === campaign.id ? null : campaign.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {showActions === campaign.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                    >
                      <div className="p-2">
                        <button
                          onClick={() => onCampaignSelect(campaign)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => onViewPerformance(campaign)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Ver rendimiento</span>
                        </button>
                        <button
                          onClick={() => onDuplicate(campaign.id)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                        >
                          <Copy className="h-4 w-4" />
                          <span>Duplicar</span>
                        </button>
                        <button
                          onClick={() => onDelete(campaign.id)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-xs text-gray-500">Presupuesto</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatBudget(campaign.budget.total)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-gray-500">Alcance</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {(campaign.performance.reach / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-xs text-gray-500">Inicio</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(campaign.timeline.startDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getPerformanceIcon(campaign.performance.roi)}
                  <div>
                    <div className="text-xs text-gray-500">ROI</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {campaign.performance.roi}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Presupuesto ejecutado</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatBudget(campaign.budget.spent)} / {formatBudget(campaign.budget.total)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      getBudgetProgress(campaign) > 90 ? 'bg-red-500' :
                      getBudgetProgress(campaign) > 75 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${getBudgetProgress(campaign)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {(campaign.status === 'active' || campaign.status === 'paused') && (
                    <Button
                      onClick={() => handleToggleStatus(campaign)}
                      variant="outline"
                      size="sm"
                      className={campaign.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {campaign.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Reanudar
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    onClick={() => onViewPerformance(campaign)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver detalles
                  </Button>
                </div>

                {/* Performance Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-gray-500">Engagement</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {campaign.performance.engagementRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📢</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay campañas disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Crea tu primera campaña para comenzar a gestionar estrategias políticas
          </p>
        </div>
      )}
    </div>
  );
};