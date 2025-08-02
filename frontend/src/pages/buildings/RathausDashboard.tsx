import React, { useState, useEffect } from 'react';
import { LazyLineChart, LazyBarChart } from '../../components/charts';

const RathausDashboard: React.FC = () => {
  const [kpis, setKpis] = useState({
    energyIntensity: 142.5,
    co2Emissions: 28.7,
    pvSelfConsumption: 73.2,
    peakLoad: 89.4,
    energyCosts: 1247.80
  });

  const [energyData] = useState([
    { time: '00:00', consumption: 45, production: 0, grid: 45, temperature: 18 },
    { time: '06:00', consumption: 65, production: 15, grid: 50, temperature: 19 },
    { time: '12:00', consumption: 95, production: 120, grid: -25, temperature: 22 },
    { time: '18:00', consumption: 85, production: 45, grid: 40, temperature: 21 },
    { time: '24:00', consumption: 55, production: 0, grid: 55, temperature: 19 }
  ]);

  const roomData = [
    { room: 'Büros', consumption: 45, target: 40 },
    { room: 'Server', consumption: 25, target: 30 },
    { room: 'Beleuchtung', consumption: 15, target: 12 },
    { room: 'Heizung', consumption: 35, target: 32 },
    { room: 'Klimaanlage', consumption: 20, target: 18 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prev => ({
        ...prev,
        energyIntensity: prev.energyIntensity + (Math.random() - 0.5) * 2,
        peakLoad: prev.peakLoad + (Math.random() - 0.5) * 5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rathaus Hechingen</h1>
          <p className="text-gray-600 mt-2">Verwaltungsgebäude • Baujahr: 1985 • Fläche: 2,450 m²</p>
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
                  style={{ width: `${Math.min(kpis.energyIntensity / 200 * 100, 100)}%` }}
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
              <span className="text-xs text-green-600">↓ 12% vs. Vorjahr</span>
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
                <p className="text-xs text-gray-500">heute um 14:30</p>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-red-600">↑ 5% vs. gestern</span>
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
              <span className="text-xs text-green-600">↓ €158 vs. Vormonat</span>
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
                <span className="font-medium">1985</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nutzfläche</span>
                <span className="font-medium">2,450 m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PV-Anlage</span>
                <span className="font-medium">45 kWp</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heizung</span>
                <span className="font-medium">Gas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Energieausweis</span>
                <span className="font-medium text-yellow-600">C</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">PV-Anlage online</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Heizung normal</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Lüftung Wartung fällig</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Beleuchtung LED</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte Aktivitäten</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">14:30</div>
                <div className="text-gray-600">Spitzenlast erreicht (89.4 kW)</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">12:15</div>
                <div className="text-gray-600">PV-Produktion optimal</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">08:45</div>
                <div className="text-gray-600">Heizung automatisch reduziert</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">07:00</div>
                <div className="text-gray-600">Beleuchtung eingeschaltet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RathausDashboard; 