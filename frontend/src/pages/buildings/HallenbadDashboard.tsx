import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Building, Sensor, EnergyData } from '@/types';
import DashboardCard from '@/components/ui/DashboardCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Waves, 
  Thermometer, 
  Activity, 
  Users, 
  Droplets, 
  Zap,
  TrendingUp,
  Clock,
  AlertTriangle,
  Badge
} from 'lucide-react';

const HallenbadDashboard: React.FC = () => {
  const [building, setBuilding] = useState<Building | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = serviceFactory.createAPIService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch building data
        const buildingData = await apiService.getBuilding('hallenbad-hechingen');
        setBuilding(buildingData);
        
        // Fetch sensors
        const sensorsData = await apiService.getSensors('hallenbad-hechingen');
        setSensors(sensorsData);
        
        // Fetch energy data
        const energyDataResponse = await apiService.getEnergyData('hallenbad-hechingen', '7d');
        setEnergyData(energyDataResponse);
        
      } catch (err) {
        setError('Fehler beim Laden der Hallenbad-Daten');
        console.error('Error fetching hallenbad data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Lade Hallenbad-Daten..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Fehler beim Laden
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Hallenbad nicht gefunden</p>
        </div>
      </div>
    );
  }

  // Get specific sensor values
  const energySensor = sensors.find(s => s.type === 'energy');
  const poolTempSensor = sensors.find(s => s.type === 'pool' && s.name.includes('Schwimmbecken'));
  const kidsTempSensor = sensors.find(s => s.type === 'pool' && s.name.includes('Kinderbecken'));
  const pumpSensor = sensors.find(s => s.type === 'pump');
  const visitorsSensor = sensors.find(s => s.type === 'visitors');
  const waterQualitySensor = sensors.find(s => s.type === 'water_quality');

  // Calculate efficiency metrics
  const currentConsumption = energySensor?.value || 0;
  const dailyConsumption = currentConsumption * 24;
  const yearlyProjection = dailyConsumption * 365;
  const efficiencyVsTarget = ((building.yearlyConsumption - yearlyProjection) / building.yearlyConsumption) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Waves className="w-8 h-8 text-blue-600" />
              {building.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{building.address}</p>
            <div className="flex items-center gap-4 mt-3">
              <Badge className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">
                HÖCHSTER ENERGIEVERBRAUCH: 35% des Gesamtverbrauchs
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Energieklasse</div>
            <div className={`text-2xl font-bold ${
              building.energyClass === 'D' ? 'text-orange-600' : 'text-green-600'
            }`}>
              {building.energyClass}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Wasserfläche: {building.specialFeatures?.waterSurface} m²
            </div>
          </div>
        </div>
      </div>

      {/* Critical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Aktueller Verbrauch"
          value={currentConsumption}
          unit="kWh"
          icon={<Zap className="w-6 h-6" />}
          trend={{
            value: 15.2,
            isPositive: false
          }}
          color="red"
        />
        
        <DashboardCard
          title="Schwimmbecken"
          value={poolTempSensor?.value || 0}
          unit="°C"
          icon={<Thermometer className="w-6 h-6" />}
          trend={{
            value: 0.2,
            isPositive: true
          }}
          color="blue"
        />
        
        <DashboardCard
          title="Kinderbecken"
          value={kidsTempSensor?.value || 0}
          unit="°C"
          icon={<Thermometer className="w-6 h-6" />}
          color="cyan"
        />
        
        <DashboardCard
          title="Besucher heute"
          value={visitorsSensor?.value || 0}
          unit="Personen"
          icon={<Users className="w-6 h-6" />}
          trend={{
            value: 8.5,
            isPositive: true
          }}
          color="green"
        />
      </div>

      {/* Pool Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Pumpen & Technik
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium">Umwälzpumpen Status</span>
              <span className="text-green-600 font-bold">{pumpSensor?.value}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium">Wasserqualität</span>
              <span className="text-green-600 font-bold">{waterQualitySensor?.value}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium">Filterlaufzeit heute</span>
              <span className="text-blue-600 font-bold">18.5 h</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium">Heizleistung</span>
              <span className="text-orange-600 font-bold">340 kW</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Öffnungszeiten & Auslastung
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Öffnungszeiten
              </div>
              <div className="text-blue-700 dark:text-blue-300">
                {building.specialFeatures?.poolHours}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Aktuelle Auslastung</span>
                <span className="text-sm font-bold">67%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-xs text-gray-500">Besucher heute</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">24</div>
                <div className="text-xs text-gray-500">Schwimmkurse/Woche</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Consumption Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-600" />
          Energieverbrauch Analyse
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {building.yearlyConsumption.toLocaleString()}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">kWh/Jahr Verbrauch</div>
            <div className="text-xs text-gray-500 mt-1">35% des Gesamtverbrauchs</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {building.savingsPotential.kwh.toLocaleString()}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">kWh Einsparpotential</div>
            <div className="text-xs text-gray-500 mt-1">{building.savingsPotential.percentage}% Reduktion möglich</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              €{building.savingsPotential.euro.toLocaleString()}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Einsparung/Jahr</div>
            <div className="text-xs text-gray-500 mt-1">bei Optimierung</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Optimierungsempfehlungen
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Pumpensteuerung optimieren: -15% Verbrauch möglich</li>
            <li>• Wärmerückgewinnung aus Abluft: -8% Heizkosten</li>
            <li>• LED-Beleuchtung: -5% Stromverbrauch</li>
            <li>• Smart Pool Management System: -12% Gesamtverbrauch</li>
          </ul>
        </div>
      </div>

      {/* Water Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          Wassermanagement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Beckentemperaturen</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm font-medium">Schwimmbecken (25m)</span>
                <span className="text-blue-600 font-bold">{poolTempSensor?.value}°C</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <span className="text-sm font-medium">Kinderbecken</span>
                <span className="text-cyan-600 font-bold">{kidsTempSensor?.value}°C</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium">Planschbecken</span>
                <span className="text-green-600 font-bold">34.0°C</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Wasserqualität</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium">pH-Wert</span>
                <span className="text-green-600 font-bold">7.2</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium">Chlor (mg/l)</span>
                <span className="text-green-600 font-bold">0.8</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium">Trübung (FNU)</span>
                <span className="text-green-600 font-bold">0.2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallenbadDashboard;