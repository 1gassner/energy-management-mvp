import React from 'react';
import { Link } from 'react-router-dom';
import { ModernCard } from '@/components/ui/ModernCard';
import { 
  Building2,
  School,
  GraduationCap,
  Waves,
  Trophy,
  Wrench,
  Zap,
  Euro,
  TrendingUp,
  Award
} from 'lucide-react';

const PublicDemo: React.FC = () => {
  const buildings = [
    {
      id: 'rathaus',
      name: 'Rathaus Hechingen',
      type: 'Verwaltungsgebäude',
      year: 1889,
      area: '2,800 m²',
      employees: 85,
      energyClass: 'C',
      color: 'blue',
      icon: Building2,
      path: '/buildings/rathaus',
      description: 'Historisches Verwaltungsgebäude mit denkmalgerechter Sanierung'
    },
    {
      id: 'realschule',
      name: 'Realschule Hechingen',
      type: 'Bildungseinrichtung',
      year: 1965,
      area: '6,200 m²',
      employees: 420,
      energyClass: 'B',
      color: 'green',
      icon: School,
      path: '/buildings/realschule',
      description: 'Moderne Realschule mit nachhaltiger Energieversorgung'
    },
    {
      id: 'gymnasium',
      name: 'Gymnasium Hechingen',
      type: 'Gymnasium',
      year: 1909,
      area: '8,500 m²',
      employees: 1200,
      energyClass: 'D',
      color: 'orange',
      icon: GraduationCap,
      path: '/buildings/gymnasium',
      description: 'Traditionelles Gymnasium mit Renovierungsbedarf'
    },
    {
      id: 'grundschule',
      name: 'Grundschule Hechingen',
      type: 'Grundschule',
      year: 1975,
      area: '3,800 m²',
      employees: 280,
      energyClass: 'B',
      color: 'emerald',
      icon: School,
      path: '/buildings/grundschule',
      description: 'Energieeffiziente Grundschule nach Sanierung'
    },
    {
      id: 'hallenbad',
      name: 'Hallenbad Hechingen',
      type: 'Sporteinrichtung',
      year: 1982,
      area: '2,400 m²',
      employees: 95,
      energyClass: 'B',
      color: 'cyan',
      icon: Waves,
      path: '/buildings/hallenbad',
      description: 'Modernes Hallenbad mit Wärmepumpe und Solaranlage'
    },
    {
      id: 'sporthallen',
      name: 'Sporthallen Hechingen',
      type: 'Sportkomplex',
      year: 1985,
      area: '4,200 m²',
      employees: 156,
      energyClass: 'D',
      color: 'red',
      icon: Trophy,
      path: '/buildings/sporthallen',
      description: 'Sportkomplex mit Renovierungsrückstand'
    },
    {
      id: 'werkrealschule',
      name: 'Werkrealschule Hechingen',
      type: 'Werkrealschule',
      year: 1980,
      area: '5,500 m²',
      employees: 150,
      energyClass: 'E',
      color: 'orange',
      icon: Wrench,
      path: '/buildings/werkrealschule',
      description: 'Berufsschule mit Sanierungsplanung 2025'
    }
  ];

  const stats = {
    totalBuildings: 7,
    totalArea: '33,400 m²',
    totalEmployees: 2386,
    averageEnergyClass: 'C+',
    monthlyCosts: '€8,240',
    annualSavings: '€124,800'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              CityPulse Hechingen
            </h1>
            <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
              Intelligentes Energie-Management-System für die Stadt Hechingen - 
              Überwachung und Optimierung von 7 städtischen Gebäuden in Echtzeit
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/login" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Demo starten
              </Link>
              <Link 
                to="/dashboard" 
                className="border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                Übersicht anzeigen
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalBuildings}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gebäude</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalArea}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gesamtfläche</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalEmployees}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Nutzer</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.averageEnergyClass}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">⌀ Energieklasse</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.monthlyCosts}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Monatliche Kosten</div>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-emerald-600 mb-2">{stats.annualSavings}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Jährliche Einsparung</div>
          </div>
        </div>

        {/* Buildings Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Gebäude-Übersicht
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {buildings.map((building) => {
              const IconComponent = building.icon;
              return (
                <Link
                  key={building.id}
                  to={building.path}
                  className="group"
                >
                  <ModernCard variant="heritage" className="h-full hover:scale-105 transition-transform duration-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <IconComponent className={`w-10 h-10 text-${building.color}-600`} />
                        <div className={`text-2xl font-bold text-${building.color}-600`}>
                          {building.energyClass}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {building.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {building.description}
                      </p>
                      
                      <div className="space-y-2 text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex justify-between">
                          <span>Baujahr:</span>
                          <span>{building.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fläche:</span>
                          <span>{building.area}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nutzer:</span>
                          <span>{building.employees}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:underline">
                          Dashboard öffnen →
                        </span>
                      </div>
                    </div>
                  </ModernCard>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            System-Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Echtzeit-Monitoring</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                745 Sensoren überwachen kontinuierlich Energieverbrauch und Gebäudezustand
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">KI-Optimierung</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Intelligente Algorithmen optimieren automatisch den Energieverbrauch
              </p>
            </div>
            <div className="text-center">
              <Euro className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Kostenkontrolle</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Transparente Kostenübersicht und Budgetplanung für alle Gebäude
              </p>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Nachhaltigkeit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                CO₂-Reduktion und Unterstützung der Klimaziele der Stadt Hechingen
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 dark:text-gray-400">
          <p>© 2025 CityPulse Hechingen - Intelligentes Energie-Management für eine nachhaltige Zukunft</p>
        </div>
      </div>
    </div>
  );
};

export default PublicDemo;