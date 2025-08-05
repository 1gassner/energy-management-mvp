import { supabase } from '../config/supabase.js';
import { websocketUtils } from '../websocket/index.js';

/**
 * Alert Service - Smart alert generation and management
 */
export class AlertService {

  /**
   * Generate automated alerts for all buildings
   */
  static async generateAutomatedAlerts() {
    try {
      console.log('🚨 Starting automated alert generation...');
      
      const { data: buildings, error } = await supabase
        .from('buildings')
        .select('id, name, type, yearly_consumption, user_id')
        .eq('status', 'online');

      if (error) throw error;

      let totalAlerts = 0;
      const results = [];

      for (const building of buildings || []) {
        try {
          const alerts = await this.checkBuildingAlerts(building);
          totalAlerts += alerts.length;
          results.push({
            buildingId: building.id,
            buildingName: building.name,
            alertsGenerated: alerts.length,
            alerts
          });
        } catch (buildingError) {
          console.error(`Error checking alerts for building ${building.id}:`, buildingError);
          results.push({
            buildingId: building.id,
            buildingName: building.name,
            error: buildingError.message
          });
        }
      }

      console.log(`✅ Alert generation complete. Generated ${totalAlerts} alerts for ${buildings?.length || 0} buildings.`);

      return {
        totalBuildings: buildings?.length || 0,
        totalAlerts,
        results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error generating automated alerts:', error);
      throw error;
    }
  }

  /**
   * Check all alert conditions for a specific building
   */
  static async checkBuildingAlerts(building) {
    const alerts = [];

    try {
      // Run all alert checks in parallel
      const [
        energyAlerts,
        sensorAlerts,
        performanceAlerts,
        systemAlerts
      ] = await Promise.all([
        this.checkEnergyAlerts(building),
        this.checkSensorAlerts(building),
        this.checkPerformanceAlerts(building),
        this.checkSystemAlerts(building)
      ]);

      alerts.push(...energyAlerts, ...sensorAlerts, ...performanceAlerts, ...systemAlerts);

      // Create alerts in database and broadcast
      for (const alert of alerts) {
        await this.createAlert(building.id, alert);
      }

    } catch (error) {
      console.error(`Error checking building alerts for ${building.id}:`, error);
    }

    return alerts;
  }

  /**
   * Check energy-related alerts
   */
  static async checkEnergyAlerts(building) {
    const alerts = [];

    try {
      // Get latest energy data
      const { data: latestEnergy, error } = await supabase
        .from('energy_data')
        .select('consumption, production, efficiency, timestamp')
        .eq('building_id', building.id)
        .eq('granularity', 'hour')
        .order('timestamp', { ascending: false })
        .limit(24); // Last 24 hours

      if (error) throw error;

      if (!latestEnergy || latestEnergy.length === 0) {
        alerts.push({
          type: 'warning',
          title: 'No Energy Data',
          message: `No energy data received for ${building.name} in the last 24 hours.`,
          priority: 'medium',
          category: 'data_missing'
        });
        return alerts;
      }

      const latest = latestEnergy[0];
      const last24Hours = latestEnergy;

      // High consumption alert
      const expectedHourly = (building.yearly_consumption || 100000) / (365 * 24);
      if (latest.consumption > expectedHourly * 2) {
        alerts.push({
          type: 'warning',
          title: 'High Energy Consumption',
          message: `Current consumption (${latest.consumption.toFixed(1)} kWh) is ${Math.round((latest.consumption / expectedHourly - 1) * 100)}% above normal levels.`,
          priority: latest.consumption > expectedHourly * 3 ? 'critical' : 'high',
          category: 'high_consumption',
          metadata: {
            currentConsumption: latest.consumption,
            expectedConsumption: expectedHourly,
            exceedsBy: latest.consumption - expectedHourly
          }
        });
      }

      // Critical consumption alert
      if (latest.consumption > expectedHourly * 5) {
        alerts.push({
          type: 'critical',
          title: 'Critical Energy Consumption',
          message: `Energy consumption (${latest.consumption.toFixed(1)} kWh) is critically high. Immediate investigation required.`,
          priority: 'critical',
          category: 'critical_consumption'
        });
      }

      // Low efficiency alert
      if (latest.efficiency < 60) {
        alerts.push({
          type: 'warning',
          title: 'Low Energy Efficiency',
          message: `Energy efficiency (${latest.efficiency.toFixed(1)}%) is below optimal levels. Target efficiency is 75-85%.`,
          priority: latest.efficiency < 40 ? 'high' : 'medium',
          category: 'low_efficiency',
          metadata: {
            currentEfficiency: latest.efficiency,
            targetEfficiency: 75
          }
        });
      }

      // No production alert (if solar panels expected)
      if (building.type !== 'hallenbad' && latest.production === 0) {
        const hour = new Date(latest.timestamp).getHours();
        if (hour >= 8 && hour <= 18) { // Daylight hours
          alerts.push({
            type: 'warning',
            title: 'No Energy Production',
            message: `No renewable energy production detected during daylight hours. Check solar panels or production equipment.`,
            priority: 'medium',
            category: 'no_production'
          });
        }
      }

      // Consumption trend alert
      if (last24Hours.length >= 24) {
        const avgLast12 = last24Hours.slice(0, 12).reduce((sum, d) => sum + d.consumption, 0) / 12;
        const avgPrevious12 = last24Hours.slice(12, 24).reduce((sum, d) => sum + d.consumption, 0) / 12;
        
        if (avgLast12 > avgPrevious12 * 1.3) {
          alerts.push({
            type: 'info',
            title: 'Increasing Consumption Trend',
            message: `Energy consumption has increased by ${Math.round((avgLast12 / avgPrevious12 - 1) * 100)}% compared to the previous 12 hours.`,
            priority: 'low',
            category: 'consumption_trend'
          });
        }
      }

    } catch (error) {
      console.error('Error checking energy alerts:', error);
    }

    return alerts;
  }

  /**
   * Check sensor-related alerts
   */
  static async checkSensorAlerts(building) {
    const alerts = [];

    try {
      const { data: sensors, error } = await supabase
        .from('sensors')
        .select('id, name, type, status, last_reading, current_value, metadata')
        .eq('building_id', building.id);

      if (error) throw error;

      const now = new Date();

      for (const sensor of sensors || []) {
        // Sensor error status
        if (sensor.status === 'error') {
          alerts.push({
            type: 'critical',
            title: 'Sensor Error',
            message: `Sensor "${sensor.name}" (${sensor.type}) is reporting an error status.`,
            priority: 'critical',
            category: 'sensor_error',
            metadata: { sensorId: sensor.id, sensorName: sensor.name }
          });
        }

        // Sensor offline/inactive
        if (sensor.status === 'inactive') {
          alerts.push({
            type: 'warning',
            title: 'Sensor Offline',
            message: `Sensor "${sensor.name}" (${sensor.type}) is offline.`,
            priority: 'high',
            category: 'sensor_offline',
            metadata: { sensorId: sensor.id, sensorName: sensor.name }
          });
        }

        // Stale data
        if (sensor.last_reading) {
          const lastReading = new Date(sensor.last_reading);
          const hoursSinceReading = (now - lastReading) / (1000 * 60 * 60);
          
          if (hoursSinceReading > 2) { // No data for 2+ hours
            alerts.push({
              type: 'warning',
              title: 'Sensor Data Stale',
              message: `Sensor "${sensor.name}" has not reported data for ${Math.round(hoursSinceReading)} hours.`,
              priority: hoursSinceReading > 24 ? 'high' : 'medium',
              category: 'stale_data',
              metadata: { 
                sensorId: sensor.id, 
                sensorName: sensor.name,
                hoursSinceReading: Math.round(hoursSinceReading)
              }
            });
          }
        }

        // Extreme values (if thresholds defined)
        if (sensor.current_value !== null && sensor.metadata?.alert_threshold) {
          const threshold = sensor.metadata.alert_threshold;
          
          if (typeof threshold === 'object') {
            if (threshold.max && sensor.current_value > threshold.max) {
              alerts.push({
                type: 'warning',
                title: 'Sensor Value Too High',
                message: `${sensor.name} reports ${sensor.current_value} which exceeds maximum threshold of ${threshold.max}.`,
                priority: 'medium',
                category: 'value_high',
                metadata: { sensorId: sensor.id, value: sensor.current_value, threshold: threshold.max }
              });
            }
            
            if (threshold.min && sensor.current_value < threshold.min) {
              alerts.push({
                type: 'warning',
                title: 'Sensor Value Too Low',
                message: `${sensor.name} reports ${sensor.current_value} which is below minimum threshold of ${threshold.min}.`,
                priority: 'medium',
                category: 'value_low',
                metadata: { sensorId: sensor.id, value: sensor.current_value, threshold: threshold.min }
              });
            }
          }
        }
      }

    } catch (error) {
      console.error('Error checking sensor alerts:', error);
    }

    return alerts;
  }

  /**
   * Check performance-related alerts
   */
  static async checkPerformanceAlerts(building) {
    const alerts = [];

    try {
      // Get performance data for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: performanceData, error } = await supabase
        .from('energy_data')
        .select('consumption, production, efficiency, co2_saved, timestamp')
        .eq('building_id', building.id)
        .eq('granularity', 'day')
        .gte('timestamp', sevenDaysAgo.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (!performanceData || performanceData.length < 3) return alerts;

      // Calculate performance metrics
      const avgEfficiency = performanceData.reduce((sum, d) => sum + d.efficiency, 0) / performanceData.length;
      const totalConsumption = performanceData.reduce((sum, d) => sum + d.consumption, 0);
      const totalProduction = performanceData.reduce((sum, d) => sum + d.production, 0);

      // Poor efficiency trend
      if (avgEfficiency < 50) {
        alerts.push({
          type: 'warning',
          title: 'Poor Energy Efficiency',
          message: `Average efficiency (${avgEfficiency.toFixed(1)}%) is significantly below target levels.`,
          priority: 'high',
          category: 'poor_efficiency',
          metadata: {
            avgEfficiency: avgEfficiency,
            targetEfficiency: 75,
            period: '7 days'
          }
        });
      }

      // Declining efficiency
      if (performanceData.length >= 7) {
        const recent3 = performanceData.slice(0, 3);
        const older3 = performanceData.slice(-3);
        
        const recentAvg = recent3.reduce((sum, d) => sum + d.efficiency, 0) / recent3.length;
        const olderAvg = older3.reduce((sum, d) => sum + d.efficiency, 0) / older3.length;
        
        if (recentAvg < olderAvg * 0.9) {
          alerts.push({
            type: 'info',
            title: 'Declining Efficiency Trend',
            message: `Energy efficiency has declined by ${Math.round((1 - recentAvg/olderAvg) * 100)}% over the past week.`,
            priority: 'medium',
            category: 'efficiency_decline'
          });
        }
      }

      // High consumption variance
      const consumptions = performanceData.map(d => d.consumption);
      const avgConsumption = consumptions.reduce((sum, c) => sum + c, 0) / consumptions.length;
      const variance = consumptions.reduce((sum, c) => sum + Math.pow(c - avgConsumption, 2), 0) / consumptions.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / avgConsumption;

      if (coefficientOfVariation > 0.3) {
        alerts.push({
          type: 'info',
          title: 'Inconsistent Energy Usage',
          message: `Energy consumption shows high variability (${Math.round(coefficientOfVariation * 100)}% coefficient of variation). Consider reviewing usage patterns.`,
          priority: 'low',
          category: 'usage_inconsistent'
        });
      }

    } catch (error) {
      console.error('Error checking performance alerts:', error);
    }

    return alerts;
  }

  /**
   * Check system-related alerts
   */
  static async checkSystemAlerts(building) {
    const alerts = [];

    try {
      // Check for unresolved critical alerts older than 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: oldCriticalAlerts, error } = await supabase
        .from('alerts')
        .select('id, title, timestamp')
        .eq('building_id', building.id)
        .eq('priority', 'critical')
        .eq('is_resolved', false)
        .lt('timestamp', oneDayAgo.toISOString());

      if (error) throw error;

      if (oldCriticalAlerts && oldCriticalAlerts.length > 0) {
        alerts.push({
          type: 'critical',
          title: 'Unresolved Critical Alerts',
          message: `${oldCriticalAlerts.length} critical alerts have been unresolved for more than 24 hours.`,
          priority: 'critical',
          category: 'unresolved_critical'
        });
      }

      // Check for too many alerts in short period
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      const { data: recentAlerts, error: recentError } = await supabase
        .from('alerts')
        .select('id')
        .eq('building_id', building.id)
        .gte('timestamp', twoHoursAgo.toISOString());

      if (!recentError && recentAlerts && recentAlerts.length > 10) {
        alerts.push({
          type: 'warning',
          title: 'High Alert Frequency',
          message: `${recentAlerts.length} alerts generated in the last 2 hours. This may indicate a systemic issue.`,
          priority: 'high',
          category: 'alert_frequency'
        });
      }

    } catch (error) {
      console.error('Error checking system alerts:', error);
    }

    return alerts;
  }

  /**
   * Create an alert in the database and broadcast it
   */
  static async createAlert(buildingId, alertData) {
    try {
      // Check for duplicate alerts in the last 6 hours
      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

      const { data: existingAlert, error: checkError } = await supabase
        .from('alerts')
        .select('id')
        .eq('building_id', buildingId)
        .eq('title', alertData.title)
        .eq('is_resolved', false)
        .gte('timestamp', sixHoursAgo.toISOString())
        .limit(1);

      if (checkError) throw checkError;

      // Don't create duplicate alerts
      if (existingAlert && existingAlert.length > 0) {
        return null;
      }

      // Create the alert
      const { data: alert, error } = await supabase
        .from('alerts')
        .insert({
          building_id: buildingId,
          type: alertData.type,
          title: alertData.title,
          message: alertData.message,
          priority: alertData.priority,
          source: 'AlertService',
          timestamp: new Date().toISOString(),
          metadata: alertData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Broadcast the alert via WebSocket
      if (global.io) {
        websocketUtils.broadcastAlert(global.io, buildingId, {
          eventType: 'INSERT',
          alert: {
            id: alert.id,
            buildingId: buildingId,
            type: alert.type,
            title: alert.title,
            message: alert.message,
            priority: alert.priority,
            isRead: false,
            isResolved: false,
            timestamp: alert.timestamp,
            category: alertData.category
          }
        });
      }

      console.log(`🚨 Created ${alertData.priority} alert for building ${buildingId}: ${alertData.title}`);

      return alert;

    } catch (error) {
      console.error('Error creating alert:', error);
      return null;
    }
  }

  /**
   * Resolve alerts automatically based on conditions
   */
  static async autoResolveAlerts() {
    try {
      console.log('🔄 Starting auto-resolution of alerts...');

      // Get all unresolved alerts
      const { data: unresolvedAlerts, error } = await supabase
        .from('alerts')
        .select(`
          id, building_id, title, type, priority, 
          timestamp, metadata,
          building:buildings(id, name)
        `)
        .eq('is_resolved', false);

      if (error) throw error;

      let resolvedCount = 0;

      for (const alert of unresolvedAlerts || []) {
        const shouldResolve = await this.shouldAutoResolveAlert(alert);
        
        if (shouldResolve.resolve) {
          await supabase
            .from('alerts')
            .update({
              is_resolved: true,
              resolved_at: new Date().toISOString(),
              resolved_by: null, // Auto-resolved
              resolution_note: shouldResolve.reason,
              updated_at: new Date().toISOString()
            })
            .eq('id', alert.id);

          console.log(`✅ Auto-resolved alert ${alert.id}: ${alert.title} - ${shouldResolve.reason}`);
          resolvedCount++;

          // Broadcast resolution
          if (global.io) {
            websocketUtils.broadcastAlert(global.io, alert.building_id, {
              eventType: 'UPDATE',
              alert: {
                id: alert.id,
                buildingId: alert.building_id,
                isResolved: true,
                resolvedAt: new Date().toISOString(),
                autoResolved: true,
                resolutionReason: shouldResolve.reason
              }
            });
          }
        }
      }

      console.log(`✅ Auto-resolution complete. Resolved ${resolvedCount} alerts.`);

      return {
        totalChecked: unresolvedAlerts?.length || 0,
        resolved: resolvedCount,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error auto-resolving alerts:', error);
      throw error;
    }
  }

  /**
   * Check if an alert should be auto-resolved
   */
  static async shouldAutoResolveAlert(alert) {
    try {
      const now = new Date();
      const alertTime = new Date(alert.timestamp);
      const hoursOld = (now - alertTime) / (1000 * 60 * 60);

      // Auto-resolve sensor data stale alerts if recent data is available
      if (alert.metadata?.sensorId && alert.title.includes('Sensor Data Stale')) {
        const { data: sensor, error } = await supabase
          .from('sensors')
          .select('last_reading')
          .eq('id', alert.metadata.sensorId)
          .single();

        if (!error && sensor) {
          const lastReading = new Date(sensor.last_reading);
          const minutesSinceReading = (now - lastReading) / (1000 * 60);
          
          if (minutesSinceReading < 60) { // Recent data within last hour
            return {
              resolve: true,
              reason: 'Sensor is now reporting fresh data'
            };
          }
        }
      }

      // Auto-resolve high consumption alerts if consumption has normalized
      if (alert.title.includes('High Energy Consumption')) {
        const { data: recentEnergy, error } = await supabase
          .from('energy_data')
          .select('consumption')
          .eq('building_id', alert.building_id)
          .eq('granularity', 'hour')
          .order('timestamp', { ascending: false })
          .limit(3);

        if (!error && recentEnergy && recentEnergy.length >= 3) {
          const avgRecent = recentEnergy.reduce((sum, d) => sum + d.consumption, 0) / recentEnergy.length;
          const expectedHourly = 100; // This should be calculated based on building data
          
          if (avgRecent <= expectedHourly * 1.2) { // Within 20% of normal
            return {
              resolve: true,
              reason: 'Energy consumption has returned to normal levels'
            };
          }
        }
      }

      // Auto-resolve sensor error alerts if sensor is now active
      if (alert.title.includes('Sensor Error') && alert.metadata?.sensorId) {
        const { data: sensor, error } = await supabase
          .from('sensors')
          .select('status')
          .eq('id', alert.metadata.sensorId)
          .single();

        if (!error && sensor && sensor.status === 'active') {
          return {
            resolve: true,
            reason: 'Sensor status has been restored to active'
          };
        }
      }

      // Auto-resolve old info alerts (older than 24 hours)
      if (alert.type === 'info' && hoursOld > 24) {
        return {
          resolve: true,
          reason: 'Information alert auto-expired after 24 hours'
        };
      }

      // Auto-resolve low efficiency alerts if efficiency has improved
      if (alert.title.includes('Low Energy Efficiency')) {
        const { data: recentEnergy, error } = await supabase
          .from('energy_data')
          .select('efficiency')
          .eq('building_id', alert.building_id)
          .eq('granularity', 'hour')
          .order('timestamp', { ascending: false })
          .limit(6); // Last 6 hours

        if (!error && recentEnergy && recentEnergy.length >= 6) {
          const avgEfficiency = recentEnergy.reduce((sum, d) => sum + d.efficiency, 0) / recentEnergy.length;
          
          if (avgEfficiency >= 70) { // Above threshold
            return {
              resolve: true,
              reason: 'Energy efficiency has improved to acceptable levels'
            };
          }
        }
      }

      return { resolve: false };

    } catch (error) {
      console.error('Error checking auto-resolve conditions:', error);
      return { resolve: false };
    }
  }

  /**
   * Get alert statistics and insights
   */
  static async getAlertInsights(userId, period = 'month') {
    try {
      // Get user's buildings
      const { data: buildings, error: buildingsError } = await supabase
        .from('buildings')
        .select('id')
        .eq('user_id', userId);

      if (buildingsError) throw buildingsError;

      const buildingIds = buildings?.map(b => b.id) || [];
      if (buildingIds.length === 0) return null;

      // Calculate time range
      const now = new Date();
      const timeRange = this.getTimeRange(period);

      // Get alerts for the period
      const { data: alerts, error } = await supabase
        .from('alerts')
        .select('type, priority, is_resolved, timestamp, building_id')
        .in('building_id', buildingIds)
        .gte('timestamp', timeRange.start.toISOString())
        .lte('timestamp', timeRange.end.toISOString());

      if (error) throw error;

      // Calculate insights
      const insights = {
        totalAlerts: alerts?.length || 0,
        criticalAlerts: alerts?.filter(a => a.priority === 'critical').length || 0,
        resolvedAlerts: alerts?.filter(a => a.is_resolved).length || 0,
        resolutionRate: alerts?.length > 0 ? 
          (alerts.filter(a => a.is_resolved).length / alerts.length) * 100 : 0,
        
        // Trends
        alertTrends: this.calculateAlertTrends(alerts || [], period),
        
        // Most common issues
        commonIssues: this.identifyCommonIssues(alerts || []),
        
        // Building performance
        buildingRanking: await this.rankBuildingsByAlerts(buildingIds, timeRange),
        
        // Recommendations
        recommendations: this.generateAlertRecommendations(alerts || [])
      };

      return insights;

    } catch (error) {
      console.error('Error getting alert insights:', error);
      throw error;
    }
  }

  // Helper methods
  static getTimeRange(period) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return { start, end };
  }

  static calculateAlertTrends(alerts, period) {
    // Implementation for trend calculation
    return {
      increasing: false,
      percentageChange: 0,
      pattern: 'stable'
    };
  }

  static identifyCommonIssues(alerts) {
    const issues = {};
    
    alerts.forEach(alert => {
      const key = alert.title.split(' ').slice(0, 3).join(' '); // First 3 words
      issues[key] = (issues[key] || 0) + 1;
    });

    return Object.entries(issues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }

  static async rankBuildingsByAlerts(buildingIds, timeRange) {
    // Implementation for building ranking
    return [];
  }

  static generateAlertRecommendations(alerts) {
    const recommendations = [];

    const criticalCount = alerts.filter(a => a.priority === 'critical').length;
    if (criticalCount > 5) {
      recommendations.push({
        priority: 'high',
        title: 'High Critical Alert Volume',
        message: 'Consider implementing preventive maintenance to reduce critical alerts.',
        action: 'Schedule maintenance review'
      });
    }

    return recommendations;
  }
}

export default AlertService;