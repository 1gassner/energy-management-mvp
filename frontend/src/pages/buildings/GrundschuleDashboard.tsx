import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Sensor } from '@/types';
import { LazyLineChart, LazyBarChart } from '../../components/charts';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  GraduationCap, 
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
  BookOpen,
  Heart,
  Target,
  PlayCircle
} from 'lucide-react';

const GrundschuleDashboard: React.FC = () => {
  const [, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiService = serviceFactory.createAPIService();

  // School-specific KPIs
  const [schoolKpis, setSchoolKpis] = useState({
    energyIntensity: 76.8,
    co2Emissions: 18.2,
    pvSelfConsumption: 89.3,
    peakLoad: 42.5,
    energyCosts: 645.30,
    studentCount: 280,
    teacherCount: 22,
    classroomUtilization: 92.5
  });

  const [energyDataMock] = useState([
    { time: '00:00', consumption: 15, production: 0, grid: 15, temperature: 18 },
    { time: '06:00', consumption: 20, production: 5, grid: 15, temperature: 19 },
    { time: '12:00', consumption: 45, production: 65, grid: -20, temperature: 22 },
    { time: '18:00', consumption: 25, production: 15, grid: 10, temperature: 21 },
    { time: '24:00', consumption: 18, production: 0, grid: 18, temperature: 19 }
  ]);

  const roomData = [
    { room: 'Klassenzimmer', consumption: 22, target: 25, students: 280 },
    { room: 'Mensa', consumption: 12, target: 15, capacity: 150 },
    { room: 'Turnhalle', consumption: 8, target: 10, area: 300 },
    { room: 'Verwaltung', consumption: 5, target: 6, staff: 8 },
    { room: 'Aula', consumption: 6, target: 8, seats: 200 }
  ];

  const scheduleData = [
    { time: '07:30', activity: 'Schulbeginn', consumption: 18, students: 265 },
    { time: '09:00', activity: 'Erste große Pause', consumption: 25, students: 280 },
    { time: '12:00', activity: 'Mittagspause', consumption: 42, students: 180 },
    { time: '14:00', activity: 'Nachmittagsbetreuung', consumption: 32, students: 120 },
    { time: '16:00', activity: 'Schulende', consumption: 15, students: 45 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch sensors
        const sensorsData = await apiService.getSensors('grundschule-hechingen');
        setSensors(sensorsData);
        
      } catch (err) {
        setError('Fehler beim Laden der Grundschul-Daten');
        console.error('Error fetching grundschule data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      setSchoolKpis(prev => ({
        ...prev,
        energyIntensity: prev.energyIntensity + (Math.random() - 0.5) * 1,
        peakLoad: prev.peakLoad + (Math.random() - 0.5) * 2,
        classroomUtilization: prev.classroomUtilization + (Math.random() - 0.5) * 2
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [apiService]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Lade Grundschul-Daten..." />
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

  // Sensor values are available in sensors state if needed

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Eco Dark Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-sky-500/5" />
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Education Header Card */}
        <EcoCard variant="glass" size="lg" className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent mb-2">
                    Grundschule Hechingen
                  </h1>
                  <p className="text-slate-300 text-xl font-medium">
                    Grundschule • Baujahr: 1992 • Moderne Bildung
                  </p>
                  <p className="text-slate-400 text-lg mt-1">
                    2,100 m² • {schoolKpis.studentCount} Schüler • {schoolKpis.teacherCount} Lehrkräfte
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="px-5 py-3 bg-green-500/20 border border-green-400/40 rounded-2xl backdrop-blur-sm hover:bg-green-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-green-200 font-semibold">NACHHALTIGE BILDUNG</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-purple-500/20 border border-purple-400/40 rounded-2xl backdrop-blur-sm hover:bg-purple-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-300" />
                    <span className="text-purple-200 font-semibold">{schoolKpis.teacherCount} Lehrkräfte</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-blue-500/20 border border-blue-400/40 rounded-2xl backdrop-blur-sm hover:bg-blue-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-300" />
                    <span className="text-blue-200 font-semibold">{schoolKpis.classroomUtilization.toFixed(0)}% Auslastung</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <EcoCard variant="glass" size="sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white font-bold text-lg">System Online</span>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Letztes Update: {new Date().toLocaleTimeString('de-DE')}
                </div>
                <div className="text-slate-400 text-xs">
                  Unterricht: 07:45 - 15:30
                </div>
              </EcoCard>
            </div>
          </div>
        </EcoCard>

        {/* Education KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EcoKPICard
            title="Energieintensität"
            value={schoolKpis.energyIntensity.toFixed(1)}
            unit="kWh/m²"
            icon={Zap}
            color="blue"
            trend={{
              value: -8.5,
              label: "vs. Vorjahr",
              isPositive: true
            }}
            className="touch-friendly"
          />

          <EcoKPICard
            title="CO₂-Emissionen"
            value={schoolKpis.co2Emissions.toFixed(1)}
            unit="t/Jahr"
            icon={Leaf}
            color="green"
            trend={{
              value: -22.0,
              label: "Reduktion",
              isPositive: true
            }}
            className="touch-friendly"
          />

          <EcoKPICard
            title="PV-Eigenverbrauch"
            value={schoolKpis.pvSelfConsumption.toFixed(1)}
            unit="%"
            icon={Sun}
            color="orange"
            progress={schoolKpis.pvSelfConsumption}
            trend={{
              value: 4.2,
              label: "Steigerung",
              isPositive: true
            }}
            className="touch-friendly"
          />

          <EcoKPICard
            title="Energiekosten"
            value={`€${schoolKpis.energyCosts.toFixed(0)}`}
            unit="/Monat"
            icon={DollarSign}
            color="green"
            trend={{
              value: -12.1,
              label: "Einsparung",
              isPositive: true
            }}
            className="touch-friendly"
          />
        </div>

      {/* Educational Success Story */}
      <EcoCard variant="glass" size="lg" className="mb-8 touch-friendly">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-3">
              Vorbildliche Energieeffizienz im Bildungsbereich
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Die Grundschule zeigt beispielhafte Energieeffizienz mit modernster Technik und pädagogischen Nachhaltigkeitsprogrammen.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                <div className="text-green-400 font-bold text-lg">89%</div>
                <div className="text-green-300 text-sm">PV-Eigenverbrauch</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
                <div className="text-blue-400 font-bold text-lg">LED</div>
                <div className="text-blue-300 text-sm">100% Beleuchtung</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 p-4 rounded-xl border border-purple-500/30">
                <div className="text-purple-400 font-bold text-lg">92%</div>
                <div className="text-purple-300 text-sm">Raumauslastung</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 p-4 rounded-xl border border-orange-500/30">
                <div className="text-orange-400 font-bold text-lg">A+</div>
                <div className="text-orange-300 text-sm">Nachhaltigkeits-Note</div>
              </div>
            </div>
          </div>
        </div>
      </EcoCard>

      {/* Educational Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <EcoCard variant="glass" size="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full" />
            <h3 className="text-xl font-bold text-white">Schulbetrieb Energieverbrauch</h3>
          </div>
          <div className="text-slate-300 text-sm mb-6">
            Verbrauch entsprechend Unterrichtszeiten
          </div>
          <LazyLineChart data={energyDataMock} height={300} />
        </EcoCard>

        <EcoCard variant="glass" size="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full" />
            <h3 className="text-xl font-bold text-white">Raumnutzung & Effizienz</h3>
          </div>
          <div className="text-slate-300 text-sm mb-6">
            Energieverbrauch nach Schul-bereichen
          </div>
          <LazyBarChart 
            data={roomData.map(item => ({ 
              name: item.room, 
              value: item.consumption,
              target: item.target
            }))} 
            height={300} 
          />
        </EcoCard>
      </div>

      {/* Educational Management Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <EcoCard variant="glass" size="md">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Schulbetrieb</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-400">{schoolKpis.studentCount}</div>
                <div className="text-sm text-slate-400">Schüler</div>
              </div>
              <div className="text-center p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-400">12</div>
                <div className="text-sm text-slate-400">Klassen</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm font-medium text-slate-300">Klassenstärke Ø</span>
                <span className="font-bold text-white">23,3 Schüler</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm font-medium text-slate-300">Lehrkräfte</span>
                <span className="font-bold text-white">{schoolKpis.teacherCount} Personen</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-sm font-medium text-slate-300">Unterrichtsstunden/Tag</span>
                <span className="font-bold text-white">6 Stunden</span>
              </div>
            </div>
          </div>
        </EcoCard>

        <EcoCard variant="glass" size="md">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Tagesablauf & Energie</h3>
          </div>
          <div className="space-y-4">
            {scheduleData.map((item, index) => (
              <div key={index} className="p-3 bg-white/5 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white">{item.time}</div>
                    <div className="text-sm text-slate-400">{item.activity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">{item.consumption} kW</div>
                    <div className="text-xs text-slate-500">{item.students} Schüler</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EcoCard>

        <EcoCard variant="glass" size="md">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Nachhaltigkeitsbildung</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-green-500/20 rounded-xl border border-green-500/30">
              <h4 className="font-medium text-green-300 mb-2">
                Umwelt-Projekte
              </h4>
              <div className="text-sm text-green-400">
                • Energie-Detektive Programm<br/>
                • Schulgarten mit Kompost<br/>
                • Mülltrennung & Recycling
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <div className="text-xl font-bold text-blue-400">15</div>
                <div className="text-xs text-slate-400">Umwelt-AGs</div>
              </div>
              <div className="text-center p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <div className="text-xl font-bold text-purple-400">4.8</div>
                <div className="text-xs text-slate-400">Nachhaltigkeits-Note</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Raumauslastung</span>
                <span className="text-sm font-bold text-white">{schoolKpis.classroomUtilization.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" 
                  style={{ width: `${schoolKpis.classroomUtilization}%` }}
                ></div>
              </div>
            </div>
          </div>
        </EcoCard>
      </div>

      {/* Educational Excellence Showcase */}
      <EcoCard variant="glass" size="lg" className="mb-8 touch-friendly">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Bildungsexzellenz & Energieeffizienz</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
            <PlayCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-purple-400">Digital</div>
            <div className="text-sm text-slate-400">Smart Classrooms</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
            <Leaf className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-400">Grün</div>
            <div className="text-sm text-slate-400">Umweltbewusst</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
            <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-400">Effizient</div>
            <div className="text-sm text-slate-400">LED + Wärmepumpe</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl border border-orange-500/30">
            <Sun className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-orange-400">Solar</div>
            <div className="text-sm text-slate-400">38 kWp PV-Anlage</div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
          <h4 className="font-semibold text-purple-300 mb-2">
            Auszeichnungen & Zertifizierungen
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-purple-400">
              ✓ Umweltschule Baden-Württemberg 2023
            </div>
            <div className="text-blue-400">
              ✓ Energieeffizienz-Siegel Gold
            </div>
            <div className="text-green-400">
              ✓ Nachhaltige Schule des Jahres
            </div>
          </div>
        </div>
      </EcoCard>
      </div>
    </div>
  );
};

export default GrundschuleDashboard;