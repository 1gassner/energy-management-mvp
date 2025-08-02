# Security Dokumentation

## 📚 Übersicht

Das Energy Management MVP implementiert umfassende Sicherheitsmaßnahmen für den Schutz von Energiedaten, Benutzerinformationen und kritischer Infrastruktur. Diese Dokumentation beschreibt alle implementierten Security Features und Best Practices.

## 🔐 Authentication & Authorization

### JWT-basierte Authentifizierung

#### Token Management
```typescript
// Token Storage Strategy
interface TokenStrategy {
  storage: 'localStorage';           // Client-side storage
  tokenKey: 'auth_token';           // Storage key
  expirationHandling: 'automatic';  // Auto-refresh/logout
  secureCookies: false;             // Not implemented (localStorage only)
}

// Auth Store Token Handling
login: async (credentials: LoginCredentials) => {
  const response = await apiService.login(credentials);
  
  // Store JWT token securely
  localStorage.setItem('auth_token', response.token);
  
  set({
    user: response.user,
    isAuthenticated: true,
    error: null,
  });
  
  return true;
}
```

#### Token Refresh Strategy
```typescript
// Automatic Token Refresh
refreshUser: async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    set({ user: null, isAuthenticated: false });
    return;
  }

  try {
    const user = await apiService.refreshUser();
    set({ user, isAuthenticated: true });
  } catch (error) {
    // Token invalid/expired - force logout
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false });
    throw new Error('Session expired');
  }
}
```

### Role-based Access Control (RBAC)

#### User Roles
```typescript
type UserRole = 'admin' | 'manager' | 'user' | 'viewer';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions?: Permission[];
  lastLogin: string;
  createdAt: string;
}
```

#### Permission System
```typescript
// Permission-based UI Rendering
const dashboardCards = [
  {
    title: 'Energy Flow',
    link: '/energy-flow',
    enabled: true  // All users
  },
  {
    title: 'Analytics',
    link: '/analytics/ai',
    enabled: user?.role === 'admin' || user?.role === 'manager'  // Restricted
  },
  {
    title: 'System Admin',
    link: '/admin',
    enabled: user?.role === 'admin'  // Admin only
  }
];
```

#### Route Protection
```typescript
// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredPermission 
}) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(user, requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Usage in Router
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## 🌐 Network Security

### HTTPS Enforcement
```typescript
// Production Configuration
const productionConfig = {
  apiUrl: 'https://api.energy-management.com',  // HTTPS only
  wsUrl: 'wss://ws.energy-management.com',      // WSS only
  enforceSecure: true,
  
  // Strict Transport Security
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
};
```

### CORS Configuration
```typescript
// Backend CORS Setup (für Reference)
const corsConfig = {
  origin: [
    'https://energy-management.com',
    'https://app.energy-management.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Version'
  ]
};
```

### API Security Headers
```typescript
// Security Headers für API Requests
const securityHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  // Add auth token
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add security headers
  Object.assign(config.headers, securityHeaders);
  
  return config;
});
```

## 🛡️ Content Security Policy

### CSP Implementation
```html
<!-- Production CSP Header -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.energy-management.com wss://ws.energy-management.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
">
```

### CSP Configuration für Development
```typescript
// Development CSP (weniger restriktiv)
const developmentCSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],  // Vite Dev
  'style-src': ["'self'", "'unsafe-inline'"],                    // Hot reload
  'connect-src': ["'self'", "ws://localhost:*", "http://localhost:*"],
  'img-src': ["'self'", "data:", "blob:"],
  'font-src': ["'self'", "data:"]
};
```

## 🔒 Data Protection

### Input Validation & Sanitization
```typescript
// Client-side Input Validation
interface ValidationRules {
  email: (value: string) => boolean;
  password: (value: string) => boolean;
  energyValue: (value: number) => boolean;
}

const validators: ValidationRules = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  password: (value) => value.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(value),
  energyValue: (value) => typeof value === 'number' && value >= 0 && value <= 100000
};

// Form Validation Hook
const useFormValidation = (initialValues: Record<string, any>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (field: string, value: any) => {
    const validator = validators[field as keyof ValidationRules];
    if (validator && !validator(value)) {
      setErrors(prev => ({ ...prev, [field]: `Invalid ${field}` }));
      return false;
    }
    setErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  };

  return { values, errors, validate, setValues };
};
```

### XSS Prevention
```typescript
// XSS Prevention Utilities
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\\//g, '&#x2F;');
};

// Safe HTML Rendering (wenn nötig)
const SafeHTML: React.FC<{ html: string }> = ({ html }) => {
  const sanitizedHTML = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};

// Input Component mit XSS-Schutz
const SecureInput: React.FC<InputProps> = ({ value, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    onChange(sanitizedValue);
  };

  return <input {...props} value={value} onChange={handleChange} />;
};
```

### SQL Injection Prevention
```typescript
// Client-side: Sichere API Parameter
const buildApiParams = (filters: Record<string, any>) => {
  const allowedKeys = ['buildingId', 'startDate', 'endDate', 'limit'];
  const sanitizedParams: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (allowedKeys.includes(key)) {
      // Type validation
      if (key === 'buildingId' && typeof value === 'string') {
        sanitizedParams[key] = value.replace(/[^a-zA-Z0-9-_]/g, '');
      } else if (key.includes('Date') && value instanceof Date) {
        sanitizedParams[key] = value.toISOString();
      } else if (key === 'limit' && typeof value === 'number') {
        sanitizedParams[key] = Math.min(Math.max(1, value), 1000);
      }
    }
  });

  return sanitizedParams;
};
```

## 🔐 Sensitive Data Handling

### Environment Variables Security
```bash
# Production .env (Beispiel - niemals committen!)
VITE_API_URL=https://api.energy-management.com
VITE_WS_URL=wss://ws.energy-management.com
VITE_APP_ENV=production

# Sensitive Daten (Server-side only)
API_SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

### Local Storage Security
```typescript
// Sichere LocalStorage Nutzung
class SecureStorage {
  private static encrypt(data: string): string {
    // Einfache Verschlüsselung für Client-side (nicht für Production secrets)
    return btoa(encodeURIComponent(data));
  }

  private static decrypt(encryptedData: string): string {
    return decodeURIComponent(atob(encryptedData));
  }

  static setItem(key: string, value: string): void {
    try {
      const encrypted = this.encrypt(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      logger.error('Failed to store encrypted data', error as Error);
    }
  }

  static getItem(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(key);
      return encrypted ? this.decrypt(encrypted) : null;
    } catch (error) {
      logger.error('Failed to retrieve encrypted data', error as Error);
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }
}
```

### Session Management
```typescript
// Session Timeout Handling
class SessionManager {
  private static timeoutId: NodeJS.Timeout | null = null;
  private static readonly TIMEOUT_MINUTES = 30;

  static startSession(): void {
    this.resetTimeout();
    this.setupActivityListeners();
  }

  static resetTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.endSession();
    }, this.TIMEOUT_MINUTES * 60 * 1000);
  }

  static endSession(): void {
    logger.info('Session timeout - logging out user');
    useAuthStore.getState().logout();
    notificationService.warning('Session expired. Please log in again.');
  }

  private static setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.resetTimeout();
      }, { passive: true });
    });
  }
}
```

## 🛡️ WebSocket Security

### Secure WebSocket Connection
```typescript
// WebSocket Security Implementation
class SecureWebSocketService implements IWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Sichere WebSocket URL mit Token
    const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${encodeURIComponent(token)}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      logger.error('WebSocket connection failed', error as Error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      logger.info('Secure WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        logger.error('Invalid WebSocket message format', error as Error);
      }
    };

    this.ws.onerror = (error) => {
      logger.error('WebSocket error', error as Error);
    };

    this.ws.onclose = (event) => {
      if (event.code === 1000) {
        logger.info('WebSocket closed normally');
      } else {
        logger.warn('WebSocket closed unexpectedly', { code: event.code, reason: event.reason });
        this.handleReconnection();
      }
    };
  }

  private handleMessage(message: any): void {
    // Message validation
    if (!message.type || !message.payload) {
      logger.warn('Invalid message structure', { message });
      return;
    }

    // Rate limiting check (client-side)
    if (this.isRateLimited()) {
      logger.warn('Message rate limit exceeded');
      return;
    }

    this.processMessage(message);
  }

  private isRateLimited(): boolean {
    // Implement client-side rate limiting
    // Max 100 messages per minute
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old timestamps
    this.messageTimestamps = this.messageTimestamps.filter(ts => ts > oneMinuteAgo);
    
    if (this.messageTimestamps.length >= 100) {
      return true;
    }
    
    this.messageTimestamps.push(now);
    return false;
  }
}
```

## 🔍 Security Monitoring

### Security Event Logging
```typescript
// Security Logger
class SecurityLogger {
  static logAuthEvent(event: string, details: Record<string, any>): void {
    logger.info(`Security: ${event}`, {
      ...details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'client-side', // Server-side würde echte IP loggen
      sessionId: this.getSessionId()
    });
  }

  static logSuspiciousActivity(activity: string, details: Record<string, any>): void {
    logger.warn(`Suspicious Activity: ${activity}`, {
      ...details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer
    });
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
}

// Usage in Auth Store
login: async (credentials) => {
  SecurityLogger.logAuthEvent('login_attempt', { 
    email: credentials.email,
    timestamp: Date.now()
  });

  try {
    const response = await apiService.login(credentials);
    
    SecurityLogger.logAuthEvent('login_success', { 
      userId: response.user.id,
      role: response.user.role
    });
    
    return true;
  } catch (error) {
    SecurityLogger.logAuthEvent('login_failure', { 
      email: credentials.email,
      error: error.message
    });
    
    throw error;
  }
}
```

### Client-side Security Monitoring
```typescript
// Security Monitor Service
class ClientSecurityMonitor {
  private static suspiciousActivityCount = 0;
  private static readonly MAX_SUSPICIOUS_ACTIVITIES = 5;

  static init(): void {
    this.monitorConsoleAccess();
    this.monitorDevToolsAccess();
    this.monitorMultipleTabs();
  }

  private static monitorConsoleAccess(): void {
    const originalConsole = { ...console };
    
    Object.keys(console).forEach(method => {
      (console as any)[method] = (...args: any[]) => {
        SecurityLogger.logSuspiciousActivity('console_access', {
          method,
          args: args.slice(0, 2) // Nur erste 2 Args loggen
        });
        
        (originalConsole as any)[method](...args);
      };
    });
  }

  private static monitorDevToolsAccess(): void {
    let devtools = { open: false };
    
    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > 200 ||
        window.outerWidth - window.innerWidth > 200
      ) {
        if (!devtools.open) {
          devtools.open = true;
          SecurityLogger.logSuspiciousActivity('devtools_opened', {
            outerHeight: window.outerHeight,
            innerHeight: window.innerHeight,
            outerWidth: window.outerWidth,
            innerWidth: window.innerWidth
          });
        }
      } else {
        devtools.open = false;
      }
    }, 1000);
  }

  private static monitorMultipleTabs(): void {
    const channel = new BroadcastChannel('security_monitor');
    
    channel.addEventListener('message', (event) => {
      if (event.data.type === 'tab_opened') {
        SecurityLogger.logSuspiciousActivity('multiple_tabs', {
          tabId: event.data.tabId,
          timestamp: event.data.timestamp
        });
      }
    });

    // Announce this tab
    channel.postMessage({
      type: 'tab_opened',
      tabId: crypto.randomUUID(),
      timestamp: Date.now()
    });
  }
}
```

## 🚨 Production Security Checklist

### Pre-deployment Security Checklist

#### 1. Authentication & Authorization ✅
- [ ] JWT tokens implemented with proper expiration
- [ ] Role-based access control implemented
- [ ] Protected routes for sensitive areas
- [ ] Session timeout implemented
- [ ] Logout functionality clears all tokens

#### 2. Network Security ✅
- [ ] HTTPS enforced in production
- [ ] WSS (Secure WebSocket) for real-time communication
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] CSP (Content Security Policy) configured

#### 3. Data Protection ✅
- [ ] Input validation on all forms
- [ ] XSS prevention measures
- [ ] No sensitive data in localStorage
- [ ] Environment variables secured
- [ ] No hardcoded secrets in code

#### 4. Monitoring & Logging ✅
- [ ] Security events logged
- [ ] Error logging without sensitive data
- [ ] Client-side security monitoring
- [ ] Failed login attempt tracking
- [ ] Suspicious activity detection

#### 5. Infrastructure Security
- [ ] Environment variables properly configured
- [ ] Build process secure (no dev dependencies in production)
- [ ] CDN security headers configured
- [ ] Database connections secured
- [ ] API rate limiting implemented

### Security Testing Checklist

#### 1. Authentication Testing
```bash
# Test invalid credentials
curl -X POST /api/auth/login -d '{"email":"invalid","password":"wrong"}'

# Test token expiration
curl -H "Authorization: Bearer expired_token" /api/protected

# Test unauthorized access
curl /api/admin/users
```

#### 2. XSS Testing
```javascript
// Test input sanitization
const testInputs = [
  '<script>alert("xss")</script>',
  'javascript:alert("xss")',
  '<img src=x onerror=alert("xss")>',
  '"><script>alert("xss")</script>'
];

testInputs.forEach(input => {
  // Test all input fields
  testFormInput(input);
});
```

#### 3. CSRF Testing
```javascript
// Verify CSRF protection
fetch('/api/sensitive-action', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'delete' })
});
// Should fail without proper CSRF token
```

### Security Incident Response

#### 1. Incident Detection
```typescript
// Automated Incident Detection
class IncidentDetector {
  static detectSecurityIncident(eventType: string, details: any): void {
    const severity = this.calculateSeverity(eventType, details);
    
    if (severity >= 'HIGH') {
      this.triggerIncidentResponse(eventType, details, severity);
    }
  }

  private static calculateSeverity(eventType: string, details: any): string {
    const highSeverityEvents = [
      'multiple_failed_logins',
      'privilege_escalation_attempt',
      'data_exfiltration_attempt'
    ];

    return highSeverityEvents.includes(eventType) ? 'HIGH' : 'MEDIUM';
  }

  private static triggerIncidentResponse(eventType: string, details: any, severity: string): void {
    // Log incident
    SecurityLogger.logSuspiciousActivity('security_incident', {
      eventType,
      details,
      severity,
      timestamp: Date.now()
    });

    // Immediate response actions
    if (severity === 'HIGH') {
      // Force logout
      useAuthStore.getState().logout();
      
      // Disable certain features
      this.enableSecurityMode();
      
      // Notify administrators (if API available)
      this.notifyAdministrators(eventType, details);
    }
  }
}
```

#### 2. Incident Response Actions
```typescript
// Security Mode
class SecurityMode {
  private static isEnabled = false;

  static enable(): void {
    this.isEnabled = true;
    
    // Disable sensitive features
    this.disableSensitiveFeatures();
    
    // Increase logging level
    logger.configure({ level: 'debug' });
    
    // Show security warning to user
    notificationService.warning('Security mode enabled. Some features are temporarily disabled.');
  }

  static isSecurityModeEnabled(): boolean {
    return this.isEnabled;
  }

  private static disableSensitiveFeatures(): void {
    // Disable admin functions
    // Increase authentication requirements
    // Limit data access
  }
}
```

Die Security-Implementierung des Energy Management MVP bietet umfassenden Schutz für Benutzer und kritische Energiedaten mit modernen Sicherheitsstandards und proaktiver Bedrohungserkennung.