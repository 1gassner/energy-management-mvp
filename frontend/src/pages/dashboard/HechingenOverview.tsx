import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Building } from '@/types';
import { DashboardStats } from '@/types/api';
import DashboardCard from '@/components/ui/DashboardCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Building as BuildingIcon, 
  Zap, 
  Leaf, 
  Euro, 
  TrendingUp,
  Award,
  AlertTriangle,
  MapPin,
  Users,
  BarChart3,
  Target,
  Calendar,
  Crown
} from 'lucide-react';

interface BuildingEfficiency extends Building {
  efficiency: number;
  rank: number;
  efficiencyStatus: 'excellent' | 'good' | 'average' | 'poor';
}

const HechingenOverview: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = serviceFactory.createAPIService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all buildings
        const buildingsData = await apiService.getBuildings();
        setBuildings(buildingsData);
        
        // Fetch dashboard stats
        const statsData = await apiService.getDashboardStats();
        setStats(statsData);
        
      } catch (err) {
        setError('Fehler beim Laden der Hechingen-Daten');
        console.error('Error fetching overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Lade Hechingen Übersicht..." />
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

  // Calculate building efficiency ranking
  const buildingsWithEfficiency: BuildingEfficiency[] = buildings
    .map(building => {
      const efficiency = building.kwhPerSquareMeter;
      let efficiencyStatus: 'excellent' | 'good' | 'average' | 'poor';
      
      if (efficiency <= 60) efficiencyStatus = 'excellent';
      else if (efficiency <= 80) efficiencyStatus = 'good';
      else if (efficiency <= 100) efficiencyStatus = 'average';
      else efficiencyStatus = 'poor';

      return {
        ...building,
        efficiency,
        rank: 0, // Will be set after sorting
        efficiencyStatus
      };
    })
    .sort((a, b) => a.efficiency - b.efficiency) // Sort by efficiency (lower is better)
    .map((building, index) => ({
      ...building,
      rank: index + 1
    }));

  // Calculate totals
  const totalConsumption = buildings.reduce((sum, b) => sum + b.yearlyConsumption, 0);
  const totalSavingsPotential = buildings.reduce((sum, b) => sum + b.savingsPotential.kwh, 0);
  const totalCostSavings = buildings.reduce((sum, b) => sum + b.savingsPotential.euro, 0);
  const totalArea = buildings.reduce((sum, b) => sum + b.area, 0);
  const averageEfficiency = totalConsumption / totalArea;

  // European Energy Award metrics
  const co2Reduction2030Target = 56; // % Reduktion bis 2030
  const co2NeutralTarget = 2040; // Jahr für Klimaneutralität
  const currentCo2Reduction = 23.8; // % bereits erreicht

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <MapPin className="w-8 h-8 text-blue-600" />
              Stadt Hechingen - CityPulse
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Energiemanagement für alle 7 städtischen Gebäude
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  EUROPEAN ENERGY AWARD
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Gesamteffizienz</div>
            <div className="text-2xl font-bold text-blue-600">
              {averageEfficiency.toFixed(0)} kWh/m²
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {buildings.length} Gebäude
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Jahresverbrauch"
          value={(totalConsumption / 1000000).toFixed(1)}
          unit="GWh"
          icon={<Zap className="w-6 h-6" />}
          trend={{
            value: 8.3,
            isPositive: false
          }}
          color="blue"
        />
        
        <DashboardCard
          title="Einsparpotential"
          value={(totalSavingsPotential / 1000).toFixed(0)}
          unit="MWh/Jahr"
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{
            value: 15.2,
            isPositive: true
          }}
          color="green"
        />
        
        <DashboardCard
          title="Kosteneinsparung"
          value={(totalCostSavings / 1000).toFixed(0)}
          unit="k€/Jahr"
          icon={<Euro className="w-6 h-6" />}
          color="yellow"
        />
        
        <DashboardCard
          title="CO₂-Einsparung"
          value="238.8"
          unit="t/Jahr"
          icon={<Leaf className="w-6 h-6" />}
          trend={{
            value: 18.5,
            isPositive: true
          }}
          color="emerald"
        />
      </div>

      {/* Climate Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          Klimaziele Hechingen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {co2Reduction2030Target}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">CO₂-Reduktion bis 2030</div>
            <div className="text-xs text-gray-500 mt-1">Ziel der Stadt</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {co2NeutralTarget}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Klimaneutral</div>
            <div className="text-xs text-gray-500 mt-1">Zieljahr</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {currentCo2Reduction}%
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Bereits erreicht</div>
            <div className="text-xs text-gray-500 mt-1">Stand 2024</div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fortschritt zum 2030-Ziel</span>
            <span>{((currentCo2Reduction / co2Reduction2030Target) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full" 
              style={{ width: `${(currentCo2Reduction / co2Reduction2030Target) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ROI Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Return on Investment (ROI)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">13.0</div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Jahre Amortisation</div>
            <div className="text-xs text-gray-500 mt-1">Durchschnitt 12,7-13,3</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">50%</div>
            <div className="text-sm text-green-700 dark:text-green-300">ROI nach 20 Jahren</div>
            <div className="text-xs text-gray-500 mt-1">Langfristige Rendite</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">€2.1M</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Investitionssumme</div>
            <div className="text-xs text-gray-500 mt-1">Alle Maßnahmen</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">€4.2M</div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Einsparung 20 Jahre</div>
            <div className="text-xs text-gray-500 mt-1">Nettoertrag €2.1M</div>
          </div>
        </div>
      </div>

      {/* Building Efficiency Ranking */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Effizienz-Ranking aller Gebäude
        </h3>
        <div className="space-y-3">
          {buildingsWithEfficiency.map((building) => (
            <div
              key={building.id}
              className={`p-4 rounded-lg border-l-4 ${
                building.rank === 1 
                  ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
                  : building.rank === 2
                  ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : building.rank === 3
                  ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-l-gray-500 bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {building.rank <= 3 && (
                      <Crown className={`w-5 h-5 ${
                        building.rank === 1 ? 'text-yellow-500' :
                        building.rank === 2 ? 'text-gray-400' :
                        'text-orange-400'
                      }`} />
                    )}
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      #{building.rank}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {building.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {building.area.toLocaleString()} m² • {building.yearlyConsumption.toLocaleString()} kWh/Jahr
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xl font-bold ${
                    building.efficiencyStatus === 'excellent' ? 'text-green-600' :
                    building.efficiencyStatus === 'good' ? 'text-blue-600' :
                    building.efficiencyStatus === 'average' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {building.efficiency} kWh/m²
                  </div>
                  <div className="text-xs text-gray-500">
                    Energieklasse {building.energyClass}
                  </div>
                </div>
              </div>
              
              {/* Special badges */}
              <div className="flex gap-2 mt-2">
                {building.type === 'realschule' && (
                  <div className="bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded text-xs font-medium text-green-700 dark:text-green-300">
                    KfW-55 saniert
                  </div>
                )}
                {building.type === 'hallenbad' && (
                  <div className="bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded text-xs font-medium text-red-700 dark:text-red-300">
                    Höchster Verbrauch
                  </div>
                )}
                {building.type === 'gymnasium' && building.specialFeatures?.heritageProtection && (
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    Denkmalschutz
                  </div>
                )}
                {building.savingsPotential.percentage >= 20 && (
                  <div className="bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded text-xs font-medium text-blue-700 dark:text-blue-300">
                    {building.savingsPotential.percentage}% Einsparpotential
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Energy Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Verbrauchsverteilung
          </h3>
          <div className="space-y-3">
            {buildingsWithEfficiency.map((building) => {
              const percentage = (building.yearlyConsumption / totalConsumption) * 100;
              return (
                <div key={building.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{building.name}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Geplante Maßnahmen 2025
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Gymnasium: Denkmalgerechte Sanierung
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Fenster, Innendämmung, Heizungsoptimierung
              </p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-medium text-orange-800 dark:text-orange-200">
                Werkrealschule: Vollsanierung
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Dämmung, Fenster, Heizung, LED-Beleuchtung
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200">
                Hallenbad: Pumpenoptimierung
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Smart Pool Management, Wärmerückgewinnung
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HechingenOverview;