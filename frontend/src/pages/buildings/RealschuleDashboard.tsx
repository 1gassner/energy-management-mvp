import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Building, Sensor, EnergyData } from '@/types';
import DashboardCard from '@/components/ui/DashboardCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { LazyLineChart, LazyBarChart } from '../../components/charts';
import { 
  School, 
  Award, 
  Thermometer, 
  Users, 
  Zap,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Star,
  Wrench,
  Leaf,
  Euro
} from 'lucide-react';

const RealschuleDashboard: React.FC = () => {
  const [building, setBuilding] = useState<Building | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = serviceFactory.createAPIService();

  const [kpis, setKpis] = useState({
    energyIntensity: 50, // KfW-55 Standard!
    co2Emissions: 12.1,
    pvSelfConsumption: 89.2,
    peakLoad: 45.8,
    energyCosts: 650.30 // Reduziert durch Effizienz
  });

  const [mockEnergyData] = useState([
    { time: '00:00', consumption: 25, production: 0, grid: 25, temperature: 18 },
    { time: '06:00', consumption: 35, production: 8, grid: 27, temperature: 19 },
    { time: '12:00', consumption: 75, production: 95, grid: -20, temperature: 22 },
    { time: '18:00', consumption: 45, production: 25, grid: 20, temperature: 21 },
    { time: '24:00', consumption: 30, production: 0, grid: 30, temperature: 19 }
  ]);

  const roomData = [
    { room: 'Klassenzimmer', consumption: 35, target: 32 },
    { room: 'IT-Räume', consumption: 18, target: 20 },
    { room: 'Sporthalle', consumption: 12, target: 15 },
    { room: 'Verwaltung', consumption: 8, target: 10 },
    { room: 'Bibliothek', consumption: 6, target: 8 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch building data
        const buildingData = await apiService.getBuilding('realschule-hechingen');
        setBuilding(buildingData);
        
        // Fetch sensors
        const sensorsData = await apiService.getSensors('realschule-hechingen');
        setSensors(sensorsData);
        
        // Fetch energy data
        const energyDataResponse = await apiService.getEnergyData('realschule-hechingen', '7d');
        setEnergyData(energyDataResponse);
        
      } catch (err) {
        setError('Fehler beim Laden der Realschule-Daten');
        console.error('Error fetching realschule data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      setKpis(prev => ({
        ...prev,
        energyIntensity: prev.energyIntensity + (Math.random() - 0.5) * 0.5, // Weniger Schwankung bei KfW-55
        peakLoad: prev.peakLoad + (Math.random() - 0.5) * 2
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Lade Realschule-Daten..." />
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

  // Get specific sensor values
  const energySensor = sensors.find(s => s.type === 'energy');
  const renovationSensor = sensors.find(s => s.type === 'renovation');
  const educationSensor = sensors.find(s => s.type === 'education');

  return (
    <div className="p-6 space-y-6">
      {/* Header mit KfW-55 Badge */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <School className="w-8 h-8 text-green-600" />
              Realschule Hechingen
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {building?.address || 'Weilheimer Straße 14, 72379 Hechingen'}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  KfW-55 STANDARD ERREICHT
                </span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  BESTE ENERGIEEFFIZIENZ ALLER GEBÄUDE
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Energieklasse</div>
            <div className="text-2xl font-bold text-green-600">A</div>
            <div className="text-sm text-gray-500 mt-1">
              50 kWh/m² durch KfW-55
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards mit KfW-55 Updates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Stromverbrauch"
          value={energySensor?.value || 39.9}
          unit="kWh"
          icon={<Zap className="w-6 h-6" />}
          trend={{
            value: 12.5,
            isPositive: false
          }}
          color="green"
        />
        
        <DashboardCard
          title="KfW-55 Effizienz"
          value={renovationSensor?.value || 95.2}
          unit="%"
          icon={<Award className="w-6 h-6" />}
          color="green"
        />
        
        <DashboardCard
          title="Schüleranzahl"
          value={educationSensor?.value || 800}
          unit="Schüler"
          icon={<Users className="w-6 h-6" />}
          trend={{
            value: 2.1,
            isPositive: true
          }}
          color="blue"
        />
        
        <DashboardCard
          title="Energiekosten"
          value="650"
          unit="€/Monat"
          icon={<Euro className="w-6 h-6" />}
          trend={{
            value: 25.3,
            isPositive: false
          }}
          color="emerald"
        />
      </div>

      {/* KfW-55 Success Story */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-green-600" />
          KfW-55 Sanierungserfolg
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">50</div>
            <div className="text-sm text-green-700 dark:text-green-300">kWh/m² erreicht</div>
            <div className="text-xs text-gray-500 mt-1">KfW-55 Standard</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2020</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Sanierung abgeschlossen</div>
            <div className="text-xs text-gray-500 mt-1">Modernste Technik</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">€7.455</div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Einsparung/Jahr</div>
            <div className="text-xs text-gray-500 mt-1">Durch Effizienz</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            Sanierungsmaßnahmen 2020
          </h4>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Vollständige Gebäudedämmung nach KfW-55 Standard</li>
            <li>• Neue dreifach verglaste Fenster</li>
            <li>• Moderne Wärmepumpe mit Wärmerückgewinnung</li>
            <li>• LED-Beleuchtung in allen Räumen</li>
            <li>• Smart Building Management System</li>
          </ul>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Consumption Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Energieverbrauch heute</h3>
          <LazyLineChart data={mockEnergyData} height={250} />
        </div>

        {/* Room-wise Consumption */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verbrauch nach Bereichen</h3>
          <LazyBarChart data={roomData.map(item => ({ name: item.room, value: item.consumption }))} height={250} />
        </div>
      </div>

      {/* Building Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gebäudedaten</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Baujahr</span>
              <span className="font-medium">1970</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Nutzfläche</span>
              <span className="font-medium">7.000 m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">KfW-Standard</span>
              <span className="font-medium text-green-600">KfW-55</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Heizung</span>
              <span className="font-medium">Wärmepumpe</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Schüleranzahl</span>
              <span className="font-medium">800</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">KfW-55 Standard aktiv</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Wärmepumpe optimal</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Smart Building online</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Beste Effizienz erreicht</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Letzte Aktivitäten</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">11:45</div>
              <div className="text-gray-600 dark:text-gray-400">KfW-55 Effizienz bestätigt</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">09:30</div>
              <div className="text-gray-600 dark:text-gray-400">Wärmepumpe optimiert</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">07:30</div>
              <div className="text-gray-600 dark:text-gray-400">Smart System aktiviert</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">06:00</div>
              <div className="text-gray-600 dark:text-gray-400">Heizung energieeffizient gestartet</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealschuleDashboard;