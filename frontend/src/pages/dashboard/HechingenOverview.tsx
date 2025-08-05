import React, { useState, useEffect } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Building } from '@/types';
import { DashboardStats } from '@/types/api';
import { DashboardTemplate } from '@/components/layout/DashboardTemplate';
import { EnhancedKPIMetrics, KPIMetric } from '@/components/dashboard/EnhancedKPIMetrics';
import { SmartEnergyChart, ChartDataPoint } from '@/components/charts/SmartEnergyChart';
import GlassCard from '@/components/ui/GlassCard';
import { GlassHeading, GlassText } from '@/components/ui/GlassTypography';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Zap, 
  Leaf, 
  Euro, 
  TrendingUp,
  Award,
  AlertTriangle,
  MapPin,
  BarChart3,
  Target,
  Calendar,
  Crown,
  Building2,
  Users,
  Clock,
  Thermometer,
  Activity
} from 'lucide-react';

interface BuildingEfficiency extends Building {
  efficiency: number;
  rank: number;
  efficiencyStatus: 'excellent' | 'good' | 'average' | 'poor';
}

const HechingenOverview: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [, setStats] = useState<DashboardStats | null>(null);
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
  }, [apiService]);

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

  // Generate mock chart data for visualization
  const generateChartData = (): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseValue = 150 + Math.sin(i * 0.5) * 30;
      const noise = (Math.random() - 0.5) * 20;
      
      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.max(0, baseValue + noise),
        predicted: Math.max(0, baseValue + noise + 10),
        target: 140,
        building: 'Alle Gebäude'
      });
    }
    
    return data;
  };

  // Create KPI metrics from building data
  const kpiMetrics: KPIMetric[] = [
    {
      id: 'total-consumption',
      title: 'Gesamtverbrauch',
      value: (totalConsumption / 1000000).toFixed(1),
      unit: 'GWh/Jahr',
      previousValue: (totalConsumption / 1000000) * 1.083,
      trend: 'down',
      trendPercent: 8.3,
      status: 'good',
      icon: <Zap className="w-5 h-5" />,
      category: 'energy',
      description: 'Jährlicher Energieverbrauch aller städtischen Gebäude'
    },
    {
      id: 'savings-potential',
      title: 'Einsparpotential',
      value: (totalSavingsPotential / 1000).toFixed(0),
      unit: 'MWh/Jahr',
      target: (totalSavingsPotential / 1000) * 1.2,
      trend: 'up',
      trendPercent: 15.2,
      status: 'excellent',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'efficiency',
      description: 'Identifiziertes Energieeinsparpotential'
    },
    {
      id: 'cost-savings',
      title: 'Kosteneinsparung',
      value: (totalCostSavings / 1000).toFixed(0),
      unit: 'k€/Jahr',
      trend: 'up',
      trendPercent: 12.4,
      status: 'good',
      icon: <Euro className="w-5 h-5" />,
      category: 'cost',
      description: 'Jährliche Kosteneinsparung durch Optimierungen'
    },
    {
      id: 'co2-savings',
      title: 'CO₂-Einsparung',
      value: '238.8',
      unit: 't/Jahr',
      target: 300,
      trend: 'up',
      trendPercent: 18.5,
      status: 'excellent',
      icon: <Leaf className="w-5 h-5" />,
      category: 'environment',
      description: 'Jährliche CO₂-Reduktion durch Energieeffizienz'
    },
    {
      id: 'efficiency-rating',
      title: 'Durchschnittseffizienz',
      value: averageEfficiency.toFixed(0),
      unit: 'kWh/m²',
      target: 80,
      trend: 'down',
      trendPercent: 5.2,
      status: 'good',
      icon: <Target className="w-5 h-5" />,
      category: 'performance',
      description: 'Energieverbrauch pro Quadratmeter'
    },
    {
      id: 'buildings-monitored',
      title: 'Überwachte Gebäude',
      value: buildings.length,
      unit: 'Gebäude',
      status: 'excellent',
      icon: <Building2 className="w-5 h-5" />,
      category: 'performance',
      description: 'Anzahl der im System erfassten Gebäude'
    }
  ];

  // European Energy Award metrics
  const co2Reduction2030Target = 56; // % Reduktion bis 2030
  const co2NeutralTarget = 2040; // Jahr für Klimaneutralität
  const currentCo2Reduction = 23.8; // % bereits erreicht

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardTemplate
          title="CityPulse Hechingen"
          subtitle="Smart Energy Management für alle städtischen Gebäude"
          icon={<MapPin className="w-8 h-8" />}
          layout="grid"
          gridCols={3}
          gap="lg"
          showSearch={true}
          showRefresh={true}
          showSettings={true}
          showNotifications={true}
          className="w-full"
        >
      {/* City Award Header */}
      <div className="col-span-full mb-6">
        <GlassCard theme="hechingen-success" className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="glass-card-light p-3 rounded-xl">
                <Award className="w-8 h-8 text-hechingen-green-500" />
              </div>
              <div>
                <GlassHeading level={2} size="lg" className="mb-1">
                  European Energy Award Gemeinde
                </GlassHeading>
                <GlassText variant="secondary">
                  Zertifiziert für nachhaltiges Energiemanagement • {buildings.length} Gebäude überwacht
                </GlassText>
              </div>
            </div>
            <div className="text-right">
              <div className="glass-text-muted text-sm">Durchschnittseffizienz</div>
              <div className="text-3xl font-bold glass-text-primary">
                {averageEfficiency.toFixed(0)} kWh/m²
              </div>
              <div className="glass-text-accent text-sm font-medium">
                Ziel: 80 kWh/m²
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Enhanced KPI Metrics */}
      <div className="col-span-full mb-8">
        <EnhancedKPIMetrics
          metrics={kpiMetrics}
          layout="grid"
          columns={3}
          showTrends={true}
          showTargets={true}
          showForecasts={false}
          animated={true}
        />
      </div>

      {/* Real-time Energy Chart */}
      <div className="col-span-full mb-8">
        <SmartEnergyChart
          data={generateChartData()}
          title="Energieverbrauch in Echtzeit"
          subtitle="Alle städtischen Gebäude - Letzte 24 Stunden"
          type="area"
          showPrediction={true}
          showTarget={true}
          showTrend={true}
          height={400}
          gradient={true}
          animated={true}
        />
      </div>

      {/* Climate Goals */}
      <div className="col-span-full mb-8">
        <GlassCard theme="hechingen-success" className="p-6">
          <GlassCard.Header>
            <div className="flex items-center gap-3">
              <div className="glass-card-light p-2 rounded-lg">
                <Target className="w-6 h-6 text-hechingen-green-500" />
              </div>
              <div>
                <GlassHeading level={2} size="xl">
                  Klimaziele Hechingen
                </GlassHeading>
                <GlassText variant="secondary">
                  Auf dem Weg zur Klimaneutralität bis 2040
                </GlassText>
              </div>
            </div>
          </GlassCard.Header>
          
          <GlassCard.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center glass-card-hechingen-success p-6 rounded-xl">
                <div className="text-3xl font-bold text-hechingen-green-400 mb-2">
                  {co2Reduction2030Target}%
                </div>
                <div className="glass-text-primary font-medium">CO₂-Reduktion bis 2030</div>
                <div className="glass-text-muted text-sm mt-1">Ziel der Stadt</div>
              </div>
              <div className="text-center glass-card-hechingen-primary p-6 rounded-xl">
                <div className="text-3xl font-bold text-hechingen-blue-400 mb-2">
                  {co2NeutralTarget}
                </div>
                <div className="glass-text-primary font-medium">Klimaneutral</div>
                <div className="glass-text-muted text-sm mt-1">Zieljahr</div>
              </div>
              <div className="text-center glass-card-hechingen-heritage p-6 rounded-xl">
                <div className="text-3xl font-bold text-hechingen-gold-400 mb-2">
                  {currentCo2Reduction}%
                </div>
                <div className="glass-text-primary font-medium">Bereits erreicht</div>
                <div className="glass-text-muted text-sm mt-1">Stand 2024</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between glass-text-primary">
                <span className="font-medium">Fortschritt zum 2030-Ziel</span>
                <span className="font-bold">{((currentCo2Reduction / co2Reduction2030Target) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full glass-card-light rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-hechingen-green-500 to-hechingen-green-400 h-4 rounded-full transition-all duration-1000" 
                  style={{ width: `${(currentCo2Reduction / co2Reduction2030Target) * 100}%` }}
                />
              </div>
            </div>
          </GlassCard.Content>
        </GlassCard>
        </div>
      </DashboardTemplate>
      </div>
    </div>
  );
};

export default HechingenOverview;