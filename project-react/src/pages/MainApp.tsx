import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Dashboard } from '../components/dashboard/Dashboard';
import { MonitoringPage } from '../components/monitoring/MonitoringPage';
import { SocialPage } from '../components/social/SocialPage';
import { GeoDemographicsPage } from '../components/geo-demographics/GeoDemographicsPage';
import { GovernmentPage } from '../components/government/GovernmentPage';
import { SurveysPage } from '../components/surveys/SurveysPage';
import { RecommendationsPage } from '../components/recommendations/RecommendationsPage';
import { SettingsPage } from '../components/settings/SettingsPage';

export const MainApp: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'social':
        return <SocialPage />;
      case 'geo-demographics':
        return <GeoDemographicsPage />;
      case 'government':
        return <GovernmentPage />;
      case 'surveys':
        return <SurveysPage />;
      case 'recommendations':
        return <RecommendationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <Header
        isCollapsed={sidebarCollapsed}
        activeSection={activeSection}
      />

      <main 
        className="transition-all duration-300 pt-16"
        style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '280px',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(17, 24, 39, 0.8)',
            color: '#F9FAFB',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(107, 114, 128, 0.3)',
          },
        }}
      />
    </div>
  );
};
