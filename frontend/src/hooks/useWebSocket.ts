import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { websocketService } from '@/services/websocket.service';
import { WebSocketMessage, WebSocketPayload } from '@/types';

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
}

export function useWebSocket(messageType?: string, options: UseWebSocketOptions = {}) {
  const { onMessage, onConnect, onDisconnect, autoConnect = true, reconnectOnMount = true } = options;
  const subscriptionId = useRef<string | null>(null);
  const connectionUnsubscribe = useRef<(() => void) | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('disconnected');

  const subscribe = useCallback(
    (type: string, callback: (data: unknown) => void) => {
      if (subscriptionId.current) {
        websocketService.unsubscribe(subscriptionId.current);
      }
      subscriptionId.current = websocketService.subscribe(type, callback);
      return subscriptionId.current;
    },
    []
  );

  const unsubscribe = useCallback(() => {
    if (subscriptionId.current) {
      websocketService.unsubscribe(subscriptionId.current);
      subscriptionId.current = null;
    }
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    websocketService.send(message);
  }, []);

  const connect = useCallback(() => {
    websocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  // Memoize connection state updater to prevent unnecessary re-renders
  const updateConnectionState = useCallback(() => {
    const connected = websocketService.isConnected;
    const state = websocketService.connectionState;
    
    setIsConnected(prev => prev !== connected ? connected : prev);
    setConnectionState(prev => prev !== state ? state : prev);

    if (connected && onConnect) {
      onConnect();
    } else if (!connected && onDisconnect) {
      onDisconnect();
    }
  }, [onConnect, onDisconnect]);

  // Update connection state
  useEffect(() => {

    // Set up connection listener
    connectionUnsubscribe.current = websocketService.onConnectionChange(updateConnectionState);

    // Initial update
    updateConnectionState();

    return () => {
      if (connectionUnsubscribe.current) {
        connectionUnsubscribe.current();
        connectionUnsubscribe.current = null;
      }
    };
  }, [updateConnectionState]);

  // Auto-connect logic
  useEffect(() => {
    if (autoConnect && reconnectOnMount) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        if (!websocketService.isConnected) {
          connect();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoConnect, reconnectOnMount, connect]);

  // Message subscription
  useEffect(() => {
    if (messageType && onMessage) {
      subscribe(messageType, (data) => {
        onMessage({
          type: messageType as WebSocketMessage['type'],
          payload: data as WebSocketPayload,
          timestamp: new Date().toISOString(),
        });
      });
    }

    return () => {
      unsubscribe();
    };
  }, [messageType, onMessage, subscribe, unsubscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribe();
      if (connectionUnsubscribe.current) {
        connectionUnsubscribe.current();
      }
    };
  }, [unsubscribe]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    isConnected,
    connectionState,
    subscribe,
    unsubscribe,
    send,
    connect,
    disconnect,
  }), [isConnected, connectionState, subscribe, unsubscribe, send, connect, disconnect]);
}