import express from 'express';
import { supabase } from '../../config/supabase.js';
import { body, query, validationResult } from 'express-validator';

const router = express.Router();

// ==========================================
// CROSS-FRONTEND SHARED FEATURES
// ==========================================

/**
 * GET /api/v1/shared/activity
 * Get cross-frontend activity feed for user
 */
router.get('/activity', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('frontend').optional().isIn(['flowmind', 'quantum', 'velocity', 'citypulse']).withMessage('Invalid frontend'),
  query('days').optional().isInt({ min: 1, max: 30 }).withMessage('Days must be between 1 and 30')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { limit = 50, frontend, days = 7 } = req.query;
    const userId = req.user.userId;

    // Calculate time range
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    let query = supabase
      .from('cross_frontend_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', since.toISOString())
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));

    if (frontend) {
      query = query.eq('source_frontend', frontend);
    }

    const { data: activities, error } = await query;

    if (error) throw error;

    // Group activities by date for better organization
    const groupedActivities = groupActivitiesByDate(activities || []);

    // Get activity statistics
    const stats = calculateActivityStats(activities || []);

    res.json({
      activities: activities || [],
      groupedByDate: groupedActivities,
      statistics: stats,
      timeRange: {
        since: since.toISOString(),
        days: parseInt(days)
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/shared/activity
 * Log cross-frontend activity
 */
router.post('/activity', [
  body('source_frontend').isIn(['flowmind', 'quantum', 'velocity', 'citypulse']).withMessage('Invalid source frontend'),
  body('target_frontend').optional().isIn(['flowmind', 'quantum', 'velocity', 'citypulse']).withMessage('Invalid target frontend'),
  body('activity_type').notEmpty().withMessage('Activity type is required'),
  body('data').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { source_frontend, target_frontend, activity_type, data = {} } = req.body;
    const userId = req.user.userId;

    const { data: activity, error } = await supabase
      .from('cross_frontend_activities')
      .insert({
        user_id: userId,
        source_frontend,
        target_frontend,
        activity_type,
        data,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Activity logged successfully',
      activity
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/shared/ai-analysis
 * Get AI-powered insights across all frontends
 */
router.get('/ai-analysis', [
  query('type').optional().isIn(['energy', 'swarm', 'overall']).withMessage('Invalid analysis type')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { type = 'overall' } = req.query;
    const userId = req.user.userId;

    let analysis = {};

    // Energy analysis (CityPulse data)
    if (type === 'energy' || type === 'overall') {
      analysis.energy = await generateEnergyAnalysis(userId);
    }

    // Swarm analysis (Quantum/Velocity data)
    if (type === 'swarm' || type === 'overall') {
      analysis.swarm = await generateSwarmAnalysis(userId);
    }

    // Overall cross-frontend insights
    if (type === 'overall') {
      analysis.crossFrontend = await generateCrossFrontendInsights(userId);
    }

    res.json({
      analysis,
      type,
      generatedAt: new Date().toISOString(),
      aiModel: 'claude-3-haiku',
      confidence: calculateAnalysisConfidence(analysis)
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/shared/optimization-suggestions
 * Get optimization suggestions across all enabled frontends
 */
router.get('/optimization-suggestions', async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user's enabled features
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select(`
        preferences,
        organization:organizations!inner(features)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    const enabledFeatures = userProfile.organization.features;
    const suggestions = [];

    // CityPulse optimization suggestions
    if (enabledFeatures.citypulse) {
      const citypulseSuggestions = await generateCityPulseOptimizations(userId);
      suggestions.push(...citypulseSuggestions);
    }

    // Swarm optimization suggestions
    if (enabledFeatures.quantum || enabledFeatures.velocity) {
      const swarmSuggestions = await generateSwarmOptimizations(userId);
      suggestions.push(...swarmSuggestions);
    }

    // FlowMind optimization suggestions
    if (enabledFeatures.flowmind) {
      const flowmindSuggestions = await generateFlowMindOptimizations(userId);
      suggestions.push(...flowmindSuggestions);
    }

    // Cross-frontend optimizations
    const crossOptimizations = await generateCrossOptimizations(userId, enabledFeatures);
    suggestions.push(...crossOptimizations);

    // Prioritize and rank suggestions
    const rankedSuggestions = rankSuggestions(suggestions);

    res.json({
      suggestions: rankedSuggestions,
      enabledFeatures,
      totalSuggestions: suggestions.length,
      highPriority: rankedSuggestions.filter(s => s.priority === 'high').length,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/shared/user-preferences
 * Get user preferences across all frontends
 */
router.get('/user-preferences', async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select(`
        preferences,
        organization:organizations!inner(features, plan)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({
      preferences: userProfile.preferences,
      availableFeatures: userProfile.organization.features,
      plan: userProfile.organization.plan,
      lastUpdated: userProfile.updated_at
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/shared/user-preferences
 * Update user preferences for specific frontend
 */
router.put('/user-preferences', [
  body('frontend').isIn(['flowmind', 'quantum', 'velocity', 'citypulse']).withMessage('Invalid frontend'),
  body('preferences').isObject().withMessage('Preferences must be an object')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { frontend, preferences } = req.body;
    const userId = req.user.userId;

    // Get current preferences
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Update specific frontend preferences
    const updatedPreferences = {
      ...currentProfile.preferences,
      [frontend]: {
        ...currentProfile.preferences[frontend],
        ...preferences
      }
    };

    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update({
        preferences: updatedPreferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('preferences')
      .single();

    if (error) throw error;

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedProfile.preferences,
      frontend
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/shared/notifications
 * Get cross-frontend notifications
 */
router.get('/notifications', [
  query('unread_only').optional().isBoolean(),
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

    const { unread_only = false, limit = 50 } = req.query;
    const userId = req.user.userId;

    // Get notifications from different sources
    const [alerts, activities, systemNotifications] = await Promise.all([
      getCriticalAlerts(userId),
      getRecentActivities(userId, 5),
      getSystemNotifications(userId)
    ]);

    // Combine and format notifications
    const notifications = [
      ...alerts.map(alert => ({
        id: `alert-${alert.id}`,
        type: 'alert',
        title: alert.title,
        message: alert.message,
        priority: alert.priority,
        timestamp: alert.timestamp,
        source: 'citypulse',
        isRead: alert.is_read,
        metadata: { alertId: alert.id, buildingId: alert.building_id }
      })),
      
      ...activities.map(activity => ({
        id: `activity-${activity.id}`,
        type: 'activity',
        title: formatActivityTitle(activity),
        message: formatActivityMessage(activity),
        priority: 'info',
        timestamp: activity.timestamp,
        source: activity.source_frontend,
        isRead: true,
        metadata: { activityType: activity.activity_type }
      })),

      ...systemNotifications
    ];

    // Filter and sort
    let filteredNotifications = notifications;
    if (unread_only) {
      filteredNotifications = notifications.filter(n => !n.isRead);
    }

    filteredNotifications = filteredNotifications
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.json({
      notifications: filteredNotifications,
      totalCount: notifications.length,
      unreadCount: notifications.filter(n => !n.isRead).length,
      summary: {
        alerts: alerts.length,
        activities: activities.length,
        system: systemNotifications.length
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/shared/data-export
 * Export user data across all frontends
 */
router.get('/data-export', [
  query('format').optional().isIn(['json', 'csv']).withMessage('Invalid format'),
  query('frontends').optional().isString(),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601()
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
      format = 'json', 
      frontends = 'all',
      date_from,
      date_to 
    } = req.query;
    
    const userId = req.user.userId;
    const requestedFrontends = frontends === 'all' ? 
      ['flowmind', 'quantum', 'velocity', 'citypulse'] : 
      frontends.split(',');

    const exportData = {
      user: userId,
      exportedAt: new Date().toISOString(),
      dateRange: {
        from: date_from || null,
        to: date_to || null
      },
      frontends: {}
    };

    // Export data from each frontend
    for (const frontend of requestedFrontends) {
      try {
        exportData.frontends[frontend] = await exportFrontendData(userId, frontend, date_from, date_to);
      } catch (frontendError) {
        console.error(`Error exporting ${frontend} data:`, frontendError);
        exportData.frontends[frontend] = { error: frontendError.message };
      }
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(exportData);
      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', `attachment; filename="data-export-${userId}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      res.json(exportData);
    }

  } catch (error) {
    next(error);
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function groupActivitiesByDate(activities) {
  const grouped = {};
  
  activities.forEach(activity => {
    const date = activity.timestamp.split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(activity);
  });

  return grouped;
}

function calculateActivityStats(activities) {
  const stats = {
    total: activities.length,
    byFrontend: {},
    byType: {},
    dailyAverage: 0
  };

  activities.forEach(activity => {
    // Count by frontend
    stats.byFrontend[activity.source_frontend] = 
      (stats.byFrontend[activity.source_frontend] || 0) + 1;
    
    // Count by type
    stats.byType[activity.activity_type] = 
      (stats.byType[activity.activity_type] || 0) + 1;
  });

  // Calculate daily average
  if (activities.length > 0) {
    const firstActivity = new Date(activities[activities.length - 1].timestamp);
    const lastActivity = new Date(activities[0].timestamp);
    const daysDiff = Math.max(1, Math.ceil((lastActivity - firstActivity) / (1000 * 60 * 60 * 24)));
    stats.dailyAverage = activities.length / daysDiff;
  }

  return stats;
}

async function generateEnergyAnalysis(userId) {
  try {
    // Get user's buildings and recent energy data
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('id, name, yearly_consumption')
      .eq('user_id', userId);

    if (buildingsError) throw buildingsError;

    if (!buildings || buildings.length === 0) {
      return { available: false, reason: 'No buildings found' };
    }

    const buildingIds = buildings.map(b => b.id);

    // Get last 30 days of energy data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: energyData, error: energyError } = await supabase
      .from('energy_data')
      .select('consumption, production, efficiency, co2_saved')
      .in('building_id', buildingIds)
      .eq('granularity', 'day')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (energyError) throw energyError;

    // Generate AI insights
    const insights = {
      available: true,
      totalConsumption: energyData?.reduce((sum, d) => sum + d.consumption, 0) || 0,
      totalProduction: energyData?.reduce((sum, d) => sum + d.production, 0) || 0,
      averageEfficiency: energyData?.length > 0 ? 
        energyData.reduce((sum, d) => sum + d.efficiency, 0) / energyData.length : 0,
      totalCo2Saved: energyData?.reduce((sum, d) => sum + d.co2_saved, 0) || 0,
      
      insights: [
        ...(energyData?.length > 0 ? generateEnergyInsights(energyData, buildings) : []),
        ...generateEfficiencyRecommendations(energyData || [])
      ],
      
      period: '30 days',
      buildingsAnalyzed: buildings.length
    };

    return insights;

  } catch (error) {
    console.error('Error generating energy analysis:', error);
    return { available: false, error: error.message };
  }
}

async function generateSwarmAnalysis(userId) {
  try {
    const { data: swarmTasks, error } = await supabase
      .from('swarm_tasks')
      .select('type, status, objective, progress, execution_time_ms, total_agents')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!swarmTasks || swarmTasks.length === 0) {
      return { available: false, reason: 'No swarm tasks found' };
    }

    const analysis = {
      available: true,
      totalTasks: swarmTasks.length,
      completedTasks: swarmTasks.filter(t => t.status === 'completed').length,
      averageExecutionTime: calculateAverageExecutionTime(swarmTasks),
      averageAgents: calculateAverageAgents(swarmTasks),
      
      insights: [
        ...generateSwarmInsights(swarmTasks),
        ...generateSwarmOptimizations(swarmTasks)
      ],
      
      taskTypes: groupTasksByType(swarmTasks),
      period: 'recent tasks'
    };

    return analysis;

  } catch (error) {
    console.error('Error generating swarm analysis:', error);
    return { available: false, error: error.message };
  }
}

async function generateCrossFrontendInsights(userId) {
  try {
    // Get cross-frontend activities
    const { data: activities, error } = await supabase
      .from('cross_frontend_activities')
      .select('source_frontend, target_frontend, activity_type, data')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const insights = {
      available: true,
      totalCrossFrontendActivities: activities?.length || 0,
      mostUsedFrontend: findMostUsedFrontend(activities || []),
      integrationOpportunities: identifyIntegrationOpportunities(activities || []),
      workflowPatterns: analyzeWorkflowPatterns(activities || []),
      
      recommendations: [
        ...generateIntegrationRecommendations(activities || []),
        ...generateWorkflowOptimizations(activities || [])
      ]
    };

    return insights;

  } catch (error) {
    console.error('Error generating cross-frontend insights:', error);
    return { available: false, error: error.message };
  }
}

function calculateAnalysisConfidence(analysis) {
  let confidence = 0;
  let factors = 0;

  if (analysis.energy?.available) {
    confidence += analysis.energy.buildingsAnalyzed > 0 ? 0.8 : 0.3;
    factors++;
  }

  if (analysis.swarm?.available) {
    confidence += analysis.swarm.totalTasks > 5 ? 0.8 : 0.4;
    factors++;
  }

  if (analysis.crossFrontend?.available) {
    confidence += analysis.crossFrontend.totalCrossFrontendActivities > 10 ? 0.7 : 0.3;
    factors++;
  }

  return factors > 0 ? Math.round((confidence / factors) * 100) : 0;
}

// Additional helper functions...
function generateEnergyInsights(energyData, buildings) {
  const insights = [];

  const avgEfficiency = energyData.reduce((sum, d) => sum + d.efficiency, 0) / energyData.length;
  
  if (avgEfficiency < 70) {
    insights.push({
      type: 'efficiency',
      level: 'warning',
      message: `Average efficiency (${avgEfficiency.toFixed(1)}%) is below optimal. Consider energy audit.`,
      impact: 'medium'
    });
  }

  return insights;
}

function generateEfficiencyRecommendations(energyData) {
  // Implementation for efficiency recommendations
  return [];
}

function generateSwarmInsights(swarmTasks) {
  // Implementation for swarm insights
  return [];
}

function calculateAverageExecutionTime(tasks) {
  const completedTasks = tasks.filter(t => t.execution_time_ms);
  return completedTasks.length > 0 ? 
    completedTasks.reduce((sum, t) => sum + t.execution_time_ms, 0) / completedTasks.length : 0;
}

function calculateAverageAgents(tasks) {
  return tasks.length > 0 ? 
    tasks.reduce((sum, t) => sum + (t.total_agents || 0), 0) / tasks.length : 0;
}

function groupTasksByType(tasks) {
  return tasks.reduce((groups, task) => {
    groups[task.type] = (groups[task.type] || 0) + 1;
    return groups;
  }, {});
}

function findMostUsedFrontend(activities) {
  const usage = activities.reduce((count, activity) => {
    count[activity.source_frontend] = (count[activity.source_frontend] || 0) + 1;
    return count;
  }, {});

  return Object.entries(usage).reduce((max, [frontend, count]) => 
    count > max.count ? { frontend, count } : max, { frontend: null, count: 0 });
}

function identifyIntegrationOpportunities(activities) {
  // Analyze patterns where data could be shared between frontends
  return [];
}

function analyzeWorkflowPatterns(activities) {
  // Identify common workflow patterns across frontends
  return [];
}

function generateIntegrationRecommendations(activities) {
  // Generate recommendations for better integration
  return [];
}

function generateWorkflowOptimizations(activities) {
  // Generate workflow optimization suggestions
  return [];
}

async function getCriticalAlerts(userId) {
  // Get user's buildings first
  const { data: buildings } = await supabase
    .from('buildings')
    .select('id')
    .eq('user_id', userId);

  if (!buildings || buildings.length === 0) return [];

  const buildingIds = buildings.map(b => b.id);

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .in('building_id', buildingIds)
    .eq('is_resolved', false)
    .in('priority', ['critical', 'high'])
    .order('timestamp', { ascending: false })
    .limit(10);

  return alerts || [];
}

async function getRecentActivities(userId, limit) {
  const { data: activities } = await supabase
    .from('cross_frontend_activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  return activities || [];
}

async function getSystemNotifications(userId) {
  // System-level notifications (updates, maintenance, etc.)
  return [
    {
      id: 'system-1',
      type: 'system',
      title: 'System Update Available',
      message: 'New features available in CityPulse Energy Management.',
      priority: 'info',
      timestamp: new Date().toISOString(),
      source: 'system',
      isRead: false
    }
  ];
}

function formatActivityTitle(activity) {
  const titles = {
    'chat_session_created': 'New Chat Session',
    'swarm_task_completed': 'Swarm Task Completed',
    'energy_alert_resolved': 'Energy Alert Resolved',
    'building_added': 'Building Added'
  };
  
  return titles[activity.activity_type] || activity.activity_type;
}

function formatActivityMessage(activity) {
  // Format activity message based on type and data
  return `Activity in ${activity.source_frontend}`;
}

async function exportFrontendData(userId, frontend, dateFrom, dateTo) {
  const data = { frontend };

  try {
    switch (frontend) {
      case 'citypulse':
        data.buildings = await exportCityPulseData(userId, dateFrom, dateTo);
        break;
      case 'flowmind':
        data.chatSessions = await exportFlowMindData(userId, dateFrom, dateTo);
        break;
      case 'quantum':
      case 'velocity':
        data.swarmTasks = await exportSwarmData(userId, frontend, dateFrom, dateTo);
        break;
    }
  } catch (error) {
    data.error = error.message;
  }

  return data;
}

async function exportCityPulseData(userId, dateFrom, dateTo) {
  // Export buildings, energy data, alerts, etc.
  const { data: buildings } = await supabase
    .from('buildings')
    .select('*')
    .eq('user_id', userId);

  return { buildings: buildings || [] };
}

async function exportFlowMindData(userId, dateFrom, dateTo) {
  // Export chat sessions and messages
  return { chatSessions: [] };
}

async function exportSwarmData(userId, type, dateFrom, dateTo) {
  // Export swarm tasks and agents
  return { swarmTasks: [] };
}

function convertToCSV(data) {
  // Convert JSON to CSV format
  return 'CSV export not implemented yet';
}

// Additional helper functions for optimization suggestions
async function generateCityPulseOptimizations(userId) {
  return [
    {
      id: 'citypulse-1',
      frontend: 'citypulse',
      type: 'energy_efficiency',
      priority: 'medium',
      title: 'Optimize Heating Schedule',
      description: 'Based on usage patterns, heating schedule can be optimized.',
      impact: 'Potential 15% energy savings',
      effort: 'low'
    }
  ];
}

async function generateSwarmOptimizations(userId) {
  return [
    {
      id: 'swarm-1',
      frontend: 'quantum',
      type: 'agent_optimization',
      priority: 'low',
      title: 'Reduce Agent Count',
      description: 'Recent tasks could be completed with fewer agents.',
      impact: 'Faster execution times',
      effort: 'low'
    }
  ];
}

async function generateFlowMindOptimizations(userId) {
  return [
    {
      id: 'flowmind-1',
      frontend: 'flowmind',
      type: 'model_optimization',
      priority: 'low',
      title: 'Switch to Faster Model',
      description: 'For routine tasks, consider using Claude Haiku for speed.',
      impact: 'Faster responses, lower cost',
      effort: 'low'
    }
  ];
}

async function generateCrossOptimizations(userId, enabledFeatures) {
  const optimizations = [];

  if (enabledFeatures.citypulse && enabledFeatures.flowmind) {
    optimizations.push({
      id: 'cross-1',
      frontend: 'cross',
      type: 'integration',
      priority: 'medium',
      title: 'Energy Data Analysis with AI',
      description: 'Use FlowMind AI to analyze CityPulse energy patterns.',
      impact: 'Better insights, automated recommendations',
      effort: 'medium'
    });
  }

  return optimizations;
}

function rankSuggestions(suggestions) {
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  
  return suggestions.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] || 0;
    const bPriority = priorityOrder[b.priority] || 0;
    return bPriority - aPriority;
  });
}

export default router;