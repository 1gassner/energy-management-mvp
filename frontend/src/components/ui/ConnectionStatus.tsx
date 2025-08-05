import React, { memo, useMemo, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useAccessibility } from '@/utils/accessibility';

interface ConnectionStatusProps {
  className?: string;
  showText?: boolean;
  announceChanges?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = memo(({ 
  className = '', 
  showText = true,
  announceChanges = true
}) => {
  const { connectionState } = useWebSocket();
  const { announce } = useAccessibility();
  const previousState = useRef<string>('');

  const statusConfig = useMemo(() => {
    switch (connectionState) {
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />,
          text: 'Verbindung wird hergestellt...',
          englishText: 'Connecting...',
          color: 'text-yellow-600',
          ariaLabel: 'Verbindungsstatus: Verbindung wird hergestellt'
        };
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4 text-green-500" />,
          text: 'Verbunden',
          englishText: 'Connected',
          color: 'text-green-600',
          ariaLabel: 'Verbindungsstatus: Erfolgreich verbunden'
        };
      case 'disconnected':
      case 'closed':
        return {
          icon: <WifiOff className="w-4 h-4 text-red-500" />,
          text: 'Getrennt',
          englishText: 'Disconnected',
          color: 'text-red-600',
          ariaLabel: 'Verbindungsstatus: Verbindung getrennt'
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4 text-gray-500" />,
          text: 'Unbekannt',
          englishText: 'Unknown',
          color: 'text-gray-600',
          ariaLabel: 'Verbindungsstatus: Unbekannt'
        };
    }
  }, [connectionState]);

  // Announce connection state changes
  useEffect(() => {
    if (announceChanges && previousState.current && previousState.current !== connectionState) {
      const priority = connectionState === 'disconnected' || connectionState === 'closed' ? 'assertive' : 'polite';
      announce(`Verbindungsstatus geändert: ${statusConfig.text}`, priority);
    }
    previousState.current = connectionState;
  }, [connectionState, statusConfig.text, announce, announceChanges]);

  return (
    <div 
      className={`flex items-center space-x-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={statusConfig.ariaLabel}
    >
      <div aria-hidden="true">
        {statusConfig.icon}
      </div>
      {showText && (
        <span className={`text-sm font-medium ${statusConfig.color}`}>
          {statusConfig.text}
        </span>
      )}
      
      {/* Screen reader only status */}
      <span className="sr-only">
        {statusConfig.ariaLabel}
      </span>
    </div>
  );
});

ConnectionStatus.displayName = 'ConnectionStatus';

export default ConnectionStatus;