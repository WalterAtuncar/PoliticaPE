import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  BarChart2, 
  RefreshCw, 
  Search,
  Filter,
  Download,
  Clock,
  Database
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DataQualityMetrics } from '../../types/data';

interface DataQualityProps {
  metrics: DataQualityMetrics;
  isLoading: boolean;
}

export const DataQuality: React.FC<DataQualityProps> = ({ metrics, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'history'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchema, setSelectedSchema] = useState('all');

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // green
    if (score >= 80) return '#F59E0B'; // yellow
    if (score >= 70) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-orange-600 dark:text-orange-400';
      case 'low': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs rounded">Alta</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 text-xs rounded">Media</span>;
      case 'low':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs rounded">Baja</span>;
      default:
        return null;
    }
  };

  const filteredIssues = metrics.topIssues.filter(issue => {
    if (searchTerm && !issue.table.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !issue.issue.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (selectedSchema !== 'all') {
      const schema = issue.table.split('.')[0];
      if (schema !== selectedSchema) return false;
    }
    
    return true;
  });

  const qualityDimensions = [
    { name: 'Completeness', value: metrics.completeness, color: '#3B82F6' },
    { name: 'Accuracy', value: metrics.accuracy, color: '#10B981' },
    { name: 'Consistency', value: metrics.consistency, color: '#F59E0B' },
    { name: 'Validity', value: metrics.validity, color: '#8B5CF6' },
    { name: 'Uniqueness', value: metrics.uniqueness, color: '#EC4899' },
    { name: 'Timeliness', value: metrics.timeliness, color: '#6366F1' },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glass className="p-6 col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Score General
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={getScoreColor(metrics.overallScore)}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 45 * (metrics.overallScore / 100)} ${2 * Math.PI * 45 * (1 - metrics.overallScore / 100)}`}
                  strokeDashoffset={2 * Math.PI * 45 * 0.25}
                  strokeLinecap="round"
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="24"
                  fontWeight="bold"
                  fill="currentColor"
                >
                  {metrics.overallScore.toFixed(1)}
                </text>
                <text
                  x="50"
                  y="65"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="currentColor"
                >
                  /100
                </text>
              </svg>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Última evaluación: {metrics.recentRuns[0].timestamp.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card glass className="p-6 col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Dimensiones de Calidad
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={qualityDimensions} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {qualityDimensions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Schema Quality */}
      <Card glass className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Calidad por Schema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.bySchema}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="schema" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {metrics.bySchema.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.bySchema}
                  dataKey="issues"
                  nameKey="schema"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {metrics.bySchema.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Recent Runs */}
      <Card glass className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ejecuciones Recientes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Tablas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Issues</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Estado</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentRuns.map((run, index) => (
                <tr key={run.id} className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{run.id}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{run.timestamp.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{run.tables}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{run.issues.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded">
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderIssuesTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card glass className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>

            <div className="relative">
              <select
                value={selectedSchema}
                onChange={(e) => setSelectedSchema(e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              >
                <option value="all">Todos los schemas</option>
                <option value="raw_data">raw_data</option>
                <option value="realtime_data">realtime_data</option>
                <option value="analytics">analytics</option>
                <option value="geography">geography</option>
                <option value="system">system</option>
              </select>
              <Database className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Issues List */}
      <Card glass className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Issues Detectados
        </h3>
        <div className="space-y-4">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue, index) => (
              <motion.div
                key={`${issue.table}-${issue.issue}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {issue.issue}
                      </h4>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Tabla: <span className="font-medium">{issue.table}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {issue.count.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">registros afectados</div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-600/50 flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Detectado: {new Date().toLocaleDateString()}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No se encontraron issues con los filtros actuales
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <Card glass className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Evolución de Calidad
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={[
              { date: '01/12', score: 82.5, issues: 3450 },
              { date: '08/12', score: 84.2, issues: 3120 },
              { date: '15/12', score: 85.8, issues: 2950 },
              { date: '22/12', score: 86.3, issues: 2850 },
              { date: '29/12', score: 87.5, issues: 2650 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" domain={[80, 100]} />
            <YAxis yAxisId="right" orientation="right" domain={[2000, 4000]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="score"
              stroke="#3B82F6"
              name="Quality Score"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="issues"
              stroke="#EF4444"
              name="Issues Count"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card glass className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Historial de Ejecuciones
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Tablas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Issues</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Duración</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Estado</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'dq-1', date: '29/12/2024', tables: 128, issues: 2650, score: 87.5, duration: '45m', status: 'completed' },
                { id: 'dq-2', date: '22/12/2024', tables: 128, issues: 2850, score: 86.3, duration: '42m', status: 'completed' },
                { id: 'dq-3', date: '15/12/2024', tables: 126, issues: 2950, score: 85.8, duration: '44m', status: 'completed' },
                { id: 'dq-4', date: '08/12/2024', tables: 125, issues: 3120, score: 84.2, duration: '40m', status: 'completed' },
                { id: 'dq-5', date: '01/12/2024', tables: 124, issues: 3450, score: 82.5, duration: '38m', status: 'completed' },
              ].map((run, index) => (
                <tr key={run.id} className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{run.id}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{run.date}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{run.tables}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{run.issues.toLocaleString()}</td>
                  <td className="py-3 px-4 font-medium" style={{ color: getScoreColor(run.score) }}>{run.score}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{run.duration}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded">
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card glass className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Calidad de Datos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitoreo y gestión de calidad de datos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Buena (90-100)</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Media (80-90)</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Baja (70-80)</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Crítica (&lt;70)</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-green-500 text-white'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
            }`}
          >
            <BarChart2 className="h-4 w-4 inline mr-2" />
            Visión General
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'issues'
                ? 'bg-green-500 text-white'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
            }`}
          >
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Issues ({metrics.topIssues.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-green-500 text-white'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
            }`}
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Historial
          </button>
        </div>
      </Card>

      {/* Tab Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'issues' && renderIssuesTab()}
          {activeTab === 'history' && renderHistoryTab()}
        </>
      )}
    </div>
  );
};