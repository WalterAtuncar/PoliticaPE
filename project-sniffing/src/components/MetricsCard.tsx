import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow';
  trend?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-900',
    green: 'text-green-400 bg-green-900',
    red: 'text-red-400 bg-red-900',
    yellow: 'text-yellow-400 bg-yellow-900'
  };

  const trendColor = trend?.startsWith('+') ? 'text-green-400' : 
                   trend?.startsWith('-') ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trendColor}`}>
              {trend} desde la última hora
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;