import React from 'react';
import { motion } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Database, 
  Server, 
  HardDrive, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  X,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface DatabaseMetrics {
  totalDataVolume: number;
  dataVolumeGrowth: number;
  totalTables: number;
  tablesWithIssues: number;
  totalRows: number;
  recordsGrowth: number;
  averageLatency: number;
  latencyImprovement: number;
  volumeBySchema: Array<{ name: string; value: number }>;
  dataGrowthOverTime: Array<{ date: string; volume: number }>;
  cpuUsage: number;
  cpuUsageTrend: number;
  memoryUsage: number;
  memoryUsageTrend: number;
  diskUsage: number;
  diskUsageTrend: number;
  performanceOverTime: Array<{ time: string; queryTime: number; connections: number; iops: number }>;
  failedPipelinesCount: number;
  pipelineStatus: { running: number; retrying: number; failed: number };
  qualityScore: number;
  apiConnectionsActive: number;
  apiConnectionsDown: number;
  lastBackupStatus: string;
  lastBackupTime: string;
  recentErrors: Array<{ message: string; time: string; location: string }>;
  topTables: Array<{ 
    name: string; 
    schema: string; 
    records: number; 
    size: number; 
    queriesPerMinute: number; 
    avgQueryTime: number; 
  }>;
}

interface SchemaInfo {
  name: string;
  tables: number;
  size: number;
}

interface TableInfo {
  name: string;
  schema: string;
  records: number;
  size: number;
}

interface DataAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
  status: string;
  timestamp: string;
}

interface DatabaseOverviewProps {
  metrics: DatabaseMetrics;
  schemas?: SchemaInfo[];
  tables?: TableInfo[];
  alerts?: DataAlert[];
  isLoading: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const DatabaseOverview: React.FC<DatabaseOverviewProps> = ({
  metrics,
  isLoading,
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Card glass className="p-6">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                  Volumen Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatBytes(metrics.totalDataVolume || 0)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{metrics.dataVolumeGrowth || 0}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
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
                  Tablas Activas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalTables || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {metrics.tablesWithIssues || 0} con problemas
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Server className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
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
                  Registros Totales
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(metrics.totalRows)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{metrics.recordsGrowth || 0}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
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
                  Latencia Promedio
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.averageLatency || 0}ms
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  -{metrics.latencyImprovement || 0}% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Data Volume by Schema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Volumen por Schema
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.volumeBySchema || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {(metrics.volumeBySchema || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                  formatter={(value: number) => [formatBytes(value), 'Volumen']}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Crecimiento de Datos
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.dataGrowthOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                  formatter={(value: number) => [formatBytes(value), 'Volumen']}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Database Health & Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Salud y Performance de la Base de Datos
            </h3>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tiempo real
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* CPU Usage */}
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Uso de CPU
                </h4>
                <div className="flex items-center space-x-1">
                  {(metrics.cpuUsage || 0) > 80 ? (
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    (metrics.cpuUsage || 0) > 80 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {metrics.cpuUsageTrend || 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (metrics.cpuUsage || 0) > 80 ? 'bg-red-500' :
                        (metrics.cpuUsage || 0) > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${metrics.cpuUsage || 0}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {metrics.cpuUsage || 0}%
                </span>
              </div>
            </div>
            
            {/* Memory Usage */}
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Uso de Memoria
                </h4>
                <div className="flex items-center space-x-1">
                  {(metrics.memoryUsage || 0) > 80 ? (
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    (metrics.memoryUsage || 0) > 80 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {metrics.memoryUsageTrend || 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (metrics.memoryUsage || 0) > 80 ? 'bg-red-500' :
                        (metrics.memoryUsage || 0) > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${metrics.memoryUsage || 0}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {metrics.memoryUsage || 0}%
                </span>
              </div>
            </div>
            
            {/* Disk Usage */}
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Uso de Disco
                </h4>
                <div className="flex items-center space-x-1">
                  {(metrics.diskUsage || 0) > 80 ? (
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    (metrics.diskUsage || 0) > 80 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {metrics.diskUsageTrend || 0}%
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (metrics.diskUsage || 0) > 80 ? 'bg-red-500' :
                        (metrics.diskUsage || 0) > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${metrics.diskUsage || 0}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {metrics.diskUsage || 0}%
                </span>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.performanceOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="time" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="queryTime" 
                name="Tiempo de Query (ms)"
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="connections" 
                name="Conexiones"
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="iops" 
                name="IOPS"
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card glass className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Estado del Sistema
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* ETL Pipelines */}
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  ETL Pipelines
                </h4>
                {(metrics.failedPipelinesCount || 0) > 0 ? (
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded text-xs font-medium">
                    {metrics.failedPipelinesCount} fallidos
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded text-xs font-medium">
                    Todos activos
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 grid grid-cols-3 gap-1">
                  <div className="h-2 rounded bg-green-500" style={{ width: `${metrics.pipelineStatus?.running || 0}%` }}></div>
                  <div className="h-2 rounded bg-yellow-500" style={{ width: `${metrics.pipelineStatus?.retrying || 0}%` }}></div>
                  <div className="h-2 rounded bg-red-500" style={{ width: `${metrics.pipelineStatus?.failed || 0}%` }}></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {metrics.pipelineStatus?.running || 0}% activos
                </span>
              </div>
            </div>
            
            {/* Data Quality */}
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Calidad de Datos
                </h4>
                {(metrics.qualityScore || 0) < 80 ? (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded text-xs font-medium">
                    Requiere atención
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded text-xs font-medium">
                    Buena
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (metrics.qualityScore || 0) > 90 ? 'bg-green-500' :
                        (metrics.qualityScore || 0) > 80 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${metrics.qualityScore || 0}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {metrics.qualityScore || 0}%
                </span>
              </div>
            </div>
            
            {/* API Connections */}
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Conexiones API
                </h4>
                {(metrics.apiConnectionsDown || 0) > 0 ? (
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded text-xs font-medium">
                    {metrics.apiConnectionsDown} caídas
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded text-xs font-medium">
                    Todas activas
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {metrics.apiConnectionsActive || 0} activas
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <X className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {metrics.apiConnectionsDown || 0} caídas
                  </span>
                </div>
              </div>
            </div>
            
            {/* Backup Status */}
            <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Estado de Backups
                </h4>
                {metrics.lastBackupStatus === 'success' ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded text-xs font-medium">
                    Exitoso
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded text-xs font-medium">
                    Fallido
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Último: {metrics.lastBackupTime || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Recent Errors */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Errores Recientes
              </h4>
              <Button variant="outline" size="sm">
                Ver todos
              </Button>
            </div>
            
            {(metrics.recentErrors || []).length > 0 ? (
              <div className="space-y-2">
                {(metrics.recentErrors || []).map((error, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                            {error.message}
                          </h5>
                          <span className="text-xs text-gray-500">
                            {error.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {error.location}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No hay errores recientes
                </p>
              </div>
            )}
          </div>
          
          {/* Top Tables */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Tablas Más Utilizadas
              </h4>
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Tabla
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Schema
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Registros
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Tamaño
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Queries/min
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      Tiempo Promedio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(metrics.topTables || []).map((table, index) => (
                    <motion.tr
                      key={table.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                        {table.name}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {table.schema}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {formatNumber(table.records)}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {formatBytes(table.size)}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {table.queriesPerMinute}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {table.avgQueryTime}ms
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};