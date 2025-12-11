import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { Users, Save, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DemographicFilters, DemographicSegmentationData } from '../../types/demographics';

interface DemographicSegmentationProps {
  data: DemographicSegmentationData;
  isLoading: boolean;
  filters: DemographicFilters;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const DemographicSegmentation: React.FC<DemographicSegmentationProps> = ({
  data,
  isLoading,
  filters,
}) => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [showCreateSegment, setShowCreateSegment] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    ageGroups: [],
    nse: [],
    gender: [],
    education: [],
    zone: [],
  });

  const handleCreateSegment = () => {
    // In a real app, this would save the segment to the backend
    setShowCreateSegment(false);
    setNewSegmentName('');
    setSelectedFilters({
      ageGroups: [],
      nse: [],
      gender: [],
      education: [],
      zone: [],
    });
  };

  const toggleFilter = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      return {
        ...prev,
        [category]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-green-600 dark:text-green-400';
    if (sentiment > -0.2) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700">
          <p className="text-white font-medium mb-1">{payload[0].name}</p>
          <p className="text-sm text-blue-400">
            Población: {payload[0].value.toLocaleString()} 
            <span className="text-gray-400 text-xs ml-1">
              ({((payload[0].value / data.totalPopulation) * 100).toFixed(1)}%)
            </span>
          </p>
          <p className="text-sm text-green-400">
            Engagement: {payload[0].payload.engagement.toFixed(1)}%
          </p>
          <p className="text-sm" style={{ color: payload[0].payload.sentiment > 0 ? '#10B981' : '#EF4444' }}>
            Sentiment: {payload[0].payload.sentiment > 0 ? '+' : ''}{payload[0].payload.sentiment.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Segmentation Overview */}
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Segmentación Demográfica
            </h3>
          </div>
          
          <Button
            onClick={() => setShowCreateSegment(true)}
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Segmento
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Pie Chart */}
          <div className="col-span-12 lg:col-span-5">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.segments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="population"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      onClick={(entry) => setActiveSegment(entry.id)}
                    >
                      {data.segments.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          stroke={activeSegment === entry.id ? '#ffffff' : 'none'}
                          strokeWidth={activeSegment === entry.id ? 3 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Segments List */}
          <div className="col-span-12 lg:col-span-7">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.segments.map((segment, index) => (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 cursor-pointer
                    ${activeSegment === segment.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
                      : 'bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                  onClick={() => setActiveSegment(segment.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {segment.name}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Población:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {segment.population.toLocaleString()} 
                        <span className="text-xs text-gray-500 ml-1">
                          ({((segment.population / data.totalPopulation) * 100).toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Engagement:</span>
                      <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                        {segment.engagement.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Sentiment:</span>
                      <span className={`ml-2 font-medium ${getSentimentColor(segment.sentiment)}`}>
                        {segment.sentiment > 0 ? '+' : ''}{segment.sentiment.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Participación:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {segment.participation.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {segment.characteristics.map((char, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Segment Details */}
      {activeSegment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Análisis de Segmento: {data.segments.find(s => s.id === activeSegment)?.name}
              </h3>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Exportar Perfil
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Segment Metrics */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Métricas Políticas
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Engagement', value: data.segments.find(s => s.id === activeSegment)?.engagement || 0 },
                        { name: 'Participación', value: data.segments.find(s => s.id === activeSegment)?.participation || 0 },
                        { name: 'Sentiment', value: (data.segments.find(s => s.id === activeSegment)?.sentiment || 0) * 50 + 50 }, // Normalize to 0-100
                        { name: 'Influencia', value: data.segments.find(s => s.id === activeSegment)?.influence || 0 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Segment Characteristics */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Características Demográficas
                </h4>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        Edad Promedio
                      </span>
                      <span className="text-sm font-bold text-blue-900 dark:text-blue-300">
                        {data.segments.find(s => s.id === activeSegment)?.averageAge || 0} años
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${((data.segments.find(s => s.id === activeSegment)?.averageAge || 0) / 80) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-900 dark:text-green-300">
                        Nivel Educativo
                      </span>
                      <span className="text-sm font-bold text-green-900 dark:text-green-300">
                        {data.segments.find(s => s.id === activeSegment)?.educationIndex || 0}/100
                      </span>
                    </div>
                    <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-1.5">
                      <div 
                        className="bg-green-600 h-1.5 rounded-full" 
                        style={{ width: `${data.segments.find(s => s.id === activeSegment)?.educationIndex || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                        Nivel Socioeconómico
                      </span>
                      <span className="text-sm font-bold text-purple-900 dark:text-purple-300">
                        {data.segments.find(s => s.id === activeSegment)?.nseIndex || 0}/100
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 dark:bg-purple-700 rounded-full h-1.5">
                      <div 
                        className="bg-purple-600 h-1.5 rounded-full" 
                        style={{ width: `${data.segments.find(s => s.id === activeSegment)?.nseIndex || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-orange-900 dark:text-orange-300">
                        Urbanidad
                      </span>
                      <span className="text-sm font-bold text-orange-900 dark:text-orange-300">
                        {data.segments.find(s => s.id === activeSegment)?.urbanPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-orange-200 dark:bg-orange-700 rounded-full h-1.5">
                      <div 
                        className="bg-orange-600 h-1.5 rounded-full" 
                        style={{ width: `${data.segments.find(s => s.id === activeSegment)?.urbanPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Political Context */}
            <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-600/50">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Contexto Político
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Temas Prioritarios
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {data.segments.find(s => s.id === activeSegment)?.keyTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Canales Preferidos
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {data.segments.find(s => s.id === activeSegment)?.preferredChannels.map((channel, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  Recomendación Estratégica
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {data.segments.find(s => s.id === activeSegment)?.strategicRecommendation || 
                   'No hay recomendaciones disponibles para este segmento.'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Create Segment Modal */}
      {showCreateSegment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Crear Nuevo Segmento
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del segmento
                  </label>
                  <input
                    type="text"
                    value={newSegmentName}
                    onChange={(e) => setNewSegmentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Ej: Jóvenes Urbanos NSE B-C"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Criterios de segmentación
                    </label>
                    <span className="text-xs text-gray-500">
                      Selecciona múltiples opciones
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Age Groups */}
                    <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Grupos de edad
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {['18-25', '26-35', '36-50', '50+'].map((age) => (
                          <button
                            key={age}
                            onClick={() => toggleFilter('ageGroups', age)}
                            className={`
                              px-2 py-1 rounded text-xs font-medium transition-colors
                              ${selectedFilters.ageGroups.includes(age)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }
                            `}
                          >
                            {age} años
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* NSE */}
                    <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        Nivel socioeconómico
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {['A', 'B', 'C', 'D', 'E'].map((nse) => (
                          <button
                            key={nse}
                            onClick={() => toggleFilter('nse', nse)}
                            className={`
                              px-2 py-1 rounded text-xs font-medium transition-colors
                              ${selectedFilters.nse.includes(nse)
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }
                            `}
                          >
                            NSE {nse}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Género
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'male', label: 'Masculino' },
                          { id: 'female', label: 'Femenino' }
                        ].map((gender) => (
                          <button
                            key={gender.id}
                            onClick={() => toggleFilter('gender', gender.id)}
                            className={`
                              px-2 py-1 rounded text-xs font-medium transition-colors
                              ${selectedFilters.gender.includes(gender.id)
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }
                            `}
                          >
                            {gender.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        Nivel educativo
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'primary', label: 'Primaria' },
                          { id: 'secondary', label: 'Secundaria' },
                          { id: 'higher', label: 'Superior' },
                          { id: 'postgrad', label: 'Posgrado' }
                        ].map((edu) => (
                          <button
                            key={edu.id}
                            onClick={() => toggleFilter('education', edu.id)}
                            className={`
                              px-2 py-1 rounded text-xs font-medium transition-colors
                              ${selectedFilters.education.includes(edu.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }
                            `}
                          >
                            {edu.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Zone */}
                    <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <Home className="h-4 w-4 mr-1" />
                        Zona
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'urban', label: 'Urbana' },
                          { id: 'rural', label: 'Rural' }
                        ].map((zone) => (
                          <button
                            key={zone.id}
                            onClick={() => toggleFilter('zone', zone.id)}
                            className={`
                              px-2 py-1 rounded text-xs font-medium transition-colors
                              ${selectedFilters.zone.includes(zone.id)
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }
                            `}
                          >
                            {zone.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Regions */}
                    <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Regiones
                      </h4>
                      <div className="flex items-center space-x-2">
                        <select className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="all">Todas las regiones</option>
                          {data.regions.map(region => (
                            <option key={region.id} value={region.id}>{region.name}</option>
                          ))}
                        </select>
                        <button className="p-1 bg-blue-500 text-white rounded">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Segment Preview */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900 dark:text-blue-300">
                      Previsualización del Segmento
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedFilters.ageGroups.length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                        Edad: {selectedFilters.ageGroups.join(', ')}
                      </span>
                    )}
                    {selectedFilters.nse.length > 0 && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded">
                        NSE: {selectedFilters.nse.join(', ')}
                      </span>
                    )}
                    {selectedFilters.gender.length > 0 && (
                      <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs rounded">
                        Género: {selectedFilters.gender.map(g => g === 'male' ? 'Masculino' : 'Femenino').join(', ')}
                      </span>
                    )}
                    {selectedFilters.education.length > 0 && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded">
                        Educación: {selectedFilters.education.join(', ')}
                      </span>
                    )}
                    {selectedFilters.zone.length > 0 && (
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded">
                        Zona: {selectedFilters.zone.map(z => z === 'urban' ? 'Urbana' : 'Rural').join(', ')}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-blue-700 dark:text-blue-400">
                    Población estimada: <span className="font-medium">3.2M</span> personas
                    <span className="text-xs ml-2">(10.2% del total nacional)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowCreateSegment(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateSegment}
                  variant="primary"
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  disabled={!newSegmentName || Object.values(selectedFilters).every(arr => arr.length === 0)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Segmento
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};