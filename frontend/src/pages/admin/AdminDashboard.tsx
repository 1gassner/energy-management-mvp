import React, { useState, useEffect } from 'react';
import { LazyLineChart, LazyBarChart } from '../../components/charts';
import { notificationService } from '../../services/notification.service';

const AdminDashboard: React.FC = () => {
  const [kpis, setKpis] = useState({
    totalSavings: 45600,
    co2Reduction: 187.3,
    systemAvailability: 99.2,
    activeAlarms: 3,
    iso50001Compliance: 94
  });

  const [systemData] = useState([
    { building: 'Rathaus', status: 'Online', efficiency: 92, alerts: 1 },
    { building: 'Realschule', status: 'Online', efficiency: 88, alerts: 0 },
    { building: 'Grundschule', status: 'Online', efficiency: 95, alerts: 0 },
    { building: 'Sporthalle', status: 'Maintenance', efficiency: 85, alerts: 2 },
    { building: 'Hallenbad', status: 'Online', efficiency: 90, alerts: 0 },
    { building: 'Feuerwehr', status: 'Online', efficiency: 87, alerts: 0 }
  ]);

  const energyTrends = [
    { month: 'Jan', consumption: 145000, savings: 8500, co2: 32 },
    { month: 'Feb', consumption: 132000, savings: 9200, co2: 38 },
    { month: 'Mar', consumption: 128000, savings: 9800, co2: 42 },
    { month: 'Apr', consumption: 118000, savings: 10500, co2: 45 },
    { month: 'Mai', consumption: 112000, savings: 11200, co2: 48 },
    { month: 'Jun', consumption: 108000, savings: 11800, co2: 52 }
  ];

  const complianceData = [
    { category: 'Energiemonitoring', score: 98 },
    { category: 'Dokumentation', score: 92 },
    { category: 'Zielerfüllung', score: 89 },
    { category: 'Schulungen', score: 95 },
    { category: 'Audits', score: 97 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prev => ({
        ...prev,
        totalSavings: prev.totalSavings + Math.floor(Math.random() * 50),
        co2Reduction: prev.co2Reduction + (Math.random() - 0.5) * 1,
        systemAvailability: Math.max(98, Math.min(100, prev.systemAvailability + (Math.random() - 0.5) * 0.5))
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'export':
        notificationService.success('Datenexport wird vorbereitet...');
        break;
      case 'maintenance':
        notificationService.info('Wartungsplan wird geöffnet...');
        break;
      case 'alerts':
        notificationService.warning('3 aktive Alarme gefunden');
        break;
      case 'report':
        notificationService.loading('Bericht wird generiert...');
        break;
      default:
        notificationService.info('Aktion ausgeführt');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Zentrale Verwaltung und Überwachung aller Energiesysteme
          </p>
        </div>

        {/* Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamteinsparung</p>
                <p className="text-2xl font-bold text-green-600">€{kpis.totalSavings.toLocaleString()}</p>
                <p className="text-xs text-gray-500">seit Projektstart</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">↑ €2,340 diese Woche</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">CO₂-Reduktion</p>
                <p className="text-2xl font-bold text-green-600">{kpis.co2Reduction.toFixed(1)} t</p>
                <p className="text-xs text-gray-500">pro Jahr</p>
              </div>
              <div className="text-3xl">🌱</div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">↑ 12% vs. Vorjahr</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Systemverfügbarkeit</p>
                <p className="text-2xl font-bold text-blue-600">{kpis.systemAvailability.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">letzte 30 Tage</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${kpis.systemAvailability}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Alarme</p>
                <p className="text-2xl font-bold text-red-600">{kpis.activeAlarms}</p>
                <p className="text-xs text-gray-500">benötigen Aufmerksamkeit</p>
              </div>
              <div className="text-3xl">🚨</div>
            </div>
            <div className="mt-2">
              <button 
                onClick={() => handleQuickAction('alerts')}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Alarme anzeigen
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ISO 50001 Konformität</p>
                <p className="text-2xl font-bold text-purple-600">{kpis.iso50001Compliance}%</p>
                <p className="text-xs text-gray-500">Zertifizierungsgrad</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${kpis.iso50001Compliance}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => handleQuickAction('export')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium">Daten exportieren</div>
              </div>
            </button>
            <button 
              onClick={() => handleQuickAction('maintenance')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🔧</div>
                <div className="text-sm font-medium">Wartung planen</div>
              </div>
            </button>
            <button 
              onClick={() => handleQuickAction('report')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm font-medium">Bericht erstellen</div>
              </div>
            </button>
            <button 
              onClick={() => handleQuickAction('settings')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm font-medium">Einstellungen</div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Energy Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Energietrends</h2>
            <LazyLineChart data={energyTrends.map(item => ({ 
              time: item.month, 
              consumption: item.consumption / 1000, 
              production: item.savings / 100, 
              grid: item.co2 
            }))} height={300} />
          </div>

          {/* Compliance Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">ISO 50001 Konformität</h2>
            <LazyBarChart data={complianceData.map(item => ({ name: item.category, value: item.score }))} height={300} color="#8B5CF6" />
          </div>
        </div>

        {/* System Status Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Systemstatus Übersicht</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gebäude
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Effizienz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alarme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {systemData.map((system, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{system.building}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        system.status === 'Online' ? 'bg-green-100 text-green-800' :
                        system.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {system.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{system.efficiency}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${system.efficiency}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${system.alerts > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                        {system.alerts}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Details
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Verwalten
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 