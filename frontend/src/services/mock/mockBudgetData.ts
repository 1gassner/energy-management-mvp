/**
 * Mock Budget & Cost Management Data
 * Stadt Hechingen - CityPulse Energy Management
 * Realistische Finanzdaten für alle 7 Gebäude
 */

import {
  Budget,
  Expense,
  Vendor,
  ROIProject,
  BudgetAlert,
  FinancialForecast,
  CostBreakdown,
  BudgetDashboardData,
  BudgetReportData
} from '@/types';

// Budgets für alle 7 Gebäude
export const mockBudgets: Budget[] = [
  // Rathaus Hechingen
  {
    id: 'budget-rathaus-2024-energie',
    buildingId: 'rathaus-hechingen',
    buildingName: 'Rathaus Hechingen',
    year: 2024,
    category: 'energie',
    budgetAllocated: 65000,
    budgetSpent: 52340,
    budgetRemaining: 12660,
    lastUpdated: '2024-10-28T14:30:00Z',
    status: 'under-budget',
    variance: -19.5,
    notes: 'Durch LED-Umstellung deutliche Einsparungen',
    approvedBy: 'Bürgermeister Steinle',
    subcategories: [
      { id: 'sub-1', name: 'Strom', allocated: 42000, spent: 34200, description: 'Stromverbrauch Rathaus' },
      { id: 'sub-2', name: 'Heizung', allocated: 18000, spent: 14140, description: 'Gas für Heizung' },
      { id: 'sub-3', name: 'Wasser', allocated: 5000, spent: 4000, description: 'Wasserverbrauch' }
    ]
  },
  {
    id: 'budget-rathaus-2024-wartung',
    buildingId: 'rathaus-hechingen',
    buildingName: 'Rathaus Hechingen',
    year: 2024,
    category: 'wartung',
    budgetAllocated: 15000,
    budgetSpent: 8950,
    budgetRemaining: 6050,
    lastUpdated: '2024-10-28T14:30:00Z',
    status: 'under-budget',
    variance: -40.3,
    notes: 'Weniger Reparaturen als erwartet',
    approvedBy: 'Technische Leitung',
    subcategories: [
      { id: 'sub-4', name: 'Präventive Wartung', allocated: 10000, spent: 6200, description: 'Geplante Wartungen' },
      { id: 'sub-5', name: 'Reparaturen', allocated: 5000, spent: 2750, description: 'Ungeplante Reparaturen' }
    ]
  },
  // Hallenbad Hechingen
  {
    id: 'budget-hallenbad-2024-energie',
    buildingId: 'hallenbad-hechingen',
    buildingName: 'Hallenbad Hechingen',
    year: 2024,
    category: 'energie',
    budgetAllocated: 280000,
    budgetSpent: 267500,
    budgetRemaining: 12500,
    lastUpdated: '2024-10-28T14:30:00Z',
    status: 'on-track',
    variance: -4.5,
    notes: 'Hoher Energieverbrauch durch Poolheizung',
    approvedBy: 'Stadtwerke Verwaltung',
    subcategories: [
      { id: 'sub-6', name: 'Poolheizung', allocated: 180000, spent: 175000, description: 'Beheizung der Schwimmbecken' },
      { id: 'sub-7', name: 'Beleuchtung', allocated: 45000, spent: 42000, description: 'Hallenbeleuchtung' },
      { id: 'sub-8', name: 'Lüftung', allocated: 35000, spent: 32500, description: 'Lüftungsanlage' },
      { id: 'sub-9', name: 'Pumpen', allocated: 20000, spent: 18000, description: 'Umwälzpumpen' }
    ]
  },
  // Gymnasium Hechingen
  {
    id: 'budget-gymnasium-2024-energie',
    buildingId: 'gymnasium-hechingen',
    buildingName: 'Gymnasium Hechingen',
    year: 2024,
    category: 'energie',
    budgetAllocated: 125000,
    budgetSpent: 118900,
    budgetRemaining: 6100,
    lastUpdated: '2024-10-28T14:30:00Z',
    status: 'on-track',
    variance: -4.9,
    notes: 'Energieeffiziente Maßnahmen zeigen Wirkung',
    approvedBy: 'Schulverwaltung',
    subcategories: [
      { id: 'sub-10', name: 'Heizung', allocated: 75000, spent: 71000, description: 'Gebäudeheizung' },
      { id: 'sub-11', name: 'Strom', allocated: 35000, spent: 33400, description: 'Stromverbrauch Schule' },
      { id: 'sub-12', name: 'Sporthalle', allocated: 15000, spent: 14500, description: 'Energie Sporthalle' }
    ]
  },
  // Weitere Gebäude...
  {
    id: 'budget-grundschule-2024-energie',
    buildingId: 'grundschule-hechingen',
    buildingName: 'Grundschule Hechingen',
    year: 2024,
    category: 'energie',
    budgetAllocated: 85000,
    budgetSpent: 78400,
    budgetRemaining: 6600,
    lastUpdated: '2024-10-28T14:30:00Z',
    status: 'on-track',
    variance: -7.8,
    notes: 'Konstanter Verbrauch',
    approvedBy: 'Schulverwaltung'
  },
  {
    id: 'budget-realschule-2024-energie',
    buildingId: 'realschule-hechingen',
    buildingName: 'Realschule Hechingen',
    year: 2024,
    category: 'energie',
    budgetAllocated: 55000,
    budgetSpent: 48200,
    budgetRemaining: 6800,
    lastUpdated: '2024-10-28T14:30:00Z',
    status: 'under-budget',
    variance: -12.4,
    notes: 'Überdurchschnittliche Einsparungen',
    approvedBy: 'Schulverwaltung'
  },
  {
    id: 'budget-werkrealschule-2024-energie',
    buildingId: 'werkrealschule-hechingen',
    buildingName: 'Werkrealschule Hechingen',
    year: 2024,
    category: 'energie',
    budgetAllocated: 85000,
    budgetSpent: 82100,
    budgetRemaining: 2900,
    lastUpdated: '2024-10-28T14:30:00Z',
    status: 'on-track',
    variance: -3.4,
    notes: 'Planmäßiger Verbrauch',
    approvedBy: 'Schulverwaltung'
  },
  {
    id: 'budget-sporthallen-2024-energie',
    buildingId: 'sporthallen-hechingen',
    buildingName: 'Sporthallen Hechingen',
    year: 2024,
    category: 'energie',
    budgetAllocated: 55000,
    budgetSpent: 51200,
    budgetRemaining: 3800,
    lastUpdated: '2024-10-28T14:30:00Z',
    status: 'on-track',
    variance: -6.9,
    notes: 'Gute Energieeffizienz',
    approvedBy: 'Sportverwaltung'
  }
];

// Ausgaben/Expenses
export const mockExpenses: Expense[] = [
  {
    id: 'exp-001',
    buildingId: 'rathaus-hechingen',
    buildingName: 'Rathaus Hechingen',
    category: 'energie',
    subcategory: 'Stromrechnung',
    description: 'Monatliche Stromrechnung Oktober 2024',
    amount: 4280.50,
    date: '2024-10-31',
    vendor: 'Stadtwerke Hechingen',
    invoiceNumber: 'SW-2024-10-001',
    status: 'paid',
    paymentMethod: 'bank-transfer',
    approvedBy: 'J. Müller',
    approvalDate: '2024-10-25',
    dueDate: '2024-11-15',
    tags: ['strom', 'monatlich', 'stadtwerke']
  },
  {
    id: 'exp-002',
    buildingId: 'hallenbad-hechingen',
    buildingName: 'Hallenbad Hechingen',
    category: 'wartung',
    subcategory: 'Pumpenreparatur',
    description: 'Reparatur der Hauptumwälzpumpe Becken 1',
    amount: 4340.00,
    date: '2024-10-08',
    vendor: 'Aqua-Tech Service GmbH',
    invoiceNumber: 'AQT-2024-0234',
    status: 'paid',
    paymentMethod: 'bank-transfer',
    approvedBy: 'T. Schmidt',
    approvalDate: '2024-10-05',
    dueDate: '2024-10-20',
    tags: ['reparatur', 'pumpe', 'notfall'],
    recurringType: 'none'
  },
  {
    id: 'exp-003',
    buildingId: 'gymnasium-hechingen',
    buildingName: 'Gymnasium Hechingen',
    category: 'infrastruktur',
    subcategory: 'LED Beleuchtung',
    description: 'LED-Leuchtmittel für Klassenzimmer',
    amount: 2850.75,
    date: '2024-10-15',
    vendor: 'Elektro Hoffmann GmbH',
    invoiceNumber: 'EH-2024-1145',
    status: 'approved',
    paymentMethod: 'bank-transfer',
    approvedBy: 'M. Weber',
    approvalDate: '2024-10-12',
    dueDate: '2024-11-01',
    tags: ['led', 'beleuchtung', 'energieeffizienz']
  },
  {
    id: 'exp-004',
    buildingId: 'hallenbad-hechingen',
    buildingName: 'Hallenbad Hechingen',
    category: 'energie',
    subcategory: 'Gasrechnung',
    description: 'Gasrechnung für Poolheizung Oktober 2024',
    amount: 18750.00,
    date: '2024-10-28',
    vendor: 'Gasversorgung Süd',
    invoiceNumber: 'GVS-2024-10-078',
    status: 'pending',
    paymentMethod: 'direct-debit',
    dueDate: '2024-11-15',
    tags: ['gas', 'heizung', 'pool'],
    recurringType: 'monthly'
  },
  {
    id: 'exp-005',
    buildingId: 'grundschule-hechingen',
    buildingName: 'Grundschule Hechingen',
    category: 'wartung',
    subcategory: 'Heizungsservice',
    description: 'Jährliche Heizungswartung',
    amount: 1230.00,
    date: '2024-10-20',
    vendor: 'Müller Haustechnik GmbH',
    invoiceNumber: 'MH-2024-0567',
    status: 'paid',
    paymentMethod: 'bank-transfer',
    approvedBy: 'K. Fischer',
    approvalDate: '2024-10-18',
    dueDate: '2024-11-05',
    tags: ['wartung', 'heizung', 'jährlich'],
    recurringType: 'yearly'
  }
];

// Lieferanten/Vendors
export const mockVendors: Vendor[] = [
  {
    id: 'vendor-stadtwerke',
    name: 'Stadtwerke Hechingen',
    contactPerson: 'Hans Zimmermann',
    email: 'h.zimmermann@stadtwerke-hechingen.de',
    phone: '+49 7471 9345-0',
    address: 'Energiestraße 12, 72379 Hechingen',
    taxId: 'DE123456789',
    paymentTerms: '30 Tage netto',
    category: 'energie',
    isPreferred: true
  },
  {
    id: 'vendor-aquatech',
    name: 'Aqua-Tech Service GmbH',
    contactPerson: 'Marco Bauer',
    email: 'm.bauer@aqua-tech.de',
    phone: '+49 7471 7789-12',
    address: 'Poolweg 5, 72379 Hechingen',
    taxId: 'DE987654321',
    paymentTerms: '14 Tage netto',
    category: 'wartung',
    isPreferred: true
  },
  {
    id: 'vendor-elektro-hoffmann',
    name: 'Elektro Hoffmann GmbH',
    contactPerson: 'Peter Hoffmann',
    email: 'p.hoffmann@elektro-hoffmann.de',
    phone: '+49 7471 5543-88',
    address: 'Handwerkerstraße 23, 72379 Hechingen',
    taxId: 'DE456789123',
    paymentTerms: '30 Tage netto',
    category: 'infrastruktur',
    isPreferred: false
  },
  {
    id: 'vendor-mueller-haustechnik',
    name: 'Müller Haustechnik GmbH',
    contactPerson: 'Thomas Müller',
    email: 't.mueller@mueller-haustechnik.de',
    phone: '+49 7471 8234-56',
    address: 'Technikstraße 8, 72379 Hechingen',
    taxId: 'DE789123456',
    paymentTerms: '14 Tage netto',
    category: 'wartung',
    isPreferred: true
  },
  {
    id: 'vendor-gasversorgung',
    name: 'Gasversorgung Süd',
    contactPerson: 'Andrea Klein',
    email: 'a.klein@gasversorgung-sued.de',
    phone: '+49 7471 6655-0',
    address: 'Gasstraße 1, 72379 Hechingen',
    taxId: 'DE321654987',
    paymentTerms: '30 Tage netto',
    category: 'energie',
    isPreferred: true
  }
];

// ROI Projekte
export const mockROIProjects: ROIProject[] = [
  {
    id: 'roi-rathaus-led',
    name: 'LED-Beleuchtung Rathaus',
    description: 'Vollständige Umstellung auf LED-Beleuchtung im gesamten Rathaus',
    buildingId: 'rathaus-hechingen',
    buildingName: 'Rathaus Hechingen',
    category: 'energie-optimierung',
    investmentAmount: 28500,
    implementationDate: '2024-03-01',
    expectedPaybackMonths: 36,
    actualPaybackMonths: 32,
    status: 'abgeschlossen',
    monthlySavings: [
      { month: '2024-04', energySavings: 1200, costSavings: 420, co2Savings: 540, efficiency: 85 },
      { month: '2024-05', energySavings: 1150, costSavings: 402, co2Savings: 518, efficiency: 87 },
      { month: '2024-06', energySavings: 980, costSavings: 343, co2Savings: 441, efficiency: 89 },
      { month: '2024-07', energySavings: 950, costSavings: 332, co2Savings: 428, efficiency: 90 },
      { month: '2024-08', energySavings: 1100, costSavings: 385, co2Savings: 495, efficiency: 88 },
      { month: '2024-09', energySavings: 1250, costSavings: 437, co2Savings: 562, efficiency: 86 },
      { month: '2024-10', energySavings: 1320, costSavings: 462, co2Savings: 594, efficiency: 85 }
    ],
    totalSavingsToDate: 8750,
    projectedAnnualSavings: 14400,
    actualAnnualSavings: 15200,
    roi: 53.3,
    npv: 42500,
    irr: 18.5,
    completionPercentage: 100,
    risks: ['Leuchtmittelausfall', 'Technologiewandel'],
    benefits: ['Energieeinsparung', 'Wartungsreduktion', 'CO2-Reduktion'],
    kpis: [
      { name: 'Energieeinsparung', target: 13000, actual: 8950, unit: 'kWh', trend: 'up' },
      { name: 'Kosteneinsparung', target: 4550, actual: 3131, unit: 'Euro', trend: 'up' },
      { name: 'CO2-Reduktion', target: 5850, actual: 4029, unit: 'kg', trend: 'up' }
    ]
  },
  {
    id: 'roi-hallenbad-waermepumpe',
    name: 'Wärmepumpe Hallenbad',
    description: 'Installation einer hocheffizienten Wärmepumpe für die Beckenheizung',
    buildingId: 'hallenbad-hechingen',
    buildingName: 'Hallenbad Hechingen',
    category: 'energie-optimierung',
    investmentAmount: 185000,
    implementationDate: '2024-09-01',
    expectedPaybackMonths: 58,
    status: 'in-umsetzung',
    monthlySavings: [
      { month: '2024-10', energySavings: 8500, costSavings: 2380, co2Savings: 3825, efficiency: 15 }
    ],
    totalSavingsToDate: 2380,
    projectedAnnualSavings: 32000,
    roi: 17.3,
    npv: 125000,
    irr: 12.8,
    completionPercentage: 65,
    risks: ['Technische Komplexität', 'Wintertemperaturen', 'Wartungsaufwand'],
    benefits: ['Massive Energieeinsparung', 'CO2-Neutralität', 'Unabhängigkeit fossile Brennstoffe'],
    kpis: [
      { name: 'Energieeinsparung', target: 120000, actual: 8500, unit: 'kWh', trend: 'up' },
      { name: 'Kosteneinsparung', target: 32000, actual: 2380, unit: 'Euro', trend: 'up' },
      { name: 'CO2-Reduktion', target: 54000, actual: 3825, unit: 'kg', trend: 'up' },
      { name: 'Effizienzsteigerung', target: 85, actual: 15, unit: '%', trend: 'up' }
    ]
  },
  {
    id: 'roi-gymnasium-automation',
    name: 'Gebäudeautomation Gymnasium',
    description: 'Smart Building System für optimale Heizungs- und Lüftungssteuerung',
    buildingId: 'gymnasium-hechingen',
    buildingName: 'Gymnasium Hechingen',
    category: 'automation',
    investmentAmount: 95000,
    implementationDate: '2025-02-01',
    expectedPaybackMonths: 72,
    status: 'geplant',
    monthlySavings: [],
    totalSavingsToDate: 0,
    projectedAnnualSavings: 15800,
    roi: 16.6,
    npv: 78000,
    irr: 14.2,
    completionPercentage: 0,
    risks: ['Komplexe Integration', 'Schulbetrieb-Störungen', 'Nutzerakzeptanz'],
    benefits: ['Automatische Optimierung', 'Präsenzsteuerung', 'Vorausschauende Wartung'],
    kpis: [
      { name: 'Energieeinsparung', target: 56700, actual: 0, unit: 'kWh', trend: 'stable' },
      { name: 'Kosteneinsparung', target: 15800, actual: 0, unit: 'Euro', trend: 'stable' },
      { name: 'CO2-Reduktion', target: 25600, actual: 0, unit: 'kg', trend: 'stable' },
      { name: 'Wartungsreduktion', target: 3200, actual: 0, unit: 'Euro', trend: 'stable' }
    ]
  }
];

// Budget Alerts
export const mockBudgetAlerts: BudgetAlert[] = [
  {
    id: 'alert-001',
    type: 'approaching-limit',
    severity: 'warning',
    title: 'Budget-Grenzwert erreicht',
    message: 'Hallenbad Energiebudget zu 95% ausgeschöpft',
    buildingId: 'hallenbad-hechingen',
    buildingName: 'Hallenbad Hechingen',
    category: 'energie',
    amount: 267500,
    threshold: 280000,
    percentage: 95.5,
    timestamp: '2024-10-28T09:15:00Z',
    isResolved: false,
    actionRequired: 'Budget prüfen und ggf. anpassen',
    recommendedAction: 'Energieverbrauch analysieren oder Zusatzbudget beantragen'
  },
  {
    id: 'alert-002',
    type: 'payment-overdue',
    severity: 'critical',
    title: 'Überfällige Zahlung',
    message: 'Rechnung Aqua-Tech Service seit 3 Tagen überfällig',
    buildingId: 'hallenbad-hechingen',
    buildingName: 'Hallenbad Hechingen',
    category: 'wartung',
    amount: 4340,
    threshold: 0,
    percentage: 100,
    timestamp: '2024-10-25T14:30:00Z',
    isResolved: false,
    actionRequired: 'Sofortige Zahlung veranlassen',
    recommendedAction: 'Buchhaltung kontaktieren und Zahlung freigeben'
  },
  {
    id: 'alert-003',
    type: 'cost-spike',
    severity: 'info',
    title: 'Kostenabweichung erkannt',
    message: 'Wartungskosten Gymnasium 15% über Durchschnitt',
    buildingId: 'gymnasium-hechingen',
    buildingName: 'Gymnasium Hechingen',
    category: 'wartung',
    amount: 3420,
    threshold: 2975,
    percentage: 115,
    timestamp: '2024-10-27T11:45:00Z',
    isResolved: false,
    actionRequired: 'Wartungsverträge prüfen',
    recommendedAction: 'Ursachen analysieren und Präventivmaßnahmen bewerten'
  }
];

// Financial Forecasts
export const mockFinancialForecasts: FinancialForecast[] = [
  {
    buildingId: 'hallenbad-hechingen',
    buildingName: 'Hallenbad Hechingen',
    category: 'energie',
    period: 'month',
    forecastData: [
      {
        period: '2024-11',
        predicted: 26800,
        confidence: 87,
        factors: { seasonal: 1.15, trend: 0.98, weather: 1.05, occupancy: 0.92, maintenance: 1.0 }
      },
      {
        period: '2024-12',
        predicted: 28900,
        confidence: 82,
        factors: { seasonal: 1.25, trend: 0.98, weather: 1.12, occupancy: 0.88, maintenance: 1.0 }
      },
      {
        period: '2025-01',
        predicted: 31200,
        confidence: 78,
        factors: { seasonal: 1.35, trend: 0.97, weather: 1.18, occupancy: 0.85, maintenance: 1.05 }
      }
    ],
    confidence: 82,
    methodology: 'Machine Learning mit historischen Daten',
    factors: ['Saisonalität', 'Wettertrend', 'Besucherzahlen', 'Wartungszyklen'],
    lastUpdated: '2024-10-28T12:00:00Z',
    projectedSavings: 12500,
    projectedCosts: 295000,
    variance: 8.5
  },
  {
    category: 'gesamt',
    period: 'quarter',
    forecastData: [
      {
        period: '2024-Q4',
        predicted: 95400,
        confidence: 85,
        factors: { seasonal: 1.12, trend: 0.96, weather: 1.08, occupancy: 0.91 }
      },
      {
        period: '2025-Q1',
        predicted: 102800,
        confidence: 79,
        factors: { seasonal: 1.18, trend: 0.95, weather: 1.15, occupancy: 0.87 }
      }
    ],
    confidence: 82,
    methodology: 'Regressionsanalyse mit Saisonkomponenten',
    factors: ['Gesamttrend', 'Wettermuster', 'Nutzungsverhalten'],
    lastUpdated: '2024-10-28T12:00:00Z',
    projectedSavings: 45000,
    projectedCosts: 1280000,
    variance: 6.2
  }
];

// Cost Breakdown
export const mockCostBreakdown: CostBreakdown = {
  period: 'month',
  startDate: '2024-10-01',
  endDate: '2024-10-31',
  totalCost: 98450,
  categories: {
    energie: {
      amount: 65280,
      percentage: 66.3,
      subcategories: {
        'Strom': 42500,
        'Gas': 18750,
        'Wasser': 4030
      },
      trend: -3.2,
      budget: 68000,
      variance: -4.0
    },
    wartung: {
      amount: 18950,
      percentage: 19.3,
      subcategories: {
        'Präventive Wartung': 12200,
        'Reparaturen': 6750
      },
      trend: 8.5,
      budget: 17500,
      variance: 8.3
    },
    personal: {
      amount: 7200,
      percentage: 7.3,
      subcategories: {
        'Energiemanager': 4800,
        'Hausmeister': 2400
      },
      trend: 0.0,
      budget: 7200,
      variance: 0.0
    },
    infrastruktur: {
      amount: 4850,
      percentage: 4.9,
      subcategories: {
        'LED Beleuchtung': 2850,
        'Sensoren': 2000
      },
      trend: -12.5,
      budget: 5500,
      variance: -11.8
    },
    optimierung: {
      amount: 1650,
      percentage: 1.7,
      subcategories: {
        'Software-Lizenzen': 850,
        'Beratung': 800
      },
      trend: 5.2,
      budget: 1600,
      variance: 3.1
    },
    sonstiges: {
      amount: 520,
      percentage: 0.5,
      subcategories: {
        'Verwaltung': 320,
        'Sonstiges': 200
      },
      trend: -15.6,
      budget: 600,
      variance: -13.3
    }
  },
  trends: {
    energieEffizienz: 0.265, // Euro per kWh
    wartungskosten: 8.5, // Euro per m²
    personalkosten: 3600 // Euro per employee
  },
  comparisons: {
    previousPeriod: -2.8,
    budget: -3.5,
    benchmark: -8.2
  }
};

// Dashboard Data
export const mockBudgetDashboardData: BudgetDashboardData = {
  overview: {
    totalBudget: 1244000,
    totalSpent: 1018450,
    totalRemaining: 225550,
    budgetUtilization: 81.9,
    overBudgetBuildings: 0,
    criticalAlerts: 1
  },
  buildingBudgets: mockBudgets,
  categoryBreakdown: {
    'energie': {
      allocated: 750000,
      spent: 612820,
      variance: -18.3
    },
    'wartung': {
      allocated: 165000,
      spent: 148750,
      variance: -9.8
    },
    'personal': {
      allocated: 89000,
      spent: 71200,
      variance: -20.0
    },
    'infrastruktur': {
      allocated: 185000,
      spent: 142450,
      variance: -23.0
    },
    'optimierung': {
      allocated: 35000,
      spent: 28650,
      variance: -18.1
    },
    'sonstiges': {
      allocated: 20000,
      spent: 14580,
      variance: -27.1
    }
  },
  monthlyTrends: [
    { month: 'Jan', budget: 103667, actual: 92737, forecast: 104208 },
    { month: 'Feb', budget: 103667, actual: 89324, forecast: 101543 },
    { month: 'Mar', budget: 103667, actual: 95874, forecast: 98756 },
    { month: 'Apr', budget: 103667, actual: 91245, forecast: 96234 },
    { month: 'Mai', budget: 103667, actual: 88956, forecast: 94512 },
    { month: 'Jun', budget: 103667, actual: 93421, forecast: 95687 },
    { month: 'Jul', budget: 103667, actual: 97832, forecast: 98234 },
    { month: 'Aug', budget: 103667, actual: 95214, forecast: 99654 },
    { month: 'Sep', budget: 103667, actual: 98751, forecast: 102145 },
    { month: 'Okt', budget: 103667, actual: 98450, forecast: 104208 },
    { month: 'Nov', budget: 103667, actual: 0, forecast: 106234 },
    { month: 'Dez', budget: 103667, actual: 0, forecast: 108567 }
  ],
  topExpenses: mockExpenses.slice(0, 5),
  roiProjects: mockROIProjects,
  alerts: mockBudgetAlerts,
  forecasts: mockFinancialForecasts
};

// Report Data
export const mockBudgetReportData: BudgetReportData = {
  reportType: 'monthly',
  period: {
    start: '2024-10-01',
    end: '2024-10-31'
  },
  summary: {
    totalBudget: 103667,
    totalActual: 98450,
    variance: -5217,
    variancePercentage: -5.03,
    savingsAchieved: 8750,
    roiProjects: 3
  },
  buildingPerformance: [
    {
      buildingId: 'hallenbad-hechingen',
      buildingName: 'Hallenbad Hechingen',
      budget: 36250,
      actual: 35420,
      variance: -830,
      efficiency: 97.7,
      recommendations: ['Wärmepumpe-Installation priorisieren', 'Pool-Abdeckung optimieren']
    },
    {
      buildingId: 'gymnasium-hechingen',
      buildingName: 'Gymnasium Hechingen',
      budget: 18167,
      actual: 16890,
      variance: -1277,
      efficiency: 93.0,
      recommendations: ['Gebäudeautomation planen', 'Lüftungszeiten optimieren']
    },
    {
      buildingId: 'rathaus-hechingen',
      buildingName: 'Rathaus Hechingen',
      budget: 9833,
      actual: 8745,
      variance: -1088,
      efficiency: 89.0,
      recommendations: ['LED-Erfolg weiter ausbauen', 'Heizungsoptimierung prüfen']
    }
  ],
  categoryAnalysis: {
    'energie': {
      budget: 62500,
      actual: 58260,
      variance: -4240,
      trend: 'improving',
      keyMetrics: {
        'kWh pro Euro': 3.8,
        'Effizienzsteigerung': 12.5,
        'CO2-Reduktion': 1240
      }
    },
    'wartung': {
      budget: 13750,
      actual: 15820,
      variance: 2070,
      trend: 'declining',
      keyMetrics: {
        'Ungeplante Reparaturen': 6750,
        'Präventive Wartung': 9070,
        'Ausfallzeiten': 48
      }
    }
  },
  costDrivers: [
    {
      factor: 'Saisonale Heizkosten',
      impact: 12500,
      percentage: 12.7,
      trend: 'up'
    },
    {
      factor: 'Strompreissteigerung',
      impact: 8750,
      percentage: 8.9,
      trend: 'up'
    },
    {
      factor: 'LED-Einsparungen',
      impact: -4200,
      percentage: -4.3,
      trend: 'down'
    }
  ],
  recommendations: [
    {
      priority: 'high',
      category: 'energie',
      description: 'Wärmepumpen-Installation im Hallenbad beschleunigen',
      potentialSavings: 32000,
      implementationEffort: 'high'
    },
    {
      priority: 'medium',
      category: 'wartung',
      description: 'Präventive Wartungsintervalle optimieren',
      potentialSavings: 5600,
      implementationEffort: 'low'
    },
    {
      priority: 'medium',
      category: 'infrastruktur',
      description: 'Smart Building Systeme in weiteren Gebäuden',
      potentialSavings: 15800,
      implementationEffort: 'medium'
    }
  ]
};

// Export all mock data
export const budgetMockData = {
  budgets: mockBudgets,
  expenses: mockExpenses,
  vendors: mockVendors,
  roiProjects: mockROIProjects,
  alerts: mockBudgetAlerts,
  forecasts: mockFinancialForecasts,
  costBreakdown: mockCostBreakdown,
  dashboardData: mockBudgetDashboardData,
  reportData: mockBudgetReportData
};