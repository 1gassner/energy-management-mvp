-- CityPulse Energy Management System Database Schema
-- Supabase PostgreSQL Schema for Marc's Backend Implementation

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ==========================================
-- Users Table (extends Supabase auth.users)
-- ==========================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
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

-- ==========================================
-- Buildings Table
-- ==========================================
CREATE TABLE public.buildings (
  id TEXT PRIMARY KEY, -- Custom IDs like 'rathaus-hechingen'
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

-- Enable RLS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buildings
CREATE POLICY "All authenticated users can view buildings" ON buildings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Managers and admins can update buildings" ON buildings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can insert/delete buildings" ON buildings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==========================================
-- Sensors Table
-- ==========================================
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

-- Indexes for performance
CREATE INDEX idx_sensors_building_id ON sensors(building_id);
CREATE INDEX idx_sensors_type ON sensors(type);
CREATE INDEX idx_sensors_status ON sensors(status);
CREATE INDEX idx_sensors_metadata_gin ON sensors USING GIN(metadata);

-- Enable RLS
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sensors
CREATE POLICY "All authenticated users can view sensors" ON sensors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage sensors" ON sensors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==========================================
-- Sensor Readings Table (Time Series Data)
-- ==========================================
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_id TEXT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  value DECIMAL(12,4) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  -- Constraint to prevent duplicate readings at same timestamp
  UNIQUE(sensor_id, timestamp)
);

-- Indexes for time series queries
CREATE INDEX idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX idx_sensor_readings_sensor_timestamp ON sensor_readings(sensor_id, timestamp DESC);

-- Partitioning by month for better performance (optional, for large datasets)
-- CREATE TABLE sensor_readings_y2024m01 PARTITION OF sensor_readings
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Enable RLS
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sensor_readings
CREATE POLICY "All authenticated users can view sensor readings" ON sensor_readings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert sensor readings" ON sensor_readings
  FOR INSERT WITH CHECK (true); -- Allow system inserts

-- ==========================================
-- Energy Data Table (Aggregated Data)
-- ==========================================
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

-- Indexes for energy data queries
CREATE INDEX idx_energy_data_building_id ON energy_data(building_id);
CREATE INDEX idx_energy_data_timestamp ON energy_data(timestamp DESC);
CREATE INDEX idx_energy_data_building_timestamp ON energy_data(building_id, timestamp DESC);
CREATE INDEX idx_energy_data_granularity ON energy_data(granularity);

-- Enable RLS
ALTER TABLE energy_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for energy_data
CREATE POLICY "All authenticated users can view energy data" ON energy_data
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert energy data" ON energy_data
  FOR INSERT WITH CHECK (true);

-- ==========================================
-- Alerts Table
-- ==========================================
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

-- Indexes for alerts
CREATE INDEX idx_alerts_building_id ON alerts(building_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_priority ON alerts(priority);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alerts
CREATE POLICY "All authenticated users can view alerts" ON alerts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can mark alerts as read" ON alerts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Managers and admins can resolve alerts" ON alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "System can create alerts" ON alerts
  FOR INSERT WITH CHECK (true);

-- ==========================================
-- Analytics Cache Table
-- ==========================================
CREATE TABLE public.analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT NOT NULL UNIQUE,
  building_id TEXT REFERENCES buildings(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('day', 'week', 'month', 'year')),
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cache lookups
CREATE INDEX idx_analytics_cache_key ON analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);

-- Enable RLS
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_cache
CREATE POLICY "All authenticated users can view analytics cache" ON analytics_cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage analytics cache" ON analytics_cache
  FOR ALL WITH CHECK (true);

-- ==========================================
-- API Keys Table (for external integrations)
-- ==========================================
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Triggers for updated_at timestamps
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON sensors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Functions for Data Aggregation
-- ==========================================

-- Function to aggregate hourly energy data to daily
CREATE OR REPLACE FUNCTION aggregate_energy_data_daily()
RETURNS void AS $$
BEGIN
  INSERT INTO energy_data (building_id, timestamp, consumption, production, efficiency, co2_saved, granularity)
  SELECT 
    building_id,
    DATE_TRUNC('day', timestamp) as day,
    SUM(consumption) as total_consumption,
    SUM(production) as total_production,
    AVG(efficiency) as avg_efficiency,
    SUM(co2_saved) as total_co2_saved,
    'day' as granularity
  FROM energy_data 
  WHERE granularity = 'hour' 
    AND timestamp >= CURRENT_DATE - INTERVAL '1 day'
    AND timestamp < CURRENT_DATE
  GROUP BY building_id, DATE_TRUNC('day', timestamp)
  ON CONFLICT (building_id, timestamp, granularity) 
  DO UPDATE SET
    consumption = EXCLUDED.consumption,
    production = EXCLUDED.production,
    efficiency = EXCLUDED.efficiency,
    co2_saved = EXCLUDED.co2_saved;
END;
$$ LANGUAGE plpgsql;

-- Function to clean old sensor readings (keep only 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_sensor_readings()
RETURNS void AS $$
BEGIN
  DELETE FROM sensor_readings 
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired analytics cache
CREATE OR REPLACE FUNCTION cleanup_analytics_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_cache 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Scheduled Jobs (using pg_cron extension)
-- ==========================================
-- Run daily at 1:00 AM
SELECT cron.schedule('aggregate-daily-energy', '0 1 * * *', 'SELECT aggregate_energy_data_daily();');

-- Clean old data weekly on Sunday at 2:00 AM
SELECT cron.schedule('cleanup-sensor-readings', '0 2 * * 0', 'SELECT cleanup_old_sensor_readings();');

-- Clean cache every hour
SELECT cron.schedule('cleanup-analytics-cache', '0 * * * *', 'SELECT cleanup_analytics_cache();');

-- ==========================================
-- Views for Common Queries
-- ==========================================

-- View for building statistics
CREATE VIEW building_stats AS
SELECT 
  b.id,
  b.name,
  b.type,
  b.status,
  b.yearly_consumption,
  b.kwh_per_square_meter,
  b.energy_class,
  COUNT(s.id) as sensor_count,
  COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_sensors,
  COUNT(CASE WHEN a.is_resolved = false THEN 1 END) as unresolved_alerts
FROM buildings b
LEFT JOIN sensors s ON b.id = s.building_id
LEFT JOIN alerts a ON b.id = a.building_id
GROUP BY b.id, b.name, b.type, b.status, b.yearly_consumption, b.kwh_per_square_meter, b.energy_class;

-- View for latest sensor readings
CREATE VIEW latest_sensor_readings AS
SELECT DISTINCT ON (s.id)
  s.id as sensor_id,
  s.building_id,
  s.name as sensor_name,
  s.type,
  s.unit,
  s.status,
  sr.value,
  sr.timestamp as last_reading,
  s.metadata
FROM sensors s
LEFT JOIN sensor_readings sr ON s.id = sr.sensor_id
ORDER BY s.id, sr.timestamp DESC;

-- View for active alerts summary
CREATE VIEW active_alerts_summary AS
SELECT 
  building_id,
  COUNT(*) as total_alerts,
  COUNT(CASE WHEN type = 'critical' THEN 1 END) as critical_alerts,
  COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning_alerts,
  COUNT(CASE WHEN type = 'info' THEN 1 END) as info_alerts,
  MAX(timestamp) as latest_alert
FROM alerts 
WHERE is_resolved = false
GROUP BY building_id;

-- ==========================================
-- Seed Data (Hechingen Buildings)
-- ==========================================

-- Insert Hechingen buildings
INSERT INTO buildings (id, name, type, address, capacity, area, yearly_consumption, kwh_per_square_meter, energy_class, savings_potential_kwh, savings_potential_euro, savings_potential_percentage, special_features) VALUES
('rathaus-hechingen', 'Rathaus Hechingen', 'rathaus', 'Obertorplatz 7, 72379 Hechingen', 150, 3000.00, 300000.00, 100.00, 'C', 60000.00, 12780.00, 20.00, '{"buildYear": 1850, "lastRenovation": 2018, "renovationStatus": "completed"}'),
('realschule-hechingen', 'Realschule Hechingen', 'realschule', 'Weilheimer Straße 14, 72379 Hechingen', 200, 7000.00, 350000.00, 50.00, 'A', 35000.00, 7455.00, 10.00, '{"buildYear": 1970, "lastRenovation": 2020, "renovationStatus": "completed", "kfwStandard": "KfW-55", "studentCount": 800}'),
('grundschule-hechingen', 'Grundschule Hechingen', 'grundschule', 'Schulgasse 9, 72379 Hechingen', 250, 5000.00, 400000.00, 80.00, 'B', 80000.00, 17040.00, 20.00, '{"buildYear": 1960, "lastRenovation": 2015, "renovationStatus": "completed", "studentCount": 450}'),
('sporthallen-hechingen', 'Sporthallen Hechingen', 'sporthallen', 'Am Sportplatz 5, 72379 Hechingen', 180, 3000.00, 250000.00, 83.00, 'C', 50000.00, 10650.00, 20.00, '{"buildYear": 1985, "lastRenovation": 2010, "renovationStatus": "none", "sportFacilities": ["Turnhalle", "Gymnastikhalle", "Kraftraum"]}'),
('hallenbad-hechingen', 'Hallenbad Hechingen', 'hallenbad', 'Badstraße 12, 72379 Hechingen', 800, 600.00, 1200000.00, 2000.00, 'D', 240000.00, 51120.00, 20.00, '{"buildYear": 1975, "lastRenovation": 2012, "renovationStatus": "none", "poolTemperature": 28, "waterSurface": 600, "poolHours": "Mo-Fr 6:00-22:00, Sa-So 8:00-20:00"}'),
('werkrealschule-hechingen', 'Werkrealschule Hechingen', 'werkrealschule', 'Industriestraße 8, 72379 Hechingen', 220, 5500.00, 400000.00, 73.00, 'C', 80000.00, 17040.00, 20.00, '{"buildYear": 1965, "lastRenovation": 2008, "renovationStatus": "planned", "studentCount": 150}'),
('gymnasium-hechingen', 'Gymnasium Hechingen', 'gymnasium', 'Zeppelinstraße 11, 72379 Hechingen', 350, 8000.00, 600000.00, 75.00, 'C', 90000.00, 19170.00, 15.00, '{"buildYear": 1909, "lastRenovation": 2005, "renovationStatus": "planned", "heritageProtection": true, "studentCount": 1200}');

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON sensor_readings TO authenticated;
GRANT INSERT, UPDATE ON energy_data TO authenticated;
GRANT UPDATE (is_read, is_resolved) ON alerts TO authenticated;

-- Grant admin permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Enable real-time subscriptions for important tables
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE energy_data;

-- ==========================================
-- Database Optimization
-- ==========================================

-- Analyze tables for better query planning
ANALYZE;

-- ==========================================
-- API Performance Indexes
-- ==========================================

-- Composite indexes for common API queries
CREATE INDEX idx_buildings_type_status ON buildings(type, status);
CREATE INDEX idx_sensors_building_type_status ON sensors(building_id, type, status);
CREATE INDEX idx_energy_data_building_period ON energy_data(building_id, granularity, timestamp DESC);
CREATE INDEX idx_alerts_building_status ON alerts(building_id, is_resolved, timestamp DESC);

-- ==========================================
-- Comments for Documentation
-- ==========================================

COMMENT ON TABLE buildings IS 'Stores information about all buildings in the CityPulse system';
COMMENT ON TABLE sensors IS 'Stores sensor definitions and metadata for each building';
COMMENT ON TABLE sensor_readings IS 'Time series data for all sensor readings';
COMMENT ON TABLE energy_data IS 'Aggregated energy consumption and production data';
COMMENT ON TABLE alerts IS 'System alerts and notifications';
COMMENT ON TABLE analytics_cache IS 'Cache for expensive analytics queries';

COMMENT ON COLUMN buildings.kwh_per_square_meter IS 'Energy efficiency metric in kWh per square meter per year';
COMMENT ON COLUMN buildings.special_features IS 'JSONB field for flexible building-specific data';
COMMENT ON COLUMN sensors.metadata IS 'JSONB field for sensor-specific configuration and metadata';

-- Success message
SELECT 'CityPulse Database Schema created successfully!' as status;