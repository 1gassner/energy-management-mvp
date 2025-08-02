import { webSocketService } from './serviceFactory';

// Re-export the unified websocket service from the factory
// This maintains backward compatibility while using the new environment-based system
export { webSocketService as websocketService };