import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RealWebSocketService } from '../api/realWebSocketService';  
import { MockWebSocketService } from '../mock/mockWebSocketService';

// Simple tests to verify memory leak fixes are working
describe('WebSocket Memory Leak Fixes', () => {
  let mockService: MockWebSocketService;

  beforeEach(() => {
    vi.useFakeTimers();
    mockService = new MockWebSocketService();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    if (mockService) {
      mockService.disconnect();
    }
  });

  it('should have destroy method available', () => {
    expect(typeof mockService.destroy).toBe('function');
  });

  it('should cleanup subscriptions on disconnect', async () => {
    mockService.connect();
    await vi.runOnlyPendingTimersAsync();
    
    expect(mockService.isConnected).toBe(true);
    
    // Add subscriptions
    const sub1 = mockService.subscribe('type1', () => {});
    const sub2 = mockService.subscribe('type2', () => {});
    
    expect(sub1).toBeTruthy();
    expect(sub2).toBeTruthy();
    
    // Check internal state
    const subscriptions = (mockService as any).subscriptions;
    expect(subscriptions.length).toBe(2);
    
    // Disconnect should clear subscriptions
    mockService.disconnect();
    expect(subscriptions.length).toBe(0);
    expect(mockService.isConnected).toBe(false);
  });

  it('should prevent operations after destroy', () => {
    mockService.destroy();
    
    // These should be no-ops
    mockService.connect();
    expect(mockService.isConnected).toBe(false);
    
    const subId = mockService.subscribe('test', () => {});
    expect(subId).toBe('');
  });

  it('should clear all timers on destroy', async () => {
    mockService.connect();
    await vi.runOnlyPendingTimersAsync();
    
    // Service should have timers running
    const timers = (mockService as any).allTimers;
    expect(timers.size).toBeGreaterThan(0);
    
    mockService.destroy();
    
    // All timers should be cleared
    expect(timers.size).toBe(0);
  });

  it('should handle connection listener cleanup', () => {
    const listener = vi.fn();
    const unsubscribe = mockService.onConnectionChange(listener);
    
    // Listener should be called with initial state
    expect(listener).toHaveBeenCalledWith(false);
    
    // Cleanup should work
    unsubscribe();
    
    // Disconnect should not crash
    expect(() => mockService.disconnect()).not.toThrow();
  });
});

describe('Real WebSocket Service Memory Fixes', () => {
  let realService: RealWebSocketService;

  // Mock WebSocket for testing
  class TestWebSocket {
    static OPEN = 1;
    static CLOSED = 3;
    
    readyState = TestWebSocket.OPEN;
    onopen: ((event: Event) => void) | null = null;
    onclose: ((event: CloseEvent) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    
    constructor() {
      setTimeout(() => {
        if (this.onopen) this.onopen({} as Event);
      }, 10);
    }
    
    send() {}
    close() {
      this.readyState = TestWebSocket.CLOSED;
      if (this.onclose) this.onclose({ code: 1000, reason: '' } as CloseEvent);
    }
  }

  beforeEach(() => {
    vi.useFakeTimers();
    global.WebSocket = TestWebSocket as any;
    realService = new RealWebSocketService();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    if (realService) {
      realService.disconnect();
    }
  });

  it('should have destroy method available', () => {
    expect(typeof realService.destroy).toBe('function');
  });

  it('should prevent operations after destroy', () => {
    realService.destroy();
    
    // Operations should be prevented
    realService.connect();
    expect(realService.isConnected).toBe(false);
    
    const subId = realService.subscribe('test', () => {});
    expect(subId).toBe('');
  });

  it('should cleanup WebSocket event listeners', async () => {
    realService.connect();
    await vi.runOnlyPendingTimersAsync();
    
    // Get the WebSocket instance
    const ws = (realService as any).ws;
    expect(ws).toBeTruthy();
    expect(ws.onopen).toBeTruthy();
    
    // Disconnect should clear event listeners
    realService.disconnect();
    
    expect(ws.onopen).toBeNull();
    expect(ws.onmessage).toBeNull();
    expect(ws.onclose).toBeNull();
    expect(ws.onerror).toBeNull();
  });

  it('should clear subscriptions on disconnect', async () => {
    realService.connect();
    await vi.runOnlyPendingTimersAsync();
    
    const sub1 = realService.subscribe('type1', () => {});
    const sub2 = realService.subscribe('type2', () => {});
    
    expect(sub1).toBeTruthy();
    expect(sub2).toBeTruthy();
    
    // Check internal subscriptions
    const subscriptions = (realService as any).subscriptions;
    expect(subscriptions.size).toBe(2);
    
    realService.disconnect();
    expect(subscriptions.size).toBe(0);
  });
});