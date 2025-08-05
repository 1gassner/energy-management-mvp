/**
 * Production CORS Configuration
 * Optimized for multiple frontend applications with security best practices
 */

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Production domain configurations
const PRODUCTION_DOMAINS = {
  flowmind: [
    'https://flowmind.yourdomain.com',
    'https://ai.yourdomain.com',
    'https://chat.yourdomain.com'
  ],
  citypulse: [
    'https://citypulse.yourdomain.com',
    'https://energy.yourdomain.com',
    'https://dashboard.yourdomain.com'
  ],
  quantum: [
    'https://quantum.yourdomain.com',
    'https://swarm.yourdomain.com'
  ],
  velocity: [
    'https://velocity.yourdomain.com',
    'https://fast.yourdomain.com'
  ]
};

// Staging domain configurations
const STAGING_DOMAINS = {
  flowmind: [
    'https://flowmind-staging.yourdomain.com',
    'https://ai-staging.yourdomain.com'
  ],
  citypulse: [
    'https://citypulse-staging.yourdomain.com',
    'https://energy-staging.yourdomain.com'
  ],
  quantum: [
    'https://quantum-staging.yourdomain.com'
  ],
  velocity: [
    'https://velocity-staging.yourdomain.com'
  ]
};

// Development domain configurations
const DEVELOPMENT_DOMAINS = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:8080'
];

// Mobile app origins (for React Native, Ionic, etc.)
const MOBILE_ORIGINS = [
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'file://'
];

/**
 * Get allowed origins based on environment
 */
export const getAllowedOrigins = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  let allowedOrigins = [];
  
  if (environment === 'production') {
    // Production: Only allow production domains
    allowedOrigins = [
      ...Object.values(PRODUCTION_DOMAINS).flat(),
      ...MOBILE_ORIGINS
    ];
  } else if (environment === 'staging') {
    // Staging: Allow staging and development domains
    allowedOrigins = [
      ...Object.values(STAGING_DOMAINS).flat(),
      ...DEVELOPMENT_DOMAINS,
      ...MOBILE_ORIGINS
    ];
  } else {
    // Development: Allow all domains
    allowedOrigins = [
      ...Object.values(PRODUCTION_DOMAINS).flat(),
      ...Object.values(STAGING_DOMAINS).flat(),
      ...DEVELOPMENT_DOMAINS,
      ...MOBILE_ORIGINS
    ];
  }
  
  // Add custom origins from environment variables
  const customOrigins = process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) || [];
  allowedOrigins = [...allowedOrigins, ...customOrigins];
  
  // Remove duplicates
  return [...new Set(allowedOrigins)];
};

/**
 * CORS configuration factory
 */
export const createCorsConfig = (options = {}) => {
  const allowedOrigins = getAllowedOrigins();
  
  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log blocked origin for security monitoring
        logger.warn('CORS blocked origin', {
          origin,
          allowedOrigins: allowedOrigins.length,
          timestamp: new Date().toISOString()
        });
        
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    
    credentials: true,
    
    methods: [
      'GET', 
      'POST', 
      'PUT', 
      'PATCH', 
      'DELETE', 
      'OPTIONS', 
      'HEAD'
    ],
    
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Frontend-Source',
      'X-Request-ID',
      'X-API-Version',
      'X-User-Agent',
      'X-Forwarded-For',
      'X-Real-IP',
      'Cache-Control',
      'Pragma'
    ],
    
    exposedHeaders: [
      'X-Request-ID',
      'X-Response-Time',
      'X-Rate-Limit-Limit',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset',
      'X-Total-Count',
      'X-Page-Count'
    ],
    
    maxAge: options.maxAge || 86400, // 24 hours
    
    optionsSuccessStatus: 200, // For legacy browser support
    
    preflightContinue: false
  };
};

/**
 * WebSocket CORS configuration
 */
export const createWebSocketCorsConfig = () => {
  const allowedOrigins = getAllowedOrigins();
  
  return {
    origin: allowedOrigins,
    credentials: true
  };
};

/**
 * Frontend-specific CORS configurations
 */
export const getFrontendCorsConfig = (frontend) => {
  const environment = process.env.NODE_ENV || 'development';
  
  let specificOrigins = [];
  
  if (environment === 'production') {
    specificOrigins = PRODUCTION_DOMAINS[frontend] || [];
  } else if (environment === 'staging') {
    specificOrigins = [
      ...(STAGING_DOMAINS[frontend] || []),
      ...DEVELOPMENT_DOMAINS
    ];
  } else {
    specificOrigins = [
      ...(PRODUCTION_DOMAINS[frontend] || []),
      ...(STAGING_DOMAINS[frontend] || []),
      ...DEVELOPMENT_DOMAINS
    ];
  }
  
  return createCorsConfig({
    origin: specificOrigins
  });
};

/**
 * Dynamic CORS middleware based on frontend source
 */
export const dynamicCorsMiddleware = (req, res, next) => {
  const frontendSource = req.headers['x-frontend-source'];
  
  if (frontendSource && PRODUCTION_DOMAINS[frontendSource]) {
    const corsConfig = getFrontendCorsConfig(frontendSource);
    return cors(corsConfig)(req, res, next);
  }
  
  // Default CORS configuration
  const defaultCorsConfig = createCorsConfig();
  return cors(defaultCorsConfig)(req, res, next);
};

/**
 * CORS preflight handler for complex requests
 */
export const handleCorsPrelight = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    const allowedOrigins = getAllowedOrigins();
    
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 
        'Content-Type,Authorization,X-Frontend-Source,X-Request-ID,X-API-Version');
      res.header('Access-Control-Max-Age', '86400');
      
      return res.status(200).end();
    }
  }
  next();
};

/**
 * Security headers for enhanced CORS protection
 */
export const corsSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.header('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.header('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature policy
  res.header('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()');
  
  next();
};

/**
 * CORS monitoring and analytics
 */
export const corsAnalytics = {
  blockedOrigins: new Map(),
  allowedRequests: 0,
  blockedRequests: 0,
  
  recordBlocked(origin) {
    this.blockedRequests++;
    const count = this.blockedOrigins.get(origin) || 0;
    this.blockedOrigins.set(origin, count + 1);
    
    logger.warn('CORS request blocked', {
      origin,
      totalBlocked: this.blockedRequests,
      originBlockCount: count + 1,
      timestamp: new Date().toISOString()
    });
  },
  
  recordAllowed() {
    this.allowedRequests++;
  },
  
  getStats() {
    return {
      allowedRequests: this.allowedRequests,
      blockedRequests: this.blockedRequests,
      topBlockedOrigins: Array.from(this.blockedOrigins.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      timestamp: new Date().toISOString()
    };
  },
  
  reset() {
    this.blockedOrigins.clear();
    this.allowedRequests = 0;
    this.blockedRequests = 0;
  }
};

/**
 * CORS analytics endpoint
 */
export const corsStatsEndpoint = (req, res) => {
  res.json({
    corsAnalytics: corsAnalytics.getStats(),
    allowedOrigins: getAllowedOrigins(),
    environment: process.env.NODE_ENV
  });
};

export default {
  getAllowedOrigins,
  createCorsConfig,
  createWebSocketCorsConfig,
  getFrontendCorsConfig,
  dynamicCorsMiddleware,
  handleCorsPrelight,
  corsSecurityHeaders,
  corsAnalytics,
  corsStatsEndpoint
};