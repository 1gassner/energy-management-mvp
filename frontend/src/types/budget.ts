/**
 * Budget & Cost Management System Types
 * Stadt Hechingen - CityPulse Energy Management
 */

export interface BudgetPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
}

export interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  parentId?: string;
}

export interface BuildingBudget {
  id: string;
  buildingId: string;
  buildingName: string;
  periodId: string;
  categories: {
    [categoryId: string]: {
      budgeted: number;
      actual: number;
      forecast: number;
      variance: number;
      variancePercentage: number;
    };
  };
  totalBudgeted: number;
  totalActual: number;
  totalForecast: number;
  totalVariance: number;
  totalVariancePercentage: number;
  lastUpdated: string;
}

export interface CostItem {
  id: string;
  buildingId: string;
  categoryId: string;
  type: 'energy' | 'maintenance' | 'personnel' | 'equipment' | 'other';
  subtype?: string;
  description: string;
  amount: number;
  date: string;
  invoiceNumber?: string;
  vendorId?: string;
  vendorName: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  approvedBy?: string;
  paidDate?: string;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface EnergyCost {
  id: string;
  buildingId: string;
  type: 'electricity' | 'gas' | 'heating' | 'water' | 'solar';
  consumption: number;
  unit: string;
  pricePerUnit: number;
  totalCost: number;
  period: string;
  meterReading?: number;
  previousReading?: number;
  billingDate: string;
  dueDate: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
}

export interface MaintenanceCost {
  id: string;
  buildingId: string;
  deviceId?: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'upgrade';
  category: 'hvac' | 'electrical' | 'plumbing' | 'structural' | 'security' | 'other';
  description: string;
  laborCost: number;
  materialCost: number;
  totalCost: number;
  date: string;
  technician: string;
  vendorId?: string;
  workOrderId?: string;
  downtime?: number; // minutes
}

export interface ROIProject {
  id: string;
  name: string;
  description: string;
  buildingId: string;
  type: 'energy_efficiency' | 'equipment_upgrade' | 'automation' | 'renewable_energy';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  investment: number;
  expectedSavings: number;
  actualSavings?: number;
  paybackPeriod: number; // months
  expectedROI: number;
  actualROI?: number;
  startDate: string;
  completionDate?: string;
  metrics: {
    energySavingsKwh?: number;
    co2Reduction?: number;
    maintenanceReduction?: number;
  };
}

export interface Vendor {
  id: string;
  name: string;
  type: 'energy_supplier' | 'maintenance' | 'equipment' | 'consulting' | 'other';
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  rating: number;
  totalContracts: number;
  totalSpend: number;
  paymentTerms: string;
  isActive: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  buildingId: string;
  categoryId: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'received' | 'approved' | 'paid' | 'overdue' | 'disputed';
  approvedBy?: string;
  approvalDate?: string;
  paymentMethod?: string;
  description: string;
  lineItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  attachments?: string[];
}

export interface CostForecast {
  buildingId: string;
  categoryId: string;
  period: string;
  historicalData: {
    period: string;
    actual: number;
  }[];
  forecast: number;
  confidence: number;
  factors: {
    seasonal: number;
    trend: number;
    external: number;
  };
  upperBound: number;
  lowerBound: number;
}

export interface BudgetAlert {
  id: string;
  type: 'budget_overrun' | 'forecast_exceeded' | 'payment_overdue' | 'cost_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  buildingId: string;
  categoryId?: string;
  title: string;
  message: string;
  threshold: number;
  currentValue: number;
  createdAt: string;
  resolvedAt?: string;
  actions: string[];
}

export interface CostOptimization {
  id: string;
  buildingId: string;
  type: 'energy_efficiency' | 'contract_renegotiation' | 'process_improvement' | 'technology_upgrade';
  title: string;
  description: string;
  currentCost: number;
  optimizedCost: number;
  potentialSavings: number;
  implementationCost: number;
  paybackPeriod: number;
  priority: 'low' | 'medium' | 'high';
  status: 'identified' | 'analyzed' | 'approved' | 'implemented' | 'rejected';
  estimatedImpact: {
    monthly: number;
    annual: number;
    lifetime: number;
  };
}

export interface BudgetDashboardStats {
  totalBudget: number;
  totalSpent: number;
  totalForecast: number;
  budgetUtilization: number;
  costVariance: number;
  activeProjects: number;
  overdueInvoices: number;
  pendingApprovals: number;
  energyCosts: {
    current: number;
    previous: number;
    trend: number;
  };
  maintenanceCosts: {
    current: number;
    previous: number;
    trend: number;
  };
  topCostBuildings: {
    buildingId: string;
    buildingName: string;
    totalCost: number;
    budgetVariance: number;
  }[];
  monthlyTrends: {
    month: string;
    budgeted: number;
    actual: number;
    forecast: number;
  }[];
}

export interface PaymentSchedule {
  id: string;
  type: 'recurring' | 'one_time';
  vendorId: string;
  vendorName: string;
  amount: number;
  frequency?: 'monthly' | 'quarterly' | 'annually';
  nextDueDate: string;
  lastPaidDate?: string;
  status: 'active' | 'paused' | 'cancelled';
  buildingId?: string;
  categoryId: string;
  autoApprove: boolean;
  reminderDays: number;
}

// API Response Types
export interface BudgetApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Chart Data Types
export interface BudgetChartData {
  name: string;
  budgeted: number;
  actual: number;
  forecast: number;
  variance?: number;
}

export interface CostTrendData {
  period: string;
  energy: number;
  maintenance: number;
  personnel: number;
  equipment: number;
  total: number;
}

export interface ROIChartData {
  projectName: string;
  investment: number;
  savings: number;
  roi: number;
  paybackMonths: number;
}