// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user' | 'buergermeister' | 'gebaeudemanager' | 'buerger';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

// Energy Management Types
export interface EnergyData {
  id: string;
  buildingId: string;
  timestamp: string;
  consumption: number; // kWh
  production: number; // kWh (solar, etc.)
  efficiency: number; // percentage
  co2Saved: number; // kg
}

export interface Building {
  id: string;
  name: string;
  type: 'rathaus' | 'grundschule' | 'realschule' | 'hallenbad' | 'werkrealschule' | 'gymnasium' | 'sporthallen' | 'other';
  address: string;
  capacity: number; // max kWh
  status: 'online' | 'offline' | 'maintenance';
  sensors: Sensor[];
  lastUpdate: string;
  // Hechingen-specific properties
  yearlyConsumption: number; // kWh per year
  savingsPotential: {
    kwh: number; // kWh savings potential
    euro: number; // € savings potential per year
    percentage: number; // percentage improvement
  };
  kwhPerSquareMeter: number; // efficiency metric
  area: number; // building size in m²
  // Special features for different building types
  specialFeatures?: {
    poolTemperature?: number; // for hallenbad (°C)
    waterSurface?: number; // for hallenbad (m²)
    poolHours?: string; // opening hours
    occupancyRate?: number; // for schools
    studentCount?: number; // for schools
    renovationStatus?: 'none' | 'planned' | 'ongoing' | 'completed';
    kfwStandard?: 'KfW-40' | 'KfW-55' | 'KfW-70' | 'none';
    heritageProtection?: boolean; // for gymnasium
    buildYear?: number;
    lastRenovation?: number;
    sportFacilities?: string[]; // for sporthallen
  };
  energyClass?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

export interface Sensor {
  id: string;
  buildingId: string;
  type: 'temperature' | 'humidity' | 'energy' | 'solar' | 'battery' | 'services' | 'traffic' | 'security' | 'education' | 'health' | 'environment' | 'pool' | 'pump' | 'occupancy' | 'sports' | 'water_quality' | 'visitors' | 'heritage' | 'renovation';
  name: string;
  value: number;
  unit: string;
  status: 'active' | 'inactive' | 'error';
  lastReading: string;
  // Optional metadata for special sensors
  metadata?: {
    location?: string;
    critical?: boolean;
    alertThreshold?: number;
    description?: string;
  };
}

// Alert Types
export interface Alert {
  id: string;
  buildingId: string;
  type: 'warning' | 'error' | 'info' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: string;
}

// Analytics Types
export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  totalConsumption: number;
  totalProduction: number;
  totalSaved: number;
  efficiency: number;
  co2Reduction: number;
  predictions: PredictionData[];
  trends: TrendData[];
}

export interface PredictionData {
  date: string;
  predictedConsumption: number;
  predictedProduction: number;
  confidence: number; // percentage
}

export interface TrendData {
  label: string;
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
}

// WebSocket Message Types
// WebSocket payload types
export interface EnergyUpdatePayload {
  totalEnergy?: number;
  co2Saved?: number;
  buildingId?: string;
}

export interface AlertPayload {
  alertCount?: number;
  message?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  buildingId?: string;
}

export interface SystemStatusPayload {
  status?: 'online' | 'offline' | 'maintenance';
  buildingId?: string;
}

export interface SensorDataPayload {
  sensorId: string;
  value: number;
  timestamp: string;
  unit: string;
}

export type WebSocketPayload = EnergyUpdatePayload | AlertPayload | SystemStatusPayload | SensorDataPayload | Record<string, unknown>;

export interface WebSocketMessage {
  type: 'energy_update' | 'alert' | 'building_status' | 'sensor_data' | 'system_status';
  payload: WebSocketPayload;
  timestamp: string;
  source?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalEnergyProduced: number;
  totalEnergyConsumed: number;
  totalCO2Saved: number;
  totalBuildings: number;
  activeAlerts: number;
  systemEfficiency: number;
  trends: {
    energyProduction: number;
    energyConsumption: number;
    efficiency: number;
    co2Savings: number;
  };
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  timestamp?: string;
  color?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  consumption: number;
  production: number;
  efficiency: number;
}

// Component Props Types
export interface DashboardCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

// Energy Optimization Types
export interface OptimizationRecommendation {
  id: string;
  type: 'immediate' | 'scheduled' | 'long-term';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings: {
    kwh: number;
    euro: number;
    co2: number;
  };
  implementationTime: string;
  buildingId?: string;
  status: 'pending' | 'implemented' | 'rejected';
  complexity: 'easy' | 'medium' | 'complex';
  category: 'heating' | 'lighting' | 'cooling' | 'equipment' | 'automation' | 'infrastructure';
  estimatedROI?: number; // months to break even
  requiredPermissions?: string[];
}

export interface EnergyPrediction {
  timestamp: string;
  predicted: number;
  confidence: number;
  factors: string[];
  weatherImpact?: number;
  occupancyImpact?: number;
  seasonalFactor?: number;
  baselineConsumption: number;
}

export interface OptimizationMetrics {
  totalSavingsPotential: {
    kwh: number;
    euro: number;
    co2: number;
  };
  currentEfficiency: number;
  targetEfficiency: number;
  implementedOptimizations: number;
  pendingOptimizations: number;
  monthlyTrend: {
    kwh: number;
    euro: number;
    percentage: number;
  };
  annualProjection: {
    totalSavings: number;
    co2Reduction: number;
    efficiency: number;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  buildingId?: string;
  schedule?: string;
  conditions: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
  averageSavings?: number; // kWh per trigger
}

export interface OptimizationDashboardData {
  realTimeStatus: Array<{
    buildingId: string;
    name: string;
    status: 'optimal' | 'optimizing' | 'maintenance' | 'offline';
    efficiency: number;
    currentConsumption: number;
    optimizedConsumption: number;
    activeOptimizations: string[];
  }>;
  hourlyComparison: Array<{
    hour: string;
    current: number;
    optimized: number;
    savings: number;
    confidence: number;
  }>;
  predictiveAlerts: Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
    action: string;
    scheduledTime: string;
    estimatedImpact: number;
  }>;
}

export interface EnergyOptimizationSettings {
  autoImplementation: {
    enabled: boolean;
    maxSavingsThreshold: number; // Euro
    allowedComplexity: 'easy' | 'medium' | 'complex';
    requireApproval: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    threshold: number; // minimum savings to alert
  };
  scheduling: {
    maintenanceWindows: string[];
    peakHours: string[];
    minimumGapBetweenOptimizations: number; // minutes
  };
}

// Budget & Finance Management Types
export interface Budget {
  id: string;
  buildingId?: string; // Optional for overall budget
  buildingName?: string;
  year: number;
  quarter?: number;
  month?: number;
  category: 'energie' | 'wartung' | 'personal' | 'infrastruktur' | 'optimierung' | 'gesamt';
  budgetAllocated: number; // Euro allocated
  budgetSpent: number; // Euro spent so far
  budgetRemaining: number; // Euro remaining
  lastUpdated: string;
  status: 'on-track' | 'over-budget' | 'under-budget' | 'critical';
  variance: number; // percentage over/under budget
  notes?: string;
  approvedBy?: string;
  subcategories?: BudgetSubcategory[];
}

export interface BudgetSubcategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  description?: string;
}

export interface Expense {
  id: string;
  buildingId?: string;
  buildingName?: string;
  category: 'energie' | 'wartung' | 'personal' | 'infrastruktur' | 'optimierung' | 'sonstiges';
  subcategory?: string;
  description: string;
  amount: number; // Euro
  date: string;
  vendor?: string;
  invoiceNumber?: string;
  status: 'pending' | 'approved' | 'paid' | 'overdue';
  paymentMethod?: 'bank-transfer' | 'credit-card' | 'cash' | 'direct-debit';
  approvedBy?: string;
  approvalDate?: string;
  dueDate?: string;
  tags?: string[];
  recurringType?: 'none' | 'monthly' | 'quarterly' | 'yearly';
  attachments?: string[]; // file URLs
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: Vendor;
  buildingId?: string;
  buildingName?: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  lineItems: InvoiceLineItem[];
  taxAmount: number;
  subtotal: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  category: 'energie' | 'wartung' | 'infrastruktur' | 'sonstiges';
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
  category?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms: string; // e.g., "30 Tage netto"
  category: 'energie' | 'wartung' | 'infrastruktur' | 'beratung' | 'sonstiges';
  isPreferred: boolean;
}

export interface ROIProject {
  id: string;
  name: string;
  description: string;
  buildingId?: string;
  buildingName?: string;
  category: 'energie-optimierung' | 'infrastruktur' | 'automation' | 'wartung' | 'sonstiges';
  investmentAmount: number; // Euro initial investment
  implementationDate: string;
  expectedPaybackMonths: number;
  actualPaybackMonths?: number;
  status: 'geplant' | 'in-umsetzung' | 'abgeschlossen' | 'pausiert';
  monthlySavings: ROISavings[];
  totalSavingsToDate: number;
  projectedAnnualSavings: number;
  actualAnnualSavings?: number;
  roi: number; // percentage
  npv?: number; // Net Present Value
  irr?: number; // Internal Rate of Return
  completionPercentage: number;
  risks?: string[];
  benefits?: string[];
  kpis: ProjectKPI[];
}

export interface ROISavings {
  month: string;
  energySavings: number; // kWh
  costSavings: number; // Euro
  co2Savings: number; // kg
  efficiency: number; // percentage
}

export interface ProjectKPI {
  name: string;
  target: number;
  actual: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface BudgetAlert {
  id: string;
  type: 'budget-exceeded' | 'approaching-limit' | 'cost-spike' | 'payment-overdue' | 'forecast-warning';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  buildingId?: string;
  buildingName?: string;
  category?: string;
  amount?: number;
  threshold?: number;
  percentage?: number;
  timestamp: string;
  isResolved: boolean;
  actionRequired?: string;
  recommendedAction?: string;
}

export interface FinancialForecast {
  buildingId?: string;
  buildingName?: string;
  category: 'energie' | 'wartung' | 'gesamt';
  period: 'month' | 'quarter' | 'year';
  forecastData: ForecastDataPoint[];
  confidence: number; // percentage
  methodology: string;
  factors: string[];
  lastUpdated: string;
  projectedSavings?: number;
  projectedCosts?: number;
  variance?: number; // expected variance percentage
}

export interface ForecastDataPoint {
  period: string; // date string
  predicted: number;
  confidence: number;
  factors: {
    seasonal?: number;
    trend?: number;
    weather?: number;
    occupancy?: number;
    maintenance?: number;
  };
}

export interface CostBreakdown {
  buildingId?: string;
  buildingName?: string;
  period: 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  totalCost: number;
  categories: {
    energie: CostCategory;
    wartung: CostCategory;
    personal: CostCategory;
    infrastruktur: CostCategory;
    optimierung: CostCategory;
    sonstiges: CostCategory;
  };
  trends: {
    energieEffizienz: number; // Euro per kWh
    wartungskosten: number; // Euro per m²
    personalkosten: number; // Euro per employee
  };
  comparisons: {
    previousPeriod: number; // percentage change
    budget: number; // percentage vs budget
    benchmark: number; // percentage vs industry benchmark
  };
}

export interface CostCategory {
  amount: number;
  percentage: number;
  subcategories: { [key: string]: number };
  trend: number; // percentage change from previous period
  budget: number;
  variance: number; // percentage over/under budget
}

export interface BudgetDashboardData {
  overview: {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    budgetUtilization: number; // percentage
    overBudgetBuildings: number;
    criticalAlerts: number;
  };
  buildingBudgets: Budget[];
  categoryBreakdown: {
    [category: string]: {
      allocated: number;
      spent: number;
      variance: number;
    };
  };
  monthlyTrends: Array<{
    month: string;
    budget: number;
    actual: number;
    forecast: number;
  }>;
  topExpenses: Expense[];
  roiProjects: ROIProject[];
  alerts: BudgetAlert[];
  forecasts: FinancialForecast[];
}

export interface BudgetReportData {
  reportType: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalBudget: number;
    totalActual: number;
    variance: number;
    variancePercentage: number;
    savingsAchieved: number;
    roiProjects: number;
  };
  buildingPerformance: Array<{
    buildingId: string;
    buildingName: string;
    budget: number;
    actual: number;
    variance: number;
    efficiency: number;
    recommendations: string[];
  }>;
  categoryAnalysis: {
    [category: string]: {
      budget: number;
      actual: number;
      variance: number;
      trend: 'improving' | 'stable' | 'declining';
      keyMetrics: { [metric: string]: number };
    };
  };
  costDrivers: Array<{
    factor: string;
    impact: number; // Euro
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    potentialSavings: number;
    implementationEffort: 'low' | 'medium' | 'high';
  }>;
}

// Advanced Analytics Types
export interface AdvancedAnalyticsData {
  overview: AnalyticsOverview;
  energyAnalytics: EnergyAnalyticsData;
  predictiveModels: PredictiveAnalyticsData;
  benchmarkData: BenchmarkData;
  aiInsights: AIInsightsData;
  kpiMetrics: KPIMetrics;
  timeSeriesData: TimeSeriesAnalyticsData;
  anomalies: AnomalyData[];
  correlations: CorrelationData[];
  forecasts: ForecastData[];
}

export interface AnalyticsOverview {
  totalEnergyConsumed: number;
  totalCostSavings: number;
  co2ReductionTotal: number;
  efficiencyImprovement: number;
  buildingsOptimized: number;
  activeInsights: number;
  lastUpdated: string;
  dataQualityScore: number;
  coveragePeriod: {
    start: string;
    end: string;
  };
}

export interface EnergyAnalyticsData {
  consumptionTrends: ConsumptionTrend[];
  usagePatterns: UsagePattern[];
  efficiencyMetrics: EfficiencyMetric[];
  costAnalysis: CostAnalysisData;
  seasonalVariations: SeasonalData[];
  peakDemandAnalysis: PeakDemandData;
  baselineComparison: BaselineComparisonData;
  weatherCorrelation: WeatherCorrelationData;
}

export interface ConsumptionTrend {
  buildingId: string;
  buildingName: string;
  period: string;
  consumption: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  comparison: {
    previousPeriod: number;
    yearOverYear: number;
    budget: number;
  };
  factors: string[];
  seasonalAdjusted: number;
}

export interface UsagePattern {
  patternType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  data: Array<{
    period: string;
    consumption: number;
    efficiency: number;
    occupancyFactor: number;
    weatherFactor: number;
  }>;
  insights: string[];
  recommendations: string[];
  confidence: number;
}

export interface EfficiencyMetric {
  buildingId: string;
  buildingName: string;
  currentEfficiency: number;
  targetEfficiency: number;
  improvement: number;
  benchmarkScore: number;
  factors: {
    heating: number;
    cooling: number;
    lighting: number;
    equipment: number;
    envelope: number;
  };
  recommendations: OptimizationRecommendation[];
}

export interface CostAnalysisData {
  totalCosts: number;
  costPerKwh: number;
  costTrends: Array<{
    period: string;
    total: number;
    perKwh: number;
    savings: number;
  }>;
  costDrivers: Array<{
    factor: string;
    impact: number;
    percentage: number;
  }>;
  savingsOpportunities: Array<{
    description: string;
    potentialSavings: number;
    implementationCost: number;
    paybackPeriod: number;
  }>;
}

export interface SeasonalData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  averageConsumption: number;
  peakConsumption: number;
  efficiency: number;
  costs: number;
  weatherImpact: number;
  adjustmentFactors: {
    heating: number;
    cooling: number;
    lighting: number;
  };
}

export interface PeakDemandData {
  currentPeak: number;
  predictedPeak: number;
  peakTimes: string[];
  demandCharges: number;
  loadShiftingPotential: number;
  strategies: Array<{
    strategy: string;
    potentialReduction: number;
    cost: number;
  }>;
}

export interface BaselineComparisonData {
  baselineYear: number;
  currentYear: number;
  improvements: {
    consumption: number;
    costs: number;
    efficiency: number;
    co2: number;
  };
  buildingComparisons: Array<{
    buildingId: string;
    buildingName: string;
    improvement: number;
    rank: number;
  }>;
}

export interface WeatherCorrelationData {
  correlationCoefficient: number;
  weatherFactors: Array<{
    factor: 'temperature' | 'humidity' | 'solar' | 'wind';
    correlation: number;
    impact: number;
  }>;
  seasonalAdjustments: {
    [season: string]: number;
  };
  degreesDays: {
    heating: number;
    cooling: number;
  };
}

export interface PredictiveAnalyticsData {
  consumptionForecast: ConsumptionForecast[];
  maintenancePredictions: MaintenancePrediction[];
  costForecasts: CostForecast[];
  demandPredictions: DemandPrediction[];
  anomalyPredictions: AnomalyPrediction[];
  optimizationPotentials: OptimizationPotential[];
  modelAccuracy: ModelAccuracy;
  confidenceIntervals: ConfidenceInterval[];
}

export interface ConsumptionForecast {
  buildingId: string;
  buildingName: string;
  forecastPeriod: string;
  predictedConsumption: number;
  confidence: number;
  factors: {
    weather: number;
    occupancy: number;
    seasonal: number;
    trend: number;
  };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

export interface MaintenancePrediction {
  equipmentId: string;
  equipmentType: string;
  buildingId: string;
  predictedFailureDate: string;
  probability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
  costImpact: number;
  energyImpact: number;
}

export interface CostForecast {
  period: string;
  predictedCost: number;
  confidence: number;
  drivers: Array<{
    factor: string;
    impact: number;
  }>;
  savingsOpportunities: number;
  budgetVariance: number;
}

export interface DemandPrediction {
  timestamp: string;
  predictedDemand: number;
  peakProbability: number;
  loadShiftingRecommendation: string;
  costImplication: number;
}

export interface AnomalyPrediction {
  type: 'consumption' | 'efficiency' | 'cost' | 'equipment';
  probability: number;
  expectedImpact: number;
  preventiveActions: string[];
  monitoringRecommendations: string[];
}

export interface OptimizationPotential {
  buildingId: string;
  buildingName: string;
  category: string;
  potentialSavings: {
    kwh: number;
    euro: number;
    co2: number;
  };
  implementationComplexity: 'low' | 'medium' | 'high';
  paybackPeriod: number;
  confidence: number;
}

export interface ModelAccuracy {
  consumptionModel: number;
  costModel: number;
  maintenanceModel: number;
  overallAccuracy: number;
  lastValidation: string;
  validationMetrics: {
    rmse: number;
    mae: number;
    r2: number;
  };
}

export interface ConfidenceInterval {
  metric: string;
  prediction: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface BenchmarkData {
  buildingComparisons: BuildingBenchmark[];
  industryBenchmarks: IndustryBenchmark[];
  performanceRankings: PerformanceRanking[];
  bestPractices: BestPractice[];
  gapAnalysis: GapAnalysis[];
  improvementOpportunities: ImprovementOpportunity[];
}

export interface BuildingBenchmark {
  buildingId: string;
  buildingName: string;
  kpiScores: {
    energyEfficiency: number;
    costEfficiency: number;
    sustainability: number;
    automation: number;
    maintenance: number;
    userSatisfaction: number;
  };
  overallScore: number;
  rank: number;
  percentile: number;
  topPerformer: boolean;
  improvementAreas: string[];
}

export interface IndustryBenchmark {
  category: string;
  municipalAverage: number;
  industryBest: number;
  currentValue: number;
  gap: number;
  gapPercentage: number;
  targetValue: number;
  timeToTarget: number;
}

export interface PerformanceRanking {
  metric: string;
  rankings: Array<{
    buildingId: string;
    buildingName: string;
    value: number;
    rank: number;
    percentile: number;
    trendDirection: 'up' | 'down' | 'stable';
  }>;
}

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  category: string;
  implementedBy: string[];
  notImplementedBy: string[];
  potentialImpact: number;
  implementationEffort: 'low' | 'medium' | 'high';
  evidence: string[];
}

export interface GapAnalysis {
  buildingId: string;
  buildingName: string;
  performanceGaps: Array<{
    metric: string;
    current: number;
    target: number;
    gap: number;
    priority: 'high' | 'medium' | 'low';
    recommendedActions: string[];
  }>;
  overallGapScore: number;
}

export interface ImprovementOpportunity {
  buildingId: string;
  buildingName: string;
  opportunity: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  potentialImpact: {
    energy: number;
    cost: number;
    co2: number;
  };
  implementationPlan: {
    steps: string[];
    timeline: string;
    resources: string[];
  };
  roi: number;
}

export interface AIInsightsData {
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  patterns: PatternRecognition[];
  alerts: AIAlert[];
  automationSuggestions: AutomationSuggestion[];
  learningProgress: LearningProgress;
}

export interface AIInsight {
  id: string;
  type: 'optimization' | 'anomaly' | 'efficiency' | 'cost' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  buildingId?: string;
  buildingName?: string;
  evidence: string[];
  generatedAt: string;
  status: 'new' | 'reviewed' | 'implemented' | 'dismissed';
  potentialSavings?: {
    energy: number;
    cost: number;
    co2: number;
  };
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidenceScore: number;
  implementationComplexity: 'simple' | 'moderate' | 'complex';
  expectedImpact: {
    energy: number;
    cost: number;
    timeframe: string;
  };
  prerequisites: string[];
  steps: string[];
  risks: string[];
  alternatives: string[];
  buildingIds: string[];
}

export interface PatternRecognition {
  patternType: 'consumption' | 'efficiency' | 'cost' | 'maintenance' | 'occupancy';
  description: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'seasonal';
  strength: number;
  buildingsAffected: string[];
  correlatedFactors: string[];
  actionableInsights: string[];
  predictionAccuracy: number;
}

export interface AIAlert {
  id: string;
  type: 'performance_degradation' | 'cost_spike' | 'efficiency_drop' | 'maintenance_needed' | 'optimization_opportunity';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  buildingId: string;
  buildingName: string;
  detectedAt: string;
  confidence: number;
  recommendedActions: string[];
  estimatedImpact: number;
  isResolved: boolean;
  falsePositiveProbability: number;
}

export interface AutomationSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'energy_management' | 'maintenance' | 'cost_optimization' | 'reporting';
  complexity: 'simple' | 'moderate' | 'complex';
  buildingIds: string[];
  expectedBenefits: {
    energySavings: number;
    costSavings: number;
    timeReduction: number;
  };
  implementationSteps: string[];
  requiredResources: string[];
  riskAssessment: string;
  roi: number;
}

export interface LearningProgress {
  modelVersion: string;
  trainingDataSize: number;
  accuracyMetrics: {
    consumption: number;
    cost: number;
    efficiency: number;
    maintenance: number;
  };
  improvementRate: number;
  lastTraining: string;
  nextTraining: string;
  dataQuality: number;
  biasMetrics: {
    [building: string]: number;
  };
}

export interface KPIMetrics {
  energyKPIs: EnergyKPI[];
  financialKPIs: FinancialKPI[];
  operationalKPIs: OperationalKPI[];
  sustainabilityKPIs: SustainabilityKPI[];
  userExperienceKPIs: UserExperienceKPI[];
  overallPerformance: OverallPerformanceKPI;
}

export interface EnergyKPI {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  trendPercentage: number;
  benchmark: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  lastUpdated: string;
}

export interface FinancialKPI {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  budgetVariance: number;
  roi: number;
  paybackPeriod: number;
}

export interface OperationalKPI {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  efficiency: number;
  availability: number;
  reliability: number;
  maintenanceScore: number;
}

export interface SustainabilityKPI {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  co2Reduction: number;
  renewablePercentage: number;
  sustainabilityScore: number;
  certificationLevel: string;
}

export interface UserExperienceKPI {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  satisfactionScore: number;
  comfortLevel: number;
  complaintCount: number;
  responseTime: number;
}

export interface OverallPerformanceKPI {
  overallScore: number;
  energyScore: number;
  financialScore: number;
  operationalScore: number;
  sustainabilityScore: number;
  userExperienceScore: number;
  improvementRate: number;
  benchmarkPosition: number;
}

export interface TimeSeriesAnalyticsData {
  consumptionTimeSeries: TimeSeriesPoint[];
  efficiencyTimeSeries: TimeSeriesPoint[];
  costTimeSeries: TimeSeriesPoint[];
  co2TimeSeries: TimeSeriesPoint[];
  correlation: CorrelationMatrix;
  seasonality: SeasonalityAnalysis;
  cyclicalPatterns: CyclicalPattern[];
  volatility: VolatilityMetrics;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  predicted?: number;
  confidence?: number;
  anomaly?: boolean;
  factors?: {
    [factor: string]: number;
  };
}

export interface CorrelationMatrix {
  variables: string[];
  correlations: number[][];
  significantCorrelations: Array<{
    variable1: string;
    variable2: string;
    correlation: number;
    significance: number;
  }>;
}

export interface SeasonalityAnalysis {
  seasonalStrength: number;
  seasonalPeriod: number;
  decomposition: {
    trend: number[];
    seasonal: number[];
    residual: number[];
  };
  seasonalAdjusted: number[];
}

export interface CyclicalPattern {
  name: string;
  period: number;
  amplitude: number;
  phase: number;
  confidence: number;
  description: string;
}

export interface VolatilityMetrics {
  variance: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  volatilityIndex: number;
  stabilityScore: number;
}

export interface AnomalyData {
  id: string;
  type: 'consumption' | 'efficiency' | 'cost' | 'performance';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  buildingId: string;
  buildingName: string;
  detectedAt: string;
  value: number;
  expectedValue: number;
  deviation: number;
  deviationPercentage: number;
  duration: number;
  status: 'active' | 'resolved' | 'investigating';
  potentialCauses: string[];
  recommendedActions: string[];
  impact: {
    energy: number;
    cost: number;
    operational: string;
  };
  confidence: number;
  falsePositiveRate: number;
}

export interface CorrelationData {
  variable1: string;
  variable2: string;
  correlationType: 'positive' | 'negative' | 'neutral';
  correlationStrength: number;
  significance: number;
  timeframe: string;
  buildingsAnalyzed: string[];
  insights: string[];
  actionableRecommendations: string[];
}

export interface ForecastData {
  type: 'consumption' | 'cost' | 'efficiency' | 'demand';
  horizon: 'short_term' | 'medium_term' | 'long_term';
  buildingId?: string;
  buildingName?: string;
  forecast: Array<{
    period: string;
    predicted: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }>;
  methodology: string;
  accuracy: number;
  lastUpdated: string;
  assumptions: string[];
  riskFactors: string[];
}

// Chart and Visualization Types
export interface DrillDownChartData {
  level: number;
  data: ChartDataPoint[];
  parentId?: string;
  breadcrumb: string[];
  availableFilters: ChartFilter[];
  metadata: {
    totalRecords: number;
    aggregationLevel: string;
    timeRange: {
      start: string;
      end: string;
    };
  };
}

export interface ChartFilter {
  id: string;
  name: string;
  type: 'date' | 'category' | 'range' | 'multiselect';
  options?: Array<{ value: string; label: string }>;
  value?: any;
  required: boolean;
}

export interface HeatMapData {
  x: string;
  y: string;
  value: number;
  normalized: number;
  building?: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface TreeMapData {
  name: string;
  value: number;
  children?: TreeMapData[];
  color?: string;
  depth: number;
  percentage: number;
}

export interface NetworkGraphData {
  nodes: Array<{
    id: string;
    label: string;
    group: string;
    value: number;
    metadata: {
      [key: string]: any;
    };
  }>;
  links: Array<{
    source: string;
    target: string;
    weight: number;
    type: string;
  }>;
}

// Export Configuration Types
export interface ExportConfiguration {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeRawData: boolean;
  timeRange: {
    start: string;
    end: string;
  };
  buildings: string[];
  metrics: string[];
  reportTemplate: string;
  customizations: {
    logo?: string;
    header?: string;
    footer?: string;
    watermark?: string;
  };
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  fileName: string;
  fileSize: number;
  generatedAt: string;
  expiresAt: string;
  error?: string;
}

// Analytics Dashboard Tab Types
export interface AnalyticsDashboardTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  permissions?: string[];
  badge?: {
    count: number;
    variant: 'success' | 'warning' | 'error' | 'info';
  };
}

export interface AnalyticsFilters {
  timeRange: {
    start: string;
    end: string;
    preset: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  };
  buildings: string[];
  metrics: string[];
  granularity: 'hour' | 'day' | 'week' | 'month';
  comparison: {
    enabled: boolean;
    type: 'period' | 'building' | 'baseline';
    reference: string;
  };
}

export interface AnalyticsState {
  data: AdvancedAnalyticsData | null;
  filters: AnalyticsFilters;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  autoRefresh: boolean;
  refreshInterval: number;
}

// Environment Variables
export interface EnvironmentConfig {
  VITE_API_URL: string;
  VITE_WS_URL: string;
  VITE_APP_ENV: 'development' | 'production' | 'test';
  VITE_USE_MOCK_DATA: string;
  VITE_MOCK_DELAY?: string;
  VITE_MOCK_FAILURE_RATE?: string;
  VITE_WS_ENABLED?: string;
  VITE_SENTRY_DSN?: string;
  VITE_GOOGLE_ANALYTICS_ID?: string;
}