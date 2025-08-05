import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.BASE_URL || 'https://api.flowmind.app';

test.describe('Universal Authentication', () => {
  test('health check responds correctly', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.features).toBeDefined();
  });

  test('API info endpoint responds with correct structure', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/info`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.name).toBe('FlowMind Universal Backend');
    expect(data.frontends).toHaveLength(4);
    expect(data.frontends.map(f => f.name)).toEqual([
      'FlowMind AI Chat',
      'Quantum Swarm', 
      'Velocity Swarm',
      'CityPulse Energy Management'
    ]);
  });

  test('user registration works for all frontends', async ({ request }) => {
    const frontends = ['flowmind', 'quantum', 'velocity', 'citypulse'];
    
    for (const frontend of frontends) {
      const userData = {
        email: `test-${frontend}-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        name: `Test User ${frontend}`,
        frontend_source: frontend
      };

      const response = await request.post(`${BACKEND_URL}/api/v1/auth/register`, {
        data: userData,
        headers: {
          'Content-Type': 'application/json',
          'X-Frontend-Source': frontend
        }
      });

      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(userData.email);
      expect(data.user.permissions).toContain(frontend);
    }
  });

  test('user login works for all frontends', async ({ request }) => {
    const frontends = ['flowmind', 'quantum', 'velocity', 'citypulse'];
    
    for (const frontend of frontends) {
      // First register a user
      const userData = {
        email: `login-test-${frontend}-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        name: `Login Test User ${frontend}`,
        frontend_source: frontend
      };

      await request.post(`${BACKEND_URL}/api/v1/auth/register`, {
        data: userData,
        headers: {
          'Content-Type': 'application/json',
          'X-Frontend-Source': frontend
        }
      });

      // Now test login
      const loginResponse = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
        data: {
          email: userData.email,
          password: userData.password,
          frontend_source: frontend
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Frontend-Source': frontend
        }
      });

      expect(loginResponse.ok()).toBeTruthy();
      
      const loginData = await loginResponse.json();
      expect(loginData.token).toBeDefined();
      expect(loginData.user.email).toBe(userData.email);
    }
  });

  test('JWT token validation works', async ({ request }) => {
    // Register and login to get a token
    const userData = {
      email: `jwt-test-${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      name: 'JWT Test User',
      frontend_source: 'citypulse'
    };

    const registerResponse = await request.post(`${BACKEND_URL}/api/v1/auth/register`, {
      data: userData,
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'citypulse'
      }
    });

    const { token } = await registerResponse.json();

    // Test protected endpoint with valid token
    const protectedResponse = await request.get(`${BACKEND_URL}/api/v1/citypulse/buildings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    expect(protectedResponse.ok()).toBeTruthy();
  });

  test('CORS headers are set correctly', async ({ request }) => {
    const response = await request.options(`${BACKEND_URL}/api/v1/auth/login`, {
      headers: {
        'Origin': 'https://citypulse.flowmind.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });

    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
    expect(headers['access-control-allow-methods']).toBeDefined();
    expect(headers['access-control-allow-credentials']).toBe('true');
  });

  test('rate limiting is enforced', async ({ request }) => {
    const loginData = {
      email: 'rate-limit-test@example.com',
      password: 'wrong-password',
      frontend_source: 'citypulse'
    };

    // Make multiple rapid requests to trigger rate limiting
    const requests = Array(20).fill(null).map(() =>
      request.post(`${BACKEND_URL}/api/v1/auth/login`, {
        data: loginData,
        headers: {
          'Content-Type': 'application/json',
          'X-Frontend-Source': 'citypulse'
        }
      })
    );

    const responses = await Promise.all(requests);
    
    // Some requests should be rate limited (429 status)
    const rateLimitedResponses = responses.filter(r => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});