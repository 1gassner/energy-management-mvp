import express from 'express';
import { supabase } from '../../../config/supabase.js';
import { body, param, query, validationResult } from 'express-validator';
import { websocketUtils } from '../../../websocket/index.js';

const router = express.Router();

// ==========================================
// ALERTS OPERATIONS
// ==========================================

/**
 * GET /api/v1/citypulse/alerts
 * Get alerts for user's buildings
 */
router.get('/', [
  query('building_id').optional().isString(),
  query('type').optional().isIn(['critical', 'warning', 'info']),
  query('priority').optional().isIn(['critical', 'high', 'medium', 'low']),
  query('is_read').optional().isBoolean(),
  query('is_resolved').optional().isBoolean(),
  query('from').optional().isISO8601().withMessage('From date must be ISO8601 format'),
  query('to').optional().isISO8601().withMessage('To date must be ISO8601 format'),
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

    const {
      building_id,
      type,
      priority,
      is_read,
      is_resolved,
      from,
      to,
      page = 1,
      limit = 50
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('alerts')
      .select(`
        *,
        building:buildings(id, name, type),
        resolved_by_user:user_profiles(name, email)
      `)
      .or(`building_id.in.(${await getUserBuildingIds(req.user.userId)}),building_id.is.null`)
      .order('timestamp', { ascending: false });

    // Apply filters
    if (building_id) query = query.eq('building_id', building_id);
    if (type) query = query.eq('type', type);
    if (priority) query = query.eq('priority', priority);
    if (is_read !== undefined) query = query.eq('is_read', is_read);
    if (is_resolved !== undefined) query = query.eq('is_resolved', is_resolved);
    if (from) query = query.gte('timestamp', from);
    if (to) query = query.lte('timestamp', to);

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: alerts, error, count } = await query;

    if (error) throw error;

    // Calculate alert statistics
    const stats = await calculateAlertStatistics(req.user.userId);

    res.json({
      alerts: alerts || [],
      statistics: stats,
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
 * GET /api/v1/citypulse/alerts/active
 * Get active (unresolved) alerts for user's buildings
 */
router.get('/active', async (req, res, next) => {
  try {
    const buildingIds = await getUserBuildingIds(req.user.userId);

    const { data: alerts, error } = await supabase
      .from('alerts')
      .select(`
        *,
        building:buildings(id, name, type)
      `)
      .or(`building_id.in.(${buildingIds}),building_id.is.null`)
      .eq('is_resolved', false)
      .order('priority', { ascending: true }) // Critical first
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // Group by priority for easier frontend handling
    const groupedAlerts = {
      critical: alerts?.filter(a => a.priority === 'critical') || [],
      high: alerts?.filter(a => a.priority === 'high') || [],
      medium: alerts?.filter(a => a.priority === 'medium') || [],
      low: alerts?.filter(a => a.priority === 'low') || []
    };

    res.json({
      active: alerts || [],
      grouped: groupedAlerts,
      totalActive: alerts?.length || 0,
      criticalCount: groupedAlerts.critical.length,
      highCount: groupedAlerts.high.length
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/citypulse/alerts/:id
 * Get specific alert details
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Alert ID must be a valid UUID')
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
    const buildingIds = await getUserBuildingIds(req.user.userId);

    const { data: alert, error } = await supabase
      .from('alerts')
      .select(`
        *,
        building:buildings(id, name, type, address),
        resolved_by_user:user_profiles(name, email)
      `)
      .eq('id', id)
      .or(`building_id.in.(${buildingIds}),building_id.is.null`)
      .single();

    if (error || !alert) {
      return res.status(404).json({
        error: 'Alert not found or access denied'
      });
    }

    res.json({ alert });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/citypulse/alerts
 * Create new alert
 */
router.post('/', [
  body('building_id').optional().isString(),
  body('type').isIn(['critical', 'warning', 'info']).withMessage('Invalid alert type'),
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('priority').isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid priority'),
  body('source').optional().isString()
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
      type,
      title,
      message,
      priority,
      source = 'System'
    } = req.body;

    // Verify building ownership if building_id provided
    if (building_id) {
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
    }

    // Create alert
    const { data: alert, error } = await supabase
      .from('alerts')
      .insert({
        building_id,
        type,
        title,
        message,
        priority,
        source,
        timestamp: new Date().toISOString()
      })
      .select(`
        *,
        building:buildings(id, name, type)
      `)
      .single();

    if (error) throw error;

    // Broadcast alert via WebSocket
    if (req.app.get('io') && building_id) {
      websocketUtils.broadcastAlert(req.app.get('io'), building_id, {
        eventType: 'INSERT',
        alert: {
          id: alert.id,
          buildingId: alert.building_id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          priority: alert.priority,
          isRead: alert.is_read,
          isResolved: alert.is_resolved,
          timestamp: alert.timestamp
        }
      });
    }

    res.status(201).json({
      message: 'Alert created successfully',
      alert
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/citypulse/alerts/:id/read
 * Mark alert as read
 */
router.patch('/:id/read', [
  param('id').isUUID().withMessage('Alert ID must be a valid UUID')
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
    const buildingIds = await getUserBuildingIds(req.user.userId);

    // Verify alert ownership and update
    const { data: alert, error } = await supabase
      .from('alerts')
      .update({
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .or(`building_id.in.(${buildingIds}),building_id.is.null`)
      .select()
      .single();

    if (error || !alert) {
      return res.status(404).json({
        error: 'Alert not found or access denied'
      });
    }

    res.json({
      message: 'Alert marked as read',
      alert
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/citypulse/alerts/:id/resolve
 * Mark alert as resolved
 */
router.patch('/:id/resolve', [
  param('id').isUUID().withMessage('Alert ID must be a valid UUID'),
  body('resolution_note').optional().isString()
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
    const { resolution_note } = req.body;
    const buildingIds = await getUserBuildingIds(req.user.userId);

    // Verify alert ownership and update
    const { data: alert, error } = await supabase
      .from('alerts')
      .update({
        is_resolved: true,
        is_read: true,
        resolved_at: new Date().toISOString(),
        resolved_by: req.user.userId,
        updated_at: new Date().toISOString(),
        ...(resolution_note && { resolution_note })
      })
      .eq('id', id)
      .or(`building_id.in.(${buildingIds}),building_id.is.null`)
      .select(`
        *,
        building:buildings(id, name, type)
      `)
      .single();

    if (error || !alert) {
      return res.status(404).json({
        error: 'Alert not found or access denied'
      });
    }

    // Broadcast update via WebSocket
    if (req.app.get('io') && alert.building_id) {
      websocketUtils.broadcastAlert(req.app.get('io'), alert.building_id, {
        eventType: 'UPDATE',
        alert: {
          id: alert.id,
          buildingId: alert.building_id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          priority: alert.priority,
          isRead: alert.is_read,
          isResolved: alert.is_resolved,
          timestamp: alert.timestamp,
          resolvedAt: alert.resolved_at
        }
      });
    }

    res.json({
      message: 'Alert resolved successfully',
      alert
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/citypulse/alerts/bulk/read
 * Mark multiple alerts as read
 */
router.patch('/bulk/read', [
  body('alert_ids').isArray({ min: 1 }).withMessage('Alert IDs array is required'),
  body('alert_ids.*').isUUID().withMessage('Each alert ID must be a valid UUID')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { alert_ids } = req.body;
    const buildingIds = await getUserBuildingIds(req.user.userId);

    const { data: alerts, error } = await supabase
      .from('alerts')
      .update({
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .in('id', alert_ids)
      .or(`building_id.in.(${buildingIds}),building_id.is.null`)
      .select();

    if (error) throw error;

    res.json({
      message: `${alerts?.length || 0} alerts marked as read`,
      updated: alerts?.length || 0
    });

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/citypulse/alerts/:id
 * Delete alert (admin only)
 */
router.delete('/:id', [
  param('id').isUUID().withMessage('Alert ID must be a valid UUID')
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
    const buildingIds = await getUserBuildingIds(req.user.userId);

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin role required to delete alerts'
      });
    }

    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id)
      .or(`building_id.in.(${buildingIds}),building_id.is.null`);

    if (error) throw error;

    res.json({
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// ALERT ANALYTICS AND REPORTING
// ==========================================

/**
 * GET /api/v1/citypulse/alerts/analytics
 * Get alert analytics and trends
 */
router.get('/analytics', [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period'),
  query('building_id').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { period = 'month', building_id } = req.query;
    const buildingIds = await getUserBuildingIds(req.user.userId);

    // Calculate date range
    const now = new Date();
    const periodStart = new Date(now);
    
    switch (period) {
      case 'day':
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'week':
        periodStart.setDate(periodStart.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(periodStart.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(periodStart.getFullYear() - 1);
        break;
    }

    let query = supabase
      .from('alerts')
      .select(`
        type,
        priority,
        is_resolved,
        timestamp,
        building_id,
        building:buildings(name, type)
      `)
      .or(`building_id.in.(${buildingIds}),building_id.is.null`)
      .gte('timestamp', periodStart.toISOString())
      .lte('timestamp', now.toISOString());

    if (building_id) {
      query = query.eq('building_id', building_id);
    }

    const { data: alerts, error } = await query;

    if (error) throw error;

    // Calculate analytics
    const analytics = {
      period,
      totalAlerts: alerts?.length || 0,
      byType: {},
      byPriority: {},
      byBuilding: {},
      resolutionRate: 0,
      averageResolutionTime: 0,
      trends: calculateAlertTrends(alerts || [], period)
    };

    // Group by type
    ['critical', 'warning', 'info'].forEach(type => {
      analytics.byType[type] = alerts?.filter(a => a.type === type).length || 0;
    });

    // Group by priority
    ['critical', 'high', 'medium', 'low'].forEach(priority => {
      analytics.byPriority[priority] = alerts?.filter(a => a.priority === priority).length || 0;
    });

    // Group by building
    alerts?.forEach(alert => {
      if (alert.building_id) {
        if (!analytics.byBuilding[alert.building_id]) {
          analytics.byBuilding[alert.building_id] = {
            buildingName: alert.building?.name || 'Unknown',
            buildingType: alert.building?.type || 'Unknown',
            count: 0
          };
        }
        analytics.byBuilding[alert.building_id].count++;
      }
    });

    // Calculate resolution rate
    const resolvedAlerts = alerts?.filter(a => a.is_resolved) || [];
    analytics.resolutionRate = alerts?.length > 0 
      ? (resolvedAlerts.length / alerts.length) * 100 
      : 0;

    res.json({
      analytics,
      timeRange: {
        from: periodStart.toISOString(),
        to: now.toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// AUTOMATED ALERT GENERATION
// ==========================================

/**
 * POST /api/v1/citypulse/alerts/check
 * Trigger automated alert checks for all user buildings
 */
router.post('/check', async (req, res, next) => {
  try {
    const buildingIds = await getUserBuildingIds(req.user.userId);
    const generatedAlerts = [];

    for (const buildingId of buildingIds.split(',')) {
      const alerts = await checkBuildingAlerts(buildingId);
      generatedAlerts.push(...alerts);
    }

    res.json({
      message: 'Alert check completed',
      generatedAlerts: generatedAlerts.length,
      alerts: generatedAlerts
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function getUserBuildingIds(userId) {
  const { data: buildings, error } = await supabase
    .from('buildings')
    .select('id')
    .eq('user_id', userId);

  if (error) throw error;
  return buildings?.map(b => b.id).join(',') || '';
}

async function calculateAlertStatistics(userId) {
  const buildingIds = await getUserBuildingIds(userId);

  const { data: stats, error } = await supabase
    .from('alerts')
    .select('type, priority, is_resolved, is_read')
    .or(`building_id.in.(${buildingIds}),building_id.is.null`);

  if (error) throw error;

  return {
    total: stats?.length || 0,
    unread: stats?.filter(s => !s.is_read).length || 0,
    unresolved: stats?.filter(s => !s.is_resolved).length || 0,
    critical: stats?.filter(s => s.priority === 'critical' && !s.is_resolved).length || 0,
    high: stats?.filter(s => s.priority === 'high' && !s.is_resolved).length || 0
  };
}

function calculateAlertTrends(alerts, period) {
  const trends = {
    daily: {},
    weekly: {},
    monthly: {}
  };

  alerts.forEach(alert => {
    const date = new Date(alert.timestamp);
    const dayKey = date.toISOString().split('T')[0];
    const weekKey = getWeekKey(date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    trends.daily[dayKey] = (trends.daily[dayKey] || 0) + 1;
    trends.weekly[weekKey] = (trends.weekly[weekKey] || 0) + 1;
    trends.monthly[monthKey] = (trends.monthly[monthKey] || 0) + 1;
  });

  return trends;
}

function getWeekKey(date) {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

async function checkBuildingAlerts(buildingId) {
  const alerts = [];

  try {
    // Get latest energy data
    const { data: latestEnergy, error: energyError } = await supabase
      .from('energy_data')
      .select('consumption, efficiency, timestamp')
      .eq('building_id', buildingId)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (!energyError && latestEnergy?.length > 0) {
      const energy = latestEnergy[0];
      
      // Check for high consumption
      if (energy.consumption > 1000) { // Threshold example
        const alert = await createAutoAlert(
          buildingId,
          'warning',
          'High Energy Consumption Detected',
          `Energy consumption is ${energy.consumption} kWh, which is above normal levels.`,
          'high'
        );
        if (alert) alerts.push(alert);
      }

      // Check for low efficiency
      if (energy.efficiency < 60) {
        const alert = await createAutoAlert(
          buildingId,
          'warning',
          'Low Energy Efficiency',
          `Energy efficiency is ${energy.efficiency}%, which is below optimal levels.`,
          'medium'
        );
        if (alert) alerts.push(alert);
      }
    }

    // Check sensor status
    const { data: sensors, error: sensorsError } = await supabase
      .from('sensors')
      .select('id, name, status, last_reading')
      .eq('building_id', buildingId);

    if (!sensorsError && sensors?.length > 0) {
      const now = new Date();
      
      sensors.forEach(async (sensor) => {
        if (sensor.status === 'error') {
          const alert = await createAutoAlert(
            buildingId,
            'critical',
            'Sensor Error',
            `Sensor "${sensor.name}" is reporting an error status.`,
            'critical'
          );
          if (alert) alerts.push(alert);
        }

        // Check for stale data (no reading in last hour)
        if (sensor.last_reading) {
          const lastReading = new Date(sensor.last_reading);
          const hoursSinceReading = (now - lastReading) / (1000 * 60 * 60);
          
          if (hoursSinceReading > 1) {
            const alert = await createAutoAlert(
              buildingId,
              'warning',
              'Sensor Data Stale',
              `Sensor "${sensor.name}" has not reported data for ${Math.round(hoursSinceReading)} hours.`,
              'medium'
            );
            if (alert) alerts.push(alert);
          }
        }
      });
    }

  } catch (error) {
    console.error('Error checking building alerts:', error);
  }

  return alerts;
}

async function createAutoAlert(buildingId, type, title, message, priority) {
  try {
    // Check if similar alert already exists in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data: existingAlert, error: checkError } = await supabase
      .from('alerts')
      .select('id')
      .eq('building_id', buildingId)
      .eq('title', title)
      .eq('is_resolved', false)
      .gte('timestamp', oneDayAgo.toISOString())
      .limit(1);

    if (checkError) throw checkError;

    // Don't create duplicate alerts
    if (existingAlert?.length > 0) {
      return null;
    }

    const { data: alert, error } = await supabase
      .from('alerts')
      .insert({
        building_id: buildingId,
        type,
        title,
        message,
        priority,
        source: 'Automated System',
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return alert;

  } catch (error) {
    console.error('Error creating auto alert:', error);
    return null;
  }
}

export default router;