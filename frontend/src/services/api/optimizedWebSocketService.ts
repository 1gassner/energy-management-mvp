import { IWebSocketService, WebSocketMessage } from '@/types/api';
import { logger } from '@/utils/logger';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface WebSocketSubscription {
  id: string;
  callback: (data: unknown) => void;
  lastMessage?: number;
  throttleMs?: number;
}

interface QueuedMessage {
  message: WebSocketMessage;
  timestamp: number;
  priority: number;
}

interface ConnectionPool {
  primary: WebSocket | null;
  fallback: WebSocket | null;
}

class OptimizedWebSocketService implements IWebSocketService {
  private connections: ConnectionPool = { primary: null, fallback: null };
  private subscriptions: Map<string, WebSocketSubscription[]> = new Map();
  private messageQueue: QueuedMessage[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private wsUrls: string[];
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private messageThrottleMap: Map<string, number> = new Map();
  private bandwidthMonitor = {
    bytesReceived: 0,
    bytesSent: 0,
    messagesReceived: 0,
    messagesSent: 0,
    startTime: Date.now()
  };

  // Connection pooling and load balancing
  private currentConnectionIndex = 0;
  private connectionHealth: Map<string, number> = new Map();
  
  // Message compression
  private compressionThreshold = 1024; // bytes
  private useCompression = true;

  constructor() {
    this.wsUrls = [
      import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
      import.meta.env.VITE_WS_FALLBACK_URL || 'ws://localhost:3002'
    ];
  }

  connect(): void {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.clearReconnectTimer();

    // Try primary connection first
    this.connectToUrl(this.wsUrls[0], 'primary')
      .catch(() => {
        // Fallback to secondary if available
        if (this.wsUrls.length > 1) {
          return this.connectToUrl(this.wsUrls[1], 'fallback');
        }
        throw new Error('No fallback URL available');
      })
      .catch((error) => {
        logger.error('All WebSocket connections failed', error);
        this.isConnecting = false;
        this.handleReconnect();
      });
  }

  private async connectToUrl(url: string, connectionType: 'primary' | 'fallback'): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      try {
        const ws = new WebSocket(url);
        
        const onOpen = () => {
          const connectionTime = performance.now() - startTime;
          performanceMonitor.recordMetric('websocket-connection-time', connectionTime, { url, type: connectionType });
          
          logger.info(`WebSocket connected (${connectionType})`, { url, connectionTime });
          
          this.connections[connectionType] = ws;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.connectionHealth.set(url, Date.now());
          
          this.setupConnection(ws, url);
          this.authenticateConnection(ws);
          this.startHeartbeat();
          this.processQueuedMessages();
          
          this.notifyConnectionListeners(true);
          resolve();
        };

        const onError = (error: Event) => {
          performanceMonitor.recordMetric('websocket-connection-error', 1, { url, type: connectionType });
          logger.error(`WebSocket connection error (${connectionType})`, { url, error });
          reject(error);
        };

        const onClose = (event: CloseEvent) => {
          logger.info(`WebSocket disconnected (${connectionType})`, { url, code: event.code, reason: event.reason });
          this.connections[connectionType] = null;
          this.connectionHealth.delete(url);
          
          // If this was our active connection, notify listeners
          if (!this.isConnected) {
            this.notifyConnectionListeners(false);
            this.stopHeartbeat();
            
            // Only reconnect if it wasn't a clean close
            if (event.code !== 1000 && event.code !== 1001) {
              this.handleReconnect();
            }
          }
        };

        ws.onopen = onOpen;
        ws.onerror = onError;
        ws.onclose = onClose;
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupConnection(ws: WebSocket, url: string): void {
    ws.onmessage = (event) => {
      this.bandwidthMonitor.messagesReceived++;
      this.bandwidthMonitor.bytesReceived += event.data.length;
      
      try {
        const message: WebSocketMessage = this.decompressMessage(event.data);
        this.handleMessage(message);
        
        // Update connection health
        this.connectionHealth.set(url, Date.now());
        
      } catch (error) {
        logger.error('Error parsing WebSocket message', error as Error);
        performanceMonitor.recordMetric('websocket-parse-error', 1, { url });
      }
    };
  }

  disconnect(): void {
    this.clearReconnectTimer();
    this.stopHeartbeat();
    
    // Close all connections
    Object.values(this.connections).forEach(ws => {
      if (ws) {
        ws.close(1000, 'Client disconnect');
      }
    });
    
    this.connections = { primary: null, fallback: null };
    this.subscriptions.clear();
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.connectionHealth.clear();
    this.messageThrottleMap.clear();
    
    this.notifyConnectionListeners(false);
  }

  subscribe(type: string, callback: (data: unknown) => void, throttleMs?: number): string {
    const id = `${type}_${Date.now()}_${Math.random()}`;
    
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, []);
    }
    
    this.subscriptions.get(type)!.push({ 
      id, 
      callback, 
      throttleMs,
      lastMessage: 0
    });
    
    // Send subscription request
    this.send({
      type: 'subscribe',
      payload: { messageType: type },
      timestamp: new Date().toISOString(),
    }, 1); // Low priority
    
    return id;
  }

  unsubscribe(id: string): void {
    for (const [type, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex(sub => sub.id === id);
      if (index !== -1) {
        subs.splice(index, 1);
        
        if (subs.length === 0) {
          this.subscriptions.delete(type);
          this.send({
            type: 'unsubscribe',
            payload: { messageType: type },
            timestamp: new Date().toISOString(),
          }, 1);
        }
        break;
      }
    }
  }

  send(message: WebSocketMessage, priority: number = 5): void {
    const activeConnection = this.getActiveConnection();
    
    if (activeConnection?.readyState === WebSocket.OPEN) {
      try {
        const serialized = this.compressMessage(message);
        activeConnection.send(serialized);
        
        this.bandwidthMonitor.messagesSent++;
        this.bandwidthMonitor.bytesSent += serialized.length;
        
        performanceMonitor.recordMetric('websocket-message-sent', 1, { 
          type: message.type,
          size: serialized.length
        });
        
      } catch (error) {
        logger.error('Error sending WebSocket message', error as Error);
        this.queueMessage(message, priority);
      }
    } else {
      this.queueMessage(message, priority);
    }
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    callback(this.isConnected);
    
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  get isConnected(): boolean {
    return this.getActiveConnection()?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    const activeConnection = this.getActiveConnection();
    if (!activeConnection) return 'disconnected';
    
    switch (activeConnection.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  // Performance monitoring methods
  getBandwidthStats(): {
    bytesReceived: number;
    bytesSent: number;
    messagesReceived: number;
    messagesSent: number;
    duration: number;
    avgMessageSize: number;
  } {
    const duration = Date.now() - this.bandwidthMonitor.startTime;
    const totalMessages = this.bandwidthMonitor.messagesReceived + this.bandwidthMonitor.messagesSent;
    const totalBytes = this.bandwidthMonitor.bytesReceived + this.bandwidthMonitor.bytesSent;
    
    return {
      ...this.bandwidthMonitor,
      duration,
      avgMessageSize: totalMessages > 0 ? totalBytes / totalMessages : 0
    };
  }

  getConnectionHealth(): Record<string, number> {
    const now = Date.now();
    const health: Record<string, number> = {};
    
    this.connectionHealth.forEach((lastSeen, url) => {
      health[url] = now - lastSeen;
    });
    
    return health;
  }

  // Private methods
  private getActiveConnection(): WebSocket | null {
    // Prefer primary, fallback to secondary
    if (this.connections.primary?.readyState === WebSocket.OPEN) {
      return this.connections.primary;
    }
    if (this.connections.fallback?.readyState === WebSocket.OPEN) {
      return this.connections.fallback;
    }
    return null;
  }

  private queueMessage(message: WebSocketMessage, priority: number): void {
    this.messageQueue.push({
      message,
      timestamp: Date.now(),
      priority
    });
    
    // Keep queue size reasonable
    if (this.messageQueue.length > 100) {
      // Remove lowest priority messages
      this.messageQueue.sort((a, b) => b.priority - a.priority);
      this.messageQueue = this.messageQueue.slice(0, 100);
    }
    
    logger.warn('WebSocket message queued', { 
      type: message.type,
      queueSize: this.messageQueue.length 
    });
  }

  private processQueuedMessages(): void {
    if (this.messageQueue.length === 0) return;
    
    // Sort by priority (highest first)
    this.messageQueue.sort((a, b) => b.priority - a.priority);
    
    const messagesToProcess = [...this.messageQueue];
    this.messageQueue = [];
    
    messagesToProcess.forEach(({ message }) => {
      this.send(message);
    });
    
    logger.info('Processed queued messages', { count: messagesToProcess.length });
  }

  private handleMessage(message: WebSocketMessage): void {
    const subscribers = this.subscriptions.get(message.type);
    if (!subscribers) return;
    
    const now = Date.now();
    
    subscribers.forEach(sub => {
      try {
        // Apply throttling if configured
        if (sub.throttleMs && (now - (sub.lastMessage || 0)) < sub.throttleMs) {
          return;
        }
        
        sub.callback(message.payload);
        sub.lastMessage = now;
        
      } catch (error) {
        logger.error('Error in subscription callback', error as Error);
        performanceMonitor.recordMetric('websocket-callback-error', 1, { 
          messageType: message.type 
        });
      }
    });
  }

  private compressMessage(message: WebSocketMessage): string {
    const serialized = JSON.stringify(message);
    
    if (!this.useCompression || serialized.length < this.compressionThreshold) {
      return serialized;
    }
    
    // Simple compression placeholder - in production, use a real compression library
    // For now, just return the original
    return serialized;
  }

  private decompressMessage(data: string): WebSocketMessage {
    // Simple decompression placeholder
    return JSON.parse(data);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'ping',
          payload: { timestamp: Date.now() },
          timestamp: new Date().toISOString(),
        }, 1);
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
      
      logger.info('Attempting WebSocket reconnection', { 
        delayMs: delay, 
        attempt: this.reconnectAttempts, 
        maxAttempts: this.maxReconnectAttempts 
      });
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      logger.error('Max WebSocket reconnection attempts reached');
      performanceMonitor.recordMetric('websocket-max-reconnect-reached', 1);
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

  private authenticateConnection(ws: WebSocket): void {
    const token = localStorage.getItem('auth_token');
    if (token && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'authenticate',
        payload: { token },
        timestamp: new Date().toISOString(),
      }));
    }
  }
}

export const optimizedWebSocketService = new OptimizedWebSocketService();