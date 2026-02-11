import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Map } from 'lucide-react';
import { GeographicPage } from '../geographic/GeographicPage';
import { DemographicsPage } from '../demographics/DemographicsPage';

type TabId = 'geographic' | 'demographics';

const tabs = [
  { id: 'geographic' as TabId, label: 'Análisis Geográfico', icon: Map, description: 'Mapa de sentimiento por regiones' },
  { id: 'demographics' as TabId, label: 'Análisis Demográfico', icon: Users, description: 'Segmentación y pirámides poblacionales' },
];

export const GeoDemographicsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('geographic');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Análisis Geográfico y Demográfico
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Distribución territorial y segmentación poblacional del sentimiento político
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200/50 dark:border-gray-700/50">
        <nav className="flex space-x-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200
                  ${isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <div className="text-left">
                  <span>{tab.label}</span>
                  <div className="text-xs text-gray-400 hidden lg:block">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        {activeTab === 'geographic' && <GeographicPage />}
        {activeTab === 'demographics' && <DemographicsPage />}
      </div>
    </motion.div>
  );
};
