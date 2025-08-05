/**
 * WebSocket Connection Manager Utility
 * Provides utilities for managing WebSocket connections and preventing memory leaks
 */

interface ManagedWebSocketConnection {
  id: string;
  service: { disconnect(): void; destroy?(): void };
  isActive: boolean;
  createdAt: Date;
  lastUsed: Date;
}

class WebSocketConnectionManager {
  private connections = new Map<string, ManagedWebSocketConnection>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private maxInactiveTime = 300000; // 5 minutes
  private isDestroyed = false;

  constructor() {
    this.startCleanupTimer();
    
    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.destroyAll();
      });
      
      // Cleanup on visibility change (tab switch)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.markAllAsInactive();
        } else {
          this.refreshAllConnections();
        }
      });
    }
  }

  /**
   * Register a WebSocket service for management
   */
  register(id: string, service: { disconnect(): void; destroy?(): void }): void {
    if (this.isDestroyed) {
      console.warn('WebSocket manager is destroyed, cannot register connection');
      return;
    }

    if (this.connections.has(id)) {
      // Cleanup existing connection first
      this.unregister(id);
    }

    this.connections.set(id, {
      id,
      service,
      isActive: true,
      createdAt: new Date(),
      lastUsed: new Date(),
    });

    console.info(`WebSocket connection registered: ${id}`);
  }

  /**
   * Unregister and cleanup a WebSocket service
   */
  unregister(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      try {
        if (connection.service.destroy) {
          connection.service.destroy();
        } else {
          connection.service.disconnect();
        }
      } catch (error) {
        console.error(`Error cleaning up WebSocket connection ${id}:`, error);
      }

      this.connections.delete(id);
      console.info(`WebSocket connection unregistered: ${id}`);
    }
  }

  /**
   * Mark a connection as recently used
   */
  markAsUsed(id: string): void {
    const connection = this.connections.get(id);
    if (connection && !this.isDestroyed) {
      connection.lastUsed = new Date();
      connection.isActive = true;
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    activeConnections: number;
    inactiveConnections: number;
    oldestConnection?: Date;
    newestConnection?: Date;
  } {
    const connections = Array.from(this.connections.values());
    const activeConnections = connections.filter(c => c.isActive).length;
    
    return {
      totalConnections: connections.length,
      activeConnections,
      inactiveConnections: connections.length - activeConnections,
      oldestConnection: connections.length > 0 
        ? new Date(Math.min(...connections.map(c => c.createdAt.getTime()))) 
        : undefined,
      newestConnection: connections.length > 0 
        ? new Date(Math.max(...connections.map(c => c.createdAt.getTime()))) 
        : undefined,
    };
  }

  /**
   * Cleanup inactive connections
   */
  cleanupInactive(): void {
    if (this.isDestroyed) return;

    const now = new Date();
    const connectionsToRemove: string[] = [];

    for (const [id, connection] of this.connections.entries()) {
      const timeSinceLastUse = now.getTime() - connection.lastUsed.getTime();
      
      if (timeSinceLastUse > this.maxInactiveTime) {
        connectionsToRemove.push(id);
      }
    }

    connectionsToRemove.forEach(id => {
      console.info(`Cleaning up inactive WebSocket connection: ${id}`);
      this.unregister(id);
    });

    if (connectionsToRemove.length > 0) {
      console.info(`Cleaned up ${connectionsToRemove.length} inactive WebSocket connections`);
    }
  }

  /**
   * Destroy all connections and cleanup manager
   */
  destroyAll(): void {
    if (this.isDestroyed) return;

    console.info('Destroying all WebSocket connections...');
    
    const connectionIds = Array.from(this.connections.keys());
    connectionIds.forEach(id => this.unregister(id));

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.isDestroyed = true;
    console.info('WebSocket connection manager destroyed');
  }

  /**
   * Mark all connections as inactive
   */
  private markAllAsInactive(): void {
    for (const connection of this.connections.values()) {
      connection.isActive = false;
    }
  }

  /**
   * Refresh all connections (mark as active and update last used time)
   */
  private refreshAllConnections(): void {
    const now = new Date();
    for (const connection of this.connections.values()) {
      connection.isActive = true;
      connection.lastUsed = now;
    }
  }

  /**
   * Start periodic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupInactive();
    }, 60000); // Check every minute
  }
}

// Global instance
export const websocketConnectionManager = new WebSocketConnectionManager();

// Development debug utilities
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Expose to window for debugging
  (window as any).websocketManager = {
    getStats: () => websocketConnectionManager.getStats(),
    cleanupInactive: () => websocketConnectionManager.cleanupInactive(),
    destroyAll: () => websocketConnectionManager.destroyAll(),
  };
}

/**
 * Hook for React components to register WebSocket cleanup on unmount
 */
export function useWebSocketCleanup(
  id: string, 
  service: { disconnect(): void; destroy?(): void }
): void {
  if (typeof window !== 'undefined') {
    // Register the connection
    websocketConnectionManager.register(id, service);
    
    // Return cleanup function (for use in useEffect cleanup)
    return () => {
      websocketConnectionManager.unregister(id);
    };
  }
}

/**
 * Utility function to create a managed WebSocket service
 */
export function createManagedWebSocketService<T extends { disconnect(): void; destroy?(): void }>(
  id: string,
  serviceFactory: () => T
): T {
  const service = serviceFactory();
  websocketConnectionManager.register(id, service);
  
  // Mark as used when methods are called
  const originalConnect = service.connect as (() => void) | undefined;
  const originalSend = (service as any).send as ((message: any) => void) | undefined;
  const originalSubscribe = (service as any).subscribe as ((type: string, callback: (data: unknown) => void) => string) | undefined;

  if (originalConnect) {
    (service as any).connect = function() {
      websocketConnectionManager.markAsUsed(id);
      return originalConnect.call(this);
    };
  }

  if (originalSend) {
    (service as any).send = function(message: any) {
      websocketConnectionManager.markAsUsed(id);
      return originalSend.call(this, message);
    };
  }

  if (originalSubscribe) {
    (service as any).subscribe = function(type: string, callback: (data: unknown) => void) {
      websocketConnectionManager.markAsUsed(id);
      return originalSubscribe.call(this, type, callback);
    };
  }

  return service;
}