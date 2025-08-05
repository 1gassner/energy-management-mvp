import winston from 'winston';
import { dbHelpers } from '../config/supabase.js';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'requests.log' })
  ]
});

/**
 * Request logging middleware
 * Logs all incoming requests with relevant metadata
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const frontendSource = req.headers['x-frontend-source'];
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override res.end to capture response data
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Log request details
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: req.query,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      frontend: frontendSource,
      contentLength: res.get('content-length'),
      referer: req.get('Referer')
    };

    // Add user info if authenticated
    if (req.user) {
      logData.userId = req.user.userId;
      logData.userEmail = req.user.email;
      logData.userRole = req.user.role;
      logData.organizationId = req.user.organizationId;
    }

    // Determine log level based on status code
    let logLevel = 'info';
    if (res.statusCode >= 400 && res.statusCode < 500) {
      logLevel = 'warn';
    } else if (res.statusCode >= 500) {
      logLevel = 'error';
    }

    // Log the request
    logger.log(logLevel, 'HTTP Request', logData);

    // Log to database for important events (async, don't block response)
    if (shouldLogToDatabase(req, res)) {
      setImmediate(async () => {
        try {
          await dbHelpers.logSystem(
            logLevel,
            `${req.method} ${req.originalUrl} - ${res.statusCode}`,
            {
              ...logData,
              headers: {
                authorization: req.headers.authorization ? '[REDACTED]' : undefined,
                'content-type': req.headers['content-type'],
                'x-frontend-source': req.headers['x-frontend-source']
              }
            },
            req.user?.userId,
            frontendSource
          );
        } catch (error) {
          logger.error('Failed to log request to database:', error);
        }
      });
    }

    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Determine if request should be logged to database
 */
function shouldLogToDatabase(req, res) {
  // Always log errors
  if (res.statusCode >= 400) {
    return true;
  }

  // Log important endpoints
  const importantPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/logout',
    '/api/v1/ai/chat',
    '/api/v1/swarm/orchestrate',
    '/api/v1/citypulse/alerts'
  ];

  if (importantPaths.some(path => req.path.startsWith(path))) {
    return true;
  }

  // Log slow requests (>5 seconds)
  const responseTime = Date.now() - req.startTime;
  if (responseTime > 5000) {
    return true;
  }

  return false;
}

/**
 * API usage tracking middleware
 * Tracks API usage per user and frontend
 */
export const apiUsageTracker = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const frontendSource = req.headers['x-frontend-source'];
  const endpoint = req.path;

  // Track usage for specific endpoints
  const trackedEndpoints = {
    '/api/v1/ai/chat': 'ai_requests',
    '/api/v1/swarm/orchestrate': 'swarm_requests',
    '/api/v1/citypulse/buildings': 'citypulse_requests'
  };

  const usageType = trackedEndpoints[endpoint];
  
  if (usageType) {
    try {
      // Log usage activity
      await dbHelpers.logActivity(
        req.user.userId,
        frontendSource,
        usageType,
        {
          endpoint,
          method: req.method,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      logger.error('Failed to track API usage:', error);
    }
  }

  next();
};

/**
 * Performance monitoring middleware
 * Tracks response times and identifies slow endpoints
 */
export const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log slow requests
    if (responseTime > 1000) { // Slower than 1 second
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        responseTime: `${responseTime.toFixed(2)}ms`,
        statusCode: res.statusCode,
        frontend: req.headers['x-frontend-source'],
        userId: req.user?.userId
      });
    }

    // Track response times for different frontends
    if (req.headers['x-frontend-source']) {
      logger.info('Frontend performance', {
        frontend: req.headers['x-frontend-source'],
        endpoint: req.path,
        responseTime: `${responseTime.toFixed(2)}ms`,
        statusCode: res.statusCode
      });
    }
  });

  next();
};

/**
 * Security event logger
 * Logs security-related events
 */
export const securityLogger = (eventType, details, req = null) => {
  const logData = {
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  };

  if (req) {
    logData.ip = req.ip;
    logData.userAgent = req.get('User-Agent');
    logData.path = req.originalUrl;
    logData.userId = req.user?.userId;
  }

  logger.warn('Security event', logData);

  // Log to database for security events
  setImmediate(async () => {
    try {
      await dbHelpers.logSystem(
        'warn',
        `Security event: ${eventType}`,
        logData,
        req?.user?.userId,
        req?.headers['x-frontend-source']
      );
    } catch (error) {
      logger.error('Failed to log security event to database:', error);
    }
  });
};