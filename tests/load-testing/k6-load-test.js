import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const wsConnections = new Counter('websocket_connections');
const wsMessages = new Counter('websocket_messages');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 500 },   // Ramp up to 500 users
    { duration: '5m', target: 500 },   // Stay at 500 users
    { duration: '2m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '5m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
    errors: ['rate<0.05'],            // Custom error rate under 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://api.flowmind.app';

// Test data
const frontends = ['citypulse', 'flowmind', 'quantum', 'velocity'];
let authTokens = {};

export function setup() {
  console.log('Setting up load test...');
  
  // Create test users for each frontend
  for (const frontend of frontends) {
    const userData = {
      email: `load-test-${frontend}-${Date.now()}@example.com`,
      password: 'LoadTestPassword123!',
      name: `Load Test User ${frontend}`,
      frontend_source: frontend
    };

    const response = http.post(`${BASE_URL}/api/v1/auth/register`, JSON.stringify(userData), {
      headers: {
        'Content-Type': 'application/json',
        'X-Frontend-Source': frontend
      }
    });

    if (response.status === 200 || response.status === 201) {
      const data = JSON.parse(response.body);
      authTokens[frontend] = data.token;
    }
  }
  
  return { authTokens };
}

export default function(data) {
  const frontend = frontends[Math.floor(Math.random() * frontends.length)];
  const token = data.authTokens[frontend];
  
  if (!token) {
    console.log(`No token for frontend: ${frontend}`);
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Frontend-Source': frontend,
    'Content-Type': 'application/json'
  };

  // Test scenarios based on frontend
  switch (frontend) {
    case 'citypulse':
      testCityPulse(headers);
      break;
    case 'flowmind':
      testFlowMind(headers);
      break;
    case 'quantum':
    case 'velocity':
      testSwarm(headers, frontend);
      break;
  }

  // Random WebSocket test (20% chance)
  if (Math.random() < 0.2) {
    testWebSocket(token, frontend);
  }

  sleep(1);
}

function testCityPulse(headers) {
  // Test buildings endpoint
  let response = http.get(`${BASE_URL}/api/v1/citypulse/buildings`, { headers });
  
  check(response, {
    'buildings endpoint status is 200': (r) => r.status === 200,
    'buildings response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  responseTime.add(response.timings.duration);

  // Test sensors endpoint
  response = http.get(`${BASE_URL}/api/v1/citypulse/sensors`, { headers });
  
  check(response, {
    'sensors endpoint status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // Test energy consumption
  response = http.get(`${BASE_URL}/api/v1/citypulse/energy/consumption`, { headers });
  
  check(response, {
    'energy endpoint status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // Test alerts
  response = http.get(`${BASE_URL}/api/v1/citypulse/alerts`, { headers });
  
  check(response, {
    'alerts endpoint status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
}

function testFlowMind(headers) {
  // Test AI models endpoint
  let response = http.get(`${BASE_URL}/api/v1/ai/models`, { headers });
  
  check(response, {
    'AI models endpoint status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // Test chat endpoint (lightweight request)
  const chatData = {
    message: 'Hello, this is a load test message.',
    model: 'gpt-3.5-turbo',
    stream: false
  };

  response = http.post(`${BASE_URL}/api/v1/ai/chat`, JSON.stringify(chatData), { headers });
  
  check(response, {
    'AI chat endpoint responds': (r) => r.status === 200 || r.status === 429, // Allow rate limiting
  }) || errorRate.add(1);

  responseTime.add(response.timings.duration);
}

function testSwarm(headers, frontend) {
  // Test swarm status
  let response = http.get(`${BASE_URL}/api/v1/swarm/status`, { headers });
  
  check(response, {
    'swarm status endpoint is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // Test agents endpoint
  response = http.get(`${BASE_URL}/api/v1/swarm/agents`, { headers });
  
  check(response, {
    'swarm agents endpoint is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // Test lightweight orchestration
  const orchestrationData = {
    task: 'Simple load test task',
    agents: 1,
    complexity: 'low'
  };

  response = http.post(`${BASE_URL}/api/v1/swarm/orchestrate`, JSON.stringify(orchestrationData), { headers });
  
  check(response, {
    'swarm orchestration responds': (r) => r.status === 200 || r.status === 429,
  }) || errorRate.add(1);

  responseTime.add(response.timings.duration);
}

function testWebSocket(token, frontend) {
  const wsUrl = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
  
  const response = ws.connect(wsUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Frontend-Source': frontend
    }
  }, function (socket) {
    wsConnections.add(1);

    socket.on('open', function () {
      // Subscribe to updates
      socket.send(JSON.stringify({
        type: 'subscribe',
        channel: frontend === 'citypulse' ? 'energy-updates' : 'swarm-updates',
        frontend: frontend
      }));
      wsMessages.add(1);
    });

    socket.on('message', function (data) {
      wsMessages.add(1);
      const message = JSON.parse(data);
      
      check(message, {
        'WebSocket message has type': (msg) => msg.type !== undefined,
      });
    });

    socket.on('error', function (e) {
      console.log('WebSocket error:', e.error());
      errorRate.add(1);
    });

    // Stay connected for 10 seconds
    socket.setTimeout(function () {
      socket.close();
    }, 10000);
  });

  check(response, {
    'WebSocket connection successful': (r) => r && r.status === 101,
  }) || errorRate.add(1);
}

export function teardown(data) {
  console.log('Load test completed');
  console.log(`Auth tokens created: ${Object.keys(data.authTokens).length}`);
}

export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    'load-test-summary.html': htmlReport(data),
  };
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>FlowMind Load Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .passed { background-color: #d4edda; }
        .failed { background-color: #f8d7da; }
    </style>
</head>
<body>
    <h1>FlowMind Universal Backend Load Test Results</h1>
    <p>Test Duration: ${data.state.testRunDurationMs / 1000}s</p>
    <p>Virtual Users: ${data.metrics.vus_max.values.max}</p>
    
    <h2>Key Metrics</h2>
    <div class="metric ${data.metrics.http_req_duration.values.avg < 500 ? 'passed' : 'failed'}">
        <strong>Average Response Time:</strong> ${Math.round(data.metrics.http_req_duration.values.avg)}ms
    </div>
    
    <div class="metric ${data.metrics.http_req_failed.values.rate < 0.1 ? 'passed' : 'failed'}">
        <strong>Error Rate:</strong> ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
    </div>
    
    <div class="metric">
        <strong>Total Requests:</strong> ${data.metrics.http_reqs.values.count}
    </div>
    
    <div class="metric">
        <strong>WebSocket Connections:</strong> ${data.metrics.websocket_connections?.values.count || 0}
    </div>
    
    <h2>Thresholds</h2>
    ${Object.entries(data.thresholds).map(([name, result]) => 
      `<div class="metric ${result.ok ? 'passed' : 'failed'}">
        <strong>${name}:</strong> ${result.ok ? 'PASSED' : 'FAILED'}
      </div>`
    ).join('')}
</body>
</html>
  `;
}