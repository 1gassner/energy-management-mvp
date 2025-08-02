import { IWebSocketService, WebSocketMessage } from '@/types/api';
import { logger } from '@/utils/logger';

interface WebSocketSubscription {
  id: string;
  callback: (data: unknown) => void;
}

class RealWebSocketService implements IWebSocketService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, WebSocketSubscription[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private wsUrl: string;

  constructor() {
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        logger.info('Real WebSocket connected', { url: this.wsUrl });
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnectionListeners(true);
        this.authenticateConnection();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          logger.error('Error parsing WebSocket message', error as Error);
        }
      };

      this.ws.onclose = (event) => {
        logger.info('Real WebSocket disconnected', { code: event.code, reason: event.reason });
        this.isConnecting = false;
        this.ws = null;
        this.notifyConnectionListeners(false);
        
        // Only attempt reconnection if it wasn't a clean close
        if (event.code !== 1000 && event.code !== 1001) {
          this.handleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        logger.error('Real WebSocket error', { error: error.toString() });
        this.isConnecting = false;
        this.notifyConnectionListeners(false);
      };
    } catch (error) {
      logger.error('Error creating WebSocket connection', error as Error);
      this.isConnecting = false;
      this.notifyConnectionListeners(false);
      this.handleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      // Clean close
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.subscriptions.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.notifyConnectionListeners(false);
  }

  subscribe(type: string, callback: (data: unknown) => void): string {
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
    this.connectionListeners.push(callback);
    
    // Immediately call with current status
    callback(this.isConnected);
    
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
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
      
      logger.info('Attempting to reconnect', { 
        delayMs: delay, 
        attempt: this.reconnectAttempts, 
        maxAttempts: this.maxReconnectAttempts 
      });
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      logger.error('Max reconnection attempts reached. WebSocket service stopped.');
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