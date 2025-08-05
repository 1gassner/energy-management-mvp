import React from 'react';
import { 
  Building, 
  Zap, 
  AlertTriangle, 
  Activity,
  Leaf,
  Target
} from 'lucide-react';
import StatsCard from './StatsCard';
import EnergyStatsCard from './EnergyStatsCard';
import CityPulseMetricCard from './CityPulseMetricCard';

// Demo-Daten im Stil von CityPulse Hechingen
const mockEnergyData = {
  stats: {
    totalBuildings: 7,
    activeBuildings: 7,
    totalEnergyProduced: 2850,
    totalEnergyConsumed: 2650,
    totalCO2Saved: 1250,
    activeAlerts: 2,
    systemEfficiency: 92.5,
    monthlySavings: 3200
  },
  trends: {
    energyProduction: { value: 8.2, isPositive: true },
    energyConsumption: { value: -5.4, isPositive: true },
    co2Savings: { value: 12.1, isPositive: true },
    efficiency: { value: 3.8, isPositive: true }
  },
  buildings: [
    { name: 'Rathaus', consumption: 450, efficiency: 88, status: 'online' as const },
    { name: 'Gymnasium', consumption: 680, efficiency: 90, status: 'online' as const },
    { name: 'Realschule KfW-55', consumption: 320, efficiency: 95, status: 'online' as const },
    { name: 'Hallenbad', consumption: 920, efficiency: 85, status: 'maintenance' as const },
    { name: 'Grundschule', consumption: 280, efficiency: 92, status: 'online' as const }
  ]
};

const EnergyDashboardExample: React.FC = () => {
  const { stats, trends } = mockEnergyData;

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Energy Management Dashboard - CityPulse Design
        </h1>
        <p className="text-gray-600 mt-2">
          Portierte StatsCard und Layout-Komponenten von CityPulse Hechingen
        </p>
      </div>

      {/* Original StatsCard Style */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Standard StatsCard (CityPulse Style)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Gebäude gesamt"
            value={stats.totalBuildings}
            icon={<Building className="h-6 w-6" />}
            trend={{ value: 0, isPositive: true, label: 'stabil' }}
            color="purple"
          />
          <StatsCard
            title="Energie produziert"
            value={stats.totalEnergyProduced}
            unit="kWh"
            icon={<Zap className="h-6 w-6" />}
            trend={trends.energyProduction}
            color="blue"
          />
          <StatsCard
            title="CO₂ eingespart"
            value={stats.totalCO2Saved}
            unit="kg"
            icon={<Leaf className="h-6 w-6" />}
            trend={trends.co2Savings}
            color="green"
          />
          <StatsCard
            title="Offene Alerts"
            value={stats.activeAlerts}
            icon={<AlertTriangle className="h-6 w-6" />}
            trend={{ value: -25.5, isPositive: true, label: 'weniger Alerts' }}
            color="red"
          />
        </div>
      </div>

      {/* Enhanced EnergyStatsCard */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Enhanced EnergyStatsCard (mit Targets & Status)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnergyStatsCard
            title="System-Effizienz"
            value={stats.systemEfficiency}
            unit="%"
            type="efficiency"
            trend={trends.efficiency}
            target={{
              value: 95,
              achieved: stats.systemEfficiency >= 90
            }}
          />
          <EnergyStatsCard
            title="Gebäude-Status"
            value="Alle Online"
            type="status"
            status="online"
          />
          <EnergyStatsCard
            title="Monatliche Einsparungen"
            value={stats.monthlySavings}
            unit="€"
            type="cost"
            trend={{ value: 12.3, isPositive: true, label: 'Kosteneinsparung' }}
          />
          <EnergyStatsCard
            title="CO₂-Ziel Fortschritt"
            value={stats.totalCO2Saved}
            unit="kg"
            type="co2"
            target={{
              value: 1500,
              achieved: stats.totalCO2Saved >= 1200
            }}
          />
        </div>
      </div>

      {/* CityPulse Compact Style */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          CityPulse Compact Cards (mit Status-Indikatoren)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <CityPulseMetricCard
            title="Rathaus"
            value={450}
            unit="kWh"
            icon={<Building className="h-4 w-4" />}
            trend={{ value: -2.1, isPositive: true }}
            color="blue"
            compact
            status="normal"
          />
          <CityPulseMetricCard
            title="Gymnasium"
            value={680}
            unit="kWh"
            icon={<Building className="h-4 w-4" />}
            trend={{ value: 1.5, isPositive: false }}
            color="purple"
            compact
            status="normal"
          />
          <CityPulseMetricCard
            title="Realschule"
            value={320}
            unit="kWh"
            icon={<Building className="h-4 w-4" />}
            trend={{ value: -8.2, isPositive: true }}
            color="green"
            compact
            status="success"
          />
          <CityPulseMetricCard
            title="Hallenbad"
            value={920}
            unit="kWh"
            icon={<Building className="h-4 w-4" />}
            trend={{ value: 15.3, isPositive: false }}
            color="red"
            compact
            status="warning"
          />
          <CityPulseMetricCard
            title="Grundschule"
            value={280}
            unit="kWh"
            icon={<Building className="h-4 w-4" />}
            trend={{ value: -3.7, isPositive: true }}
            color="cyan"
            compact
            status="normal"
          />
          <CityPulseMetricCard
            title="Sporthallen"
            value={340}
            unit="kWh"
            icon={<Building className="h-4 w-4" />}
            trend={{ value: 0.8, isPositive: false }}
            color="orange"
            compact
            status="normal"
          />
        </div>
      </div>

      {/* Large Format Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Large Format Cards (Detailansicht)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CityPulseMetricCard
            title="Gesamt-Energieverbrauch"
            value={stats.totalEnergyConsumed}
            unit="kWh"
            icon={<Zap className="h-6 w-6" />}
            trend={trends.energyConsumption}
            color="blue"
            status="success"
          />
          <CityPulseMetricCard
            title="Nachhaltigkeits-Score"
            value={stats.systemEfficiency}
            unit="%"
            icon={<Target className="h-6 w-6" />}
            trend={trends.efficiency}
            color="emerald"
            status="success"
          />
        </div>
      </div>

      {/* Integration Example */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Mixed Layout (wie CityPulse Dashboard)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Metrics */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatsCard
              title="Energie-Effizienz"
              value={stats.systemEfficiency}
              unit="%"
              icon={<Activity className="h-6 w-6" />}
              trend={trends.efficiency}
              color="green"
            />
            <StatsCard
              title="CO₂-Reduktion"
              value={stats.totalCO2Saved}
              unit="kg"
              icon={<Leaf className="h-6 w-6" />}
              trend={trends.co2Savings}
              color="emerald"
            />
          </div>
          
          {/* Status Panel */}
          <div className="space-y-4">
            <EnergyStatsCard
              title="System-Status"
              value="Optimal"
              type="status"
              status="online"
            />
            <EnergyStatsCard
              title="Kritische Alerts"
              value={stats.activeAlerts}
              type="alert"
              trend={{ value: -50, isPositive: true, label: 'verbessert' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyDashboardExample;