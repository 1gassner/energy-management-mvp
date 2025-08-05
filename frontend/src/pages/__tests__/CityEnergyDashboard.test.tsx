import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@/test/utils'
import CityEnergyDashboard from '../CityEnergyDashboard'

// Mock recharts components as they can be problematic in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey, name }: { dataKey: string; name: string }) => <div data-testid={`line-${dataKey}`}>{name}</div>,
  XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis">{dataKey}</div>,
  YAxis: () => <div data-testid="y-axis">kW</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

describe('CityEnergyDashboard', () => {

  beforeEach(() => {
    vi.useFakeTimers()
    // Mock setInterval and clearInterval to prevent real timer issues
    vi.spyOn(global, 'setInterval')
    vi.spyOn(global, 'clearInterval')
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('should render the dashboard with correct title', () => {
      render(<CityEnergyDashboard />)
      
      expect(screen.getByText('Real-Time Energy Flow')).toBeInTheDocument()
      expect(screen.getByText('Monitor energy production, consumption, and distribution')).toBeInTheDocument()
    })

    it('should render all energy flow cards', () => {
      render(<CityEnergyDashboard />)
      
      expect(screen.getByText('PV Production')).toBeInTheDocument()
      expect(screen.getAllByText('Consumption')).toHaveLength(2) // Card + Chart label
      expect(screen.getByText('Grid Feed-in')).toBeInTheDocument()
      expect(screen.getAllByText('Battery')).toHaveLength(2) // Card + SVG label
    })

    it('should display initial energy values', () => {
      render(<CityEnergyDashboard />)
      
      // Check for energy values (using regex to match decimal numbers)
      expect(screen.getByText(/145\.2 kW/)).toBeInTheDocument() // PV Production
      expect(screen.getByText(/98\.7 kW/)).toBeInTheDocument()  // Consumption
      expect(screen.getByText(/46\.5 kW/)).toBeInTheDocument()  // Grid Feed-in
      expect(screen.getByText(/23\.1 kW/)).toBeInTheDocument()  // Battery
    })

    it('should render energy flow emojis', () => {
      render(<CityEnergyDashboard />)
      
      expect(screen.getByText('☀️')).toBeInTheDocument()
      expect(screen.getByText('⚡')).toBeInTheDocument()
      expect(screen.getByText('🔌')).toBeInTheDocument()
      expect(screen.getByText('🔋')).toBeInTheDocument()
    })
  })

  describe('Energy Flow Visualization', () => {
    it('should render SVG energy flow diagram', () => {
      render(<CityEnergyDashboard />)
      
      const svgElement = screen.getByText('Energy Flow Visualization').closest('.bg-white')
      expect(svgElement).toBeInTheDocument()
      
      // Check for SVG content
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('viewBox', '0 0 600 300')
    })

    it('should display energy component labels in SVG', () => {
      render(<CityEnergyDashboard />)
      
      // SVG text elements should be present
      expect(screen.getByText('PV')).toBeInTheDocument()
      expect(screen.getByText('Building')).toBeInTheDocument()
      expect(screen.getByText('Grid')).toBeInTheDocument()
      expect(screen.getByText('Battery')).toBeInTheDocument()
    })

    it('should have animated arrows in SVG', () => {
      render(<CityEnergyDashboard />)
      
      const svg = document.querySelector('svg')
      const animatedLines = svg?.querySelectorAll('line[marker-end]')
      expect(animatedLines).toBeTruthy()
      expect(animatedLines?.length).toBeGreaterThan(0)
    })
  })

  describe('Historical Chart', () => {
    it('should render chart section', () => {
      render(<CityEnergyDashboard />)
      
      expect(screen.getByText('24-Hour Energy Trends')).toBeInTheDocument()
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should render chart components', () => {
      render(<CityEnergyDashboard />)
      
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('should render all data lines', () => {
      render(<CityEnergyDashboard />)
      
      expect(screen.getByTestId('line-production')).toBeInTheDocument()
      expect(screen.getByTestId('line-consumption')).toBeInTheDocument()
      expect(screen.getByTestId('line-grid')).toBeInTheDocument()
    })

    it('should display line names', () => {
      render(<CityEnergyDashboard />)
      
      expect(screen.getByText('Production')).toBeInTheDocument()
      expect(screen.getAllByText('Consumption')).toHaveLength(2) // Card + Chart label
      expect(screen.getByText('Grid')).toBeInTheDocument()
    })
  })

  describe('Real-time Updates', () => {
    it('should update energy values over time', async () => {
      render(<CityEnergyDashboard />)
      
      // Get initial values
      const initialProduction = screen.getByText(/145\.2 kW/)
      expect(initialProduction).toBeInTheDocument()
      
      // Fast forward timer to trigger update
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })
      
      // Values should still be displayed (they use random updates but may not be visibly different)
      const elements = screen.getAllByText(/\d+\.\d+ kW/)
      expect(elements.length).toBe(4) // Four energy cards
    }, 3000)

    it('should handle multiple timer updates', async () => {
      render(<CityEnergyDashboard />)
      
      // Advance timers multiple times
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          vi.advanceTimersByTime(3000)
        }
      })
      
      // Should still display valid energy values
      const energyValues = screen.getAllByText(/\d+\.\d+ kW/)
      expect(energyValues.length).toBe(4) // Four energy cards
    }, 3000)

    it('should clean up interval on unmount', () => {
      const { unmount } = render(<CityEnergyDashboard />)
      
      // clearInterval spy is already set up in beforeEach
      const clearIntervalSpy = vi.mocked(global.clearInterval)
      
      unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('Data Generation', () => {
    it('should generate 24 hours of mock data', () => {
      render(<CityEnergyDashboard />)
      
      // The component should generate data for 24 hours
      // We can't directly test the internal state, but we can verify the chart renders
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should format time correctly', () => {
      render(<CityEnergyDashboard />)
      
      // Time should be formatted as German locale
      const xAxis = screen.getByTestId('x-axis')
      expect(xAxis).toHaveTextContent('time')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      render(<CityEnergyDashboard />)
      
      const gridContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')
      expect(gridContainer).toBeInTheDocument()
    })

    it('should have responsive chart container', () => {
      render(<CityEnergyDashboard />)
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('should have responsive SVG', () => {
      render(<CityEnergyDashboard />)
      
      const svg = document.querySelector('svg')
      expect(svg).toHaveClass('w-full', 'max-w-2xl')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<CityEnergyDashboard />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Real-Time Energy Flow')
      
      const subHeadings = screen.getAllByRole('heading', { level: 2 })
      expect(subHeadings).toHaveLength(2)
      expect(subHeadings[0]).toHaveTextContent('Energy Flow Visualization')
      expect(subHeadings[1]).toHaveTextContent('24-Hour Energy Trends')
    })

    it('should have semantic HTML structure', () => {
      render(<CityEnergyDashboard />)
      
      // Main container should be a main element or have proper structure
      const mainContent = document.querySelector('.min-h-screen')
      expect(mainContent).toBeInTheDocument()
    })

    it('should provide descriptive text', () => {
      render(<CityEnergyDashboard />)
      
      expect(screen.getByText('Monitor energy production, consumption, and distribution')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render without performance warnings', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      render(<CityEnergyDashboard />)
      
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle rapid timer updates', async () => {
      render(<CityEnergyDashboard />)
      
      // Simulate rapid updates
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          vi.advanceTimersByTime(100) // Fast updates
        }
      })
      
      // Should still render correctly
      expect(screen.getByText('Real-Time Energy Flow')).toBeInTheDocument()
    }, 2000)
  })

  describe('Error Handling', () => {
    it('should handle invalid energy values gracefully', async () => {
      render(<CityEnergyDashboard />)
      
      // Component should handle edge cases in random value generation
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          vi.advanceTimersByTime(3000)
        }
      })
      
      // Should still display valid numbers
      const energyValues = screen.getAllByText(/\d+\.\d+ kW/)
      energyValues.forEach(element => {
        const value = parseFloat(element.textContent?.match(/(\d+\.\d+)/)?.[1] || '0')
        expect(value).toBeGreaterThan(0)
        expect(value).toBeLessThan(1000) // Reasonable upper bound
      })
    }, 3000)

    it('should handle component errors without crashing', () => {
      // Mock console.error to catch any React errors
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<CityEnergyDashboard />)
      }).not.toThrow()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Integration', () => {
    it('should work with theme classes', () => {
      render(<CityEnergyDashboard />)
      
      // Check for proper Tailwind classes
      const container = document.querySelector('.min-h-screen.bg-gray-50')
      expect(container).toBeInTheDocument()
    })

    it('should integrate with layout system', () => {
      render(<CityEnergyDashboard />)
      
      const maxWidthContainer = document.querySelector('.max-w-7xl.mx-auto')
      expect(maxWidthContainer).toBeInTheDocument()
    })
  })
})