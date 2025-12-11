import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  Calendar,
  DollarSign,
  Target,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Campaign } from '../../types/campaigns';

interface CampaignDetailsProps {
  campaign: Campaign;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Campaign>) => void;
  onViewPerformance: () => void;
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

export const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  campaign,
  onBack,
  onUpdate,
  onViewPerformance,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: campaign.name,
    description: campaign.description,
  });

  const handleSaveEdit = () => {
    onUpdate(campaign.id, editData);
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    onUpdate(campaign.id, { status: newStatus });
  };

  const getBudgetProgress = () => {
    return (campaign.budget.spent / campaign.budget.total) * 100;
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(campaign.timeline.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatBudget = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

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
                {campaign.name}
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[campaign.status]}`}>
                  {statusLabels[campaign.status]}
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {objectiveLabels[campaign.objective]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>

            {(campaign.status === 'active' || campaign.status === 'paused') && (
              <Button
                onClick={handleToggleStatus}
                variant={campaign.status === 'active' ? 'outline' : 'primary'}
                size="sm"
                className={campaign.status === 'active' ? 'text-orange-600 hover:text-orange-700' : ''}
              >
                {campaign.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Reanudar
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={onViewPerformance}
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Performance
            </Button>
          </div>
        </div>

        {/* Editable Content */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la campaña
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleSaveEdit} variant="primary" size="sm">
                Guardar cambios
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {campaign.description}
          </p>
        )}
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Presupuesto Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatBudget(campaign.budget.total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatBudget(campaign.budget.spent)} ejecutado
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    getBudgetProgress() > 90 ? 'bg-red-500' :
                    getBudgetProgress() > 75 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${getBudgetProgress()}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getBudgetProgress().toFixed(1)}% ejecutado
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Alcance Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(campaign.performance.reach / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{campaign.performance.engagementRate.toFixed(1)}% engagement
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  ROI Actual
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campaign.performance.roi}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  vs {campaign.performance.roi - 50}% objetivo
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Días Restantes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getDaysRemaining()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hasta {formatDate(campaign.timeline.endDate)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Targeting Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Targeting y Audiencia
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Regiones objetivo
                </h4>
                <div className="flex flex-wrap gap-2">
                  {campaign.targetRegions.map((region) => (
                    <span
                      key={region}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm rounded-full flex items-center"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grupos de edad
                </h4>
                <div className="flex flex-wrap gap-2">
                  {campaign.targetDemographics.ageGroups.map((age) => (
                    <span
                      key={age}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-full"
                    >
                      {age} años
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel socioeconómico
                </h4>
                <div className="flex flex-wrap gap-2">
                  {campaign.targetDemographics.nse.map((nse) => (
                    <span
                      key={nse}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm rounded-full"
                    >
                      NSE {nse}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Budget Allocation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Distribución de Presupuesto
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Digital</span>
                  <div className="text-xs text-blue-700 dark:text-blue-400">
                    Facebook, Instagram, Google Ads
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-900 dark:text-blue-300">
                    {formatBudget(campaign.budget.allocated.digital)}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-400">40%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-green-900 dark:text-green-300">Tradicional</span>
                  <div className="text-xs text-green-700 dark:text-green-400">
                    TV, Radio, Prensa
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-900 dark:text-green-300">
                    {formatBudget(campaign.budget.allocated.traditional)}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-400">30%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Territorial</span>
                  <div className="text-xs text-purple-700 dark:text-purple-400">
                    Eventos, Activaciones
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-900 dark:text-purple-300">
                    {formatBudget(campaign.budget.allocated.territorial)}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-400">20%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-300">Contingencia</span>
                  <div className="text-xs text-orange-700 dark:text-orange-400">
                    Reserva de emergencia
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-900 dark:text-orange-300">
                    {formatBudget(campaign.budget.allocated.contingency)}
                  </div>
                  <div className="text-xs text-orange-700 dark:text-orange-400">10%</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Cronograma de Campaña
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-900 dark:text-green-300">Inicio</div>
              <div className="text-sm text-green-700 dark:text-green-400">
                {formatDate(campaign.timeline.startDate)}
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-blue-900 dark:text-blue-300">En progreso</div>
              <div className="text-sm text-blue-700 dark:text-blue-400">
                {getDaysRemaining()} días restantes
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="font-semibold text-orange-900 dark:text-orange-300">Fin</div>
              <div className="text-sm text-orange-700 dark:text-orange-400">
                {formatDate(campaign.timeline.endDate)}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Resumen de Performance
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(campaign.performance.impressions / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Impresiones</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(campaign.performance.clicks / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Clicks</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {campaign.performance.engagementRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Engagement</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(campaign.performance.mentionsGenerated / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Menciones</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-900 dark:text-orange-300">
                Recomendación del Sistema
              </span>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-400">
              La campaña está funcionando por encima de las expectativas. 
              Considera aumentar el presupuesto digital en un 20% para maximizar el alcance 
              en las próximas 2 semanas.
            </p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};