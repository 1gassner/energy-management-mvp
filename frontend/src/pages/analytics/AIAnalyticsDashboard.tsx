import React from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const AIAnalyticsDashboard: React.FC = () => {
  // Note: timeframe selection functionality to be implemented later
  // const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  // Consumption patterns data
  const consumptionPatterns = [
    { hour: '00:00', weekday: 45, weekend: 35 },
    { hour: '06:00', weekday: 85, weekend: 45 },
    { hour: '09:00', weekday: 120, weekend: 65 },
    { hour: '12:00', weekday: 105, weekend: 75 },
    { hour: '15:00', weekday: 95, weekend: 80 },
    { hour: '18:00', weekday: 110, weekend: 90 },
    { hour: '21:00', weekday: 75, weekend: 70 },
    { hour: '24:00', weekday: 50, weekend: 45 }
  ];

  // Cost breakdown data
  const costBreakdownData = [
    { name: 'Strom', value: 4200, color: '#3B82F6' },
    { name: 'Gas', value: 2800, color: '#F59E0B' },
    { name: 'Fernwärme', value: 1500, color: '#10B981' },
    { name: 'Wasser', value: 800, color: '#8B5CF6' },
    { name: 'Wartung', value: 600, color: '#EF4444' }
  ];

  // Building benchmarks
  const buildingBenchmarks = [
    { subject: 'Energieeffizienz', rathaus: 85, durchschnitt: 70, fullMark: 100 },
    { subject: 'CO₂-Reduktion', rathaus: 78, durchschnitt: 65, fullMark: 100 },
    { subject: 'Kosteneinsparung', rathaus: 92, durchschnitt: 75, fullMark: 100 },
    { subject: 'Automatisierung', rathaus: 67, durchschnitt: 55, fullMark: 100 },
    { subject: 'Wartungsqualität', rathaus: 89, durchschnitt: 80, fullMark: 100 },
    { subject: 'Nutzerzufriedenheit', rathaus: 88, durchschnitt: 75, fullMark: 100 }
  ];

  // AI Insights
  const aiInsights = [
    {
      title: 'Optimierungspotential erkannt',
      description: 'HVAC-System kann durch Zeitsteuerung 12% Energie sparen',
      impact: 'Hoch',
      category: 'Energieeffizienz',
      confidence: 94
    },
    {
      title: 'Anomalie-Muster identifiziert',
      description: 'Ungewöhnlicher Stromverbrauch jeden Dienstag um 14:00',
      impact: 'Mittel',
      category: 'Betrieb',
      confidence: 87
    },
    {
      title: 'Kostensenkungsmöglichkeit',
      description: 'Lastverschiebung in Nachtstunden kann €280/Monat sparen',
      impact: 'Hoch',
      category: 'Kosten',
      confidence: 91
    }
  ];

  // Predictive analytics
  const predictiveData = [
    { month: 'Jan', predicted: 8500, actual: 8200 },
    { month: 'Feb', predicted: 7800, actual: 7600 },
    { month: 'Mar', predicted: 7200, actual: 7100 },
    { month: 'Apr', predicted: 6800, actual: null },
    { month: 'Mai', predicted: 6200, actual: null },
    { month: 'Jun', predicted: 5800, actual: null }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Analytics Deep Dive</h1>
          <p className="text-gray-600 mt-2">
            Künstliche Intelligenz für erweiterte Energieanalysen
          </p>
        </div>

        {/* AI Insights Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🤖 KI-Erkenntnisse</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiInsights.map((insight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.impact === 'Hoch' ? 'bg-red-100 text-red-800' :
                    insight.impact === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.impact}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{insight.category}</span>
                  <span className="text-xs font-medium text-blue-600">
                    {insight.confidence}% Konfidenz
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Consumption Patterns */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Verbrauchsmuster</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consumptionPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis label={{ value: 'kW', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="weekday" fill="#3B82F6" name="Werktag" />
                <Bar dataKey="weekend" fill="#10B981" name="Wochenende" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Kostenaufschlüsselung</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`€${value}`, 'Kosten']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Building Benchmarks */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Gebäude-Benchmark</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={buildingBenchmarks}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Rathaus"
                  dataKey="rathaus"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Durchschnitt"
                  dataKey="durchschnitt"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Predictive Analytics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Verbrauchsprognose</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictiveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Tatsächlich"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Prognose"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🎯 KI-Empfehlungen</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Sofortige Maßnahmen</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="text-red-500">🔥</div>
                  <div>
                    <p className="font-medium text-gray-900">Heizung optimieren</p>
                    <p className="text-sm text-gray-600">Reduzierung der Heiztemperatur um 1°C spart 6% Energie</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-500">💡</div>
                  <div>
                    <p className="font-medium text-gray-900">Beleuchtung anpassen</p>
                    <p className="text-sm text-gray-600">Automatische Dimmung kann €150/Monat sparen</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Langfristige Optimierungen</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-500">🔄</div>
                  <div>
                    <p className="font-medium text-gray-900">Lastmanagement</p>
                    <p className="text-sm text-gray-600">Intelligente Lastverteilung für 15% Kostensenkung</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-green-500">🌱</div>
                  <div>
                    <p className="font-medium text-gray-900">Speicher erweitern</p>
                    <p className="text-sm text-gray-600">Batteriekapazität erhöhen für bessere Eigennutzung</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyticsDashboard; 