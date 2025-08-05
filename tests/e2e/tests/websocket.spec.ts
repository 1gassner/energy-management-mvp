import { test, expect } from '@playwright/test';
import { WebSocket } from 'ws';

const BACKEND_URL = process.env.BASE_URL || 'https://api.flowmind.app';
const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

test.describe('WebSocket Real-time Features', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Create test user
    const userData = {
      email: `ws-test-${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      name: 'WebSocket Test User',
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

  test('WebSocket connection establishes successfully', async () => {
    const ws = new WebSocket(`${WS_URL}/ws`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    const connected = await new Promise((resolve) => {
      ws.on('open', () => resolve(true));
      ws.on('error', () => resolve(false));
      setTimeout(() => resolve(false), 5000);
    });

    expect(connected).toBeTruthy();
    ws.close();
  });

  test('WebSocket authentication is enforced', async () => {
    const ws = new WebSocket(`${WS_URL}/ws`); // No auth header

    const authFailed = await new Promise((resolve) => {
      ws.on('error', () => resolve(true));
      ws.on('open', () => resolve(false));
      setTimeout(() => resolve(true), 2000);
    });

    expect(authFailed).toBeTruthy();
  });

  test('WebSocket receives real-time energy updates', async () => {
    const ws = new WebSocket(`${WS_URL}/ws`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    await new Promise((resolve) => {
      ws.on('open', resolve);
    });

    // Subscribe to energy updates
    ws.send(JSON.stringify({
      type: 'subscribe',
      channel: 'energy-updates',
      frontend: 'citypulse'
    }));

    // Wait for confirmation
    const subscribed = await new Promise((resolve) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'subscription-confirmed' && message.channel === 'energy-updates') {
          resolve(true);
        }
      });
      setTimeout(() => resolve(false), 3000);
    });

    expect(subscribed).toBeTruthy();
    ws.close();
  });

  test('WebSocket handles multiple concurrent connections', async () => {
    const connections = await Promise.all([
      createWebSocketConnection(authToken, 'citypulse'),
      createWebSocketConnection(authToken, 'citypulse'),
      createWebSocketConnection(authToken, 'citypulse')
    ]);

    // All connections should be successful
    expect(connections.every(conn => conn !== null)).toBeTruthy();

    // Clean up
    connections.forEach(ws => ws?.close());
  });

  test('WebSocket handles frontend-specific channels', async () => {
    const ws = new WebSocket(`${WS_URL}/ws`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    await new Promise((resolve) => {
      ws.on('open', resolve);
    });

    // Try to subscribe to a channel for a different frontend
    ws.send(JSON.stringify({
      type: 'subscribe',
      channel: 'swarm-updates', // This is for quantum/velocity
      frontend: 'quantum'
    }));

    // Should receive error
    const errorReceived = await new Promise((resolve) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'error' && message.message.includes('permission')) {
          resolve(true);
        }
      });
      setTimeout(() => resolve(false), 3000);
    });

    expect(errorReceived).toBeTruthy();
    ws.close();
  });

  test('WebSocket reconnection works after disconnection', async () => {
    let ws = new WebSocket(`${WS_URL}/ws`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    // Wait for initial connection
    await new Promise((resolve) => {
      ws.on('open', resolve);
    });

    // Close connection
    ws.close();

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reconnect
    ws = new WebSocket(`${WS_URL}/ws`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Frontend-Source': 'citypulse'
      }
    });

    const reconnected = await new Promise((resolve) => {
      ws.on('open', () => resolve(true));
      ws.on('error', () => resolve(false));
      setTimeout(() => resolve(false), 5000);
    });

    expect(reconnected).toBeTruthy();
    ws.close();
  });
});

// Helper function to create WebSocket connection
async function createWebSocketConnection(token: string, frontend: string): Promise<WebSocket | null> {
  return new Promise((resolve) => {
    const ws = new WebSocket(`${WS_URL}/ws`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Frontend-Source': frontend
      }
    });

    ws.on('open', () => resolve(ws));
    ws.on('error', () => resolve(null));
    setTimeout(() => resolve(null), 5000);
  });
}