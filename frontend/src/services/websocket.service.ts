import { webSocketService } from './serviceFactory';
import { WebSocketManager, useMemoryLeakPrevention } from '@/utils/memoryLeakPrevention';
import { logger } from '@/utils/logger';

/**
 * Enhanced WebSocket Service with Memory Leak Prevention
 * Wraps the factory service with automatic cleanup and connection management
 */
class EnhancedWebSocketService {
  private wsManager = WebSocketManager.getInstance();
  private isDestroyed = false;
  private baseService = webSocketService;

  constructor() {
    // Register global cleanup
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }
  }

  connect(): void {
    if (this.isDestroyed) {
      logger.warn('WebSocket service is destroyed, cannot connect');
      return;
    }

    try {
      this.baseService.connect();
      logger.info('Enhanced WebSocket service connected');
    } catch (error) {
      logger.error('Failed to connect enhanced WebSocket service', error as Error);
    }
  }

  disconnect(): void {
    try {
      this.baseService.disconnect();
      this.wsManager.cleanup();
      logger.info('Enhanced WebSocket service disconnected');
    } catch (error) {
      logger.error('Error during WebSocket disconnect', error as Error);
    }
  }

  send(data: any): void {
    if (this.isDestroyed) {
      logger.warn('Cannot send data: WebSocket service is destroyed');
      return;
    }

    try {
      this.baseService.send(data);
    } catch (error) {
      logger.error('Failed to send WebSocket data', error as Error);
    }
  }

  subscribe(event: string, handler: (data: any) => void): () => void {
    if (this.isDestroyed) {
      logger.warn('Cannot subscribe: WebSocket service is destroyed');
      return () => {};
    }

    try {
      const unsubscribe = this.baseService.subscribe(event, handler);
      
      // Enhanced cleanup wrapper
      return () => {
        try {
          unsubscribe();
        } catch (error) {
          logger.error('Error during WebSocket unsubscribe', error as Error);
        }
      };
    } catch (error) {
      logger.error('Failed to subscribe to WebSocket event', error as Error);
      return () => {};
    }
  }

  cleanup(): void {
    if (this.isDestroyed) {
      return;
    }

    logger.info('Cleaning up enhanced WebSocket service');
    
    try {
      this.disconnect();
      this.wsManager.cleanup();
      this.isDestroyed = true;
    } catch (error) {
      logger.error('Error during WebSocket cleanup', error as Error);
    }
  }

  // Delegate all other methods to base service
  isConnected(): boolean {
    try {
      return this.baseService.isConnected?.() || false;
    } catch {
      return false;
    }
  }

  getConnectionStatus(): string {
    try {
      return this.baseService.getConnectionStatus?.() || 'unknown';
    } catch {
      return 'error';
    }
  }
}

// Create singleton instance with memory leak prevention
const enhancedWebSocketService = new EnhancedWebSocketService();

// Re-export the enhanced websocket service
export { enhancedWebSocketService as websocketService };

// Also export the original for compatibility
export { webSocketService };