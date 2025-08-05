import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Sensor } from '@/types';
import { LazyLineChart, LazyBarChart } from '../../components/charts';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Building2, 
  Users, 
  Zap, 
  DollarSign, 
  Leaf, 
  Sun, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  FileText,
  Shield,
  Crown,
  Landmark
} from 'lucide-react';

const RathausDashboard: React.FC = () => {
  const [, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = serviceFactory.createAPIService();

  // Heritage building specific KPIs
  const [heritageKpis, setHeritageKpis] = useState({
    energyIntensity: 94.5,
    co2Emissions: 28.7,
    pvSelfConsumption: 45.2,
    peakLoad: 125.8,
    energyCosts: 2450.90,
    employeeCount: 180,
    visitorCount: 1250,
    officeUtilization: 87.3,
    heritageCompliance: 98.5
  });

  const [energyDataMock] = useState([
    { time: '00:00', consumption: 35, production: 0, grid: 35, temperature: 20 },
    { time: '06:00', consumption: 60, production: 10, grid: 50, temperature: 21 },
    { time: '12:00', consumption: 125, production: 85, grid: 40, temperature: 25 },
    { time: '18:00', consumption: 85, production: 25, grid: 60, temperature: 24 },
    { time: '24:00', consumption: 45, production: 0, grid: 45, temperature: 22 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [sensorsData] = await Promise.all([
          apiService.getSensors('rathaus')
        ]);
        
        setSensors(sensorsData || []);
        
        // Update KPIs with animation
        const interval = setInterval(() => {
          setHeritageKpis(prev => ({
            ...prev,
            energyIntensity: prev.energyIntensity + (Math.random() - 0.5) * 2,
            co2Emissions: prev.co2Emissions + (Math.random() - 0.5) * 1.2,
            pvSelfConsumption: Math.max(0, Math.min(100, prev.pvSelfConsumption + (Math.random() - 0.5) * 3)),
          }));
        }, 5000);

        return () => clearInterval(interval);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiService]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Eco Dark Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-amber-500/5" />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Heritage Header Card */}
        <div className="glass-card-hechingen-heritage mb-8 p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-4 bg-gradient-to-br from-amber-400/30 to-orange-500/20 rounded-3xl backdrop-blur-sm border border-amber-300/30">
                  <Landmark className="w-16 h-16 text-amber-300" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent mb-2">
                    Rathaus Hechingen
                  </h1>
                  <p className="text-amber-200/90 text-xl font-medium">
                    Historisches Rathaus • Baujahr: 1486 • Denkmalschutz
                  </p>
                  <p className="text-amber-300/70 text-lg mt-1">
                    3,200 m² • Verwaltungszentrum • UNESCO-Welterbe-Kandidat
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="px-5 py-3 bg-red-500/20 border border-red-400/40 rounded-2xl backdrop-blur-sm hover:bg-red-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-red-300" />
                    <span className="text-red-200 font-semibold">DENKMALSCHUTZ</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-blue-500/20 border border-blue-400/40 rounded-2xl backdrop-blur-sm hover:bg-blue-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-300" />
                    <span className="text-blue-200 font-semibold">{heritageKpis.employeeCount} Mitarbeiter</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-green-500/20 border border-green-400/40 rounded-2xl backdrop-blur-sm hover:bg-green-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-300" />
                    <span className="text-green-200 font-semibold">{heritageKpis.heritageCompliance.toFixed(1)}% Konformität</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="glass-card-light p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white font-bold text-lg">System Online</span>
                </div>
                <div className="text-blue-200/80 text-sm mb-2">
                  Letztes Update: {new Date().toLocaleTimeString('de-DE')}
                </div>
                <div className="text-amber-300/80 text-xs">
                  Nächste Wartung: Morgen 06:00
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Heritage KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="glass-card-hechingen-heritage group hover:scale-105 transition-all duration-300 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-amber-300" />
              </div>
              <div className="text-green-400 text-sm font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                -8.2%
              </div>
            </div>
            <h3 className="text-amber-200/80 text-sm font-medium mb-2">Energieintensität</h3>
            <p className="text-3xl font-bold text-white mb-1">{heritageKpis.energyIntensity.toFixed(1)}</p>
            <p className="text-amber-300/60 text-sm">kWh/m²</p>
          </div>

          <div className="glass-card-hechingen-heritage group hover:scale-105 transition-all duration-300 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-xl">
                <Leaf className="w-6 h-6 text-emerald-300" />
              </div>
              <div className="text-green-400 text-sm font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                -12.4%
              </div>
            </div>
            <h3 className="text-amber-200/80 text-sm font-medium mb-2">CO₂-Emissionen</h3>
            <p className="text-3xl font-bold text-white mb-1">{heritageKpis.co2Emissions.toFixed(1)}</p>
            <p className="text-amber-300/60 text-sm">t/Jahr</p>
          </div>

          <div className="glass-card-hechingen-heritage group hover:scale-105 transition-all duration-300 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl">
                <Sun className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="text-green-400 text-sm font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +8.7%
              </div>
            </div>
            <h3 className="text-amber-200/80 text-sm font-medium mb-2">PV-Eigenverbrauch</h3>
            <p className="text-3xl font-bold text-white mb-1">{heritageKpis.pvSelfConsumption.toFixed(1)}</p>
            <p className="text-amber-300/60 text-sm">%</p>
          </div>

          <div className="glass-card-hechingen-heritage group hover:scale-105 transition-all duration-300 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-blue-300" />
              </div>
              <div className="text-green-400 text-sm font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                -6.3%
              </div>
            </div>
            <h3 className="text-amber-200/80 text-sm font-medium mb-2">Spitzenlast</h3>
            <p className="text-3xl font-bold text-white mb-1">{heritageKpis.peakLoad.toFixed(1)}</p>
            <p className="text-amber-300/60 text-sm">kW</p>
          </div>

          <div className="glass-card-hechingen-heritage group hover:scale-105 transition-all duration-300 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-300" />
              </div>
              <div className="text-green-400 text-sm font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                -15.8%
              </div>
            </div>
            <h3 className="text-amber-200/80 text-sm font-medium mb-2">Energiekosten</h3>
            <p className="text-3xl font-bold text-white mb-1">€{heritageKpis.energyCosts.toFixed(0)}</p>
            <p className="text-amber-300/60 text-sm">/Monat</p>
          </div>

          <div className="glass-card-hechingen-heritage group hover:scale-105 transition-all duration-300 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl">
                <FileText className="w-6 h-6 text-purple-300" />
              </div>
              <div className="text-green-400 text-sm font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +2.1%
              </div>
            </div>
            <h3 className="text-amber-200/80 text-sm font-medium mb-2">Büro-Auslastung</h3>
            <p className="text-3xl font-bold text-white mb-1">{heritageKpis.officeUtilization.toFixed(1)}</p>
            <p className="text-amber-300/60 text-sm">%</p>
          </div>
        </div>

        {/* Modern Heritage Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-card-hechingen-heritage p-6 col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
              <h3 className="text-2xl font-bold text-white">Rathaus Energieverlauf</h3>
            </div>
            <div className="text-amber-200/80 text-sm mb-6">
              Verwaltungsbetrieb im historischen Gebäude • Optimiert für Denkmalschutz
            </div>
            <LazyLineChart data={energyDataMock} height={320} />
          </div>

          <div className="glass-card-hechingen-heritage p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Tagesverteilung</h3>
            </div>
            <div className="text-amber-200/80 text-sm mb-6">
              Bürozeiten und Spitzenverbrauch
            </div>
            <LazyBarChart data={energyDataMock} height={280} />
          </div>

          <div className="glass-card-hechingen-heritage p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Denkmalschutz-KPIs</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-amber-200/80">Gebäudeschutz-Konformität</span>
                <span className="text-green-400 font-bold">{heritageKpis.heritageCompliance.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-amber-200/80">Historische Integrität</span>
                <span className="text-green-400 font-bold">97.2%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-amber-200/80">Renovierungsstandard</span>
                <span className="text-green-400 font-bold">A+ Klasse</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <span className="text-amber-200/80">UNESCO-Readiness</span>
                <span className="text-yellow-400 font-bold">In Prüfung</span>
              </div>
            </div>
          </div>
        </div>

        {/* Heritage Status Alert */}
        <div className="glass-card-hechingen-heritage p-8">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-green-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">
                Denkmalschutz & Energieeffizienz im Einklang
              </h3>
              <p className="text-amber-200/90 text-lg leading-relaxed mb-6">
                Das historische Rathaus aus dem Jahr 1486 zeigt exemplarisch, dass Denkmalschutz und moderne Energieeffizienz erfolgreich vereinbar sind. Alle implementierten Maßnahmen entsprechen den strengsten denkmalpflegerischen Auflagen und wurden in enger Zusammenarbeit mit dem Landesdenkmalamt entwickelt.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-xl border border-green-500/20">
                  <div className="text-green-400 font-bold text-lg">538 Jahre</div>
                  <div className="text-green-300/80 text-sm">Baujahr 1486</div>
                </div>
                <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-4 rounded-xl border border-amber-500/20">
                  <div className="text-amber-400 font-bold text-lg">€850K</div>
                  <div className="text-amber-300/80 text-sm">Investition 2023</div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-4 rounded-xl border border-blue-500/20">
                  <div className="text-blue-400 font-bold text-lg">28%</div>
                  <div className="text-blue-300/80 text-sm">Effizienzsteigerung</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default RathausDashboard;