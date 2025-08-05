import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { supabase, dbHelpers } from '../../../config/supabase.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';
import { authorizeRole } from '../../../middleware/authorize.js';
import winston from 'winston';

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * @route   GET /api/v1/citypulse/buildings
 * @desc    Get all buildings for the user
 * @access  Private (CityPulse)
 */
router.get('/', [
  query('type').optional().isIn(['rathaus', 'realschule', 'grundschule', 'gymnasium', 'werkrealschule', 'sporthallen', 'hallenbad']),
  query('status').optional().isIn(['online', 'offline', 'maintenance']),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { type, status, limit = 50 } = req.query;

  try {
    let query = supabase
      .from('buildings')
      .select(`
        *,
        sensors_count:sensors(count),
        active_sensors:sensors!inner(count).eq(status, active),
        unresolved_alerts:alerts!inner(count).eq(is_resolved, false)
      `)
      .eq('user_id', req.user.userId)
      .order('name');

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data: buildings, error } = await query;

    if (error) throw error;

    // Calculate summary statistics
    const summary = {
      totalBuildings: buildings.length,
      onlineBuildings: buildings.filter(b => b.status === 'online').length,
      offlineBuildings: buildings.filter(b => b.status === 'offline').length,
      maintenanceBuildings: buildings.filter(b => b.status === 'maintenance').length,
      totalYearlyConsumption: buildings.reduce((sum, b) => sum + (b.yearly_consumption || 0), 0),
      totalSavingsPotential: buildings.reduce((sum, b) => sum + (b.savings_potential_euro || 0), 0),
      averageEfficiency: buildings.reduce((sum, b) => sum + (b.kwh_per_square_meter || 0), 0) / buildings.length || 0
    };

    res.json({
      buildings: buildings.map(building => ({
        id: building.id,
        name: building.name,
        type: building.type,
        address: building.address,
        capacity: building.capacity,
        area: building.area,
        status: building.status,
        yearlyConsumption: building.yearly_consumption,
        kwhPerSquareMeter: building.kwh_per_square_meter,
        energyClass: building.energy_class,
        savingsPotential: {
          kwh: building.savings_potential_kwh,
          euro: building.savings_potential_euro,
          percentage: building.savings_potential_percentage
        },
        specialFeatures: building.special_features,
        stats: {
          sensorsCount: building.sensors_count?.[0]?.count || 0,
          activeSensors: building.active_sensors?.[0]?.count || 0,
          unresolvedAlerts: building.unresolved_alerts?.[0]?.count || 0
        },
        lastUpdate: building.last_update,
        createdAt: building.created_at,
        updatedAt: building.updated_at
      })),
      summary,
      pagination: {
        limit,
        total: buildings.length,
        hasMore: buildings.length === limit
      }
    });

  } catch (error) {
    logger.error('Get buildings error:', error);
    res.status(500).json({
      error: 'Failed to get buildings',
      message: error.message
    });
  }
}));

/**
 * @route   GET /api/v1/citypulse/buildings/:id
 * @desc    Get specific building details
 * @access  Private (CityPulse)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const { data: building, error } = await supabase
      .from('buildings')
      .select(`
        *,
        sensors (*),
        recent_alerts:alerts!inner(*).order(timestamp.desc).limit(5),
        latest_energy:energy_data!inner(*).order(timestamp.desc).limit(1)
      `)
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Building not found',
          message: 'The specified building was not found or you do not have access to it'
        });
      }
      throw error;
    }

    // Get sensor statistics
    const sensorStats = {
      total: building.sensors?.length || 0,
      active: building.sensors?.filter(s => s.status === 'active').length || 0,
      inactive: building.sensors?.filter(s => s.status === 'inactive').length || 0,
      error: building.sensors?.filter(s => s.status === 'error').length || 0,
      byType: building.sensors?.reduce((acc, sensor) => {
        acc[sensor.type] = (acc[sensor.type] || 0) + 1;
        return acc;
      }, {}) || {}
    };

    // Get recent energy data for 24 hours
    const { data: recentEnergyData, error: energyError } = await supabase
      .from('energy_data')
      .select('*')
      .eq('building_id', id)
      .eq('granularity', 'hour')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (energyError) {
      logger.warn('Failed to get recent energy data:', energyError);
    }

    res.json({
      building: {
        id: building.id,
        name: building.name,
        type: building.type,
        address: building.address,
        capacity: building.capacity,
        area: building.area,
        status: building.status,
        yearlyConsumption: building.yearly_consumption,
        kwhPerSquareMeter: building.kwh_per_square_meter,
        energyClass: building.energy_class,
        savingsPotential: {
          kwh: building.savings_potential_kwh,
          euro: building.savings_potential_euro,
          percentage: building.savings_potential_percentage
        },
        specialFeatures: building.special_features,
        lastUpdate: building.last_update,
        createdAt: building.created_at,
        updatedAt: building.updated_at
      },
      sensors: building.sensors?.map(sensor => ({
        id: sensor.id,
        type: sensor.type,
        name: sensor.name,
        unit: sensor.unit,
        status: sensor.status,
        currentValue: sensor.current_value,
        lastReading: sensor.last_reading,
        metadata: sensor.metadata
      })) || [],
      sensorStats,
      recentAlerts: building.recent_alerts?.map(alert => ({
        id: alert.id,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        priority: alert.priority,
        isRead: alert.is_read,
        isResolved: alert.is_resolved,
        timestamp: alert.timestamp
      })) || [],
      latestEnergyReading: building.latest_energy?.[0] || null,
      recentEnergyData: recentEnergyData || []
    });

  } catch (error) {
    logger.error('Get building details error:', error);
    res.status(500).json({
      error: 'Failed to get building details',
      message: error.message
    });
  }
}));

/**
 * @route   POST /api/v1/citypulse/buildings
 * @desc    Create new building (Admin only)
 * @access  Private (CityPulse - Admin)
 */
router.post('/', [
  authorizeRole(['admin']),
  body('id').isLength({ min: 1, max: 50 }).trim(),
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('type').isIn(['rathaus', 'realschule', 'grundschule', 'gymnasium', 'werkrealschule', 'sporthallen', 'hallenbad']),
  body('address').isLength({ min: 1, max: 200 }).trim(),
  body('capacity').isInt({ min: 0 }),
  body('area').isFloat({ min: 0 }),
  body('yearlyConsumption').optional().isFloat({ min: 0 }),
  body('energyClass').optional().isIn(['A', 'B', 'C', 'D', 'E', 'F', 'G']),
  body('specialFeatures').optional().isObject()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const {
    id,
    name,
    type,
    address,
    capacity,
    area,
    yearlyConsumption = 0,
    energyClass = null,
    specialFeatures = {}
  } = req.body;

  try {
    // Calculate efficiency if yearly consumption is provided
    const kwhPerSquareMeter = yearlyConsumption > 0 && area > 0 ? yearlyConsumption / area : 0;

    const { data: building, error } = await supabase
      .from('buildings')
      .insert({
        id,
        user_id: req.user.userId,
        name,
        type,
        address,
        capacity,
        area,
        yearly_consumption: yearlyConsumption,
        kwh_per_square_meter: kwhPerSquareMeter,
        energy_class: energyClass,
        special_features: specialFeatures
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'Building already exists',
          message: 'A building with this ID already exists'
        });
      }
      throw error;
    }

    // Log building creation
    await dbHelpers.logActivity(
      req.user.userId,
      'citypulse',
      'building_created',
      { buildingId: id, name, type }
    );

    res.status(201).json({
      message: 'Building created successfully',
      building: {
        id: building.id,
        name: building.name,
        type: building.type,
        address: building.address,
        capacity: building.capacity,
        area: building.area,
        status: building.status,
        yearlyConsumption: building.yearly_consumption,
        kwhPerSquareMeter: building.kwh_per_square_meter,
        energyClass: building.energy_class,
        specialFeatures: building.special_features,
        createdAt: building.created_at
      }
    });

  } catch (error) {
    logger.error('Create building error:', error);
    res.status(500).json({
      error: 'Failed to create building',
      message: error.message
    });
  }
}));

/**
 * @route   PATCH /api/v1/citypulse/buildings/:id
 * @desc    Update building details
 * @access  Private (CityPulse - Manager/Admin)
 */
router.patch('/:id', [
  authorizeRole(['admin', 'manager']),
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('status').optional().isIn(['online', 'offline', 'maintenance']),
  body('capacity').optional().isInt({ min: 0 }),
  body('area').optional().isFloat({ min: 0 }),
  body('yearlyConsumption').optional().isFloat({ min: 0 }),
  body('energyClass').optional().isIn(['A', 'B', 'C', 'D', 'E', 'F', 'G']),
  body('savingsPotential').optional().isObject(),
  body('specialFeatures').optional().isObject()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { id } = req.params;
  const updates = {};

  // Process allowed updates
  const allowedFields = [
    'name', 'status', 'capacity', 'area', 'yearlyConsumption', 
    'energyClass', 'savingsPotential', 'specialFeatures'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      switch (field) {
        case 'yearlyConsumption':
          updates.yearly_consumption = req.body[field];
          break;
        case 'energyClass':
          updates.energy_class = req.body[field];
          break;
        case 'savingsPotential':
          if (req.body[field].kwh !== undefined) updates.savings_potential_kwh = req.body[field].kwh;
          if (req.body[field].euro !== undefined) updates.savings_potential_euro = req.body[field].euro;
          if (req.body[field].percentage !== undefined) updates.savings_potential_percentage = req.body[field].percentage;
          break;
        case 'specialFeatures':
          updates.special_features = req.body[field];
          break;
        default:
          updates[field] = req.body[field];
      }
    }
  });

  // Recalculate efficiency if area or consumption changed
  if (updates.yearly_consumption !== undefined && updates.area !== undefined) {
    updates.kwh_per_square_meter = updates.area > 0 ? updates.yearly_consumption / updates.area : 0;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: 'No valid updates provided',
      message: 'At least one field must be provided for update'
    });
  }

  try {
    const { data: building, error } = await supabase
      .from('buildings')
      .update({
        ...updates,
        last_update: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Building not found',
          message: 'The specified building was not found or you do not have access to it'
        });
      }
      throw error;
    }

    // Log building update
    await dbHelpers.logActivity(
      req.user.userId,
      'citypulse',
      'building_updated',
      { buildingId: id, updatedFields: Object.keys(updates) }
    );

    res.json({
      message: 'Building updated successfully',
      building: {
        id: building.id,
        name: building.name,
        type: building.type,
        status: building.status,
        capacity: building.capacity,
        area: building.area,
        yearlyConsumption: building.yearly_consumption,
        kwhPerSquareMeter: building.kwh_per_square_meter,
        energyClass: building.energy_class,
        savingsPotential: {
          kwh: building.savings_potential_kwh,
          euro: building.savings_potential_euro,
          percentage: building.savings_potential_percentage
        },
        specialFeatures: building.special_features,
        lastUpdate: building.last_update,
        updatedAt: building.updated_at
      }
    });

  } catch (error) {
    logger.error('Update building error:', error);
    res.status(500).json({
      error: 'Failed to update building',
      message: error.message
    });
  }
}));

/**
 * @route   DELETE /api/v1/citypulse/buildings/:id
 * @desc    Delete building (Admin only)
 * @access  Private (CityPulse - Admin)
 */
router.delete('/:id', [
  authorizeRole(['admin'])
], asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('buildings')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.userId);

    if (error) throw error;

    // Log building deletion
    await dbHelpers.logActivity(
      req.user.userId,
      'citypulse',
      'building_deleted',
      { buildingId: id }
    );

    res.json({
      message: 'Building deleted successfully'
    });

  } catch (error) {
    logger.error('Delete building error:', error);
    res.status(500).json({
      error: 'Failed to delete building',
      message: error.message
    });
  }
}));

export default router;