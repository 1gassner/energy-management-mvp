import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, ComposedChart, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Zap, Euro, Leaf, AlertTriangle, 
  Brain, Target, Activity, Database, Filter, Download, RefreshCw,
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon,
  Radar as RadarIcon, Eye, Settings, Calendar, Building2
} from 'lucide-react';
import type { 
  AdvancedAnalyticsData, AnalyticsFilters, AIInsight, ConsumptionForecast,
  BuildingBenchmark, EnergyKPI, AnomalyData, CorrelationData
} from '@/types';

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: {
      start: '2024-01-01',
      end: '2024-12-31',
      preset: 'year'
    },
    buildings: [],
    metrics: ['consumption', 'efficiency', 'cost', 'co2'],
    granularity: 'month',
    comparison: {
      enabled: false,
      type: 'period',
      reference: 'previous_year'
    }
  });
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock Data - In real implementation, this would come from API
  const analyticsData: AdvancedAnalyticsData = useMemo(() => ({
    overview: {
      totalEnergyConsumed: 2450000,
      totalCostSavings: 180000,
      co2ReductionTotal: 1250,
      efficiencyImprovement: 18.5,
      buildingsOptimized: 7,
      activeInsights: 23,
      lastUpdated: new Date().toISOString(),
      dataQualityScore: 94.2,
      coveragePeriod: {
        start: '2024-01-01',
        end: '2024-12-31'
      }
    },
    energyAnalytics: {
      consumptionTrends: [
        { buildingId: '1', buildingName: 'Rathaus', period: '2024-01', consumption: 45000, trend: 'decreasing', trendPercentage: -8.2, comparison: { previousPeriod: 48900, yearOverYear: 47000, budget: 50000 }, factors: ['weather', 'optimization'], seasonalAdjusted: 44200 },
        { buildingId: '2', buildingName: 'Grundschule', period: '2024-01', consumption: 38000, trend: 'stable', trendPercentage: 1.2, comparison: { previousPeriod: 37500, yearOverYear: 39000, budget: 40000 }, factors: ['occupancy'], seasonalAdjusted: 37800 },
        { buildingId: '3', buildingName: 'Hallenbad', period: '2024-01', consumption: 125000, trend: 'decreasing', trendPercentage: -12.3, comparison: { previousPeriod: 142500, yearOverYear: 140000, budget: 130000 }, factors: ['efficiency_upgrade', 'weather'], seasonalAdjusted: 123000 }
      ],
      usagePatterns: [{
        patternType: 'hourly',
        data: Array.from({ length: 24 }, (_, i) => ({
          period: `${i.toString().padStart(2, '0')}:00`,
          consumption: Math.round(50 + 30 * Math.sin(((i - 6) * Math.PI) / 12) + Math.random() * 10),
          efficiency: Math.round(70 + 25 * Math.sin(((i - 8) * Math.PI) / 10) + Math.random() * 5),
          occupancyFactor: Math.round(10 + 80 * Math.sin(((i - 7) * Math.PI) / 11)),
          weatherFactor: Math.round(80 + 15 * Math.sin(((i - 12) * Math.PI) / 6))
        })),
        insights: ['Hauptverbrauchszeit zwischen 8-18 Uhr', 'Effizienz ist nachmittags am höchsten', 'Wettereinfluss verstärkt sich abends'],
        recommendations: ['Lastverschiebung in Nachtstunden', 'Automatische Dimmung nach 18 Uhr'],
        confidence: 92.5
      }],
      efficiencyMetrics: [],
      costAnalysis: {
        totalCosts: 850000,
        costPerKwh: 0.347,
        costTrends: [],
        costDrivers: [],
        savingsOpportunities: []
      },
      seasonalVariations: [],
      peakDemandAnalysis: {
        currentPeak: 285,
        predictedPeak: 295,
        peakTimes: ['08:30', '12:00', '17:30'],
        demandCharges: 4500,
        loadShiftingPotential: 15,
        strategies: []
      },
      baselineComparison: {
        baselineYear: 2023,
        currentYear: 2024,
        improvements: { consumption: -12.5, costs: -18.2, efficiency: 15.8, co2: -22.1 },
        buildingComparisons: []
      },
      weatherCorrelation: {
        correlationCoefficient: 0.78,
        weatherFactors: [],
        seasonalAdjustments: {},
        degreesDays: { heating: 2850, cooling: 450 }
      }
    },
    predictiveModels: {
      consumptionForecast: [
        { buildingId: '1', buildingName: 'Rathaus', forecastPeriod: '2024-04', predictedConsumption: 42000, confidence: 89.5, factors: { weather: 0.3, occupancy: 0.25, seasonal: 0.35, trend: 0.1 }, scenarios: { optimistic: 38000, realistic: 42000, pessimistic: 46000 } },
        { buildingId: '2', buildingName: 'Grundschule', forecastPeriod: '2024-04', predictedConsumption: 35000, confidence: 92.1, factors: { weather: 0.2, occupancy: 0.4, seasonal: 0.3, trend: 0.1 }, scenarios: { optimistic: 32000, realistic: 35000, pessimistic: 38000 } },
        { buildingId: '3', buildingName: 'Hallenbad', forecastPeriod: '2024-04', predictedConsumption: 118000, confidence: 87.3, factors: { weather: 0.4, occupancy: 0.2, seasonal: 0.3, trend: 0.1 }, scenarios: { optimistic: 112000, realistic: 118000, pessimistic: 125000 } }
      ],
      maintenancePredictions: [],
      costForecasts: [],
      demandPredictions: [],
      anomalyPredictions: [],
      optimizationPotentials: [],
      modelAccuracy: {
        consumptionModel: 91.2,
        costModel: 88.7,
        maintenanceModel: 85.4,
        overallAccuracy: 88.4,
        lastValidation: '2024-03-15',
        validationMetrics: { rmse: 2.3, mae: 1.8, r2: 0.89 }
      },
      confidenceIntervals: []
    },
    benchmarkData: {
      buildingComparisons: [
        { buildingId: '1', buildingName: 'Rathaus', kpiScores: { energyEfficiency: 89, costEfficiency: 92, sustainability: 85, automation: 78, maintenance: 91, userSatisfaction: 88 }, overallScore: 87.2, rank: 1, percentile: 95, topPerformer: true, improvementAreas: ['Automatisierung'] },
        { buildingId: '2', buildingName: 'Grundschule', kpiScores: { energyEfficiency: 82, costEfficiency: 85, sustainability: 79, automation: 65, maintenance: 88, userSatisfaction: 92 }, overallScore: 81.8, rank: 2, percentile: 85, topPerformer: false, improvementAreas: ['Automatisierung', 'Nachhaltigkeit'] },
        { buildingId: '3', buildingName: 'Hallenbad', kpiScores: { energyEfficiency: 75, costEfficiency: 78, sustainability: 88, automation: 72, maintenance: 85, userSatisfaction: 83 }, overallScore: 80.2, rank: 3, percentile: 75, topPerformer: false, improvementAreas: ['Energieeffizienz', 'Kosteneffizienz'] }
      ],
      industryBenchmarks: [],
      performanceRankings: [],
      bestPractices: [],
      gapAnalysis: [],
      improvementOpportunities: []
    },
    aiInsights: {
      insights: [
        { id: '1', type: 'optimization', title: 'HVAC-Optimierung identifiziert', description: 'Automatische Temperaturregelung kann 12% Energie sparen', confidence: 94.2, impact: 'high', category: 'Energieeffizienz', buildingId: '1', buildingName: 'Rathaus', evidence: ['Historische Verbrauchsdaten', 'Wetterkorrelation', 'Nutzungsmuster'], generatedAt: '2024-03-20T10:30:00Z', status: 'new', potentialSavings: { energy: 5400, cost: 1870, co2: 2.8 } },
        { id: '2', type: 'anomaly', title: 'Anomalie im Verbrauchsmuster', description: 'Ungewöhnlicher Stromverbrauch jeden Dienstag um 14:00 Uhr', confidence: 87.5, impact: 'medium', category: 'Betrieb', buildingId: '2', buildingName: 'Grundschule', evidence: ['Verbrauchsmuster', 'Zeitreihenanalyse'], generatedAt: '2024-03-19T15:45:00Z', status: 'new' },
        { id: '3', type: 'cost', title: 'Lastverschiebungspotential', description: 'Verschiebung von Lasten in Nachtstunden kann €280/Monat sparen', confidence: 91.8, impact: 'high', category: 'Kosten', evidence: ['Tarifanalyse', 'Lastprofil'], generatedAt: '2024-03-18T09:15:00Z', status: 'reviewed', potentialSavings: { energy: 0, cost: 3360, co2: 0 } }
      ],
      recommendations: [],
      patterns: [],
      alerts: [],
      automationSuggestions: [],
      learningProgress: {
        modelVersion: 'v2.1.0',
        trainingDataSize: 2450000,
        accuracyMetrics: { consumption: 91.2, cost: 88.7, efficiency: 89.5, maintenance: 85.4 },
        improvementRate: 2.3,
        lastTraining: '2024-03-15T00:00:00Z',
        nextTraining: '2024-04-15T00:00:00Z',
        dataQuality: 94.2,
        biasMetrics: {}
      }
    },
    kpiMetrics: {
      energyKPIs: [
        { name: 'Gesamtverbrauch', currentValue: 2450000, targetValue: 2200000, unit: 'kWh', trend: 'improving', trendPercentage: -8.5, benchmark: 2600000, performance: 'good', lastUpdated: '2024-03-20T12:00:00Z' },
        { name: 'Energieeffizienz', currentValue: 87.3, targetValue: 90, unit: '%', trend: 'improving', trendPercentage: 5.2, benchmark: 82, performance: 'good', lastUpdated: '2024-03-20T12:00:00Z' },
        { name: 'Erneuerbarer Anteil', currentValue: 42.8, targetValue: 50, unit: '%', trend: 'improving', trendPercentage: 12.5, benchmark: 35, performance: 'excellent', lastUpdated: '2024-03-20T12:00:00Z' }
      ],
      financialKPIs: [],
      operationalKPIs: [],
      sustainabilityKPIs: [],
      userExperienceKPIs: [],
      overallPerformance: {
        overallScore: 87.2,
        energyScore: 89.1,
        financialScore: 85.8,
        operationalScore: 88.7,
        sustainabilityScore: 84.2,
        userExperienceScore: 89.5,
        improvementRate: 6.2,
        benchmarkPosition: 15
      }
    },
    timeSeriesData: {
      consumptionTimeSeries: [],
      efficiencyTimeSeries: [],
      costTimeSeries: [],
      co2TimeSeries: [],
      correlation: { variables: [], correlations: [], significantCorrelations: [] },
      seasonality: { seasonalStrength: 0, seasonalPeriod: 0, decomposition: { trend: [], seasonal: [], residual: [] }, seasonalAdjusted: [] },
      cyclicalPatterns: [],
      volatility: { variance: 0, standardDeviation: 0, coefficientOfVariation: 0, volatilityIndex: 0, stabilityScore: 0 }
    },
    anomalies: [],
    correlations: [],
    forecasts: []
  }), []);

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'consumption', label: 'Verbrauchsanalyse', icon: <Activity className="w-4 h-4" /> },
    { id: 'predictive', label: 'Prognosen', icon: <Brain className="w-4 h-4" /> },
    { id: 'benchmark', label: 'Benchmarks', icon: <Target className="w-4 h-4" /> },
    { id: 'insights', label: 'KI-Insights', icon: <Eye className="w-4 h-4" /> }
  ];

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // In real implementation, trigger data refresh
      console.log('Auto-refreshing analytics data...');
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting analytics data as ${format}...`);
    // Implementation for export functionality
  };

  const handleFilterChange = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Mobile-First KPI Cards */}
      <div className={cn(
        "grid gap-4 sm:gap-6",
        isMobile 
          ? "grid-cols-2" // 2 columns on mobile for better readability
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      )}>
        <div className={cn(
          "kpi-glass-card group",
          isMobile && "p-4"
        )}>
          <div className={cn(
            "flex items-center",
            isMobile ? "flex-col text-center space-y-2" : "justify-between"
          )}>
            <div className={cn(
              isMobile ? "" : "flex-1"
            )}>
              <div className={cn(
                "flex items-center gap-2 mb-2",
                isMobile && "justify-center"
              )}>
                <Zap className={cn(
                  "text-blue-400",
                  isMobile ? "w-4 h-4" : "w-5 h-5"
                )} />
                <p className={cn(
                  "font-medium text-blue-200/80",
                  isMobile ? "text-xs" : "text-sm"
                )}>Gesamtverbrauch</p>
              </div>
              <p className={cn(
                "font-bold text-white mb-2",
                isMobile ? "text-xl" : "text-3xl"
              )}>2.45M</p>
              <p className={cn(
                "text-blue-200/60",
                isMobile ? "text-sm" : "text-lg"
              )}>kWh</p>
              <div className={cn(
                "flex items-center mt-3 text-green-400",
                isMobile && "justify-center"
              )}>
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className={cn(
                  "font-medium",
                  isMobile ? "text-xs" : "text-sm"
                )}>-8.5% vs. Vorjahr</span>
              </div>
            </div>
            {!isMobile && (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          "kpi-glass-card group",
          isMobile && "p-4"
        )}>
          <div className={cn(
            "flex items-center",
            isMobile ? "flex-col text-center space-y-2" : "justify-between"
          )}>
            <div className={cn(
              isMobile ? "" : "flex-1"
            )}>
              <div className={cn(
                "flex items-center gap-2 mb-2",
                isMobile && "justify-center"
              )}>
                <Euro className={cn(
                  "text-green-400",
                  isMobile ? "w-4 h-4" : "w-5 h-5"
                )} />
                <p className={cn(
                  "font-medium text-blue-200/80",
                  isMobile ? "text-xs" : "text-sm"
                )}>Kosteneinsparungen</p>
              </div>
              <p className={cn(
                "font-bold text-white mb-2",
                isMobile ? "text-xl" : "text-3xl"
              )}>€180K</p>
              <p className={cn(
                "text-blue-200/60",
                isMobile ? "text-sm" : "text-lg"
              )}>gespart</p>
              <div className={cn(
                "flex items-center mt-3 text-green-400",
                isMobile && "justify-center"
              )}>
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className={cn(
                  "font-medium",
                  isMobile ? "text-xs" : "text-sm"
                )}>+22% vs. Vorjahr</span>
              </div>
            </div>
            {!isMobile && (
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Euro className="w-8 h-8 text-green-400" />
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          "kpi-glass-card group",
          isMobile && "p-4"
        )}>
          <div className={cn(
            "flex items-center",
            isMobile ? "flex-col text-center space-y-2" : "justify-between"
          )}>
            <div className={cn(
              isMobile ? "" : "flex-1"
            )}>
              <div className={cn(
                "flex items-center gap-2 mb-2",
                isMobile && "justify-center"
              )}>
                <Leaf className={cn(
                  "text-emerald-400",
                  isMobile ? "w-4 h-4" : "w-5 h-5"
                )} />
                <p className={cn(
                  "font-medium text-blue-200/80",
                  isMobile ? "text-xs" : "text-sm"
                )}>CO₂-Reduktion</p>
              </div>
              <p className={cn(
                "font-bold text-white mb-2",
                isMobile ? "text-xl" : "text-3xl"
              )}>1.25T</p>
              <p className={cn(
                "text-blue-200/60",
                isMobile ? "text-sm" : "text-lg"
              )}>weniger</p>
              <div className={cn(
                "flex items-center mt-3 text-emerald-400",
                isMobile && "justify-center"
              )}>
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className={cn(
                  "font-medium",
                  isMobile ? "text-xs" : "text-sm"
                )}>-22% Emissionen</span>
              </div>
            </div>
            {!isMobile && (
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Leaf className="w-8 h-8 text-emerald-400" />
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          "kpi-glass-card group",
          isMobile && "p-4"
        )}>
          <div className={cn(
            "flex items-center",
            isMobile ? "flex-col text-center space-y-2" : "justify-between"
          )}>
            <div className={cn(
              isMobile ? "" : "flex-1"
            )}>
              <div className={cn(
                "flex items-center gap-2 mb-2",
                isMobile && "justify-center"
              )}>
                <Brain className={cn(
                  "text-purple-400",
                  isMobile ? "w-4 h-4" : "w-5 h-5"
                )} />
                <p className={cn(
                  "font-medium text-blue-200/80",
                  isMobile ? "text-xs" : "text-sm"
                )}>KI-Insights</p>
              </div>
              <p className={cn(
                "font-bold text-white mb-2",
                isMobile ? "text-xl" : "text-3xl"
              )}>{analyticsData.overview.activeInsights}</p>
              <p className={cn(
                "text-blue-200/60",
                isMobile ? "text-sm" : "text-lg"
              )}>aktiv</p>
              <div className={cn(
                "flex items-center mt-3 text-purple-400",
                isMobile && "justify-center"
              )}>
                <Brain className="w-4 h-4 mr-1" />
                <span className={cn(
                  "font-medium",
                  isMobile ? "text-xs" : "text-sm"
                )}>KI-generiert</span>
              </div>
            </div>
            {!isMobile && (
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-8 h-8 text-purple-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-First Performance Overview */}
      <div className={cn(
        "grid gap-4 sm:gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      )}>
        <div className="chart-glass-container">
          <div className={cn(
            "flex items-center gap-3 mb-6",
            isMobile && "mb-4"
          )}>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
            <h3 className={cn(
              "font-bold text-white",
              isMobile ? "text-lg" : "text-xl"
            )}>Performance-Übersicht</h3>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 320}>
              <RadarChart data={[
                { subject: 'Energie', current: analyticsData.kpiMetrics.overallPerformance.energyScore, target: 95 },
                { subject: 'Finanzen', current: analyticsData.kpiMetrics.overallPerformance.financialScore, target: 95 },
                { subject: 'Betrieb', current: analyticsData.kpiMetrics.overallPerformance.operationalScore, target: 95 },
                { subject: 'Nachhaltigkeit', current: analyticsData.kpiMetrics.overallPerformance.sustainabilityScore, target: 95 },
                { subject: 'Nutzererfahrung', current: analyticsData.kpiMetrics.overallPerformance.userExperienceScore, target: 95 }
              ]}>
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#E2E8F0', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Radar name="Aktuell" dataKey="current" stroke="#3B82F6" fill="url(#radarGradient)" strokeWidth={3} />
                <Radar name="Ziel" dataKey="target" stroke="#10B981" fill="none" strokeWidth={2} strokeDasharray="8 4" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#E2E8F0'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-glass-container">
          <div className={cn(
            "flex items-center justify-between mb-6",
            isMobile && "mb-4 flex-col space-y-2"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full" />
              <h3 className={cn(
                "font-bold text-white",
                isMobile ? "text-lg" : "text-xl"
              )}>Verbrauchstrends</h3>
            </div>
            <div className={cn(
              "text-blue-200/60",
              isMobile ? "text-xs" : "text-sm"
            )}>Letzten 12 Monate</div>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 320}>
              <LineChart data={Array.from({ length: 12 }, (_, i) => ({
                month: new Date(2024, i, 1).toLocaleDateString('de-DE', { month: 'short' }),
                verbrauch: Math.round(200000 + 50000 * Math.sin((i * Math.PI) / 6) + (Math.random() - 0.5) * 20000),
                prognose: Math.round(195000 + 48000 * Math.sin((i * Math.PI) / 6) + (Math.random() - 0.5) * 15000),
                ziel: 180000
              }))}>
                <defs>
                  <linearGradient id="lineGradient1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#E2E8F0'
                  }}
                  formatter={(value, name) => [
                    `${Number(value).toLocaleString()} kWh`,
                    name === 'verbrauch' ? 'Tatsächlich' : name === 'prognose' ? 'Prognose' : 'Ziel'
                  ]} 
                />
                <Area type="monotone" dataKey="verbrauch" stroke="none" fill="url(#areaGradient)" />
                <Line type="monotone" dataKey="verbrauch" stroke="url(#lineGradient1)" strokeWidth={4} name="verbrauch" dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }} />
                <Line type="monotone" dataKey="prognose" stroke="#F59E0B" strokeWidth={3} strokeDasharray="8 4" name="prognose" dot={{ fill: '#F59E0B', r: 4 }} />
                <Line type="monotone" dataKey="ziel" stroke="#10B981" strokeWidth={2} strokeDasharray="12 6" name="ziel" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConsumptionTab = () => (
    <div className="space-y-6">
      {/* Modern Usage Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-glass-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
            <h3 className="text-xl font-bold text-white">Tagesverbrauchsmuster</h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={analyticsData.energyAnalytics.usagePatterns[0]?.data || []}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="period" axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis yAxisId="left" orientation="left" axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#E2E8F0'
                }}
              />
              <Bar yAxisId="left" dataKey="consumption" fill="url(#barGradient)" name="Verbrauch (kW)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={3} name="Effizienz (%)" dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-glass-container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
            <h3 className="text-xl font-bold text-white">Gebäudevergleich</h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={analyticsData.energyAnalytics.consumptionTrends}>
              <defs>
                <linearGradient id="buildingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="buildingName" axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
              <YAxis axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#E2E8F0'
                }}
                formatter={(value) => [`${Number(value).toLocaleString()} kWh`, 'Verbrauch']} 
              />
              <Bar dataKey="consumption" fill="url(#buildingGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modern Energy Efficiency KPIs */}
      <div className="chart-glass-container">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
          <h3 className="text-xl font-bold text-white">Energieeffizienz-KPIs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {analyticsData.kpiMetrics.energyKPIs.map((kpi, index) => (
            <div key={index} className="kpi-glass-card text-center group">
              <div className="relative w-28 h-28 mx-auto mb-6">
                <svg className="w-28 h-28 transform -rotate-90">
                  <defs>
                    <linearGradient id={`kpiGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke={`url(#kpiGradient${index})`}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(kpi.currentValue / kpi.targetValue) * 301.6} 301.6`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {Math.round((kpi.currentValue / kpi.targetValue) * 100)}%
                  </span>
                </div>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{kpi.name}</h4>
              <p className="text-blue-200/80 mb-3">
                {kpi.currentValue.toLocaleString()} {kpi.unit}
              </p>
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                kpi.trend === 'improving' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <span>{kpi.trend === 'improving' ? '↗' : '↘'}</span>
                <span>{Math.abs(kpi.trendPercentage)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPredictiveTab = () => (
    <div className="space-y-6">
      {/* Consumption Forecasts */}
      <ModernCard variant="glassmorphism" className="p-6">
        <h3 className="text-lg font-semibold mb-4">Verbrauchsprognosen</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Array.from({ length: 12 }, (_, i) => {
                const forecast = analyticsData.predictiveModels.consumptionForecast.find(f => f.buildingId === '1');
                return {
                  month: new Date(2024, i, 1).toLocaleDateString('de-DE', { month: 'short' }),
                  predicted: Math.round(42000 + 8000 * Math.sin((i * Math.PI) / 6) + (Math.random() - 0.5) * 3000),
                  upperBound: Math.round(46000 + 8000 * Math.sin((i * Math.PI) / 6) + (Math.random() - 0.5) * 3000),
                  lowerBound: Math.round(38000 + 8000 * Math.sin((i * Math.PI) / 6) + (Math.random() - 0.5) * 3000),
                  actual: i < 8 ? Math.round(41000 + 7500 * Math.sin((i * Math.PI) / 6) + (Math.random() - 0.5) * 2000) : null
                };
              })}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="upperBound" stackId="1" stroke="none" fill="#3B82F6" fillOpacity={0.1} />
                <Area type="monotone" dataKey="lowerBound" stackId="1" stroke="none" fill="#FFFFFF" />
                <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" name="Prognose" />
                <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} name="Tatsächlich" connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Modellgenauigkeit</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verbrauchsmodell</span>
                <span className="font-medium">{analyticsData.predictiveModels.modelAccuracy.consumptionModel}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Kostenmodell</span>
                <span className="font-medium">{analyticsData.predictiveModels.modelAccuracy.costModel}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Wartungsmodell</span>
                <span className="font-medium">{analyticsData.predictiveModels.modelAccuracy.maintenanceModel}%</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Prognoseszenarien (nächster Monat)</h4>
              {analyticsData.predictiveModels.consumptionForecast.slice(0, 3).map((forecast, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm">{forecast.buildingName}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Optimistisch: {forecast.scenarios.optimistic.toLocaleString()} kWh
                  </div>
                  <div className="text-xs text-gray-600">
                    Realistisch: {forecast.scenarios.realistic.toLocaleString()} kWh
                  </div>
                  <div className="text-xs text-gray-600">
                    Pessimistisch: {forecast.scenarios.pessimistic.toLocaleString()} kWh
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Konfidenz: {forecast.confidence}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModernCard>

      {/* Predictive Alerts */}
      <ModernCard variant="glassmorphism" className="p-6">
        <h3 className="text-lg font-semibold mb-4">Prädiktive Warnungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Wartung erforderlich</h4>
                <p className="text-sm text-orange-700 mt-1">
                  HVAC-System im Hallenbad benötigt voraussichtlich in 3 Wochen Wartung
                </p>
                <p className="text-xs text-orange-600 mt-2">Wahrscheinlichkeit: 78%</p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Spitzenlast erwartet</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Erhöhter Verbrauch für nächste Woche prognostiziert (+15%)
                </p>
                <p className="text-xs text-blue-600 mt-2">Konfidenz: 89%</p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Leaf className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Optimierungschance</h4>
                <p className="text-sm text-green-700 mt-1">
                  Günstige Wetterlage ermöglicht 8% Energieeinsparung
                </p>
                <p className="text-xs text-green-600 mt-2">Potentielle Einsparung: €450</p>
              </div>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );

  const renderBenchmarkTab = () => (
    <div className="space-y-6">
      {/* Building Comparison Radar */}
      <ModernCard variant="glassmorphism" className="p-6">
        <h3 className="text-lg font-semibold mb-4">Gebäude-Performance-Vergleich</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={[
              { subject: 'Energieeffizienz', rathaus: 89, grundschule: 82, hallenbad: 75, durchschnitt: 82 },
              { subject: 'Kosteneffizienz', rathaus: 92, grundschule: 85, hallenbad: 78, durchschnitt: 85 },
              { subject: 'Nachhaltigkeit', rathaus: 85, grundschule: 79, hallenbad: 88, durchschnitt: 84 },
              { subject: 'Automatisierung', rathaus: 78, grundschule: 65, hallenbad: 72, durchschnitt: 72 },
              { subject: 'Wartung', rathaus: 91, grundschule: 88, hallenbad: 85, durchschnitt: 88 },
              { subject: 'Nutzerzufriedenheit', rathaus: 88, grundschule: 92, hallenbad: 83, durchschnitt: 88 }
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Rathaus" dataKey="rathaus" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Grundschule" dataKey="grundschule" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Hallenbad" dataKey="hallenbad" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Durchschnitt" dataKey="durchschnitt" stroke="#6B7280" fill="none" strokeWidth={1} strokeDasharray="3 3" />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            <h4 className="font-medium">Performance-Rankings</h4>
            {analyticsData.benchmarkData.buildingComparisons.map((building, index) => (
              <div key={building.buildingId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    building.rank === 1 ? 'bg-yellow-500' : building.rank === 2 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {building.rank}
                  </div>
                  <div>
                    <div className="font-medium">{building.buildingName}</div>
                    <div className="text-sm text-gray-600">
                      {building.overallScore}/100 Punkte
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{building.percentile}. Perzentil</div>
                  {building.topPerformer && (
                    <div className="text-xs text-green-600">Top-Performer</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModernCard>

      {/* Performance Matrix */}
      <ModernCard variant="glassmorphism" className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance-Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Gebäude</th>
                <th className="text-center py-2">Energieeffizienz</th>
                <th className="text-center py-2">Kosteneffizienz</th>
                <th className="text-center py-2">Nachhaltigkeit</th>
                <th className="text-center py-2">Automatisierung</th>
                <th className="text-center py-2">Wartung</th>
                <th className="text-center py-2">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.benchmarkData.buildingComparisons.map((building) => (
                <tr key={building.buildingId} className="border-b">
                  <td className="py-3 font-medium">{building.buildingName}</td>
                  <td className="text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      building.kpiScores.energyEfficiency >= 85 ? 'bg-green-100 text-green-800' :
                      building.kpiScores.energyEfficiency >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {building.kpiScores.energyEfficiency}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      building.kpiScores.costEfficiency >= 85 ? 'bg-green-100 text-green-800' :
                      building.kpiScores.costEfficiency >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {building.kpiScores.costEfficiency}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      building.kpiScores.sustainability >= 85 ? 'bg-green-100 text-green-800' :
                      building.kpiScores.sustainability >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {building.kpiScores.sustainability}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      building.kpiScores.automation >= 85 ? 'bg-green-100 text-green-800' :
                      building.kpiScores.automation >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {building.kpiScores.automation}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      building.kpiScores.maintenance >= 85 ? 'bg-green-100 text-green-800' :
                      building.kpiScores.maintenance >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {building.kpiScores.maintenance}
                    </div>
                  </td>
                  <td className="text-center font-medium">{building.overallScore.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModernCard>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Modern AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsData.aiInsights.insights.map((insight) => (
          <div key={insight.id} className="kpi-glass-card group hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl backdrop-blur-sm ${
                insight.type === 'optimization' ? 'bg-blue-500/20 border border-blue-400/30' :
                insight.type === 'anomaly' ? 'bg-red-500/20 border border-red-400/30' :
                insight.type === 'cost' ? 'bg-green-500/20 border border-green-400/30' :
                'bg-purple-500/20 border border-purple-400/30'
              }`}>
                {insight.type === 'optimization' && <Target className="w-6 h-6 text-blue-400" />}
                {insight.type === 'anomaly' && <AlertTriangle className="w-6 h-6 text-red-400" />}
                {insight.type === 'cost' && <Euro className="w-6 h-6 text-green-400" />}
                {insight.type === 'prediction' && <Brain className="w-6 h-6 text-purple-400" />}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                insight.impact === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                insight.impact === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' :
                insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                'bg-green-500/20 text-green-300 border border-green-400/30'
              }`}>
                {insight.impact === 'critical' ? 'KRITISCH' :
                 insight.impact === 'high' ? 'HOCH' :
                 insight.impact === 'medium' ? 'MITTEL' : 'NIEDRIG'}
              </span>
            </div>
            
            <h4 className="text-lg font-bold text-white mb-3 leading-tight">{insight.title}</h4>
            <p className="text-blue-200/80 text-sm mb-5 leading-relaxed">{insight.description}</p>
            
            {insight.buildingName && (
              <div className="flex items-center mb-4 px-3 py-2 bg-white/5 rounded-lg backdrop-blur-sm">
                <Building2 className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-sm text-blue-200 font-medium">{insight.buildingName}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-xs mb-4">
              <span className="text-blue-300 font-medium">{insight.category}</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-bold">{insight.confidence}% Sicher</span>
              </div>
            </div>
            
            {insight.potentialSavings && (
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-4 mb-5 border border-white/10">
                <div className="text-xs text-green-400 font-bold mb-3">EINSPARPOTENTIAL:</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white font-medium">{insight.potentialSavings.energy.toLocaleString()}</span>
                    <span className="text-blue-300">kWh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white font-medium">€{insight.potentialSavings.cost.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-white font-medium">{insight.potentialSavings.co2} t</span>
                    <span className="text-emerald-300">CO₂ weniger</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 font-medium text-sm shadow-lg">
                Implementieren
              </button>
              <button className="px-4 py-3 bg-white/10 text-blue-200 rounded-xl hover:bg-white/20 transition-all font-medium text-sm backdrop-blur-sm border border-white/20">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Learning Progress */}
      <ModernCard variant="glassmorphism" className="p-6">
        <h3 className="text-lg font-semibold mb-4">KI-Lernfortschritt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData.aiInsights.learningProgress.accuracyMetrics.consumption}%
            </div>
            <div className="text-sm text-gray-600">Verbrauchsmodell</div>
            <div className="text-xs text-green-600 mt-1">
              +{analyticsData.aiInsights.learningProgress.improvementRate}% Verbesserung
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analyticsData.aiInsights.learningProgress.accuracyMetrics.cost}%
            </div>
            <div className="text-sm text-gray-600">Kostenmodell</div>
            <div className="text-xs text-green-600 mt-1">
              +{analyticsData.aiInsights.learningProgress.improvementRate}% Verbesserung
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analyticsData.aiInsights.learningProgress.accuracyMetrics.efficiency}%
            </div>
            <div className="text-sm text-gray-600">Effizienzmodell</div>
            <div className="text-xs text-green-600 mt-1">
              +{analyticsData.aiInsights.learningProgress.improvementRate}% Verbesserung
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analyticsData.aiInsights.learningProgress.dataQuality}%
            </div>
            <div className="text-sm text-gray-600">Datenqualität</div>
            <div className="text-xs text-blue-600 mt-1">
              Modell v{analyticsData.aiInsights.learningProgress.modelVersion}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Trainingsdaten</span>
          </div>
          <div className="text-sm text-blue-800">
            {analyticsData.aiInsights.learningProgress.trainingDataSize.toLocaleString()} Datenpunkte analysiert
          </div>
          <div className="text-xs text-blue-700 mt-1">
            Letztes Training: {new Date(analyticsData.aiInsights.learningProgress.lastTraining).toLocaleDateString('de-DE')}
          </div>
          <div className="text-xs text-blue-700">
            Nächstes Training: {new Date(analyticsData.aiInsights.learningProgress.nextTraining).toLocaleDateString('de-DE')}
          </div>
        </div>
      </ModernCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'consumption':
        return renderConsumptionTab();
      case 'predictive':
        return renderPredictiveTab();
      case 'benchmark':
        return renderBenchmarkTab();
      case 'insights':
        return renderInsightsTab();
      default:
        return renderOverviewTab();
    }
  };

  // Add mobile responsiveness state
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  // Mobile detection and touch handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch gesture handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;
    
    // Horizontal swipe detection for tab switching
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (deltaX > 0 && currentIndex < tabs.length - 1) {
        // Swipe left - next tab
        setActiveTab(tabs[currentIndex + 1].id);
      } else if (deltaX < 0 && currentIndex > 0) {
        // Swipe right - previous tab
        setActiveTab(tabs[currentIndex - 1].id);
      }
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Modern Background - Mobile Optimized */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        {/* Mobile performance optimization */}
        <div className="md:hidden absolute inset-0 bg-slate-900/90" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Mobile-First Glass Header */}
        <div className={cn(
          "analytics-glass-card mb-4 sm:mb-8",
          isMobile ? "p-4" : "p-6 sm:p-8"
        )}>
          <div className={cn(
            "flex items-center justify-between",
            isMobile && "flex-col space-y-4"
          )}>
            <div className={isMobile ? "text-center" : ""}>
              <h1 className={cn(
                "font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2",
                isMobile ? "text-2xl" : "text-3xl sm:text-4xl"
              )}>
                {isMobile ? "Analytics" : "Advanced Analytics Dashboard"}
              </h1>
              <p className={cn(
                "text-blue-100/80",
                isMobile ? "text-sm" : "text-base sm:text-lg"
              )}>
                {isMobile 
                  ? "KI-gestützte Energieanalysen" 
                  : "Umfassende Energieanalysen mit KI-gestützten Insights für Hechingen"
                }
              </p>
              <div className={cn(
                "flex items-center gap-4 mt-4",
                isMobile && "justify-center"
              )}>
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm">Live Data</span>
                </div>
                <div className="text-blue-200/60 text-sm">
                  {analyticsData.overview.buildingsOptimized}/7 Gebäude optimiert
                </div>
              </div>
            </div>
            <div className={cn(
              "flex items-center space-x-2 sm:space-x-4",
              isMobile && "w-full justify-center flex-wrap gap-2"
            )}>
              <div className={cn(
                "kpi-glass-card",
                isMobile && "w-auto min-w-0"
              )}>
                <Calendar className="w-4 h-4 text-blue-300 mb-2" />
                <select 
                  className={cn(
                    "bg-transparent text-white border border-white/20 rounded-lg focus:border-blue-400 focus:outline-none",
                    isMobile ? "text-xs px-2 py-1" : "text-sm px-3 py-2"
                  )}
                  value={filters.timeRange.preset}
                  onChange={(e) => handleFilterChange({
                    timeRange: { ...filters.timeRange, preset: e.target.value as any }
                  })}
                >
                  <option value="today">{isMobile ? "Heute" : "Heute"}</option>
                  <option value="week">{isMobile ? "Woche" : "Diese Woche"}</option>
                  <option value="month">{isMobile ? "Monat" : "Dieser Monat"}</option>
                  <option value="quarter">Quartal</option>
                  <option value="year">Jahr</option>
                  <option value="custom">{isMobile ? "Custom" : "Benutzerdefiniert"}</option>
                </select>
              </div>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "kpi-glass-card transition-all touch-target",
                  isMobile ? "p-2" : "p-3",
                  autoRefresh ? 'text-green-400 bg-green-400/10' : 'text-blue-300 hover:text-white'
                )}
                title={autoRefresh ? 'Auto-Refresh aktiv' : 'Auto-Refresh deaktiviert'}
                style={{ minWidth: '44px', minHeight: '44px' }} // Ensure touch target size
              >
                <RefreshCw className={cn(
                  autoRefresh ? 'animate-spin' : '',
                  isMobile ? "w-4 h-4" : "w-5 h-5"
                )} />
              </button>
              
              {!isMobile && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="kpi-glass-card p-3 text-blue-300 hover:text-white hover:bg-blue-500/20 transition-all touch-target"
                    title="Als PDF exportieren"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="kpi-glass-card p-3 text-green-300 hover:text-white hover:bg-green-500/20 transition-all touch-target"
                    title="Als Excel exportieren"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {/* Mobile Export Menu */}
              {isMobile && (
                <button
                  onClick={() => {
                    const menu = document.getElementById('mobile-export-menu');
                    menu?.classList.toggle('hidden');
                  }}
                  className="kpi-glass-card p-2 text-blue-300 hover:text-white transition-all touch-target"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-First Glass Tabs */}
        <div className="mb-4 sm:mb-8">
          <div className="kpi-glass-card p-1 sm:p-2">
            {isMobile ? (
              /* Mobile Scrollable Tabs */
              <div className="relative">
                <nav className="flex space-x-1 overflow-x-auto scrollbar-hide pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-shrink-0 px-4 py-3 rounded-xl font-medium text-xs transition-all duration-300 touch-target",
                        "flex items-center space-x-2 min-w-max",
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'text-blue-200 hover:text-white hover:bg-white/10'
                      )}
                      style={{ minHeight: '44px' }}
                    >
                      {tab.icon}
                      <span className="text-xs">{tab.label}</span>
                    </button>
                  ))}
                </nav>
                {/* Swipe Indicator */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full" />
              </div>
            ) : (
              /* Desktop Tabs */
              <nav className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 touch-target",
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-blue-200 hover:text-white hover:bg-white/10'
                    )}
                    style={{ minHeight: '44px' }}
                  >
                    <div className="flex items-center space-x-2">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          renderTabContent()
        )}

        {/* Modern Data Quality Footer */}
        <div className="analytics-glass-card mt-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-30"></div>
                </div>
                <span className="text-white font-medium">Live-Daten aktiv</span>
              </div>
              <div className="text-blue-200/80">
                Datenqualität: <span className="text-green-400 font-bold">{analyticsData.overview.dataQualityScore}%</span>
              </div>
              <div className="text-blue-200/80">
                Letzte Aktualisierung: <span className="text-white">{new Date(analyticsData.overview.lastUpdated).toLocaleTimeString('de-DE')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-blue-200/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Abdeckung: <span className="text-white font-medium">{analyticsData.overview.buildingsOptimized}/7</span> Gebäude</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span><span className="text-white font-medium">{analyticsData.overview.activeInsights}</span> aktive Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;