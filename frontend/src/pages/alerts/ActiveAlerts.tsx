import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  building: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

const ActiveAlerts: React.FC = () => {
  const [alerts] = useState<Alert[]>([
    {
      id: 'AL001',
      severity: 'critical',
      title: 'Hoher Energieverbrauch',
      building: 'Rathaus',
      description: 'Verbrauch 15% über Normalwert - mögliche Gerätefehlfunktion',
      timestamp: '2024-01-15 14:30:00',
      status: 'active'
    },
    {
      id: 'AL002',
      severity: 'warning',
      title: 'PV-Anlage Unterproduktion',
      building: 'Realschule',
      description: 'Solarproduktion 20% unter Erwartung',
      timestamp: '2024-01-15 12:15:00',
      status: 'acknowledged'
    },
    {
      id: 'AL003',
      severity: 'critical',
      title: 'Heizungsausfall',
      building: 'Grundschule',
      description: 'Heizungssystem nicht erreichbar',
      timestamp: '2024-01-15 09:45:00',
      status: 'active'
    },
    {
      id: 'AL004',
      severity: 'warning',
      title: 'Wartung fällig',
      building: 'Sporthalle',
      description: 'Lüftungsanlage - planmäßige Wartung überfällig',
      timestamp: '2024-01-15 08:00:00',
      status: 'acknowledged'
    },
    {
      id: 'AL005',
      severity: 'info',
      title: 'Batteriekapazität niedrig',
      building: 'Hallenbad',
      description: 'Batteriespeicher unter 20% Kapazität',
      timestamp: '2024-01-14 22:30:00',
      status: 'active'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to="/alerts" 
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Zurück zu Alerts</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Aktive Alarme</h1>
          <p className="text-gray-600 mt-2">
            Übersicht aller aktuellen Alarme und Warnungen
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kritische Alarme</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.severity === 'critical' && a.status === 'active').length}
                </p>
              </div>
              <div className="text-3xl">🚨</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnungen</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => a.severity === 'warning').length}
                </p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bestätigt</p>
                <p className="text-2xl font-bold text-blue-600">
                  {alerts.filter(a => a.status === 'acknowledged').length}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Alarm-Details</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schweregrad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alarm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gebäude
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beschreibung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zeit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-500">ID: {alert.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.building}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">{alert.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(alert.timestamp).toLocaleString('de-DE')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Bestätigen
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Lösen
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

export default ActiveAlerts; 