import express from 'express';
import { supabase } from '../../../config/supabase.js';
import { query, param, validationResult } from 'express-validator';

const router = express.Router();

// ==========================================
// ANALYTICS ENDPOINTS
// ==========================================

/**
 * GET /api/v1/citypulse/analytics/dashboard
 * Get comprehensive dashboard analytics
 */
router.get('/dashboard', [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { period = 'month' } = req.query;
    const userId = req.user.userId;

    // Get all user's buildings
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('id, name, type, yearly_consumption, status')
      .eq('user_id', userId);

    if (buildingsError) throw buildingsError;

    if (!buildings || buildings.length === 0) {
      return res.json({
        dashboard: {
          totalBuildings: 0,
          onlineBuildings: 0,
          offlineBuildings: 0,
          totalEnergyConsumption: 0,
          totalEnergyProduction: 0,
          averageEfficiency: 0,
          totalCo2Saved: 0,
          activeAlerts: 0,
          criticalAlerts: 0,
          energyTrends: [],
          buildingPerformance: [],
          alertSummary: {},
          recommendations: []
        },
        period,
        timeRange: null
      });
    }

    const buildingIds = buildings.map(b => b.id);

    // Calculate date range
    const now = new Date();
    const timeRange = calculateTimeRange(now, period);

    // Get parallel analytics data
    const [
      energyData,
      alertsData,
      sensorsData,
      trendsData
    ] = await Promise.all([
      getEnergyAnalytics(buildingIds, timeRange),
      getAlertsAnalytics(buildingIds, timeRange),
      getSensorsAnalytics(buildingIds),
      getEnergyTrends(buildingIds, period, timeRange)
    ]);

    // Calculate building performance metrics
    const buildingPerformance = await Promise.all(
      buildings.map(building => calculateBuildingPerformance(building, timeRange))
    );

    // Generate AI-powered recommendations
    const recommendations = generateRecommendations({
      buildings,
      energyData,
      alertsData,
      sensorsData,
      period
    });

    const dashboard = {
      // Overview metrics
      totalBuildings: buildings.length,
      onlineBuildings: buildings.filter(b => b.status === 'online').length,
      offlineBuildings: buildings.filter(b => b.status === 'offline').length,

      // Energy metrics
      totalEnergyConsumption: energyData.totalConsumption,
      totalEnergyProduction: energyData.totalProduction,
      averageEfficiency: energyData.averageEfficiency,
      totalCo2Saved: energyData.totalCo2Saved,
      energySavings: energyData.savings,

      // Alerts metrics
      activeAlerts: alertsData.activeCount,
      criticalAlerts: alertsData.criticalCount,
      alertTrends: alertsData.trends,

      // Sensor metrics
      totalSensors: sensorsData.totalSensors,
      activeSensors: sensorsData.activeSensors,
      errorSensors: sensorsData.errorSensors,

      // Trends and performance
      energyTrends: trendsData,
      buildingPerformance,

      // AI insights
      recommendations,
      
      // Comparison with previous period
      comparison: energyData.comparison,

      // Summary stats
      alertSummary: alertsData.summary,
      performanceSummary: calculatePerformanceSummary(buildingPerformance),

      // Timestamps
      lastUpdate: new Date().toISOString(),
      dataFreshness: calculateDataFreshness(energyData.latestTimestamp)
    };

    res.json({
      dashboard,
      period,
      timeRange: {
        from: timeRange.start.toISOString(),
        to: timeRange.end.toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/citypulse/analytics/energy-efficiency
 * Get detailed energy efficiency analytics
 */
router.get('/energy-efficiency', [
  query('building_id').optional().isString(),
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period'),
  query('granularity').optional().isIn(['hour', 'day', 'week', 'month']).withMessage('Invalid granularity')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { building_id, period = 'month', granularity = 'day' } = req.query;
    const userId = req.user.userId;

    // Get buildings
    let buildingsQuery = supabase
      .from('buildings')
      .select('id, name, type, yearly_consumption, kwh_per_square_meter, area')
      .eq('user_id', userId);

    if (building_id) {
      buildingsQuery = buildingsQuery.eq('id', building_id);
    }

    const { data: buildings, error: buildingsError } = await buildingsQuery;
    if (buildingsError) throw buildingsError;

    if (!buildings || buildings.length === 0) {
      return res.status(404).json({
        error: 'No buildings found'
      });
    }

    const buildingIds = buildings.map(b => b.id);
    const timeRange = calculateTimeRange(new Date(), period);

    // Get energy efficiency data
    const { data: energyData, error: energyError } = await supabase
      .from('energy_data')
      .select('building_id, timestamp, consumption, production, efficiency')
      .in('building_id', buildingIds)
      .eq('granularity', granularity)
      .gte('timestamp', timeRange.start.toISOString())
      .lte('timestamp', timeRange.end.toISOString())
      .order('timestamp', { ascending: true });

    if (energyError) throw energyError;

    // Calculate efficiency metrics per building
    const buildingEfficiency = buildings.map(building => {
      const buildingData = energyData?.filter(e => e.building_id === building.id) || [];
      
      return {
        buildingId: building.id,
        buildingName: building.name,
        buildingType: building.type,
        area: building.area,
        targetConsumption: building.yearly_consumption,
        metrics: calculateEfficiencyMetrics(buildingData, building),
        trends: calculateEfficiencyTrends(buildingData),
        benchmarks: calculateBenchmarks(building, buildingData),
        recommendations: generateEfficiencyRecommendations(building, buildingData)
      };
    });

    // Overall efficiency analysis
    const overallEfficiency = {
      averageEfficiency: calculateOverallAverageEfficiency(energyData || []),
      efficiencyDistribution: calculateEfficiencyDistribution(energyData || []),
      topPerformers: buildingEfficiency
        .sort((a, b) => b.metrics.averageEfficiency - a.metrics.averageEfficiency)
        .slice(0, 3),
      improvementOpportunities: buildingEfficiency
        .filter(b => b.metrics.averageEfficiency < 70)
        .sort((a, b) => a.metrics.averageEfficiency - b.metrics.averageEfficiency)
        .slice(0, 5)
    };

    res.json({
      energyEfficiency: {
        overall: overallEfficiency,
        buildings: buildingEfficiency,
        timeRange: {
          from: timeRange.start.toISOString(),
          to: timeRange.end.toISOString()
        },
        period,
        granularity
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/citypulse/analytics/cost-analysis
 * Get cost analysis and savings calculations
 */
router.get('/cost-analysis', [
  query('building_id').optional().isString(),
  query('period').optional().isIn(['month', 'quarter', 'year']).withMessage('Invalid period'),
  query('energy_price').optional().isFloat({ min: 0 }).withMessage('Energy price must be positive')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      building_id, 
      period = 'month', 
      energy_price = 0.30 // Default: €0.30 per kWh
    } = req.query;

    const userId = req.user.userId;
    const energyPrice = parseFloat(energy_price);

    // Get buildings with savings potential
    let buildingsQuery = supabase
      .from('buildings')
      .select(`
        id, name, type, yearly_consumption, 
        savings_potential_kwh, savings_potential_euro, 
        savings_potential_percentage, area
      `)
      .eq('user_id', userId);

    if (building_id) {
      buildingsQuery = buildingsQuery.eq('id', building_id);
    }

    const { data: buildings, error: buildingsError } = await buildingsQuery;
    if (buildingsError) throw buildingsError;

    if (!buildings || buildings.length === 0) {
      return res.status(404).json({
        error: 'No buildings found'
      });
    }

    const buildingIds = buildings.map(b => b.id);
    const timeRange = calculateTimeRange(new Date(), period);

    // Get energy consumption data
    const { data: energyData, error: energyError } = await supabase
      .from('energy_data')
      .select('building_id, consumption, production, co2_saved, timestamp')
      .in('building_id', buildingIds)
      .eq('granularity', getGranularityForPeriod(period))
      .gte('timestamp', timeRange.start.toISOString())
      .lte('timestamp', timeRange.end.toISOString());

    if (energyError) throw energyError;

    // Calculate cost analysis for each building
    const buildingCostAnalysis = buildings.map(building => {
      const buildingData = energyData?.filter(e => e.building_id === building.id) || [];
      
      return calculateBuildingCostAnalysis(building, buildingData, energyPrice, period);
    });

    // Calculate overall cost metrics
    const overallCosts = {
      totalConsumption: buildingCostAnalysis.reduce((sum, b) => sum + b.actualConsumption, 0),
      totalCost: buildingCostAnalysis.reduce((sum, b) => sum + b.actualCost, 0),
      totalProduction: buildingCostAnalysis.reduce((sum, b) => sum + b.actualProduction, 0),
      totalSavings: buildingCostAnalysis.reduce((sum, b) => sum + b.productionSavings, 0),
      potentialSavings: buildingCostAnalysis.reduce((sum, b) => sum + b.potentialSavings, 0),
      totalCo2Savings: buildingCostAnalysis.reduce((sum, b) => sum + b.co2Savings, 0),
      
      // ROI calculations
      roi: calculateROI(buildingCostAnalysis),
      paybackPeriod: calculatePaybackPeriod(buildingCostAnalysis),
      
      // Cost trends
      trends: calculateCostTrends(energyData || [], energyPrice),
      
      // Projections
      yearlyProjection: projectYearlyCosts(buildingCostAnalysis, period)
    };

    res.json({
      costAnalysis: {
        overall: overallCosts,
        buildings: buildingCostAnalysis,
        energyPrice,
        period,
        timeRange: {
          from: timeRange.start.toISOString(),
          to: timeRange.end.toISOString()
        },
        recommendations: generateCostRecommendations(overallCosts, buildingCostAnalysis)
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/citypulse/analytics/benchmarks
 * Get building performance benchmarks
 */
router.get('/benchmarks', [
  query('building_type').optional().isIn(['rathaus', 'realschule', 'grundschule', 'gymnasium', 'werkrealschule', 'sporthallen', 'hallenbad']),
  query('compare_to').optional().isIn(['type', 'size', 'region']).withMessage('Invalid comparison type')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { building_type, compare_to = 'type' } = req.query;
    const userId = req.user.userId;

    // Get user's buildings
    let buildingsQuery = supabase
      .from('buildings')
      .select(`
        id, name, type, area, yearly_consumption, 
        kwh_per_square_meter, status
      `)
      .eq('user_id', userId);

    if (building_type) {
      buildingsQuery = buildingsQuery.eq('type', building_type);
    }

    const { data: userBuildings, error: buildingsError } = await buildingsQuery;
    if (buildingsError) throw buildingsError;

    if (!userBuildings || userBuildings.length === 0) {
      return res.status(404).json({
        error: 'No buildings found'
      });
    }

    // Get benchmark data (anonymized aggregate data)
    const benchmarks = await calculateBenchmarks(userBuildings, compare_to);

    // Calculate performance ratings
    const buildingRatings = userBuildings.map(building => {
      const benchmark = benchmarks.find(b => 
        compare_to === 'type' ? b.type === building.type : true
      );

      return {
        buildingId: building.id,
        buildingName: building.name,
        buildingType: building.type,
        area: building.area,
        actualConsumption: building.yearly_consumption,
        actualKwhPerSqm: building.kwh_per_square_meter,
        
        // Benchmark comparisons
        benchmarkConsumption: benchmark?.averageConsumption || 0,
        benchmarkKwhPerSqm: benchmark?.averageKwhPerSqm || 0,
        
        // Performance scores (0-100)
        efficiencyScore: calculateEfficiencyScore(building, benchmark),
        consumptionScore: calculateConsumptionScore(building, benchmark),
        overallScore: calculateOverallScore(building, benchmark),
        
        // Rankings
        typeRanking: calculateTypeRanking(building, userBuildings.filter(b => b.type === building.type)),
        overallRanking: calculateOverallRanking(building, userBuildings),
        
        // Improvement potential
        improvementPotential: calculateImprovementPotential(building, benchmark),
        targetMetrics: calculateTargetMetrics(building, benchmark)
      };
    });

    res.json({
      benchmarks: {
        buildings: buildingRatings,
        industryBenchmarks: benchmarks,
        summary: {
          averageScore: buildingRatings.reduce((sum, b) => sum + b.overallScore, 0) / buildingRatings.length,
          topPerformer: buildingRatings.reduce((best, current) => 
            current.overallScore > best.overallScore ? current : best
          ),
          improvementOpportunities: buildingRatings
            .filter(b => b.overallScore < 70)
            .sort((a, b) => a.overallScore - b.overallScore)
            .slice(0, 3),
          totalImprovementPotential: buildingRatings.reduce((sum, b) => 
            sum + b.improvementPotential.energySavings, 0
          )
        },
        comparisonType: compare_to,
        buildingType: building_type || 'all'
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/citypulse/analytics/predictions
 * Get AI-powered consumption predictions
 */
router.get('/predictions', [
  query('building_id').optional().isString(),
  query('forecast_period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid forecast period')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { building_id, forecast_period = 'month' } = req.query;
    const userId = req.user.userId;

    // Get buildings for prediction
    let buildingsQuery = supabase
      .from('buildings')
      .select('id, name, type, yearly_consumption, area')
      .eq('user_id', userId);

    if (building_id) {
      buildingsQuery = buildingsQuery.eq('id', building_id);
    }

    const { data: buildings, error: buildingsError } = await buildingsQuery;
    if (buildingsError) throw buildingsError;

    if (!buildings || buildings.length === 0) {
      return res.status(404).json({
        error: 'No buildings found'
      });
    }

    const buildingIds = buildings.map(b => b.id);

    // Get historical data for predictions (last 3 months minimum)
    const historicalRange = new Date();
    historicalRange.setMonth(historicalRange.getMonth() - 3);

    const { data: historicalData, error: dataError } = await supabase
      .from('energy_data')
      .select('building_id, timestamp, consumption, production, efficiency')
      .in('building_id', buildingIds)
      .eq('granularity', 'day')
      .gte('timestamp', historicalRange.toISOString())
      .order('timestamp', { ascending: true });

    if (dataError) throw dataError;

    // Generate predictions for each building
    const predictions = buildings.map(building => {
      const buildingData = historicalData?.filter(d => d.building_id === building.id) || [];
      
      return {
        buildingId: building.id,
        buildingName: building.name,
        buildingType: building.type,
        ...generateBuildingPredictions(building, buildingData, forecast_period)
      };
    });

    // Calculate aggregate predictions
    const aggregatePredictions = calculateAggregatePredictions(predictions, forecast_period);

    res.json({
      predictions: {
        buildings: predictions,
        aggregate: aggregatePredictions,
        forecastPeriod: forecast_period,
        confidence: calculatePredictionConfidence(historicalData || []),
        methodology: 'Time series analysis with seasonal adjustments',
        lastUpdate: new Date().toISOString(),
        
        // Warning about prediction accuracy
        disclaimer: 'Predictions are based on historical data and may not account for unforeseen changes in usage patterns or external factors.'
      }
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function calculateTimeRange(now, period) {
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
}

async function getEnergyAnalytics(buildingIds, timeRange) {
  const { data: currentData, error } = await supabase
    .from('energy_data')
    .select('consumption, production, efficiency, co2_saved, timestamp')
    .in('building_id', buildingIds)
    .gte('timestamp', timeRange.start.toISOString())
    .lte('timestamp', timeRange.end.toISOString());

  if (error) throw error;

  // Get previous period for comparison
  const previousStart = new Date(timeRange.start);
  const previousEnd = new Date(timeRange.start);
  const periodLength = timeRange.end - timeRange.start;
  previousStart.setTime(previousStart.getTime() - periodLength);

  const { data: previousData } = await supabase
    .from('energy_data')
    .select('consumption, production, efficiency, co2_saved')
    .in('building_id', buildingIds)
    .gte('timestamp', previousStart.toISOString())
    .lt('timestamp', timeRange.start.toISOString());

  const current = calculateEnergyMetrics(currentData || []);
  const previous = calculateEnergyMetrics(previousData || []);

  return {
    ...current,
    latestTimestamp: currentData?.length > 0 ? 
      Math.max(...currentData.map(d => new Date(d.timestamp).getTime())) : null,
    comparison: calculateComparison(current, previous)
  };
}

async function getAlertsAnalytics(buildingIds, timeRange) {
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('type, priority, is_resolved, timestamp')
    .or(`building_id.in.(${buildingIds.join(',')}),building_id.is.null`)
    .gte('timestamp', timeRange.start.toISOString())
    .lte('timestamp', timeRange.end.toISOString());

  if (error) throw error;

  const activeAlerts = alerts?.filter(a => !a.is_resolved) || [];
  
  return {
    activeCount: activeAlerts.length,
    criticalCount: activeAlerts.filter(a => a.priority === 'critical').length,
    trends: calculateAlertTrends(alerts || []),
    summary: {
      total: alerts?.length || 0,
      byType: groupBy(alerts || [], 'type'),
      byPriority: groupBy(alerts || [], 'priority')
    }
  };
}

async function getSensorsAnalytics(buildingIds) {
  const { data: sensors, error } = await supabase
    .from('sensors')
    .select('status')
    .in('building_id', buildingIds);

  if (error) throw error;

  return {
    totalSensors: sensors?.length || 0,
    activeSensors: sensors?.filter(s => s.status === 'active').length || 0,
    errorSensors: sensors?.filter(s => s.status === 'error').length || 0
  };
}

async function getEnergyTrends(buildingIds, period, timeRange) {
  const granularity = getGranularityForPeriod(period);
  
  const { data: trends, error } = await supabase
    .from('energy_data')
    .select('timestamp, consumption, production, efficiency')
    .in('building_id', buildingIds)
    .eq('granularity', granularity)
    .gte('timestamp', timeRange.start.toISOString())
    .lte('timestamp', timeRange.end.toISOString())
    .order('timestamp', { ascending: true });

  if (error) throw error;

  return aggregateByTimestamp(trends || []);
}

function calculateEnergyMetrics(data) {
  if (!data.length) {
    return {
      totalConsumption: 0,
      totalProduction: 0,
      averageEfficiency: 0,
      totalCo2Saved: 0,
      savings: 0
    };
  }

  const totalConsumption = data.reduce((sum, d) => sum + d.consumption, 0);
  const totalProduction = data.reduce((sum, d) => sum + d.production, 0);
  const averageEfficiency = data.reduce((sum, d) => sum + d.efficiency, 0) / data.length;
  const totalCo2Saved = data.reduce((sum, d) => sum + d.co2_saved, 0);
  const savings = totalProduction * 0.30; // Assuming €0.30 per kWh

  return {
    totalConsumption,
    totalProduction,
    averageEfficiency,
    totalCo2Saved,
    savings
  };
}

function calculateComparison(current, previous) {
  if (!previous.totalConsumption) return null;

  return {
    consumption: {
      change: current.totalConsumption - previous.totalConsumption,
      percentage: ((current.totalConsumption - previous.totalConsumption) / previous.totalConsumption) * 100
    },
    efficiency: {
      change: current.averageEfficiency - previous.averageEfficiency,
      percentage: ((current.averageEfficiency - previous.averageEfficiency) / previous.averageEfficiency) * 100
    },
    production: {
      change: current.totalProduction - previous.totalProduction,
      percentage: previous.totalProduction > 0 ? 
        ((current.totalProduction - previous.totalProduction) / previous.totalProduction) * 100 : 0
    }
  };
}

function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key] || 'unknown';
    groups[group] = (groups[group] || 0) + 1;
    return groups;
  }, {});
}

function getGranularityForPeriod(period) {
  switch (period) {
    case 'day': return 'hour';
    case 'week': return 'hour';
    case 'month': return 'day';
    case 'quarter': return 'day';
    case 'year': return 'month';
    default: return 'day';
  }
}

function aggregateByTimestamp(data) {
  const grouped = {};
  
  data.forEach(item => {
    const timestamp = item.timestamp;
    if (!grouped[timestamp]) {
      grouped[timestamp] = {
        timestamp,
        consumption: 0,
        production: 0,
        efficiency: 0,
        count: 0
      };
    }
    
    grouped[timestamp].consumption += item.consumption;
    grouped[timestamp].production += item.production;
    grouped[timestamp].efficiency += item.efficiency;
    grouped[timestamp].count++;
  });
  
  return Object.values(grouped).map(item => ({
    ...item,
    efficiency: item.count > 0 ? item.efficiency / item.count : 0
  })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

async function calculateBuildingPerformance(building, timeRange) {
  const { data: energyData, error } = await supabase
    .from('energy_data')
    .select('consumption, production, efficiency')
    .eq('building_id', building.id)
    .gte('timestamp', timeRange.start.toISOString())
    .lte('timestamp', timeRange.end.toISOString());

  if (error) {
    return {
      buildingId: building.id,
      buildingName: building.name,
      score: 0,
      metrics: {},
      status: 'error'
    };
  }

  const metrics = calculateEnergyMetrics(energyData || []);
  const score = calculatePerformanceScore(metrics, building);

  return {
    buildingId: building.id,
    buildingName: building.name,
    buildingType: building.type,
    score,
    metrics,
    status: building.status,
    trend: calculateTrend(energyData || [])
  };
}

function calculatePerformanceScore(metrics, building) {
  // Simple scoring algorithm (0-100)
  let score = 50; // Base score

  // Efficiency component (40 points max)
  if (metrics.averageEfficiency > 0) {
    score += (metrics.averageEfficiency / 100) * 40;
  }

  // Production vs consumption (30 points max)
  if (metrics.totalConsumption > 0) {
    const productionRatio = metrics.totalProduction / metrics.totalConsumption;
    score += Math.min(productionRatio, 1) * 30;
  }

  // vs. target consumption (30 points max)
  if (building.yearly_consumption > 0 && metrics.totalConsumption > 0) {
    const consumptionEfficiency = Math.max(0, 1 - (metrics.totalConsumption / (building.yearly_consumption / 12)));
    score += consumptionEfficiency * 30;
  }

  return Math.min(Math.max(score, 0), 100);
}

function calculateTrend(data) {
  if (data.length < 2) return 'stable';
  
  const recent = data.slice(-Math.min(7, data.length));
  const older = data.slice(0, Math.min(7, data.length));
  
  const recentAvg = recent.reduce((sum, d) => sum + d.consumption, 0) / recent.length;
  const olderAvg = older.reduce((sum, d) => sum + d.consumption, 0) / older.length;
  
  const change = (recentAvg - olderAvg) / olderAvg;
  
  if (change > 0.05) return 'increasing';
  if (change < -0.05) return 'decreasing';
  return 'stable';
}

function generateRecommendations(data) {
  const recommendations = [];

  // High consumption buildings
  const highConsumers = data.buildings.filter(b => 
    b.yearly_consumption > 100000 // > 100,000 kWh/year
  );

  if (highConsumers.length > 0) {
    recommendations.push({
      type: 'energy_optimization',
      priority: 'high',
      title: 'High Energy Consumption Detected',
      message: `${highConsumers.length} buildings show high energy consumption.`,
      action: 'Consider energy audit and efficiency improvements',
      buildings: highConsumers.map(b => b.id),
      potentialSavings: highConsumers.reduce((sum, b) => sum + (b.savings_potential_euro || 0), 0)
    });
  }

  // Low efficiency buildings
  if (data.energyData.averageEfficiency < 70) {
    recommendations.push({
      type: 'efficiency_improvement',
      priority: 'medium',
      title: 'Efficiency Below Optimal',
      message: `Average efficiency is ${data.energyData.averageEfficiency.toFixed(1)}%`,
      action: 'Review equipment performance and maintenance schedules',
      potentialImprovement: '15-25% efficiency gain possible'
    });
  }

  // Critical alerts
  if (data.alertsData.criticalCount > 0) {
    recommendations.push({
      type: 'critical_alerts',
      priority: 'critical',
      title: 'Critical Alerts Require Attention',
      message: `${data.alertsData.criticalCount} critical alerts are active`,
      action: 'Address critical issues immediately',
      urgency: 'immediate'
    });
  }

  return recommendations;
}

function calculateDataFreshness(latestTimestamp) {
  if (!latestTimestamp) return 'no_data';
  
  const now = Date.now();
  const ageHours = (now - latestTimestamp) / (1000 * 60 * 60);
  
  if (ageHours < 1) return 'fresh';
  if (ageHours < 24) return 'recent';
  if (ageHours < 168) return 'stale'; // 1 week
  return 'very_stale';
}

function calculatePerformanceSummary(buildingPerformance) {
  const scores = buildingPerformance.map(b => b.score);
  
  return {
    averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    highPerformers: buildingPerformance.filter(b => b.score >= 80).length,
    lowPerformers: buildingPerformance.filter(b => b.score < 50).length,
    improvingTrend: buildingPerformance.filter(b => b.trend === 'decreasing').length // decreasing consumption = improving
  };
}

// Additional helper functions for cost analysis, benchmarks, and predictions
function calculateBuildingCostAnalysis(building, energyData, energyPrice, period) {
  const consumption = energyData.reduce((sum, d) => sum + d.consumption, 0);
  const production = energyData.reduce((sum, d) => sum + d.production, 0);
  const co2Saved = energyData.reduce((sum, d) => sum + d.co2_saved, 0);

  return {
    buildingId: building.id,
    buildingName: building.name,
    actualConsumption: consumption,
    actualProduction: production,
    actualCost: consumption * energyPrice,
    productionSavings: production * energyPrice,
    netCost: (consumption - production) * energyPrice,
    potentialSavings: building.savings_potential_euro || 0,
    co2Savings: co2Saved,
    costPerSqm: building.area > 0 ? (consumption * energyPrice) / building.area : 0
  };
}

function calculateROI(buildingCostAnalysis) {
  const totalSavings = buildingCostAnalysis.reduce((sum, b) => sum + b.potentialSavings, 0);
  const investmentEstimate = totalSavings * 5; // Rough estimate: 5x annual savings
  
  return investmentEstimate > 0 ? (totalSavings / investmentEstimate) * 100 : 0;
}

function calculatePaybackPeriod(buildingCostAnalysis) {
  const totalSavings = buildingCostAnalysis.reduce((sum, b) => sum + b.potentialSavings, 0);
  const investmentEstimate = totalSavings * 5;
  
  return totalSavings > 0 ? investmentEstimate / totalSavings : 0;
}

function calculateCostTrends(energyData, energyPrice) {
  return energyData.map(d => ({
    timestamp: d.timestamp,
    cost: d.consumption * energyPrice,
    savings: d.production * energyPrice,
    netCost: (d.consumption - d.production) * energyPrice
  }));
}

function projectYearlyCosts(buildingCostAnalysis, period) {
  const multiplier = period === 'month' ? 12 : period === 'quarter' ? 4 : 1;
  
  return {
    projectedConsumption: buildingCostAnalysis.reduce((sum, b) => sum + b.actualConsumption, 0) * multiplier,
    projectedCost: buildingCostAnalysis.reduce((sum, b) => sum + b.actualCost, 0) * multiplier,
    projectedSavings: buildingCostAnalysis.reduce((sum, b) => sum + b.productionSavings, 0) * multiplier
  };
}

function generateCostRecommendations(overallCosts, buildingCostAnalysis) {
  const recommendations = [];
  
  // High cost buildings
  const highCostBuildings = buildingCostAnalysis
    .filter(b => b.costPerSqm > 50) // €50+ per sqm
    .sort((a, b) => b.costPerSqm - a.costPerSqm)
    .slice(0, 3);

  if (highCostBuildings.length > 0) {
    recommendations.push({
      type: 'cost_reduction',
      priority: 'high',
      title: 'High Cost Per Square Meter',
      buildings: highCostBuildings,
      action: 'Focus on efficiency improvements for highest cost buildings'
    });
  }

  return recommendations;
}

export default router;