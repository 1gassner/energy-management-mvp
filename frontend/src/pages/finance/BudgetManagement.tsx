/**
 * Budget & Cost Management System
 * Stadt Hechingen - CityPulse Energy Management  
 * Modern glassmorphism design with improved readability
 */

import React, { useState, useEffect } from 'react';
import { 
  Euro, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Calculator, 
  BarChart3, 
  Calendar,
  Building,
  Zap,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';

// Enhanced Glassmorphism Card Component
const ModernCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  variant?: 'primary' | 'secondary' | 'accent' 
}> = ({ children, className = '', variant = 'primary' }) => {
  const variants = {
    primary: 'glass-card-hechingen-primary border-blue-400/30',
    secondary: 'glass-card-medium border-white/20',
    accent: 'glass-card-light border-emerald-400/30'
  };
  
  return (
    <div className={`${variants[variant]} shadow-2xl backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
};

// Enhanced Metric Card Component with Modern Design
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: string;
  subtitle?: string;
}> = ({ title, value, unit, icon, trend, color = 'blue', subtitle }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-cyan-600/20 border-blue-400/30',
    green: 'from-emerald-500/20 to-green-600/20 border-emerald-400/30', 
    red: 'from-red-500/20 to-pink-600/20 border-red-400/30',
    yellow: 'from-yellow-500/20 to-orange-600/20 border-yellow-400/30',
    purple: 'from-purple-500/20 to-indigo-600/20 border-purple-400/30'
  };
  
  return (
    <ModernCard className="p-6 group hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-4 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} rounded-2xl border backdrop-blur-sm group-hover:scale-110 transition-all duration-300`}>
            <div className="text-white">{icon}</div>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-200/80 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {typeof value === 'number' ? value.toLocaleString('de-DE') : value}
              </p>
              {unit && <span className="text-lg font-medium text-blue-300/80">{unit}</span>}
            </div>
            {subtitle && <p className="text-xs text-blue-200/60 mt-1">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl backdrop-blur-sm border ${
            trend.isPositive 
              ? 'bg-green-500/20 text-green-300 border-green-400/30' 
              : 'bg-red-500/20 text-red-300 border-red-400/30'
          }`}>
            {trend.isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            <span className="text-sm font-bold">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </ModernCard>
  );
};

// Main Budget Management Component
const BudgetManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white font-medium">Lade Budget-Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-emerald-500/10 opacity-80" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Modern Header */}
          <div className="mb-12">
            <ModernCard className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full animate-pulse border-2 border-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-emerald-300 bg-clip-text text-transparent mb-2">
                      Budget & Kostenmanagement
                    </h1>
                    <p className="text-lg text-blue-200/80 font-medium">
                      CityPulse Hechingen • Intelligente Finanzsteuerung für 7 städtische Gebäude
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="glass-card-light p-4 rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-white font-bold">Live-System</span>
                    </div>
                    <div className="text-blue-200/70 text-sm">
                      Letztes Update: {new Date().toLocaleTimeString('de-DE')}
                    </div>
                  </div>
                  <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-xl border border-blue-400/30 font-bold text-sm">
                    7 Gebäude überwacht
                  </div>
                </div>
              </div>
            </ModernCard>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <MetricCard
              title="Gesamtbudget 2024"
              value="1.245.000"
              unit="€"
              icon={<Euro className="w-6 h-6" />}
              color="blue"
              subtitle="Alle Gebäude"
            />
            <MetricCard
              title="Ausgegeben"
              value="892.400"
              unit="€"
              icon={<TrendingDown className="w-6 h-6" />}
              color="red"
              trend={{ value: 71.7, isPositive: false }}
              subtitle="71.7% des Budgets"
            />
            <MetricCard
              title="Verbleibendes Budget"
              value="352.600"
              unit="€"
              icon={<TrendingUp className="w-6 h-6" />}
              color="green"
              subtitle="28.3% verfügbar"
            />
            <MetricCard
              title="Monatliche Einsparungen"
              value="18.750"
              unit="€"
              icon={<Target className="w-6 h-6" />}
              color="purple"
              trend={{ value: 12.5, isPositive: true }}
              subtitle="Durch Optimierungen"
            />
          </div>

          {/* Buildings Budget Status */}
          <ModernCard className="p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-emerald-500 rounded-full" />
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Budget-Status nach Gebäuden
                </h3>
                <p className="text-sm text-blue-200/70 mt-1">Übersicht aller städtischen Einrichtungen</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Hallenbad Hechingen', budget: 380000, used: 275000, efficiency: 92.3, status: 'good' },
                { name: 'Gymnasium Hechingen', budget: 220000, used: 168000, efficiency: 88.7, status: 'good' },
                { name: 'Rathaus Hechingen', budget: 150000, used: 142000, efficiency: 85.2, status: 'warning' },
                { name: 'Grundschule Hechingen', budget: 180000, used: 125000, efficiency: 91.4, status: 'good' },
                { name: 'Realschule Hechingen', budget: 95000, used: 67000, efficiency: 89.1, status: 'good' },
                { name: 'Werkrealschule Hechingen', budget: 140000, used: 78000, efficiency: 93.8, status: 'excellent' },
                { name: 'Sporthallen Hechingen', budget: 80000, used: 37400, efficiency: 95.1, status: 'excellent' }
              ].map((building, index) => (
                <div key={index} className="flex items-center justify-between p-4 glass-card-light rounded-2xl hover:scale-105 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
                      <Building className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{building.name}</h4>
                      <p className="text-sm text-blue-200/70">Effizienz: {building.efficiency}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-blue-200/70">Budget</p>
                      <p className="font-bold text-white">{building.budget.toLocaleString('de-DE')} €</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-200/70">Verbraucht</p>
                      <p className="font-bold text-white">{building.used.toLocaleString('de-DE')} €</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-200/70">Verbleibend</p>
                      <p className="font-bold text-emerald-400">{(building.budget - building.used).toLocaleString('de-DE')} €</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border font-bold text-sm ${
                      building.status === 'excellent' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                      building.status === 'good' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                      building.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' :
                      'bg-red-500/20 text-red-300 border-red-400/30'
                    }`}>
                      {building.status === 'excellent' ? '🌟 Exzellent' :
                       building.status === 'good' ? '✅ Gut' :
                       building.status === 'warning' ? '⚠️ Achtung' : '🚨 Kritisch'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>

          {/* Quick Actions */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernCard className="p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl border border-blue-400/30 group-hover:scale-110 transition-all duration-300">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Monatsberichte</h4>
                  <p className="text-sm text-blue-200/70">Detaillierte Analysen</p>
                </div>
              </div>
            </ModernCard>

            <ModernCard className="p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-2xl border border-emerald-400/30 group-hover:scale-110 transition-all duration-300">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Energiekosten</h4>
                  <p className="text-sm text-blue-200/70">Live-Tracking</p>
                </div>
              </div>
            </ModernCard>

            <ModernCard className="p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-2xl border border-purple-400/30 group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Prognosen</h4>
                  <p className="text-sm text-blue-200/70">KI-gestützt</p>
                </div>
              </div>
            </ModernCard>

            <ModernCard className="p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-2xl border border-yellow-400/30 group-hover:scale-110 transition-all duration-300">
                  <Activity className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Optimierungen</h4>
                  <p className="text-sm text-blue-200/70">Automatische Tipps</p>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManagement;