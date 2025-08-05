import { IWebSocketService, WebSocketMessage } from '@/types/api';
import { logger } from '@/utils/logger';
import { mockSensors, mockAlerts, generateMockEnergyData, mockBuildings } from './mockData';

interface MockWebSocketSubscription {
  id: string;
  type: string;
  callback: (data: unknown) => void;
}

export class MockWebSocketService implements IWebSocketService {
  private subscriptions: MockWebSocketSubscription[] = [];
  public isConnected: boolean = false;
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private simulationInterval: ReturnType<typeof setInterval> | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private isDestroyed = false;
  private allTimers: Set<ReturnType<typeof setTimeout | typeof setInterval>> = new Set();

  connect(): void {
    if (this.isDestroyed) {
      logger.warn('Cannot connect - Mock WebSocket service has been destroyed');
      return;
    }

    if (this.isConnected) {
      return;
    }

    logger.info('Mock WebSocket connecting...');
    
    // Clear any existing connection timeout
    this.clearConnectionTimeout();
    
    // Simulate connection delay
    this.connectionTimeout = setTimeout(() => {
      if (this.isDestroyed) return;
      this.isConnected = true;
      logger.info('Mock WebSocket connected');
      this.notifyConnectionListeners(true);
      this.startSimulation();
    }, 500 + Math.random() * 1000); // 0.5-1.5s delay
    
    this.allTimers.add(this.connectionTimeout);
  }

  disconnect(): void {
    this.cleanup();
  }

  destroy(): void {
    this.isDestroyed = true;
    this.cleanup();
    this.connectionListeners.length = 0; // Clear all connection listeners
    logger.info('Mock WebSocket service destroyed');
  }

  private cleanup(): void {
    this.clearConnectionTimeout();
    this.clearSimulationInterval();
    this.clearAllTimers();
    
    this.isConnected = false;
    
    // Properly clear subscriptions
    this.subscriptions.forEach(sub => {
      // Clear any potential references
      sub.callback = () => {}; // Replace with no-op to avoid memory leaks
    });
    this.subscriptions.length = 0; // More explicit clearing
    
    this.notifyConnectionListeners(false);
    logger.info('Mock WebSocket disconnected and cleaned up');
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.allTimers.delete(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  private clearSimulationInterval(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.allTimers.delete(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private clearAllTimers(): void {
    this.allTimers.forEach(timer => {
      if (typeof timer === 'number') {
        // Could be either setTimeout or setInterval ID
        clearTimeout(timer);
        clearInterval(timer);
      }
    });
    this.allTimers.clear();
  }

  subscribe(type: string, callback: (data: unknown) => void): string {
    if (this.isDestroyed) {
      logger.warn('Cannot subscribe - Mock WebSocket service is destroyed');
      return '';
    }

    const id = `mock_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.subscriptions.push({
      id,
      type,
      callback,
    });

    logger.info('Mock WebSocket subscription added', { type, id });
    return id;
  }

  unsubscribe(id: string): void {
    if (this.isDestroyed) {
      return;
    }

    const index = this.subscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
      const subscription = this.subscriptions[index];
      // Clear callback to prevent memory leaks
      subscription.callback = () => {};
      this.subscriptions.splice(index, 1);
      logger.info('Mock WebSocket subscription removed', { type: subscription.type, id });
    }
  }

  send(message: WebSocketMessage): void {
    if (this.isDestroyed) {
      logger.warn('Cannot send message - Mock WebSocket service is destroyed');
      return;
    }

    if (!this.isConnected) {
      logger.warn('Mock WebSocket not connected. Message not sent', { message });
      return;
    }

    logger.info('Mock WebSocket message sent', { type: message.type, payload: message.payload });
    
    // Simulate server response for certain message types
    const responseTimer = setTimeout(() => {
      if (!this.isDestroyed) {
        this.simulateServerResponse(message);
      }
      this.allTimers.delete(responseTimer);
    }, 100 + Math.random() * 200);
    
    this.allTimers.add(responseTimer);
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    if (this.isDestroyed) {
      logger.warn('Cannot add connection listener - Mock WebSocket service is destroyed');
      return () => {}; // Return no-op unsubscribe function
    }

    this.connectionListeners.push(callback);
    
    // Immediately call with current status
    try {
      callback(this.isConnected);
    } catch (error) {
      logger.error('Error in mock connection listener during registration', error as Error);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  get connectionState(): string {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        logger.error('Error in mock connection listener', error as Error);
      }
    });
  }

  private startSimulation(): void {
    if (this.isDestroyed) {
      return;
    }

    // Clear any existing simulation
    this.clearSimulationInterval();
    
    // Send periodic updates to simulate real-time data
    this.simulationInterval = setInterval(() => {
      if (!this.isDestroyed) {
        this.sendRandomUpdates();
      }
    }, 3000 + Math.random() * 2000); // Every 3-5 seconds
    
    this.allTimers.add(this.simulationInterval);

    // Send initial data
    const initialDataTimer = setTimeout(() => {
      if (!this.isDestroyed) {
        this.sendInitialData();
      }
      this.allTimers.delete(initialDataTimer);
    }, 1000);
    
    this.allTimers.add(initialDataTimer);
  }

  private sendInitialData(): void {
    // Send initial energy data
    this.broadcastMessage({
      type: 'energy_update',
      payload: {
        totalEnergy: 2847.5,
        co2Saved: 1423.75,
      },
      timestamp: new Date().toISOString(),
      source: 'mock_initial_data',
    });

    // Send initial system status
    this.broadcastMessage({
      type: 'system_status',
      payload: {
        status: 'online',
      },
      timestamp: new Date().toISOString(),
      source: 'mock_system',
    });
  }

  private sendRandomUpdates(): void {
    const updateTypes = ['energy_update', 'sensor_data', 'building_status'];
    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];

    switch (randomType) {
      case 'energy_update':
        this.sendEnergyUpdate();
        break;
      case 'sensor_data':
        this.sendSensorUpdate();
        break;
      case 'building_status':
        this.sendBuildingStatusUpdate();
        break;
    }

    // Occasionally send alerts
    if (Math.random() < 0.1) { // 10% chance
      this.sendAlertUpdate();
    }
  }

  private sendEnergyUpdate(): void {
    const randomBuilding = mockBuildings[Math.floor(Math.random() * mockBuildings.length)];
    const energyData = generateMockEnergyData(randomBuilding.id, 1)[0];

    this.broadcastMessage({
      type: 'energy_update',
      payload: {
        buildingId: randomBuilding.id,
        totalEnergy: energyData.consumption,
        co2Saved: energyData.co2Saved,
      },
      timestamp: new Date().toISOString(),
      source: `mock_energy_${randomBuilding.id}`,
    });
  }

  private sendSensorUpdate(): void {
    const randomSensor = mockSensors[Math.floor(Math.random() * mockSensors.length)];
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const newValue = randomSensor.value * (1 + variation);

    this.broadcastMessage({
      type: 'sensor_data',
      payload: {
        sensorId: randomSensor.id,
        value: Math.round(newValue * 100) / 100,
        timestamp: new Date().toISOString(),
        unit: randomSensor.unit,
      },
      timestamp: new Date().toISOString(),
      source: `mock_sensor_${randomSensor.id}`,
    });
  }

  private sendBuildingStatusUpdate(): void {
    const randomBuilding = mockBuildings[Math.floor(Math.random() * mockBuildings.length)];
    const statuses = ['online', 'maintenance', 'offline'];
    const currentStatus = randomBuilding.status;
    
    // Usually keep the same status, occasionally change it
    const newStatus = Math.random() < 0.1 
      ? statuses[Math.floor(Math.random() * statuses.length)]
      : currentStatus;

    this.broadcastMessage({
      type: 'building_status',
      payload: {
        buildingId: randomBuilding.id,
        status: newStatus,
      },
      timestamp: new Date().toISOString(),
      source: `mock_building_${randomBuilding.id}`,
    });
  }

  private sendAlertUpdate(): void {
    const priorities = ['low', 'medium', 'high', 'critical'];
    const randomBuilding = mockBuildings[Math.floor(Math.random() * mockBuildings.length)];
    
    const alertMessages = [
      'Hoher Energieverbrauch erkannt',
      'Sensor-Kalibrierung erforderlich',
      'Planmäßige Wartung anstehend',
      'Batterieladung niedrig',
      'Ungewöhnliche Temperaturschwankung',
      'Solarproduktion unter Erwartung',
    ];

    this.broadcastMessage({
      type: 'alert',
      payload: {
        buildingId: randomBuilding.id,
        alertCount: mockAlerts.filter(a => !a.isResolved).length + 1,
        message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
        severity: priorities[Math.floor(Math.random() * priorities.length)],
      },
      timestamp: new Date().toISOString(),
      source: `mock_alert_${randomBuilding.id}`,
    });
  }

  private simulateServerResponse(message: WebSocketMessage): void {
    // Simulate server acknowledgment for certain message types
    if (message.type === 'energy_update' || message.type === 'sensor_data') {
      this.broadcastMessage({
        type: 'system_status',
        payload: {
          status: 'ack',
          originalMessage: message.type,
        },
        timestamp: new Date().toISOString(),
        source: 'mock_server_response',
      });
    }
  }

  private broadcastMessage(message: WebSocketMessage): void {
    const relevantSubscriptions = this.subscriptions.filter(sub => sub.type === message.type);
    
    relevantSubscriptions.forEach(subscription => {
      try {
        subscription.callback(message.payload);
      } catch (error) {
        logger.error('Error in mock subscription callback', error as Error);
      }
    });

    // Also log the message for debugging
    logger.debug('Mock WebSocket message broadcast', {
      type: message.type,
      payload: message.payload,
      subscriberCount: relevantSubscriptions.length,
    });
  }

  // Configuration methods for testing
  setUpdateInterval(intervalMs: number): void {
    if (this.isDestroyed) {
      return;
    }

    this.clearSimulationInterval();
    
    if (this.isConnected && intervalMs > 0) {
      this.simulationInterval = setInterval(() => {
        if (!this.isDestroyed) {
          this.sendRandomUpdates();
        }
      }, intervalMs);
      
      this.allTimers.add(this.simulationInterval);
    }
  }

  simulateConnectionLoss(): void {
    if (this.isDestroyed) {
      return;
    }

    if (this.isConnected) {
      logger.warn('Simulating connection loss');
      this.disconnect();
      
      // Automatically reconnect after a delay
      const reconnectTimer = setTimeout(() => {
        if (!this.isDestroyed) {
          logger.info('Simulating automatic reconnection');
          this.connect();
        }
        this.allTimers.delete(reconnectTimer);
      }, 2000 + Math.random() * 3000);
      
      this.allTimers.add(reconnectTimer);
    }
  }

  triggerAlert(buildingId: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    this.broadcastMessage({
      type: 'alert',
      payload: {
        buildingId,
        alertCount: mockAlerts.filter(a => !a.isResolved).length + 1,
        message: 'Manuell ausgelöster Test-Alarm',
        severity,
      },
      timestamp: new Date().toISOString(),
      source: 'mock_manual_trigger',
    });
  }
}

export const mockWebSocketService = new MockWebSocketService();