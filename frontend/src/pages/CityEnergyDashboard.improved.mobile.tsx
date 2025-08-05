import React, { useState, useEffect, useMemo } from 'react';
import { LazyLineChart } from '../components/charts';
import { Zap, Sun, Battery, TrendingUp, Menu, Search, Filter } from 'lucide-react';

interface EnergyData {
  time: string;
  consumption: number;
  production: number;
  grid: number;
}

interface EnergyFlowData {
  totalProduction: number;
  totalConsumption: number;
  gridExport: number;
  solarProduction: number;
  efficiency: number;
}

const CityEnergyDashboardMobile: React.FC = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [currentFlow, setCurrentFlow] = useState<EnergyFlowData>({
    totalProduction: 1452.3,
    totalConsumption: 987.5,
    gridExport: 464.8,
    solarProduction: 823.1,
    efficiency: 92.3
  });
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoized chart height based on screen size
  const chartHeight = useMemo(() => {
    if (typeof window === 'undefined') return 300;
    return window.innerWidth < 640 ? 250 : window.innerWidth < 1024 ? 280 : 300;
  }, []);

  useEffect(() => {
    // Generate mock energy data
    const mockData: EnergyData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      const solarMultiplier = hour >= 6 && hour <= 18 ? 
        Math.sin((hour - 6) * Math.PI / 12) : 0;
      
      mockData.push({
        time: time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        consumption: 800 + Math.random() * 400 + (hour >= 17 && hour <= 21 ? 200 : 0),
        production: 200 + (solarMultiplier * 1000) + Math.random() * 100,
        grid: Math.floor(Math.random() * 300) - 150
      });
    }
    
    setEnergyData(mockData);

    // Real-time updates
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

  // Mobile-optimized KPI card
  const KpiCard: React.FC<{
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl touch-target">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 truncate">{title}</p>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${color} truncate`}>{value}</p>
        </div>
        <div className="ml-3 flex-shrink-0">
          {React.cloneElement(icon as React.ReactElement, {
            className: 'w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8'
          })}
        </div>
      </div>
      <p className="text-xs text-gray-500 truncate">{change}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Mobile Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Stadtweiter Energiefluss
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 lg:mt-2">
                Echtzeit-Überwachung aller städtischen Gebäude
              </p>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="glass-button-secondary p-3 touch-target md:hidden"
                aria-label="Suchen"
              >
                <Search className="w-5 h-5" />
              </button>
              <button className="glass-button-secondary p-3 touch-target" aria-label="Filter">
                <Filter className="w-5 h-5" />
              </button>
              <button className="glass-button-secondary p-3 touch-target sm:hidden" aria-label="Menü">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search (collapsible) */}
          {showMobileSearch && (
            <div className="mb-4 animate-in slide-in-from-top-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Gebäude oder Sensor suchen..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-target"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile-Optimized KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <KpiCard
            title="Gesamtproduktion"
            value={`${currentFlow.totalProduction.toFixed(1)} kW`}
            change="+12.3% gegenüber Vortag"
            icon={<Sun className="text-yellow-500" />}
            color="text-green-600"
          />
          <KpiCard
            title="Gesamtverbrauch"
            value={`${currentFlow.totalConsumption.toFixed(1)} kW`}
            change="-5.7% gegenüber Vortag"
            icon={<Zap className="text-blue-500" />}
            color="text-blue-600"
          />
          <KpiCard
            title="Netzeinspeisung"
            value={`${currentFlow.gridExport.toFixed(1)} kW`}
            change="Überschuss"
            icon={<TrendingUp className="text-purple-500" />}
            color="text-purple-600"
          />
          <KpiCard
            title="Solarproduktion"
            value={`${currentFlow.solarProduction.toFixed(1)} kW`}
            change="56.7% der Produktion"
            icon={<Sun className="text-orange-500" />}
            color="text-orange-600"
          />
          <KpiCard
            title="Effizienz"
            value={`${currentFlow.efficiency.toFixed(1)}%`}
            change="Systemwirkungsgrad"
            icon={<Battery className="text-emerald-500" />}
            color="text-emerald-600"
          />
        </div>

        {/* Mobile Energy Flow Diagram */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Energiefluss-Diagramm
          </h2>
          
          <div className="flex justify-center items-center min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] overflow-x-auto">
            <div className="w-full min-w-[500px] max-w-2xl">
              <svg 
                width="100%" 
                height={isMobile ? "200" : "300"} 
                viewBox="0 0 600 300" 
                className="w-full"
                preserveAspectRatio="xMidYMid meet"
              >
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
                
                {/* Animated flow lines */}
                <line x1="130" y1="70" x2="260" y2="140" stroke="#374151" strokeWidth="3" markerEnd="url(#arrowhead)">
                  <animate attributeName="stroke-dasharray" values="0,10;10,0" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="340" y1="140" x2="470" y2="80" stroke="#374151" strokeWidth="3" markerEnd="url(#arrowhead)">
                  <animate attributeName="stroke-dasharray" values="0,10;10,0" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="300" y1="180" x2="300" y2="220" stroke="#374151" strokeWidth="3" markerEnd="url(#arrowhead)">
                  <animate attributeName="stroke-dasharray" values="0,10;10,0" dur="2s" repeatCount="indefinite" />
                </line>
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Historical Chart */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            24-Stunden Energieverlauf
          </h2>
          
          <div className="chart-glass-container overflow-x-auto">
            <div className="min-w-[600px] sm:min-w-0">
              <LazyLineChart 
                data={energyData as unknown as Array<Record<string, unknown>>} 
                height={chartHeight}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityEnergyDashboardMobile;