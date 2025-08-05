import { WebSocket } from 'ws';
import { setTimeout } from 'timers/promises';

console.log('🧪 Testing WebSocket Connection...\n');

const ws = new WebSocket('ws://localhost:8001/ws');

ws.on('open', () => {
  console.log('✅ WebSocket connection established');
  
  // Test message
  ws.send(JSON.stringify({
    type: 'test',
    message: 'Hello from test client',
    timestamp: new Date().toISOString()
  }));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📥 Received message:', message);
  } catch (error) {
    console.log('📥 Raw message:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', (code, reason) => {
  console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
});

// Close after 5 seconds
setTimeout(5000).then(() => {
  console.log('\n🔄 Closing WebSocket connection...');
  ws.close();
  process.exit(0);
});