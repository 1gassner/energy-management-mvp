import React, { memo, useMemo } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
  showText?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = memo(({ 
  className = '', 
  showText = true 
}) => {
  const { connectionState } = useWebSocket();

  const statusConfig = useMemo(() => {
    switch (connectionState) {
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />,
          text: 'Connecting...',
          color: 'text-yellow-600'
        };
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4 text-green-500" />,
          text: 'Connected',
          color: 'text-green-600'
        };
      case 'disconnected':
      case 'closed':
        return {
          icon: <WifiOff className="w-4 h-4 text-red-500" />,
          text: 'Disconnected',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4 text-gray-500" />,
          text: 'Unknown',
          color: 'text-gray-600'
        };
    }
  }, [connectionState]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {statusConfig.icon}
      {showText && (
        <span className={`text-sm font-medium ${statusConfig.color}`}>
          {statusConfig.text}
        </span>
      )}
    </div>
  );
});

ConnectionStatus.displayName = 'ConnectionStatus';

export default ConnectionStatus;