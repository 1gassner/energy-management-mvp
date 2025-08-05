import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LazyPieChart, LazyLineChart } from '../../components/charts';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import EcoCard from '../../components/ui/EcoCard';
import EcoKPICard from '../../components/ui/EcoKPICard';
import EcoButton from '../../components/ui/EcoButton';
import { 
  Building2, 
  Zap, 
  TrendingUp, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  CheckCircle,
  Target,
  Award,
  Leaf,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Shield,
  Globe,
  Heart,
  Star,
  Lightbulb,
  TreePine,
  Waves
} from 'lucide-react';

const BuergerDashboard: React.FC = () => {
  const [publicData, setPublicData] = useState({
    totalSavings: 45600,
    co2Reduction: 187.3,
    renewableShare: 68.5,
    sustainabilityProgress: 74,
    activeBuildings: 7,
    totalEfficiency: 84.2
  });

  const [isVisible, setIsVisible] = useState({});

  // Eco-friendly data visualization colors
  const servicesMix = [
    { name: 'Bildungseinrichtungen', value: 35, color: '#10b981' }, // Eco Green
    { name: 'Verwaltungsgebäude', value: 28, color: '#0ea5e9' }, // Eco Blue
    { name: 'Sportanlagen', value: 22, color: '#8b5cf6' }, // Eco Purple
    { name: 'Kultureinrichtungen', value: 15, color: '#f59e0b' } // Eco Orange
  ];

  const monthlyData = [
    { month: 'Jan', savings: 3200, co2: 14.2, efficiency: 81 },
    { month: 'Feb', savings: 3800, co2: 16.8, efficiency: 83 },
    { month: 'Mar', savings: 4100, co2: 18.1, efficiency: 85 },
    { month: 'Apr', savings: 4500, co2: 19.9, efficiency: 87 },
    { month: 'Mai', savings: 4200, co2: 18.6, efficiency: 84 },
    { month: 'Jun', savings: 3900, co2: 17.2, efficiency: 82 }
  ];

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPublicData(prev => ({
        ...prev,
        totalSavings: prev.totalSavings + Math.floor(Math.random() * 50),
        co2Reduction: prev.co2Reduction + (Math.random() - 0.5) * 1.5,
        renewableShare: Math.min(100, prev.renewableShare + (Math.random() - 0.5) * 0.5),
        totalEfficiency: Math.min(100, prev.totalEfficiency + (Math.random() - 0.5) * 0.3)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer für Animationen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="particles" intensity="medium" />
      
      {/* Hero Section - Eco Modern */}
      <section className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" data-animate id="hero">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 eco-card rounded-3xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                  <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-pulse border-2 border-slate-900" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse border-2 border-slate-900" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              CityPulse Hechingen
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Ihr Smart City Energieportal für eine nachhaltige Zukunft
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <EcoButton 
                color="gradient" 
                size="lg"
                icon={Heart}
                onClick={() => document.getElementById('kpis')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Live Dashboard erkunden
              </EcoButton>
              <EcoButton 
                variant="outline" 
                size="lg"
                icon={ExternalLink}
                onClick={() => window.open('https://www.hechingen.de', '_blank')}
              >
                Zur offiziellen Website
              </EcoButton>
            </div>
            
            {/* Live Status Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 eco-card px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-slate-300">Live Data</span>
              </div>
              <div className="flex items-center gap-2 eco-card px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">100% Transparent</span>
              </div>
              <div className="flex items-center gap-2 eco-card px-4 py-2 rounded-full">
                <TreePine className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">CO₂ Neutral 2035</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Stadt Info Banner */}
        <EcoCard 
          className="mb-16 p-8" 
          variant="glass" 
          glow="green"
          data-animate 
          id="city-banner"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Zollernstadt Hechingen
                </h2>
                <p className="text-slate-300 text-lg">
                  Smart City Energieportal • Transparenz für Bürger
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Live: {new Date().toLocaleString('de-DE')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>72379 Hechingen • Baden-Württemberg</span>
              </div>
            </div>
          </div>
        </EcoCard>

        {/* Eco KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16" data-animate id="kpis">
          <EcoKPICard
            title="Energieeinsparungen"
            value={`€${(publicData.totalSavings / 1000).toFixed(0)}k`}
            subtitle="Jährliche Einsparungen"
            icon={TrendingUp}
            color="green"
            trend={{
              value: 12,
              label: "zum Vorjahr",
              isPositive: true
            }}
          />

          <EcoKPICard
            title="CO₂-Reduktion"
            value={publicData.co2Reduction.toFixed(1)}
            unit="t"
            subtitle="Jährlich eingespart"
            icon={Leaf}
            color="blue"
            trend={{
              value: 8.5,
              label: "Ziel übertroffen",
              isPositive: true
            }}
          />

          <EcoKPICard
            title="Erneuerbare Energien"
            value={publicData.renewableShare.toFixed(1)}
            unit="%"
            subtitle="Anteil am Energiemix"
            icon={Zap}
            color="purple"
            progress={publicData.renewableShare}
          />

          <EcoKPICard
            title="Klimaneutralität 2035"
            value={publicData.sustainabilityProgress}
            unit="%"
            subtitle="Fortschritt zum Ziel"
            icon={Target}
            color="orange"
            progress={publicData.sustainabilityProgress}
            trend={{
              value: 15,
              label: "Beschleunigung",
              isPositive: true
            }}
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16" data-animate id="charts">
          {/* Energy Mix Chart */}
          <EcoCard className="p-8" variant="glass" glow="blue">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Kommunale Services</h2>
                <p className="text-slate-400">Energieverteilung nach Bereichen</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl p-4 mb-4">
              <LazyPieChart data={servicesMix} height={300} />
            </div>
            
            <div className="eco-card-solid p-4 rounded-xl">
              <p className="text-sm text-slate-300 text-center">
                <Lightbulb className="w-4 h-4 inline mr-2 text-emerald-400" />
                Smart-Optimierung aktiv in allen Bereichen
              </p>
            </div>
          </EcoCard>

          {/* Monthly Progress Chart */}
          <EcoCard className="p-8" variant="glass" glow="purple">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Entwicklung 2024</h2>
                <p className="text-slate-400">Monatliche Performance</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl p-4 mb-4">
              <LazyLineChart data={monthlyData.map(item => ({ 
                time: item.month, 
                consumption: item.savings / 100, 
                production: item.co2 * 5, 
                grid: item.efficiency 
              }))} height={300} />
            </div>
            
            <div className="eco-card-solid p-4 rounded-xl">
              <p className="text-sm text-slate-300 text-center">
                <Star className="w-4 h-4 inline mr-2 text-purple-400" />
                Kontinuierliche Verbesserung erkennbar
              </p>
            </div>
          </EcoCard>
        </div>

        {/* Smart Buildings Overview */}
        <EcoCard className="p-8 mb-16" variant="glass" glow="green" data-animate id="buildings">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Smart City Projekte</h2>
                <p className="text-slate-300">Alle 7 kommunalen Gebäude sind smart-optimiert</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="eco-card-solid px-4 py-2 rounded-full">
                <span className="text-emerald-400 font-bold text-sm">
                  <Globe className="w-4 h-4 inline mr-2" />
                  100% Online
                </span>
              </div>
              <div className="eco-card-solid px-4 py-2 rounded-full">
                <span className="text-blue-400 font-bold text-sm">
                  <Waves className="w-4 h-4 inline mr-2" />
                  Live Monitoring
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              { 
                name: 'Rathaus Hechingen', 
                efficiency: '95%', 
                category: 'Digital Hub', 
                status: 'optimal', 
                color: 'green',
                link: '/buildings/rathaus',
                savings: '€12.3k',
                co2: '8.5t'
              },
              { 
                name: 'Realschule Hechingen', 
                efficiency: '87%', 
                category: 'Bildung+', 
                status: 'good', 
                color: 'blue',
                link: '/buildings/realschule',
                savings: '€8.9k',
                co2: '6.2t'
              },
              { 
                name: 'Grundschule Hechingen', 
                efficiency: '73%', 
                category: 'Learning', 
                status: 'warning', 
                color: 'orange',
                link: '/buildings/grundschule',
                savings: '€5.4k',
                co2: '4.1t'
              },
              { 
                name: 'Werkrealschule Hechingen', 
                efficiency: '81%', 
                category: 'Bildung+', 
                status: 'good', 
                color: 'purple',
                link: '/buildings/werkrealschule',
                savings: '€7.2k',
                co2: '5.8t'
              },
              { 
                name: 'Sporthallen Hechingen', 
                efficiency: '82%', 
                category: 'Sport Smart', 
                status: 'good', 
                color: 'blue',
                link: '/buildings/sporthallen',
                savings: '€9.1k',
                co2: '7.3t'
              },
              { 
                name: 'Hallenbad Hechingen', 
                efficiency: '91%', 
                category: 'Aqua Tech', 
                status: 'optimal', 
                color: 'green',
                link: '/buildings/hallenbad',
                savings: '€15.7k',
                co2: '12.4t'
              },
              { 
                name: 'Gymnasium Hechingen', 
                efficiency: '78%', 
                category: 'Bildung+', 
                status: 'good', 
                color: 'purple',
                link: '/buildings/gymnasium',
                savings: '€6.8k',
                co2: '5.2t'
              }
            ].map((building, index) => (
              <Link 
                key={index} 
                to={building.link}
                className="eco-card-solid p-6 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden"
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    building.status === 'optimal' ? 'bg-emerald-400' :
                    building.status === 'good' ? 'bg-blue-400' :
                    'bg-orange-400'
                  }`} />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${
                      building.color === 'green' ? 'from-emerald-500 to-green-500' :
                      building.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                      building.color === 'purple' ? 'from-purple-500 to-violet-500' :
                      'from-orange-500 to-yellow-500'
                    }`}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">
                        {building.name}
                      </h3>
                      <p className="text-xs text-slate-400">{building.category}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300" />
                </div>

                {/* Metrics */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Effizienz:</span>
                    <span className={`font-bold text-lg ${
                      building.status === 'optimal' ? 'text-emerald-400' :
                      building.status === 'good' ? 'text-blue-400' :
                      'text-orange-400'
                    }`}>
                      {building.efficiency}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 block">Einsparung</span>
                      <span className="text-emerald-400 font-semibold">{building.savings}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">CO₂ reduziert</span>
                      <span className="text-blue-400 font-semibold">{building.co2}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 bg-gradient-to-r ${
                        building.color === 'green' ? 'from-emerald-500 to-green-500' :
                        building.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                        building.color === 'purple' ? 'from-purple-500 to-violet-500' :
                        'from-orange-500 to-yellow-500'
                      }`}
                      style={{ width: building.efficiency }}
                    />
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </Link>
            ))}
          </div>
        </EcoCard>

        {/* Contact & Footer - Eco Style */}
        <EcoCard className="p-8 mb-16" variant="glass" glow="blue" data-animate id="contact">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Fragen zu unseren Smart City Projekten?
            </h3>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Das Energieteam der Stadt Hechingen steht Ihnen gerne für weitere Informationen zur Verfügung
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <EcoCard className="text-center p-6" variant="solid" hover={false}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-white mb-2">E-Mail</p>
              <p className="text-slate-400 text-sm">info@hechingen.de</p>
            </EcoCard>
            
            <EcoCard className="text-center p-6" variant="solid" hover={false}>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-white mb-2">Telefon</p>
              <p className="text-slate-400 text-sm">07471 / 930-0</p>
            </EcoCard>
            
            <EcoCard className="text-center p-6" variant="solid" hover={false}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-white mb-2">Adresse</p>
              <p className="text-slate-400 text-sm">Obertorplatz 7<br />72379 Hechingen</p>
            </EcoCard>
          </div>
          
          {/* Staff Login Section */}
          <div className="border-t border-slate-700 pt-8 text-center">
            <p className="text-slate-300 mb-6 text-lg">
              Sind Sie Mitarbeiter der Stadt Hechingen?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <EcoButton
                size="lg"
                icon={Building2}
                onClick={() => location.href = '/login'}
              >
                Zum Verwaltungsbereich
              </EcoButton>
              <EcoButton
                variant="outline"
                size="lg"
                icon={ExternalLink}
                onClick={() => window.open('https://www.hechingen.de', '_blank')}
              >
                Offizielle Website
              </EcoButton>
            </div>
          </div>
        </EcoCard>
      </div>
      
      {/* Floating Eco Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <EcoButton
            className="w-16 h-16 rounded-full !p-0 shadow-2xl animate-pulse hover:animate-none"
            color="gradient"
            onClick={() => window.open('https://www.hechingen.de', '_blank')}
            aria-label="Zur offiziellen Website der Stadt Hechingen"
          >
            <ExternalLink className="w-7 h-7" />
          </EcoButton>
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-400 rounded-full animate-ping opacity-75" />
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default BuergerDashboard; 