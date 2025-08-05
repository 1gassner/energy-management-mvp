import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Create mock Supabase client for demo purposes
const mockSupabaseClient = {
  from: (table) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
    eq: () => ({ data: [], error: null }),
    single: () => ({ data: {}, error: null })
  }),
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
    subscribe: () => {}
  }),
  auth: {
    signInWithPassword: async () => ({ data: { user: { id: 'demo-user' } }, error: null }),
    signOut: async () => ({ error: null })
  }
};

// Use real Supabase if configured, otherwise use mock
export const supabase = process.env.SUPABASE_URL !== 'https://demo-citypulse.supabase.co' 
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      }
    )
  : mockSupabaseClient;

// Create client with anon key for frontend operations (if needed)
export const supabaseAnon = process.env.SUPABASE_ANON_KEY
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    )
  : mockSupabaseClient;

// Database helper functions
export const dbHelpers = {
  /**
   * Get user profile with organization
   */
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user's buildings (for CityPulse)
   */
  async getUserBuildings(userId) {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  /**
   * Get user's chat sessions (for FlowMind)
   */
  async getUserChatSessions(userId, limit = 50) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Get user's swarm tasks (for Quantum/Velocity)
   */
  async getUserSwarmTasks(userId, type = null, limit = 50) {
    let query = supabase
      .from('swarm_tasks')
      .select('*')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Log cross-frontend activity
   */
  async logActivity(userId, sourceFrontend, activityType, data = {}, targetFrontend = null) {
    const { error } = await supabase
      .from('cross_frontend_activities')
      .insert({
        user_id: userId,
        source_frontend: sourceFrontend,
        target_frontend: targetFrontend,
        activity_type: activityType,
        data
      });

    if (error) throw error;
  },

  /**
   * Log system event
   */
  async logSystem(level, message, metadata = {}, userId = null, frontend = null) {
    const { error } = await supabase
      .from('system_logs')
      .insert({
        level,
        message,
        metadata,
        user_id: userId,
        frontend
      });

    if (error) {
      console.error('Failed to log system event:', error);
    }
  },

  /**
   * Check user's daily AI usage
   */
  async getUserAIUsageToday(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('ai_messages')
      .select('tokens_used')
      .eq('session_id', supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', userId)
      )
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (error) throw error;

    const totalTokens = data.reduce((sum, message) => sum + (message.tokens_used || 0), 0);
    const requestCount = data.length;

    return { requestCount, totalTokens };
  },

  /**
   * Get user's active swarm tasks count
   */
  async getUserActiveSwarmTasks(userId) {
    const { data, error } = await supabase
      .from('swarm_tasks')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'running']);

    if (error) throw error;
    return data.length;
  },

  /**
   * Update organization features
   */
  async updateOrganizationFeatures(organizationId, features) {
    const { data, error } = await supabase
      .from('organizations')
      .update({ features })
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get real-time sensor data for a building
   */
  async getBuildingSensorData(buildingId, timeRange = '24 hours') {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select(`
        *,
        sensor:sensors(*)
      `)
      .eq('sensors.building_id', buildingId)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get building alerts
   */
  async getBuildingAlerts(buildingId, unreadOnly = false) {
    let query = supabase
      .from('alerts')
      .select('*')
      .eq('building_id', buildingId);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// Real-time subscription helpers
export const realtimeHelpers = {
  /**
   * Subscribe to user's chat messages
   */
  subscribeToUserMessages(userId, callback) {
    return supabase
      .channel(`user_messages_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ai_messages',
        filter: `session_id=in.(${supabase.from('chat_sessions').select('id').eq('user_id', userId)})`
      }, callback)
      .subscribe();
  },

  /**
   * Subscribe to user's swarm task updates
   */
  subscribeToUserSwarmTasks(userId, callback) {
    return supabase
      .channel(`user_swarm_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'swarm_tasks',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  /**
   * Subscribe to building sensor updates
   */
  subscribeToBuildingSensors(buildingId, callback) {
    return supabase
      .channel(`building_sensors_${buildingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
        filter: `sensor_id=in.(${supabase.from('sensors').select('id').eq('building_id', buildingId)})`
      }, callback)
      .subscribe();
  },

  /**
   * Subscribe to building alerts
   */
  subscribeToBuildingAlerts(buildingId, callback) {
    return supabase
      .channel(`building_alerts_${buildingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alerts',
        filter: `building_id=eq.${buildingId}`
      }, callback)
      .subscribe();
  }
};

export default supabase;