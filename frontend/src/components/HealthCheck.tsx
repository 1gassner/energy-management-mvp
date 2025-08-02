import { useEffect, useState } from 'react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  dependencies: {
    api: 'connected' | 'disconnected' | 'unknown';
    websocket: 'connected' | 'disconnected' | 'unknown';
  };
  performance: {
    loadTime: number;
    memoryUsage?: number;
  };
  buildInfo: {
    version: string;
    buildTime: string;
    commit?: string;
  };
}

export default function HealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      const startTime = performance.now();
      
      try {
        // Basic health check
        const status: HealthStatus = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: performance.now(),
          version: import.meta.env.VITE_APP_VERSION || '1.0.0',
          environment: import.meta.env.VITE_APP_ENV || 'development',
          dependencies: {
            api: 'unknown',
            websocket: 'unknown'
          },
          performance: {
            loadTime: performance.now() - startTime,
            memoryUsage: (performance as any)?.memory?.usedJSHeapSize
          },
          buildInfo: {
            version: import.meta.env.VITE_APP_VERSION || '1.0.0',
            buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown',
            commit: import.meta.env.VITE_BUILD_HASH || 'unknown'
          }
        };

        // Check API connectivity
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          if (apiUrl) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${apiUrl}/health`, {
              method: 'GET',
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            status.dependencies.api = response.ok ? 'connected' : 'disconnected';
          }
        } catch (error) {
          status.dependencies.api = 'disconnected';
        }

        // Check WebSocket connectivity
        try {
          const wsUrl = import.meta.env.VITE_WS_URL;
          if (wsUrl) {
            const ws = new WebSocket(wsUrl);
            
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                ws.close();
                reject(new Error('WebSocket timeout'));
              }, 5000);

              ws.onopen = () => {
                clearTimeout(timeout);
                status.dependencies.websocket = 'connected';
                ws.close();
                resolve(void 0);
              };

              ws.onerror = () => {
                clearTimeout(timeout);
                status.dependencies.websocket = 'disconnected';
                reject(new Error('WebSocket error'));
              };
            });
          }
        } catch (error) {
          status.dependencies.websocket = 'disconnected';
        }

        // Determine overall status
        if (status.dependencies.api === 'disconnected' || status.dependencies.websocket === 'disconnected') {
          status.status = 'degraded';
        }

        if (status.dependencies.api === 'disconnected' && status.dependencies.websocket === 'disconnected') {
          status.status = 'unhealthy';
        }

        setHealth(status);
      } catch (error) {
        setHealth({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          uptime: performance.now(),
          version: import.meta.env.VITE_APP_VERSION || '1.0.0',
          environment: import.meta.env.VITE_APP_ENV || 'development',
          dependencies: {
            api: 'unknown',
            websocket: 'unknown'
          },
          performance: {
            loadTime: performance.now() - startTime
          },
          buildInfo: {
            version: import.meta.env.VITE_APP_VERSION || '1.0.0',
            buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown',
            commit: import.meta.env.VITE_BUILD_HASH || 'unknown'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Checking system health...</p>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Health Check Failed</h2>
          <p className="text-red-600 dark:text-red-300">Unable to determine system health status.</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    healthy: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    degraded: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    unhealthy: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
  };

  const statusIcons = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌'
  };

  const dependencyStatusColors = {
    connected: 'text-green-600 dark:text-green-400',
    disconnected: 'text-red-600 dark:text-red-400',
    unknown: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Health Check</h1>
          <p className="text-gray-600 dark:text-gray-300">Real-time status of the Energy Management MVP system</p>
        </div>

        <div className="space-y-6">
          {/* Overall Status */}
          <div className={`border rounded-lg p-6 ${statusColors[health.status]}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span>{statusIcons[health.status]}</span>
                System Status: {health.status.toUpperCase()}
              </h2>
              <span className="text-sm font-mono">{health.timestamp}</span>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
                <p className="font-mono text-gray-900 dark:text-white">{health.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Environment</p>
                <p className="font-mono text-gray-900 dark:text-white">{health.environment}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Uptime</p>
                <p className="font-mono text-gray-900 dark:text-white">{Math.floor(health.uptime / 1000)}s</p>
              </div>
            </div>
          </div>

          {/* Dependencies */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dependencies</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-white">API Server</span>
                <span className={`font-semibold ${dependencyStatusColors[health.dependencies.api]}`}>
                  {health.dependencies.api.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-white">WebSocket Connection</span>
                <span className={`font-semibold ${dependencyStatusColors[health.dependencies.websocket]}`}>
                  {health.dependencies.websocket.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Health Check Load Time</p>
                <p className="font-mono text-gray-900 dark:text-white">{health.performance.loadTime.toFixed(2)}ms</p>
              </div>
              {health.performance.memoryUsage && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</p>
                  <p className="font-mono text-gray-900 dark:text-white">
                    {(health.performance.memoryUsage / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Build Information */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Build Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
                <p className="font-mono text-gray-900 dark:text-white">{health.buildInfo.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Build Time</p>
                <p className="font-mono text-gray-900 dark:text-white">{health.buildInfo.buildTime}</p>
              </div>
              {health.buildInfo.commit && health.buildInfo.commit !== 'unknown' && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Commit</p>
                  <p className="font-mono text-gray-900 dark:text-white">{health.buildInfo.commit.substring(0, 8)}</p>
                </div>
              )}
            </div>
          </div>

          {/* API Response Format */}
          <details className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <summary className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer">
              Raw Health Data (JSON)
            </summary>
            <pre className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded text-sm overflow-x-auto">
              {JSON.stringify(health, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}