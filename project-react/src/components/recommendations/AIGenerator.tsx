import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap, Target, Users, MapPin } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface AIGeneratorProps {
  onClose: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({
  onClose,
  onGenerate,
  isGenerating,
}) => {
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([]);

  const focusAreas = [
    { id: 'immediate', label: 'Oportunidades Inmediatas', icon: Zap, color: 'text-yellow-600' },
    { id: 'regional', label: 'Fortalecimiento Regional', icon: Target, color: 'text-green-600' },
    { id: 'recovery', label: 'Recuperación Territorial', icon: Brain, color: 'text-red-600' },
    { id: 'expansion', label: 'Expansión Demográfica', icon: Users, color: 'text-purple-600' },
  ];

  const regions = [
    'Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Puno', 'Ica', 'Junín'
  ];

  const demographics = [
    'Jóvenes (18-25)', 'Adultos jóvenes (26-35)', 'Adultos (36-50)', 'Adultos mayores (50+)',
    'NSE A', 'NSE B', 'NSE C', 'NSE D', 'NSE E', 'Mujeres', 'Hombres'
  ];

  const toggleSelection = (item: string, list: string[], setter: (list: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleGenerate = () => {
    onGenerate();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Generador de Recomendaciones IA"
      size="xl"
    >
      <div className="space-y-6">
        {/* AI Introduction */}
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Inteligencia Artificial Política
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Nuestro algoritmo analizará datos en tiempo real de sentiment, engagement, demografía y contexto político 
            para generar estrategias personalizadas y optimizadas para tu campaña.
          </p>
        </div>

        {/* Focus Areas Selection */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Áreas de Enfoque (Opcional)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {focusAreas.map((area) => {
              const Icon = area.icon;
              const isSelected = selectedFocus.includes(area.id);
              
              return (
                <button
                  key={area.id}
                  onClick={() => toggleSelection(area.id, selectedFocus, setSelectedFocus)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-left
                    ${isSelected 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-purple-600' : area.color}`} />
                    <div>
                      <div className={`font-medium text-sm ${isSelected ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                        {area.label}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Regions Selection */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Regiones Prioritarias (Opcional)
          </h4>
          <div className="flex flex-wrap gap-2">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => toggleSelection(region, selectedRegions, setSelectedRegions)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${selectedRegions.includes(region)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <MapPin className="h-3 w-3 inline mr-1" />
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Demographics Selection */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Segmentos Demográficos (Opcional)
          </h4>
          <div className="flex flex-wrap gap-2">
            {demographics.map((demo) => (
              <button
                key={demo}
                onClick={() => toggleSelection(demo, selectedDemographics, setSelectedDemographics)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${selectedDemographics.includes(demo)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <Users className="h-3 w-3 inline mr-1" />
                {demo}
              </button>
            ))}
          </div>
        </div>

        {/* AI Process Visualization */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl"
          >
            <div className="flex items-center space-x-4 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center"
              >
                <Brain className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  IA Generando Estrategias...
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analizando datos políticos en tiempo real
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                'Analizando sentiment por regiones...',
                'Evaluando engagement demográfico...',
                'Identificando oportunidades territoriales...',
                'Calculando ROI proyectado...',
                'Generando recomendaciones personalizadas...'
              ].map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.5 }}
                  className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: index * 0.5 }}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                  />
                  <span>{step}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedFocus.length > 0 || selectedRegions.length > 0 || selectedDemographics.length > 0
              ? 'Configuración personalizada aplicada'
              : 'Se usarán todos los datos disponibles'
            }
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleGenerate}
              variant="primary"
              isLoading={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generando...' : 'Generar Recomendaciones IA'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};