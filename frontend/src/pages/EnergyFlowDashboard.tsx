import React, { useState, useEffect } from 'react';
import { LazyLineChart } from '../components/charts';

interface EnergyData {
  time: string;
  consumption: number;
  production: number;
  grid: number;
}

const EnergyFlowDashboard: React.FC = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [currentFlow, setCurrentFlow] = useState({
    production: 145.2,
    consumption: 98.7,
    gridFeed: 46.5,
    battery: 23.1
  });

  useEffect(() => {
    // Generate mock data
    const mockData: EnergyData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      mockData.push({
        time: time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        consumption: Math.floor(Math.random() * 50) + 80,
        production: Math.floor(Math.random() * 60) + 100,
        grid: Math.floor(Math.random() * 30) + 10
      });
    }
    
    setEnergyData(mockData);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setCurrentFlow(prev => ({
        production: prev.production + (Math.random() - 0.5) * 10,
        consumption: prev.consumption + (Math.random() - 0.5) * 8,
        gridFeed: prev.gridFeed + (Math.random() - 0.5) * 5,
        battery: prev.battery + (Math.random() - 0.5) * 3
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Energy Flow</h1>
          <p className="text-gray-600 mt-2">Monitor energy production, consumption, and distribution</p>
        </div>

        {/* Current Flow Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PV Production</p>
                <p className="text-2xl font-bold text-green-600">{currentFlow.production.toFixed(1)} kW</p>
              </div>
              <div className="text-3xl">☀️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consumption</p>
                <p className="text-2xl font-bold text-blue-600">{currentFlow.consumption.toFixed(1)} kW</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Grid Feed-in</p>
                <p className="text-2xl font-bold text-purple-600">{currentFlow.gridFeed.toFixed(1)} kW</p>
              </div>
              <div className="text-3xl">🔌</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Battery</p>
                <p className="text-2xl font-bold text-orange-600">{currentFlow.battery.toFixed(1)} kW</p>
              </div>
              <div className="text-3xl">🔋</div>
            </div>
          </div>
        </div>

        {/* Energy Flow Diagram */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Energy Flow Visualization</h2>
          
          <div className="flex justify-center items-center min-h-[300px]">
            <svg width="600" height="300" viewBox="0 0 600 300" className="w-full max-w-2xl">
              {/* PV Panels */}
              <rect x="50" y="50" width="80" height="40" fill="#10B981" rx="5" />
              <text x="90" y="75" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">PV</text>
              
              {/* Building */}
              <rect x="260" y="120" width="80" height="60" fill="#3B82F6" rx="5" />
              <text x="300" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Building</text>
              
              {/* Grid */}
              <rect x="470" y="50" width="80" height="40" fill="#8B5CF6" rx="5" />
              <text x="510" y="75" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Grid</text>
              
              {/* Battery */}
              <rect x="260" y="220" width="80" height="40" fill="#F59E0B" rx="5" />
              <text x="300" y="245" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Battery</text>
              
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">24-Hour Energy Trends</h2>
          
          <LazyLineChart data={energyData} height={300} />
        </div>
      </div>
    </div>
  );
};

export default EnergyFlowDashboard; 