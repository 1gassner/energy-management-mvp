import React, { useState, useEffect } from 'react';
import { LazyPieChart, LazyLineChart } from '../../components/charts';

const BuergerDashboard: React.FC = () => {
  const [publicData, setPublicData] = useState({
    totalSavings: 45600,
    co2Reduction: 187.3,
    renewableShare: 68.5,
    sustainabilityProgress: 74
  });

  const servicesMix = [
    { name: 'Bürgerdienste', value: 45, color: '#F59E0B' },
    { name: 'Bildung', value: 23, color: '#10B981' },
    { name: 'Verkehr', value: 12, color: '#8B5CF6' },
    { name: 'Sicherheit', value: 20, color: '#EF4444' }
  ];

  const monthlyData = [
    { month: 'Jan', savings: 3200, co2: 14.2 },
    { month: 'Feb', savings: 3800, co2: 16.8 },
    { month: 'Mar', savings: 4100, co2: 18.1 },
    { month: 'Apr', savings: 4500, co2: 19.9 },
    { month: 'Mai', savings: 4200, co2: 18.6 },
    { month: 'Jun', savings: 3900, co2: 17.2 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPublicData(prev => ({
        ...prev,
        totalSavings: prev.totalSavings + Math.floor(Math.random() * 100),
        co2Reduction: prev.co2Reduction + (Math.random() - 0.5) * 2
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏛️ CityPulse - Stadt Hechingen
          </h1>
          <p className="text-xl text-gray-600">
            Der digitale Puls deiner Stadt - Transparenz über kommunale Projekte und Dienste
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Letzte Aktualisierung: {new Date().toLocaleString('de-DE')}
          </div>
        </div>

        {/* Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Digitale Dienste</h3>
            <p className="text-3xl font-bold text-green-600">{(publicData.totalSavings / 1000).toFixed(0)}</p>
            <p className="text-sm text-gray-500 mt-2">Online-Services</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">🌱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bürgerzufriedenheit</h3>
            <p className="text-3xl font-bold text-green-600">{(publicData.co2Reduction * 0.5).toFixed(1)}%</p>
            <p className="text-sm text-gray-500 mt-2">Zufriedenheitsindex</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Digitalisierungsgrad</h3>
            <p className="text-3xl font-bold text-blue-600">{publicData.renewableShare.toFixed(1)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${publicData.renewableShare}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart City Ziel</h3>
            <p className="text-3xl font-bold text-purple-600">{publicData.sustainabilityProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${publicData.sustainabilityProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Energy Mix */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Kommunale Dienste</h2>
            <LazyPieChart data={servicesMix} height={300} />
          </div>

          {/* Monthly Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Monatliche Entwicklung</h2>
            <LazyLineChart data={monthlyData.map(item => ({ 
              time: item.month, 
              consumption: item.savings / 100, 
              production: item.co2 * 5, 
              grid: item.co2 
            }))} height={300} />
          </div>
        </div>

        {/* Building Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Unsere Smart City Projekte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Rathaus', savings: '95%', co2: 'Digital', status: 'Optimiert' },
              { name: 'Realschule', savings: '87%', co2: 'Bildung+', status: 'Modernisiert' },
              { name: 'Grundschule', savings: '73%', co2: 'Digital', status: 'In Planung' },
              { name: 'Sporthallen', savings: '82%', co2: 'Smart', status: 'Umgesetzt' },
              { name: 'Hallenbad', savings: '91%', co2: 'Effizient', status: 'Optimiert' },
              { name: 'Feuerwehr', savings: '78%', co2: 'Sicher+', status: 'Modernisiert' }
            ].map((building, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{building.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    building.status === 'Optimiert' ? 'bg-green-100 text-green-800' :
                    building.status === 'Modernisiert' ? 'bg-blue-100 text-blue-800' :
                    building.status === 'Umgesetzt' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {building.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Digitalisierung:</span>
                    <span className="font-medium text-green-600">{building.savings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-blue-600">{building.co2}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Haben Sie Fragen zu unseren Smart City Projekten?
          </h3>
          <p className="text-gray-600 mb-4">
            Kontaktieren Sie uns gerne für weitere Informationen
          </p>
          <div className="flex justify-center space-x-8 mb-6">
            <div>
              <p className="font-medium">📧 Email</p>
              <p className="text-sm text-gray-600">info@citypulse-hechingen.de</p>
            </div>
            <div>
              <p className="font-medium">📞 Telefon</p>
              <p className="text-sm text-gray-600">07471 / 930-0</p>
            </div>
          </div>
          
          {/* Staff Login Section */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 mb-3">
              Sind Sie Mitarbeiter der Stadtverwaltung?
            </p>
            <a 
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🔑 Zum Verwaltungsbereich
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuergerDashboard; 