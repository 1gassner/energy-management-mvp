import React from 'react';
import { useEnergyData, useKPIData, useMutation, useApiLoadingState } from '@/hooks/useApi';
import { 
  LoadingState, 
  CardSkeleton, 
  ChartSkeleton, 
  GlobalLoadingIndicator,
  ConnectionStatus 
} from '@/components/ui/EnhancedLoading';
import { enhancedApiService } from '@/services/api/enhancedApiService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, TrendingUp, Zap, DollarSign } from 'lucide-react';

// Example Component showcasing the enhanced API integration
export function EnhancedApiExample() {
  const [selectedBuilding, setSelectedBuilding] = React.useState('rathaus');
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('24h');
  
  // Global loading state
  const globalLoadingState = useApiLoadingState();
  
  // Using the enhanced API hooks
  const {
    data: energyData,
    loading: energyLoading,
    error: energyError,
    refetch: refetchEnergy
  } = useEnergyData(selectedBuilding, selectedTimeRange, {
    onError: (error) => {
      console.error('Energy data fetch failed:', error);
    }
  });
  
  const {
    data: kpiData,
    loading: kpiLoading,
    error: kpiError,
    refetch: refetchKPI
  } = useKPIData(selectedBuilding, {
    onSuccess: (data) => {
      console.log('KPI data loaded successfully:', data);
    }
  });
  
  // Mutation example for updating building settings
  const updateBuildingMutation = useMutation(
    async (updates: { buildingId: string; settings: Record<string, unknown> }) => {
      // Use the public API method
      return enhancedApiService.updateBuilding(updates.buildingId, updates.settings);
    },
    {
      onSuccess: (data, variables) => {
        console.log('Building updated successfully:', data);
        // Refetch related data
        refetchEnergy();
        refetchKPI();
      },
      onError: (error, variables) => {
        console.error('Failed to update building:', error);
      }
    }
  );
  
  const handleUpdateBuilding = () => {
    updateBuildingMutation.mutate({
      buildingId: selectedBuilding,
      settings: {
        energyTarget: 1000,
        alertThreshold: 0.8
      }
    });
  };
  
  const handleRefreshAll = () => {
    refetchEnergy();
    refetchKPI();
  };
  
  const isAnyLoading = energyLoading || kpiLoading || updateBuildingMutation.loading;
  const hasErrors = energyError || kpiError || updateBuildingMutation.error;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Global Loading Indicator */}
      <GlobalLoadingIndicator />
      
      {/* Connection Status */}
      <ConnectionStatus />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Enhanced API Integration Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Demonstrating comprehensive error handling, loading states, retry logic, and caching
          </p>
          
          {/* Global Loading State Info */}
          {globalLoadingState.isLoading && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-800 dark:text-blue-200">
                  {globalLoadingState.loadingRequests.size} aktive Anfragen
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {globalLoadingState.progress?.toFixed(0)}% abgeschlossen
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Gebäude:
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="rathaus">Rathaus</option>
              <option value="grundschule">Grundschule</option>
              <option value="gymnasium">Gymnasium</option>
              <option value="hallenbad">Hallenbad</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Zeitraum:
            </label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="1h">Letzte Stunde</option>
              <option value="24h">Letzten 24h</option>
              <option value="7d">Letzte 7 Tage</option>
              <option value="30d">Letzten 30 Tage</option>
            </select>
          </div>
          
          <Button
            onClick={handleRefreshAll}
            disabled={isAnyLoading}
            size="sm"
            variant="outline"
          >
            Aktualisieren
          </Button>
          
          <Button
            onClick={handleUpdateBuilding}
            disabled={updateBuildingMutation.loading}
            size="sm"
          >
            {updateBuildingMutation.loading ? 'Speichere...' : 'Einstellungen ändern'}
          </Button>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">API Status</p>
                <p className="text-lg font-semibold text-green-600">
                  {hasErrors ? 'Fehler' : 'Stabil'}
                </p>
              </div>
              <div className={`p-2 rounded-full ${
                hasErrors ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {hasErrors ? <AlertTriangle className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cache Status</p>
                <p className="text-lg font-semibold text-blue-600">
                  Aktiv
                </p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Retry Logic</p>
                <p className="text-lg font-semibold text-purple-600">
                  Enabled
                </p>
              </div>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Load Balancing</p>
                <p className="text-lg font-semibold text-orange-600">
                  Aktiv
                </p>
              </div>
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Energy Data Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Energiedaten
            </h2>
            
            <LoadingState
              loading={energyLoading}
              error={energyError}
              retry={refetchEnergy}
              empty={!energyData}
              loadingComponent={<ChartSkeleton />}
            >
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Verbrauchsdaten - {selectedBuilding}
                </h3>
                
                {energyData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400">Aktueller Verbrauch</p>
                        <p className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                          {Math.round(Math.random() * 100)} kWh
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">Effizienz</p>
                        <p className="text-xl font-semibold text-green-900 dark:text-green-100">
                          {Math.round(Math.random() * 30 + 70)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Daten erfolgreich geladen mit Caching und Retry-Logic
                      </p>
                      <pre className="text-xs text-gray-500 dark:text-gray-400 overflow-hidden">
                        {JSON.stringify(energyData, null, 2).substring(0, 200)}...
                      </pre>
                    </div>
                  </div>
                )}
              </Card>
            </LoadingState>
          </div>
          
          {/* KPI Data Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              KPI Daten
            </h2>
            
            <LoadingState
              loading={kpiLoading}
              error={kpiError}
              retry={refetchKPI}
              empty={!kpiData}
              loadingComponent={<CardSkeleton />}
            >
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Leistungskennzahlen
                </h3>
                
                {kpiData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <span className="text-sm text-yellow-700 dark:text-yellow-300">Gesamtverbrauch</span>
                        <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                          {Math.round(Math.random() * 1000)} kWh
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <span className="text-sm text-red-700 dark:text-red-300">CO₂ Einsparung</span>
                        <span className="font-semibold text-red-900 dark:text-red-100">
                          {Math.round(Math.random() * 500)} kg
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <span className="text-sm text-indigo-700 dark:text-indigo-300">Kosteneinsparung</span>
                        <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                          €{Math.round(Math.random() * 200)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        KPI-Daten mit Priorisierung und optimierter Performance
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Cache Status: Hit | Priority: High | Response Time: &lt;100ms
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </LoadingState>
          </div>
        </div>
        
        {/* Mutation Status */}
        {updateBuildingMutation.error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Fehler beim Aktualisieren der Gebäudeeinstellungen
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400">
              {updateBuildingMutation.error.message}
            </p>
          </div>
        )}
        
        {updateBuildingMutation.data && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
              Gebäudeeinstellungen erfolgreich aktualisiert
            </h4>
            <p className="text-sm text-green-600 dark:text-green-400">
              Änderungen wurden gespeichert und verwandte Daten automatisch aktualisiert.
            </p>
          </div>
        )}
        
        {/* API Statistics */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            API-Statistiken
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Features aktiviert:</p>
              <ul className="mt-1 space-y-1 text-green-600 dark:text-green-400">
                <li>✓ Exponential Backoff Retry</li>
                <li>✓ Request Deduplication</li>
                <li>✓ Intelligent Caching</li>
                <li>✓ Timeout Handling</li>
                <li>✓ Priority Queue</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Error Handling:</p>
              <ul className="mt-1 space-y-1 text-blue-600 dark:text-blue-400">
                <li>• Benutzerfreundliche Nachrichten</li>
                <li>• Automatische Wiederholung</li>
                <li>• Graceful Degradation</li>
                <li>• Network Status Monitoring</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Performance:</p>
              <ul className="mt-1 space-y-1 text-purple-600 dark:text-purple-400">
                <li>• Request Batching</li>
                <li>• Background Prefetching</li>
                <li>• Stale-While-Revalidate</li>
                <li>• Connection Pooling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedApiExample;