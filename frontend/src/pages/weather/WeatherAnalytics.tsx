import React, { useState } from 'react';
import { WeatherDashboard } from '@/components/dashboards/WeatherDashboard';
import { Building2, Cloud } from 'lucide-react';

const WeatherAnalytics: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState({
    id: 'rathaus-hechingen',
    type: 'rathaus',
    area: 3200
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Wetter & Energieprognose
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Wetterbasierte Energieverbrauchsprognose und Optimierungsempfehlungen für Hechingen
          </p>
        </div>

        {/* Building Selector */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Gebäudeauswahl für Prognose:
            </span>
          </div>
          <select
            className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            defaultValue="rathaus"
            onChange={(e) => {
              const buildingData: Record<string, { id: string; type: string; area: number }> = {
                rathaus: { id: 'rathaus-hechingen', type: 'rathaus', area: 3200 },
                realschule: { id: 'realschule-hechingen', type: 'realschule', area: 4800 },
                grundschule: { id: 'grundschule-hechingen', type: 'grundschule', area: 2900 },
                gymnasium: { id: 'gymnasium-hechingen', type: 'gymnasium', area: 5500 },
                werkrealschule: { id: 'werkrealschule-hechingen', type: 'werkrealschule', area: 3100 },
                sporthallen: { id: 'sporthallen-hechingen', type: 'sporthallen', area: 6200 },
                hallenbad: { id: 'hallenbad-hechingen', type: 'hallenbad', area: 4100 },
              };
              setSelectedBuilding(buildingData[e.target.value]);
            }}
          >
            <option value="rathaus">Rathaus Hechingen (3.200 m²)</option>
            <option value="realschule">Realschule (4.800 m²)</option>
            <option value="grundschule">Grundschule Zollernstraße (2.900 m²)</option>
            <option value="gymnasium">Gymnasium (5.500 m²)</option>
            <option value="werkrealschule">Werkrealschule (3.100 m²)</option>
            <option value="sporthallen">Sporthallen (6.200 m²)</option>
            <option value="hallenbad">Hallenbad (4.100 m²)</option>
          </select>
        </div>

        {/* Weather Dashboard */}
        <WeatherDashboard 
          buildingId={selectedBuilding?.id || 'rathaus-hechingen'}
          buildingType={selectedBuilding?.type || 'rathaus'}
          buildingArea={selectedBuilding?.area || 3200}
        />

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              KI-gestützte Prognose
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Unsere Algorithmen analysieren Wetterdaten und historische Verbrauchsmuster für präzise Vorhersagen.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Energieeinsparungen
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Optimieren Sie Heizung und Kühlung basierend auf Wettervorhersagen für bis zu 15% Einsparungen.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Automatische Anpassungen
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Das System kann automatisch Heizungs- und Kühlsysteme basierend auf Prognosen anpassen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherAnalytics;