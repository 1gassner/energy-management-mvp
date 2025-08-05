import express from 'express';
import { supabase } from '../../../config/supabase.js';
import { body, param, query, validationResult } from 'express-validator';
import { websocketUtils } from '../../../websocket/index.js';

const router = express.Router();

// ==========================================
// SENSORS CRUD OPERATIONS
// ==========================================

/**
 * GET /api/v1/citypulse/sensors
 * Get all sensors for user's buildings
 */
router.get('/', [
  query('building_id').optional().isString(),
  query('type').optional().isIn(['energy', 'temperature', 'humidity', 'occupancy', 'security', 'water_quality', 'pump', 'pool', 'heritage', 'education', 'sports', 'services', 'renovation', 'visitors', 'environment']),
  query('status').optional().isIn(['active', 'inactive', 'error']),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { building_id, type, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('sensors')
      .select(`
        *,
        building:buildings!inner(id, name, user_id)
      `)
      .eq('buildings.user_id', req.user.userId);

    // Apply filters
    if (building_id) query = query.eq('building_id', building_id);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: sensors, error, count } = await query;

    if (error) throw error;

    res.json({
      sensors: sensors || [],
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
 * GET /api/v1/citypulse/sensors/:id
 * Get specific sensor details
 */
router.get('/:id', [
  param('id').notEmpty().withMessage('Sensor ID is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;

    const { data: sensor, error } = await supabase
      .from('sensors')
      .select(`
        *,
        building:buildings!inner(id, name, user_id),
        latest_reading:sensor_readings(value, timestamp).order(timestamp.desc).limit(1)
      `)
      .eq('id', id)
      .eq('buildings.user_id', req.user.userId)
      .single();

    if (error || !sensor) {
      return res.status(404).json({
        error: 'Sensor not found or access denied'
      });
    }

    res.json({
      sensor: {
        ...sensor,
        latestReading: sensor.latest_reading?.[0] || null
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/citypulse/sensors
 * Create new sensor
 */
router.post('/', [
  body('id').notEmpty().withMessage('Sensor ID is required'),
  body('building_id').notEmpty().withMessage('Building ID is required'),
  body('type').isIn(['energy', 'temperature', 'humidity', 'occupancy', 'security', 'water_quality', 'pump', 'pool', 'heritage', 'education', 'sports', 'services', 'renovation', 'visitors', 'environment']).withMessage('Invalid sensor type'),
  body('name').notEmpty().withMessage('Sensor name is required'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('metadata').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id, building_id, type, name, unit, metadata = {} } = req.body;

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

    // Create sensor
    const { data: sensor, error } = await supabase
      .from('sensors')
      .insert({
        id,
        building_id,
        type,
        name,
        unit,
        metadata,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          error: 'Sensor ID already exists'
        });
      }
      throw error;
    }

    res.status(201).json({
      message: 'Sensor created successfully',
      sensor
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/citypulse/sensors/:id
 * Update sensor
 */
router.put('/:id', [
  param('id').notEmpty().withMessage('Sensor ID is required'),
  body('name').optional().notEmpty(),
  body('unit').optional().notEmpty(),
  body('status').optional().isIn(['active', 'inactive', 'error']),
  body('metadata').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Verify sensor ownership
    const { data: existingSensor, error: verifyError } = await supabase
      .from('sensors')
      .select('building_id, buildings!inner(user_id)')
      .eq('id', id)
      .eq('buildings.user_id', req.user.userId)
      .single();

    if (verifyError || !existingSensor) {
      return res.status(404).json({
        error: 'Sensor not found or access denied'
      });
    }

    // Update sensor
    const { data: sensor, error } = await supabase
      .from('sensors')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Sensor updated successfully',
      sensor
    });

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/citypulse/sensors/:id
 * Delete sensor
 */
router.delete('/:id', [
  param('id').notEmpty().withMessage('Sensor ID is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;

    // Verify sensor ownership
    const { data: existingSensor, error: verifyError } = await supabase
      .from('sensors')
      .select('building_id, buildings!inner(user_id)')
      .eq('id', id)
      .eq('buildings.user_id', req.user.userId)
      .single();

    if (verifyError || !existingSensor) {
      return res.status(404).json({
        error: 'Sensor not found or access denied'
      });
    }

    // Delete sensor (this will cascade delete readings)
    const { error } = await supabase
      .from('sensors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      message: 'Sensor deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// SENSOR READINGS OPERATIONS
// ==========================================

/**
 * GET /api/v1/citypulse/sensors/:id/readings
 * Get sensor readings with time range filtering
 */
router.get('/:id/readings', [
  param('id').notEmpty().withMessage('Sensor ID is required'),
  query('from').optional().isISO8601().withMessage('From date must be ISO8601 format'),
  query('to').optional().isISO8601().withMessage('To date must be ISO8601 format'),
  query('granularity').optional().isIn(['raw', 'minute', 'hour', 'day']).withMessage('Invalid granularity'),
  query('limit').optional().isInt({ min: 1, max: 10000 }).withMessage('Limit must be between 1 and 10000')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { from, to, granularity = 'raw', limit = 1000 } = req.query;

    // Verify sensor ownership
    const { data: sensor, error: sensorError } = await supabase
      .from('sensors')
      .select('building_id, buildings!inner(user_id)')
      .eq('id', id)
      .eq('buildings.user_id', req.user.userId)
      .single();

    if (sensorError || !sensor) {
      return res.status(404).json({
        error: 'Sensor not found or access denied'
      });
    }

    let query = supabase
      .from('sensor_readings')
      .select('value, timestamp, metadata')
      .eq('sensor_id', id)
      .order('timestamp', { ascending: false })
      .limit(limit);

    // Apply time range filters
    if (from) query = query.gte('timestamp', from);
    if (to) query = query.lte('timestamp', to);

    const { data: readings, error } = await query;

    if (error) throw error;

    // Apply granularity aggregation if needed
    let processedReadings = readings || [];
    
    if (granularity !== 'raw' && processedReadings.length > 0) {
      processedReadings = aggregateReadings(processedReadings, granularity);
    }

    res.json({
      sensorId: id,
      granularity,
      readings: processedReadings,
      summary: {
        count: processedReadings.length,
        timeRange: {
          from: processedReadings[processedReadings.length - 1]?.timestamp,
          to: processedReadings[0]?.timestamp
        },
        statistics: calculateReadingStatistics(processedReadings)
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/citypulse/sensors/:id/readings
 * Add new sensor reading
 */
router.post('/:id/readings', [
  param('id').notEmpty().withMessage('Sensor ID is required'),
  body('value').isNumeric().withMessage('Value must be numeric'),
  body('timestamp').optional().isISO8601().withMessage('Timestamp must be ISO8601 format'),
  body('metadata').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { value, timestamp = new Date().toISOString(), metadata = {} } = req.body;

    // Verify sensor ownership and get sensor info
    const { data: sensor, error: sensorError } = await supabase
      .from('sensors')
      .select(`
        id, building_id, name, unit, current_value,
        building:buildings!inner(user_id)
      `)
      .eq('id', id)
      .eq('buildings.user_id', req.user.userId)
      .single();

    if (sensorError || !sensor) {
      return res.status(404).json({
        error: 'Sensor not found or access denied'
      });
    }

    // Insert reading
    const { data: reading, error } = await supabase
      .from('sensor_readings')
      .insert({
        sensor_id: id,
        value: parseFloat(value),
        timestamp,
        metadata
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          error: 'Reading already exists for this timestamp'
        });
      }
      throw error;
    }

    // Update sensor's current value and last reading time
    await supabase
      .from('sensors')
      .update({
        current_value: parseFloat(value),
        last_reading: timestamp,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    // Broadcast real-time update via WebSocket
    if (req.app.get('io')) {
      websocketUtils.broadcastSensorReading(req.app.get('io'), sensor.building_id, {
        sensorId: id,
        sensorName: sensor.name,
        value: parseFloat(value),
        unit: sensor.unit,
        timestamp,
        buildingId: sensor.building_id
      });
    }

    res.status(201).json({
      message: 'Reading added successfully',
      reading
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Aggregate readings by time granularity
 */
function aggregateReadings(readings, granularity) {
  if (granularity === 'raw') return readings;
  
  const groupBy = getGroupByFunction(granularity);
  const grouped = {};
  
  readings.forEach(reading => {
    const key = groupBy(new Date(reading.timestamp));
    if (!grouped[key]) {
      grouped[key] = {
        values: [],
        timestamps: []
      };
    }
    grouped[key].values.push(reading.value);
    grouped[key].timestamps.push(reading.timestamp);
  });
  
  return Object.entries(grouped).map(([key, group]) => ({
    timestamp: key,
    value: group.values.reduce((sum, val) => sum + val, 0) / group.values.length, // Average
    metadata: {
      aggregated: true,
      granularity,
      count: group.values.length,
      min: Math.min(...group.values),
      max: Math.max(...group.values)
    }
  })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get grouping function for granularity
 */
function getGroupByFunction(granularity) {
  switch (granularity) {
    case 'minute':
      return (date) => {
        date.setSeconds(0, 0);
        return date.toISOString();
      };
    case 'hour':
      return (date) => {
        date.setMinutes(0, 0, 0);
        return date.toISOString();
      };
    case 'day':
      return (date) => {
        date.setHours(0, 0, 0, 0);
        return date.toISOString();
      };
    default:
      return (date) => date.toISOString();
  }
}

/**
 * Calculate basic statistics for readings
 */
function calculateReadingStatistics(readings) {
  if (!readings.length) return null;
  
  const values = readings.map(r => parseFloat(r.value)).filter(v => !isNaN(v));
  
  if (!values.length) return null;
  
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: values.reduce((sum, val) => sum + val, 0) / values.length,
    latest: values[0],
    trend: values.length > 1 ? (values[0] - values[values.length - 1]) / values[values.length - 1] : 0
  };
}

export default router;