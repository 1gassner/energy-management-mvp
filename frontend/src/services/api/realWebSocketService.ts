import { IWebSocketService, WebSocketMessage } from '@/types/api';
import { logger } from '@/utils/logger';

interface WebSocketSubscription {
  id: string;
  callback: (data: unknown) => void;
}

export class RealWebSocketService implements IWebSocketService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, WebSocketSubscription[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private wsUrl: string;
  private isDestroyed = false;
  private boundEventHandlers: {
    onopen?: () => void;
    onmessage?: (event: MessageEvent) => void;
    onclose?: (event: CloseEvent) => void;
    onerror?: (error: Event) => void;
  } = {};

  constructor() {
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  }

  connect(): void {
    if (this.isDestroyed) {
      logger.warn('Cannot connect - WebSocket service has been destroyed');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    
    // Clear any existing reconnect timer
    this.clearReconnectTimer();

    try {
      // Clean up existing connection first
      this.cleanupWebSocket();
      
      this.ws = new WebSocket(this.wsUrl);

      // Create bound event handlers for proper cleanup
      this.boundEventHandlers.onopen = () => {
        if (this.isDestroyed) return;
        logger.info('Real WebSocket connected', { url: this.wsUrl });
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnectionListeners(true);
        this.authenticateConnection();
      };

      this.boundEventHandlers.onmessage = (event: MessageEvent) => {
        if (this.isDestroyed) return;
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          logger.error('Error parsing WebSocket message', error as Error);
        }
      };

      this.boundEventHandlers.onclose = (event: CloseEvent) => {
        if (this.isDestroyed) return;
        logger.info('Real WebSocket disconnected', { code: event.code, reason: event.reason });
        this.isConnecting = false;
        this.ws = null;
        this.notifyConnectionListeners(false);
        
        // Only attempt reconnection if it wasn't a clean close and service isn't destroyed
        if (event.code !== 1000 && event.code !== 1001 && !this.isDestroyed) {
          this.handleReconnect();
        }
      };

      this.boundEventHandlers.onerror = (error: Event) => {
        if (this.isDestroyed) return;
        logger.error('Real WebSocket error', { error: error.toString() });
        this.isConnecting = false;
        this.notifyConnectionListeners(false);
      };

      // Assign event handlers
      this.ws.onopen = this.boundEventHandlers.onopen;
      this.ws.onmessage = this.boundEventHandlers.onmessage;
      this.ws.onclose = this.boundEventHandlers.onclose;
      this.ws.onerror = this.boundEventHandlers.onerror;
    } catch (error) {
      logger.error('Error creating WebSocket connection', error as Error);
      this.isConnecting = false;
      this.notifyConnectionListeners(false);
      if (!this.isDestroyed) {
        this.handleReconnect();
      }
    }
  }

  disconnect(): void {
    this.cleanup();
  }

  destroy(): void {
    this.isDestroyed = true;
    this.cleanup();
    this.connectionListeners.length = 0; // Clear all connection listeners
    logger.info('Real WebSocket service destroyed');
  }

  private cleanup(): void {
    this.clearReconnectTimer();
    this.cleanupWebSocket();
    this.subscriptions.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.notifyConnectionListeners(false);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private cleanupWebSocket(): void {
    if (this.ws) {
      // Remove event listeners to prevent memory leaks
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      // Close connection if still open
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      
      this.ws = null;
    }
    
    // Clear bound event handlers
    this.boundEventHandlers = {};
  }

  subscribe(type: string, callback: (data: unknown) => void): string {
    if (this.isDestroyed) {
      logger.warn('Cannot subscribe - service is destroyed');
      return '';
    }

    const id = `${type}_${Date.now()}_${Math.random()}`;
    
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, []);
    }
    
    this.subscriptions.get(type)!.push({ id, callback });
    
    // Send subscription request to server
    this.send({
      type: 'subscribe',
      payload: { messageType: type },
      timestamp: new Date().toISOString(),
    });
    
    return id;
  }

  unsubscribe(id: string): void {
    if (this.isDestroyed) {
      return;
    }

    for (const [type, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex(sub => sub.id === id);
      if (index !== -1) {
        subs.splice(index, 1);
        
        // If no more subscribers for this type, unsubscribe from server
        if (subs.length === 0) {
          this.subscriptions.delete(type);
          this.send({
            type: 'unsubscribe',
            payload: { messageType: type },
            timestamp: new Date().toISOString(),
          });
        }
        break;
      }
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        logger.error('Error sending WebSocket message', error as Error);
      }
    } else {
      logger.warn('WebSocket is not connected. Message not sent', { message });
      // Optionally queue the message for later sending
    }
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    if (this.isDestroyed) {
      logger.warn('Cannot add connection listener - service is destroyed');
      return () => {}; // Return no-op unsubscribe function
    }

    this.connectionListeners.push(callback);
    
    // Immediately call with current status
    try {
      callback(this.isConnected);
    } catch (error) {
      logger.error('Error in connection listener during registration', error as Error);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        logger.error('Error in connection listener', error as Error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    const subscribers = this.subscriptions.get(message.type);
    if (subscribers) {
      subscribers.forEach(sub => {
        try {
          sub.callback(message.payload);
        } catch (error) {
          logger.error('Error in subscription callback', error as Error);
        }
      });
    }
  }

  private handleReconnect(): void {
    if (this.isDestroyed) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(
        this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
        30000 // Cap at 30 seconds
      );
      
      logger.info('Attempting to reconnect', { 
        delayMs: delay, 
        attempt: this.reconnectAttempts, 
        maxAttempts: this.maxReconnectAttempts 
      });
      
      this.clearReconnectTimer(); // Ensure no existing timer
      this.reconnectTimer = setTimeout(() => {
        if (!this.isDestroyed) {
          this.connect();
        }
      }, delay);
    } else {
      logger.error('Max reconnection attempts reached. WebSocket service stopped.');
      this.isDestroyed = true; // Prevent further reconnection attempts
    }
  }

  private authenticateConnection(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.send({
        type: 'authenticate',
        payload: { token },
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const realWebSocketService = new RealWebSocketService();