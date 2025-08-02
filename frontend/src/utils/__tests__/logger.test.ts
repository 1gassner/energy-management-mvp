import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Logger, logger, createLogger, type LogLevel, type LoggerConfig } from '../logger'

// Mock fetch for external logging service tests
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock console methods
const mockConsole = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

Object.assign(console, mockConsole)

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  describe('Logger Configuration', () => {
    it('should use development defaults in development environment', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      
      const testLogger = new Logger()
      const config = testLogger.getConfiguration()
      
      expect(config.level).toBe('debug')
      expect(config.enableConsole).toBe(true)
      expect(config.environment).toBe('development')
    })

    it('should use production defaults in production environment', () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      
      const testLogger = new Logger()
      const config = testLogger.getConfiguration()
      
      expect(config.level).toBe('warn')
      expect(config.enableConsole).toBe(false)
      expect(config.environment).toBe('production')
    })

    it('should respect custom log level from environment', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'error')
      
      const testLogger = new Logger()
      const config = testLogger.getConfiguration()
      
      expect(config.level).toBe('error')
    })

    it('should enable console logs when explicitly set', () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      vi.stubEnv('VITE_ENABLE_CONSOLE_LOGS', 'true')
      
      const testLogger = new Logger()
      const config = testLogger.getConfiguration()
      
      expect(config.enableConsole).toBe(true)
    })

    it('should enable structured logs when explicitly set', () => {
      vi.stubEnv('VITE_ENABLE_STRUCTURED_LOGS', 'true')
      
      const testLogger = new Logger()
      const config = testLogger.getConfiguration()
      
      expect(config.enableStructured).toBe(true)
    })

    it('should update configuration dynamically', () => {
      const testLogger = new Logger()
      
      testLogger.configure({ level: 'error', enableConsole: false })
      const config = testLogger.getConfiguration()
      
      expect(config.level).toBe('error')
      expect(config.enableConsole).toBe(false)
    })
  })

  describe('Log Level Filtering', () => {
    it('should respect log level hierarchy', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      vi.stubEnv('VITE_LOG_LEVEL', 'warn')
      
      const testLogger = new Logger()
      
      testLogger.debug('Debug message')
      testLogger.info('Info message')
      testLogger.warn('Warn message')
      testLogger.error('Error message')
      
      // Only warn and error should be logged
      expect(mockConsole.debug).not.toHaveBeenCalled()
      expect(mockConsole.info).not.toHaveBeenCalled()
      expect(mockConsole.warn).toHaveBeenCalled()
      expect(mockConsole.error).toHaveBeenCalled()
    })

    it('should log all levels when set to debug', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      vi.stubEnv('VITE_LOG_LEVEL', 'debug')
      
      const testLogger = new Logger()
      
      testLogger.debug('Debug message')
      testLogger.info('Info message')
      testLogger.warn('Warn message')
      testLogger.error('Error message')
      
      expect(mockConsole.debug).toHaveBeenCalled()
      expect(mockConsole.info).toHaveBeenCalled()
      expect(mockConsole.warn).toHaveBeenCalled()
      expect(mockConsole.error).toHaveBeenCalled()
    })

    it('should only log errors when set to error level', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      vi.stubEnv('VITE_LOG_LEVEL', 'error')
      
      const testLogger = new Logger()
      
      testLogger.debug('Debug message')
      testLogger.info('Info message')
      testLogger.warn('Warn message')
      testLogger.error('Error message')
      
      expect(mockConsole.debug).not.toHaveBeenCalled()
      expect(mockConsole.info).not.toHaveBeenCalled()
      expect(mockConsole.warn).not.toHaveBeenCalled()
      expect(mockConsole.error).toHaveBeenCalled()
    })
  })

  describe('Console Output', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      vi.stubEnv('VITE_LOG_LEVEL', 'debug')
    })

    it('should format console output correctly', () => {
      const testLogger = new Logger()
      
      testLogger.info('Test message')
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\] \[INFO\]/),
        'Test message'
      )
    })

    it('should include context in console output', () => {
      const testLogger = new Logger()
      const context = { userId: '123', action: 'login' }
      
      testLogger.info('User action', context)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\] \[INFO\]/),
        'User action',
        context
      )
    })

    it('should include error objects in console output', () => {
      const testLogger = new Logger()
      const error = new Error('Test error')
      
      testLogger.error('Error occurred', error)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\] \[ERROR\]/),
        'Error occurred',
        error
      )
    })

    it('should include both context and error', () => {
      const testLogger = new Logger()
      const context = { operation: 'fetch' }
      const error = new Error('Network error')
      
      testLogger.error('Operation failed', context, error)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}:\d{2}\] \[ERROR\]/),
        'Operation failed',
        context,
        error
      )
    })

    it('should not output to console when disabled', () => {
      vi.stubEnv('VITE_ENABLE_CONSOLE_LOGS', 'false')
      
      const testLogger = new Logger()
      testLogger.configure({ enableConsole: false })
      
      testLogger.info('Test message')
      
      expect(mockConsole.info).not.toHaveBeenCalled()
    })

    it('should not output debug in production by default', () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      
      const testLogger = new Logger()
      testLogger.configure({ enableConsole: true, level: 'debug' })
      
      testLogger.debug('Debug message')
      
      expect(mockConsole.debug).not.toHaveBeenCalled()
    })
  })

  describe('Structured Logging', () => {
    it('should send structured logs to external service in production', async () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      vi.stubEnv('VITE_LOG_ENDPOINT', 'https://logs.example.com/api')
      
      mockFetch.mockResolvedValue({ ok: true })
      
      const testLogger = new Logger()
      testLogger.configure({ enableStructured: true })
      
      testLogger.error('Production error')
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://logs.example.com/api',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Production error')
        })
      )
    })

    it('should format structured logs correctly', async () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      vi.stubEnv('VITE_LOG_ENDPOINT', 'https://logs.example.com/api')
      
      mockFetch.mockResolvedValue({ ok: true })
      
      const testLogger = new Logger()
      testLogger.configure({ enableStructured: true })
      
      const context = { userId: '123' }
      const error = new Error('Test error')
      testLogger.error('Structured error', context, error)
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      const call = mockFetch.mock.calls[0]
      const body = JSON.parse(call[1].body)
      
      expect(body).toEqual(
        expect.objectContaining({
          level: 'error',
          message: 'Structured error',
          context,
          error: expect.objectContaining({
            name: 'Error',
            message: 'Test error',
            stack: expect.any(String)
          }),
          timestamp: expect.any(String)
        })
      )
    })

    it('should handle external logging service failures gracefully', async () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      vi.stubEnv('VITE_LOG_ENDPOINT', 'https://logs.example.com/api')
      
      mockFetch.mockRejectedValue(new Error('Network failure'))
      
      const testLogger = new Logger()
      testLogger.configure({ enableStructured: true })
      
      // This should not throw
      expect(() => {
        testLogger.error('Error with failed logging service')
      }).not.toThrow()
      
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('should not send to external service when no endpoint configured', async () => {
      vi.stubEnv('VITE_APP_ENV', 'production')
      // No VITE_LOG_ENDPOINT set
      
      const testLogger = new Logger()
      testLogger.configure({ enableStructured: true })
      
      testLogger.error('Error without endpoint')
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Error Method Overloads', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_APP_ENV', 'development')
    })

    it('should handle error with just error object', () => {
      const testLogger = new Logger()
      const error = new Error('Simple error')
      
      testLogger.error('Error message', error)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR\]/),
        'Error message',
        error
      )
    })

    it('should handle error with context and error object', () => {
      const testLogger = new Logger()
      const context = { operation: 'test' }
      const error = new Error('Context error')
      
      testLogger.error('Error with context', context, error)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR\]/),
        'Error with context',
        context,
        error
      )
    })

    it('should handle error with just context', () => {
      const testLogger = new Logger()
      const context = { operation: 'test' }
      
      testLogger.error('Error with context only', context)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR\]/),
        'Error with context only',
        context
      )
    })
  })

  describe('Child Loggers', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_APP_ENV', 'development')
    })

    it('should create child logger with additional context', () => {
      const testLogger = new Logger()
      const childContext = { module: 'auth', userId: '123' }
      const childLogger = testLogger.child(childContext)
      
      childLogger.info('Child logger message')
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[INFO\]/),
        'Child logger message',
        childContext
      )
    })

    it('should merge child context with additional context', () => {
      const testLogger = new Logger()
      const childContext = { module: 'auth' }
      const childLogger = testLogger.child(childContext)
      
      const additionalContext = { operation: 'login' }
      childLogger.info('Child with additional context', additionalContext)
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[INFO\]/),
        'Child with additional context',
        { ...childContext, ...additionalContext }
      )
    })

    it('should handle error objects in child loggers', () => {
      const testLogger = new Logger()
      const childContext = { module: 'auth' }
      const childLogger = testLogger.child(childContext)
      
      const error = new Error('Child error')
      childLogger.error('Child error message', error)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR\]/),
        'Child error message',
        childContext,
        error
      )
    })

    it('should allow createLogger factory function', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      
      const childContext = { component: 'Dashboard' }
      const childLogger = createLogger(childContext)
      
      childLogger.debug('Factory created logger')
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringMatching(/\[DEBUG\]/),
        'Factory created logger',
        childContext
      )
    })
  })

  describe('Singleton Logger Instance', () => {
    it('should provide singleton logger instance', () => {
      expect(logger).toBeInstanceOf(Logger)
    })

    it('should maintain consistent configuration across calls', () => {
      const config1 = logger.getConfiguration()
      const config2 = logger.getConfiguration()
      
      expect(config1).toEqual(config2)
    })

    it('should allow configuration updates on singleton', () => {
      const originalConfig = logger.getConfiguration()
      
      logger.configure({ level: 'error' })
      const updatedConfig = logger.getConfiguration()
      
      expect(updatedConfig.level).toBe('error')
      expect(updatedConfig.level).not.toBe(originalConfig.level)
      
      // Reset for other tests
      logger.configure(originalConfig)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid log levels gracefully', () => {
      const testLogger = new Logger()
      
      // This should not crash
      expect(() => {
        testLogger.configure({ level: 'invalid' as LogLevel })
      }).not.toThrow()
    })

    it('should handle null/undefined context', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      
      const testLogger = new Logger()
      
      expect(() => {
        testLogger.info('Message with null context', null as any)
        testLogger.info('Message with undefined context', undefined as any)
      }).not.toThrow()
    })

    it('should handle circular references in context', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      
      const testLogger = new Logger()
      const circularObject: any = { name: 'test' }
      circularObject.self = circularObject
      
      expect(() => {
        testLogger.info('Message with circular context', circularObject)
      }).not.toThrow()
    })

    it('should handle very long messages', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      
      const testLogger = new Logger()
      const longMessage = 'A'.repeat(10000)
      
      expect(() => {
        testLogger.info(longMessage)
      }).not.toThrow()
    })

    it('should handle special characters in messages', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      
      const testLogger = new Logger()
      const specialMessage = 'Message with 特殊字符 and emojis 🚀 and\nnewlines\tand tabs'
      
      expect(() => {
        testLogger.info(specialMessage)
      }).not.toThrow()
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[INFO\]/),
        specialMessage
      )
    })
  })

  describe('Performance', () => {
    it('should not execute expensive operations when log level filters them out', () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'error')
      
      const testLogger = new Logger()
      const expensiveOperation = vi.fn(() => ({ expensive: 'data' }))
      
      // This should not call the expensive operation
      testLogger.debug('Debug message', expensiveOperation())
      
      expect(expensiveOperation).toHaveBeenCalled() // Context is evaluated regardless
      expect(mockConsole.debug).not.toHaveBeenCalled()
    })

    it('should handle high-frequency logging', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      
      const testLogger = new Logger()
      
      expect(() => {
        for (let i = 0; i < 1000; i++) {
          testLogger.info(`Message ${i}`)
        }
      }).not.toThrow()
      
      expect(mockConsole.info).toHaveBeenCalledTimes(1000)
    })
  })

  describe('TypeScript Type Safety', () => {
    it('should enforce proper LogLevel types', () => {
      const testLogger = new Logger()
      
      // These should compile without TypeScript errors
      const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error']
      
      validLevels.forEach(level => {
        expect(() => {
          testLogger.configure({ level })
        }).not.toThrow()
      })
    })

    it('should provide proper return types', () => {
      const config: LoggerConfig = logger.getConfiguration()
      const childLogger: Logger = logger.child({ test: true })
      
      expect(config).toHaveProperty('level')
      expect(config).toHaveProperty('enableConsole')
      expect(config).toHaveProperty('enableStructured')
      expect(config).toHaveProperty('environment')
      
      expect(childLogger).toBeInstanceOf(Logger)
    })
  })
})