import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Building, Sensor, EnergyData } from '@/types';
import DashboardCard from '@/components/ui/DashboardCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  GraduationCap, 
  Calendar, 
  Shield, 
  Thermometer, 
  Users, 
  Zap,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  Crown,
  Building as BuildingIcon,
  Clock
} from 'lucide-react';

const GymnasiumDashboard: React.FC = () => {
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
        const buildingData = await apiService.getBuilding('gymnasium-hechingen');
        setBuilding(buildingData);
        
        // Fetch sensors
        const sensorsData = await apiService.getSensors('gymnasium-hechingen');
        setSensors(sensorsData);
        
        // Fetch energy data
        const energyDataResponse = await apiService.getEnergyData('gymnasium-hechingen', '7d');
        setEnergyData(energyDataResponse);
        
      } catch (err) {
        setError('Fehler beim Laden der Gymnasium-Daten');
        console.error('Error fetching gymnasium data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Lade Gymnasium-Daten..." />
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
          <p className="text-gray-600 dark:text-gray-400">Gymnasium nicht gefunden</p>
        </div>
      </div>
    );
  }

  // Get specific sensor values
  const energySensor = sensors.find(s => s.type === 'energy');
  const heritageSensor = sensors.find(s => s.type === 'heritage');
  const educationSensor = sensors.find(s => s.type === 'education');
  const tempSensor = sensors.find(s => s.type === 'temperature');

  // Calculate age and heritage value
  const currentYear = new Date().getFullYear();
  const buildingAge = currentYear - (building.specialFeatures?.buildYear || 1909);
  const lastRenovationYearsAgo = currentYear - (building.specialFeatures?.lastRenovation || 2005);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              {building.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{building.address}</p>
            <div className="flex items-center gap-4 mt-3">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-600">
                HISTORISCHES GEBÄUDE - DENKMALSCHUTZ SEIT 1909
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Energieklasse</div>
            <div className={`text-2xl font-bold ${
              building.energyClass === 'C' ? 'text-orange-600' : 'text-green-600'
            }`}>
              {building.energyClass}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Baujahr: {building.specialFeatures?.buildYear}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Stromverbrauch"
          value={energySensor?.value || 0}
          unit="kWh"
          icon={<Zap className="w-6 h-6" />}
          trend={{
            value: 5.2,
            isPositive: false
          }}
          color="blue"
        />
        
        <DashboardCard
          title="Schüleranzahl"
          value={educationSensor?.value || 0}
          unit="Schüler"
          icon={<Users className="w-6 h-6" />}
          trend={{
            value: 2.1,
            isPositive: true
          }}
          color="green"
        />
        
        <DashboardCard
          title="Gebäudetemperatur"
          value={tempSensor?.value || 0}
          unit="°C"
          icon={<Thermometer className="w-6 h-6" />}
          color="orange"
        />
        
        <DashboardCard
          title="Denkmalschutz"
          value={heritageSensor?.value || 0}
          unit="%"
          icon={<Shield className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Heritage Protection & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Denkmalschutz Status
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-purple-900 dark:text-purple-100">
                  Geschütztes Baudenkmal
                </span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Das Gymnasium steht seit seiner Erbauung 1909 unter Denkmalschutz und ist ein 
                bedeutendes Beispiel wilhelminischer Schularchitektur.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{buildingAge}</div>
                <div className="text-xs text-gray-500">Jahre alt</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{lastRenovationYearsAgo}</div>
                <div className="text-xs text-gray-500">Jahre seit Renovierung</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Denkmalschutz-Auflagen</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Fassade darf nicht verändert werden</li>
                <li>• Fenster nur denkmalgerecht erneuern</li>
                <li>• Dämmung nur von innen möglich</li>
                <li>• Heizungssystem begrenzt modernisierbar</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Historische Entwicklung
          </h3>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm font-medium">Erbauung</span>
                <span className="text-blue-600 font-bold">1909</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm font-medium">Letzte Renovierung</span>
                <span className="text-green-600 font-bold">2005</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="text-sm font-medium">Nächste Renovierung</span>
                <span className="text-orange-600 font-bold">2025 (geplant)</span>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Geplante Maßnahmen 2025
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Denkmalgerechte Fenstersanierung</li>
                <li>• Innendämmung (soweit möglich)</li>
                <li>• Heizungsoptimierung</li>
                <li>• LED-Beleuchtung in Klassenräumen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Efficiency & Limitations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          Energieeffizienz & Denkmalschutz-Grenzen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {building.yearlyConsumption.toLocaleString()}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">kWh/Jahr Verbrauch</div>
            <div className="text-xs text-gray-500 mt-1">Begrenzt durch Denkmalschutz</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {building.kwhPerSquareMeter}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">kWh/m² Effizienz</div>
            <div className="text-xs text-gray-500 mt-1">Historisches Gebäude</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {building.savingsPotential.percentage}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Einsparpotential</div>
            <div className="text-xs text-gray-500 mt-1">Trotz Auflagen möglich</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              Denkmalschutz-Beschränkungen
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>• Keine Außendämmung möglich</li>
              <li>• Fenster nur denkmalgerecht</li>
              <li>• Fassade muss originalgetreu bleiben</li>
              <li>• Dachform nicht veränderbar</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              Mögliche Optimierungen
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Innendämmung: -8% Verbrauch</li>
              <li>• Heizungsoptimierung: -5% Verbrauch</li>
              <li>• LED-Beleuchtung: -3% Verbrauch</li>
              <li>• Smart Building System: -2% Verbrauch</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Educational Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            Schulbetrieb
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {building.specialFeatures?.studentCount}
                </div>
                <div className="text-xs text-gray-500">Schüler</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">45</div>
                <div className="text-xs text-gray-500">Klassen</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium">Klassenstärke Ø</span>
                <span className="font-bold">26,7 Schüler</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium">Lehrkräfte</span>
                <span className="font-bold">95 Personen</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium">Schulstunden/Tag</span>
                <span className="font-bold">8-9 Stunden</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Nutzungszeiten
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Schulzeiten
              </h4>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Mo-Fr: 7:30 - 17:00 Uhr<br/>
                (Ganztagsschule)
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Aktuelle Auslastung</span>
                <span className="text-sm font-bold">85%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">15</div>
                <div className="text-xs text-gray-500">kWh/Schüler/Tag</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">82%</div>
                <div className="text-xs text-gray-500">Auslastung Räume</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Building Structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BuildingIcon className="w-5 h-5 text-gray-600" />
          Gebäudestruktur & Flächen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {building.area.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">m² Gesamtfläche</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">45</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Klassenräume</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Fachräume</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Stockwerke</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymnasiumDashboard;