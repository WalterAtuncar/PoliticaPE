import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SettingsHeader } from './SettingsHeader';
import { SettingsTabs } from './SettingsTabs';
import { UsersManagement } from './tabs/UsersManagement';
import { SettingsFilters } from '../../types/settings';
import { useSettings } from '../../hooks/useSettings';

const initialFilters: SettingsFilters = {
  search: '',
  status: 'all',
  role: '',
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  },
  sortBy: 'name',
  sortOrder: 'asc'
};

export const SettingsPage: React.FC = () => {
  const [filters, setFilters] = useState<SettingsFilters>(initialFilters);
  const [activeTab, setActiveTab] = useState('users');

  const {
    users,
    roles,
    auditLogs,
    isLoading,
    isRefreshing,
    refreshData,
    createUser,
    updateUser,
    deleteUser
  } = useSettings(filters);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <UsersManagement
            users={users}
            roles={roles}
            isLoading={isLoading}
            onCreateUser={createUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
          />
        );
      case 'integrations':
        return (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-2">Integraciones</h3>
            <p>Gestión de APIs, bases de datos y servicios externos - En desarrollo</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-2">Notificaciones</h3>
            <p>Configuración de alertas y notificaciones - En desarrollo</p>
          </div>
        );
      case 'security':
        return (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-2">Seguridad</h3>
            <p>Políticas de seguridad y autenticación - En desarrollo</p>
          </div>
        );
      case 'backup':
        return (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-2">Backup</h3>
            <p>Respaldos y recuperación de datos - En desarrollo</p>
          </div>
        );
      case 'general':
        return (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-2">General</h3>
            <p>Configuración general del sistema - En desarrollo</p>
          </div>
        );
      case 'audit':
        return (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-2">Auditoría</h3>
            <p>Logs de auditoría y actividad - En desarrollo</p>
          </div>
        );
      default:
        return (
          <UsersManagement
            users={users}
            roles={roles}
            isLoading={isLoading}
            onCreateUser={createUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Filters */}
      <SettingsHeader
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
      />

      {/* Tabs Navigation */}
      <SettingsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertsCount={auditLogs.filter(log => log.status === 'failure').length}
      />

      {/* Main Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </motion.div>
  );
}; 