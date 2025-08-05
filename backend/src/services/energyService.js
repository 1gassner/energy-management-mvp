import { supabase } from '../config/supabase.js';
import { websocketUtils } from '../websocket/index.js';

/**
 * Energy Service - Core business logic for energy data processing
 */
export class EnergyService {
  
  /**
   * Process and aggregate sensor readings into energy data
   */
  static async processSensorReading(sensorId, value, timestamp = new Date().toISOString()) {
    try {
      // Get sensor information
      const { data: sensor, error: sensorError } = await supabase
        .from('sensors')
        .select(`
          id, building_id, type, name, unit,
          building:buildings!inner(id, name, user_id)
        `)
        .eq('id', sensorId)
        .single();

      if (sensorError || !sensor) {
        throw new Error('Sensor not found');
      }

      // Only process energy-type sensors
      if (sensor.type !== 'energy') {
        return { processed: false, reason: 'Not an energy sensor' };
      }

      // Store the raw sensor reading
      const { data: reading, error: readingError } = await supabase
        .from('sensor_readings')
        .insert({
          sensor_id: sensorId,
          value: parseFloat(value),
          timestamp,
          metadata: {
            processed_by: 'EnergyService',
            processing_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (readingError) throw readingError;

      // Aggregate into hourly energy data
      await this.aggregateEnergyData(sensor.building_id, timestamp);

      // Check for alerts
      await this.checkEnergyAlerts(sensor.building_id, parseFloat(value), sensor);

      // Broadcast real-time update
      if (global.io) {
        websocketUtils.broadcastSensorReading(global.io, sensor.building_id, {
          sensorId: sensor.id,
          sensorName: sensor.name,
          value: parseFloat(value),
          unit: sensor.unit,
          timestamp,
          buildingId: sensor.building_id
        });
      }

      return {
        processed: true,
        reading,
        sensor: sensor.name,
        building: sensor.building.name
      };

    } catch (error) {
      console.error('Error processing sensor reading:', error);
      throw error;
    }
  }

  /**
   * Aggregate sensor readings into energy data for different time granularities
   */
  static async aggregateEnergyData(buildingId, timestamp) {
    try {
      const date = new Date(timestamp);
      
      // Aggregate for different granularities
      await Promise.all([
        this.aggregateHourlyData(buildingId, date),
        this.aggregateDailyData(buildingId, date),
        this.aggregateWeeklyData(buildingId, date),
        this.aggregateMonthlyData(buildingId, date)
      ]);

    } catch (error) {
      console.error('Error aggregating energy data:', error);
      throw error;
    }
  }

  /**
   * Aggregate hourly energy data
   */
  static async aggregateHourlyData(buildingId, date) {
    const hourStart = new Date(date);
    hourStart.setMinutes(0, 0, 0);
    
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    // Get all energy sensor readings for this hour
    const { data: readings, error } = await supabase
      .from('sensor_readings')
      .select(`
        value,
        sensors!inner(type, metadata)
      `)
      .eq('sensors.building_id', buildingId)
      .eq('sensors.type', 'energy')
      .gte('timestamp', hourStart.toISOString())
      .lt('timestamp', hourEnd.toISOString());

    if (error) throw error;

    if (!readings || readings.length === 0) return;

    // Calculate aggregated values
    const consumption = this.calculateConsumption(readings);
    const production = this.calculateProduction(readings);
    const efficiency = this.calculateEfficiency(consumption, production);
    const co2Saved = this.calculateCO2Savings(production);

    // Upsert energy data
    await supabase
      .from('energy_data')
      .upsert({
        building_id: buildingId,
        timestamp: hourStart.toISOString(),
        consumption,
        production,
        efficiency,
        co2_saved: co2Saved,
        granularity: 'hour'
      }, {
        onConflict: 'building_id,timestamp,granularity'
      });

    // Broadcast real-time energy update
    if (global.io) {
      websocketUtils.broadcastEnergyUpdate(global.io, buildingId, {
        buildingId,
        timestamp: hourStart.toISOString(),
        consumption,
        production,
        efficiency,
        co2Saved,
        granularity: 'hour'
      });
    }
  }

  /**
   * Aggregate daily energy data
   */
  static async aggregateDailyData(buildingId, date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Get hourly data for this day
    const { data: hourlyData, error } = await supabase
      .from('energy_data')
      .select('consumption, production, efficiency, co2_saved')
      .eq('building_id', buildingId)
      .eq('granularity', 'hour')
      .gte('timestamp', dayStart.toISOString())
      .lt('timestamp', dayEnd.toISOString());

    if (error) throw error;

    if (!hourlyData || hourlyData.length === 0) return;

    const consumption = hourlyData.reduce((sum, d) => sum + d.consumption, 0);
    const production = hourlyData.reduce((sum, d) => sum + d.production, 0);
    const efficiency = hourlyData.reduce((sum, d) => sum + d.efficiency, 0) / hourlyData.length;
    const co2Saved = hourlyData.reduce((sum, d) => sum + d.co2_saved, 0);

    await supabase
      .from('energy_data')
      .upsert({
        building_id: buildingId,
        timestamp: dayStart.toISOString(),
        consumption,
        production,
        efficiency,
        co2_saved: co2Saved,
        granularity: 'day'
      }, {
        onConflict: 'building_id,timestamp,granularity'
      });
  }

  /**
   * Aggregate weekly energy data
   */
  static async aggregateWeeklyData(buildingId, date) {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Get daily data for this week
    const { data: dailyData, error } = await supabase
      .from('energy_data')
      .select('consumption, production, efficiency, co2_saved')
      .eq('building_id', buildingId)
      .eq('granularity', 'day')
      .gte('timestamp', weekStart.toISOString())
      .lt('timestamp', weekEnd.toISOString());

    if (error) throw error;

    if (!dailyData || dailyData.length === 0) return;

    const consumption = dailyData.reduce((sum, d) => sum + d.consumption, 0);
    const production = dailyData.reduce((sum, d) => sum + d.production, 0);
    const efficiency = dailyData.reduce((sum, d) => sum + d.efficiency, 0) / dailyData.length;
    const co2Saved = dailyData.reduce((sum, d) => sum + d.co2_saved, 0);

    await supabase
      .from('energy_data')
      .upsert({
        building_id: buildingId,
        timestamp: weekStart.toISOString(),
        consumption,
        production,
        efficiency,
        co2_saved: co2Saved,
        granularity: 'week'
      }, {
        onConflict: 'building_id,timestamp,granularity'
      });
  }

  /**
   * Aggregate monthly energy data
   */
  static async aggregateMonthlyData(buildingId, date) {
    const monthStart = new Date(date);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    // Get daily data for this month
    const { data: dailyData, error } = await supabase
      .from('energy_data')
      .select('consumption, production, efficiency, co2_saved')
      .eq('building_id', buildingId)
      .eq('granularity', 'day')
      .gte('timestamp', monthStart.toISOString())
      .lt('timestamp', monthEnd.toISOString());

    if (error) throw error;

    if (!dailyData || dailyData.length === 0) return;

    const consumption = dailyData.reduce((sum, d) => sum + d.consumption, 0);
    const production = dailyData.reduce((sum, d) => sum + d.production, 0);
    const efficiency = dailyData.reduce((sum, d) => sum + d.efficiency, 0) / dailyData.length;
    const co2Saved = dailyData.reduce((sum, d) => sum + d.co2_saved, 0);

    await supabase
      .from('energy_data')
      .upsert({
        building_id: buildingId,
        timestamp: monthStart.toISOString(),
        consumption,
        production,
        efficiency,
        co2_saved: co2Saved,
        granularity: 'month'
      }, {
        onConflict: 'building_id,timestamp,granularity'
      });
  }

  /**
   * Calculate consumption from sensor readings
   */
  static calculateConsumption(readings) {
    return readings
      .filter(r => r.sensors.metadata?.type !== 'production')
      .reduce((sum, reading) => sum + reading.value, 0);
  }

  /**
   * Calculate production from sensor readings (solar, etc.)
   */
  static calculateProduction(readings) {
    return readings
      .filter(r => r.sensors.metadata?.type === 'production')
      .reduce((sum, reading) => sum + reading.value, 0);
  }

  /**
   * Calculate energy efficiency
   */
  static calculateEfficiency(consumption, production) {
    if (consumption === 0) return 100;
    
    // Efficiency = (Production / Total Energy Used) * 100
    // Where Total Energy Used = Consumption - Production (net consumption)
    const netConsumption = Math.max(consumption - production, 0.1); // Avoid division by zero
    const efficiency = Math.min((production / consumption) * 100, 100);
    
    return Math.round(efficiency * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate CO2 savings from renewable production
   */
  static calculateCO2Savings(production) {
    // German electricity grid: ~0.4 kg CO2 per kWh
    const co2PerKwh = 0.4;
    return production * co2PerKwh;
  }

  /**
   * Check for energy-related alerts
   */
  static async checkEnergyAlerts(buildingId, value, sensor) {
    try {
      const alerts = [];

      // Get building info for context
      const { data: building, error } = await supabase
        .from('buildings')
        .select('name, yearly_consumption, user_id')
        .eq('id', buildingId)
        .single();

      if (error || !building) return;

      // High consumption alert
      const hourlyThreshold = (building.yearly_consumption || 100000) / (365 * 24);
      if (value > hourlyThreshold * 2) {
        alerts.push({
          type: 'warning',
          title: 'High Energy Consumption',
          message: `${sensor.name} reports ${value} ${sensor.unit}, which is significantly above normal levels.`,
          priority: 'high',
          source: 'EnergyService'
        });
      }

      // Critical consumption alert
      if (value > hourlyThreshold * 5) {
        alerts.push({
          type: 'critical',
          title: 'Critical Energy Consumption',
          message: `${sensor.name} reports ${value} ${sensor.unit}, which is critically high. Immediate attention required.`,
          priority: 'critical',
          source: 'EnergyService'
        });
      }

      // Zero production alert (if it should be producing)
      if (sensor.metadata?.type === 'production' && value === 0) {
        alerts.push({
          type: 'warning',
          title: 'No Energy Production',
          message: `${sensor.name} is not producing energy. Check solar panels or other production equipment.`,
          priority: 'medium',
          source: 'EnergyService'
        });
      }

      // Create alerts in database
      for (const alert of alerts) {
        await supabase
          .from('alerts')
          .insert({
            building_id: buildingId,
            ...alert,
            timestamp: new Date().toISOString()
          });

        // Broadcast alert
        if (global.io) {
          websocketUtils.broadcastAlert(global.io, buildingId, {
            eventType: 'INSERT',
            alert: {
              buildingId,
              ...alert,
              timestamp: new Date().toISOString()
            }
          });
        }
      }

    } catch (error) {
      console.error('Error checking energy alerts:', error);
    }
  }

  /**
   * Calculate energy efficiency score for a building
   */
  static async calculateBuildingEfficiencyScore(buildingId, period = 'month') {
    try {
      const timeRange = this.getTimeRange(period);
      
      const { data: energyData, error } = await supabase
        .from('energy_data')
        .select('consumption, production, efficiency')
        .eq('building_id', buildingId)
        .eq('granularity', 'day')
        .gte('timestamp', timeRange.start.toISOString())
        .lte('timestamp', timeRange.end.toISOString());

      if (error) throw error;

      if (!energyData || energyData.length === 0) {
        return { score: 0, reason: 'No data available' };
      }

      // Calculate various efficiency metrics
      const avgEfficiency = energyData.reduce((sum, d) => sum + d.efficiency, 0) / energyData.length;
      const totalConsumption = energyData.reduce((sum, d) => sum + d.consumption, 0);
      const totalProduction = energyData.reduce((sum, d) => sum + d.production, 0);
      const productionRatio = totalConsumption > 0 ? (totalProduction / totalConsumption) : 0;

      // Composite score (0-100)
      let score = 0;
      
      // Efficiency component (50 points)
      score += (avgEfficiency / 100) * 50;
      
      // Production ratio component (30 points)
      score += Math.min(productionRatio, 1) * 30;
      
      // Consistency component (20 points) - lower variation = higher score
      const efficiencyVariation = this.calculateVariation(energyData.map(d => d.efficiency));
      score += Math.max(0, 20 - (efficiencyVariation / 10) * 20);

      return {
        score: Math.round(score),
        components: {
          averageEfficiency: Math.round(avgEfficiency * 100) / 100,
          productionRatio: Math.round(productionRatio * 100) / 100,
          consistency: Math.round((20 - Math.min(20, (efficiencyVariation / 10) * 20)) * 100) / 100
        },
        period,
        dataPoints: energyData.length
      };

    } catch (error) {
      console.error('Error calculating efficiency score:', error);
      return { score: 0, error: error.message };
    }
  }

  /**
   * Predict energy consumption for next period
   */
  static async predictConsumption(buildingId, forecastDays = 7) {
    try {
      // Get historical data (last 30 days)
      const historicalRange = new Date();
      historicalRange.setDate(historicalRange.getDate() - 30);

      const { data: historicalData, error } = await supabase
        .from('energy_data')
        .select('timestamp, consumption, production')
        .eq('building_id', buildingId)
        .eq('granularity', 'day')
        .gte('timestamp', historicalRange.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (!historicalData || historicalData.length < 7) {
        return { prediction: null, reason: 'Insufficient historical data' };
      }

      // Simple trend-based prediction
      const prediction = this.calculateTrendPrediction(historicalData, forecastDays);

      return {
        prediction,
        confidence: this.calculatePredictionConfidence(historicalData),
        basedOnDays: historicalData.length,
        forecastDays,
        method: 'trend_analysis'
      };

    } catch (error) {
      console.error('Error predicting consumption:', error);
      return { prediction: null, error: error.message };
    }
  }

  /**
   * Generate energy optimization recommendations
   */
  static async generateOptimizationRecommendations(buildingId) {
    try {
      const recommendations = [];

      // Get building and recent energy data
      const [buildingResult, energyResult, alertsResult] = await Promise.all([
        supabase.from('buildings').select('*').eq('id', buildingId).single(),
        supabase.from('energy_data').select('*').eq('building_id', buildingId).eq('granularity', 'day').order('timestamp', { ascending: false }).limit(30),
        supabase.from('alerts').select('*').eq('building_id', buildingId).eq('is_resolved', false)
      ]);

      const building = buildingResult.data;
      const energyData = energyResult.data || [];
      const activeAlerts = alertsResult.data || [];

      if (!building) return [];

      // High consumption recommendation
      const avgConsumption = energyData.reduce((sum, d) => sum + d.consumption, 0) / energyData.length;
      const expectedDaily = (building.yearly_consumption || 100000) / 365;
      
      if (avgConsumption > expectedDaily * 1.2) {
        recommendations.push({
          type: 'consumption_reduction',
          priority: 'high',
          title: 'High Energy Consumption Detected',
          description: `Average daily consumption (${Math.round(avgConsumption)} kWh) is 20% above expected levels.`,
          actions: [
            'Review equipment operating schedules',
            'Check for inefficient or faulty equipment',
            'Consider upgrading to energy-efficient alternatives',
            'Implement smart controls and automation'
          ],
          potentialSavings: {
            kwh: Math.round((avgConsumption - expectedDaily) * 365),
            euro: Math.round((avgConsumption - expectedDaily) * 365 * 0.30),
            percentage: Math.round(((avgConsumption - expectedDaily) / avgConsumption) * 100)
          }
        });
      }

      // Low efficiency recommendation
      const avgEfficiency = energyData.reduce((sum, d) => sum + d.efficiency, 0) / energyData.length;
      if (avgEfficiency < 70) {
        recommendations.push({
          type: 'efficiency_improvement',
          priority: 'medium',
          title: 'Energy Efficiency Below Optimal',
          description: `Current efficiency is ${Math.round(avgEfficiency)}%. Industry standard is 75-85%.`,
          actions: [
            'Conduct energy audit',
            'Upgrade insulation and building envelope',
            'Optimize HVAC systems',
            'Install energy recovery systems'
          ],
          potentialImprovement: {
            targetEfficiency: 80,
            currentEfficiency: Math.round(avgEfficiency),
            improvementPercentage: Math.round(80 - avgEfficiency)
          }
        });
      }

      // Renewable energy recommendation
      const totalProduction = energyData.reduce((sum, d) => sum + d.production, 0);
      const totalConsumption = energyData.reduce((sum, d) => sum + d.consumption, 0);
      const renewableRatio = totalConsumption > 0 ? totalProduction / totalConsumption : 0;

      if (renewableRatio < 0.2) {
        recommendations.push({
          type: 'renewable_energy',
          priority: 'medium',
          title: 'Low Renewable Energy Production',
          description: `Only ${Math.round(renewableRatio * 100)}% of energy comes from renewable sources.`,
          actions: [
            'Install solar panels',
            'Consider wind energy options',
            'Evaluate geothermal systems',
            'Implement energy storage solutions'
          ],
          potentialBenefits: {
            targetRatio: 0.3,
            additionalCapacityNeeded: Math.round(totalConsumption * 0.3 - totalProduction),
            estimatedCostSavings: Math.round((totalConsumption * 0.3 - totalProduction) * 0.30)
          }
        });
      }

      // Critical alerts recommendation
      const criticalAlerts = activeAlerts.filter(a => a.priority === 'critical');
      if (criticalAlerts.length > 0) {
        recommendations.push({
          type: 'immediate_action',
          priority: 'critical',
          title: 'Critical Issues Require Immediate Attention',
          description: `${criticalAlerts.length} critical alerts are active and may impact energy efficiency.`,
          actions: [
            'Address all critical alerts immediately',
            'Inspect affected equipment',
            'Consider emergency maintenance',
            'Monitor closely until resolved'
          ],
          urgency: 'immediate'
        });
      }

      return recommendations;

    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
      return [];
    }
  }

  // Helper methods
  static getTimeRange(period) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'day':
        start.setDate(start.getDate() - 1);
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
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return { start, end };
  }

  static calculateVariation(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  static calculateTrendPrediction(data, forecastDays) {
    if (data.length < 2) return null;

    // Simple linear regression for trend
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.consumption);

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate predictions
    const predictions = [];
    for (let i = 0; i < forecastDays; i++) {
      const futureX = n + i;
      const predictedConsumption = slope * futureX + intercept;
      
      predictions.push({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        consumption: Math.max(0, Math.round(predictedConsumption * 100) / 100),
        trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
      });
    }

    return predictions;
  }

  static calculatePredictionConfidence(data) {
    if (data.length < 7) return 'low';
    if (data.length < 14) return 'medium';
    
    // Calculate consistency of data
    const consumptions = data.map(d => d.consumption);
    const variation = this.calculateVariation(consumptions);
    const mean = consumptions.reduce((sum, val) => sum + val, 0) / consumptions.length;
    const coefficientOfVariation = variation / mean;

    if (coefficientOfVariation < 0.2) return 'high';
    if (coefficientOfVariation < 0.4) return 'medium';
    return 'low';
  }
}

export default EnergyService;