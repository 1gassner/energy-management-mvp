import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * Frontend-specific authorization middleware
 * Checks if user has access to specific frontends
 * 
 * @param {Array} allowedFrontends - Array of frontend names ['flowmind', 'quantum', 'velocity', 'citypulse']
 * @returns {Function} Express middleware function
 */
export const authorize = (allowedFrontends) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access this resource'
        });
      }

      const { frontendSource, frontendPermissions, permissions } = req.user;

      // If no specific frontend source provided, check if user has access to any of the allowed frontends
      if (!frontendSource || frontendSource === 'unknown') {
        const hasAnyAccess = allowedFrontends.some(frontend => 
          frontendPermissions[frontend] === true
        );

        if (!hasAnyAccess) {
          logger.warn('Access denied - no frontend permissions', {
            userId: req.user.userId,
            allowedFrontends,
            userPermissions: frontendPermissions
          });

          return res.status(403).json({
            error: 'Frontend access denied',
            message: `Access denied. You need permissions for one of: ${allowedFrontends.join(', ')}`,
            allowedFrontends,
            userPermissions: frontendPermissions
          });
        }

        return next();
      }

      // Check if the frontend source is in the allowed list
      if (!allowedFrontends.includes(frontendSource)) {
        logger.warn('Access denied - frontend not allowed', {
          userId: req.user.userId,
          frontendSource,
          allowedFrontends
        });

        return res.status(403).json({
          error: 'Frontend not allowed',
          message: `The ${frontendSource} frontend cannot access this endpoint`,
          allowedFrontends
        });
      }

      // Check if user has permission for this specific frontend
      if (!frontendPermissions[frontendSource]) {
        logger.warn('Access denied - no permission for frontend', {
          userId: req.user.userId,
          frontendSource,
          userPermissions: frontendPermissions
        });

        return res.status(403).json({
          error: 'Frontend permission denied',
          message: `You don't have permission to use the ${frontendSource} frontend`,
          requiredPermission: frontendSource,
          userPermissions: frontendPermissions
        });
      }

      // Additional specific permission checks
      if (allowedFrontends.includes('flowmind') && frontendSource === 'flowmind' && !permissions.ai) {
        return res.status(403).json({
          error: 'AI access denied',
          message: 'AI features are not enabled for your organization'
        });
      }

      if (allowedFrontends.includes('quantum') && frontendSource === 'quantum' && !permissions.swarm) {
        return res.status(403).json({
          error: 'Swarm access denied',
          message: 'Quantum Swarm features are not enabled for your organization'
        });
      }

      if (allowedFrontends.includes('velocity') && frontendSource === 'velocity' && !permissions.swarm) {
        return res.status(403).json({
          error: 'Swarm access denied',
          message: 'Velocity Swarm features are not enabled for your organization'
        });
      }

      if (allowedFrontends.includes('citypulse') && frontendSource === 'citypulse' && !permissions.citypulse) {
        return res.status(403).json({
          error: 'CityPulse access denied',
          message: 'CityPulse features are not enabled for your organization'
        });
      }

      // Log successful authorization
      logger.info('Authorization successful', {
        userId: req.user.userId,
        frontendSource,
        allowedFrontends,
        endpoint: req.path
      });

      next();

    } catch (error) {
      logger.error('Authorization error:', error);
      
      return res.status(500).json({
        error: 'Authorization failed',
        message: 'An error occurred during authorization'
      });
    }
  };
};

/**
 * Role-based authorization middleware
 * 
 * @param {Array} allowedRoles - Array of role names ['admin', 'manager', 'user']
 * @returns {Function} Express middleware function
 */
export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Role-based access denied', {
        userId: req.user.userId,
        userRole: req.user.role,
        allowedRoles
      });

      return res.status(403).json({
        error: 'Insufficient privileges',
        message: `This endpoint requires one of the following roles: ${allowedRoles.join(', ')}`,
        userRole: req.user.role,
        allowedRoles
      });
    }

    next();
  };
};

/**
 * Organization-based authorization middleware
 * Ensures user belongs to a specific organization
 * 
 * @param {String} organizationId - Organization UUID to check against
 * @returns {Function} Express middleware function
 */
export const authorizeOrganization = (organizationId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource'
      });
    }

    if (req.user.organizationId !== organizationId) {
      logger.warn('Organization-based access denied', {
        userId: req.user.userId,
        userOrganization: req.user.organizationId,
        requiredOrganization: organizationId
      });

      return res.status(403).json({
        error: 'Organization access denied',
        message: 'You do not have access to this organization\'s resources'
      });
    }

    next();
  };
};

/**
 * Feature-based authorization middleware
 * Checks if user's organization has specific features enabled
 * 
 * @param {Array} requiredFeatures - Array of feature names
 * @returns {Function} Express middleware function
 */
export const authorizeFeatures = (requiredFeatures) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource'
      });
    }

    const { organization } = req.user;
    
    if (!organization || !organization.features) {
      return res.status(403).json({
        error: 'Organization features not found',
        message: 'Could not determine organization feature access'
      });
    }

    const missingFeatures = requiredFeatures.filter(feature => 
      !organization.features[feature]
    );

    if (missingFeatures.length > 0) {
      logger.warn('Feature-based access denied', {
        userId: req.user.userId,
        requiredFeatures,
        missingFeatures,
        organizationFeatures: organization.features
      });

      return res.status(403).json({
        error: 'Feature access denied',
        message: `Your organization does not have access to: ${missingFeatures.join(', ')}`,
        requiredFeatures,
        missingFeatures
      });
    }

    next();
  };
};

/**
 * Usage limit authorization middleware
 * Checks if user has exceeded usage limits for specific features
 * 
 * @param {Object} limits - Object with limit checks
 * @returns {Function} Express middleware function
 */
export const authorizeUsageLimits = (limits) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User must be authenticated to access this resource'
        });
      }

      const { organization } = req.user;
      
      // Check daily AI request limits
      if (limits.aiRequests) {
        const today = new Date().toISOString().split('T')[0];
        const dailyLimit = organization.features.max_ai_requests_per_day || 100;
        
        // Here you would check actual usage from database
        // For now, we'll assume it's within limits
        // TODO: Implement actual usage tracking
      }

      // Check swarm agent limits
      if (limits.swarmAgents) {
        const maxAgents = organization.features.max_swarm_agents || 5;
        const requestedAgents = req.body.agents || req.body.config?.agents || 1;
        
        if (requestedAgents > maxAgents) {
          return res.status(403).json({
            error: 'Agent limit exceeded',
            message: `Your organization is limited to ${maxAgents} agents, but ${requestedAgents} were requested`,
            limit: maxAgents,
            requested: requestedAgents
          });
        }
      }

      // Check building limits for CityPulse
      if (limits.buildings) {
        // TODO: Implement building count check
      }

      next();

    } catch (error) {
      logger.error('Usage limit authorization error:', error);
      
      return res.status(500).json({
        error: 'Usage limit check failed',
        message: 'Could not verify usage limits'
      });
    }
  };
};