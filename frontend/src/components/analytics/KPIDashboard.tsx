import React, { useState } from 'react';
import { ModernCard } from '@/components/ui/ModernCard';
import { 
  TrendingUp, TrendingDown, Award, 
  Calendar, BarChart3, Zap, Euro, Leaf, 
  Activity, Users, Eye
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  RadialBarChart, RadialBar
} from 'recharts';
import type { 
  KPIMetrics
} from '@/types';

interface KPIDashboardProps {
  data: KPIMetrics;
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (timeRange: string) => void;
  compactView?: boolean;
}

const KPIDashboard: React.FC<KPIDashboardProps> = ({
  data,
  timeRange = 'month',
  onTimeRangeChange,
  compactView = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  const toggleDetails = (kpiId: string) => {
    setShowDetails(prev => ({ ...prev, [kpiId]: !prev[kpiId] }));
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const categories = [
    { id: 'all', label: 'Alle KPIs', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'energy', label: 'Energie', icon: <Zap className="w-4 h-4" /> },
    { id: 'financial', label: 'Finanzen', icon: <Euro className="w-4 h-4" /> },
    { id: 'operational', label: 'Betrieb', icon: <Activity className="w-4 h-4" /> },
    { id: 'sustainability', label: 'Nachhaltigkeit', icon: <Leaf className="w-4 h-4" /> },
    { id: 'user', label: 'Nutzer', icon: <Users className="w-4 h-4" /> }
  ];

  const renderEnergyKPIs = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <Zap className="w-5 h-5 text-blue-600" />
        <span>Energie-KPIs</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.energyKPIs.map((kpi, index) => (
          <ModernCard key={index} variant="glassmorphism" className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{kpi.name}</h4>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {kpi.currentValue.toLocaleString()} {kpi.unit}
                </p>
              </div>
              {getTrendIcon(kpi.trend)}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Ziel: {kpi.targetValue.toLocaleString()} {kpi.unit}</span>
                <span className={kpi.performance && getPerformanceColor(kpi.performance).split(' ')[0]}>
                  {Math.round((kpi.currentValue / kpi.targetValue) * 100)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    kpi.performance === 'excellent' ? 'bg-green-500' :
                    kpi.performance === 'good' ? 'bg-blue-500' :
                    kpi.performance === 'average' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (kpi.currentValue / kpi.targetValue) * 100)}%` 
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className={`flex items-center space-x-1 ${
                  kpi.trendPercentage > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.trendPercentage > 0 ? 
                    <TrendingUp className="w-3 h-3" /> : 
                    <TrendingDown className="w-3 h-3" />
                  }
                  <span>{Math.abs(kpi.trendPercentage).toFixed(1)}%</span>
                </span>
                <button
                  onClick={() => toggleDetails(`energy-${index}`)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Eye className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {showDetails[`energy-${index}`] && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Benchmark: {kpi.benchmark?.toLocaleString()} {kpi.unit}</div>
                  <div>Letztes Update: {new Date(kpi.lastUpdated).toLocaleDateString('de-DE')}</div>
                </div>
              </div>
            )}
          </ModernCard>
        ))}
      </div>
    </div>
  );

  const renderFinancialKPIs = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <Euro className="w-5 h-5 text-green-600" />
        <span>Finanz-KPIs</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.financialKPIs.map((kpi, index) => (
          <ModernCard key={index} variant="glassmorphism" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  €{kpi.currentValue.toLocaleString()}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                kpi.trend === 'improving' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {getTrendIcon(kpi.trend)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Ziel</span>
                <p className="font-medium">€{kpi.targetValue.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Budget-Abweichung</span>
                <p className={`font-medium ${
                  kpi.budgetVariance > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.budgetVariance > 0 ? '+' : ''}{kpi.budgetVariance.toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="text-gray-600">ROI</span>
                <p className="font-medium text-blue-600">{kpi.roi.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-gray-600">Amortisation</span>
                <p className="font-medium">{kpi.paybackPeriod.toFixed(1)} Jahre</p>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>
    </div>
  );

  const renderOperationalKPIs = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <Activity className="w-5 h-5 text-purple-600" />
        <span>Betriebs-KPIs</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.operationalKPIs.map((kpi, index) => (
          <ModernCard key={index} variant="glassmorphism" className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">{kpi.name}</h4>
            
            <div className="relative w-24 h-24 mx-auto mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  data={[{
                    value: (kpi.currentValue / kpi.targetValue) * 100,
                    fill: kpi.currentValue >= kpi.targetValue ? '#10B981' : '#F59E0B'
                  }]}
                  startAngle={90}
                  endAngle={-270}
                  innerRadius="70%"
                  outerRadius="100%"
                >
                  <RadialBar dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {kpi.currentValue.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">{kpi.unit}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Effizienz</span>
                <p className="font-medium">{kpi.efficiency.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-gray-600">Verfügbarkeit</span>
                <p className="font-medium">{kpi.availability.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-gray-600">Zuverlässigkeit</span>
                <p className="font-medium">{kpi.reliability.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-gray-600">Wartung</span>
                <p className="font-medium">{kpi.maintenanceScore.toFixed(1)}</p>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>
    </div>
  );

  const renderSustainabilityKPIs = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <Leaf className="w-5 h-5 text-emerald-600" />
        <span>Nachhaltigkeits-KPIs</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.sustainabilityKPIs.map((kpi, index) => (
          <ModernCard key={index} variant="glassmorphism" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {kpi.currentValue.toLocaleString()} {kpi.unit}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                kpi.certificationLevel === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                kpi.certificationLevel === 'Silber' ? 'bg-gray-100 text-gray-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {kpi.certificationLevel}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">CO₂-Reduktion</span>
                  <span className="font-medium text-emerald-600">
                    {kpi.co2Reduction.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, kpi.co2Reduction)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Erneuerbare Energie</span>
                  <span className="font-medium text-blue-600">
                    {kpi.renewablePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${kpi.renewablePercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Nachhaltigkeitsscore</span>
                <span className="font-medium">{kpi.sustainabilityScore.toFixed(1)}/100</span>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>
    </div>
  );

  const renderUserExperienceKPIs = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <Users className="w-5 h-5 text-indigo-600" />
        <span>Nutzererfahrungs-KPIs</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.userExperienceKPIs.map((kpi, index) => (
          <ModernCard key={index} variant="glassmorphism" className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">{kpi.name}</h4>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-indigo-600">
                {kpi.currentValue.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">{kpi.unit}</div>
              <div className="text-xs text-gray-500 mt-1">
                Ziel: {kpi.targetValue.toFixed(1)} {kpi.unit}
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Zufriedenheit</span>
                <span className="font-medium">{kpi.satisfactionScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Komfort</span>
                <span className="font-medium">{kpi.comfortLevel}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Beschwerden</span>
                <span className="font-medium">{kpi.complaintCount}/Monat</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reaktionszeit</span>
                <span className="font-medium">{kpi.responseTime}h</span>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>
    </div>
  );

  const renderOverallPerformance = () => (
    <ModernCard variant="glassmorphism" className="p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Gesamtperformance</h3>
            <p className="text-gray-600">Übergreifende KPI-Übersicht</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">
            {data.overallPerformance.overallScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">von 100 Punkten</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.overallPerformance.energyScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Energie</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.overallPerformance.financialScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Finanzen</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.overallPerformance.operationalScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Betrieb</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {data.overallPerformance.sustainabilityScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Nachhaltigkeit</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {data.overallPerformance.userExperienceScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Nutzer</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            #{data.overallPerformance.benchmarkPosition}
          </div>
          <div className="text-sm text-gray-600">Ranking</div>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>+{data.overallPerformance.improvementRate.toFixed(1)}% Verbesserung</span>
        </div>
        <div className="text-gray-600">
          Letztes Update: {new Date().toLocaleDateString('de-DE')}
        </div>
      </div>
    </ModernCard>
  );

  const renderKPITrends = () => (
    <ModernCard variant="glassmorphism" className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">KPI Trends (letzten 12 Monate)</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleDateString('de-DE', { month: 'short' }),
          energie: Math.round(85 + 5 * Math.sin((i * Math.PI) / 6) + Math.random() * 3),
          finanzen: Math.round(82 + 4 * Math.sin((i * Math.PI) / 6) + Math.random() * 3),
          betrieb: Math.round(88 + 3 * Math.sin((i * Math.PI) / 6) + Math.random() * 2),
          nachhaltigkeit: Math.round(75 + 8 * Math.sin((i * Math.PI) / 6) + Math.random() * 4),
          nutzer: Math.round(86 + 2 * Math.sin((i * Math.PI) / 6) + Math.random() * 3)
        }))}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[60, 100]} />
          <Tooltip 
            formatter={(value, name) => [
              `${value} Punkte`,
              name === 'energie' ? 'Energie' :
              name === 'finanzen' ? 'Finanzen' :
              name === 'betrieb' ? 'Betrieb' :
              name === 'nachhaltigkeit' ? 'Nachhaltigkeit' : 'Nutzer'
            ]}
          />
          <Line type="monotone" dataKey="energie" stroke="#3B82F6" strokeWidth={2} name="energie" />
          <Line type="monotone" dataKey="finanzen" stroke="#10B981" strokeWidth={2} name="finanzen" />
          <Line type="monotone" dataKey="betrieb" stroke="#8B5CF6" strokeWidth={2} name="betrieb" />
          <Line type="monotone" dataKey="nachhaltigkeit" stroke="#059669" strokeWidth={2} name="nachhaltigkeit" />
          <Line type="monotone" dataKey="nutzer" stroke="#6366F1" strokeWidth={2} name="nutzer" />
        </LineChart>
      </ResponsiveContainer>
    </ModernCard>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">KPI Dashboard</h2>
          <p className="text-gray-600">Kennzahlen-Übersicht für alle Bereiche</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select 
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              value={timeRange}
              onChange={(e) => onTimeRangeChange?.(e.target.value)}
            >
              <option value="day">Heute</option>
              <option value="week">Diese Woche</option>
              <option value="month">Dieser Monat</option>
              <option value="quarter">Quartal</option>
              <option value="year">Jahr</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {category.icon}
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Overall Performance (always visible) */}
      {renderOverallPerformance()}

      {/* KPI Categories */}
      <div className="space-y-8">
        {(selectedCategory === 'all' || selectedCategory === 'energy') && renderEnergyKPIs()}
        {(selectedCategory === 'all' || selectedCategory === 'financial') && renderFinancialKPIs()}
        {(selectedCategory === 'all' || selectedCategory === 'operational') && renderOperationalKPIs()}
        {(selectedCategory === 'all' || selectedCategory === 'sustainability') && renderSustainabilityKPIs()}
        {(selectedCategory === 'all' || selectedCategory === 'user') && renderUserExperienceKPIs()}
      </div>

      {/* KPI Trends Chart */}
      {!compactView && renderKPITrends()}
    </div>
  );
};

export default KPIDashboard;