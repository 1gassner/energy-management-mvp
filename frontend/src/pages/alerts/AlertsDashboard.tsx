import React from 'react';
import { Link } from 'react-router-dom';

const AlertsDashboard: React.FC = () => {

  const alertStats = [
    { title: 'Aktive Alarme', count: 3, color: 'text-red-600', bgColor: 'bg-red-100' },
    { title: 'Anomalien erkannt', count: 7, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { title: 'Gelöste Probleme', count: 24, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Wartungen fällig', count: 2, color: 'text-blue-600', bgColor: 'bg-blue-100' }
  ];

  const quickActions = [
    { title: 'Alle Alarme anzeigen', link: '/alerts/active', icon: '🚨' },
    { title: 'Anomalien analysieren', link: '/alerts/anomalies', icon: '🔍' },
    { title: 'Alarm-Regeln verwalten', link: '/alerts/rules', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Anomaly Center</h1>
          <p className="text-gray-600 mt-2">
            Überwachen Sie kritische Ereignisse und Anomalien in Ihren Energiesystemen
          </p>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {alertStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <div className="w-8 h-8 flex items-center justify-center">
                    {index === 0 && '🚨'}
                    {index === 1 && '⚠️'}
                    {index === 2 && '✅'}
                    {index === 3 && '🔧'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{action.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Aktuelle Aktivitäten</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg">
              <div className="text-red-500 text-xl">🚨</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Hoher Energieverbrauch - Rathaus</h3>
                    <p className="text-sm text-gray-600">Verbrauch 15% über Normalwert</p>
                  </div>
                  <span className="text-xs text-gray-500">vor 5 min</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg">
              <div className="text-yellow-500 text-xl">⚠️</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Anomalie erkannt - PV-Anlage Schule</h3>
                    <p className="text-sm text-gray-600">Produktion unter Erwartung</p>
                  </div>
                  <span className="text-xs text-gray-500">vor 12 min</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="text-green-500 text-xl">✅</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">Problem behoben - Heizung Sporthalle</h3>
                    <p className="text-sm text-gray-600">Temperatur wieder im Normbereich</p>
                  </div>
                  <span className="text-xs text-gray-500">vor 1 Std</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/alerts/active"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Alle Alarme anzeigen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard; 