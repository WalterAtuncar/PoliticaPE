import React, { useState } from 'react';
import { SettingsTabs } from './SettingsTabs';
import { SettingsPage } from './SettingsPage';
import { TagsPanel } from './TagsPanel';

export const SettingsContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scraping');

  const renderContent = () => {
    switch (activeTab) {
      case 'scraping':
        return <SettingsPage />;
      case 'tags':
        return <TagsPanel />;
      case 'users':
        return (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Usuarios y Accesos</h3>
            <p className="text-gray-500">Módulo en desarrollo</p>
          </div>
        );
      default:
        return (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h3>
            <p className="text-gray-500">Módulo en desarrollo</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
};
