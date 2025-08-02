import React, { useState, useEffect } from 'react';
import { LazyLineChart, LazyBarChart } from '../../components/charts';

const GrundschuleDashboard: React.FC = () => {
  const [kpis, setKpis] = useState({
    energyIntensity: 76.8,
    co2Emissions: 18.2,
    pvSelfConsumption: 89.3,
    peakLoad: 42.5,
    energyCosts: 645.30
  });

  const [energyData] = useState([
    { time: '00:00', consumption: 15, production: 0, grid: 15, temperature: 18 },
    { time: '06:00', consumption: 20, production: 5, grid: 15, temperature: 19 },
    { time: '12:00', consumption: 45, production: 65, grid: -20, temperature: 22 },
    { time: '18:00', consumption: 25, production: 15, grid: 10, temperature: 21 },
    { time: '24:00', consumption: 18, production: 0, grid: 18, temperature: 19 }
  ]);

  const roomData = [
    { room: 'Klassenzimmer', consumption: 22, target: 25 },
    { room: 'Mensa', consumption: 12, target: 15 },
    { room: 'Turnhalle', consumption: 8, target: 10 },
    { room: 'Verwaltung', consumption: 5, target: 6 },
    { room: 'Aula', consumption: 6, target: 8 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prev => ({
        ...prev,
        energyIntensity: prev.energyIntensity + (Math.random() - 0.5) * 1,
        peakLoad: prev.peakLoad + (Math.random() - 0.5) * 2
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Grundschule Hechingen</h1>
          <p className="text-gray-600 mt-2">Bildungseinrichtung • Baujahr: 1992 • Fläche: 2,100 m² • Schüler: 280</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Energieintensität</p>
                <p className="text-2xl font-bold text-blue-600">{kpis.energyIntensity.toFixed(1)}</p>
                <p className="text-xs text-gray-500">kWh/m²/Jahr</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(kpis.energyIntensity / 120 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CO₂-Emissionen</p>
                <p className="text-2xl font-bold text-green-600">{kpis.co2Emissions.toFixed(1)}</p>
                <p className="text-xs text-gray-500">kg CO₂/m²/Jahr</p>
              </div>
              <div className="text-2xl">🌱</div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">↓ 22% vs. Vorjahr</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PV-Eigenverbrauch</p>
                <p className="text-2xl font-bold text-yellow-600">{kpis.pvSelfConsumption.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">von Gesamtproduktion</p>
              </div>
              <div className="text-2xl">☀️</div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${kpis.pvSelfConsumption}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Spitzenlast</p>
                <p className="text-2xl font-bold text-red-600">{kpis.peakLoad.toFixed(1)} kW</p>
                <p className="text-xs text-gray-500">heute um 12:15</p>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">↓ 8% vs. gestern</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Energiekosten</p>
                <p className="text-2xl font-bold text-purple-600">€{kpis.energyCosts.toFixed(0)}</p>
                <p className="text-xs text-gray-500">diesen Monat</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">↓ €78 vs. Vormonat</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Energy Consumption Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Energieverbrauch heute</h2>
            <LazyLineChart data={energyData} height={250} />
          </div>

          {/* Room-wise Consumption */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verbrauch nach Bereichen</h2>
            <LazyBarChart data={roomData.map(item => ({ name: item.room, value: item.consumption }))} height={250} />
          </div>
        </div>

        {/* Building Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gebäudedaten</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Baujahr</span>
                <span className="font-medium">1992</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nutzfläche</span>
                <span className="font-medium">2,100 m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PV-Anlage</span>
                <span className="font-medium">38 kWp</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heizung</span>
                <span className="font-medium">Wärmepumpe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Schüleranzahl</span>
                <span className="font-medium">280</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">PV-Anlage exzellent</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Wärmepumpe effizient</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">LED-Beleuchtung optimal</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Lüftung automatisch</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte Aktivitäten</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">12:15</div>
                <div className="text-gray-600">Mittagspause - Spitzenlast Mensa</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">10:30</div>
                <div className="text-gray-600">Optimaler PV-Eigenverbrauch</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">07:45</div>
                <div className="text-gray-600">Schulbeginn - Heizung aktiviert</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">06:30</div>
                <div className="text-gray-600">Automatische Beleuchtung gedimmt</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrundschuleDashboard; 