import express from 'express';
import { supabase } from '../../config/supabase.js';
import { body, param, query, validationResult } from 'express-validator';
import { websocketUtils } from '../../websocket/index.js';

const router = express.Router();

// ==========================================
// SWARM ORCHESTRATION ENDPOINTS
// ==========================================

/**
 * GET /api/v1/swarm/tasks
 * Get user's swarm tasks
 */
router.get('/tasks', [
  query('type').optional().isIn(['quantum', 'velocity']).withMessage('Invalid swarm type'),
  query('status').optional().isIn(['pending', 'running', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { type, status, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('swarm_tasks')
      .select(`
        *,
        agents(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    query = query.range(offset, offset + limit - 1);

    const { data: tasks, error, count } = await query;

    if (error) throw error;

    res.json({
      tasks: tasks || [],
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
 * GET /api/v1/swarm/tasks/:id
 * Get specific task details with agents
 */
router.get('/tasks/:id', [
  param('id').isUUID().withMessage('Task ID must be valid UUID')
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
    const userId = req.user.userId;

    const { data: task, error } = await supabase
      .from('swarm_tasks')
      .select(`
        *,
        agents(*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !task) {
      return res.status(404).json({
        error: 'Task not found or access denied'
      });
    }

    res.json({ task });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/swarm/tasks
 * Create new swarm task
 */
router.post('/tasks', [
  body('type').isIn(['quantum', 'velocity']).withMessage('Invalid swarm type'),
  body('objective').notEmpty().withMessage('Objective is required'),
  body('config').optional().isObject(),
  body('constraints').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { type, objective, config = {}, constraints = {} } = req.body;
    const userId = req.user.userId;

    // Check user's swarm permissions
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select(`
        organization:organizations!inner(features)
      `)
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const features = userProfile.organization.features;
    const hasPermission = (type === 'quantum' && features.quantum) || 
                         (type === 'velocity' && features.velocity);

    if (!hasPermission) {
      return res.status(403).json({
        error: `${type} swarm access not enabled for your organization`
      });
    }

    // Validate agent count against limits
    const requestedAgents = config.agents || 5;
    const maxAgents = features.max_swarm_agents || 5;

    if (requestedAgents > maxAgents) {
      return res.status(400).json({
        error: `Requested agent count (${requestedAgents}) exceeds limit (${maxAgents})`
      });
    }

    // Create swarm task
    const { data: task, error } = await supabase
      .from('swarm_tasks')
      .insert({
        user_id: userId,
        type,
        objective,
        config: {
          agents: requestedAgents,
          max_iterations: config.max_iterations || 10,
          timeout_minutes: config.timeout_minutes || 60,
          optimization_level: config.optimization_level || 'balanced',
          ...config
        },
        constraints,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Initialize agents for the task
    await initializeSwarmAgents(task.id, type, requestedAgents);

    // Broadcast task creation
    if (req.app.get('io')) {
      websocketUtils.broadcastSwarmUpdate(req.app.get('io'), task.id, userId, {
        eventType: 'TASK_CREATED',
        task: {
          id: task.id,
          type: task.type,
          objective: task.objective,
          status: task.status,
          createdAt: task.created_at
        }
      });
    }

    res.status(201).json({
      message: 'Swarm task created successfully',
      task
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/swarm/tasks/:id/start
 * Start swarm task execution
 */
router.post('/tasks/:id/start', [
  param('id').isUUID().withMessage('Task ID must be valid UUID')
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
    const userId = req.user.userId;

    // Verify task ownership and status
    const { data: task, error: taskError } = await supabase
      .from('swarm_tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (taskError || !task) {
      return res.status(404).json({
        error: 'Task not found or access denied'
      });
    }

    if (task.status !== 'pending') {
      return res.status(400).json({
        error: `Task cannot be started. Current status: ${task.status}`
      });
    }

    // Update task status
    const { data: updatedTask, error } = await supabase
      .from('swarm_tasks')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Start the swarm execution (this would integrate with actual swarm orchestration)
    await executeSwarmTask(updatedTask);

    // Broadcast task start
    if (req.app.get('io')) {
      websocketUtils.broadcastSwarmUpdate(req.app.get('io'), id, userId, {
        eventType: 'TASK_STARTED',
        task: {
          id: updatedTask.id,
          status: updatedTask.status,
          startedAt: updatedTask.started_at
        }
      });
    }

    res.json({
      message: 'Swarm task started successfully',
      task: updatedTask
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/swarm/tasks/:id/cancel
 * Cancel running swarm task
 */
router.post('/tasks/:id/cancel', [
  param('id').isUUID().withMessage('Task ID must be valid UUID'),
  body('reason').optional().isString()
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
    const { reason } = req.body;
    const userId = req.user.userId;

    // Verify task ownership
    const { data: task, error: taskError } = await supabase
      .from('swarm_tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (taskError || !task) {
      return res.status(404).json({
        error: 'Task not found or access denied'
      });
    }

    if (!['pending', 'running'].includes(task.status)) {
      return res.status(400).json({
        error: `Task cannot be cancelled. Current status: ${task.status}`
      });
    }

    // Update task status
    const { data: updatedTask, error } = await supabase
      .from('swarm_tasks')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        error_message: reason || 'Cancelled by user'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Cancel all agents
    await supabase
      .from('agents')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('swarm_task_id', id)
      .eq('status', 'running');

    // Broadcast cancellation
    if (req.app.get('io')) {
      websocketUtils.broadcastSwarmUpdate(req.app.get('io'), id, userId, {
        eventType: 'TASK_CANCELLED',
        task: {
          id: updatedTask.id,
          status: updatedTask.status,
          cancelledAt: updatedTask.completed_at,
          reason: reason || 'Cancelled by user'
        }
      });
    }

    res.json({
      message: 'Swarm task cancelled successfully',
      task: updatedTask
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/swarm/agents/:task_id
 * Get agents for specific task
 */
router.get('/agents/:task_id', [
  param('task_id').isUUID().withMessage('Task ID must be valid UUID')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { task_id } = req.params;
    const userId = req.user.userId;

    // Verify task ownership
    const { data: task, error: taskError } = await supabase
      .from('swarm_tasks')
      .select('id')
      .eq('id', task_id)
      .eq('user_id', userId)
      .single();

    if (taskError || !task) {
      return res.status(404).json({
        error: 'Task not found or access denied'
      });
    }

    // Get agents
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .eq('swarm_task_id', task_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Calculate agent statistics
    const stats = {
      total: agents?.length || 0,
      running: agents?.filter(a => a.status === 'running').length || 0,
      completed: agents?.filter(a => a.status === 'completed').length || 0,
      failed: agents?.filter(a => a.status === 'failed').length || 0,
      averageExecutionTime: calculateAverageExecutionTime(agents || [])
    };

    res.json({
      agents: agents || [],
      statistics: stats
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/swarm/performance
 * Get swarm performance analytics
 */
router.get('/performance', [
  query('period').optional().isIn(['week', 'month', 'quarter']).withMessage('Invalid period'),
  query('type').optional().isIn(['quantum', 'velocity']).withMessage('Invalid swarm type')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { period = 'month', type } = req.query;
    const userId = req.user.userId;

    // Calculate time range
    const timeRange = calculateTimeRange(period);

    let query = supabase
      .from('swarm_tasks')
      .select(`
        type,
        status,
        progress,
        execution_time_ms,
        total_agents,
        total_cost,
        created_at,
        completed_at
      `)
      .eq('user_id', userId)
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (type) query = query.eq('type', type);

    const { data: tasks, error } = await query;

    if (error) throw error;

    // Calculate performance metrics
    const performance = {
      period,
      type: type || 'all',
      timeRange: {
        from: timeRange.start.toISOString(),
        to: timeRange.end.toISOString()
      },
      
      overview: {
        totalTasks: tasks?.length || 0,
        completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
        failedTasks: tasks?.filter(t => t.status === 'failed').length || 0,
        successRate: calculateSuccessRate(tasks || []),
        averageExecutionTime: calculateTaskAverageTime(tasks || []),
        totalCost: tasks?.reduce((sum, t) => sum + (t.total_cost || 0), 0) || 0
      },

      efficiency: {
        averageAgentsPerTask: calculateAverageAgents(tasks || []),
        agentUtilization: calculateAgentUtilization(tasks || []),
        costPerTask: calculateCostPerTask(tasks || []),
        timeToCompletion: calculateTimeToCompletion(tasks || [])
      },

      trends: {
        dailyTaskCount: calculateDailyTrends(tasks || []),
        successRateTrend: calculateSuccessRateTrend(tasks || []),
        performanceImprovement: calculatePerformanceImprovement(tasks || [])
      },

      recommendations: generatePerformanceRecommendations(tasks || [])
    };

    res.json({ performance });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/swarm/optimize
 * Get optimization suggestions for swarm configuration
 */
router.post('/optimize', [
  body('type').isIn(['quantum', 'velocity']).withMessage('Invalid swarm type'),
  body('objective').notEmpty().withMessage('Objective is required'),
  body('current_config').optional().isObject(),
  body('constraints').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { type, objective, current_config = {}, constraints = {} } = req.body;
    const userId = req.user.userId;

    // Get user's historical performance data
    const { data: historicalTasks, error } = await supabase
      .from('swarm_tasks')
      .select('config, execution_time_ms, total_agents, status, progress')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Generate optimization suggestions
    const optimizations = await generateSwarmOptimizations(
      type,
      objective,
      current_config,
      constraints,
      historicalTasks || []
    );

    res.json({
      type,
      objective,
      currentConfig: current_config,
      optimizations,
      basedOnTasks: historicalTasks?.length || 0,
      confidence: calculateOptimizationConfidence(historicalTasks || [])
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function initializeSwarmAgents(taskId, type, agentCount) {
  const agentTypes = getAgentTypesForSwarm(type);
  const agents = [];

  for (let i = 0; i < agentCount; i++) {
    const agentType = agentTypes[i % agentTypes.length];
    
    agents.push({
      swarm_task_id: taskId,
      type: agentType,
      name: `${agentType}-${i + 1}`,
      config: getDefaultAgentConfig(agentType),
      status: 'idle'
    });
  }

  const { error } = await supabase
    .from('agents')
    .insert(agents);

  if (error) throw error;
}

function getAgentTypesForSwarm(swarmType) {
  switch (swarmType) {
    case 'quantum':
      return ['coordinator', 'executor', 'optimizer', 'analyzer'];
    case 'velocity':
      return ['coordinator', 'executor', 'validator'];
    default:
      return ['coordinator', 'executor'];
  }
}

function getDefaultAgentConfig(agentType) {
  const configs = {
    coordinator: {
      role: 'Task coordination and distribution',
      capabilities: ['task_management', 'agent_coordination'],
      priority: 'high'
    },
    executor: {
      role: 'Task execution and processing',
      capabilities: ['task_execution', 'data_processing'],
      priority: 'medium'
    },
    optimizer: {
      role: 'Performance optimization',
      capabilities: ['optimization', 'performance_analysis'],
      priority: 'medium'
    },
    analyzer: {
      role: 'Result analysis and validation',
      capabilities: ['analysis', 'validation', 'reporting'],
      priority: 'low'
    },
    validator: {
      role: 'Quality assurance and validation',
      capabilities: ['validation', 'quality_check'],
      priority: 'medium'
    }
  };

  return configs[agentType] || configs.executor;
}

async function executeSwarmTask(task) {
  // This is a mock implementation
  // In a real system, this would interface with the actual swarm orchestration engine
  
  try {
    console.log(`🚀 Starting swarm execution for task ${task.id}`);
    
    // Simulate task execution with progress updates
    setTimeout(async () => {
      // Update progress to 25%
      await updateTaskProgress(task.id, 25, 'Initializing agents');
    }, 1000);

    setTimeout(async () => {
      // Update progress to 50%
      await updateTaskProgress(task.id, 50, 'Executing task');
    }, 3000);

    setTimeout(async () => {
      // Update progress to 75%
      await updateTaskProgress(task.id, 75, 'Processing results');
    }, 5000);

    setTimeout(async () => {
      // Complete task
      await completeSwarmTask(task.id, {
        result: 'Task completed successfully',
        execution_summary: {
          total_iterations: 8,
          agents_used: task.config.agents,
          optimization_level_achieved: 0.85
        }
      });
    }, 7000);

  } catch (error) {
    console.error('Error executing swarm task:', error);
    await failSwarmTask(task.id, error.message);
  }
}

async function updateTaskProgress(taskId, progress, status) {
  try {
    const { error } = await supabase
      .from('swarm_tasks')
      .update({
        progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) throw error;

    // Broadcast progress update
    if (global.io) {
      const { data: task } = await supabase
        .from('swarm_tasks')
        .select('user_id')
        .eq('id', taskId)
        .single();

      if (task) {
        websocketUtils.broadcastSwarmUpdate(global.io, taskId, task.user_id, {
          eventType: 'TASK_PROGRESS',
          task: {
            id: taskId,
            progress,
            status,
            updatedAt: new Date().toISOString()
          }
        });
      }
    }

  } catch (error) {
    console.error('Error updating task progress:', error);
  }
}

async function completeSwarmTask(taskId, results) {
  try {
    const executionTime = 7000; // Mock execution time

    const { data: task, error } = await supabase
      .from('swarm_tasks')
      .update({
        status: 'completed',
        progress: 100,
        results,
        execution_time_ms: executionTime,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select('user_id')
      .single();

    if (error) throw error;

    // Update all agents to completed
    await supabase
      .from('agents')
      .update({
        status: 'completed',
        iterations_completed: Math.floor(Math.random() * 10) + 1,
        execution_time_ms: executionTime / 4, // Distribute time among agents
        updated_at: new Date().toISOString()
      })
      .eq('swarm_task_id', taskId);

    // Broadcast completion
    if (global.io && task) {
      websocketUtils.broadcastSwarmUpdate(global.io, taskId, task.user_id, {
        eventType: 'TASK_COMPLETED',
        task: {
          id: taskId,
          status: 'completed',
          progress: 100,
          results,
          completedAt: new Date().toISOString()
        }
      });
    }

    console.log(`✅ Task ${taskId} completed successfully`);

  } catch (error) {
    console.error('Error completing task:', error);
    await failSwarmTask(taskId, error.message);
  }
}

async function failSwarmTask(taskId, errorMessage) {
  try {
    const { data: task, error } = await supabase
      .from('swarm_tasks')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select('user_id')
      .single();

    if (error) throw error;

    // Update agents to failed
    await supabase
      .from('agents')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('swarm_task_id', taskId)
      .eq('status', 'running');

    // Broadcast failure
    if (global.io && task) {
      websocketUtils.broadcastSwarmUpdate(global.io, taskId, task.user_id, {
        eventType: 'TASK_FAILED',
        task: {
          id: taskId,
          status: 'failed',
          error: errorMessage,
          failedAt: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Error updating failed task:', error);
  }
}

function calculateAverageExecutionTime(agents) {
  const completedAgents = agents.filter(a => a.execution_time_ms > 0);
  return completedAgents.length > 0 ? 
    completedAgents.reduce((sum, a) => sum + a.execution_time_ms, 0) / completedAgents.length : 0;
}

function calculateTimeRange(period) {
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
    default:
      start.setMonth(start.getMonth() - 1);
  }

  return { start, end };
}

function calculateSuccessRate(tasks) {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

function calculateTaskAverageTime(tasks) {
  const completedTasks = tasks.filter(t => t.execution_time_ms > 0);
  return completedTasks.length > 0 ? 
    completedTasks.reduce((sum, t) => sum + t.execution_time_ms, 0) / completedTasks.length : 0;
}

function calculateAverageAgents(tasks) {
  return tasks.length > 0 ? 
    tasks.reduce((sum, t) => sum + (t.total_agents || 0), 0) / tasks.length : 0;
}

function calculateAgentUtilization(tasks) {
  // Mock calculation for agent utilization
  return Math.round(Math.random() * 30 + 70); // 70-100%
}

function calculateCostPerTask(tasks) {
  const tasksWithCost = tasks.filter(t => t.total_cost > 0);
  return tasksWithCost.length > 0 ? 
    tasksWithCost.reduce((sum, t) => sum + t.total_cost, 0) / tasksWithCost.length : 0;
}

function calculateTimeToCompletion(tasks) {
  const completedTasks = tasks.filter(t => t.completed_at && t.created_at);
  if (completedTasks.length === 0) return 0;

  const totalTime = completedTasks.reduce((sum, task) => {
    const start = new Date(task.created_at);
    const end = new Date(task.completed_at);
    return sum + (end - start);
  }, 0);

  return totalTime / completedTasks.length;
}

function calculateDailyTrends(tasks) {
  const trends = {};
  
  tasks.forEach(task => {
    const date = task.created_at.split('T')[0];
    trends[date] = (trends[date] || 0) + 1;
  });

  return Object.entries(trends).map(([date, count]) => ({ date, count }));
}

function calculateSuccessRateTrend(tasks) {
  // Mock implementation for success rate trend
  return 'improving';
}

function calculatePerformanceImprovement(tasks) {
  // Mock implementation for performance improvement
  return '+15%';
}

function generatePerformanceRecommendations(tasks) {
  const recommendations = [];

  const avgExecutionTime = calculateTaskAverageTime(tasks);
  if (avgExecutionTime > 300000) { // > 5 minutes
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      title: 'Optimize Execution Time',
      description: 'Average execution time is high. Consider optimizing agent configuration.',
      impact: 'Faster task completion'
    });
  }

  const successRate = calculateSuccessRate(tasks);
  if (successRate < 90) {
    recommendations.push({
      type: 'reliability',
      priority: 'high',
      title: 'Improve Success Rate',
      description: `Success rate is ${successRate}%. Review failed tasks for common issues.`,
      impact: 'Better reliability'
    });
  }

  return recommendations;
}

async function generateSwarmOptimizations(type, objective, currentConfig, constraints, historicalTasks) {
  const optimizations = [];

  // Agent count optimization
  const avgAgents = calculateAverageAgents(historicalTasks);
  const currentAgents = currentConfig.agents || 5;
  
  if (historicalTasks.length > 5) {
    if (avgAgents > currentAgents) {
      optimizations.push({
        type: 'agent_count',
        recommendation: 'increase',
        current: currentAgents,
        suggested: Math.ceil(avgAgents),
        reason: 'Historical data shows better performance with more agents',
        impact: 'Improved parallelization and faster completion'
      });
    } else if (avgAgents < currentAgents * 0.8) {
      optimizations.push({
        type: 'agent_count',
        recommendation: 'decrease',
        current: currentAgents,
        suggested: Math.ceil(avgAgents),
        reason: 'Task can be completed efficiently with fewer agents',
        impact: 'Reduced resource usage and cost'
      });
    }
  }

  // Optimization level recommendation
  const successfulTasks = historicalTasks.filter(t => t.status === 'completed');
  if (successfulTasks.length > 0) {
    const avgExecutionTime = calculateTaskAverageTime(successfulTasks);
    
    if (avgExecutionTime > 180000) { // > 3 minutes
      optimizations.push({
        type: 'optimization_level',
        recommendation: 'increase',
        current: currentConfig.optimization_level || 'balanced',
        suggested: 'aggressive',
        reason: 'Long execution times suggest need for more aggressive optimization',
        impact: 'Faster task completion at slightly higher resource cost'
      });
    }
  }

  // Timeout optimization
  const maxExecutionTime = Math.max(...historicalTasks.map(t => t.execution_time_ms || 0));
  const currentTimeout = (currentConfig.timeout_minutes || 60) * 60 * 1000;
  
  if (maxExecutionTime > currentTimeout * 0.8) {
    optimizations.push({
      type: 'timeout',
      recommendation: 'increase',
      current: currentConfig.timeout_minutes || 60,
      suggested: Math.ceil((maxExecutionTime * 1.2) / (60 * 1000)),
      reason: 'Some tasks are approaching timeout limits',
      impact: 'Prevent premature task termination'
    });
  }

  return optimizations;
}

function calculateOptimizationConfidence(historicalTasks) {
  if (historicalTasks.length === 0) return 0;
  if (historicalTasks.length < 5) return 30;
  if (historicalTasks.length < 10) return 60;
  return 85;
}

export default router;