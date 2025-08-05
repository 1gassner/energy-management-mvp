# CityPulse Mobile App - Integration Architecture Plan

## Overview

This document outlines the comprehensive integration strategy for connecting the CityPulse mobile application with the existing web platform, ensuring seamless data flow, real-time synchronization, and unified user experience across all platforms.

## 1. Integration Architecture

### 1.1 High-Level Integration Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    CityPulse Ecosystem                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Web App   │    │ Mobile App  │    │   Admin Portal      │  │
│  │  (React)    │    │(React Native│    │    (React)          │  │
│  │             │    │   + Expo)   │    │                     │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────────────┘  │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
├────────────────────────────┼────────────────────────────────────┤
│                   Unified API Gateway                           │
│         ┌─────────────────────────────────────────┐             │
│         │          Load Balancer                  │             │
│         │    ┌─────────────┐  ┌─────────────┐     │             │
│         │    │ REST API    │  │ WebSocket   │     │             │
│         │    │ Server      │  │   Server    │     │             │
│         │    │(Express.js) │  │(Socket.io)  │     │             │
│         │    └─────────────┘  └─────────────┘     │             │
│         └─────────────────────────────────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                    Shared Services Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │    Auth     │ │    Push     │ │   Cache     │ │  Analytics │ │
│  │  Service    │ │ Notification│ │   (Redis)   │ │  Service   │ │
│  │             │ │   Service   │ │             │ │            │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                       Data Layer                                │
│           ┌─────────────────────────────────────┐               │
│           │        PostgreSQL Database          │               │
│           │    ┌─────────┐  ┌─────────────┐     │               │
│           │    │  Core   │  │  Mobile     │     │               │
│           │    │ Schema  │  │ Extensions  │     │               │
│           │    └─────────┘  └─────────────┘     │               │
│           └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 API Integration Strategy

#### Unified API Endpoint Structure
```typescript
// Base API Configuration
const API_CONFIG = {
  baseURL: 'https://api.citypulse-hechingen.de/v1',
  timeout: 10000,
  retryAttempts: 3,
  endpoints: {
    auth: '/auth',
    energy: '/energy',
    buildings: '/buildings',
    alerts: '/alerts',
    maintenance: '/maintenance',
    reports: '/reports',
    users: '/users',
    notifications: '/notifications'
  }
};

// Mobile-Specific Extensions
const MOBILE_ENDPOINTS = {
  deviceRegistration: '/mobile/devices',
  biometricAuth: '/mobile/auth/biometric',
  offlineSync: '/mobile/sync',
  pushNotifications: '/mobile/push',
  qrCodeData: '/mobile/qr',
  photoUpload: '/mobile/photos'
};
```

## 2. Authentication Integration

### 2.1 Unified Authentication System

#### Authentication Flow Diagram
```
Mobile App Authentication Flow:

1. Initial Login
   Mobile App → API Gateway → Auth Service → Database
   ↓
2. Biometric Registration
   Mobile App → Secure Storage → Device Keychain
   ↓
3. Token Management
   Mobile App ← JWT Token ← Auth Service
   ↓
4. Session Synchronization
   Mobile Session ↔ Web Session (via shared JWT)
   ↓
5. Multi-Device Support
   User can be logged in on multiple devices simultaneously
```

#### Implementation Details
```typescript
// Unified Authentication Service
interface AuthIntegration {
  // Cross-platform login
  unifiedLogin(credentials: LoginCredentials): Promise<AuthResponse>;
  
  // Mobile-specific authentication
  biometricLogin(deviceId: string, biometricData: string): Promise<AuthResponse>;
  
  // Session synchronization
  syncSessions(userId: string): Promise<SessionData[]>;
  
  // Device management
  registerDevice(deviceInfo: DeviceInfo): Promise<DeviceRegistration>;
  revokeDevice(deviceId: string): Promise<void>;
  
  // Token management
  refreshToken(refreshToken: string): Promise<TokenResponse>;
  validateToken(token: string): Promise<ValidationResult>;
}
```

### 2.2 Role-Based Access Control Integration

```typescript
// Shared Permission System
interface PermissionIntegration {
  // Role synchronization between platforms
  syncUserRoles(userId: string): Promise<UserRole[]>;
  
  // Building assignment synchronization
  syncBuildingAccess(userId: string): Promise<BuildingAccess[]>;
  
  // Permission validation
  validateMobilePermission(
    userId: string, 
    permission: Permission, 
    context: PermissionContext
  ): Promise<boolean>;
  
  // Dynamic permission updates
  updateUserPermissions(userId: string, permissions: Permission[]): Promise<void>;
}
```

## 3. Real-Time Data Integration

### 3.1 WebSocket Connection Strategy

#### Unified WebSocket Architecture
```typescript
// WebSocket Integration Service
interface WebSocketIntegration {
  // Connection management
  establishConnection(userId: string, deviceType: 'web' | 'mobile'): Promise<WebSocketConnection>;
  
  // Subscription management
  subscribeToBuildings(buildingIds: string[]): void;
  subscribeToAlerts(alertTypes: AlertType[]): void;
  subscribeToMaintenanceTasks(taskFilters: TaskFilter[]): void;
  
  // Message routing
  routeMessage(message: WebSocketMessage, targetDevices: DeviceTarget[]): void;
  
  // Connection redundancy
  handleConnectionFailover(): void;
  syncMissedMessages(lastMessageId: string): Promise<WebSocketMessage[]>;
}
```

#### Real-Time Synchronization
```typescript
// Data Synchronization Service
interface DataSyncService {
  // Energy data synchronization
  syncEnergyData(
    buildingId: string, 
    lastSync: Date, 
    platform: Platform
  ): Promise<EnergyDataDelta>;
  
  // Alert synchronization
  syncAlerts(
    userId: string, 
    lastSync: Date
  ): Promise<AlertDelta>;
  
  // Maintenance task synchronization
  syncMaintenanceTasks(
    userId: string, 
    lastSync: Date
  ): Promise<MaintenanceTaskDelta>;
  
  // Bi-directional sync
  pushMobileChanges(changes: MobileDataChanges): Promise<SyncResult>;
  pullPlatformChanges(lastSync: Date): Promise<PlatformDataChanges>;
}
```

## 4. Database Integration

### 4.1 Schema Extensions for Mobile

#### Mobile-Specific Tables
```sql
-- Device Registration and Management
CREATE TABLE mobile_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50), -- 'ios' | 'android'
    device_model VARCHAR(255),
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    push_token TEXT,
    biometric_enabled BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Push Notification Management
CREATE TABLE push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES mobile_devices(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' -- 'pending' | 'sent' | 'delivered' | 'failed'
);

-- Mobile-Specific User Preferences
CREATE TABLE mobile_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_settings JSONB DEFAULT '{}',
    dashboard_layout JSONB DEFAULT '{}',
    app_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- QR Code and Maintenance Integration
CREATE TABLE mobile_maintenance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES mobile_devices(id) ON DELETE CASCADE,
    qr_code_scanned VARCHAR(255),
    photos JSONB DEFAULT '[]',
    notes TEXT,
    location_data JSONB,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'in_progress'
);

-- Offline Data Cache
CREATE TABLE mobile_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data_type VARCHAR(100) NOT NULL,
    data_key VARCHAR(255) NOT NULL,
    data_value JSONB NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, data_type, data_key)
);
```

### 4.2 Data Synchronization Strategy

#### Sync Schema Design
```sql
-- Data Sync Tracking
CREATE TABLE data_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES mobile_devices(id) ON DELETE CASCADE,
    sync_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    operation VARCHAR(50) NOT NULL, -- 'create' | 'update' | 'delete'
    sync_data JSONB,
    sync_timestamp TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending' -- 'pending' | 'synced' | 'failed'
);

-- Conflict Resolution
CREATE TABLE sync_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_log_id UUID REFERENCES data_sync_log(id) ON DELETE CASCADE,
    conflict_type VARCHAR(100) NOT NULL,
    mobile_data JSONB NOT NULL,
    server_data JSONB NOT NULL,
    resolution_strategy VARCHAR(100),
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 5. Push Notification Integration

### 5.1 Unified Notification System

#### Notification Architecture
```typescript
// Push Notification Service
interface PushNotificationIntegration {
  // Multi-platform notification sending
  sendNotification(notification: NotificationPayload): Promise<SendResult>;
  
  // Platform-specific formatting
  formatForPlatform(
    notification: BaseNotification, 
    platform: 'ios' | 'android' | 'web'
  ): PlatformNotification;
  
  // Delivery tracking
  trackDelivery(notificationId: string): Promise<DeliveryStatus>;
  
  // User preference management
  updateNotificationPreferences(
    userId: string, 
    preferences: NotificationPreferences
  ): Promise<void>;
  
  // Batch notifications
  sendBatchNotifications(
    notifications: NotificationPayload[]
  ): Promise<BatchSendResult>;
}
```

#### Notification Types Integration
```typescript
// Unified Notification Types
interface NotificationTypes {
  // Energy System Alerts
  CRITICAL_ENERGY_ALERT: {
    priority: 'high';
    sound: 'emergency';
    vibration: 'pattern_urgent';
    ledColor: 'red';
    category: 'energy_emergency';
  };
  
  // Maintenance Notifications
  MAINTENANCE_REMINDER: {
    priority: 'normal';
    sound: 'default';
    vibration: 'pattern_normal';
    ledColor: 'blue';
    category: 'maintenance';
  };
  
  // System Updates
  SYSTEM_STATUS_UPDATE: {
    priority: 'low';
    sound: 'none';
    vibration: 'none';
    ledColor: 'green';
    category: 'system_info';
  };
  
  // Budget and Financial
  BUDGET_ALERT: {
    priority: 'normal';
    sound: 'default';
    vibration: 'pattern_normal';
    ledColor: 'yellow';
    category: 'financial';
  };
}
```

## 6. File and Media Integration

### 6.1 Photo and Document Management

#### Media Upload Integration
```typescript
// Media Management Service
interface MediaIntegration {
  // Photo upload from mobile
  uploadPhoto(
    photo: PhotoData, 
    context: UploadContext
  ): Promise<MediaUploadResult>;
  
  // Document management
  uploadDocument(
    document: DocumentData, 
    metadata: DocumentMetadata
  ): Promise<DocumentUploadResult>;
  
  // QR code processing
  processQRCode(
    qrData: string, 
    context: QRContext
  ): Promise<QRProcessingResult>;
  
  // Media synchronization
  syncMediaFiles(
    userId: string, 
    lastSync: Date
  ): Promise<MediaSyncResult>;
  
  // Thumbnail generation
  generateThumbnails(mediaId: string): Promise<ThumbnailSet>;
}
```

#### File Storage Strategy
```typescript
// File Storage Configuration
interface FileStorageIntegration {
  // Cloud storage configuration
  cloudStorage: {
    provider: 'AWS_S3' | 'Google_Cloud' | 'Azure_Blob';
    bucket: string;
    region: string;
    encryption: 'AES256' | 'KMS';
  };
  
  // Local cache strategy
  localCache: {
    maxSize: number; // MB
    retentionDays: number;
    compressionLevel: number;
  };
  
  // CDN configuration
  cdn: {
    enabled: boolean;
    baseUrl: string;
    cacheTTL: number;
  };
}
```

## 7. Offline Integration Strategy

### 7.1 Offline Data Management

#### Offline Sync Architecture
```typescript
// Offline Data Manager
interface OfflineDataIntegration {
  // Data caching strategy
  cacheEssentialData(userId: string): Promise<CacheResult>;
  
  // Offline queue management
  queueOfflineActions(actions: OfflineAction[]): Promise<void>;
  
  // Sync when online
  syncOfflineData(): Promise<OfflineSyncResult>;
  
  // Conflict resolution
  resolveDataConflicts(
    conflicts: DataConflict[]
  ): Promise<ConflictResolution[]>;
  
  // Cache cleanup
  cleanupExpiredCache(): Promise<CleanupResult>;
}
```

#### Offline Data Structure
```typescript
// Offline Data Schema
interface OfflineDataStructure {
  // User profile and permissions
  userProfile: UserProfile;
  userPermissions: Permission[];
  assignedBuildings: Building[];
  
  // Recent energy data (last 24h)
  recentEnergyData: EnergyDataPoint[];
  
  // Active alerts and tasks
  activeAlerts: Alert[];
  pendingTasks: MaintenanceTask[];
  
  // App configuration
  appSettings: AppSettings;
  dashboardLayout: DashboardConfig;
  
  // Offline actions queue
  pendingActions: OfflineAction[];
  
  // Cache metadata
  cacheTimestamps: Record<string, Date>;
  syncStatus: SyncStatus;
}
```

## 8. Performance Integration

### 8.1 Caching Strategy

#### Multi-Level Caching
```typescript
// Integrated Caching Service
interface CachingIntegration {
  // Level 1: In-Memory Cache (React Query)
  inMemoryCache: {
    queryCache: QueryCache;
    mutationCache: MutationCache;
    maxSize: 50; // MB
    gcTime: 300000; // 5 minutes
  };
  
  // Level 2: Device Storage Cache
  deviceCache: {
    secureStorage: SecureStorageCache;
    asyncStorage: AsyncStorageCache;
    maxSize: 100; // MB
    encryption: boolean;
  };
  
  // Level 3: CDN/Edge Cache
  edgeCache: {
    cloudflareCache: EdgeCacheConfig;
    ttl: 3600; // 1 hour
    regions: string[];
  };
  
  // Cache invalidation
  invalidateCache(pattern: string): Promise<void>;
  warmupCache(userId: string): Promise<void>;
}
```

### 8.2 API Optimization

#### Request Optimization
```typescript
// API Optimization Service
interface APIOptimization {
  // Request batching
  batchRequests(requests: APIRequest[]): Promise<BatchResponse>;
  
  // Data compression
  compressPayload(data: any): Promise<CompressedPayload>;
  
  // Smart polling
  optimizePollingInterval(
    endpoint: string, 
    activity: UserActivity
  ): number;
  
  // Prefetching strategy
  prefetchData(
    userId: string, 
    context: AppContext
  ): Promise<PrefetchResult>;
  
  // Request deduplication
  deduplicateRequests(requests: APIRequest[]): APIRequest[];
}
```

## 9. Security Integration

### 9.1 End-to-End Security

#### Security Architecture
```typescript
// Security Integration Service
interface SecurityIntegration {
  // Certificate pinning
  validateCertificate(certificate: Certificate): boolean;
  
  // Request signing
  signRequest(request: APIRequest, privateKey: string): SignedRequest;
  
  // Data encryption
  encryptSensitiveData(data: any, key: string): EncryptedData;
  decryptSensitiveData(encryptedData: EncryptedData, key: string): any;
  
  // Biometric authentication
  validateBiometric(biometricData: BiometricInput): Promise<ValidationResult>;
  
  // Security audit logging
  logSecurityEvent(event: SecurityEvent): Promise<void>;
  
  // Threat detection
  detectAnomalousActivity(userActivity: UserActivity): ThreatAssessment;
}
```

## 10. Monitoring and Analytics Integration

### 10.1 Unified Analytics

#### Analytics Integration
```typescript
// Analytics Service
interface AnalyticsIntegration {
  // Cross-platform user tracking
  trackUserAction(
    action: UserAction, 
    platform: Platform, 
    context: ActionContext
  ): Promise<void>;
  
  // Performance monitoring
  trackPerformanceMetrics(metrics: PerformanceMetrics): Promise<void>;
  
  // Error tracking
  trackError(
    error: Error, 
    context: ErrorContext, 
    platform: Platform
  ): Promise<void>;
  
  // Custom events
  trackCustomEvent(
    eventName: string, 
    properties: EventProperties
  ): Promise<void>;
  
  // User journey analysis
  trackUserJourney(
    journey: UserJourney, 
    platform: Platform
  ): Promise<void>;
}
```

## 11. Testing Integration

### 11.1 Cross-Platform Testing

#### Testing Strategy
```typescript
// Integration Testing Framework
interface IntegrationTesting {
  // API contract testing
  testAPIContracts(): Promise<ContractTestResult[]>;
  
  // Cross-platform data consistency
  testDataConsistency(
    platforms: Platform[]
  ): Promise<ConsistencyTestResult>;
  
  // Real-time synchronization testing
  testRealTimeSync(): Promise<SyncTestResult>;
  
  // Authentication flow testing
  testAuthenticationFlows(
    flows: AuthFlow[]
  ): Promise<AuthTestResult[]>;
  
  // Performance testing
  testCrossPlatformPerformance(): Promise<PerformanceTestResult>;
}
```

## 12. Deployment Integration

### 12.1 Unified Deployment Pipeline

#### CI/CD Integration
```yaml
# Unified CI/CD Pipeline
name: CityPulse Cross-Platform Deployment

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-integration:
    runs-on: ubuntu-latest
    steps:
      - name: Test API Contracts
        run: npm run test:contracts
      
      - name: Test Cross-Platform Data Sync
        run: npm run test:sync
      
      - name: Test Authentication Integration
        run: npm run test:auth-integration

  deploy-backend:
    needs: test-integration
    runs-on: ubuntu-latest
    steps:
      - name: Deploy API Updates
        run: ./scripts/deploy-api.sh
      
      - name: Update Database Schema
        run: ./scripts/update-schema.sh
      
      - name: Restart Services
        run: ./scripts/restart-services.sh

  deploy-web:
    needs: deploy-backend
    runs-on: ubuntu-latest
    steps:
      - name: Build Web Application
        run: npm run build:web
      
      - name: Deploy to Vercel
        run: vercel deploy --prod

  deploy-mobile:
    needs: deploy-backend
    runs-on: ubuntu-latest
    steps:
      - name: Build Mobile Application
        run: npm run build:mobile
      
      - name: Submit to App Stores
        run: |
          eas submit --platform ios --non-interactive
          eas submit --platform android --non-interactive
```

## Conclusion

This integration plan ensures seamless connectivity between the CityPulse mobile application and existing web platform. The unified architecture provides:

1. **Consistent User Experience**: Same data and functionality across all platforms
2. **Real-Time Synchronization**: Instant updates across web and mobile
3. **Robust Security**: End-to-end security with platform-specific optimizations
4. **Scalable Architecture**: Designed to handle growth and future features
5. **Reliable Performance**: Optimized for speed and reliability

The integration strategy balances technical excellence with practical implementation considerations, ensuring successful deployment and long-term maintainability of the CityPulse mobile ecosystem.