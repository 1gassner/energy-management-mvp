import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Universal JWT Authentication Middleware
 * Supports all frontends: FlowMind, Quantum, Velocity, CityPulse
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const frontendSource = req.headers['x-frontend-source'];
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header missing',
        message: 'Please provide a valid JWT token in Authorization header'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token missing',
        message: 'Authorization header must contain a Bearer token'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      logger.warn('JWT verification failed:', jwtError.message);
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    // Get user profile with organization and permissions
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', decoded.userId)
      .single();

    if (profileError || !userProfile) {
      logger.warn('User profile not found:', decoded.userId);
      return res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token was not found'
      });
    }

    // Check if user's organization exists and is active
    if (!userProfile.organization) {
      return res.status(403).json({
        error: 'Organization not found',
        message: 'User is not associated with a valid organization'
      });
    }

    if (userProfile.organization.subscription_status !== 'active') {
      return res.status(403).json({
        error: 'Subscription inactive',
        message: 'Organization subscription is not active'
      });
    }

    // Determine frontend permissions
    const frontendPermissions = {
      flowmind: userProfile.organization.features.flowmind || false,
      quantum: userProfile.organization.features.quantum || false,
      velocity: userProfile.organization.features.velocity || false,
      citypulse: userProfile.organization.features.citypulse || false
    };

    // Validate frontend source if provided
    if (frontendSource && !frontendPermissions[frontendSource]) {
      return res.status(403).json({
        error: 'Frontend access denied',
        message: `Access to ${frontendSource} frontend is not enabled for your organization`
      });
    }

    // Create enhanced user object for request
    req.user = {
      userId: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role,
      organizationId: userProfile.organization_id,
      organization: userProfile.organization,
      frontendSource: frontendSource || 'unknown',
      permissions: {
        ai: frontendPermissions.flowmind,
        swarm: frontendPermissions.quantum || frontendPermissions.velocity,
        citypulse: frontendPermissions.citypulse,
        admin: userProfile.role === 'admin',
        manager: userProfile.role === 'manager' || userProfile.role === 'admin'
      },
      frontendPermissions,
      preferences: userProfile.preferences || {}
    };

    // Update last login time
    await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userProfile.id);

    // Log successful authentication
    logger.info('User authenticated', {
      userId: req.user.userId,
      email: req.user.email,
      frontend: frontendSource,
      organization: userProfile.organization.name
    });

    next();

  } catch (error) {
    logger.error('Authentication error:', error);
    
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Optional authentication middleware - continues even if no token provided
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    req.user = null;
    return next();
  }

  // Use the main auth middleware but catch errors
  authenticateToken(req, res, (error) => {
    if (error) {
      req.user = null;
    }
    next();
  });
};

/**
 * Admin-only authentication middleware
 */
export const requireAdmin = async (req, res, next) => {
  await authenticateToken(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
        message: 'This endpoint requires administrator privileges'
      });
    }
    next();
  });
};

/**
 * Manager or Admin authentication middleware
 */
export const requireManager = async (req, res, next) => {
  await authenticateToken(req, res, () => {
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Manager access required',
        message: 'This endpoint requires manager or administrator privileges'
      });
    }
    next();
  });
};

/**
 * Generate JWT token for user with frontend permissions
 */
export const generateToken = async (userId, frontendSource = 'flowmind') => {
  try {
    // Get user profile with organization
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', userId)
      .single();

    if (error || !userProfile) {
      throw new Error('User profile not found');
    }

    // Create JWT payload
    const payload = {
      userId: userProfile.id,
      email: userProfile.email,
      organizationId: userProfile.organization_id,
      role: userProfile.role,
      frontendSource,
      permissions: {
        ai: userProfile.organization.features.flowmind || false,
        swarm: userProfile.organization.features.quantum || userProfile.organization.features.velocity || false,
        citypulse: userProfile.organization.features.citypulse || false
      },
      frontendPermissions: {
        flowmind: userProfile.organization.features.flowmind || false,
        quantum: userProfile.organization.features.quantum || false,
        velocity: userProfile.organization.features.velocity || false,
        citypulse: userProfile.organization.features.citypulse || false
      },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return {
      token,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        organization: userProfile.organization,
        permissions: payload.permissions,
        frontendPermissions: payload.frontendPermissions
      }
    };

  } catch (error) {
    logger.error('Token generation error:', error);
    throw error;
  }
};

/**
 * Refresh JWT token
 */
export const refreshToken = async (req, res) => {
  try {
    const { userId, frontendSource } = req.user;
    
    const result = await generateToken(userId, frontendSource);
    
    return res.json({
      message: 'Token refreshed successfully',
      ...result
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    
    return res.status(500).json({
      error: 'Token refresh failed',
      message: 'Could not refresh token'
    });
  }
};