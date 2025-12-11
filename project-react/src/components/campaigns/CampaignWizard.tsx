import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Target, 
  Users, 
  MapPin, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Campaign, ReachEstimate } from '../../types/campaigns';

interface CampaignWizardProps {
  onClose: () => void;
  onSave: (campaign: Partial<Campaign>) => Promise<Campaign>;
  getReachEstimate: (targetData: any) => Promise<ReachEstimate>;
}

const steps = [
  { id: 'objective', title: 'Objetivo', icon: Target },
  { id: 'targeting', title: 'Targeting', icon: Users },
  { id: 'geography', title: 'Geografía', icon: MapPin },
  { id: 'budget', title: 'Presupuesto', icon: DollarSign },
  { id: 'timeline', title: 'Timeline', icon: Calendar },
  { id: 'review', title: 'Revisión', icon: CheckCircle },
];

const objectives = [
  {
    id: 'sentiment',
    title: 'Mejorar Sentiment',
    description: 'Incrementar percepción positiva en regiones específicas',
    icon: '😊',
    color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
  },
  {
    id: 'awareness',
    title: 'Generar Awareness',
    description: 'Aumentar reconocimiento y visibilidad de propuestas',
    icon: '👁️',
    color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
  },
  {
    id: 'mobilization',
    title: 'Movilización Territorial',
    description: 'Activar bases y generar participación ciudadana',
    icon: '🚀',
    color: 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
  },
  {
    id: 'crisis_defense',
    title: 'Defensa de Crisis',
    description: 'Responder a situaciones críticas y proteger imagen',
    icon: '🛡️',
    color: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
  },
];

const regions = [
  'Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Puno', 'Ica', 'Junín',
  'Lambayeque', 'Ancash', 'Huánuco', 'San Martín', 'Loreto', 'Ucayali'
];

const ageGroups = ['18-25', '26-35', '36-50', '50+'];
const nseGroups = ['A', 'B', 'C', 'D', 'E'];
const genderGroups = ['Masculino', 'Femenino', 'Todos'];

export const CampaignWizard: React.FC<CampaignWizardProps> = ({
  onClose,
  onSave,
  getReachEstimate,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [reachEstimate, setReachEstimate] = useState<ReachEstimate | null>(null);
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    objective: '',
    targetRegions: [] as string[],
    targetDemographics: {
      ageGroups: [] as string[],
      nse: [] as string[],
      gender: [] as string[],
      politicalAffinity: [] as string[],
    },
    budget: {
      total: 100000,
      allocated: {
        digital: 40000,
        traditional: 30000,
        territorial: 20000,
        contingency: 10000,
      },
    },
    timeline: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      duration: 60,
    },
  });

  const updateCampaignData = (updates: any) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (currentStep === 2) { // After geography step
      setIsLoading(true);
      try {
        const estimate = await getReachEstimate({
          regions: campaignData.targetRegions,
          demographics: campaignData.targetDemographics,
        });
        setReachEstimate(estimate);
      } catch (error) {
        console.error('Error getting reach estimate:', error);
      }
      setIsLoading(false);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(campaignData as any);
      onClose();
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
    setIsLoading(false);
  };

  const toggleSelection = (item: string, list: string[], setter: (list: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'objective':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                ¿Cuál es el objetivo principal de tu campaña?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Selecciona el objetivo que mejor describa lo que quieres lograr
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre de la campaña"
                value={campaignData.name}
                onChange={(e) => updateCampaignData({ name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />

              <textarea
                placeholder="Descripción de la campaña"
                value={campaignData.description}
                onChange={(e) => updateCampaignData({ description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objectives.map((objective) => (
                <button
                  key={objective.id}
                  onClick={() => updateCampaignData({ objective: objective.id })}
                  className={`
                    p-6 rounded-lg border-2 transition-all duration-200 text-left
                    ${campaignData.objective === objective.id 
                      ? objective.color + ' border-current' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-orange-300'
                    }
                  `}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{objective.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {objective.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {objective.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'targeting':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Define tu audiencia objetivo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Selecciona los segmentos demográficos que quieres alcanzar
              </p>
            </div>

            <div className="space-y-6">
              {/* Age Groups */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Grupos de edad</h4>
                <div className="flex flex-wrap gap-2">
                  {ageGroups.map((age) => (
                    <button
                      key={age}
                      onClick={() => toggleSelection(
                        age, 
                        campaignData.targetDemographics.ageGroups,
                        (list) => updateCampaignData({
                          targetDemographics: { ...campaignData.targetDemographics, ageGroups: list }
                        })
                      )}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${campaignData.targetDemographics.ageGroups.includes(age)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {age} años
                    </button>
                  ))}
                </div>
              </div>

              {/* NSE */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Nivel socioeconómico</h4>
                <div className="flex flex-wrap gap-2">
                  {nseGroups.map((nse) => (
                    <button
                      key={nse}
                      onClick={() => toggleSelection(
                        nse, 
                        campaignData.targetDemographics.nse,
                        (list) => updateCampaignData({
                          targetDemographics: { ...campaignData.targetDemographics, nse: list }
                        })
                      )}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${campaignData.targetDemographics.nse.includes(nse)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      NSE {nse}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Género</h4>
                <div className="flex flex-wrap gap-2">
                  {genderGroups.map((gender) => (
                    <button
                      key={gender}
                      onClick={() => toggleSelection(
                        gender, 
                        campaignData.targetDemographics.gender,
                        (list) => updateCampaignData({
                          targetDemographics: { ...campaignData.targetDemographics, gender: list }
                        })
                      )}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${campaignData.targetDemographics.gender.includes(gender)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'geography':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Selecciona las regiones objetivo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Elige los departamentos donde ejecutarás la campaña
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => toggleSelection(
                    region, 
                    campaignData.targetRegions,
                    (list) => updateCampaignData({ targetRegions: list })
                  )}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2
                    ${campaignData.targetRegions.includes(region)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-300'
                    }
                  `}
                >
                  <MapPin className="h-4 w-4 mx-auto mb-1" />
                  {region}
                </button>
              ))}
            </div>

            {campaignData.targetRegions.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Regiones seleccionadas ({campaignData.targetRegions.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {campaignData.targetRegions.map((region) => (
                    <span
                      key={region}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Configura el presupuesto
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Define la distribución del presupuesto por canales
              </p>
            </div>

            <div className="space-y-6">
              {/* Total Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Presupuesto total
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={campaignData.budget.total}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      updateCampaignData({
                        budget: {
                          total,
                          allocated: {
                            digital: total * 0.4,
                            traditional: total * 0.3,
                            territorial: total * 0.2,
                            contingency: total * 0.1,
                          }
                        }
                      });
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="100000"
                  />
                </div>
              </div>

              {/* Budget Allocation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Digital</span>
                    <span className="text-sm text-blue-700 dark:text-blue-400">40%</span>
                  </div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-300">
                    ${(campaignData.budget.allocated.digital / 1000).toFixed(0)}K
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-900 dark:text-green-300">Tradicional</span>
                    <span className="text-sm text-green-700 dark:text-green-400">30%</span>
                  </div>
                  <div className="text-lg font-bold text-green-900 dark:text-green-300">
                    ${(campaignData.budget.allocated.traditional / 1000).toFixed(0)}K
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Territorial</span>
                    <span className="text-sm text-purple-700 dark:text-purple-400">20%</span>
                  </div>
                  <div className="text-lg font-bold text-purple-900 dark:text-purple-300">
                    ${(campaignData.budget.allocated.territorial / 1000).toFixed(0)}K
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-300">Contingencia</span>
                    <span className="text-sm text-orange-700 dark:text-orange-400">10%</span>
                  </div>
                  <div className="text-lg font-bold text-orange-900 dark:text-orange-300">
                    ${(campaignData.budget.allocated.contingency / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>

              {/* Reach Estimate */}
              {reachEstimate && (
                <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="h-6 w-6 text-orange-600" />
                    <h4 className="font-semibold text-orange-900 dark:text-orange-300">
                      Estimación de Alcance IA
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                        {(reachEstimate.totalReach / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-400">
                        Alcance total estimado
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                        {reachEstimate.confidence}%
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-400">
                        Confianza del modelo
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Define el cronograma
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Establece las fechas de inicio y fin de la campaña
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={campaignData.timeline.startDate.toISOString().split('T')[0]}
                  onChange={(e) => updateCampaignData({
                    timeline: {
                      ...campaignData.timeline,
                      startDate: new Date(e.target.value)
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={campaignData.timeline.endDate.toISOString().split('T')[0]}
                  onChange={(e) => updateCampaignData({
                    timeline: {
                      ...campaignData.timeline,
                      endDate: new Date(e.target.value)
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.ceil((campaignData.timeline.endDate.getTime() - campaignData.timeline.startDate.getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  días de duración
                </div>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Revisa tu campaña
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Verifica todos los detalles antes de crear la campaña
              </p>
            </div>

            <div className="space-y-4">
              <Card glass className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Información básica</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{campaignData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Objetivo:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {objectives.find(o => o.id === campaignData.objective)?.title}
                    </span>
                  </div>
                </div>
              </Card>

              <Card glass className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Targeting</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Regiones: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {campaignData.targetRegions.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Edad: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {campaignData.targetDemographics.ageGroups.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">NSE: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {campaignData.targetDemographics.nse.join(', ')}
                    </span>
                  </div>
                </div>
              </Card>

              <Card glass className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Presupuesto</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${(campaignData.budget.total / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Presupuesto total
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Crear Nueva Campaña"
      size="xl"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200
                  ${isActive 
                    ? 'bg-orange-500 border-orange-500 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-2 hidden md:block">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="text-sm text-gray-500">
            Paso {currentStep + 1} de {steps.length}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSave}
              variant="primary"
              isLoading={isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Crear Campaña
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="primary"
              isLoading={isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};