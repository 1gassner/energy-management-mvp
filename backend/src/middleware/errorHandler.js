import winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});

/**
 * Global error handling middleware for FlowMind Universal Backend
 */
export const errorHandler = (err, req, res, next) => {
  // Default error
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  };

  // Log error details
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId,
    frontend: req.headers['x-frontend-source'],
    timestamp: new Date().toISOString()
  });

  // Supabase errors
  if (err.code && err.code.startsWith('PGRST')) {
    error.statusCode = 400;
    error.message = 'Database query error';
    error.code = 'DATABASE_ERROR';
    
    // Handle specific Supabase errors
    if (err.code === 'PGRST116') {
      error.statusCode = 404;
      error.message = 'Resource not found';
      error.code = 'NOT_FOUND';
    } else if (err.code === 'PGRST301') {
      error.statusCode = 400;
      error.message = 'Invalid query parameters';
      error.code = 'INVALID_QUERY';
    }
  }

  // PostgreSQL errors
  if (err.code && err.code.startsWith('23')) {
    error.statusCode = 400;
    error.code = 'DATABASE_CONSTRAINT_ERROR';
    
    if (err.code === '23505') {
      error.message = 'Resource already exists';
      error.code = 'DUPLICATE_ENTRY';
    } else if (err.code === '23503') {
      error.message = 'Referenced resource does not exist';
      error.code = 'FOREIGN_KEY_VIOLATION';
    } else if (err.code === '23502') {
      error.message = 'Required field is missing';
      error.code = 'NOT_NULL_VIOLATION';
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token';
    error.code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token expired';
    error.code = 'TOKEN_EXPIRED';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    error.message = 'Validation failed';
    error.code = 'VALIDATION_ERROR';
    error.details = err.details;
  }

  // Rate limiting errors
  if (err.type === 'too many requests') {
    error.statusCode = 429;
    error.message = 'Too many requests, please try again later';
    error.code = 'RATE_LIMIT_EXCEEDED';
  }

  // AI Provider errors
  if (err.type === 'openai_error') {
    error.statusCode = 502;
    error.message = 'AI service temporarily unavailable';
    error.code = 'AI_SERVICE_ERROR';
  }

  if (err.type === 'anthropic_error') {
    error.statusCode = 502;
    error.message = 'AI service temporarily unavailable';
    error.code = 'AI_SERVICE_ERROR';
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.statusCode = 413;
    error.message = 'File too large';
    error.code = 'FILE_TOO_LARGE';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.statusCode = 400;
    error.message = 'Unexpected file field';
    error.code = 'INVALID_FILE_FIELD';
  }

  // Network/timeout errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    error.statusCode = 503;
    error.message = 'External service unavailable';
    error.code = 'SERVICE_UNAVAILABLE';
  }

  // Frontend-specific error handling
  const frontendSource = req.headers['x-frontend-source'];
  if (frontendSource) {
    error.frontend = frontendSource;
    
    // Customize error messages based on frontend
    switch (frontendSource) {
      case 'flowmind':
        if (error.code === 'AI_SERVICE_ERROR') {
          error.message = 'AI chat service is currently unavailable. Please try again later.';
        }
        break;
      case 'quantum':
      case 'velocity':
        if (error.code === 'VALIDATION_ERROR') {
          error.message = 'Invalid swarm configuration. Please check your parameters.';
        }
        break;
      case 'citypulse':
        if (error.code === 'NOT_FOUND') {
          error.message = 'Building or sensor not found. Please check the ID and try again.';
        }
        break;
    }
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    if (error.statusCode >= 500) {
      error.message = 'Internal server error occurred';
      error.stack = undefined;
    }
  } else {
    // Include stack trace in development
    error.stack = err.stack;
  }

  // Add helpful information for developers
  if (process.env.NODE_ENV === 'development') {
    error.timestamp = new Date().toISOString();
    error.path = req.originalUrl;
    error.method = req.method;
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
      ...(error.frontend && { frontend: error.frontend }),
      ...(error.stack && { stack: error.stack }),
      ...(error.timestamp && { timestamp: error.timestamp }),
      ...(error.path && { path: error.path }),
      ...(error.method && { method: error.method })
    }
  });
};

/**
 * Async error wrapper to catch async errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not found error handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
};

/**
 * Create custom error
 */
export const createError = (statusCode, message, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code || `HTTP_${statusCode}`;
  return error;
};