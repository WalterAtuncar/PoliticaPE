import React from 'react';
import { Card } from '../ui/Card';

interface GeographicLegendProps {
  metric: string;
  getColorByValue: (value: number) => string;
}

const metricLabels = {
  sentiment: { label: 'Sentiment Score', min: -1, max: 1, unit: '' },
  engagement: { label: 'Engagement Rate', min: 0, max: 15, unit: '%' },
  shareOfVoice: { label: 'Share of Voice', min: 0, max: 100, unit: '%' },
  mentions: { label: 'Menciones', min: 0, max: 5000, unit: '' },
  participation: { label: 'Participación', min: 0, max: 100, unit: '%' },
};

export const GeographicLegend: React.FC<GeographicLegendProps> = ({
  metric,
  getColorByValue,
}) => {
  const config = metricLabels[metric as keyof typeof metricLabels] || metricLabels.sentiment;
  const steps = 5;
  const stepSize = (config.max - config.min) / steps;

  return (
    <Card glass className="absolute bottom-4 left-4 p-4 min-w-[200px]">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        {config.label}
      </h4>
      <div className="space-y-2">
        {Array.from({ length: steps + 1 }, (_, i) => {
          const value = config.min + (stepSize * i);
          const normalizedValue = metric === 'sentiment' ? value : value / config.max;
          
          return (
            <div key={i} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: getColorByValue(normalizedValue) }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {value.toFixed(metric === 'sentiment' ? 1 : 0)}{config.unit}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Click en regiones para seleccionar
        </p>
      </div>
    </Card>
  );
};