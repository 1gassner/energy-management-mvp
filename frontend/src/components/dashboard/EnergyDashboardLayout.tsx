import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Zap, 
  BarChart3,
  Clock,
  Leaf,
  Settings
} from 'lucide-react';
// import StatsCard from './StatsCard';
import EnergyStatsCard from './EnergyStatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '@/components/ui/Button';

interface EnergyDashboardData {
  stats: {
    totalBuildings: number;
    activeBuildings: number;
    totalEnergyProduced: number;
    totalEnergyConsumed: number;
    totalCO2Saved: number;
    activeAlerts: number;
    systemEfficiency: number;
    monthlySavings: number;
  };
  trends: {
    energyProduction: { value: number; isPositive: boolean };
    energyConsumption: { value: number; isPositive: boolean };
    co2Savings: { value: number; isPositive: boolean };
    efficiency: { value: number; isPositive: boolean };
  };
  recentActivity: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: 'info' | 'warning' | 'success';
  }>;
  buildings: Array<{
    id: string;
    name: string;
    status: 'online' | 'offline' | 'maintenance';
    consumption: number;
    efficiency: number;
  }>;
  targets: {
    co2Reduction: { current: number; target: number };
    energyEfficiency: { current: number; target: number };
  };
}

interface EnergyDashboardLayoutProps {
  data: EnergyDashboardData;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const EnergyDashboardLayout: React.FC<EnergyDashboardLayoutProps> = ({
  data,
  isLoading = false,
  onRefresh
}) => {
  const { stats, trends, recentActivity, buildings, targets } = data;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Energy Management Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Übersicht über alle Energie-Systeme und Gebäude-Performance
        </p>
        {onRefresh && (
          <Button 
            onClick={onRefresh}
            variant="outline" 
            size="sm"
            className="mt-4"
          >
            Aktualisieren
          </Button>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnergyStatsCard
          title="Gebäude gesamt"
          value={stats.totalBuildings}
          type="building"
          trend={{ value: 0, isPositive: true, label: 'stabil' }}
        />
        <EnergyStatsCard
          title="Aktive Gebäude"
          value={stats.activeBuildings}
          type="status"
          status="online"
        />
        <EnergyStatsCard
          title="Energie produziert"
          value={stats.totalEnergyProduced}
          unit="kWh"
          type="energy"
          trend={trends.energyProduction}
        />
        <EnergyStatsCard
          title="CO₂ eingespart"
          value={stats.totalCO2Saved}
          unit="kg"
          type="co2"
          trend={trends.co2Savings}
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnergyStatsCard
          title="Energie verbraucht"
          value={stats.totalEnergyConsumed}
          unit="kWh"
          type="energy"
          trend={trends.energyConsumption}
        />
        <EnergyStatsCard
          title="System-Effizienz"
          value={stats.systemEfficiency}
          unit="%"
          type="efficiency"
          trend={trends.efficiency}
          target={{
            value: targets.energyEfficiency.target,
            achieved: stats.systemEfficiency >= targets.energyEfficiency.target
          }}
        />
        <EnergyStatsCard
          title="Offene Alerts"
          value={stats.activeAlerts}
          type="alert"
          trend={{ value: -25.5, isPositive: true, label: 'weniger Alerts' }}
        />
        <EnergyStatsCard
          title="Monatliche Einsparungen"
          value={stats.monthlySavings}
          unit="€"
          type="cost"
          trend={{ value: 12.3, isPositive: true, label: 'Kosteneinsparung' }}
        />
      </div>

      {/* Charts and Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>Energie-Übersicht</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEnergyProduced.toLocaleString('de-DE')} kWh
              </p>
              <p className="text-sm text-gray-600">Aktuelle Produktion</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Produktion</span>
                <span className="font-medium text-green-600">
                  {stats.totalEnergyProduced.toLocaleString('de-DE')} kWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verbrauch</span>
                <span className="font-medium">
                  {stats.totalEnergyConsumed.toLocaleString('de-DE')} kWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Effizienz</span>
                <span className="font-medium text-blue-600">
                  {stats.systemEfficiency}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CO2 & Sustainability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <span>Nachhaltigkeit</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCO2Saved.toLocaleString('de-DE')} kg
              </p>
              <p className="text-sm text-gray-600">CO₂ Einsparung</p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>CO₂-Reduktionsziel</span>
                  <span>{((stats.totalCO2Saved / targets.co2Reduction.target) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-green-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (stats.totalCO2Saved / targets.co2Reduction.target) * 100)}%` 
                    }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Ziel: {targets.co2Reduction.target.toLocaleString('de-DE')} kg CO₂
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buildings and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buildings Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gebäude-Status</span>
              <Link to="/buildings">
                <Button variant="outline" size="sm">
                  Alle anzeigen
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {buildings.map((building) => (
                <div
                  key={building.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{building.name}</p>
                      <p className="text-sm text-gray-500">
                        {building.consumption.toLocaleString('de-DE')} kWh
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      {building.efficiency}%
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      building.status === 'online'
                        ? 'bg-green-100 text-green-800'
                        : building.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {building.status === 'online'
                        ? 'Online'
                        : building.status === 'maintenance'
                        ? 'Wartung'
                        : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Aktuelle Aktivitäten</span>
              <Link to="/activity">
                <Button variant="outline" size="sm">
                  Alle anzeigen
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <span className="text-lg mt-0.5">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 break-words">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(activity.timestamp).toLocaleTimeString('de-DE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellzugriff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/energy-flow">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Zap className="h-6 w-6" />
                <span>Energy Flow</span>
              </Button>
            </Link>
            <Link to="/buildings">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Building className="h-6 w-6" />
                <span>Gebäude</span>
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>Analytics</span>
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Settings className="h-6 w-6" />
                <span>Einstellungen</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyDashboardLayout;