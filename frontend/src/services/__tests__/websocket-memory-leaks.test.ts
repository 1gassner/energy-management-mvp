import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We'll create fresh instances for testing instead of using singletons
import { RealWebSocketService } from '../api/realWebSocketService';
import { MockWebSocketService } from '../mock/mockWebSocketService';

// Mock logger to verify cleanup calls
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

vi.doMock('@/utils/logger', () => ({
  logger: mockLogger
}));

// Mock WebSocket for Real Service tests
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  
  public readyState = MockWebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  
  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen({} as Event);
      }
    }, 10);
  }
  
  send(data: string) {
    // Mock implementation
  }
  
  close(code = 1000, reason = '') {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code, reason } as CloseEvent);
    }
  }
}

// Override global WebSocket for Real Service tests
Object.defineProperty(global, 'WebSocket', {
  writable: true,
  value: MockWebSocket,
});

describe('WebSocket Memory Leak Prevention', () => {
  let realService: RealWebSocketService;
  let mockService: MockWebSocketService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Create fresh instances for each test
    realService = new RealWebSocketService();
    mockService = new MockWebSocketService();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    
    // Cleanup services
    if (realService) {
      realService.disconnect();
      if (realService.destroy) realService.destroy();
    }
    if (mockService) {
      mockService.disconnect();
      if (mockService.destroy) mockService.destroy();
    }
  });

  describe('Real WebSocket Service', () => {
    it('should properly cleanup all resources on destroy', async () => {
      // Connect the service
      realService.connect();
      await vi.runOnlyPendingTimersAsync();
      
      expect(realService.isConnected).toBe(true);
      
      // Add some subscriptions and listeners
      const subscription1 = realService.subscribe('test-type', () => {});
      const subscription2 = realService.subscribe('another-type', () => {});
      const connectionUnsubscribe = realService.onConnectionChange(() => {});
      
      expect(subscription1).toBeTruthy();
      expect(subscription2).toBeTruthy();
      
      // Destroy the service
      realService.destroy();
      
      // Verify cleanup
      expect(realService.isConnected).toBe(false);
      expect(realService.connectionState).toBe('disconnected');
      
      // Operations after destroy should be no-ops
      const newSub = realService.subscribe('post-destroy', () => {});
      expect(newSub).toBe('');
      
      realService.send({
        type: 'test' as any,
        payload: {},
        timestamp: new Date().toISOString()
      });
      
      // Should have logged warnings about destroyed service
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should prevent reconnection after destroy', async () => {
      realWebSocketService.connect();
      await vi.runOnlyPendingTimersAsync();
      
      // Destroy the service
      realWebSocketService.destroy();
      
      // Try to connect again - should be prevented
      realWebSocketService.connect();
      
      expect(realWebSocketService.isConnected).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Cannot connect - WebSocket service has been destroyed'
      );
    });

    it('should cleanup reconnection timers on destroy', async () => {
      realWebSocketService.connect();
      await vi.runOnlyPendingTimersAsync();
      
      // Simulate connection loss to trigger reconnection
      const ws = (realWebSocketService as any).ws;
      if (ws && ws.onclose) {
        ws.onclose({ code: 1006, reason: 'Connection lost' });
      }
      
      // Destroy before reconnection timer fires
      realWebSocketService.destroy();
      
      // Fast forward timers - should not attempt reconnection
      await vi.runOnlyPendingTimersAsync();
      
      expect(realWebSocketService.isConnected).toBe(false);
    });
  });

  describe('Mock WebSocket Service', () => {
    it('should properly cleanup all resources on destroy', async () => {
      // Connect the service
      mockWebSocketService.connect();
      await vi.runOnlyPendingTimersAsync();
      
      expect(mockWebSocketService.isConnected).toBe(true);
      
      // Add some subscriptions and listeners
      const subscription1 = mockWebSocketService.subscribe('test-type', () => {});
      const subscription2 = mockWebSocketService.subscribe('another-type', () => {});
      const connectionUnsubscribe = mockWebSocketService.onConnectionChange(() => {});
      
      expect(subscription1).toBeTruthy();
      expect(subscription2).toBeTruthy();
      
      // Destroy the service
      mockWebSocketService.destroy();
      
      // Verify cleanup
      expect(mockWebSocketService.isConnected).toBe(false);
      expect(mockWebSocketService.connectionState).toBe('disconnected');
      
      // Operations after destroy should be no-ops
      const newSub = mockWebSocketService.subscribe('post-destroy', () => {});
      expect(newSub).toBe('');
      
      mockWebSocketService.send({
        type: 'test' as any,
        payload: {},
        timestamp: new Date().toISOString()
      });
      
      // Should have logged warnings about destroyed service
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Cannot'),
        expect.anything()
      );
    });

    it('should cleanup all timers and intervals', async () => {
      mockWebSocketService.connect();
      await vi.runOnlyPendingTimersAsync();
      
      expect(mockWebSocketService.isConnected).toBe(true);
      
      // Verify simulation is running (internal implementation detail)
      const internalTimers = (mockWebSocketService as any).allTimers;
      expect(internalTimers.size).toBeGreaterThan(0);
      
      // Destroy should clear all timers
      mockWebSocketService.destroy();
      
      expect(internalTimers.size).toBe(0);
      expect(mockWebSocketService.isConnected).toBe(false);
    });

    it('should prevent operations when destroyed', () => {
      mockWebSocketService.destroy();
      
      // All operations should be no-ops
      mockWebSocketService.connect();
      expect(mockWebSocketService.isConnected).toBe(false);
      
      const subId = mockWebSocketService.subscribe('test', () => {});
      expect(subId).toBe('');
      
      // Should log warnings
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('destroyed'),
        expect.anything()
      );
    });

    it('should handle subscription cleanup without memory leaks', async () => {
      mockWebSocketService.connect();
      await vi.runOnlyPendingTimersAsync();
      
      const callbacks: (() => void)[] = [];
      const subscriptionIds: string[] = [];
      
      // Create multiple subscriptions
      for (let i = 0; i < 10; i++) {
        const callback = vi.fn();
        callbacks.push(callback);
        
        const subId = mockWebSocketService.subscribe(`type-${i}`, callback);
        subscriptionIds.push(subId);
      }
      
      // Verify subscriptions were created
      const subscriptions = (mockWebSocketService as any).subscriptions;
      expect(subscriptions.length).toBe(10);
      
      // Cleanup all subscriptions
      mockWebSocketService.disconnect();
      
      // Verify cleanup
      expect(subscriptions.length).toBe(0);
      
      // Callbacks should be replaced with no-ops to prevent memory leaks
      // (This tests the implementation detail of our cleanup)
      mockWebSocketService.connect();
      await vi.runOnlyPendingTimersAsync();
      
      // Old callbacks should not be called
      callbacks.forEach(callback => {
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('Memory Management Integration', () => {
    it('should handle rapid connect/disconnect cycles without leaks', async () => {
      // Simulate rapid connect/disconnect cycles
      for (let i = 0; i < 5; i++) {
        realWebSocketService.connect();
        await vi.runOnlyPendingTimersAsync();
        
        const subId = realWebSocketService.subscribe(`cycle-${i}`, () => {});
        expect(subId).toBeTruthy();
        
        realWebSocketService.disconnect();
      }
      
      // Final state should be clean
      expect(realWebSocketService.isConnected).toBe(false);
      expect(realWebSocketService.connectionState).toBe('disconnected');
    });

    it('should handle error conditions without memory leaks', async () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      
      mockWebSocketService.connect();
      await vi.runOnlyPendingTimersAsync();
      
      // Add error-prone callback
      mockWebSocketService.onConnectionChange(errorCallback);
      
      // Disconnect should handle errors gracefully
      expect(() => {
        mockWebSocketService.disconnect();
      }).not.toThrow();
      
      // Should have logged the error
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error'),
        expect.any(Error)
      );
    });
  });
});