import React, { useState, useEffect } from 'react';
import { LazyLineChart } from '../components/charts';
import { Zap, Sun, Battery, TrendingUp } from 'lucide-react';

interface EnergyData {
  time: string;
  consumption: number;
  production: number;
  grid: number;
}

const CityEnergyDashboard: React.FC = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [currentFlow, setCurrentFlow] = useState({
    totalProduction: 1452.3,  // kW
    totalConsumption: 987.5,  // kW
    gridExport: 464.8,        // kW
    solarProduction: 823.1,   // kW
    efficiency: 92.3          // %
  });

  useEffect(() => {
    // Generate mock energy data
    const mockData: EnergyData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      // Realistic solar production curve (higher during day)
      const solarMultiplier = hour >= 6 && hour <= 18 ? 
        Math.sin((hour - 6) * Math.PI / 12) : 0;
      
      mockData.push({
        time: time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        consumption: 800 + Math.random() * 400 + (hour >= 17 && hour <= 21 ? 200 : 0), // Peak evening hours
        production: 200 + (solarMultiplier * 1000) + Math.random() * 100,
        grid: Math.floor(Math.random() * 300) - 150 // Can be negative (export)
      });
    }
    
    setEnergyData(mockData);

    // Simulate real-time energy flow updates
    const interval = setInterval(() => {
      setCurrentFlow(prev => ({
        totalProduction: Math.max(0, prev.totalProduction + (Math.random() - 0.5) * 50),
        totalConsumption: Math.max(0, prev.totalConsumption + (Math.random() - 0.5) * 40),
        gridExport: prev.gridExport + (Math.random() - 0.5) * 30,
        solarProduction: Math.max(0, prev.solarProduction + (Math.random() - 0.5) * 20),
        efficiency: Math.min(100, Math.max(80, prev.efficiency + (Math.random() - 0.5) * 2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stadtweiter Energiefluss</h1>
          <p className="text-gray-600 mt-2">Echtzeit-Überwachung des Energieverbrauchs und der Produktion aller städtischen Gebäude</p>
        </div>

        {/* Current Energy Flow Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamtproduktion</p>
                <p className="text-2xl font-bold text-green-600">{currentFlow.totalProduction.toFixed(1)} kW</p>
                <p className="text-xs text-gray-500 mt-1">+12.3% gegenüber Vortag</p>
              </div>
              <Sun className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamtverbrauch</p>
                <p className="text-2xl font-bold text-blue-600">{currentFlow.totalConsumption.toFixed(1)} kW</p>
                <p className="text-xs text-gray-500 mt-1">-5.7% gegenüber Vortag</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Netzeinspeisung</p>
                <p className="text-2xl font-bold text-purple-600">{currentFlow.gridExport.toFixed(1)} kW</p>
                <p className="text-xs text-gray-500 mt-1">Überschuss</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Solarproduktion</p>
                <p className="text-2xl font-bold text-orange-600">{currentFlow.solarProduction.toFixed(1)} kW</p>
                <p className="text-xs text-gray-500 mt-1">56.7% der Produktion</p>
              </div>
              <Sun className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Effizienz</p>
                <p className="text-2xl font-bold text-emerald-600">{currentFlow.efficiency.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Systemwirkungsgrad</p>
              </div>
              <Battery className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Energy Flow Diagram */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Energiefluss-Diagramm</h2>
          
          <div className="flex justify-center items-center min-h-[300px]">
            <svg width="600" height="300" viewBox="0 0 600 300" className="w-full max-w-2xl">
              {/* PV Panels */}
              <rect x="50" y="50" width="80" height="40" fill="#10B981" rx="5" />
              <text x="90" y="75" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Solar</text>
              
              {/* Building */}
              <rect x="260" y="120" width="80" height="60" fill="#3B82F6" rx="5" />
              <text x="300" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Gebäude</text>
              
              {/* Grid */}
              <rect x="470" y="50" width="80" height="40" fill="#8B5CF6" rx="5" />
              <text x="510" y="75" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Netz</text>
              
              {/* Battery */}
              <rect x="260" y="220" width="80" height="40" fill="#F59E0B" rx="5" />
              <text x="300" y="245" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Batterie</text>
              
              {/* Arrows with animation */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
                </marker>
              </defs>
              
              {/* PV to Building */}
              <line x1="130" y1="70" x2="260" y2="140" stroke="#374151" strokeWidth="3" markerEnd="url(#arrowhead)">
                <animate attributeName="stroke-dasharray" values="0,10;10,0" dur="2s" repeatCount="indefinite" />
              </line>
              
              {/* Building to Grid */}
              <line x1="340" y1="140" x2="470" y2="80" stroke="#374151" strokeWidth="3" markerEnd="url(#arrowhead)">
                <animate attributeName="stroke-dasharray" values="0,10;10,0" dur="2s" repeatCount="indefinite" />
              </line>
              
              {/* Building to Battery */}
              <line x1="300" y1="180" x2="300" y2="220" stroke="#374151" strokeWidth="3" markerEnd="url(#arrowhead)">
                <animate attributeName="stroke-dasharray" values="0,10;10,0" dur="2s" repeatCount="indefinite" />
              </line>
            </svg>
          </div>
        </div>

        {/* Historical Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">24-Stunden Energieverlauf</h2>
          
          <LazyLineChart 
            data={energyData as unknown as Array<Record<string, unknown>>} 
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default CityEnergyDashboard; 