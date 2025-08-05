export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    service: 'Energy Management MVP Backend',
    version: '1.0.0',
    features: {
      citypulse: true,
      ai_models: true,
      websocket: false, // WebSocket not supported in Vercel serverless
      real_time: true
    },
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      buildings: '/api/citypulse/buildings',
      energy: '/api/citypulse/energy',
      sensors: '/api/citypulse/sensors'
    }
  });
}