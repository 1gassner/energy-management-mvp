import express from 'express';
import bcryptjs from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { supabase, dbHelpers } from '../../config/supabase.js';
import { generateToken, authenticateToken, refreshToken } from '../../middleware/auth.js';
import { securityLogger } from '../../middleware/requestLogger.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import winston from 'winston';

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user (creates Supabase auth user + profile)
 * @access  Public
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').isLength({ min: 2 }).trim(),
  body('organizationName').optional().isLength({ min: 2 }).trim(),
  body('frontendSource').optional().isIn(['flowmind', 'quantum', 'velocity', 'citypulse'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { email, password, name, organizationName, frontendSource = 'flowmind' } = req.body;

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      securityLogger('duplicate_registration_attempt', { email }, req);
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Create Supabase auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm for development
    });

    if (authError) {
      logger.error('Supabase auth creation failed:', authError);
      throw new Error('Failed to create user account');
    }

    // Create or get organization
    let organizationId;
    if (organizationName) {
      // Create new organization
      const slug = organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          slug,
          plan: 'free',
          features: {
            flowmind: frontendSource === 'flowmind',
            quantum: frontendSource === 'quantum',
            velocity: frontendSource === 'velocity',
            citypulse: frontendSource === 'citypulse',
            max_ai_requests_per_day: 100,
            max_swarm_agents: 5,
            max_buildings: 3
          }
        })
        .select()
        .single();

      if (orgError) {
        logger.error('Organization creation failed:', orgError);
        throw new Error('Failed to create organization');
      }

      organizationId = newOrg.id;
    } else {
      // Use default organization
      organizationId = '00000000-0000-0000-0000-000000000001';
    }

    // Create user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        email,
        name,
        organization_id: organizationId,
        role: organizationName ? 'admin' : 'user', // Organization creator becomes admin
        preferences: {
          [frontendSource]: {}
        }
      })
      .select()
      .single();

    if (profileError) {
      logger.error('User profile creation failed:', profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error('Failed to create user profile');
    }

    // Generate JWT token
    const tokenResult = await generateToken(authUser.user.id, frontendSource);

    // Log successful registration
    await dbHelpers.logActivity(
      authUser.user.id,
      frontendSource,
      'user_registered',
      {
        organizationId,
        organizationName,
        isNewOrganization: !!organizationName
      }
    );

    logger.info('User registered successfully', {
      userId: authUser.user.id,
      email,
      frontend: frontendSource,
      organizationId
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: tokenResult.user,
      token: tokenResult.token,
      frontendAccess: {
        [frontendSource]: true
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
}));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
  body('frontendSource').optional().isIn(['flowmind', 'quantum', 'velocity', 'citypulse'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { email, password, frontendSource = 'flowmind' } = req.body;

  try {
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      securityLogger('failed_login_attempt', { email, reason: authError.message }, req);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Get user profile with organization
    const userProfile = await dbHelpers.getUserProfile(authData.user.id);

    if (!userProfile) {
      securityLogger('login_profile_not_found', { email, userId: authData.user.id }, req);
      return res.status(401).json({
        error: 'User profile not found',
        message: 'Please contact support'
      });
    }

    // Check organization status
    if (userProfile.organization.subscription_status !== 'active') {
      return res.status(403).json({
        error: 'Organization inactive',
        message: 'Your organization subscription is not active'
      });
    }

    // Check frontend access
    const frontendPermissions = userProfile.organization.features;
    if (frontendSource && !frontendPermissions[frontendSource]) {
      return res.status(403).json({
        error: 'Frontend access denied',
        message: `Access to ${frontendSource} is not enabled for your organization`,
        availableFrontends: Object.keys(frontendPermissions).filter(key => frontendPermissions[key])
      });
    }

    // Generate JWT token
    const tokenResult = await generateToken(authData.user.id, frontendSource);

    // Log successful login
    await dbHelpers.logActivity(
      authData.user.id,
      frontendSource,
      'user_login',
      {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    logger.info('User logged in successfully', {
      userId: authData.user.id,
      email,
      frontend: frontendSource,
      organizationId: userProfile.organization_id
    });

    res.json({
      message: 'Login successful',
      user: tokenResult.user,
      token: tokenResult.token,
      frontendAccess: frontendPermissions,
      organization: {
        id: userProfile.organization.id,
        name: userProfile.organization.name,
        plan: userProfile.organization.plan
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
}));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate session)
 * @access  Private
 */
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  try {
    // Log logout activity
    await dbHelpers.logActivity(
      req.user.userId,
      req.user.frontendSource,
      'user_logout'
    );

    logger.info('User logged out', {
      userId: req.user.userId,
      email: req.user.email,
      frontend: req.user.frontendSource
    });

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
}));

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', authenticateToken, refreshToken);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userProfile = await dbHelpers.getUserProfile(req.user.userId);

    if (!userProfile) {
      return res.status(404).json({
        error: 'User profile not found'
      });
    }

    res.json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        avatar: userProfile.avatar,
        preferences: userProfile.preferences,
        lastLogin: userProfile.last_login,
        createdAt: userProfile.created_at
      },
      organization: {
        id: userProfile.organization.id,
        name: userProfile.organization.name,
        slug: userProfile.organization.slug,
        plan: userProfile.organization.plan,
        features: userProfile.organization.features,
        subscriptionStatus: userProfile.organization.subscription_status
      },
      permissions: req.user.permissions,
      frontendAccess: req.user.frontendPermissions
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get user profile',
      message: error.message
    });
  }
}));

/**
 * @route   PATCH /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/profile', [
  authenticateToken,
  body('name').optional().isLength({ min: 2 }).trim(),
  body('avatar').optional().isURL(),
  body('preferences').optional().isObject()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { name, avatar, preferences } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (avatar) updates.avatar = avatar;
  if (preferences) updates.preferences = preferences;

  try {
    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', req.user.userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log profile update
    await dbHelpers.logActivity(
      req.user.userId,
      req.user.frontendSource,
      'profile_updated',
      { fields: Object.keys(updates) }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name,
        avatar: updatedProfile.avatar,
        preferences: updatedProfile.preferences
      }
    });

  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
}));

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').isLength({ min: 1 }),
  body('newPassword').isLength({ min: 8 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Update password in Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(
      req.user.userId,
      { password: newPassword }
    );

    if (error) {
      throw error;
    }

    // Log password change
    await dbHelpers.logActivity(
      req.user.userId,
      req.user.frontendSource,
      'password_changed'
    );

    securityLogger('password_changed', { userId: req.user.userId }, req);

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message
    });
  }
}));

export default router;