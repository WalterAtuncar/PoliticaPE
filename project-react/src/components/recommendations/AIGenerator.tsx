import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap, Target, Users, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PoliticalFigure } from '../../types/recommendations';

interface AIGeneratorProps {
  onClose: () => void;
  onGenerate: (figureIds: string[], focusAreas: string[]) => void;
  isGenerating: boolean;
  figures: PoliticalFigure[];
  error?: string | null;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({
  onClose,
  onGenerate,
  isGenerating,
  figures,
  error,
}) => {
  const [selectedFigureIds, setSelectedFigureIds] = useState<string[]>([]);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);

  const focusAreas = [
    { id: 'territorial_priority', label: 'Prioridad territorial', icon: Target, color: 'text-amber-600' },
    { id: 'message_of_day', label: 'Mensaje del día', icon: Zap, color: 'text-yellow-600' },
    { id: 'crisis_response', label: 'Respuesta a crisis', icon: Brain, color: 'text-red-600' },
    { id: 'rival_contrast', label: 'Contraste con rivales', icon: Users, color: 'text-purple-600' },
    { id: 'ground_game', label: 'Trabajo de calle', icon: Target, color: 'text-green-600' },
    { id: 'digital_push', label: 'Empuje digital', icon: Zap, color: 'text-blue-600' },
  ];

  const toggleFigure = (id: string) => {
    setSelectedFigureIds(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleFocus = (id: string) => {
    setSelectedFocus(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    const areas = selectedFocus.length > 0
      ? selectedFocus
      : focusAreas.map(f => f.id);
    onGenerate(selectedFigureIds, areas);
  };

  const activeFigures = figures.filter(f => f.is_active);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Generador de Recomendaciones IA"
      size="xl"
    >
      <div className="space-y-6">
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Análisis con Claude IA
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Selecciona las figuras políticas a analizar. La IA usará los datos reales de redes sociales
            para generar recomendaciones estratégicas personalizadas.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Figuras Políticas a Analizar *
          </h4>
          {activeFigures.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              No hay figuras políticas registradas. Agrega figuras desde la sección de gestión.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {activeFigures.map((fig) => {
                const isSelected = selectedFigureIds.includes(fig.id);
                return (
                  <button
                    key={fig.id}
                    onClick={() => toggleFigure(fig.id)}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 text-left flex items-center gap-3
                      ${isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      {isSelected ? <Check className="h-4 w-4" /> : fig.display_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className={`font-medium text-sm truncate ${isSelected ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                        {fig.display_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {fig.party_name || 'Independiente'} {fig.current_position ? `· ${fig.current_position}` : ''}
                      </div>
                    </div>
                    {fig.monitoring_priority === 'high' && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded flex-shrink-0">Alta</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {activeFigures.length > 0 && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setSelectedFigureIds(activeFigures.map(f => f.id))}
                className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400"
              >
                Seleccionar todas
              </button>
              <span className="text-xs text-gray-400">|</span>
              <button
                onClick={() => setSelectedFigureIds([])}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </div>

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
                  onClick={() => toggleFocus(area.id)}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200 text-left
                    ${isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-purple-600' : area.color}`} />
                    <span className={`font-medium text-sm ${isSelected ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                      {area.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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
                  Claude IA analizando datos...
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Procesando {selectedFigureIds.length} figura(s) política(s)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                'Recopilando posts de redes sociales...',
                'Analizando sentimiento y engagement...',
                'Evaluando presencia por regiones...',
                'Consultando a Claude IA...',
                'Generando recomendaciones estratégicas...'
              ].map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.8 }}
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

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedFigureIds.length} figura(s) seleccionada(s)
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={onClose} variant="outline" disabled={isGenerating}>
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              variant="primary"
              isLoading={isGenerating}
              disabled={selectedFigureIds.length === 0 || isGenerating}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generando...' : 'Generar con Claude IA'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
