import express from 'express';
import buildingsRouter from './buildings.js';
import sensorsRouter from './sensors.js';
import energyRouter from './energy.js';
import alertsRouter from './alerts.js';
import analyticsRouter from './analytics.js';

const router = express.Router();

// CityPulse API Routes
router.use('/buildings', buildingsRouter);
router.use('/sensors', sensorsRouter);
router.use('/energy', energyRouter);
router.use('/alerts', alertsRouter);
router.use('/analytics', analyticsRouter);

// CityPulse API Info
router.get('/', (req, res) => {
  res.json({
    name: 'CityPulse Energy Management API',
    version: '1.0.0',
    description: 'Real-time energy monitoring and management for municipal buildings',
    user: {
      id: req.user.userId,
      email: req.user.email,
      organization: req.user.organization?.name
    },
    endpoints: {
      buildings: '/api/v1/citypulse/buildings',
      sensors: '/api/v1/citypulse/sensors',
      energy: '/api/v1/citypulse/energy',
      alerts: '/api/v1/citypulse/alerts',
      analytics: '/api/v1/citypulse/analytics'
    },
    features: {
      realTimeMonitoring: true,
      alertManagement: true,
      energyAnalytics: true,
      multiBuilding: true,
      customDashboards: true
    }
  });
});

export default router;