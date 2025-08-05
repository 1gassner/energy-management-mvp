import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import winston from 'winston';
import fs from 'fs';
import https from 'https';

// Import route modules
import authRoutes from './routes/v1/auth.js';
import aiRoutes from './routes/v1/ai.js';
import swarmRoutes from './routes/v1/swarm.js';
import citypulseRoutes from './routes/v1/citypulse/index.js';
import sharedRoutes from './routes/v1/shared.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';
import { authorize } from './middleware/authorize.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { 
  setupProductionMiddleware,
  authRateLimit,
  dynamicRateLimit,
  healthMonitoring
} from './middleware/production.js';

// Import WebSocket handlers
import { setupWebSocketServer } from './websocket/index.js';

// Load environment variables
dotenv.config({ path: '.env.production' });

// Initialize enhanced logger for production
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
});

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Initialize Express app
const app = express();

// ==========================================
// PRODUCTION SECURITY & PERFORMANCE SETUP
// ==========================================

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 
                 "https://cdn.jsdelivr.net", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:", "ws:"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      childSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"]
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Production CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://flowmind.yourdomain.com',
      'https://citypulse.yourdomain.com',
      'https://quantum.yourdomain.com',
      'https://velocity.yourdomain.com'
    ];
    
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`, {
        timestamp: new Date().toISOString(),
        ip: 'unknown'
      });
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Frontend-Source',
    'X-Request-ID',
    'X-API-Version'
  ],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Production compression with optimization
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Body parsing with limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging with enhanced details
app.use((req, res, next) => {
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.startTime = Date.now();
  
  logger.info('Request received', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    frontend: req.get('X-Frontend-Source'),
    timestamp: new Date().toISOString()
  });
  
  next();
});

// Production rate limiting with tiers
const productionRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Different limits based on endpoint
    if (req.path.startsWith('/api/v1/auth')) return 10; // Strict for auth
    if (req.path.startsWith('/api/v1/ai')) return 100; // AI endpoints
    if (req.path.startsWith('/api/v1/swarm')) return 50; // Swarm endpoints
    if (req.path.startsWith('/api/v1/citypulse')) return 200; // CityPulse endpoints
    return 1000; // Default
  },
  message: (req) => ({
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP',
    retryAfter: '15 minutes',
    endpoint: req.path,
    limit: req.rateLimit?.limit,
    remaining: req.rateLimit?.remaining,
    resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  }),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and monitoring
    return req.path === '/health' || 
           req.path === '/metrics' ||
           req.path.startsWith('/health/');
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.userId || req.ip;
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userId: req.user?.userId,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP',
      retryAfter: '15 minutes',
      endpoint: req.path,
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/api/', productionRateLimit);

// ==========================================
// HEALTH CHECK & MONITORING ENDPOINTS
// ==========================================

app.get('/health', async (req, res) => {
  try {
    const healthStatus = await healthMonitoring.getHealthStatus();
    res.json(healthStatus);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Kubernetes/Docker readiness probe
app.get('/health/ready', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Kubernetes/Docker liveness probe
app.get('/health/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Metrics endpoint for monitoring systems (Prometheus format)
app.get('/metrics', (req, res) => {
  const memory = process.memoryUsage();
  const uptime = process.uptime();
  
  const metrics = `
# HELP nodejs_memory_usage_bytes Memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} ${memory.rss}
nodejs_memory_usage_bytes{type="heapTotal"} ${memory.heapTotal}
nodejs_memory_usage_bytes{type="heapUsed"} ${memory.heapUsed}
nodejs_memory_usage_bytes{type="external"} ${memory.external}

# HELP nodejs_uptime_seconds Process uptime in seconds
# TYPE nodejs_uptime_seconds counter
nodejs_uptime_seconds ${uptime}

# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total ${app.locals.requestCount || 0}
  `.trim();
  
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

app.get('/api/v1/info', (req, res) => {
  res.json({
    name: 'FlowMind Universal Backend',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Production-ready Universal Backend supporting FlowMind AI Chat, Quantum Swarm, Velocity Swarm, and CityPulse Energy Management',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    frontends: [
      {
        name: 'FlowMind AI Chat',
        enabled: process.env.AI_MODELS_ENABLED === 'true',
        endpoints: '/api/v1/ai/*',
        rateLimit: '100 requests/15min'
      },
      {
        name: 'Quantum Swarm',
        enabled: process.env.QUANTUM_SWARM_ENABLED === 'true',
        endpoints: '/api/v1/swarm/*',
        rateLimit: '50 requests/15min'
      },
      {
        name: 'Velocity Swarm',
        enabled: process.env.VELOCITY_SWARM_ENABLED === 'true',
        endpoints: '/api/v1/swarm/*',
        rateLimit: '50 requests/15min'
      },
      {
        name: 'CityPulse Energy Management',
        enabled: process.env.CITYPULSE_ENABLED === 'true',
        endpoints: '/api/v1/citypulse/*',
        rateLimit: '200 requests/15min'
      }
    ],
    security: {
      cors: 'enabled',
      helmet: 'enabled',
      rateLimiting: 'enabled',
      compression: 'enabled',
      https: process.env.NODE_ENV === 'production'
    },
    websocket: process.env.WEBSOCKET_ENABLED === 'true' ? '/ws' : null
  });
});

// ==========================================
// API ROUTES WITH PRODUCTION OPTIMIZATIONS
// ==========================================

// Authentication routes with strict rate limiting
app.use('/api/v1/auth', authRateLimit, authRoutes);

// FlowMind AI Chat routes
if (process.env.AI_MODELS_ENABLED === 'true') {
  app.use('/api/v1/ai', authenticateToken, authorize(['flowmind']), aiRoutes);
}

// Quantum & Velocity Swarm routes
if (process.env.QUANTUM_SWARM_ENABLED === 'true' || process.env.VELOCITY_SWARM_ENABLED === 'true') {
  app.use('/api/v1/swarm', authenticateToken, authorize(['quantum', 'velocity']), swarmRoutes);
}

// CityPulse Energy Management routes
if (process.env.CITYPULSE_ENABLED === 'true') {
  app.use('/api/v1/citypulse', authenticateToken, authorize(['citypulse']), citypulseRoutes);
}

// Cross-frontend shared features
app.use('/api/v1/shared', authenticateToken, sharedRoutes);

// ==========================================
// WEBSOCKET SETUP WITH PRODUCTION CONFIG
// ==========================================

let server;

// SSL Configuration for HTTPS in production
if (process.env.NODE_ENV === 'production' && process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  try {
    const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    
    server = https.createServer(credentials, app);
    logger.info('HTTPS server created with SSL certificates');
  } catch (error) {
    logger.error('Failed to load SSL certificates, falling back to HTTP:', error);
    server = createServer(app);
  }
} else {
  server = createServer(app);
}

// Initialize Socket.IO with production configuration
const io = new SocketIOServer(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowEIO3: true,
  compression: true,
  maxHttpBufferSize: 1e6, // 1MB
  allowRequest: (req, callback) => {
    // Additional WebSocket security checks
    const origin = req.headers.origin;
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('WebSocket connection blocked', { origin });
      callback('Origin not allowed', false);
    }
  }
});

if (process.env.WEBSOCKET_ENABLED === 'true') {
  setupWebSocketServer(io);
  logger.info('Production WebSocket server initialized');
}

// ==========================================
// ERROR HANDLING & 404
// ==========================================

// 404 handler with enhanced logging
app.use('*', (req, res) => {
  logger.warn('404 Not Found', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} was not found.`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    availableEndpoints: {
      health: 'GET /health',
      info: 'GET /api/v1/info',
      auth: 'POST /api/v1/auth/login',
      ai: 'POST /api/v1/ai/chat (if enabled)',
      swarm: 'POST /api/v1/swarm/orchestrate (if enabled)',
      citypulse: 'GET /api/v1/citypulse/buildings (if enabled)',
      shared: 'GET /api/v1/shared/activity'
    }
  });
});

// Enhanced global error handler
app.use((error, req, res, next) => {
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.error('Unhandled error', {
    errorId,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId,
      requestId: req.requestId
    },
    timestamp: new Date().toISOString()
  });
  
  if (process.env.NODE_ENV === 'production') {
    res.status(error.status || 500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      errorId,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  } else {
    res.status(error.status || 500).json({
      error: error.message,
      stack: error.stack,
      errorId,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  }
});

// ==========================================
// SERVER STARTUP WITH PRODUCTION OPTIMIZATIONS
// ==========================================

const PORT = process.env.PORT || 8001;
const HOST = process.env.HOST || '0.0.0.0';

// Request counter middleware
app.use((req, res, next) => {
  app.locals.requestCount = (app.locals.requestCount || 0) + 1;
  next();
});

server.listen(PORT, HOST, () => {
  logger.info('🚀 FlowMind Universal Backend (Production) started');
  logger.info(`📡 Server running on ${process.env.NODE_ENV === 'production' && process.env.SSL_KEY_PATH ? 'https' : 'http'}://${HOST}:${PORT}`);
  logger.info(`🏥 Health check: http://${HOST}:${PORT}/health`);
  logger.info(`📊 API info: http://${HOST}:${PORT}/api/v1/info`);
  logger.info(`📈 Metrics: http://${HOST}:${PORT}/metrics`);
  
  // Log enabled features
  const enabledFeatures = [];
  if (process.env.AI_MODELS_ENABLED === 'true') enabledFeatures.push('FlowMind AI Chat');
  if (process.env.QUANTUM_SWARM_ENABLED === 'true') enabledFeatures.push('Quantum Swarm');
  if (process.env.VELOCITY_SWARM_ENABLED === 'true') enabledFeatures.push('Velocity Swarm');
  if (process.env.CITYPULSE_ENABLED === 'true') enabledFeatures.push('CityPulse Energy Management');
  if (process.env.WEBSOCKET_ENABLED === 'true') enabledFeatures.push('WebSocket Real-time');
  
  logger.info(`✨ Enabled features: ${enabledFeatures.join(', ')}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔒 Security: CORS, Helmet, Rate Limiting enabled`);
  logger.info(`🗜️ Compression enabled`);
  logger.info(`📝 Logging to files: logs/error.log, logs/combined.log`);
});

// ==========================================
// GRACEFUL SHUTDOWN HANDLING
// ==========================================

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server close:', err);
      process.exit(1);
    }
    
    logger.info('HTTP server closed');
    
    // Close WebSocket connections
    if (io) {
      io.close(() => {
        logger.info('WebSocket server closed');
      });
    }
    
    // Close database connections would go here
    // Note: Supabase client handles connections automatically
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason,
    promise,
    timestamp: new Date().toISOString()
  });
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;