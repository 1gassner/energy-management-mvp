import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import winston from 'winston';

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

// Import WebSocket handlers
import { setupWebSocketServer } from './websocket/index.js';

// Load environment variables
dotenv.config();

// Initialize logger
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
    })
  ]
});

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  }
});

// ==========================================
// MIDDLEWARE SETUP
// ==========================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Frontend-Source']
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
if (process.env.RATE_LIMITING_ENABLED === 'true') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    }
  });
  
  app.use('/api/', limiter);
}

// ==========================================
// HEALTH CHECK & INFO ROUTES
// ==========================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      ai_models: process.env.AI_MODELS_ENABLED === 'true',
      citypulse: process.env.CITYPULSE_ENABLED === 'true',
      quantum_swarm: process.env.QUANTUM_SWARM_ENABLED === 'true',
      velocity_swarm: process.env.VELOCITY_SWARM_ENABLED === 'true',
      websocket: process.env.WEBSOCKET_ENABLED === 'true'
    }
  });
});

app.get('/api/v1/info', (req, res) => {
  res.json({
    name: 'FlowMind Universal Backend',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Universal Backend supporting FlowMind AI Chat, Quantum Swarm, Velocity Swarm, and CityPulse Energy Management',
    frontends: [
      {
        name: 'FlowMind AI Chat',
        enabled: process.env.AI_MODELS_ENABLED === 'true',
        endpoints: '/api/v1/ai/*'
      },
      {
        name: 'Quantum Swarm',
        enabled: process.env.QUANTUM_SWARM_ENABLED === 'true',
        endpoints: '/api/v1/swarm/*'
      },
      {
        name: 'Velocity Swarm',
        enabled: process.env.VELOCITY_SWARM_ENABLED === 'true',
        endpoints: '/api/v1/swarm/*'
      },
      {
        name: 'CityPulse Energy Management',
        enabled: process.env.CITYPULSE_ENABLED === 'true',
        endpoints: '/api/v1/citypulse/*'
      }
    ],
    documentation: '/api/v1/docs',
    websocket: process.env.WEBSOCKET_ENABLED === 'true' ? '/ws' : null
  });
});

// ==========================================
// API ROUTES
// ==========================================

// Authentication routes (universal for all frontends)
app.use('/api/v1/auth', authRoutes);

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
// WEBSOCKET SETUP
// ==========================================

if (process.env.WEBSOCKET_ENABLED === 'true') {
  setupWebSocketServer(io);
  logger.info('WebSocket server initialized');
}

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} was not found.`,
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

// Global error handler
app.use(errorHandler);

// ==========================================
// SERVER STARTUP
// ==========================================

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, () => {
  logger.info(`🚀 FlowMind Universal Backend started`);
  logger.info(`📡 Server running on http://${HOST}:${PORT}`);
  logger.info(`🏥 Health check available at http://${HOST}:${PORT}/health`);
  logger.info(`📊 API info available at http://${HOST}:${PORT}/api/v1/info`);
  
  // Log enabled features
  const enabledFeatures = [];
  if (process.env.AI_MODELS_ENABLED === 'true') enabledFeatures.push('FlowMind AI Chat');
  if (process.env.QUANTUM_SWARM_ENABLED === 'true') enabledFeatures.push('Quantum Swarm');
  if (process.env.VELOCITY_SWARM_ENABLED === 'true') enabledFeatures.push('Velocity Swarm');
  if (process.env.CITYPULSE_ENABLED === 'true') enabledFeatures.push('CityPulse Energy Management');
  if (process.env.WEBSOCKET_ENABLED === 'true') enabledFeatures.push('WebSocket Real-time');
  
  logger.info(`✨ Enabled features: ${enabledFeatures.join(', ')}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;