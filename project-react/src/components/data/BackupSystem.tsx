import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Upload, 
  Settings,
  Calendar,
  HardDrive,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BackupInfo } from '../../types/data';

interface BackupSystemProps {
  backups: BackupInfo[];
  isLoading: boolean;
}

export const BackupSystem: React.FC<BackupSystemProps> = ({ backups, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'backups' | 'schedule' | 'settings'>('backups');
  const [showCreateBackup, setShowCreateBackup] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatSize = (sizeInGB: number) => {
    if (sizeInGB >= 1000) {
      return `${(sizeInGB / 1000).toFixed(1)} TB`;
    }
    return `${sizeInGB.toFixed(1)} GB`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded">Completado</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded">En progreso</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs rounded">Fallido</span>;
      case 'scheduled':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs rounded">Programado</span>;
      default:
        return null;
    }
  };

  const renderBackupsTab = () => (
    <div className="space-y-6">
      {/* Backup Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card glass className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Último Backup
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatDate(backups[0].timestamp)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Completado exitosamente
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tamaño Total
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatSize(backups.reduce((sum, b) => sum + b.size, 0))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {backups.length} backups
              </p>
            </div>
            <HardDrive className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Próximo Backup
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatDate(new Date(Date.now() + 16 * 60 * 60 * 1000))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Backup completo
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ratio de Compresión
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {(backups[0].compressionRatio * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Promedio
              </p>
            </div>
            <Save className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Backup List */}
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historial de Backups
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowCreateBackup(true)}
              variant="primary"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Backup
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Tamaño</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Duración</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup, index) => (
                <tr key={backup.id} className="border-b border-gray-200/30 dark:border-gray-700/30">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{backup.id}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatDate(backup.timestamp)}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">{backup.type}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatSize(backup.size)}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{backup.duration} min</td>
                  <td className="py-3 px-4">{getStatusBadge(backup.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Download className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <RefreshCw className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <Card glass className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Programación de Backups
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Backup Completo
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Frecuencia:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Diario</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Hora:</span>
                  <span className="font-medium text-gray-900 dark:text-white">02:00 AM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Retención:</span>
                  <span className="font-medium text-gray-900 dark:text-white">30 días</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Próxima ejecución:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(new Date(Date.now() + 16 * 60 * 60 * 1000))}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50 flex justify-end">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-500" />
                Backup Incremental
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Frecuencia:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Cada 4 horas</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Schemas:</span>
                  <span className="font-medium text-gray-900 dark:text-white">raw_data, realtime_data</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Retención:</span>
                  <span className="font-medium text-gray-900 dark:text-white">7 días</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Próxima ejecución:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(new Date(Date.now() + 4 * 60 * 60 * 1000))}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50 flex justify-end">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Calendario de Backups
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div key={dayIndex} className="text-center">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayIndex]}
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, hourIndex) => {
                      const hour = hourIndex * 4 + 2; // 2, 6, 10, 14, 18, 22
                      const isFullBackup = hour === 2;
                      const isIncremental = hour % 4 === 2;
                      
                      return (
                        <div
                          key={hour}
                          className={`
                            text-xs py-1 px-2 rounded
                            ${isFullBackup 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                              : isIncremental
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }
                          `}
                        >
                          {hour.toString().padStart(2, '0')}:00
                          {isFullBackup && ' F'}
                          {isIncremental && ' I'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card glass className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuración de Backup y Restore
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Políticas de Retención
              </h4>
              <div className="space-y-4">
                <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Backups Completos</span>
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">30 días</span>
                  </div>
                  <input
                    type="range"
                    min="7"
                    max="90"
                    step="1"
                    defaultValue="30"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>7 días</span>
                    <span>90 días</span>
                  </div>
                </div>

                <div className="p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Backups Incrementales</span>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded">7 días</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    defaultValue="7"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 día</span>
                    <span>30 días</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Ubicaciones de Almacenamiento
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-900 dark:text-white">AWS S3</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded">Primario</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-900 dark:text-white">Google Cloud Storage</span>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">Secundario</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-white">Local Storage</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 px-2 py-1 rounded">Emergencia</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/30 dark:bg-gray-800/30 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Configuración de Compresión
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Algoritmo</label>
                <select className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm">
                  <option>ZSTD</option>
                  <option>GZIP</option>
                  <option>LZ4</option>
                  <option>BZIP2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Nivel de Compresión</label>
                <select className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm">
                  <option>Bajo (más rápido)</option>
                  <option selected>Medio</option>
                  <option>Alto (mejor ratio)</option>
                  <option>Máximo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Paralelismo</label>
                <select className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm">
                  <option>1 thread</option>
                  <option>2 threads</option>
                  <option selected>4 threads</option>
                  <option>8 threads</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline">
              Cancelar
            </Button>
            <Button variant="primary">
              Guardar Configuración
            </Button>
          </div>
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg flex items-center justify-center">
              <Save className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Backup y Restore
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestión de copias de seguridad y restauración
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('backups')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'backups'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
              }`}
            >
              <Save className="h-4 w-4 inline mr-2" />
              Backups
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Programación
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Configuración
            </button>
          </div>
        </div>
      </Card>

      {/* Tab Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'backups' && renderBackupsTab()}
          {activeTab === 'schedule' && renderScheduleTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </>
      )}

      {/* Create Backup Modal */}
      {showCreateBackup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Crear Nuevo Backup
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Backup
                  </label>
                  <select className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm">
                    <option>Backup Completo</option>
                    <option>Backup Incremental</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Schemas a incluir
                  </label>
                  <div className="space-y-2">
                    {['raw_data', 'realtime_data', 'analytics', 'geography', 'auth', 'system'].map((schema) => (
                      <label key={schema} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{schema}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destino
                  </label>
                  <select className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm">
                    <option>AWS S3 (Primario)</option>
                    <option>Google Cloud Storage (Secundario)</option>
                    <option>Local Storage (Emergencia)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Compresión
                  </label>
                  <select className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm">
                    <option>ZSTD (Medio - Recomendado)</option>
                    <option>GZIP (Bajo)</option>
                    <option>LZ4 (Rápido)</option>
                    <option>BZIP2 (Alto)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                      Advertencia
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Crear un backup completo puede afectar temporalmente el rendimiento del sistema. Se recomienda programarlo durante horas de baja actividad.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowCreateBackup(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Iniciar Backup
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};