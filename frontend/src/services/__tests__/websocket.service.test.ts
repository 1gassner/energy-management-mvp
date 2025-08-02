import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { websocketService } from '../websocket.service'

// Create a more sophisticated WebSocket mock
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  
  public readyState = MockWebSocket.CONNECTING
  public onopen: ((event: Event) => void) | null = null
  public onclose: ((event: CloseEvent) => void) | null = null
  public onmessage: ((event: MessageEvent) => void) | null = null
  public onerror: ((event: Event) => void) | null = null
  
  private messageQueue: string[] = []
  
  constructor(public url: string) {
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen({} as Event)
      }
    }, 10)
  }
  
  send(data: string) {
    if (this.readyState === MockWebSocket.OPEN) {
      this.messageQueue.push(data)
    } else {
      throw new Error('WebSocket is not open')
    }
  }
  
  close(code = 1000, reason = '') {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose({ code, reason } as CloseEvent)
    }
  }
  
  // Helper method to simulate receiving messages
  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) } as MessageEvent)
    }
  }
  
  // Helper method to simulate errors
  simulateError() {
    if (this.onerror) {
      this.onerror({} as Event)
    }
  }
  
  // Helper method to simulate connection close
  simulateClose(code = 1000, reason = '') {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose({ code, reason } as CloseEvent)
    }
  }
  
  getSentMessages() {
    return this.messageQueue
  }
}

// Override global WebSocket
let mockWebSocketInstance: MockWebSocket | null = null

Object.defineProperty(global, 'WebSocket', {
  writable: true,
  value: function(url: string) {
    mockWebSocketInstance = new MockWebSocket(url)
    return mockWebSocketInstance
  },
})

// Add static properties
Object.assign(global.WebSocket, {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
})

describe('WebSocketService', () => {
  let mockLogger: any

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    }
    
    // Mock the logger import
    vi.doMock('@/utils/logger', () => ({
      logger: mockLogger
    }))
    
    mockWebSocketInstance = null
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
    websocketService.disconnect()
  })

  describe('Connection Management', () => {
    it('should connect to WebSocket successfully', async () => {
      websocketService.connect()
      
      expect(mockWebSocketInstance).toBeTruthy()
      expect(mockWebSocketInstance?.url).toBe('ws://localhost:3001')
      
      // Fast forward timers to complete connection
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      expect(websocketService.isConnected).toBe(true)
      expect(websocketService.connectionState).toBe('connected')
      expect(mockLogger.info).toHaveBeenCalledWith('WebSocket connected', { url: 'ws://localhost:3001' })
    })

    it('should use environment variable for WebSocket URL', () => {
      // Mock environment variable
      vi.stubEnv('VITE_WS_URL', 'ws://custom-url:8080')
      
      websocketService.connect()
      
      expect(mockWebSocketInstance?.url).toBe('ws://custom-url:8080')
      
      vi.unstubAllEnvs()
    })

    it('should not create multiple connections when already connecting', () => {
      websocketService.connect()
      const firstInstance = mockWebSocketInstance
      
      websocketService.connect()
      
      expect(mockWebSocketInstance).toBe(firstInstance)
    })

    it('should not create multiple connections when already connected', async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      const firstInstance = mockWebSocketInstance
      websocketService.connect()
      
      expect(mockWebSocketInstance).toBe(firstInstance)
    })

    it('should disconnect cleanly', async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      expect(websocketService.isConnected).toBe(true)
      
      websocketService.disconnect()
      
      expect(websocketService.isConnected).toBe(false)
      expect(websocketService.connectionState).toBe('closed')
    })

    it('should clear subscriptions on disconnect', async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      const subscriptionId = websocketService.subscribe('test-type', () => {})
      expect(subscriptionId).toBeTruthy()
      
      websocketService.disconnect()
      
      // Verify subscriptions are cleared (internal state)
      expect((websocketService as any)['subscriptions'].size).toBe(0)
    })
  })

  describe('Reconnection Logic', () => {
    it('should attempt reconnection on unexpected close', async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      expect(websocketService.isConnected).toBe(true)
      
      // Simulate unexpected disconnection
      mockWebSocketInstance?.simulateClose(1006, 'Connection lost')
      
      expect(mockLogger.info).toHaveBeenCalledWith('WebSocket disconnected', { code: 1006, reason: 'Connection lost' })
      
      // Fast forward to trigger reconnection
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to reconnect',
        expect.objectContaining({
          attempt: 1,
          maxAttempts: 5
        })
      )
    })

    it('should not reconnect on clean close', async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      // Simulate clean close
      mockWebSocketInstance?.simulateClose(1000, 'Normal closure')
      
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      // Should not see reconnection attempts
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        'Attempting to reconnect',
        expect.anything()
      )
    })

    it('should use exponential backoff for reconnection', async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      // Simulate multiple connection failures
      for (let i = 1; i <= 3; i++) {
        mockWebSocketInstance?.simulateClose(1006, 'Connection lost')
        await act(async () => {
          await vi.runOnlyPendingTimersAsync()
        })
        
        const expectedDelay = 1000 * Math.pow(2, i - 1)
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Attempting to reconnect',
          expect.objectContaining({
            delayMs: expectedDelay,
            attempt: i
          })
        )
      }
    })

    it('should stop reconnecting after max attempts', async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      // Simulate max reconnection attempts
      for (let i = 1; i <= 6; i++) {
        mockWebSocketInstance?.simulateClose(1006, 'Connection lost')
        await act(async () => {
          await vi.runOnlyPendingTimersAsync()
        })
      }
      
      expect(mockLogger.error).toHaveBeenCalledWith('Max reconnection attempts reached. WebSocket websocketService stopped.')
    })
  })

  describe('Message Handling', () => {
    beforeEach(async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
    })

    it('should send messages when connected', () => {
      const message = { type: 'test' as any, payload: { data: 'hello' }, timestamp: new Date().toISOString() }
      
      websocketService.send(message)
      
      const sentMessages = mockWebSocketInstance?.getSentMessages()
      expect(sentMessages).toContain(JSON.stringify(message))
    })

    it('should not send messages when disconnected', () => {
      websocketService.disconnect()
      
      const message = { type: 'test' as any, payload: { data: 'hello' }, timestamp: new Date().toISOString() }
      websocketService.send(message)
      
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'WebSocket is not connected. Message not sent',
        { message }
      )
    })

    it('should handle JSON parsing errors gracefully', () => {
      const callback = vi.fn()
      websocketService.subscribe('test-type', callback)
      
      // Simulate invalid JSON message
      if (mockWebSocketInstance?.onmessage) {
        mockWebSocketInstance.onmessage({ data: 'invalid json' } as MessageEvent)
      }
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error parsing WebSocket message',
        expect.any(Error)
      )
      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle send errors gracefully', () => {
      // Mock send to throw an error
      const originalSend = mockWebSocketInstance?.send
      if (mockWebSocketInstance) {
        mockWebSocketInstance.send = vi.fn(() => {
          throw new Error('Send failed')
        })
      }
      
      const message = { type: 'test' as any, payload: { data: 'hello' }, timestamp: new Date().toISOString() }
      websocketService.send(message)
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error sending WebSocket message',
        expect.any(Error)
      )
      
      // Restore original send
      if (mockWebSocketInstance && originalSend) {
        mockWebSocketInstance.send = originalSend
      }
    })
  })

  describe('Subscription Management', () => {
    beforeEach(async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
    })

    it('should subscribe to message types', () => {
      const callback = vi.fn()
      const subscriptionId = websocketService.subscribe('energy-data', callback)
      
      expect(subscriptionId).toBeTruthy()
      expect(subscriptionId).toContain('energy-data')
    })

    it('should receive subscribed messages', () => {
      const callback = vi.fn()
      websocketService.subscribe('energy-data', callback)
      
      const testMessage = { type: 'energy-data', payload: { consumption: 100 } }
      mockWebSocketInstance?.simulateMessage(testMessage)
      
      expect(callback).toHaveBeenCalledWith({ consumption: 100 })
    })

    it('should not receive unsubscribed messages', () => {
      const callback = vi.fn()
      websocketService.subscribe('energy-data', callback)
      
      const testMessage = { type: 'other-data', payload: { data: 'test' } }
      mockWebSocketInstance?.simulateMessage(testMessage)
      
      expect(callback).not.toHaveBeenCalled()
    })

    it('should unsubscribe correctly', () => {
      const callback = vi.fn()
      const subscriptionId = websocketService.subscribe('energy-data', callback)
      
      websocketService.unsubscribe(subscriptionId)
      
      const testMessage = { type: 'energy-data', payload: { consumption: 100 } }
      mockWebSocketInstance?.simulateMessage(testMessage)
      
      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle multiple subscribers for same message type', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      websocketService.subscribe('energy-data', callback1)
      websocketService.subscribe('energy-data', callback2)
      
      const testMessage = { type: 'energy-data', payload: { consumption: 100 } }
      mockWebSocketInstance?.simulateMessage(testMessage)
      
      expect(callback1).toHaveBeenCalledWith({ consumption: 100 })
      expect(callback2).toHaveBeenCalledWith({ consumption: 100 })
    })

    it('should handle subscription callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error')
      })
      const normalCallback = vi.fn()
      
      websocketService.subscribe('energy-data', errorCallback)
      websocketService.subscribe('energy-data', normalCallback)
      
      const testMessage = { type: 'energy-data', payload: { consumption: 100 } }
      mockWebSocketInstance?.simulateMessage(testMessage)
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in subscription callback',
        expect.any(Error)
      )
      expect(normalCallback).toHaveBeenCalledWith({ consumption: 100 })
    })
  })

  describe('Connection Status Monitoring', () => {
    it('should notify connection listeners on connect', async () => {
      const listener = vi.fn()
      const unsubscribe = websocketService.onConnectionChange(listener)
      
      // Should immediately call with current status (false)
      expect(listener).toHaveBeenCalledWith(false)
      
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      expect(listener).toHaveBeenCalledWith(true)
      
      unsubscribe()
    })

    it('should notify connection listeners on disconnect', async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      const listener = vi.fn()
      websocketService.onConnectionChange(listener)
      
      // Should immediately call with current status (true)
      expect(listener).toHaveBeenCalledWith(true)
      
      websocketService.disconnect()
      
      expect(listener).toHaveBeenCalledWith(false)
    })

    it('should handle connection listener errors gracefully', async () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error')
      })
      
      websocketService.onConnectionChange(errorListener)
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in connection listener',
        expect.any(Error)
      )
    })

    it('should unsubscribe connection listeners', async () => {
      const listener = vi.fn()
      const unsubscribe = websocketService.onConnectionChange(listener)
      
      unsubscribe()
      
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      // Should only have been called once (immediately on subscribe)
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('Connection State Properties', () => {
    it('should return correct connection state when disconnected', () => {
      expect(websocketService.connectionState).toBe('disconnected')
    })

    it('should return correct connection state when connecting', () => {
      websocketService.connect()
      expect(websocketService.connectionState).toBe('connecting')
    })

    it('should return correct connection state when connected', async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      expect(websocketService.connectionState).toBe('connected')
    })

    it('should return correct isConnected status', async () => {
      expect(websocketService.isConnected).toBe(false)
      
      websocketService.connect()
      expect(websocketService.isConnected).toBe(false) // Still connecting
      
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      expect(websocketService.isConnected).toBe(true)
      
      websocketService.disconnect()
      expect(websocketService.isConnected).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle WebSocket creation errors', () => {
      // Mock WebSocket constructor to throw
      const originalWebSocket = global.WebSocket
      global.WebSocket = vi.fn(() => {
        throw new Error('WebSocket creation failed')
      }) as any
      
      websocketService.connect()
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error creating WebSocket connection',
        expect.any(Error)
      )
      
      // Restore original WebSocket
      global.WebSocket = originalWebSocket
    })

    it('should handle WebSocket error events', async () => {
      websocketService.connect()
      await act(async () => {
        await vi.runOnlyPendingTimersAsync()
      })
      
      mockWebSocketInstance?.simulateError()
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'WebSocket error',
        expect.objectContaining({ error: expect.any(String) })
      )
    })
  })
})