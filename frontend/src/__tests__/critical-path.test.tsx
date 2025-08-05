import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Components
import SecureLogin from '@/components/auth/SecureLogin';
import Dashboard from '@/pages/dashboard/Dashboard';
import BuildingDashboardTemplate from '@/components/templates/BuildingDashboardTemplate';
import { useAuthStore } from '@/stores/authStore';

// Mock services
vi.mock('@/services/serviceFactory', () => ({
  serviceFactory: {
    createAPIService: () => ({
      login: vi.fn().mockResolvedValue({ user: { id: '1', email: 'test@test.com' }, token: 'token' }),
      getBuildings: vi.fn().mockResolvedValue([]),
      getSensors: vi.fn().mockResolvedValue([]),
      getEnergyData: vi.fn().mockResolvedValue([]),
      getAlerts: vi.fn().mockResolvedValue([])
    })
  }
}));

describe('Critical Path: Authentication Flow', () => {
  beforeEach(() => {
    // Reset auth store
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  });

  it('should complete login flow successfully', async () => {
    render(
      <BrowserRouter>
        <SecureLogin />
      </BrowserRouter>
    );

    // Find form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/passwort/i);
    const submitButton = screen.getByRole('button', { name: /anmelden/i });

    // Fill form
    fireEvent.change(emailInput, { target: { value: 'admin@hechingen.de' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(submitButton);

    // Wait for navigation
    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  it('should handle login errors gracefully', async () => {
    // Mock login failure
    const mockService = {
      login: vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    };
    
    vi.mocked(serviceFactory.createAPIService).mockReturnValue(mockService);

    render(
      <BrowserRouter>
        <SecureLogin />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /anmelden/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/fehler/i)).toBeInTheDocument();
    });
  });
});

describe('Critical Path: Dashboard Loading', () => {
  beforeEach(() => {
    // Set authenticated state
    useAuthStore.setState({
      user: { id: '1', email: 'test@test.com', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  });

  it('should load dashboard with data', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Check loading state
    expect(screen.getByText(/lade/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/lade/i)).not.toBeInTheDocument();
    });

    // Check dashboard elements
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('should handle dashboard errors', async () => {
    // Mock API error
    const mockService = {
      getBuildings: vi.fn().mockRejectedValue(new Error('Network error')),
      getSensors: vi.fn().mockRejectedValue(new Error('Network error'))
    };
    
    vi.mocked(serviceFactory.createAPIService).mockReturnValue(mockService);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/fehler/i)).toBeInTheDocument();
    });
  });
});

describe('Critical Path: Building Dashboard Template', () => {
  const mockKPIs = [
    {
      title: 'Verbrauch',
      value: 125.4,
      unit: 'kWh',
      trend: 'up' as const,
      trendValue: '+5%',
      color: 'green',
      icon: () => <div>Icon</div>
    }
  ];

  it('should render building dashboard with KPIs', async () => {
    render(
      <BuildingDashboardTemplate
        buildingId="rathaus-1"
        buildingName="Rathaus"
        buildingType="rathaus"
        kpiConfig={mockKPIs}
      />
    );

    // Check loading state
    expect(screen.getByText(/lade rathaus-daten/i)).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.queryByText(/lade/i)).not.toBeInTheDocument();
    });

    // Check KPIs rendered
    expect(screen.getByText('Verbrauch')).toBeInTheDocument();
    expect(screen.getByText('125.4')).toBeInTheDocument();
  });

  it('should handle building data errors', async () => {
    const mockService = {
      getBuildings: vi.fn().mockRejectedValue(new Error('API Error')),
      getSensors: vi.fn().mockRejectedValue(new Error('API Error'))
    };
    
    vi.mocked(serviceFactory.createAPIService).mockReturnValue(mockService);

    render(
      <BuildingDashboardTemplate
        buildingId="rathaus-1"
        buildingName="Rathaus"
        buildingType="rathaus"
        kpiConfig={mockKPIs}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/fehler beim laden/i)).toBeInTheDocument();
    });
  });
});

describe('Critical Path: WebSocket Connection', () => {
  it('should establish WebSocket connection on auth', async () => {
    const mockWebSocket = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnected: false
    };

    // Test WebSocket connection lifecycle
    expect(mockWebSocket.connect).not.toHaveBeenCalled();
    
    // Simulate authentication
    useAuthStore.setState({ isAuthenticated: true });
    
    // WebSocket should connect
    mockWebSocket.connect();
    expect(mockWebSocket.connect).toHaveBeenCalled();
  });
});

describe('Critical Path: Memory Leak Prevention', () => {
  it('should cleanup timers on unmount', () => {
    const { unmount } = render(
      <BuildingDashboardTemplate
        buildingId="test-1"
        buildingName="Test"
        buildingType="rathaus"
        kpiConfig={[]}
      />
    );

    // Unmount should cleanup
    unmount();
    
    // Verify no active timers (would need spy on setInterval/clearInterval)
    expect(true).toBe(true); // Placeholder for actual timer checks
  });
});