import jwt from 'jsonwebtoken';
import { supabase, dbHelpers, realtimeHelpers } from '../config/supabase.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Setup WebSocket server with namespace support for all frontends
 * @param {SocketIOServer} io - Socket.IO server instance
 */
export function setupWebSocketServer(io) {
  // Global connection middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user profile
      const userProfile = await dbHelpers.getUserProfile(decoded.userId);
      
      if (!userProfile) {
        return next(new Error('User not found'));
      }

      // Check organization status
      if (userProfile.organization.subscription_status !== 'active') {
        return next(new Error('Organization subscription inactive'));
      }

      // Attach user info to socket
      socket.userId = userProfile.id;
      socket.userEmail = userProfile.email;
      socket.organizationId = userProfile.organization_id;
      socket.frontendPermissions = userProfile.organization.features;
      
      logger.info('WebSocket user authenticated', {
        userId: socket.userId,
        email: socket.userEmail,
        organizationId: socket.organizationId
      });

      next();

    } catch (error) {
      logger.warn('WebSocket authentication failed:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  // Main namespace for general features
  io.on('connection', (socket) => {
    logger.info('WebSocket client connected', {
      socketId: socket.id,
      userId: socket.userId,
      userAgent: socket.handshake.headers['user-agent']
    });

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('WebSocket client disconnected', {
        socketId: socket.id,
        userId: socket.userId,
        reason
      });
    });

    // Generic event handler
    socket.on('subscribe', (channel) => {
      if (channel && typeof channel === 'string') {
        socket.join(channel);
        socket.emit('subscribed', { channel });
      }
    });

    socket.on('unsubscribe', (channel) => {
      if (channel && typeof channel === 'string') {
        socket.leave(channel);
        socket.emit('unsubscribed', { channel });
      }
    });
  });

  // FlowMind AI Chat namespace
  const flowmindNamespace = io.of('/flowmind');
  
  flowmindNamespace.use((socket, next) => {
    if (!socket.frontendPermissions.flowmind) {
      return next(new Error('FlowMind access denied'));
    }
    next();
  });

  flowmindNamespace.on('connection', (socket) => {
    logger.info('FlowMind WebSocket connected', { userId: socket.userId });

    // Join user's chat sessions
    socket.join(`flowmind:user:${socket.userId}`);

    // Subscribe to specific chat session
    socket.on('join_session', (sessionId) => {
      // Verify session ownership
      supabase
        .from('chat_sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', socket.userId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            socket.join(`flowmind:session:${sessionId}`);
            socket.emit('session_joined', { sessionId });
          } else {
            socket.emit('error', { message: 'Session not found or access denied' });
          }
        });
    });

    socket.on('leave_session', (sessionId) => {
      socket.leave(`flowmind:session:${sessionId}`);
      socket.emit('session_left', { sessionId });
    });

    // Handle streaming chat responses
    socket.on('stream_chat', (data) => {
      // This would be handled by the chat API endpoint
      // Here we just acknowledge the request
      socket.emit('stream_started', { sessionId: data.sessionId });
    });
  });

  // Quantum/Velocity Swarm namespace
  const swarmNamespace = io.of('/swarm');
  
  swarmNamespace.use((socket, next) => {
    if (!socket.frontendPermissions.quantum && !socket.frontendPermissions.velocity) {
      return next(new Error('Swarm access denied'));
    }
    next();
  });

  swarmNamespace.on('connection', (socket) => {
    logger.info('Swarm WebSocket connected', { userId: socket.userId });

    // Join user's swarm tasks
    socket.join(`swarm:user:${socket.userId}`);

    // Subscribe to specific swarm task
    socket.on('join_task', (taskId) => {
      // Verify task ownership
      supabase
        .from('swarm_tasks')
        .select('id')
        .eq('id', taskId)
        .eq('user_id', socket.userId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            socket.join(`swarm:task:${taskId}`);
            socket.emit('task_joined', { taskId });
          } else {
            socket.emit('error', { message: 'Task not found or access denied' });
          }
        });
    });

    socket.on('leave_task', (taskId) => {
      socket.leave(`swarm:task:${taskId}`);
      socket.emit('task_left', { taskId });
    });
  });

  // CityPulse Energy Management namespace
  const citypulseNamespace = io.of('/citypulse');
  
  citypulseNamespace.use((socket, next) => {
    if (!socket.frontendPermissions.citypulse) {
      return next(new Error('CityPulse access denied'));
    }
    next();
  });

  citypulseNamespace.on('connection', (socket) => {
    logger.info('CityPulse WebSocket connected', { userId: socket.userId });

    // Join user-specific room
    socket.join(`citypulse:user:${socket.userId}`);

    // Subscribe to specific building
    socket.on('join_building', async (buildingId) => {
      try {
        // Verify building ownership
        const { data, error } = await supabase
          .from('buildings')
          .select('id, name')
          .eq('id', buildingId)
          .eq('user_id', socket.userId)
          .single();

        if (error || !data) {
          socket.emit('error', { message: 'Building not found or access denied' });
          return;
        }

        socket.join(`citypulse:building:${buildingId}`);
        socket.emit('building_joined', { 
          buildingId, 
          buildingName: data.name 
        });

        logger.info('User joined building channel', {
          userId: socket.userId,
          buildingId,
          buildingName: data.name
        });

      } catch (error) {
        logger.error('Error joining building:', error);
        socket.emit('error', { message: 'Failed to join building' });
      }
    });

    socket.on('leave_building', (buildingId) => {
      socket.leave(`citypulse:building:${buildingId}`);
      socket.emit('building_left', { buildingId });
    });

    // Subscribe to alerts for specific buildings
    socket.on('subscribe_alerts', (buildingIds) => {
      if (Array.isArray(buildingIds)) {
        buildingIds.forEach(id => {
          socket.join(`citypulse:alerts:${id}`);
        });
        socket.emit('alerts_subscribed', { buildingIds });
      }
    });

    // Subscribe to real-time energy data
    socket.on('subscribe_energy', (buildingIds) => {
      if (Array.isArray(buildingIds)) {
        buildingIds.forEach(id => {
          socket.join(`citypulse:energy:${id}`);
        });
        socket.emit('energy_subscribed', { buildingIds });
      }
    });

    // Request current building status
    socket.on('get_building_status', async (buildingId) => {
      try {
        const { data: building, error } = await supabase
          .from('buildings')
          .select(`
            *,
            latest_energy:energy_data!inner(*).order(timestamp.desc).limit(1),
            active_alerts:alerts!inner(count).eq(is_resolved, false)
          `)
          .eq('id', buildingId)
          .eq('user_id', socket.userId)
          .single();

        if (error || !building) {
          socket.emit('error', { message: 'Building not found' });
          return;
        }

        socket.emit('building_status', {
          buildingId,
          status: building.status,
          latestEnergyData: building.latest_energy?.[0],
          activeAlertsCount: building.active_alerts?.[0]?.count || 0,
          lastUpdate: building.last_update
        });

      } catch (error) {
        logger.error('Error getting building status:', error);
        socket.emit('error', { message: 'Failed to get building status' });
      }
    });
  });

  // Setup real-time database listeners
  setupDatabaseListeners(io);

  logger.info('WebSocket server setup complete with namespaces: /, /flowmind, /swarm, /citypulse');
}

/**
 * Setup Supabase real-time listeners to broadcast to WebSocket clients
 */
function setupDatabaseListeners(io) {
  // Listen for new AI messages
  const aiMessagesSubscription = supabase
    .channel('ai_messages_changes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'ai_messages'
    }, (payload) => {
      const message = payload.new;
      
      // Broadcast to FlowMind namespace
      io.of('/flowmind').to(`flowmind:session:${message.session_id}`).emit('new_message', {
        id: message.id,
        role: message.role,
        content: message.content,
        tokensUsed: message.tokens_used,
        cost: message.cost,
        createdAt: message.created_at
      });
    })
    .subscribe();

  // Listen for swarm task updates
  const swarmTasksSubscription = supabase
    .channel('swarm_tasks_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'swarm_tasks'
    }, (payload) => {
      const task = payload.new || payload.old;
      const eventType = payload.eventType;
      
      // Broadcast to Swarm namespace
      io.of('/swarm').to(`swarm:task:${task.id}`).emit('task_update', {
        eventType,
        task: {
          id: task.id,
          status: task.status,
          progress: task.progress,
          results: task.results,
          error: task.error_message,
          updatedAt: task.updated_at
        }
      });

      // Also broadcast to user room
      io.of('/swarm').to(`swarm:user:${task.user_id}`).emit('user_task_update', {
        eventType,
        taskId: task.id,
        status: task.status
      });
    })
    .subscribe();

  // Listen for new sensor readings
  const sensorReadingsSubscription = supabase
    .channel('sensor_readings_changes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'sensor_readings'
    }, async (payload) => {
      const reading = payload.new;
      
      try {
        // Get sensor info to determine building
        const { data: sensor, error } = await supabase
          .from('sensors')
          .select('building_id, name, type, unit')
          .eq('id', reading.sensor_id)
          .single();

        if (!error && sensor) {
          // Broadcast to CityPulse namespace
          io.of('/citypulse').to(`citypulse:building:${sensor.building_id}`).emit('sensor_reading', {
            sensorId: reading.sensor_id,
            sensorName: sensor.name,
            sensorType: sensor.type,
            value: reading.value,
            unit: sensor.unit,
            timestamp: reading.timestamp,
            buildingId: sensor.building_id
          });
        }
      } catch (error) {
        logger.error('Error processing sensor reading:', error);
      }
    })
    .subscribe();

  // Listen for new alerts
  const alertsSubscription = supabase
    .channel('alerts_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'alerts'
    }, (payload) => {
      const alert = payload.new || payload.old;
      const eventType = payload.eventType;
      
      if (alert.building_id) {
        // Broadcast to CityPulse namespace
        io.of('/citypulse').to(`citypulse:alerts:${alert.building_id}`).emit('alert_update', {
          eventType,
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
    })
    .subscribe();

  // Listen for new energy data
  const energyDataSubscription = supabase
    .channel('energy_data_changes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'energy_data'
    }, (payload) => {
      const energyData = payload.new;
      
      // Broadcast to CityPulse namespace
      io.of('/citypulse').to(`citypulse:energy:${energyData.building_id}`).emit('energy_update', {
        buildingId: energyData.building_id,
        timestamp: energyData.timestamp,
        consumption: energyData.consumption,
        production: energyData.production,
        efficiency: energyData.efficiency,
        co2Saved: energyData.co2_saved,
        granularity: energyData.granularity
      });
    })
    .subscribe();

  logger.info('Database real-time listeners setup complete');
}

/**
 * Utility functions for broadcasting events
 */
export const websocketUtils = {
  /**
   * Broadcast AI message to specific session
   */
  broadcastAIMessage(io, sessionId, message) {
    io.of('/flowmind').to(`flowmind:session:${sessionId}`).emit('new_message', message);
  },

  /**
   * Broadcast swarm task update
   */
  broadcastSwarmUpdate(io, taskId, userId, update) {
    io.of('/swarm').to(`swarm:task:${taskId}`).emit('task_update', update);
    io.of('/swarm').to(`swarm:user:${userId}`).emit('user_task_update', update);
  },

  /**
   * Broadcast sensor reading to building
   */
  broadcastSensorReading(io, buildingId, reading) {
    io.of('/citypulse').to(`citypulse:building:${buildingId}`).emit('sensor_reading', reading);
  },

  /**
   * Broadcast alert to building
   */
  broadcastAlert(io, buildingId, alert) {
    io.of('/citypulse').to(`citypulse:alerts:${buildingId}`).emit('alert_update', alert);
  },

  /**
   * Broadcast energy data update
   */
  broadcastEnergyUpdate(io, buildingId, energyData) {
    io.of('/citypulse').to(`citypulse:energy:${buildingId}`).emit('energy_update', energyData);
  },

  /**
   * Send notification to specific user
   */
  sendUserNotification(io, userId, notification) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
};