import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Target, 
  TrendingDown, 
  Settings, 
  Clock, 
  DollarSign,
  Lightbulb,
  Activity,
  Thermometer,
  Battery,
  Sun,
  Wind,
  CalendarClock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Timer,
  Gauge,
  Leaf
} from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import ChartCard from '@/components/ui/ChartCard';
import ModernCard from '@/components/ui/ModernCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { PermissionService, UserRole, Permission } from '@/types/permissions';

// Types für die Optimization Engine
interface OptimizationRecommendation {
  id: string;
  type: 'immediate' | 'scheduled' | 'long-term';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings: {
    kwh: number;
    euro: number;
    co2: number;
  };
  implementationTime: string;
  buildingId?: string;
  status: 'pending' | 'implemented' | 'rejected';
  complexity: 'easy' | 'medium' | 'complex';
}

interface EnergyPrediction {
  timestamp: string;
  predicted: number;
  confidence: number;
  factors: string[];
}

interface OptimizationMetrics {
  totalSavingsPotential: {
    kwh: number;
    euro: number;
    co2: number;
  };
  currentEfficiency: number;
  targetEfficiency: number;
  implementedOptimizations: number;
  pendingOptimizations: number;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  buildingId?: string;
  schedule?: string;
  conditions: string[];
}

const EnergyOptimizationEngine: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'predictions' | 'automation'>('overview');
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [, setPredictions] = useState<EnergyPrediction[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

  // Permissions
  const userRole = user?.role as UserRole;
  const canControlSensors = PermissionService.hasPermission(userRole, Permission.CONTROL_SENSORS);
  // const canViewDetailedAnalytics = PermissionService.hasPermission(userRole, Permission.VIEW_DETAILED_ANALYTICS);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Simulate data loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock optimization metrics
      setMetrics({
        totalSavingsPotential: {
          kwh: 125000,
          euro: 35000,
          co2: 45000
        },
        currentEfficiency: 73,
        targetEfficiency: 85,
        implementedOptimizations: 12,
        pendingOptimizations: 8
      });

      // Mock recommendations
      setRecommendations([
        {
          id: '1',
          type: 'immediate',
          priority: 'critical',
          title: 'Hallenbad Wassertemperatur optimieren',
          description: 'Reduzierung der Wassertemperatur um 1°C außerhalb der Stoßzeiten kann 15% Energie sparen.',
          potentialSavings: {
            kwh: 2500,
            euro: 750,
            co2: 1200
          },
          implementationTime: 'Sofort',
          buildingId: 'hallenbad-hechingen',
          status: 'pending',
          complexity: 'easy'
        },
        {
          id: '2',
          type: 'scheduled',
          priority: 'high',
          title: 'Intelligente Heizungssteuerung Gymnasium',
          description: 'Implementierung von zeitgesteuerten Heizungszyklen basierend auf Belegungsplan.',
          potentialSavings: {
            kwh: 4200,
            euro: 1200,
            co2: 2100
          },
          implementationTime: '1 Woche',
          buildingId: 'gymnasium-hechingen',
          status: 'pending',
          complexity: 'medium'
        },
        {
          id: '3',
          type: 'immediate',
          priority: 'high',
          title: 'LED-Umstellung Sporthallen',
          description: 'Umstellung auf intelligente LED-Beleuchtung mit Bewegungsmeldern.',
          potentialSavings: {
            kwh: 3800,
            euro: 1100,
            co2: 1900
          },
          implementationTime: '3 Tage',
          buildingId: 'sporthallen-hechingen',
          status: 'pending',
          complexity: 'medium'
        },
        {
          id: '4',
          type: 'long-term',
          priority: 'medium',
          title: 'Solaranlage Realschule erweitern',
          description: 'Erweiterung der bestehenden Solaranlage um 50 kWp zur Eigenverbrauchssteigerung.',
          potentialSavings: {
            kwh: 18000,
            euro: 5200,
            co2: 9000
          },
          implementationTime: '3 Monate',
          buildingId: 'realschule-hechingen',
          status: 'pending',
          complexity: 'complex'
        }
      ]);

      // Mock predictions
      setPredictions([
        {
          timestamp: '2024-01-15T00:00:00Z',
          predicted: 1250,
          confidence: 92,
          factors: ['Wetter', 'Wochentag', 'Feiertage']
        },
        {
          timestamp: '2024-01-16T00:00:00Z',
          predicted: 980,
          confidence: 88,
          factors: ['Wetter', 'Wochentag']
        },
        {
          timestamp: '2024-01-17T00:00:00Z',
          predicted: 1450,
          confidence: 85,
          factors: ['Wetter', 'Schulbetrieb']
        }
      ]);

      // Mock automation rules
      setAutomationRules([
        {
          id: '1',
          name: 'Nachtabsenkung Schulen',
          description: 'Automatische Heizungsreduzierung nach Schulende',
          trigger: 'Zeit: 16:00 Uhr',
          action: 'Temperatur auf 16°C reduzieren',
          isActive: true,
          schedule: 'Mo-Fr 16:00',
          conditions: ['Keine Veranstaltungen', 'Außentemperatur > 5°C']
        },
        {
          id: '2',
          name: 'Intelligente Pumpensteuerung',
          description: 'Bedarfsgesteuerte Poolpumpen im Hallenbad',
          trigger: 'Wasserqualität & Besucherzahl',
          action: 'Pumpenleistung anpassen',
          isActive: true,
          buildingId: 'hallenbad-hechingen',
          conditions: ['pH-Wert optimal', 'Besucherzahl < 50']
        },
        {
          id: '3',
          name: 'Spitzenlastvermeidung',
          description: 'Lastverteilung bei hohem Energiebedarf',
          trigger: 'Verbrauch > 80% Kapazität',
          action: 'Nicht-kritische Systeme reduzieren',
          isActive: true,
          conditions: ['Geschäftszeiten', 'Keine kritischen Systeme betroffen']
        }
      ]);

      setLoading(false);
    };

    initializeData();
  }, []);

  const handleImplementRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id 
          ? { ...rec, status: 'implemented' as const }
          : rec
      )
    );
  };

  const handleToggleAutomation = (id: string) => {
    setAutomationRules(prev =>
      prev.map(rule =>
        rule.id === id
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
  };

  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case 'critical': return 'red';
  //     case 'high': return 'orange';
  //     case 'medium': return 'blue';
  //     case 'low': return 'green';
  //     default: return 'blue';
  //   }
  // };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'easy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'complex': return <Settings className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Lade Optimierungsanalyse..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Energy Optimization Engine
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Intelligente Energieoptimierung für alle Gebäude der Stadt Hechingen
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Übersicht', icon: BarChart3 },
              { id: 'recommendations', label: 'Empfehlungen', icon: Lightbulb },
              { id: 'predictions', label: 'Prognosen', icon: TrendingDown },
              { id: 'automation', label: 'Automatisierung', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Einsparpotential"
                value={metrics?.totalSavingsPotential.euro || 0}
                unit="€/Jahr"
                icon={<DollarSign className="w-6 h-6" />}
                color="green"
                trend={{
                  value: 23,
                  isPositive: true,
                  label: 'vs. Vorjahr'
                }}
              />
              <MetricCard
                title="Energieeffizienz"
                value={metrics?.currentEfficiency || 0}
                unit="%"
                icon={<Gauge className="w-6 h-6" />}
                color="blue"
                trend={{
                  value: 8,
                  isPositive: true,
                  label: 'Ziel: 85%'
                }}
              />
              <MetricCard
                title="CO₂ Reduktion"
                value={(metrics?.totalSavingsPotential.co2 || 0) / 1000}
                unit="t/Jahr"
                icon={<Leaf className="w-6 h-6" />}
                color="emerald"
                trend={{
                  value: 15,
                  isPositive: true,
                  label: 'Potenzial'
                }}
              />
              <MetricCard
                title="Aktive Optimierungen"
                value={metrics?.implementedOptimizations || 0}
                unit="von 20"
                icon={<Activity className="w-6 h-6" />}
                color="purple"
                trend={{
                  value: 12,
                  isPositive: true,
                  label: 'implementiert'
                }}
              />
            </div>

            {/* Real-time Optimization Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Echzeit-Optimierungsstatus"
                subtitle="Aktuelle Energieverteilung und Optimierungsmaßnahmen"
                icon={<Activity className="w-5 h-5 text-blue-500" />}
              >
                <div className="space-y-4">
                  {[
                    { building: 'Rathaus', status: 'optimal', efficiency: 92, color: 'green' },
                    { building: 'Gymnasium', status: 'optimierung aktiv', efficiency: 78, color: 'orange' },
                    { building: 'Hallenbad', status: 'optimierung aktiv', efficiency: 85, color: 'blue' },
                    { building: 'Realschule', status: 'optimal', efficiency: 88, color: 'green' },
                    { building: 'Grundschule', status: 'wartung erforderlich', efficiency: 65, color: 'red' },
                    { building: 'Sporthallen', status: 'optimierung aktiv', efficiency: 82, color: 'blue' }
                  ].map((building, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          building.color === 'green' ? 'bg-green-500' :
                          building.color === 'orange' ? 'bg-orange-500' :
                          building.color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {building.building}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {building.status}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {building.efficiency}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard
                title="Tagesverbrauch-Optimierung"
                subtitle="Vergleich: Aktuell vs. Optimiert"
                icon={<BarChart3 className="w-5 h-5 text-green-500" />}
              >
                <div className="space-y-6">
                  {[
                    { time: '06:00', current: 1200, optimized: 980, savings: 18 },
                    { time: '12:00', current: 2100, optimized: 1850, savings: 12 },
                    { time: '18:00', current: 1800, optimized: 1520, savings: 16 },
                    { time: '22:00', current: 800, optimized: 650, savings: 19 }
                  ].map((hour, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {hour.time}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          -{hour.savings}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-red-400 h-2 rounded-full" 
                              style={{ width: `${(hour.current / 2500) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 min-w-[60px]">
                            {hour.current} kWh
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(hour.optimized / 2500) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 min-w-[60px]">
                            {hour.optimized} kWh
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Recommendations Filter */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Optimierungsempfehlungen ({recommendations.filter(r => r.status === 'pending').length} offen)
              </h2>
              <div className="flex space-x-2">
                {['all', 'critical', 'high', 'medium', 'low'].map((priority) => (
                  <button
                    key={priority}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      priority === 'all' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : priority === 'critical'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : priority === 'high'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {priority === 'all' ? 'Alle' : priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((rec) => (
                <ModernCard key={rec.id} variant="glassmorphism" className="relative">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          rec.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/20' :
                          rec.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/20' :
                          rec.priority === 'medium' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          'bg-green-100 dark:bg-green-900/20'
                        }`}>
                          {rec.type === 'immediate' ? <Zap className="w-5 h-5" /> :
                           rec.type === 'scheduled' ? <CalendarClock className="w-5 h-5" /> :
                           <Target className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {rec.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              rec.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rec.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              {rec.implementationTime}
                            </span>
                            {getComplexityIcon(rec.complexity)}
                          </div>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        rec.status === 'implemented' ? 'bg-green-500' :
                        rec.status === 'rejected' ? 'bg-red-500' : 'bg-orange-500'
                      }`} />
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {rec.description}
                    </p>

                    {/* Savings */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {rec.potentialSavings.kwh.toLocaleString()} kWh
                        </div>
                        <div className="text-xs text-gray-500">Energie</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {rec.potentialSavings.euro.toLocaleString()} €
                        </div>
                        <div className="text-xs text-gray-500">Kostenersparnis</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-emerald-600">
                          {rec.potentialSavings.co2.toLocaleString()} kg
                        </div>
                        <div className="text-xs text-gray-500">CO₂</div>
                      </div>
                    </div>

                    {/* Actions */}
                    {rec.status === 'pending' && canControlSensors && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleImplementRecommendation(rec.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Implementieren
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          Details
                        </button>
                      </div>
                    )}

                    {rec.status === 'implemented' && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Implementiert</span>
                      </div>
                    )}
                  </div>
                </ModernCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <ChartCard
              title="Energieverbrauch-Prognose"
              subtitle="KI-basierte Vorhersage für die nächsten 7 Tage"
              icon={<TrendingDown className="w-5 h-5 text-purple-500" />}
            >
              <div className="space-y-4">
                {/* Prediction Chart Placeholder */}
                <div className="h-64 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Interaktives Prognosediagramm
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      7-Tage Vorhersage mit 89% Genauigkeit
                    </p>
                  </div>
                </div>

                {/* Prediction Factors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Thermometer className="w-5 h-5 text-orange-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Wetter</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Temperaturschwankungen beeinflussen den Heizenergiebedarf um ±25%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CalendarClock className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Nutzung</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Schulferien und Veranstaltungen reduzieren den Verbrauch um 40-60%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sun className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-gray-900 dark:text-white">Solar</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sonneneinstrahlung ermöglicht 20-35% Eigenverbrauchsdeckung
                    </p>
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* Detailed Predictions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModernCard variant="glassmorphism">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Kurzzeit-Prognose (24h)
                  </h3>
                  <div className="space-y-3">
                    {[
                      { time: 'Heute 18:00', value: 1850, confidence: 94, trend: 'down' },
                      { time: 'Heute 22:00', value: 1200, confidence: 91, trend: 'down' },
                      { time: 'Morgen 06:00', value: 980, confidence: 88, trend: 'up' },
                      { time: 'Morgen 12:00', value: 2100, confidence: 85, trend: 'up' }
                    ].map((pred, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {pred.time}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Konfidenz: {pred.confidence}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {pred.value.toLocaleString()} kWh
                          </div>
                          <div className="flex items-center justify-end space-x-1">
                            {pred.trend === 'up' ? (
                              <TrendingDown className="w-4 h-4 text-red-500 rotate-180" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-green-500" />
                            )}
                            <span className={`text-xs ${pred.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                              {pred.trend === 'up' ? 'Steigend' : 'Fallend'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>

              <ModernCard variant="glassmorphism">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Optimierungsalarme
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        type: 'warning',
                        message: 'Hoher Verbrauch erwartet morgen 12:00',
                        action: 'Vorkühlung aktivieren',
                        time: '2h vorher'
                      },
                      {
                        type: 'info',
                        message: 'Optimaler Solarertrag am Mittwoch',
                        action: 'Energiespeicher laden',
                        time: 'Mittwoch 10:00'
                      },
                      {
                        type: 'success',
                        message: 'Niedrigverbrauchsperiode erkannt',
                        action: 'Wartungsarbeiten planen',
                        time: 'Wochenende'
                      }
                    ].map((alert, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        alert.type === 'warning' ? 'bg-orange-50 border-orange-400 dark:bg-orange-900/20' :
                        alert.type === 'info' ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20' :
                        'bg-green-50 border-green-400 dark:bg-green-900/20'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {alert.type === 'warning' ? (
                            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                          ) : alert.type === 'info' ? (
                            <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Empfehlung: {alert.action}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {alert.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>
            </div>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="space-y-6">
            {/* Automation Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Aktive Regeln"
                value={automationRules.filter(rule => rule.isActive).length}
                unit={`von ${automationRules.length}`}
                icon={<Settings className="w-6 h-6" />}
                color="blue"
              />
              <MetricCard
                title="Automatisierte Einsparungen"
                value="12.8"
                unit="% heute"
                icon={<Timer className="w-6 h-6" />}
                color="green"
                trend={{
                  value: 8,
                  isPositive: true,
                  label: 'vs. manuell'
                }}
              />
              <MetricCard
                title="Regelaktivierungen"
                value="47"
                unit="heute"
                icon={<Activity className="w-6 h-6" />}
                color="purple"
                trend={{
                  value: 12,
                  isPositive: true,
                  label: 'vs. gestern'
                }}
              />
            </div>

            {/* Automation Rules */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Automatisierungsregeln
                </h2>
                {canControlSensors && (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Neue Regel erstellen
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {automationRules.map((rule) => (
                  <ModernCard key={rule.id} variant="glassmorphism">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            rule.isActive 
                              ? 'bg-green-100 dark:bg-green-900/20' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            {rule.isActive ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Settings className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {rule.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {rule.description}
                            </p>
                          </div>
                        </div>
                        {canControlSensors && (
                          <button
                            onClick={() => handleToggleAutomation(rule.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              rule.isActive ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                rule.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Auslöser
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {rule.trigger}
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Aktion
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {rule.action}
                          </div>
                        </div>

                        {rule.conditions && rule.conditions.length > 0 && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              Bedingungen
                            </div>
                            <div className="space-y-1">
                              {rule.conditions.map((condition, index) => (
                                <div key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                  <span>{condition}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {rule.schedule && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Zeitplan
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              {rule.schedule}
                            </div>
                          </div>
                        )}
                      </div>

                      {canControlSensors && (
                        <div className="flex space-x-2 mt-4">
                          <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Bearbeiten
                          </button>
                          <button className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors">
                            Löschen
                          </button>
                        </div>
                      )}
                    </div>
                  </ModernCard>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnergyOptimizationEngine;