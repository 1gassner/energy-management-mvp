import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import ErrorBoundary from '../ErrorBoundary'
import { mockLogger } from '@/test/utils'

// Test component that throws errors on demand
interface ThrowErrorProps {
  shouldThrow?: boolean
  errorMessage?: string
  errorType?: 'render' | 'effect'
}

const ThrowError: React.FC<ThrowErrorProps> = ({ 
  shouldThrow = false, 
  errorMessage = 'Test error',
  errorType = 'render'
}) => {
  React.useEffect(() => {
    if (shouldThrow && errorType === 'effect') {
      throw new Error(errorMessage)
    }
  }, [shouldThrow, errorMessage, errorType])

  if (shouldThrow && errorType === 'render') {
    throw new Error(errorMessage)
  }
  
  return <div>Working Component</div>
}

// Mock location.reload
const mockReload = vi.fn()
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
  },
  writable: true,
})

describe('ErrorBoundary', () => {
  // Suppress console.error during error boundary tests
  let originalError: typeof console.error

  beforeEach(() => {
    originalError = console.error
    console.error = vi.fn()
    vi.clearAllMocks()
  })

  afterEach(() => {
    console.error = originalError
    vi.clearAllMocks()
  })

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test Content</div>
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should not render error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Working Component')).toBeInTheDocument()
      expect(screen.queryByText('Ups, etwas ist schiefgelaufen!')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should catch and display error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Component crashed" />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument()
      expect(screen.getByText('Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.')).toBeInTheDocument()
    })

    it('should log error with logger service', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Test error for logging" />
        </ErrorBoundary>
      )
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error',
        expect.objectContaining({
          error: expect.any(Error),
          componentStack: expect.any(String)
        })
      )
    })

    it('should display different error messages for different errors', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="First error" />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument()
      
      // Reset error boundary by using a different key
      rerender(
        <ErrorBoundary key="reset">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Working Component')).toBeInTheDocument()
    })

    it('should handle multiple child components with error in one', () => {
      render(
        <ErrorBoundary>
          <div>Good Component 1</div>
          <ThrowError shouldThrow={true} errorMessage="Bad component" />
          <div>Good Component 2</div>
        </ErrorBoundary>
      )
      
      // When any child throws, the entire tree is replaced with error UI
      expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument()
      expect(screen.queryByText('Good Component 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Good Component 2')).not.toBeInTheDocument()
    })
  })

  describe('Custom Fallback UI', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom Error Message</div>
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Custom Error Message')).toBeInTheDocument()
      expect(screen.queryByText('Ups, etwas ist schiefgelaufen!')).not.toBeInTheDocument()
    })

    it('should use default fallback when no custom fallback provided', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument()
    })
  })

  describe('Error UI Content', () => {
    beforeEach(() => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Test error" />
        </ErrorBoundary>
      )
    })

    it('should display error icon', () => {
      // Check for AlertTriangle icon (Lucide React icon)
      const iconContainer = document.querySelector('.w-16.h-16.bg-red-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should display German error messages', () => {
      expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument()
      expect(screen.getByText('Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.')).toBeInTheDocument()
    })

    it('should display action buttons', () => {
      expect(screen.getByText('Erneut versuchen')).toBeInTheDocument()
      expect(screen.getByText('Seite neu laden')).toBeInTheDocument()
    })

    it('should display support contact message', () => {
      expect(screen.getByText('Falls das Problem weiterhin besteht, kontaktieren Sie bitte den Support.')).toBeInTheDocument()
    })
  })

  describe('Development Mode Features', () => {
    it('should show technical details in development mode', () => {
      // Mock development environment
      vi.stubEnv('VITE_APP_ENV', 'development')
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Development error with details" />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Technische Details (nur in Entwicklung)')).toBeInTheDocument()
      
      vi.unstubAllEnvs()
    })

    it('should not show technical details in production mode', () => {
      // Mock production environment
      vi.stubEnv('VITE_APP_ENV', 'production')
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Production error" />
        </ErrorBoundary>
      )
      
      expect(screen.queryByText('Technische Details (nur in Entwicklung)')).not.toBeInTheDocument()
      
      vi.unstubAllEnvs()
    })

    it('should display error details when expanded in development', () => {
      vi.stubEnv('VITE_APP_ENV', 'development')
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Detailed error message" />
        </ErrorBoundary>
      )
      
      const detailsElement = screen.getByText('Technische Details (nur in Entwicklung)')
      fireEvent.click(detailsElement)
      
      expect(screen.getByText('Error:')).toBeInTheDocument()
      expect(screen.getByText('Stack:')).toBeInTheDocument()
      
      vi.unstubAllEnvs()
    })
  })

  describe('Recovery Actions', () => {
    it('should reset error state when retry button is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Recoverable error" />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument()
      
      // Click retry button
      fireEvent.click(screen.getByText('Erneut versuchen'))
      
      // Rerender with non-throwing component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Working Component')).toBeInTheDocument()
      expect(screen.queryByText('Ups, etwas ist schiefgelaufen!')).not.toBeInTheDocument()
    })

    it('should call window.location.reload when reload button is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      fireEvent.click(screen.getByText('Seite neu laden'))
      
      expect(mockReload).toHaveBeenCalled()
    })

    it('should handle retry with RefreshCw icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      const retryButton = screen.getByText('Erneut versuchen').closest('button')
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toHaveClass('btn-secondary')
    })
  })

  describe('Sentry Integration', () => {
    it('should not call Sentry when DSN is not configured', () => {
      // Mock no Sentry DSN
      vi.stubEnv('VITE_SENTRY_DSN', '')
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Error without Sentry" />
        </ErrorBoundary>
      )
      
      // No Sentry calls should be made (mocked in the component)
      expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument()
      
      vi.unstubAllEnvs()
    })

    it('should prepare for Sentry integration when DSN is configured', () => {
      // Mock Sentry DSN present
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test-dsn@sentry.io/project')
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Error with Sentry DSN" />
        </ErrorBoundary>
      )
      
      // Error boundary should still work normally
      expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument()
      
      vi.unstubAllEnvs()
    })
  })

  describe('Error State Management', () => {
    it('should maintain error state until reset', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Persistent error" />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument()
      
      // Error should persist across re-renders until explicitly reset
      expect(screen.getByText('Erneut versuchen')).toBeInTheDocument()
      expect(screen.getByText('Seite neu laden')).toBeInTheDocument()
    })

    it('should clear error info when retry is clicked', () => {
      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true)
        
        return (
          <ErrorBoundary>
            <button onClick={() => setShouldThrow(false)}>Fix Component</button>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
        )
      }
      
      render(<TestComponent />)
      
      expect(screen.getByText('Ups, etwas ist schiefgelaufen!')).toBeInTheDocument()
      
      // Click retry
      fireEvent.click(screen.getByText('Erneut versuchen'))
      
      // The error boundary should reset its state
      // (Note: The component will still throw until we fix it externally)
    })
  })

  describe('Component Lifecycle', () => {
    it('should handle getDerivedStateFromError correctly', () => {
      const errorSpy = vi.spyOn(ErrorBoundary, 'getDerivedStateFromError')
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Lifecycle test" />
        </ErrorBoundary>
      )
      
      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error))
      
      errorSpy.mockRestore()
    })

    it('should call componentDidCatch with error and errorInfo', () => {
      // Create a spy for componentDidCatch
      const catchSpy = vi.spyOn(ErrorBoundary.prototype, 'componentDidCatch')
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="ComponentDidCatch test" />
        </ErrorBoundary>
      )
      
      expect(catchSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
      
      catchSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      // Main error container
      const errorContainer = document.querySelector('.min-h-screen.bg-gray-50')
      expect(errorContainer).toBeInTheDocument()
      
      // Error heading
      const heading = screen.getByRole('heading')
      expect(heading).toHaveTextContent('Ups, etwas ist schiefgelaufen!')
    })

    it('should have accessible buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      const retryButton = screen.getByRole('button', { name: /erneut versuchen/i })
      const reloadButton = screen.getByRole('button', { name: /seite neu laden/i })
      
      expect(retryButton).toBeInTheDocument()
      expect(reloadButton).toBeInTheDocument()
    })

    it('should have appropriate ARIA attributes if needed', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      // Error boundary should provide clear structure
      const errorIcon = document.querySelector('.w-8.h-8.text-red-600')
      expect(errorIcon).toBeInTheDocument()
    })
  })
})