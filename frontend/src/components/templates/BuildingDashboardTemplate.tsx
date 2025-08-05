import React, { useEffect, useState, useCallback, memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import { serviceFactory } from '@/services/serviceFactory';
import type { Building, Sensor, EnergyData } from '@/types';

interface BuildingDashboardProps {
  buildingId: string;
  buildingName: string;
  buildingType: 'rathaus' | 'school' | 'hallenbad' | 'sporthalle';
  kpiConfig: Array<{
    title: string;
    value: number | string;
    unit: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  children?: React.ReactNode;
  customStyles?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

// Custom hook for building data
export const useBuildingData = (buildingId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [building, setBuilding] = useState<Building | null>(null);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);

  const apiService = serviceFactory.createAPIService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sensorsData, buildingData] = await Promise.all([
          apiService.getSensors(buildingId),
          apiService.getBuildings().then(buildings => 
            buildings.find(b => b.id === buildingId)
          )
        ]);
        
        setSensors(sensorsData || []);
        setBuilding(buildingData || null);
        
        // Fetch energy data if available
        if (buildingData) {
          const energy = await apiService.getEnergyData(buildingId);
          setEnergyData(energy || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Cleanup function
    return () => {
      // Cancel any pending requests if needed
    };
  }, [buildingId, apiService]);

  return { loading, error, sensors, building, energyData };
};

// Template component with memoization
const BuildingDashboardTemplate: React.FC<BuildingDashboardProps> = memo(({
  buildingId,
  buildingName,
  buildingType,
  kpiConfig,
  children,
  customStyles = { primaryColor: '#10b981', secondaryColor: '#059669' }
}) => {
  const { loading, error, sensors, building } = useBuildingData(buildingId);

  // Memoized render functions
  const renderLoading = useCallback(() => (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" text={`Lade ${buildingName}-Daten...`} />
    </div>
  ), [buildingName]);

  const renderError = useCallback(() => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Fehler beim Laden
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    </div>
  ), [error]);

  const renderKPIs = useCallback(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiConfig.map((kpi, index) => (
        <EcoKPICard
          key={`kpi-${index}`}
          title={kpi.title}
          value={kpi.value}
          unit={kpi.unit}
          trend={kpi.trend}
          trendValue={kpi.trendValue}
          color={kpi.color}
          icon={kpi.icon}
        />
      ))}
    </div>
  ), [kpiConfig]);

  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-br opacity-5"
            style={{
              backgroundImage: `linear-gradient(to bottom right, ${customStyles.primaryColor}, ${customStyles.secondaryColor})`
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {buildingName} Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Echtzeit Energie- und Umweltdaten
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {sensors.length} aktive Sensoren
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        {renderKPIs()}

        {/* Custom content from specific dashboard */}
        {children}

        {/* Footer info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Gebäude-ID: {buildingId} | Typ: {buildingType}</p>
          {building && (
            <p>Adresse: {building.address}</p>
          )}
        </div>
      </div>
    </div>
  );
});

BuildingDashboardTemplate.displayName = 'BuildingDashboardTemplate';

export default BuildingDashboardTemplate;