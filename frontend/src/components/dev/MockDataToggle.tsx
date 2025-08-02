import React, { useState } from 'react';
import { serviceFactory } from '@/services/serviceFactory';
import { Button } from '@/components/ui/Button';
import { notificationService } from '@/services/notification.service';

const MockDataToggle: React.FC = () => {
  const [isMockMode, setIsMockMode] = useState(serviceFactory.isMockMode());
  const [mockConfig, setMockConfig] = useState(serviceFactory.getMockConfig());

  const handleToggleMockMode = () => {
    if (isMockMode) {
      serviceFactory.switchToRealMode();
      setIsMockMode(false);
      notificationService.info('Switched to Real API Mode');
    } else {
      serviceFactory.switchToMockMode();
      setIsMockMode(true);
      notificationService.info('Switched to Mock Data Mode');
    }
  };

  const handleUpdateDelay = (delay: number) => {
    serviceFactory.updateMockConfig({ mockDelay: delay });
    setMockConfig(serviceFactory.getMockConfig());
    notificationService.success(`Mock delay updated to ${delay}ms`);
  };

  const handleSimulateIssues = (enabled: boolean) => {
    serviceFactory.simulateNetworkIssues(enabled);
    notificationService.warning(
      enabled ? 'Network issues simulation enabled' : 'Network issues simulation disabled'
    );
  };

  const handleTriggerAlert = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    serviceFactory.triggerTestAlert('rathaus-001', severity);
    notificationService.info(`Test alert triggered (${severity})`);
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 min-w-[300px] z-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">🛠️ Dev Tools</h3>
      
      <div className="space-y-3">
        {/* Mock Mode Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Mock Data Mode</span>
          <Button
            size="sm"
            variant={isMockMode ? 'primary' : 'secondary'}
            onClick={handleToggleMockMode}
          >
            {isMockMode ? 'Mock' : 'Real'}
          </Button>
        </div>

        {/* Mock Configuration (only in mock mode) */}
        {isMockMode && (
          <>
            <div className="border-t pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Delay (ms)</span>
                <span className="text-xs font-mono">{mockConfig.mockDelay}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => handleUpdateDelay(200)}>200ms</Button>
                <Button size="sm" onClick={() => handleUpdateDelay(800)}>800ms</Button>
                <Button size="sm" onClick={() => handleUpdateDelay(2000)}>2s</Button>
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="text-xs text-gray-600 mb-2">Test Features</div>
              <div className="grid grid-cols-2 gap-1">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => handleSimulateIssues(true)}
                >
                  Simulate Issues
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => handleSimulateIssues(false)}
                >
                  Reset Issues
                </Button>
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="text-xs text-gray-600 mb-2">Trigger Alerts</div>
              <div className="grid grid-cols-2 gap-1">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => handleTriggerAlert('low')}
                >
                  Low
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => handleTriggerAlert('high')}
                >
                  High
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => handleTriggerAlert('medium')}
                >
                  Medium
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => handleTriggerAlert('critical')}
                >
                  Critical
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Configuration Info */}
        <div className="border-t pt-2 text-xs text-gray-500">
          <div>Mode: {isMockMode ? 'Mock' : 'Real'}</div>
          <div>Env: {import.meta.env.VITE_APP_ENV}</div>
          <div>WS: {isMockMode ? 'Mock' : 'Real'}</div>
        </div>
      </div>
    </div>
  );
};

export default MockDataToggle;