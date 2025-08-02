import React, { useState, useEffect } from 'react';
import { LazyPieChart, LazyLineChart } from '../../components/charts';

const BuergerDashboard: React.FC = () => {
  const [publicData, setPublicData] = useState({
    totalSavings: 45600,
    co2Reduction: 187.3,
    renewableShare: 68.5,
    sustainabilityProgress: 74
  });

  const energyMix = [
    { name: 'Solar', value: 45, color: '#F59E0B' },
    { name: 'Wind', value: 23, color: '#10B981' },
    { name: 'Biomasse', value: 12, color: '#8B5CF6' },
    { name: 'Erdgas', value: 20, color: '#EF4444' }
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
            🏛️ Stadt Hechingen Energieplattform
          </h1>
          <p className="text-xl text-gray-600">
            Transparenz über unsere kommunalen Energieprojekte
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Letzte Aktualisierung: {new Date().toLocaleString('de-DE')}
          </div>
        </div>

        {/* Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kosteneinsparung</h3>
            <p className="text-3xl font-bold text-green-600">€{publicData.totalSavings.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">seit Projektstart</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">🌱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">CO₂-Einsparung</h3>
            <p className="text-3xl font-bold text-green-600">{publicData.co2Reduction.toFixed(1)} t</p>
            <p className="text-sm text-gray-500 mt-2">pro Jahr</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erneuerbare Energie</h3>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nachhaltigkeitsziel</h3>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Energiemix der Stadt</h2>
            <LazyPieChart data={energyMix} height={300} />
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Unsere Energieprojekte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Rathaus', savings: '12,500 €', co2: '45 t CO₂', status: 'Optimiert' },
              { name: 'Realschule', savings: '8,900 €', co2: '32 t CO₂', status: 'Modernisiert' },
              { name: 'Grundschule', savings: '6,700 €', co2: '24 t CO₂', status: 'In Planung' },
              { name: 'Sporthallen', savings: '5,200 €', co2: '19 t CO₂', status: 'Umgesetzt' },
              { name: 'Hallenbad', savings: '8,100 €', co2: '29 t CO₂', status: 'Optimiert' },
              { name: 'Feuerwehr', savings: '4,200 €', co2: '15 t CO₂', status: 'Modernisiert' }
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
                    <span className="text-gray-600">Einsparung:</span>
                    <span className="font-medium text-green-600">{building.savings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CO₂-Reduktion:</span>
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
            Haben Sie Fragen zu unseren Energieprojekten?
          </h3>
          <p className="text-gray-600 mb-4">
            Kontaktieren Sie uns gerne für weitere Informationen
          </p>
          <div className="flex justify-center space-x-8">
            <div>
              <p className="font-medium">📧 Email</p>
              <p className="text-sm text-gray-600">energie@hechingen.de</p>
            </div>
            <div>
              <p className="font-medium">📞 Telefon</p>
              <p className="text-sm text-gray-600">07471 / 930-0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuergerDashboard; 