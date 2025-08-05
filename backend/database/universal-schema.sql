-- FlowMind Universal Backend Database Schema
-- Supports: FlowMind Chat, Quantum Swarm, Velocity Swarm, CityPulse Energy Management
-- Supabase PostgreSQL Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ==========================================
-- UNIVERSAL CORE TABLES
-- ==========================================

-- Organizations Table (Multi-tenant support)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  
  -- Feature flags for each frontend
  features JSONB DEFAULT '{
    "flowmind": true,
    "quantum": false,
    "velocity": false,
    "citypulse": false,
    "max_ai_requests_per_day": 100,
    "max_swarm_agents": 5,
    "max_buildings": 3
  }'::jsonb,
  
  -- Subscription info
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  subscription_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced User Profiles (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  
  -- Per-frontend preferences
  preferences JSONB DEFAULT '{
    "flowmind": {
      "preferred_model": "claude-3-haiku",
      "system_prompt": "",
      "max_tokens": 4000
    },
    "quantum": {
      "default_agents": 5,
      "optimization_level": "balanced"
    },
    "velocity": {
      "default_agents": 3,
      "execution_mode": "parallel"
    },
    "citypulse": {
      "default_view": "dashboard",
      "alert_preferences": "all"
    }
  }'::jsonb,
  
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Cross-Frontend Activity Log
CREATE TABLE public.cross_frontend_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  source_frontend TEXT NOT NULL CHECK (source_frontend IN ('flowmind', 'quantum', 'velocity', 'citypulse')),
  target_frontend TEXT CHECK (target_frontend IN ('flowmind', 'quantum', 'velocity', 'citypulse')),
  activity_type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- FLOWMIND AI CHAT TABLES
-- ==========================================

-- AI Models Configuration
CREATE TABLE public.ai_models (
  id TEXT PRIMARY KEY, -- e.g., 'claude-3-sonnet', 'gpt-4', 'llama-70b'
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'groq', 'huggingface')),
  context_window INTEGER NOT NULL DEFAULT 4000,
  max_tokens INTEGER NOT NULL DEFAULT 4000,
  cost_per_token DECIMAL(10, 8) DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  capabilities JSONB DEFAULT '{}', -- e.g., {"vision": true, "function_calling": true}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  model_id TEXT REFERENCES ai_models(id),
  system_prompt TEXT,
  
  -- Session metadata
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  
  -- Status
  is_archived BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Messages
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- AI metadata
  model_id TEXT REFERENCES ai_models(id),
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  processing_time_ms INTEGER,
  
  -- Message metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SWARM ORCHESTRATION TABLES (Quantum + Velocity)
-- ==========================================

-- Swarm Tasks
CREATE TABLE public.swarm_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('quantum', 'velocity')),
  
  -- Task definition
  objective TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}', -- e.g., {"agents": 5, "max_iterations": 10}
  constraints JSONB DEFAULT '{}',
  
  -- Execution status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0, -- 0-100%
  
  -- Results
  results JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Performance metrics
  total_agents INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Swarm Agents
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swarm_task_id UUID NOT NULL REFERENCES swarm_tasks(id) ON DELETE CASCADE,
  
  -- Agent definition
  type TEXT NOT NULL, -- e.g., 'coordinator', 'executor', 'analyzer'
  name TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  
  -- Agent status
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'completed', 'failed')),
  current_task TEXT,
  
  -- Performance metrics
  performance_metrics JSONB DEFAULT '{}',
  execution_time_ms INTEGER DEFAULT 0,
  iterations_completed INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Communications (for swarm coordination)
CREATE TABLE public.agent_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swarm_task_id UUID NOT NULL REFERENCES swarm_tasks(id) ON DELETE CASCADE,
  sender_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  receiver_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  message_type TEXT NOT NULL, -- e.g., 'task_request', 'result', 'coordination'
  content JSONB NOT NULL,
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CITYPULSE ENERGY MANAGEMENT TABLES
-- (Copied from existing schema with user_id for multi-tenant)
-- ==========================================

-- Buildings Table (Enhanced for multi-tenant)
CREATE TABLE public.buildings (
  id TEXT PRIMARY KEY, -- Custom IDs like 'rathaus-hechingen'
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE, -- Multi-tenant support
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'rathaus', 'realschule', 'grundschule', 'gymnasium', 
    'werkrealschule', 'sporthallen', 'hallenbad'
  )),
  address TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  area DECIMAL(10,2) NOT NULL DEFAULT 0, -- Square meters
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  yearly_consumption DECIMAL(12,2) DEFAULT 0, -- kWh per year
  kwh_per_square_meter DECIMAL(8,2) DEFAULT 0,
  energy_class TEXT CHECK (energy_class IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  
  -- Savings potential
  savings_potential_kwh DECIMAL(12,2) DEFAULT 0,
  savings_potential_euro DECIMAL(10,2) DEFAULT 0,
  savings_potential_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Special features (JSONB for flexibility)
  special_features JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_update TIMESTAMPTZ DEFAULT NOW()
);

-- Sensors Table (Enhanced for multi-tenant)
CREATE TABLE public.sensors (
  id TEXT PRIMARY KEY, -- Custom IDs like 'energy-rathaus-hechingen'
  building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'energy', 'temperature', 'humidity', 'occupancy', 'security', 
    'water_quality', 'pump', 'pool', 'heritage', 'education', 
    'sports', 'services', 'renovation', 'visitors', 'environment'
  )),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  
  -- Current reading
  current_value DECIMAL(12,4),
  last_reading TIMESTAMPTZ DEFAULT NOW(),
  
  -- Sensor metadata
  metadata JSONB DEFAULT '{}', -- location, critical, alert_threshold, description, etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sensor Readings Table (Time Series Data)
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_id TEXT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  value DECIMAL(12,4) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  -- Constraint to prevent duplicate readings at same timestamp
  UNIQUE(sensor_id, timestamp)
);

-- Energy Data Table (Aggregated Data)
CREATE TABLE public.energy_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  
  -- Energy metrics
  consumption DECIMAL(12,4) NOT NULL DEFAULT 0, -- kWh consumed
  production DECIMAL(12,4) NOT NULL DEFAULT 0,  -- kWh produced (solar)
  efficiency DECIMAL(5,2) NOT NULL DEFAULT 0,   -- Percentage
  co2_saved DECIMAL(10,4) NOT NULL DEFAULT 0,   -- kg CO2
  
  -- Granularity level
  granularity TEXT NOT NULL DEFAULT 'hour' CHECK (granularity IN ('hour', 'day', 'week', 'month')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate entries
  UNIQUE(building_id, timestamp, granularity)
);

-- Alerts Table (Enhanced for multi-tenant)
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id TEXT REFERENCES buildings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('critical', 'warning', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  source TEXT NOT NULL DEFAULT 'System',
  
  -- Alert status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES user_profiles(id),
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Cache Table
CREATE TABLE public.analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT NOT NULL UNIQUE,
  building_id TEXT REFERENCES buildings(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('day', 'week', 'month', 'year')),
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SHARED SYSTEM TABLES
-- ==========================================

-- API Keys Table (for external integrations)
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{}',
  frontends JSONB DEFAULT '["flowmind"]'::jsonb, -- Which frontends this key can access
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Logs
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES user_profiles(id),
  frontend TEXT CHECK (frontend IN ('flowmind', 'quantum', 'velocity', 'citypulse')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PERFORMANCE INDEXES
-- ==========================================

-- User profiles
CREATE INDEX idx_user_profiles_organization_id ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Cross-frontend activities
CREATE INDEX idx_cross_frontend_activities_user_id ON cross_frontend_activities(user_id);
CREATE INDEX idx_cross_frontend_activities_source ON cross_frontend_activities(source_frontend);
CREATE INDEX idx_cross_frontend_activities_timestamp ON cross_frontend_activities(timestamp DESC);

-- Chat sessions
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- AI messages
CREATE INDEX idx_ai_messages_session_id ON ai_messages(session_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at DESC);

-- Swarm tasks
CREATE INDEX idx_swarm_tasks_user_id ON swarm_tasks(user_id);
CREATE INDEX idx_swarm_tasks_type ON swarm_tasks(type);
CREATE INDEX idx_swarm_tasks_status ON swarm_tasks(status);
CREATE INDEX idx_swarm_tasks_created_at ON swarm_tasks(created_at DESC);

-- Agents
CREATE INDEX idx_agents_swarm_task_id ON agents(swarm_task_id);
CREATE INDEX idx_agents_status ON agents(status);

-- Buildings (multi-tenant)
CREATE INDEX idx_buildings_user_id ON buildings(user_id);
CREATE INDEX idx_buildings_type ON buildings(type);
CREATE INDEX idx_buildings_status ON buildings(status);

-- Sensors
CREATE INDEX idx_sensors_building_id ON sensors(building_id);
CREATE INDEX idx_sensors_type ON sensors(type);
CREATE INDEX idx_sensors_status ON sensors(status);

-- Sensor readings (time series optimization)
CREATE INDEX idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX idx_sensor_readings_sensor_timestamp ON sensor_readings(sensor_id, timestamp DESC);

-- Energy data
CREATE INDEX idx_energy_data_building_id ON energy_data(building_id);
CREATE INDEX idx_energy_data_timestamp ON energy_data(timestamp DESC);
CREATE INDEX idx_energy_data_granularity ON energy_data(granularity);

-- Alerts
CREATE INDEX idx_alerts_building_id ON alerts(building_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);

-- Analytics cache
CREATE INDEX idx_analytics_cache_key ON analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);

-- System logs
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_frontend ON system_logs(frontend);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_frontend_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE swarm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Chat sessions policies
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- AI messages policies
CREATE POLICY "Users can manage own messages" ON ai_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE id = ai_messages.session_id AND user_id = auth.uid()
    )
  );

-- Swarm tasks policies
CREATE POLICY "Users can manage own swarm tasks" ON swarm_tasks
  FOR ALL USING (auth.uid() = user_id);

-- Agents policies
CREATE POLICY "Users can view own agents" ON agents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM swarm_tasks 
      WHERE id = agents.swarm_task_id AND user_id = auth.uid()
    )
  );

-- Buildings policies (multi-tenant)
CREATE POLICY "Users can manage own buildings" ON buildings
  FOR ALL USING (auth.uid() = user_id);

-- Sensors policies
CREATE POLICY "Users can manage sensors of own buildings" ON sensors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM buildings 
      WHERE id = sensors.building_id AND user_id = auth.uid()
    )
  );

-- Energy data policies
CREATE POLICY "Users can view energy data of own buildings" ON energy_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM buildings 
      WHERE id = energy_data.building_id AND user_id = auth.uid()
    )
  );

-- Alerts policies
CREATE POLICY "Users can manage alerts of own buildings" ON alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM buildings 
      WHERE id = alerts.building_id AND user_id = auth.uid()
    )
  );

-- API keys policies
CREATE POLICY "Users can manage own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_swarm_tasks_updated_at BEFORE UPDATE ON swarm_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON sensors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert default AI models
INSERT INTO ai_models (id, name, provider, context_window, max_tokens, capabilities) VALUES
('claude-3-haiku', 'Claude 3 Haiku', 'anthropic', 200000, 4000, '{"speed": "fast", "cost": "low"}'),
('claude-3-sonnet', 'Claude 3 Sonnet', 'anthropic', 200000, 4000, '{"speed": "medium", "cost": "medium"}'),
('claude-3-opus', 'Claude 3 Opus', 'anthropic', 200000, 4000, '{"speed": "slow", "cost": "high", "quality": "highest"}'),
('gpt-4o', 'GPT-4 Omni', 'openai', 128000, 4000, '{"vision": true, "function_calling": true}'),
('llama-70b', 'Llama 2 70B', 'groq', 4000, 4000, '{"speed": "very_fast", "cost": "very_low"}');

-- Insert default organization
INSERT INTO organizations (id, name, slug, plan, features) VALUES 
('00000000-0000-0000-0000-000000000001', 'Default Organization', 'default', 'enterprise', '{
  "flowmind": true,
  "quantum": true,
  "velocity": true,
  "citypulse": true,
  "max_ai_requests_per_day": 10000,
  "max_swarm_agents": 50,
  "max_buildings": 100
}'::jsonb);

-- ==========================================
-- GRANTS & PERMISSIONS
-- ==========================================

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON chat_sessions, ai_messages, swarm_tasks, agents TO authenticated;
GRANT INSERT, UPDATE ON sensor_readings, energy_data TO authenticated;
GRANT UPDATE (is_read, is_resolved) ON alerts TO authenticated;

-- Grant admin permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE ai_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE swarm_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE energy_data;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

SELECT 'FlowMind Universal Backend Schema created successfully!' as status;