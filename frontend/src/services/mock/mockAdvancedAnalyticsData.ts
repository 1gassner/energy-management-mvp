import type { 
  AdvancedAnalyticsData, TimeSeriesPoint, DrillDownChartData
} from '@/types';

// Utility functions for generating realistic mock data
const generateTimeSeriesData = (
  startDate: string, 
  endDate: string, 
  baseValue: number,
  seasonalFactor: number = 0.3,
  trendFactor: number = 0.1,
  noiseFactor: number = 0.1
): TimeSeriesPoint[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data: TimeSeriesPoint[] = [];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const seasonal = Math.sin((dayOfYear / 365) * 2 * Math.PI) * seasonalFactor;
    const trend = (dayOfYear / 365) * trendFactor;
    const noise = (Math.random() - 0.5) * noiseFactor;
    
    data.push({
      timestamp: d.toISOString().split('T')[0],
      value: Math.round(baseValue * (1 + seasonal + trend + noise)),
      predicted: Math.round(baseValue * (1 + seasonal + trend + noise * 0.5)),
      confidence: 85 + Math.random() * 10,
      anomaly: Math.random() < 0.05, // 5% chance of anomaly
      factors: {
        weather: Math.random() * 0.4,
        occupancy: Math.random() * 0.3,
        seasonal: seasonal,
        trend: trend
      }
    });
  }
  
  return data;
};

const generateBuildingData = (buildingId: string, buildingName: string, baseConsumption: number) => {
  return {
    consumptionTrend: {
      buildingId,
      buildingName,
      period: '2024-03',
      consumption: Math.round(baseConsumption + (Math.random() - 0.5) * baseConsumption * 0.2),
      trend: (Math.random() > 0.5 ? 'decreasing' : 'increasing') as 'decreasing' | 'increasing' | 'stable',
      trendPercentage: (Math.random() - 0.5) * 20,
      comparison: {
        previousPeriod: Math.round(baseConsumption * (1 + (Math.random() - 0.5) * 0.1)),
        yearOverYear: Math.round(baseConsumption * (1 + (Math.random() - 0.5) * 0.15)),
        budget: Math.round(baseConsumption * 1.1)
      },
      factors: ['weather', 'occupancy', 'optimization'],
      seasonalAdjusted: Math.round(baseConsumption * 0.95)
    },
    forecast: {
      buildingId,
      buildingName,
      forecastPeriod: '2024-04',
      predictedConsumption: Math.round(baseConsumption * (0.9 + Math.random() * 0.2)),
      confidence: 85 + Math.random() * 10,
      factors: {
        weather: 0.25 + Math.random() * 0.15,
        occupancy: 0.2 + Math.random() * 0.2,
        seasonal: 0.3 + Math.random() * 0.1,
        trend: 0.1 + Math.random() * 0.1
      },
      scenarios: {
        optimistic: Math.round(baseConsumption * 0.8),
        realistic: Math.round(baseConsumption * 0.9),
        pessimistic: Math.round(baseConsumption * 1.0)
      }
    },
    benchmark: {
      buildingId,
      buildingName,
      kpiScores: {
        energyEfficiency: 70 + Math.random() * 25,
        costEfficiency: 75 + Math.random() * 20,
        sustainability: 70 + Math.random() * 25,
        automation: 60 + Math.random() * 30,
        maintenance: 80 + Math.random() * 15,
        userSatisfaction: 80 + Math.random() * 15
      },
      overallScore: 75 + Math.random() * 15,
      rank: Math.floor(Math.random() * 7) + 1,
      percentile: 50 + Math.random() * 45,
      topPerformer: Math.random() > 0.7,
      improvementAreas: ['Automatisierung', 'Energieeffizienz'].slice(0, Math.floor(Math.random() * 2) + 1)
    }
  };
};

// Building configurations
const buildings = [
  { id: '1', name: 'Rathaus', baseConsumption: 45000 },
  { id: '2', name: 'Grundschule', baseConsumption: 38000 },
  { id: '3', name: 'Realschule', baseConsumption: 42000 },
  { id: '4', name: 'Gymnasium', baseConsumption: 55000 },
  { id: '5', name: 'Werkrealschule', baseConsumption: 35000 },
  { id: '6', name: 'Hallenbad', baseConsumption: 125000 },
  { id: '7', name: 'Sporthallen', baseConsumption: 28000 }
];

// Generate building-specific data
const buildingData = buildings.map(building => generateBuildingData(building.id, building.name, building.baseConsumption));

export const generateMockAdvancedAnalyticsData = (): AdvancedAnalyticsData => {
  // Date reference for future time-based calculations
  // const currentDate = new Date();
  // const lastYear = new Date(currentDate.getFullYear() - 1, 0, 1);
  
  return {
    overview: {
      totalEnergyConsumed: buildingData.reduce((sum, b) => sum + b.consumptionTrend.consumption, 0),
      totalCostSavings: 180000 + Math.random() * 50000,
      co2ReductionTotal: 1250 + Math.random() * 300,
      efficiencyImprovement: 15 + Math.random() * 10,
      buildingsOptimized: 7,
      activeInsights: 20 + Math.floor(Math.random() * 10),
      lastUpdated: new Date().toISOString(),
      dataQualityScore: 90 + Math.random() * 8,
      coveragePeriod: {
        start: '2024-01-01',
        end: '2024-12-31'
      }
    },

    energyAnalytics: {
      consumptionTrends: buildingData.map(b => b.consumptionTrend),
      
      usagePatterns: [{
        patternType: 'hourly',
        data: Array.from({ length: 24 }, (_, i) => ({
          period: `${i.toString().padStart(2, '0')}:00`,
          consumption: Math.round(50 + 40 * Math.sin(((i - 6) * Math.PI) / 12) + Math.random() * 10),
          efficiency: Math.round(70 + 20 * Math.sin(((i - 8) * Math.PI) / 10) + Math.random() * 5),
          occupancyFactor: Math.round(Math.max(0, 10 + 80 * Math.sin(((i - 7) * Math.PI) / 11))),
          weatherFactor: Math.round(80 + 15 * Math.sin(((i - 12) * Math.PI) / 6))
        })),
        insights: [
          'Hauptverbrauchszeit zwischen 8-18 Uhr identifiziert',
          'Effizienz ist nachmittags am höchsten',
          'Wettereinfluss verstärkt sich in den Abendstunden',
          'Potentielle Lastverschiebung in Nachtstunden möglich'
        ],
        recommendations: [
          'Lastverschiebung in Nachtstunden (22-06 Uhr)',
          'Automatische Dimmung nach 18 Uhr implementieren',
          'Standby-Modus für nicht kritische Systeme aktivieren'
        ],
        confidence: 88.5 + Math.random() * 8
      }, {
        patternType: 'weekly',
        data: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map(day => ({
          period: day,
          consumption: Math.round(200 + 100 * (Math.random() - 0.3)),
          efficiency: Math.round(75 + 15 * (Math.random() - 0.5)),
          occupancyFactor: day === 'Samstag' || day === 'Sonntag' ? Math.round(20 + Math.random() * 30) : Math.round(70 + Math.random() * 25),
          weatherFactor: Math.round(80 + Math.random() * 20)
        })),
        insights: [
          'Wochenendverbrauch 40% niedriger als Werktage',
          'Freitags höchste Effizienz durch optimierte Nutzung',
          'Montagsspitzen durch Wiedereinschalten der Systeme'
        ],
        recommendations: [
          'Wochenend-Standby-Programme erweitern',
          'Montagsoptimierung durch sanftes Hochfahren'
        ],
        confidence: 91.2
      }],

      efficiencyMetrics: buildings.map(building => ({
        buildingId: building.id,
        buildingName: building.name,
        currentEfficiency: 70 + Math.random() * 25,
        targetEfficiency: 85 + Math.random() * 10,
        improvement: Math.random() * 20,
        benchmarkScore: 60 + Math.random() * 35,
        factors: {
          heating: 70 + Math.random() * 25,
          cooling: 65 + Math.random() * 30,
          lighting: 80 + Math.random() * 15,
          equipment: 75 + Math.random() * 20,
          envelope: 60 + Math.random() * 35
        },
        recommendations: []
      })),

      costAnalysis: {
        totalCosts: 850000 + Math.random() * 100000,
        costPerKwh: 0.32 + Math.random() * 0.08,
        costTrends: Array.from({ length: 12 }, (_, i) => ({
          period: new Date(2024, i, 1).toLocaleDateString('de-DE', { month: 'short' }),
          total: Math.round(70000 + 15000 * Math.sin((i * Math.PI) / 6) + Math.random() * 10000),
          perKwh: 0.32 + 0.05 * Math.sin((i * Math.PI) / 6) + (Math.random() - 0.5) * 0.02,
          savings: Math.round(5000 + 3000 * Math.sin((i * Math.PI) / 6) + Math.random() * 2000)
        })),
        costDrivers: [
          { factor: 'Strompreise', impact: 45000, percentage: 52.8 },
          { factor: 'Heizkosten', impact: 28000, percentage: 32.9 },
          { factor: 'Wartungskosten', impact: 8500, percentage: 10.0 },
          { factor: 'Sonstige', impact: 3500, percentage: 4.1 }
        ],
        savingsOpportunities: [
          { description: 'Lastverschiebung in Nachtstunden', potentialSavings: 25000, implementationCost: 8000, paybackPeriod: 3.8 },
          { description: 'LED-Umrüstung verbliebener Bereiche', potentialSavings: 12000, implementationCost: 35000, paybackPeriod: 35 },
          { description: 'Smart Building Automation', potentialSavings: 35000, implementationCost: 85000, paybackPeriod: 29 }
        ]
      },

      seasonalVariations: ['spring', 'summer', 'autumn', 'winter'].map((season, i) => ({
        season: season as any,
        averageConsumption: Math.round(300000 + 50000 * Math.sin((i * Math.PI) / 2)),
        peakConsumption: Math.round(380000 + 60000 * Math.sin((i * Math.PI) / 2)),
        efficiency: Math.round(75 + 10 * Math.cos((i * Math.PI) / 2)),
        costs: Math.round(95000 + 15000 * Math.sin((i * Math.PI) / 2)),
        weatherImpact: Math.round(Math.abs(Math.sin((i * Math.PI) / 2)) * 35 + 10),
        adjustmentFactors: {
          heating: season === 'winter' ? 1.4 : season === 'summer' ? 0.3 : 0.8,
          cooling: season === 'summer' ? 1.6 : season === 'winter' ? 0.1 : 0.5,
          lighting: season === 'winter' ? 1.2 : 0.8
        }
      })),

      peakDemandAnalysis: {
        currentPeak: 285 + Math.random() * 30,
        predictedPeak: 295 + Math.random() * 25,
        peakTimes: ['08:30', '12:00', '17:30'],
        demandCharges: 4500 + Math.random() * 1500,
        loadShiftingPotential: 12 + Math.random() * 8,
        strategies: [
          { strategy: 'Lastverschiebung Warmwasserbereitung', potentialReduction: 15, cost: 12000 },
          { strategy: 'Batteriespeicher-Ausbau', potentialReduction: 25, cost: 85000 },
          { strategy: 'Demand Response System', potentialReduction: 20, cost: 45000 }
        ]
      },

      baselineComparison: {
        baselineYear: 2023,
        currentYear: 2024,
        improvements: {
          consumption: -8.5 - Math.random() * 5,
          costs: -12.3 - Math.random() * 8,
          efficiency: 12.8 + Math.random() * 8,
          co2: -18.2 - Math.random() * 6
        },
        buildingComparisons: buildingData.map((b, i) => ({
          buildingId: b.consumptionTrend.buildingId,
          buildingName: b.consumptionTrend.buildingName,
          improvement: (Math.random() - 0.3) * 25,
          rank: i + 1
        }))
      },

      weatherCorrelation: {
        correlationCoefficient: 0.72 + Math.random() * 0.15,
        weatherFactors: [
          { factor: 'temperature', correlation: 0.78, impact: 35 },
          { factor: 'humidity', correlation: 0.45, impact: 15 },
          { factor: 'solar', correlation: -0.32, impact: 20 },
          { factor: 'wind', correlation: 0.18, impact: 8 }
        ],
        seasonalAdjustments: {
          'spring': 0.95,
          'summer': 0.85,
          'autumn': 1.05,
          'winter': 1.25
        },
        degreesDays: {
          heating: 2850 + Math.random() * 500,
          cooling: 450 + Math.random() * 200
        }
      }
    },

    predictiveModels: {
      consumptionForecast: buildingData.map(b => b.forecast),
      
      maintenancePredictions: [
        {
          equipmentId: 'HVAC-001',
          equipmentType: 'Heizungs-/Lüftungsanlage',
          buildingId: '3',
          predictedFailureDate: '2024-05-15',
          probability: 78,
          riskLevel: 'medium',
          recommendedAction: 'Präventive Wartung der Pumpen und Filter',
          costImpact: 8500,
          energyImpact: 15000
        },
        {
          equipmentId: 'LED-CTRL-12',
          equipmentType: 'Beleuchtungssteuerung',
          buildingId: '1',
          predictedFailureDate: '2024-06-22',
          probability: 45,
          riskLevel: 'low',
          recommendedAction: 'Überwachung der Steuerungsmodule',
          costImpact: 2500,
          energyImpact: 3000
        }
      ],

      costForecasts: Array.from({ length: 6 }, (_, i) => ({
        period: new Date(2024, new Date().getMonth() + i, 1).toLocaleDateString('de-DE', { year: 'numeric', month: 'short' }),
        predictedCost: Math.round(75000 + 10000 * Math.sin((i * Math.PI) / 6) + Math.random() * 5000),
        confidence: 85 + Math.random() * 10,
        drivers: [
          { factor: 'Energiepreise', impact: 0.6 + Math.random() * 0.2 },
          { factor: 'Witterung', impact: 0.25 + Math.random() * 0.15 },
          { factor: 'Verbrauchstrend', impact: 0.15 + Math.random() * 0.1 }
        ],
        savingsOpportunities: Math.round(5000 + Math.random() * 3000),
        budgetVariance: (Math.random() - 0.5) * 15
      })),

      demandPredictions: Array.from({ length: 48 }, (_, i) => ({
        timestamp: new Date(Date.now() + i * 30 * 60 * 1000).toISOString(),
        predictedDemand: Math.round(150 + 80 * Math.sin((i * Math.PI) / 12) + Math.random() * 20),
        peakProbability: Math.max(0, Math.sin((i * Math.PI) / 12) - 0.7) * 100,
        loadShiftingRecommendation: i % 12 < 6 ? 'Verbrauch erhöhen möglich' : 'Lastverschiebung empfohlen',
        costImplication: Math.round((150 + 80 * Math.sin((i * Math.PI) / 12)) * 0.35)
      })),

      anomalyPredictions: [
        {
          type: 'consumption',
          probability: 23,
          expectedImpact: 15000,
          preventiveActions: ['Überwachung der Heizungssteuerung verstärken', 'Temperaturgrenzwerte anpassen'],
          monitoringRecommendations: ['Stündliche Verbrauchsüberwachung', 'Automatische Benachrichtigung bei Abweichungen']
        },
        {
          type: 'efficiency',
          probability: 18,
          expectedImpact: 8500,
          preventiveActions: ['Wartungsintervalle verkürzen', 'Sensorkalibrierung prüfen'],
          monitoringRecommendations: ['Effizienz-KPIs täglich überprüfen']
        }
      ],

      optimizationPotentials: buildings.map(building => ({
        buildingId: building.id,
        buildingName: building.name,
        category: 'Heizungsoptimierung',
        potentialSavings: {
          kwh: Math.round(building.baseConsumption * 0.08 + Math.random() * building.baseConsumption * 0.05),
          euro: Math.round(building.baseConsumption * 0.08 * 0.35 + Math.random() * building.baseConsumption * 0.02),
          co2: Math.round(building.baseConsumption * 0.08 * 0.5 / 1000)
        },
        implementationComplexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        paybackPeriod: 12 + Math.random() * 24,
        confidence: 80 + Math.random() * 15
      })),

      modelAccuracy: {
        consumptionModel: 88.5 + Math.random() * 8,
        costModel: 85.2 + Math.random() * 8,
        maintenanceModel: 82.1 + Math.random() * 8,
        overallAccuracy: 85.3 + Math.random() * 5,
        lastValidation: '2024-03-15T00:00:00Z',
        validationMetrics: {
          rmse: 2.1 + Math.random() * 0.5,
          mae: 1.6 + Math.random() * 0.4,
          r2: 0.85 + Math.random() * 0.1
        }
      },

      confidenceIntervals: [
        { metric: 'Monatsverbrauch', prediction: 368000, lowerBound: 345000, upperBound: 391000, confidence: 90 },
        { metric: 'Monatskosten', prediction: 128500, lowerBound: 119000, upperBound: 138000, confidence: 85 },
        { metric: 'Spitzenlast', prediction: 295, lowerBound: 275, upperBound: 315, confidence: 80 }
      ]
    },

    benchmarkData: {
      buildingComparisons: buildingData.map(b => b.benchmark),
      
      industryBenchmarks: [
        { category: 'Energieeffizienz (kWh/m²)', municipalAverage: 120, industryBest: 85, currentValue: 98, gap: -13, gapPercentage: -11.7, targetValue: 90, timeToTarget: 18 },
        { category: 'Kosteneffizienz (€/kWh)', municipalAverage: 0.38, industryBest: 0.29, currentValue: 0.34, gap: -0.05, gapPercentage: -14.7, targetValue: 0.31, timeToTarget: 12 },
        { category: 'CO₂-Intensität (kg/kWh)', municipalAverage: 0.45, industryBest: 0.28, currentValue: 0.38, gap: -0.10, gapPercentage: -26.3, targetValue: 0.32, timeToTarget: 24 }
      ],

      performanceRankings: [
        {
          metric: 'Energieeffizienz',
          rankings: buildingData.map((b, i) => ({
            buildingId: b.benchmark.buildingId,
            buildingName: b.benchmark.buildingName,
            value: b.benchmark.kpiScores.energyEfficiency,
            rank: i + 1,
            percentile: Math.round((7 - i) / 7 * 100),
            trendDirection: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down'
          }))
        }
      ],

      bestPractices: [
        {
          id: 'bp-001',
          title: 'Bedarfsgeführte Lüftungssteuerung',
          description: 'CO₂-gesteuerte Lüftung reduziert Energieverbrauch bei gleichbleibender Luftqualität',
          category: 'Lüftung',
          implementedBy: ['1', '3'],
          notImplementedBy: ['2', '4', '5', '6', '7'],
          potentialImpact: 15,
          implementationEffort: 'medium',
          evidence: ['12% Energieeinsparung in Rathaus', '8% Reduktion in Realschule']
        },
        {
          id: 'bp-002',
          title: 'Präsenzgesteuerte Beleuchtung',
          description: 'Automatische Beleuchtungssteuerung mit Präsenz- und Tageslichterkennern',
          category: 'Beleuchtung',
          implementedBy: ['1', '3', '4'],
          notImplementedBy: ['2', '5', '6', '7'],
          potentialImpact: 22,
          implementationEffort: 'low',
          evidence: ['25% Stromeinsparung Beleuchtung', 'ROI nach 2.1 Jahren']
        }
      ],

      gapAnalysis: buildingData.map(b => ({
        buildingId: b.benchmark.buildingId,
        buildingName: b.benchmark.buildingName,
        performanceGaps: [
          {
            metric: 'Energieeffizienz',
            current: b.benchmark.kpiScores.energyEfficiency,
            target: 90,
            gap: 90 - b.benchmark.kpiScores.energyEfficiency,
            priority: (90 - b.benchmark.kpiScores.energyEfficiency) > 15 ? 'high' : 'medium',
            recommendedActions: ['Heizungsoptimierung', 'Dämmungsverbesserung']
          },
          {
            metric: 'Automatisierung',
            current: b.benchmark.kpiScores.automation,
            target: 85,
            gap: 85 - b.benchmark.kpiScores.automation,
            priority: (85 - b.benchmark.kpiScores.automation) > 20 ? 'high' : 'medium',
            recommendedActions: ['Smart Building System', 'Sensorik erweitern']
          }
        ],
        overallGapScore: Math.round((90 - b.benchmark.overallScore) / 90 * 100)
      })),

      improvementOpportunities: buildingData.slice(0, 3).map(b => ({
        buildingId: b.benchmark.buildingId,
        buildingName: b.benchmark.buildingName,
        opportunity: 'Heizungsmodernisierung mit Wärmepumpe',
        category: 'Heizung',
        priority: 'high',
        potentialImpact: {
          energy: Math.round(b.consumptionTrend.consumption * 0.25),
          cost: Math.round(b.consumptionTrend.consumption * 0.25 * 0.35),
          co2: Math.round(b.consumptionTrend.consumption * 0.25 * 0.5 / 1000)
        },
        implementationPlan: {
          steps: ['Machbarkeitsstudie', 'Ausschreibung', 'Installation', 'Inbetriebnahme'],
          timeline: '8-12 Monate',
          resources: ['Externe Planung', 'Handwerker', 'Projektleitung']
        },
        roi: 6.5 + Math.random() * 3
      }))
    },

    aiInsights: {
      insights: [
        {
          id: 'insight-001',
          type: 'optimization',
          title: 'HVAC-Optimierung im Hallenbad identifiziert',
          description: 'Intelligente Temperaturregelung basierend auf Nutzungszeiten und Besucherzahlen kann signifikante Einsparungen erzielen',
          confidence: 94.2,
          impact: 'high',
          category: 'Energieeffizienz',
          buildingId: '6',
          buildingName: 'Hallenbad',
          evidence: [
            'Verbrauchsmuster-Analyse zeigt Überhitzung in Nebenzeiten',
            'Korrelation zwischen Besucherzahlen und optimaler Temperatur',
            'Erfolgreiche Implementierung in vergleichbaren Einrichtungen'
          ],
          generatedAt: '2024-03-20T10:30:00Z',
          status: 'new',
          potentialSavings: {
            energy: 18500,
            cost: 6475,
            co2: 9.25
          }
        },
        {
          id: 'insight-002',
          type: 'anomaly',
          title: 'Anomalie im Grundschul-Verbrauchsmuster',
          description: 'Jeden Dienstag um 14:00 Uhr tritt ein ungewöhnlicher Stromverbrauchspeak auf, der nicht durch normale Nutzung erklärbar ist',
          confidence: 87.5,
          impact: 'medium',
          category: 'Betrieb',
          buildingId: '2',
          buildingName: 'Grundschule',
          evidence: [
            'Wiederkehrendes Muster über 8 Wochen beobachtet',
            'Keine Korrelation mit Unterrichtsplan oder Veranstaltungen',
            'Verbrauchsanstieg um 35% über Baseline'
          ],
          generatedAt: '2024-03-19T15:45:00Z',
          status: 'new'
        },
        {
          id: 'insight-003',
          type: 'cost',
          title: 'Lastverschiebungspotential bei Warmwasserbereitung',
          description: 'Verlegung der Warmwasserbereitung in günstige Nachtstromtarife kann erhebliche Kosteneinsparungen bringen',
          confidence: 91.8,
          impact: 'high',
          category: 'Kosten',
          buildingId: '1',
          buildingName: 'Rathaus',
          evidence: [
            'Analyse der Tarifstrukturen zeigt 40% Preisunterschied',
            'Warmwasserspeicher-Kapazität ausreichend für Pufferung',
            'Technische Machbarkeit durch vorhandene Steuerungstechnik'
          ],
          generatedAt: '2024-03-18T09:15:00Z',
          status: 'reviewed',
          potentialSavings: {
            energy: 0,
            cost: 3360,
            co2: 0
          }
        },
        {
          id: 'insight-004',
          type: 'efficiency',
          title: 'Beleuchtungseffizienz-Optimierung möglich',
          description: 'Adaptive Beleuchtungssteuerung mit Tageslicht- und Präsenzsensoren kann die Beleuchtungskosten um 30% reduzieren',
          confidence: 89.3,
          impact: 'medium',
          category: 'Beleuchtung',
          evidence: [
            'Lichtmessungen zeigen Über-Beleuchtung in 60% der Räume',
            'Präsenzanalyse zeigt ungenutzter Beleuchtung',
            'ROI-Analyse bestätigt Wirtschaftlichkeit'
          ],
          generatedAt: '2024-03-17T14:20:00Z',
          status: 'new',
          potentialSavings: {
            energy: 12800,
            cost: 4480,
            co2: 6.4
          }
        }
      ],

      recommendations: [
        {
          id: 'rec-001',
          title: 'Implementierung eines zentralen Energiemanagementsystems',
          description: 'Ein übergreifendes System zur Überwachung und Steuerung aller Gebäude kann die Effizienz um 15-20% steigern',
          category: 'Infrastruktur',
          priority: 'high',
          confidenceScore: 92.5,
          implementationComplexity: 'complex',
          expectedImpact: {
            energy: 45000,
            cost: 15750,
            timeframe: '12-18 Monate'
          },
          prerequisites: ['Budget-Freigabe', 'IT-Infrastruktur', 'Personalschulung'],
          steps: [
            'Systemanalyse und Anforderungsdefinition',
            'Ausschreibung und Anbieterauswahl',
            'Pilot-Installation in 2 Gebäuden',
            'Vollständige Implementierung',
            'Schulung und Optimierung'
          ],
          risks: ['Komplexität der Integration', 'Personalaufwand', 'Technische Herausforderungen'],
          alternatives: ['Schrittweise Modernisierung pro Gebäude', 'Cloud-basierte Lösung'],
          buildingIds: ['1', '2', '3', '4', '5', '6', '7']
        }
      ],

      patterns: [
        {
          patternType: 'consumption',
          description: 'Wöchentlicher Zyklus mit 40% niedrigerem Verbrauch am Wochenende',
          frequency: 'weekly',
          strength: 0.85,
          buildingsAffected: ['1', '2', '3', '4', '5'],
          correlatedFactors: ['Gebäudenutzung', 'Heizungssteuerung', 'Beleuchtung'],
          actionableInsights: [
            'Automatisierte Wochenend-Absenkung implementieren',
            'Standby-Modi für nicht kritische Systeme',
            'Zeitgesteuerte Systemabschaltung'
          ],
          predictionAccuracy: 91.2
        },
        {
          patternType: 'efficiency',
          description: 'Saisonale Effizienzzyklen mit bestem Wirkungsgrad im Frühjahr/Herbst',
          frequency: 'seasonal',
          strength: 0.72,
          buildingsAffected: ['1', '2', '3', '4', '5', '6', '7'],
          correlatedFactors: ['Außentemperatur', 'Heiz-/Kühlbedarf', 'Tageslichtanteil'],
          actionableInsights: [
            'Wartungszyklen an Effizienzoptima anpassen',
            'Präventive Systemoptimierung vor Hochlast-Perioden'
          ],
          predictionAccuracy: 87.8
        }
      ],

      alerts: [
        {
          id: 'alert-001',
          type: 'performance_degradation',
          severity: 'warning',
          title: 'Effizienzabfall im Gymnasium',
          message: 'Die Energieeffizienz ist in den letzten 2 Wochen um 8% gesunken',
          buildingId: '4',
          buildingName: 'Gymnasium',
          detectedAt: '2024-03-20T09:30:00Z',
          confidence: 85.5,
          recommendedActions: [
            'HVAC-System überprüfen',
            'Filterwechsel veranlassen',
            'Sensorkalibrierung prüfen'
          ],
          estimatedImpact: 2500,
          isResolved: false,
          falsePositiveProbability: 12
        }
      ],

      automationSuggestions: [
        {
          id: 'auto-001',
          title: 'Automatische Lastverschiebung bei Spitzenverbrauch',
          description: 'Bei Überschreitung der Spitzenlast automatische Reduzierung nicht-kritischer Verbraucher',
          category: 'energy_management',
          complexity: 'moderate',
          buildingIds: ['1', '3', '6'],
          expectedBenefits: {
            energySavings: 0,
            costSavings: 8500,
            timeReduction: 15
          },
          implementationSteps: [
            'Identifikation nicht-kritischer Verbraucher',
            'Installation Smart-Meter und Steuerungstechnik',
            'Programmierung Automatisierungslogik',
            'Testing und Optimierung'
          ],
          requiredResources: ['Elektriker', 'Programmierung', 'Steuerungstechnik'],
          riskAssessment: 'Niedrig - bewährte Technologie',
          roi: 8.2
        }
      ],

      learningProgress: {
        modelVersion: 'v2.1.3',
        trainingDataSize: 2850000,
        accuracyMetrics: {
          consumption: 91.5,
          cost: 88.9,
          efficiency: 89.7,
          maintenance: 85.8
        },
        improvementRate: 2.8,
        lastTraining: '2024-03-15T00:00:00Z',
        nextTraining: '2024-04-15T00:00:00Z',
        dataQuality: 94.5,
        biasMetrics: {
          'Rathaus': 0.95,
          'Grundschule': 1.02,
          'Hallenbad': 0.98,
          'Gymnasium': 1.01
        }
      }
    },

    kpiMetrics: {
      energyKPIs: [
        {
          name: 'Gesamtverbrauch',
          currentValue: buildingData.reduce((sum, b) => sum + b.consumptionTrend.consumption, 0),
          targetValue: 2200000,
          unit: 'kWh',
          trend: 'improving',
          trendPercentage: -8.5,
          benchmark: 2600000,
          performance: 'good',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Energieeffizienz',
          currentValue: 87.3,
          targetValue: 90,
          unit: '%',
          trend: 'improving',
          trendPercentage: 5.2,
          benchmark: 82,
          performance: 'good',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Erneuerbarer Anteil',
          currentValue: 42.8,
          targetValue: 50,
          unit: '%',
          trend: 'improving',
          trendPercentage: 12.5,
          benchmark: 35,
          performance: 'excellent',
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'Spitzenlast',
          currentValue: 285,
          targetValue: 250,
          unit: 'kW',
          trend: 'stable',
          trendPercentage: -1.2,
          benchmark: 320,
          performance: 'good',
          lastUpdated: new Date().toISOString()
        }
      ],

      financialKPIs: [
        {
          name: 'Energiekosten',
          currentValue: 850000,
          targetValue: 750000,
          unit: '€',
          trend: 'improving',
          budgetVariance: -12.5,
          roi: 15.8,
          paybackPeriod: 3.2
        },
        {
          name: 'Kosteneinsparungen',
          currentValue: 180000,
          targetValue: 200000,
          unit: '€',
          trend: 'improving',
          budgetVariance: 22.5,
          roi: 25.3,
          paybackPeriod: 2.8
        }
      ],

      operationalKPIs: [
        {
          name: 'Systemverfügbarkeit',
          currentValue: 99.2,
          targetValue: 99.5,
          unit: '%',
          efficiency: 98.8,
          availability: 99.2,
          reliability: 97.5,
          maintenanceScore: 92.3
        },
        {
          name: 'Störungsrate',
          currentValue: 0.8,
          targetValue: 0.5,
          unit: 'pro Monat',
          efficiency: 85.2,
          availability: 98.9,
          reliability: 94.1,
          maintenanceScore: 88.7
        }
      ],

      sustainabilityKPIs: [
        {
          name: 'CO₂-Emissionen',
          currentValue: 980,
          targetValue: 800,
          unit: 't CO₂',
          co2Reduction: 22.1,
          renewablePercentage: 42.8,
          sustainabilityScore: 78.5,
          certificationLevel: 'Silber'
        },
        {
          name: 'Nachhaltigkeit-Index',
          currentValue: 78.5,
          targetValue: 85,
          unit: 'Punkte',
          co2Reduction: 22.1,
          renewablePercentage: 42.8,
          sustainabilityScore: 78.5,
          certificationLevel: 'Silber'
        }
      ],

      userExperienceKPIs: [
        {
          name: 'Raumklima-Zufriedenheit',
          currentValue: 4.2,
          targetValue: 4.5,
          unit: '(1-5)',
          satisfactionScore: 84,
          comfortLevel: 87,
          complaintCount: 3,
          responseTime: 2.5
        },
        {
          name: 'Beschwerdenrate',
          currentValue: 3,
          targetValue: 2,
          unit: 'pro Monat',
          satisfactionScore: 84,
          comfortLevel: 87,
          complaintCount: 3,
          responseTime: 2.5
        }
      ],

      overallPerformance: {
        overallScore: 85.7,
        energyScore: 89.1,
        financialScore: 87.3,
        operationalScore: 88.9,
        sustainabilityScore: 78.5,
        userExperienceScore: 85.2,
        improvementRate: 6.8,
        benchmarkPosition: 12
      }
    },

    timeSeriesData: {
      consumptionTimeSeries: generateTimeSeriesData('2024-01-01', '2024-03-20', 12000, 0.3, -0.1, 0.15),
      efficiencyTimeSeries: generateTimeSeriesData('2024-01-01', '2024-03-20', 75, 0.2, 0.1, 0.1),
      costTimeSeries: generateTimeSeriesData('2024-01-01', '2024-03-20', 4200, 0.25, 0.05, 0.12),
      co2TimeSeries: generateTimeSeriesData('2024-01-01', '2024-03-20', 6, 0.3, -0.15, 0.1),
      
      correlation: {
        variables: ['Verbrauch', 'Effizienz', 'Kosten', 'CO₂', 'Außentemperatur'],
        correlations: [
          [1.00, -0.72, 0.95, 0.88, 0.65],
          [-0.72, 1.00, -0.68, -0.75, -0.45],
          [0.95, -0.68, 1.00, 0.82, 0.58],
          [0.88, -0.75, 0.82, 1.00, 0.62],
          [0.65, -0.45, 0.58, 0.62, 1.00]
        ],
        significantCorrelations: [
          { variable1: 'Verbrauch', variable2: 'Kosten', correlation: 0.95, significance: 0.99 },
          { variable1: 'Verbrauch', variable2: 'CO₂', correlation: 0.88, significance: 0.98 },
          { variable1: 'Effizienz', variable2: 'CO₂', correlation: -0.75, significance: 0.96 }
        ]
      },

      seasonality: {
        seasonalStrength: 0.68,
        seasonalPeriod: 365,
        decomposition: {
          trend: Array.from({ length: 79 }, (_, i) => 12000 * (1 - 0.1 * i / 79)),
          seasonal: Array.from({ length: 79 }, (_, i) => 12000 * 0.3 * Math.sin((i * 2 * Math.PI) / 365)),
          residual: Array.from({ length: 79 }, () => (Math.random() - 0.5) * 1200)
        },
        seasonalAdjusted: Array.from({ length: 79 }, (_, i) => 12000 * (1 - 0.1 * i / 79) + (Math.random() - 0.5) * 1200)
      },

      cyclicalPatterns: [
        {
          name: 'Wochenzyklus',
          period: 7,
          amplitude: 0.25,
          phase: 0,
          confidence: 0.92,
          description: 'Wöchentlicher Verbrauchszyklus mit niedrigem Wochenendverbrauch'
        },
        {
          name: 'Tageszyklus',
          period: 1,
          amplitude: 0.4,
          phase: 0.33,
          confidence: 0.88,
          description: 'Täglicher Verbrauchszyklus mit Spitzen um 8:00 und 17:00'
        }
      ],

      volatility: {
        variance: 2450000,
        standardDeviation: 1565,
        coefficientOfVariation: 0.13,
        volatilityIndex: 15.2,
        stabilityScore: 84.8
      }
    },

    anomalies: [
      {
        id: 'anom-001',
        type: 'consumption',
        severity: 'moderate',
        buildingId: '2',
        buildingName: 'Grundschule',
        detectedAt: '2024-03-19T14:00:00Z',
        value: 85,
        expectedValue: 62,
        deviation: 23,
        deviationPercentage: 37.1,
        duration: 2,
        status: 'active',
        potentialCauses: [
          'Defekte Heizungssteuerung',
          'Vergessene Geräte nach Schulveranstaltung',
          'Sensorfehler'
        ],
        recommendedActions: [
          'Gebäudebegehung veranlassen',
          'Heizungssteuerung überprüfen',
          'Sensorwerte validieren'
        ],
        impact: {
          energy: 460,
          cost: 161,
          operational: 'Mögliche Überhitzung der Räume'
        },
        confidence: 87.5,
        falsePositiveRate: 8.2
      }
    ],

    correlations: [
      {
        variable1: 'Außentemperatur',
        variable2: 'Heizenergieverbrauch',
        correlationType: 'negative',
        correlationStrength: 0.89,
        significance: 0.99,
        timeframe: 'Winter 2023/24',
        buildingsAnalyzed: ['1', '2', '3', '4', '5', '6', '7'],
        insights: [
          'Bei 1°C Temperaturabfall steigt der Heizenergieverbrauch um 3.2%',
          'Stärkste Korrelation bei Temperaturen unter 5°C',
          'Gebäudedämmung zeigt signifikanten Einfluss auf Korrelationsstärke'
        ],
        actionableRecommendations: [
          'Heizkurven an Wetterdaten anpassen',
          'Präventive Anpassung vor Kälteperioden',
          'Dämmungsmaßnahmen priorisieren'
        ]
      }
    ],

    forecasts: [
      {
        type: 'consumption',
        horizon: 'short_term',
        buildingId: '1',
        buildingName: 'Rathaus',
        forecast: Array.from({ length: 30 }, (_, i) => {
          const baseValue = 45000;
          const trend = baseValue * (1 - 0.05 * i / 30);
          const seasonal = baseValue * 0.2 * Math.sin((i * 2 * Math.PI) / 30);
          const predicted = trend + seasonal;
          return {
            period: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            predicted: Math.round(predicted),
            lowerBound: Math.round(predicted * 0.9),
            upperBound: Math.round(predicted * 1.1),
            confidence: 85 + Math.random() * 10
          };
        }),
        methodology: 'ARIMA mit saisonalen Komponenten',
        accuracy: 89.5,
        lastUpdated: new Date().toISOString(),
        assumptions: [
          'Normale Witterungsbedingungen',
          'Keine außergewöhnlichen Veranstaltungen',
          'Stabile Nutzungsmuster'
        ],
        riskFactors: [
          'Extreme Wetterlagen',
          'Unvorhergesehene Systemausfälle',
          'Änderungen im Nutzungsverhalten'
        ]
      }
    ]
  };
};

// Export für Component-Tests und Story-Books
export const mockAnalyticsData = generateMockAdvancedAnalyticsData();

// Drill-down data generator
export const generateDrillDownData = (level: number, parentId?: string): DrillDownChartData => {
  const baseData = Array.from({ length: 12 }, (_, i) => ({
    name: level === 0 ? buildings[Math.min(i, buildings.length - 1)].name : 
          level === 1 ? ['Heizung', 'Beleuchtung', 'EDV', 'Sonstiges'][i % 4] :
          `Detail ${i + 1}`,
    value: Math.round(50000 + Math.random() * 100000),
    timestamp: new Date(2024, i, 1).toISOString(),
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'][i % 7]
  }));

  return {
    level,
    data: baseData.slice(0, level === 0 ? 7 : level === 1 ? 4 : 6),
    parentId,
    breadcrumb: level === 0 ? ['Alle Gebäude'] : 
                level === 1 ? ['Alle Gebäude', parentId || 'Gebäude'] :
                ['Alle Gebäude', 'Gebäude', 'Kategorie'],
    availableFilters: [
      {
        id: 'timeRange',
        name: 'Zeitraum',
        type: 'date',
        required: false,
        options: [
          { value: 'today', label: 'Heute' },
          { value: 'week', label: 'Diese Woche' },
          { value: 'month', label: 'Dieser Monat' },
          { value: 'year', label: 'Dieses Jahr' }
        ]
      },
      {
        id: 'metric',
        name: 'Metrik',
        type: 'category',
        required: false,
        options: [
          { value: 'consumption', label: 'Verbrauch' },
          { value: 'cost', label: 'Kosten' },
          { value: 'efficiency', label: 'Effizienz' }
        ]
      }
    ],
    metadata: {
      totalRecords: baseData.length,
      aggregationLevel: level === 0 ? 'Gebäude' : level === 1 ? 'Kategorie' : 'Detail',
      timeRange: {
        start: '2024-01-01',
        end: '2024-12-31'
      }
    }
  };
};