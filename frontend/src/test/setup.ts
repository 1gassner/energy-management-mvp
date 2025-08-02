import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
  // Clean up any remaining timers
  vi.clearAllTimers()
  // Clean up any remaining mocks
  vi.clearAllMocks()
})

// Mock timer functions for jsdom environment
vi.stubGlobal('setTimeout', vi.fn(setTimeout))
vi.stubGlobal('clearTimeout', vi.fn(clearTimeout))
vi.stubGlobal('setInterval', vi.fn(setInterval))
vi.stubGlobal('clearInterval', vi.fn(clearInterval))

// Mock WebSocket for tests
Object.defineProperty(window, 'WebSocket', {
  writable: true,
  value: class MockWebSocket {
    static CONNECTING = 0
    static OPEN = 1
    static CLOSING = 2
    static CLOSED = 3
    
    readyState = MockWebSocket.CONNECTING
    onopen: ((event: Event) => void) | null = null
    onclose: ((event: CloseEvent) => void) | null = null
    onmessage: ((event: MessageEvent) => void) | null = null
    onerror: ((event: Event) => void) | null = null
    
    constructor() {
      setTimeout(() => {
        this.readyState = MockWebSocket.OPEN
        if (this.onopen) this.onopen({} as Event)
      }, 0)
    }
    
    close() {
      this.readyState = MockWebSocket.CLOSED
      if (this.onclose) this.onclose({} as CloseEvent)
    }
    
    send() {
      // Mock send
    }
  }
})

// Mock WebSocket constants
Object.defineProperty(window, 'WebSocket', {
  value: Object.assign(window.WebSocket, {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
  })
})

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3001/api',
    VITE_WS_URL: 'ws://localhost:3001',
    VITE_APP_ENV: 'test'
  }
})