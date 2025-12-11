import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FlaskConical, 
  Save, 
  Play, 
  BarChart3, 
  Sliders, 
  RefreshCw,
  Download,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DemographicFilters, DemographicData, DemographicScenario } from '../../types/demographics';

interface DemographicScenariosProps {
  data: DemographicData;
  onGenerateScenario: (parameters: any) => Promise<DemographicScenario>;
  isLoading: boolean;
  filters: DemographicFilters;
}

export const DemographicScenarios: React.FC<DemographicScenariosProps> = ({
  data,
  onGenerateScenario,
  isLoading,
  filters,
}) => {
  const [scenarios, setScenarios] = useState<DemographicScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showParameters, setShowParameters] = useState(false);
  const [parameters, setParameters] = useState({
    urbanizationChange: 5,
    educationChange: 10,
    ageStructureChange: 2,
    migrationRate: 3,
    timeframe: 5,
  });

  const handleParameterChange = (param: string, value: number) => {
    setParameters(prev => ({ ...prev, [param]: value }));
  };

  const handleGenerateScenario = async () => {
    setIsGenerating(true);
    try {
      const newScenario = await onGenerateScenario(parameters);
      setScenarios(prev => [...prev, newScenario]);
      setActiveScenario(newScenario.id);
      setShowParameters(false);
    } catch (error) {
      console.error('Error generating scenario:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getScenarioById = (id: string | null) => {
    if (!id) return null;
    return scenarios.find(s => s.id === id) || null;
  };

  const activeScenarioData = getScenarioById(activeScenario);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString(undefined, {maximumFractionDigits: 2})}
              {entry.dataKey === 'sentiment' ? '' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Simulador de Escenarios Demográficos
            </h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowParameters(!showParameters)}
              variant="outline"
              size="sm"
            >
              <Sliders className="h-4 w-4 mr-2" />
              {showParameters ? 'Ocultar Parámetros' : 'Configurar Parámetros'}
            </Button>
            
            <Button
              onClick={handleGenerateScenario}
              variant="primary"
              size="sm"
              isLoading={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Generar Escenario
            </Button>
          </div>
        </div>

        {/* Parameters Configuration */}
        {showParameters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Parámetros de Simulación
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Urbanization Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cambio en Urbanización (%)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="-10"
                      max="20"
                      value={parameters.urbanizationChange}
                      onChange={(e) => handleParameterChange('urbanizationChange', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-10 text-center">
                      {parameters.urbanizationChange > 0 ? '+' : ''}{parameters.urbanizationChange}%
                    </span>
                  </div>
                </div>

                {/* Education Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cambio en Nivel Educativo (%)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="-5"
                      max="20"
                      value={parameters.educationChange}
                      onChange={(e) => handleParameterChange('educationChange', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-10 text-center">
                      {parameters.educationChange > 0 ? '+' : ''}{parameters.educationChange}%
                    </span>
                  </div>
                </div>

                {/* Age Structure Change */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cambio en Estructura Etaria (años)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="-5"
                      max="10"
                      value={parameters.ageStructureChange}
                      onChange={(e) => handleParameterChange('ageStructureChange', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-10 text-center">
                      {parameters.ageStructureChange > 0 ? '+' : ''}{parameters.ageStructureChange}
                    </span>
                  </div>
                </div>

                {/* Migration Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tasa de Migración (%)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      value={parameters.migrationRate}
                      onChange={(e) => handleParameterChange('migrationRate', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-10 text-center">
                      {parameters.migrationRate > 0 ? '+' : ''}{parameters.migrationRate}%
                    </span>
                  </div>
                </div>

                {/* Timeframe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horizonte Temporal (años)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={parameters.timeframe}
                      onChange={(e) => handleParameterChange('timeframe', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-10 text-center">
                      {parameters.timeframe}
                    </span>
                  </div>
                </div>

                {/* Reset Button */}
                <div className="flex items-end">
                  <Button
                    onClick={() => setParameters({
                      urbanizationChange: 5,
                      educationChange: 10,
                      ageStructureChange: 2,
                      migrationRate: 3,
                      timeframe: 5,
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restablecer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scenarios List */}
        {scenarios.length > 0 ? (
          <div className="flex flex-wrap gap-3 mb-6">
            {scenarios.map((scenario, index) => (
              <button
                key={scenario.id}
                onClick={() => setActiveScenario(scenario.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeScenario === scenario.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
                  }
                `}
              >
                Escenario {index + 1}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hay escenarios generados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Configura los parámetros y genera un escenario para visualizar proyecciones demográficas
            </p>
          </div>
        )}

        {/* Active Scenario */}
        {activeScenarioData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scenario Overview */}
              <Card className="p-4 bg-white/30 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-600/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <FlaskConical className="h-5 w-5 mr-2" />
                  Escenario: {activeScenarioData.name}
                </h4>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Horizonte temporal:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activeScenarioData.timeframe} años (hasta {new Date().getFullYear() + activeScenarioData.timeframe})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Confianza del modelo:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activeScenarioData.modelConfidence}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Población proyectada:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(activeScenarioData.projectedPopulation)}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg mb-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Parámetros Aplicados
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Urbanización:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">
                        {activeScenarioData.parameters.urbanizationChange > 0 ? '+' : ''}
                        {activeScenarioData.parameters.urbanizationChange}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Educación:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">
                        {activeScenarioData.parameters.educationChange > 0 ? '+' : ''}
                        {activeScenarioData.parameters.educationChange}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Estructura etaria:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">
                        {activeScenarioData.parameters.ageStructureChange > 0 ? '+' : ''}
                        {activeScenarioData.parameters.ageStructureChange} años
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Migración:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-white">
                        {activeScenarioData.parameters.migrationRate > 0 ? '+' : ''}
                        {activeScenarioData.parameters.migrationRate}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Cambios Demográficos Proyectados
                  </h5>
                  <div className="space-y-2">
                    {activeScenarioData.demographicChanges.map((change, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className={`p-1 rounded-full mt-0.5 ${
                          change.impact === 'positive' ? 'bg-green-100 dark:bg-green-900/20' :
                          change.impact === 'neutral' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          {change.impact === 'positive' ? (
                            <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          ) : change.impact === 'negative' ? (
                            <svg className="h-3 w-3 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          ) : (
                            <svg className="h-3 w-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {change.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Political Impact */}
              <Card className="p-4 bg-white/30 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-600/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Impacto Político Proyectado
                </h4>
                
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeScenarioData.politicalProjection}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="year" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[-1, 1]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="participation"
                        name="Participación"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="engagement"
                        name="Engagement"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="sentiment"
                        name="Sentiment"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg mb-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Impacto Electoral Proyectado
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {activeScenarioData.electoralImpact}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Proyección basada en modelos estadísticos con {activeScenarioData.modelConfidence}% de confianza
                    </span>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </Card>
            </div>

            {/* Segment Impact */}
            <div className="mt-6">
              <Card className="p-6 bg-white/30 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-600/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Impacto por Segmento Demográfico
                </h4>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeScenarioData.segmentImpact}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="currentEngagement" name="Engagement Actual" fill="#3B82F6" />
                      <Bar dataKey="projectedEngagement" name="Engagement Proyectado" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                      Segmentos con Mayor Crecimiento
                    </h5>
                    <div className="space-y-2">
                      {activeScenarioData.segmentImpact
                        .sort((a, b) => (b.projectedEngagement - b.currentEngagement) - (a.projectedEngagement - a.currentEngagement))
                        .slice(0, 3)
                        .map((segment, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {segment.segment}
                            </span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              +{(segment.projectedEngagement - segment.currentEngagement).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                      Recomendación Estratégica
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activeScenarioData.strategicRecommendation}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
};