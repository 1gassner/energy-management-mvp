import { useState, useEffect, useCallback, useRef } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import type { Building, Sensor, EnergyData, Alert } from '@/types';

interface UseBuildingDataOptions {
  pollingInterval?: number;
  enableWebSocket?: boolean;
  mockDataFallback?: boolean;
}

interface BuildingDataState {
  loading: boolean;
  error: string | null;
  building: Building | null;
  sensors: Sensor[];
  energyData: EnergyData[];
  alerts: Alert[];
  kpis: Record<string, number>;
}

export const useBuildingData = (
  buildingId: string,
  options: UseBuildingDataOptions = {}
) => {
  const {
    pollingInterval = 30000,
    enableWebSocket = true,
    mockDataFallback = true
  } = options;

  const [state, setState] = useState<BuildingDataState>({
    loading: true,
    error: null,
    building: null,
    sensors: [],
    energyData: [],
    alerts: [],
    kpis: {}
  });

  const apiService = useRef(serviceFactory.createAPIService());
  const intervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Fetch building data
  const fetchData = useCallback(async () => {
    try {
      if (!mountedRef.current) return;

      const [buildings, sensors, energyData, alerts] = await Promise.all([
        apiService.current.getBuildings(),
        apiService.current.getSensors(buildingId),
        apiService.current.getEnergyData(buildingId),
        apiService.current.getAlerts()
      ]);

      const building = buildings.find(b => b.id === buildingId) || null;
      const buildingAlerts = alerts.filter(a => a.buildingId === buildingId);

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          building,
          sensors: sensors || [],
          energyData: energyData || [],
          alerts: buildingAlerts || []
        }));
      }
    } catch (err) {
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Fehler beim Laden der Daten'
        }));
      }
    }
  }, [buildingId]);

  // Calculate KPIs
  const calculateKPIs = useCallback(() => {
    const { energyData } = state;
    if (!energyData.length) return {};

    const latest = energyData[energyData.length - 1];
    const totalConsumption = energyData.reduce((sum, d) => sum + (d.consumption || 0), 0);
    const avgConsumption = totalConsumption / energyData.length;
    const peakLoad = Math.max(...energyData.map(d => d.consumption || 0));

    return {
      currentConsumption: latest?.consumption || 0,
      avgConsumption: Math.round(avgConsumption),
      peakLoad: Math.round(peakLoad),
      efficiency: Math.round((latest?.production || 0) / (latest?.consumption || 1) * 100),
      totalCost: Math.round(totalConsumption * 0.30) // 0.30€/kWh
    };
  }, [state.energyData]);

  // Setup data fetching
  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    // Setup polling if enabled
    if (pollingInterval > 0) {
      intervalRef.current = setInterval(fetchData, pollingInterval);
    }

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [buildingId, pollingInterval, fetchData]);

  // Update KPIs when energy data changes
  useEffect(() => {
    const kpis = calculateKPIs();
    setState(prev => ({ ...prev, kpis }));
  }, [state.energyData, calculateKPIs]);

  // Refetch function
  const refetch = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
    isConnected: true // Could be tied to WebSocket status
  };
};