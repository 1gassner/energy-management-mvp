import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.BASE_URL || 'https://api.flowmind.app';

test.describe('CityPulse Energy Management API', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Create test user for CityPulse
    const userData = {
      email: `citypulse-test-${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      name: 'CityPulse Test User',
      frontend_source: 'citypulse'
    };

    const response = await request.post(`${BACKEND_URL}/api/v1/auth/register`, {
      data: userData,
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': 'citypulse'
      }
    });

    const data = await response.json();
    authToken = data.token;
  });

  test('buildings endpoint returns expected data structure', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/citypulse/buildings`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    if (data.length > 0) {
      const building = data[0];
      expect(building).toHaveProperty('id');
      expect(building).toHaveProperty('name');
      expect(building).toHaveProperty('type');
      expect(building).toHaveProperty('address');
      expect(building).toHaveProperty('totalConsumption');
    }
  });

  test('sensors endpoint returns sensor data', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/citypulse/sensors`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    if (data.length > 0) {
      const sensor = data[0];
      expect(sensor).toHaveProperty('id');
      expect(sensor).toHaveProperty('buildingId');
      expect(sensor).toHaveProperty('type');
      expect(sensor).toHaveProperty('value');
      expect(sensor).toHaveProperty('timestamp');
    }
  });

  test('energy consumption data is accessible', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/citypulse/energy/consumption`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('buildings');
    expect(Array.isArray(data.buildings)).toBeTruthy();
  });

  test('alerts endpoint returns alert data', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/citypulse/alerts`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('analytics endpoint provides insights', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/citypulse/analytics`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('insights');
    expect(data).toHaveProperty('recommendations');
  });

  test('unauthorized access is blocked', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/citypulse/buildings`);
    expect(response.status()).toBe(401);
  });

  test('wrong frontend source is blocked', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/v1/citypulse/buildings`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'quantum' // Wrong frontend
      }
    });
    
    expect(response.status()).toBe(403);
  });

  test('building specific endpoints work', async ({ request }) => {
    // First get buildings to get a valid ID
    const buildingsResponse = await request.get(`${BACKEND_URL}/api/v1/citypulse/buildings`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    const buildings = await buildingsResponse.json();
    
    if (buildings.length > 0) {
      const buildingId = buildings[0].id;
      
      // Test building-specific energy data
      const energyResponse = await request.get(`${BACKEND_URL}/api/v1/citypulse/buildings/${buildingId}/energy`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Frontend-Source': 'citypulse'
        }
      });

      expect(energyResponse.ok()).toBeTruthy();
      
      const energyData = await energyResponse.json();
      expect(energyData).toHaveProperty('buildingId', buildingId);
      expect(energyData).toHaveProperty('consumption');
    }
  });
});