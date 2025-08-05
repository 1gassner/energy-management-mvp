import express from 'express';
import { supabase } from '../../../config/supabase.js';
import { body, param, query, validationResult } from 'express-validator';
import { websocketUtils } from '../../../websocket/index.js';

const router = express.Router();

// ==========================================
// ENERGY DATA OPERATIONS
// ==========================================

/**
 * GET /api/v1/citypulse/energy
 * Get energy data for user's buildings
 */
router.get('/', [
  query('building_id').optional().isString(),
  query('from').optional().isISO8601().withMessage('From date must be ISO8601 format'),
  query('to').optional().isISO8601().withMessage('To date must be ISO8601 format'),
  query('granularity').optional().isIn(['hour', 'day', 'week', 'month']).withMessage('Invalid granularity'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000')
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
      from, 
      to, 
      granularity = 'hour', 
      page = 1, 
      limit = 100 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('energy_data')
      .select(`
        *,
        building:buildings!inner(id, name, type, user_id)
      `)
      .eq('buildings.user_id', req.user.userId)
      .eq('granularity', granularity)
      .order('timestamp', { ascending: false });

    // Apply filters
    if (building_id) query = query.eq('building_id', building_id);
    if (from) query = query.gte('timestamp', from);
    if (to) query = query.lte('timestamp', to);

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: energyData, error, count } = await query;

    if (error) throw error;

    // Calculate summary statistics
    const summary = calculateEnergyStatistics(energyData || []);

    res.json({
      energyData: energyData || [],
      granularity,
      summary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/citypulse/energy/:building_id/latest
 * Get latest energy data for specific building
 */
router.get('/:building_id/latest', [
  param('building_id').notEmpty().withMessage('Building ID is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { building_id } = req.params;

    // Verify building ownership
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id, name')
      .eq('id', building_id)
      .eq('user_id', req.user.userId)
      .single();

    if (buildingError || !building) {
      return res.status(404).json({
        error: 'Building not found or access denied'
      });
    }

    // Get latest energy data for each granularity
    const granularities = ['hour', 'day', 'week', 'month'];
    const latestData = {};

    for (const granularity of granularities) {
      const { data, error } = await supabase
        .from('energy_data')
        .select('*')
        .eq('building_id', building_id)
        .eq('granularity', granularity)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (!error && data?.length > 0) {
        latestData[granularity] = data[0];
      }
    }

    // Get live sensor readings for energy sensors
    const { data: energySensors, error: sensorsError } = await supabase
      .from('sensors')
      .select(`
        id, name, current_value, unit, last_reading,
        latest_reading:sensor_readings(value, timestamp).order(timestamp.desc).limit(1)
      `)
      .eq('building_id', building_id)
      .eq('type', 'energy')
      .eq('status', 'active');

    if (sensorsError) throw sensorsError;

    res.json({
      buildingId: building_id,
      buildingName: building.name,
      latest: latestData,
      liveSensors: energySensors || [],
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/citypulse/energy/:building_id/trends
 * Get energy trends and analytics for building
 */
router.get('/:building_id/trends', [
  param('building_id').notEmpty().withMessage('Building ID is required'),
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period'),
  query('compare_previous').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { building_id } = req.params;
    const { period = 'week', compare_previous = true } = req.query;

    // Verify building ownership
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id, name, yearly_consumption, kwh_per_square_meter')
      .eq('id', building_id)
      .eq('user_id', req.user.userId)
      .single();

    if (buildingError || !building) {
      return res.status(404).json({
        error: 'Building not found or access denied'
      });
    }

    // Calculate date ranges
    const now = new Date();
    const { currentPeriodStart, previousPeriodStart, granularity } = calculatePeriodDates(now, period);

    // Get current period data
    const { data: currentData, error: currentError } = await supabase
      .from('energy_data')
      .select('*')
      .eq('building_id', building_id)
      .eq('granularity', granularity)
      .gte('timestamp', currentPeriodStart.toISOString())
      .lte('timestamp', now.toISOString())
      .order('timestamp', { ascending: true });

    if (currentError) throw currentError;

    let previousData = [];
    if (compare_previous) {
      const { data, error } = await supabase
        .from('energy_data')
        .select('*')
        .eq('building_id', building_id)
        .eq('granularity', granularity)
        .gte('timestamp', previousPeriodStart.toISOString())
        .lt('timestamp', currentPeriodStart.toISOString())
        .order('timestamp', { ascending: true });

      if (!error) previousData = data || [];
    }

    // Calculate trends and analytics
    const analytics = calculateEnergyTrends(currentData || [], previousData, building);

    res.json({
      buildingId: building_id,
      buildingName: building.name,
      period,
      timeRange: {
        from: currentPeriodStart.toISOString(),
        to: now.toISOString()
      },
      analytics,
      currentPeriod: {
        data: currentData || [],
        summary: calculateEnergyStatistics(currentData || [])
      },
      previousPeriod: compare_previous ? {
        data: previousData,
        summary: calculateEnergyStatistics(previousData)
      } : null
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/citypulse/energy
 * Add new energy data point
 */
router.post('/', [
  body('building_id').notEmpty().withMessage('Building ID is required'),
  body('timestamp').isISO8601().withMessage('Timestamp must be ISO8601 format'),
  body('consumption').isNumeric().withMessage('Consumption must be numeric'),
  body('production').optional().isNumeric().withMessage('Production must be numeric'),
  body('efficiency').optional().isNumeric().withMessage('Efficiency must be numeric'),
  body('co2_saved').optional().isNumeric().withMessage('CO2 saved must be numeric'),
  body('granularity').isIn(['hour', 'day', 'week', 'month']).withMessage('Invalid granularity')
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
      timestamp, 
      consumption, 
      production = 0, 
      efficiency = 0, 
      co2_saved = 0, 
      granularity 
    } = req.body;

    // Verify building ownership
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id')
      .eq('id', building_id)
      .eq('user_id', req.user.userId)
      .single();

    if (buildingError || !building) {
      return res.status(404).json({
        error: 'Building not found or access denied'
      });
    }

    // Insert energy data
    const { data: energyData, error } = await supabase
      .from('energy_data')
      .insert({
        building_id,
        timestamp,
        consumption: parseFloat(consumption),
        production: parseFloat(production),
        efficiency: parseFloat(efficiency),
        co2_saved: parseFloat(co2_saved),
        granularity
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          error: 'Energy data already exists for this timestamp and granularity'
        });
      }
      throw error;
    }

    // Broadcast real-time update via WebSocket
    if (req.app.get('io')) {
      websocketUtils.broadcastEnergyUpdate(req.app.get('io'), building_id, {
        buildingId: building_id,
        timestamp,
        consumption: parseFloat(consumption),
        production: parseFloat(production),
        efficiency: parseFloat(efficiency),
        co2Saved: parseFloat(co2_saved),
        granularity
      });
    }

    res.status(201).json({
      message: 'Energy data added successfully',
      energyData
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/citypulse/energy/bulk
 * Bulk insert energy data
 */
router.post('/bulk', [
  body('data').isArray({ min: 1 }).withMessage('Data must be an array with at least one item'),
  body('data.*.building_id').notEmpty().withMessage('Building ID is required for each item'),
  body('data.*.timestamp').isISO8601().withMessage('Timestamp must be ISO8601 format'),
  body('data.*.consumption').isNumeric().withMessage('Consumption must be numeric'),
  body('data.*.granularity').isIn(['hour', 'day', 'week', 'month']).withMessage('Invalid granularity')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { data: energyDataArray } = req.body;

    // Verify all buildings belong to user
    const buildingIds = [...new Set(energyDataArray.map(item => item.building_id))];
    
    const { data: userBuildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('id')
      .eq('user_id', req.user.userId)
      .in('id', buildingIds);

    if (buildingsError) throw buildingsError;

    const validBuildingIds = new Set(userBuildings.map(b => b.id));
    const invalidItems = energyDataArray.filter(item => !validBuildingIds.has(item.building_id));

    if (invalidItems.length > 0) {
      return res.status(403).json({
        error: 'Access denied to some buildings',
        invalidBuildingIds: invalidItems.map(item => item.building_id)
      });
    }

    // Prepare data for bulk insert
    const processedData = energyDataArray.map(item => ({
      building_id: item.building_id,
      timestamp: item.timestamp,
      consumption: parseFloat(item.consumption),
      production: parseFloat(item.production || 0),
      efficiency: parseFloat(item.efficiency || 0),
      co2_saved: parseFloat(item.co2_saved || 0),
      granularity: item.granularity
    }));

    // Bulk insert
    const { data: insertedData, error } = await supabase
      .from('energy_data')
      .insert(processedData)
      .select();

    if (error) throw error;

    // Broadcast updates for each building
    if (req.app.get('io')) {
      const updatesByBuilding = new Map();
      insertedData.forEach(item => {
        if (!updatesByBuilding.has(item.building_id)) {
          updatesByBuilding.set(item.building_id, []);
        }
        updatesByBuilding.get(item.building_id).push(item);
      });

      updatesByBuilding.forEach((updates, buildingId) => {
        updates.forEach(update => {
          websocketUtils.broadcastEnergyUpdate(req.app.get('io'), buildingId, update);
        });
      });
    }

    res.status(201).json({
      message: 'Bulk energy data inserted successfully',
      inserted: insertedData.length,
      data: insertedData
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// AGGREGATION AND REPORTING
// ==========================================

/**
 * GET /api/v1/citypulse/energy/aggregated
 * Get aggregated energy data across all user buildings
 */
router.get('/aggregated', [
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

    const { period = 'month', granularity = 'day' } = req.query;

    // Calculate date range
    const now = new Date();
    const { currentPeriodStart } = calculatePeriodDates(now, period);

    // Get aggregated data
    const { data, error } = await supabase
      .from('energy_data')
      .select(`
        timestamp,
        consumption,
        production,
        efficiency,
        co2_saved,
        building:buildings!inner(id, name, type, user_id)
      `)
      .eq('buildings.user_id', req.user.userId)
      .eq('granularity', granularity)
      .gte('timestamp', currentPeriodStart.toISOString())
      .lte('timestamp', now.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;

    // Aggregate by timestamp
    const aggregated = aggregateByTimestamp(data || []);

    // Calculate totals and averages
    const summary = {
      totalBuildings: new Set((data || []).map(d => d.building.id)).size,
      totalConsumption: aggregated.reduce((sum, item) => sum + item.consumption, 0),
      totalProduction: aggregated.reduce((sum, item) => sum + item.production, 0),
      averageEfficiency: aggregated.length > 0 
        ? aggregated.reduce((sum, item) => sum + item.efficiency, 0) / aggregated.length 
        : 0,
      totalCo2Saved: aggregated.reduce((sum, item) => sum + item.co2_saved, 0),
      period,
      granularity
    };

    res.json({
      aggregated,
      summary,
      timeRange: {
        from: currentPeriodStart.toISOString(),
        to: now.toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function calculateEnergyStatistics(data) {
  if (!data.length) return null;

  const consumptions = data.map(d => d.consumption);
  const productions = data.map(d => d.production);
  const efficiencies = data.map(d => d.efficiency);

  return {
    totalConsumption: consumptions.reduce((sum, val) => sum + val, 0),
    averageConsumption: consumptions.reduce((sum, val) => sum + val, 0) / consumptions.length,
    totalProduction: productions.reduce((sum, val) => sum + val, 0),
    averageProduction: productions.reduce((sum, val) => sum + val, 0) / productions.length,
    averageEfficiency: efficiencies.reduce((sum, val) => sum + val, 0) / efficiencies.length,
    totalCo2Saved: data.reduce((sum, d) => sum + d.co2_saved, 0),
    peakConsumption: Math.max(...consumptions),
    minConsumption: Math.min(...consumptions),
    dataPoints: data.length
  };
}

function calculateEnergyTrends(currentData, previousData, building) {
  const currentStats = calculateEnergyStatistics(currentData);
  const previousStats = calculateEnergyStatistics(previousData);

  const trends = {};

  if (currentStats && previousStats) {
    trends.consumptionChange = {
      value: currentStats.totalConsumption - previousStats.totalConsumption,
      percentage: ((currentStats.totalConsumption - previousStats.totalConsumption) / previousStats.totalConsumption) * 100
    };

    trends.efficiencyChange = {
      value: currentStats.averageEfficiency - previousStats.averageEfficiency,
      percentage: ((currentStats.averageEfficiency - previousStats.averageEfficiency) / previousStats.averageEfficiency) * 100
    };

    trends.productionChange = {
      value: currentStats.totalProduction - previousStats.totalProduction,
      percentage: previousStats.totalProduction > 0 
        ? ((currentStats.totalProduction - previousStats.totalProduction) / previousStats.totalProduction) * 100 
        : 0
    };
  }

  // Calculate performance vs targets
  if (building.yearly_consumption > 0 && currentStats) {
    const yearlyTarget = building.yearly_consumption;
    const currentYearlyProjection = currentStats.totalConsumption * (365 / currentData.length);
    
    trends.yearlyProjection = {
      projected: currentYearlyProjection,
      target: yearlyTarget,
      variance: currentYearlyProjection - yearlyTarget,
      variancePercentage: ((currentYearlyProjection - yearlyTarget) / yearlyTarget) * 100
    };
  }

  return {
    trends,
    current: currentStats,
    previous: previousStats,
    recommendations: generateEnergyRecommendations(currentStats, trends, building)
  };
}

function calculatePeriodDates(now, period) {
  const currentPeriodStart = new Date(now);
  const previousPeriodStart = new Date(now);
  
  let granularity = 'hour';

  switch (period) {
    case 'day':
      currentPeriodStart.setHours(0, 0, 0, 0);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
      previousPeriodStart.setHours(0, 0, 0, 0);
      granularity = 'hour';
      break;
    case 'week':
      const dayOfWeek = currentPeriodStart.getDay();
      currentPeriodStart.setDate(currentPeriodStart.getDate() - dayOfWeek);
      currentPeriodStart.setHours(0, 0, 0, 0);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - dayOfWeek - 7);
      previousPeriodStart.setHours(0, 0, 0, 0);
      granularity = 'day';
      break;
    case 'month':
      currentPeriodStart.setDate(1);
      currentPeriodStart.setHours(0, 0, 0, 0);
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
      previousPeriodStart.setDate(1);
      previousPeriodStart.setHours(0, 0, 0, 0);
      granularity = 'day';
      break;
    case 'year':
      currentPeriodStart.setMonth(0, 1);
      currentPeriodStart.setHours(0, 0, 0, 0);
      previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
      previousPeriodStart.setMonth(0, 1);
      previousPeriodStart.setHours(0, 0, 0, 0);
      granularity = 'month';
      break;
  }

  return { currentPeriodStart, previousPeriodStart, granularity };
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
        co2_saved: 0,
        count: 0
      };
    }
    
    grouped[timestamp].consumption += item.consumption;
    grouped[timestamp].production += item.production;
    grouped[timestamp].efficiency += item.efficiency;
    grouped[timestamp].co2_saved += item.co2_saved;
    grouped[timestamp].count++;
  });
  
  return Object.values(grouped).map(item => ({
    ...item,
    efficiency: item.efficiency / item.count // Average efficiency
  })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function generateEnergyRecommendations(stats, trends, building) {
  const recommendations = [];

  if (!stats) return recommendations;

  // High consumption recommendations
  if (trends?.trends?.consumptionChange?.percentage > 10) {
    recommendations.push({
      type: 'warning',
      title: 'Increased Energy Consumption',
      message: `Energy consumption has increased by ${trends.trends.consumptionChange.percentage.toFixed(1)}% compared to the previous period.`,
      action: 'Review usage patterns and consider energy-saving measures.'
    });
  }

  // Low efficiency recommendations
  if (stats.averageEfficiency < 70) {
    recommendations.push({
      type: 'info',
      title: 'Efficiency Improvement Opportunity',
      message: `Current efficiency is ${stats.averageEfficiency.toFixed(1)}%. There may be opportunities for improvement.`,
      action: 'Consider upgrading equipment or optimizing operational schedules.'
    });
  }

  // Production vs consumption
  if (stats.totalProduction > 0 && stats.totalProduction < stats.totalConsumption * 0.3) {
    recommendations.push({
      type: 'info',
      title: 'Renewable Energy Opportunity',
      message: 'Energy production is low compared to consumption.',
      action: 'Consider expanding renewable energy capacity.'
    });
  }

  return recommendations;
}

export default router;