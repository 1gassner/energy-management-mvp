export default function handler(req, res) {
  res.status(200).json({
    name: 'Energy Management MVP Backend',
    version: '1.0.0',
    description: 'CityPulse Energy Management - Smart City MVP with 745 sensors across 7 buildings in Hechingen',
    environment: process.env.NODE_ENV || 'production',
    platform: 'Vercel Serverless Functions',
    timestamp: new Date().toISOString(),
    frontends: [
      {
        name: 'CityPulse Energy Management',
        enabled: true,
        endpoints: '/api/citypulse/*',
        description: '745 sensors across 7 buildings in Hechingen'
      },
      {
        name: 'FlowMind AI Chat',
        enabled: process.env.AI_MODELS_ENABLED === 'true',
        endpoints: '/api/ai/*',
        description: 'Multi-model AI chat integration'
      }
    ],
    buildings: [
      'Rathaus Hechingen',
      'Stadtwerke Zentrale', 
      'Kulturzentrum',
      'Sporthalle Nord',
      'Grundschule Mitte',
      'Verwaltungsgebäude',
      'Bibliothek'
    ],
    sensors: {
      total: 745,
      types: ['energy', 'temperature', 'humidity', 'occupancy', 'air_quality'],
      real_time: true,
      update_interval: '30 seconds'
    },
    features: {
      real_time_monitoring: true,
      energy_analytics: true,
      alert_system: true,
      historical_data: true,
      predictive_analysis: true,
      cost_optimization: true
    },
    api_endpoints: {
      health: 'GET /api/health',
      info: 'GET /api/info',
      buildings: 'GET /api/citypulse/buildings',
      energy: 'GET /api/citypulse/energy',
      sensors: 'GET /api/citypulse/sensors',
      analytics: 'GET /api/citypulse/analytics',
      alerts: 'GET /api/citypulse/alerts'
    }
  });
}