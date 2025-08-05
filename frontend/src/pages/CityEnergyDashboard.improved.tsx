import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LazyLineChart } from '../components/charts';
import { Sun, Battery, TrendingUp, AlertTriangle } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { debounce } from 'lodash';

interface EnergyData {
  time: string;
  consumption: number;
  production: number;
  grid: number;
  timestamp: number;
}

interface EnergyMetrics {
  totalProduction: number;
  totalConsumption: number;
  gridExport: number;
  solarProduction: number;
  efficiency: number;
  co2Saved: number;
  cost: number;
  anomalyScore: number;
}

const CityEnergyDashboard: React.FC = () => {
  const [energyData] = useState<EnergyData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<EnergyMetrics>({
    totalProduction: 1452.3,
    totalConsumption: 987.5,
    gridExport: 464.8,
    solarProduction: 823.1,
    efficiency: 92.3,
    co2Saved: 2.34,
    cost: 1234.56,
    anomalyScore: 0.12
  });
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  // Loading state would be used for future data fetching
  // const [isLoading, setIsLoading] = useState(false);
  const [chartRef, isChartVisible] = useIntersectionObserver();
  
  // WebSocket für Echtzeit-Updates  
  const { isConnected } = useWebSocket('/energy-updates');
  
  // Optimierte Datenverarbeitung mit Web Worker (placeholder for future implementation)
  // const processEnergyData = useCallback((rawData: any[]) => {
  //   if (window.Worker) {
  //     const worker = new Worker('/workers/energyDataProcessor.js');
  //     worker.postMessage({ type: 'process', data: rawData });
  //     worker.onmessage = (e) => {
  //       setEnergyData(e.data);
  //     };
  //   } else {
  //     // Fallback für Browser ohne Web Worker Support
  //     setEnergyData(rawData);
  //   }
  // }, []);
  
  // Memoized calculations (placeholder for future implementation)
  // const energyStats = useMemo(() => {
  //   if (energyData.length === 0) return null;
  //   
  //   const totalConsumption = energyData.reduce((sum, d) => sum + d.consumption, 0);
  //   const totalProduction = energyData.reduce((sum, d) => sum + d.production, 0);
  //   const avgEfficiency = (totalProduction / totalConsumption) * 100;
  //   
  //   return {
  //     totalConsumption,
  //     totalProduction,
  //     avgEfficiency,
  //     peakConsumption: Math.max(...energyData.map(d => d.consumption)),
  //     peakProduction: Math.max(...energyData.map(d => d.production))
  //   };
  // }, [energyData]);
  
  // Debounced update für Performance
  const updateMetrics = useCallback(
    debounce((newData: Partial<EnergyMetrics>) => {
      setCurrentMetrics(prev => ({ ...prev, ...newData }));
    }, 100),
    []
  );
  
  // Anomalie-Erkennung
  const checkForAnomalies = useCallback((data: EnergyData) => {
    const threshold = 1500; // kW
    if (data.consumption > threshold || data.production < 100) {
      return {
        type: 'warning',
        message: `Ungewöhnlicher Energieverbrauch erkannt: ${data.consumption} kW`,
        severity: data.consumption > threshold * 1.5 ? 'high' : 'medium'
      };
    }
    return null;
  }, []);
  
  // Echtzeit WebSocket Updates
  useEffect(() => {
    // WebSocket data handling would go here
    // For now using mock data
  }, [checkForAnomalies, updateMetrics]);
  
  // Lazy Loading für Charts
  const renderChart = useMemo(() => {
    if (!isChartVisible) {
      return <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />;
    }
    
    return (
      <LazyLineChart 
        data={energyData as any}
        height={300}
      />
    );
  }, [energyData, isChartVisible]);
  
  // Tastatur-Navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case '1': setSelectedTimeRange('1h'); break;
        case '2': setSelectedTimeRange('24h'); break;
        case '3': setSelectedTimeRange('7d'); break;
        case '4': setSelectedTimeRange('30d'); break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header mit Zeitauswahl */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Stadtweiter Energiefluss
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Echtzeit-Überwachung • {isConnected ? '🟢 Verbunden' : '🔴 Getrennt'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {(['1h', '24h', '7d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                }`}
              >
                {range === '1h' ? '1 Stunde' : 
                 range === '24h' ? '24 Stunden' :
                 range === '7d' ? '7 Tage' : '30 Tage'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Anomalie-Warnung */}
        {currentMetrics.anomalyScore > 0.5 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-amber-800 dark:text-amber-200">
              Ungewöhnliche Energiemuster erkannt. Anomalie-Score: {(currentMetrics.anomalyScore * 100).toFixed(0)}%
            </span>
          </div>
        )}
        
        {/* Erweiterte Metriken */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {/* Existing metrics... */}
          <MetricCard
            title="Gesamtproduktion"
            value={`${currentMetrics.totalProduction.toFixed(1)} kW`}
            trend="+12.3%"
            icon={<Sun className="w-6 h-6 text-yellow-500" />}
            color="green"
          />
          
          {/* Neue Metriken */}
          <MetricCard
            title="CO₂ Eingespart"
            value={`${currentMetrics.co2Saved.toFixed(2)} t`}
            trend="+8.7%"
            icon={<Battery className="w-6 h-6 text-green-500" />}
            color="emerald"
          />
          
          <MetricCard
            title="Energiekosten"
            value={`€${currentMetrics.cost.toFixed(0)}`}
            trend="-5.2%"
            icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
            color="blue"
          />
        </div>
        
        {/* 3D Visualisierung Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            3D Energiefluss-Visualisierung (Coming Soon)
          </h2>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">
              Interaktive 3D-Visualisierung wird geladen...
            </span>
          </div>
        </div>
        
        {/* Optimierter Chart */}
        <div ref={chartRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Energieverlauf - {selectedTimeRange === '1h' ? 'Letzte Stunde' : 
                              selectedTimeRange === '24h' ? '24 Stunden' :
                              selectedTimeRange === '7d' ? '7 Tage' : '30 Tage'}
          </h2>
          {renderChart}
        </div>
      </div>
    </div>
  );
};

// Optimierte Metrik-Karte Komponente
const MetricCard: React.FC<{
  title: string;
  value: string;
  trend?: string;
  icon: React.ReactNode;
  color: string;
}> = React.memo(({ title, value, trend, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
          {value}
        </p>
        {trend && (
          <p className={`text-xs mt-1 ${
            trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend}
          </p>
        )}
      </div>
      <div className="ml-3">{icon}</div>
    </div>
  </div>
));

MetricCard.displayName = 'MetricCard';

export default CityEnergyDashboard;