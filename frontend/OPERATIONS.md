# 🛠️ CityPulse Operations Manual

**Version:** 1.0.0  
**Last Updated:** August 3, 2025

---

## 📋 Table of Contents

1. [Operations Overview](#-operations-overview)
2. [System Administration](#-system-administration)
3. [Monitoring & Alerting](#-monitoring--alerting)
4. [Backup & Recovery](#-backup--recovery)
5. [Performance Management](#-performance-management)
6. [Security Operations](#-security-operations)
7. [Maintenance Procedures](#-maintenance-procedures)
8. [Incident Response](#-incident-response)

---

## 🌐 Operations Overview

### System Architecture

#### Production Environment
- **Frontend:** Vercel CDN deployment
- **Backend:** Railway/Cloud infrastructure (when available)
- **Database:** PostgreSQL with automated backups
- **Monitoring:** Sentry, Lighthouse CI, Uptime monitoring
- **CDN:** Global edge distribution via Vercel

#### Key Metrics
- **Uptime SLA:** 99.9% availability target
- **Response Time:** < 200ms average
- **Error Rate:** < 0.1% target
- **User Capacity:** 500 concurrent users
- **Data Processing:** 745+ sensors, real-time updates

### Operational Responsibilities

#### Daily Operations
- **System Health Monitoring** - Check all dashboards and alerts
- **Performance Review** - Monitor response times and uptime
- **User Support** - Handle user issues and feedback
- **Data Quality** - Verify sensor data integrity
- **Security Monitoring** - Review access logs and security events

#### Weekly Operations
- **Performance Analysis** - Review weekly trends and metrics
- **Capacity Planning** - Monitor resource usage trends
- **Security Review** - Analyze security logs and incidents
- **Backup Verification** - Test backup integrity and restore procedures
- **User Feedback** - Process feature requests and bug reports

#### Monthly Operations
- **System Updates** - Plan and execute system updates
- **Security Audit** - Comprehensive security review
- **Performance Optimization** - Identify and implement improvements
- **Disaster Recovery Testing** - Test backup and recovery procedures
- **Documentation Updates** - Update operational procedures

---

## 🔧 System Administration

### User Management

#### User Roles Administration

##### Adding New Users
```bash
# Via Admin Dashboard
1. Login as Admin (admin@hechingen.de)
2. Navigate to Administration → User Management
3. Click "Add New User"
4. Fill in user details:
   - Name: [Full Name]
   - Email: [user@domain.com]
   - Role: [admin|techniker|energiemanager|gebäudeverwalter|bürger|analyst]
   - Building Access: [Select authorized buildings]
5. Set initial password (user must change on first login)
6. Send invitation email
```

##### User Role Permissions
| Role | Buildings | Sensors | Analytics | Admin | Alerts |
|------|-----------|---------|-----------|-------|--------|
| **Admin** | All | All | All | Yes | All |
| **Techniker** | All | Read/Write | Limited | No | Technical |
| **Energiemanager** | All | Read | Full | No | Energy |
| **Gebäudeverwalter** | Assigned | Read | Building | No | Building |
| **Bürger** | Public | None | Public | No | None |
| **Analyst** | All | Read | Full | No | Analysis |

##### Deactivating Users
```bash
# For security breaches or role changes
1. Admin Dashboard → User Management
2. Find user in list
3. Click "Deactivate" or "Suspend"
4. Select reason:
   - Role Change
   - Security Incident
   - User Request
   - Policy Violation
5. Set deactivation date
6. Notify relevant stakeholders
```

### System Configuration

#### Environment Variables
```env
# Production Configuration
NODE_ENV=production
VITE_APP_ENV=production
VITE_API_URL=https://api.citypulse-hechingen.de/api
VITE_WS_URL=wss://api.citypulse-hechingen.de/ws

# Security
VITE_FORCE_HTTPS=true
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_ENABLE_ANALYTICS=true

# Performance
VITE_BUILD_SOURCEMAP=false
VITE_ENABLE_CONSOLE_LOGS=false
```

#### Feature Flags
```typescript
// Feature toggle configuration
const featureFlags = {
  realTimeUpdates: true,
  advancedAnalytics: true,
  mobileNotifications: true,
  experimentalCharts: false,
  betaFeatures: false
};
```

### Database Administration

#### Data Retention Policies
```sql
-- Sensor data retention (2 years active, archive after)
DELETE FROM sensor_readings 
WHERE created_at < NOW() - INTERVAL '2 years';

-- Alert history (1 year active)
DELETE FROM alerts 
WHERE created_at < NOW() - INTERVAL '1 year' 
AND status = 'resolved';

-- User session logs (30 days)
DELETE FROM user_sessions 
WHERE last_activity < NOW() - INTERVAL '30 days';
```

#### Database Maintenance
```bash
# Weekly maintenance script
#!/bin/bash
echo "Starting weekly database maintenance..."

# Vacuum and analyze
psql -c "VACUUM ANALYZE;"

# Update statistics
psql -c "UPDATE STATISTICS;"

# Check index usage
psql -c "SELECT schemaname, tablename, attname, n_distinct, correlation 
         FROM pg_stats WHERE tablename = 'sensor_readings';"

# Backup verification
pg_dump citypulse_prod | gzip > weekly_backup_$(date +%Y%m%d).sql.gz
```

---

## 📊 Monitoring & Alerting

### System Monitoring

#### Key Performance Indicators (KPIs)
```typescript
interface SystemKPIs {
  uptime: number;              // Target: 99.9%
  responseTime: number;        // Target: < 200ms
  errorRate: number;           // Target: < 0.1%
  throughput: number;          // Requests per minute
  activeUsers: number;         // Concurrent users
  sensorDataLatency: number;   // Target: < 5s
}
```

#### Monitoring Dashboard
```bash
# Production monitoring endpoints
GET /api/health              # System health check
GET /api/metrics             # Performance metrics
GET /api/status              # Service status
GET /api/sensors/health      # Sensor connectivity
```

### Alert Configuration

#### Critical Alerts (Immediate Response)
```yaml
critical_alerts:
  system_down:
    condition: "uptime < 99%"
    notification: "SMS + Email + Slack"
    escalation: "After 5 minutes"
    
  data_loss:
    condition: "sensor_data_gap > 10 minutes"
    notification: "Email + Slack"
    escalation: "After 15 minutes"
    
  security_breach:
    condition: "failed_logins > 10 in 5 minutes"
    notification: "SMS + Email"
    escalation: "Immediate"
```

#### Warning Alerts (Standard Response)
```yaml
warning_alerts:
  high_response_time:
    condition: "avg_response_time > 1000ms"
    notification: "Email"
    escalation: "After 30 minutes"
    
  sensor_offline:
    condition: "sensor_offline > 5% of total"
    notification: "Email + Dashboard"
    escalation: "After 1 hour"
    
  storage_usage:
    condition: "disk_usage > 80%"
    notification: "Email"
    escalation: "After 2 hours"
```

### Logging & Auditing

#### Log Levels and Retention
```typescript
// Log configuration
const logConfig = {
  levels: {
    error: 365,      // Keep error logs for 1 year
    warn: 90,        // Keep warning logs for 3 months
    info: 30,        // Keep info logs for 1 month
    debug: 7         // Keep debug logs for 1 week
  },
  
  categories: {
    authentication: 365,    // Security logs - 1 year
    userActivity: 90,       // User activity - 3 months
    systemPerformance: 30,  // Performance - 1 month
    apiRequests: 7          // API logs - 1 week
  }
};
```

#### Audit Trail
```sql
-- User activity audit
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  details JSONB
);

-- Track important actions
INSERT INTO audit_log (user_id, action, resource, details)
VALUES ($1, 'USER_LOGIN', 'AUTH', '{"role": "admin", "building": "rathaus"}');
```

---

## 💾 Backup & Recovery

### Backup Strategy

#### Automated Backups
```bash
#!/bin/bash
# Daily backup script (runs at 2 AM UTC)

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/citypulse"

# Database backup
pg_dump citypulse_prod | gzip > "$BACKUP_DIR/db_$BACKUP_DATE.sql.gz"

# Application data backup
tar -czf "$BACKUP_DIR/app_data_$BACKUP_DATE.tar.gz" /var/app/data

# Static files backup
tar -czf "$BACKUP_DIR/static_$BACKUP_DATE.tar.gz" /var/app/static

# Upload to cloud storage (S3/Google Cloud)
aws s3 cp "$BACKUP_DIR/" s3://citypulse-backups/ --recursive

# Cleanup local backups older than 7 days
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete
```

#### Backup Verification
```bash
#!/bin/bash
# Weekly backup verification (runs Sundays)

# Test database restore
LATEST_BACKUP=$(ls -t /backups/citypulse/db_*.sql.gz | head -1)
createdb citypulse_test
gunzip -c "$LATEST_BACKUP" | psql citypulse_test

# Verify data integrity
psql citypulse_test -c "SELECT COUNT(*) FROM sensor_readings WHERE created_at > NOW() - INTERVAL '1 day';"

# Cleanup test database
dropdb citypulse_test
```

### Disaster Recovery

#### Recovery Time Objectives (RTO)
- **Critical System Recovery:** 1 hour
- **Database Recovery:** 30 minutes
- **Full System Recovery:** 4 hours
- **Data Recovery Point:** 1 hour maximum data loss

#### Recovery Procedures

##### Database Recovery
```bash
# Complete database recovery
#!/bin/bash

echo "Starting database recovery procedure..."

# Stop application services
systemctl stop citypulse-app

# Backup current state (if possible)
pg_dump citypulse_prod > /tmp/pre_recovery_$(date +%Y%m%d_%H%M%S).sql

# Drop and recreate database
dropdb citypulse_prod
createdb citypulse_prod

# Restore from backup
RECOVERY_BACKUP="/backups/citypulse/db_latest.sql.gz"
gunzip -c "$RECOVERY_BACKUP" | psql citypulse_prod

# Restart services
systemctl start citypulse-app

echo "Database recovery completed"
```

##### Application Recovery
```bash
# Application stack recovery
#!/bin/bash

echo "Starting application recovery..."

# Pull latest stable image
docker pull citypulse/app:stable

# Stop current container
docker stop citypulse-app

# Remove old container
docker rm citypulse-app

# Start new container with recovered data
docker run -d --name citypulse-app \
  -v /var/app/data:/app/data \
  -p 3000:3000 \
  citypulse/app:stable

echo "Application recovery completed"
```

---

## ⚡ Performance Management

### Performance Monitoring

#### Frontend Performance Metrics
```typescript
// Performance monitoring configuration
const performanceConfig = {
  metrics: {
    firstContentfulPaint: { target: 1200, alert: 2000 },
    largestContentfulPaint: { target: 2500, alert: 4000 },
    firstInputDelay: { target: 100, alert: 300 },
    cumulativeLayoutShift: { target: 0.1, alert: 0.25 },
    timeToInteractive: { target: 3000, alert: 5000 }
  },
  
  monitoring: {
    interval: 300000,      // 5 minutes
    sampleRate: 0.1,       // 10% of traffic
    alertThreshold: 5      // 5 consecutive failures
  }
};
```

#### Backend Performance Optimization
```sql
-- Database performance optimization
-- Index optimization for frequent queries
CREATE INDEX CONCURRENTLY idx_sensor_readings_timestamp 
ON sensor_readings (timestamp DESC);

CREATE INDEX CONCURRENTLY idx_sensor_readings_building 
ON sensor_readings (building_id, timestamp DESC);

-- Query optimization for dashboard
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  building_id,
  DATE_TRUNC('hour', timestamp) as hour,
  AVG(value) as avg_value,
  MAX(value) as max_value,
  MIN(value) as min_value
FROM sensor_readings 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY building_id, hour;

-- Refresh materialized view every 15 minutes
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;
```

### Capacity Planning

#### Resource Monitoring
```bash
#!/bin/bash
# System resource monitoring script

# CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)

# Memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')

# Disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)

# Database connections
DB_CONNECTIONS=$(psql -t -c "SELECT count(*) FROM pg_stat_activity;")

# Log metrics
echo "$(date): CPU=$CPU_USAGE% MEM=$MEMORY_USAGE% DISK=$DISK_USAGE% DB_CONN=$DB_CONNECTIONS" >> /var/log/citypulse/resources.log

# Alert if thresholds exceeded
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
  echo "High CPU usage: $CPU_USAGE%" | mail -s "CityPulse Alert" ops@citypulse.de
fi
```

#### Scaling Procedures
```yaml
# Auto-scaling configuration
autoscaling:
  frontend:
    metric: "cpu_utilization"
    target: 70
    min_instances: 2
    max_instances: 10
    scale_up_cooldown: 300
    scale_down_cooldown: 600
    
  backend:
    metric: "response_time"
    target: 500ms
    min_instances: 2
    max_instances: 8
    
  database:
    read_replicas: 2
    connection_pool: 100
    cache_size: "2GB"
```

---

## 🔒 Security Operations

### Security Monitoring

#### Security Event Logging
```typescript
// Security event types
enum SecurityEvent {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  PASSWORD_CHANGE = 'password_change',
  ROLE_CHANGE = 'role_change',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_EXPORT = 'data_export',
  ADMIN_ACTION = 'admin_action'
}

// Security event handler
function logSecurityEvent(
  event: SecurityEvent,
  userId: string,
  details: object
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    ip: request.ip,
    userAgent: request.get('User-Agent'),
    details
  };
  
  // Log to security audit trail
  securityLogger.warn(logEntry);
  
  // Alert on suspicious patterns
  if (isSuspiciousPattern(event, userId)) {
    alertSecurityTeam(logEntry);
  }
}
```

#### Intrusion Detection
```bash
#!/bin/bash
# Security monitoring script

# Check for failed login attempts
FAILED_LOGINS=$(grep "login_failure" /var/log/citypulse/security.log | 
               tail -100 | 
               grep "$(date '+%Y-%m-%d')" | 
               wc -l)

if [ $FAILED_LOGINS -gt 10 ]; then
  echo "High number of failed logins: $FAILED_LOGINS" | 
  mail -s "Security Alert: Failed Logins" security@citypulse.de
fi

# Check for unauthorized access attempts
UNAUTHORIZED=$(grep "unauthorized_access" /var/log/citypulse/security.log | 
              tail -50 | 
              grep "$(date '+%Y-%m-%d')" | 
              wc -l)

if [ $UNAUTHORIZED -gt 5 ]; then
  echo "Unauthorized access attempts detected: $UNAUTHORIZED" | 
  mail -s "Security Alert: Unauthorized Access" security@citypulse.de
fi
```

### Security Incident Response

#### Incident Classification
| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **P1 - Critical** | System breach, data theft | 15 minutes | CISO, Management |
| **P2 - High** | Unauthorized access, DoS | 1 hour | Security team |
| **P3 - Medium** | Policy violation, suspicious activity | 4 hours | IT team |
| **P4 - Low** | Failed logins, minor issues | 24 hours | Monitoring only |

#### Incident Response Procedures
```bash
# P1 Critical Incident Response
#!/bin/bash

echo "CRITICAL SECURITY INCIDENT - IMMEDIATE ACTION REQUIRED"

# 1. Isolate affected systems
iptables -A INPUT -s $SUSPICIOUS_IP -j DROP

# 2. Preserve evidence
cp /var/log/citypulse/* /security/incident_$(date +%Y%m%d_%H%M%S)/

# 3. Notify stakeholders
echo "Critical security incident detected at $(date)" | 
mail -s "URGENT: Security Incident" ciso@citypulse.de,management@citypulse.de

# 4. Lock affected user accounts
psql -c "UPDATE users SET locked = true WHERE last_login > NOW() - INTERVAL '1 hour';"

# 5. Enable enhanced logging
sed -i 's/log_level=info/log_level=debug/' /etc/citypulse/config
```

---

## 🔧 Maintenance Procedures

### Scheduled Maintenance

#### Weekly Maintenance Window
```bash
#!/bin/bash
# Weekly maintenance script (Sundays 2-4 AM UTC)

echo "Starting weekly maintenance window..."

# 1. System updates
apt update && apt upgrade -y

# 2. Database maintenance
psql citypulse_prod -c "VACUUM ANALYZE;"
psql citypulse_prod -c "REINDEX DATABASE citypulse_prod;"

# 3. Log rotation
logrotate /etc/logrotate.d/citypulse

# 4. Clear temporary files
find /tmp -name "citypulse_*" -mtime +7 -delete

# 5. Update SSL certificates
certbot renew --quiet

# 6. Restart services
systemctl restart citypulse-app
systemctl restart nginx

echo "Weekly maintenance completed"
```

#### Monthly Security Updates
```bash
#!/bin/bash
# Monthly security maintenance

# Update dependencies
cd /opt/citypulse
npm audit fix
npm update

# Security scanning
nmap -sS -O localhost
lynis audit system

# Certificate renewal
openssl x509 -in /etc/ssl/citypulse.crt -text -noout | grep "Not After"

# Firewall rules review
iptables -L -n | mail -s "Monthly Firewall Review" security@citypulse.de
```

### Emergency Maintenance

#### Hotfix Deployment Process
```bash
#!/bin/bash
# Emergency hotfix deployment

# 1. Create backup
pg_dump citypulse_prod > /backup/hotfix_$(date +%Y%m%d_%H%M%S).sql

# 2. Deploy hotfix
docker pull citypulse/app:hotfix-$1
docker stop citypulse-app
docker rm citypulse-app
docker run -d --name citypulse-app citypulse/app:hotfix-$1

# 3. Verify deployment
curl -f http://localhost:3000/api/health || {
  echo "Hotfix deployment failed - rolling back"
  docker stop citypulse-app
  docker rm citypulse-app
  docker run -d --name citypulse-app citypulse/app:stable
  exit 1
}

echo "Hotfix $1 deployed successfully"
```

---

## 🚨 Incident Response

### Incident Categories

#### System Outages
```yaml
system_outage:
  detection:
    - Health check failures
    - User reports
    - Monitoring alerts
  
  response:
    1. Verify outage scope
    2. Check infrastructure status
    3. Review recent changes
    4. Implement immediate fix or rollback
    5. Communicate with stakeholders
    
  communication:
    - Status page update
    - Email to affected users
    - Slack notification to team
```

#### Data Issues
```yaml
data_issues:
  sensor_data_loss:
    detection: "Missing sensor readings > 10 minutes"
    response:
      1. Check sensor connectivity
      2. Verify data pipeline
      3. Contact building maintenance
      4. Implement data recovery
      
  data_corruption:
    detection: "Invalid sensor values or format errors"
    response:
      1. Isolate affected data
      2. Restore from backup
      3. Identify root cause
      4. Implement preventive measures
```

### Communication Templates

#### Incident Notification Email
```text
Subject: CityPulse System Incident - [SEVERITY] - [BRIEF_DESCRIPTION]

Dear CityPulse Users,

We are currently experiencing [ISSUE_DESCRIPTION] that is affecting [AFFECTED_SERVICES].

Incident Details:
- Start Time: [TIMESTAMP]
- Affected Services: [LIST]
- Impact: [DESCRIPTION]
- Current Status: [INVESTIGATING/FIXING/RESOLVED]

We are actively working to resolve this issue and will provide updates every 30 minutes.

For urgent matters, please contact: [EMERGENCY_CONTACT]

We apologize for any inconvenience.

CityPulse Operations Team
```

#### Resolution Notification
```text
Subject: RESOLVED: CityPulse System Incident - [BRIEF_DESCRIPTION]

Dear CityPulse Users,

The system incident that began at [START_TIME] has been resolved as of [END_TIME].

Resolution Summary:
- Root Cause: [DESCRIPTION]
- Fix Applied: [DESCRIPTION]
- Prevention: [MEASURES_TAKEN]

All services are now operating normally. If you continue to experience issues, please contact support.

Thank you for your patience.

CityPulse Operations Team
```

---

## 📞 Contact Information

### Operations Team
- **Operations Manager:** ops-manager@citypulse.de
- **System Administrator:** sysadmin@citypulse.de
- **Database Administrator:** dba@citypulse.de
- **Security Officer:** security@citypulse.de

### Emergency Contacts
- **24/7 Operations:** +49 (0) 7471 / 930-OPS
- **Security Incidents:** +49 (0) 7471 / 930-SEC
- **Management Escalation:** management@citypulse.de

### External Contacts
- **Hosting Provider:** Vercel Support
- **Database Provider:** Cloud SQL Support
- **Security Vendor:** Sentry Support
- **CDN Provider:** Cloudflare Support

---

**Operations Manual** - Complete operational procedures for CityPulse

*Ensuring reliable, secure, and efficient system operations*