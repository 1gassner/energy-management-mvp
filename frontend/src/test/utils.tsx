import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { vi, Mock } from 'vitest'
import { User, AuthState } from '@/types'

// Enhanced mock auth store with better typing
export interface MockAuthStore extends AuthState {
  login: Mock
  logout: Mock
  register: Mock
  clearError: Mock
  updateUser: Mock
  refreshUser: Mock
}

export const createMockAuthStore = (overrides?: Partial<MockAuthStore>): MockAuthStore => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(true),
  logout: vi.fn(),
  register: vi.fn().mockResolvedValue(true),
  clearError: vi.fn(),
  updateUser: vi.fn(),
  refreshUser: vi.fn().mockResolvedValue(undefined),
  ...overrides,
})

// Default mock store instance
export const mockAuthStore = createMockAuthStore()

// Mock useAuthStore hook
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock WebSocket Service
export const createMockWebSocketService = () => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  send: vi.fn(),
  subscribe: vi.fn().mockReturnValue('mock-subscription-id'),
  unsubscribe: vi.fn(),
  onConnectionChange: vi.fn().mockReturnValue(() => {}),
  isConnected: false,
  connectionState: 'disconnected',
})

export const mockWebSocketService = createMockWebSocketService()

vi.mock('@/services/websocket.service', () => ({
  websocketService: mockWebSocketService,
}))

// Mock Logger
export const createMockLogger = () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn().mockReturnThis(),
  configure: vi.fn(),
  getConfiguration: vi.fn().mockReturnValue({
    level: 'debug',
    enableConsole: true,
    enableStructured: false,
    environment: 'test'
  }),
})

export const mockLogger = createMockLogger()

vi.mock('@/utils/logger', () => ({
  logger: mockLogger,
  createLogger: vi.fn().mockReturnValue(mockLogger),
}))

// Mock notification service
export const mockNotificationService = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}

vi.mock('@/services/notification.service', () => ({
  notificationService: mockNotificationService,
}))

// Test providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Helper functions for creating test data
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLogin: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

export const createMockAdminUser = (): User => 
  createMockUser({
    id: 'admin-user-id',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  })

// Helper to wait for async operations
export const waitFor = (callback: () => void | Promise<void>, timeout = 1000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now()
    
    const checkCondition = async () => {
      try {
        await callback()
        resolve()
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout after ${timeout}ms: ${error}`))
        } else {
          setTimeout(checkCondition, 10)
        }
      }
    }
    
    checkCondition()
  })
}

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

export * from '@testing-library/react'
export { customRender as render }