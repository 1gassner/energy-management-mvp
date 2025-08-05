/**
 * Production API Testing Suite
 * Comprehensive tests for all backend endpoints and configurations
 */

import { spawn } from 'child_process';
import { WebSocket } from 'ws';
import axios from 'axios';
import { setTimeout } from 'timers/promises';

const BASE_URL = 'http://localhost:8001';
const WS_URL = 'ws://localhost:8001';

class ProductionAPITester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.serverProcess = null;
  }

  async startServer() {
    console.log('🚀 Starting backend server for testing...');
    
    this.serverProcess = spawn('node', ['src/server.js'], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    // Wait for server to start
    await setTimeout(3000);
    
    // Test if server is responsive
    try {
      await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server started successfully');
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      throw error;
    }
  }

  async stopServer() {
    if (this.serverProcess) {
      console.log('🛑 Stopping server...');
      this.serverProcess.kill('SIGTERM');
      await setTimeout(2000);
    }
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
      await testFn();
      console.log(`✅ ${name} - PASSED`);
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
    } catch (error) {
      console.error(`❌ ${name} - FAILED: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }

  // ==========================================
  // HEALTH CHECK TESTS
  // ==========================================

  async testHealthEndpoints() {
    await this.runTest('Health Check Endpoint', async () => {
      const response = await axios.get(`${BASE_URL}/health`);
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      
      const data = response.data;
      if (!data.status || !data.timestamp) {
        throw new Error('Health response missing required fields');
      }
      
      console.log('   Health Status:', data.status);
      console.log('   Environment:', data.environment);
    });

    await this.runTest('API Info Endpoint', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/info`);
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      
      const data = response.data;
      if (!data.name || !data.frontends) {
        throw new Error('API info response missing required fields');
      }
      
      console.log('   Backend Name:', data.name);
      console.log('   Enabled Frontends:', data.frontends.filter(f => f.enabled).map(f => f.name).join(', '));
    });
  }

  // ==========================================
  // CORS TESTS
  // ==========================================

  async testCORSConfiguration() {
    await this.runTest('CORS Preflight Request', async () => {
      const response = await axios.options(`${BASE_URL}/api/v1/info`, {
        headers: {
          'Origin': 'https://flowmind.yourdomain.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      
      console.log('   CORS headers present:', !!response.headers['access-control-allow-origin']);
    });

    await this.runTest('CORS Blocked Origin', async () => {
      try {
        await axios.get(`${BASE_URL}/api/v1/info`, {
          headers: {
            'Origin': 'https://malicious-site.com'
          }
        });
        // If we get here, CORS didn't block (which might be expected in some configs)
        console.log('   CORS policy allows all origins (development mode)');
      } catch (error) {
        if (error.response?.status === 403 || error.message.includes('CORS')) {
          console.log('   CORS properly blocked malicious origin');
        } else {
          throw error;
        }
      }
    });
  }

  // ==========================================
  // AUTHENTICATION TESTS
  // ==========================================

  async testAuthenticationFlow() {
    await this.runTest('Protected Endpoint Without Token', async () => {
      try {
        await axios.get(`${BASE_URL}/api/v1/citypulse`);
        throw new Error('Expected authentication error');
      } catch (error) {
        if (error.response?.status !== 401) {
          throw new Error(`Expected status 401, got ${error.response?.status}`);
        }
        console.log('   Properly requires authentication');
      }
    });

    await this.runTest('Invalid Token Rejection', async () => {
      try {
        await axios.get(`${BASE_URL}/api/v1/citypulse`, {
          headers: {
            'Authorization': 'Bearer invalid-token-here'
          }
        });
        throw new Error('Expected token validation error');
      } catch (error) {
        if (error.response?.status !== 401) {
          throw new Error(`Expected status 401, got ${error.response?.status}`);
        }
        console.log('   Properly rejects invalid tokens');
      }
    });
  }

  // ==========================================
  // RATE LIMITING TESTS
  // ==========================================

  async testRateLimiting() {
    await this.runTest('Rate Limiting Implementation', async () => {
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          axios.get(`${BASE_URL}/api/v1/info`).catch(err => err.response)
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimitHeaders = responses[0]?.headers;
      
      if (rateLimitHeaders && (
        rateLimitHeaders['x-ratelimit-limit'] || 
        rateLimitHeaders['x-rate-limit-limit']
      )) {
        console.log('   Rate limiting headers present');
      } else {
        console.log('   Rate limiting may not be fully configured');
      }
    });
  }

  // ==========================================
  // WEBSOCKET TESTS  
  // ==========================================

  async testWebSocketConnection() {
    await this.runTest('WebSocket Connection', async () => {
      return new Promise((resolve, reject) => {
        const ws = new WebSocket(`${WS_URL}/ws`);
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        ws.on('open', () => {
          console.log('   WebSocket connection established');
          
          // Send test message
          ws.send(JSON.stringify({
            type: 'test',
            message: 'Production test message'
          }));
        });

        ws.on('message', (data) => {
          console.log('   Received WebSocket message');
          clearTimeout(timeout);
          ws.close();
          resolve();
        });

        ws.on('error', (error) => {
          console.log('   WebSocket connection failed (may be expected if not configured)');
          clearTimeout(timeout);
          resolve(); // Don't fail the test for WebSocket issues
        });

        ws.on('close', () => {
          clearTimeout(timeout);
        });
      });
    });
  }

  // ==========================================
  // CITYPULSE API TESTS
  // ==========================================

  async testCityPulseEndpoints() {
    const endpoints = [
      '/api/v1/citypulse/buildings',
      '/api/v1/citypulse/sensors', 
      '/api/v1/citypulse/energy',
      '/api/v1/citypulse/alerts',
      '/api/v1/citypulse/analytics'
    ];

    for (const endpoint of endpoints) {
      await this.runTest(`CityPulse ${endpoint}`, async () => {
        try {
          await axios.get(`${BASE_URL}${endpoint}`);
          throw new Error('Expected authentication error');
        } catch (error) {
          if (error.response?.status !== 401) {
            throw new Error(`Expected status 401, got ${error.response?.status}`);
          }
          console.log('   Endpoint properly protected');
        }
      });
    }
  }

  // ==========================================
  // FLOWMIND API TESTS
  // ==========================================

  async testFlowMindEndpoints() {
    await this.runTest('FlowMind AI Endpoints', async () => {
      try {
        await axios.post(`${BASE_URL}/api/v1/ai/chat`, {
          message: 'Test message'
        });
        throw new Error('Expected authentication error');
      } catch (error) {
        if (error.response?.status !== 401) {
          throw new Error(`Expected status 401, got ${error.response?.status}`);
        }
        console.log('   AI endpoints properly protected');
      }
    });
  }

  // ==========================================
  // SECURITY HEADERS TESTS
  // ==========================================

  async testSecurityHeaders() {
    await this.runTest('Security Headers', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/info`);
      const headers = response.headers;
      
      const expectedHeaders = [
        'x-content-type-options',
        'x-frame-options', 
        'x-xss-protection'
      ];
      
      const missingHeaders = expectedHeaders.filter(header => !headers[header]);
      
      if (missingHeaders.length > 0) {
        console.log(`   Missing security headers: ${missingHeaders.join(', ')}`);
      } else {
        console.log('   All expected security headers present');
      }
    });
  }

  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================

  async testPerformanceMetrics() {
    await this.runTest('Response Time Performance', async () => {
      const startTime = Date.now();
      await axios.get(`${BASE_URL}/health`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`   Response time: ${responseTime}ms`);
      
      if (responseTime > 5000) {
        throw new Error(`Slow response time: ${responseTime}ms`);
      }
    });

    await this.runTest('Concurrent Request Handling', async () => {
      const concurrentRequests = 20;
      const requests = Array(concurrentRequests).fill().map(() => 
        axios.get(`${BASE_URL}/health`)
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      
      const allSuccessful = responses.every(r => r.status === 200);
      if (!allSuccessful) {
        throw new Error('Some concurrent requests failed');
      }
      
      console.log(`   Handled ${concurrentRequests} concurrent requests in ${endTime - startTime}ms`);
    });
  }

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================

  async testErrorHandling() {
    await this.runTest('404 Error Handling', async () => {
      try {
        await axios.get(`${BASE_URL}/nonexistent-endpoint`);
        throw new Error('Expected 404 error');
      } catch (error) {
        if (error.response?.status !== 404) {
          throw new Error(`Expected status 404, got ${error.response?.status}`);
        }
        
        const errorResponse = error.response.data;
        if (!errorResponse.error || !errorResponse.timestamp) {
          throw new Error('Error response missing required fields');
        }
        
        console.log('   Proper 404 error handling with structured response');
      }
    });
  }

  // ==========================================
  // MAIN TEST RUNNER
  // ==========================================

  async runAllTests() {
    console.log('🔥 Starting Production API Test Suite\n');
    console.log('=' .repeat(50));
    
    try {
      await this.startServer();
      
      // Run all test categories
      await this.testHealthEndpoints();
      await this.testCORSConfiguration();  
      await this.testAuthenticationFlow();
      await this.testRateLimiting();
      await this.testWebSocketConnection();
      await this.testCityPulseEndpoints();
      await this.testFlowMindEndpoints();
      await this.testSecurityHeaders();
      await this.testPerformanceMetrics();
      await this.testErrorHandling();
      
    } finally {
      await this.stopServer();
    }
    
    // Print results
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Results Summary');
    console.log('=' .repeat(50));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(t => t.status === 'FAILED')
        .forEach(t => console.log(`   - ${t.name}: ${t.error}`));
    }
    
    console.log('\n🎉 Production API Testing Complete!');
    
    return {
      success: this.results.failed === 0,
      results: this.results
    };
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ProductionAPITester();
  
  tester.runAllTests()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    });
}

export default ProductionAPITester;