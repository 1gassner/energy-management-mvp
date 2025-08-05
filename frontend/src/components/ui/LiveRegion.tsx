import React, { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '@/utils/accessibility';

interface LiveRegionProps {
  /** Message to announce */
  message?: string;
  /** Priority level for announcements */
  priority?: 'polite' | 'assertive' | 'off';
  /** Whether to clear the message after announcing */
  clearAfterAnnounce?: boolean;
  /** Delay before clearing message (ms) */
  clearDelay?: number;
  /** CSS classes for styling */
  className?: string;
  /** Whether to show visually (for debugging) */
  visible?: boolean;
  /** Whether the region should be atomic */
  atomic?: boolean;
}

/**
 * LiveRegion component for announcing dynamic content changes to screen readers
 * Uses aria-live regions to communicate updates without interrupting user flow
 */
const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  clearAfterAnnounce = true,
  clearDelay = 1000,
  className = '',
  visible = false,
  atomic = true
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (message && message !== currentMessage) {
      setCurrentMessage(message);

      if (clearAfterAnnounce && clearDelay > 0) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set new timeout to clear message
        timeoutRef.current = setTimeout(() => {
          setCurrentMessage('');
        }, clearDelay);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, currentMessage, clearAfterAnnounce, clearDelay]);

  const baseStyles = visible 
    ? 'p-2 border border-blue-400 bg-blue-50 text-blue-900 rounded text-sm'
    : `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className={`${baseStyles} ${className}`}
      style={visible ? {} : {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    >
      {currentMessage}
    </div>
  );
};

export default LiveRegion;

/**
 * Hook for using live regions with the accessibility manager
 */
export const useLiveRegion = () => {
  const { announce } = useAccessibility();
  const [message, setMessage] = useState('');

  const announceMessage = (msg: string, priority: 'polite' | 'assertive' = 'polite') => {
    setMessage(msg);
    announce(msg, priority);
  };

  const clearMessage = () => {
    setMessage('');
  };

  return {
    message,
    announceMessage,
    clearMessage
  };
};

/**
 * Status announcer for system updates
 */
export const StatusAnnouncer: React.FC<{
  status?: 'loading' | 'success' | 'error' | 'idle';
  message?: string;
  visible?: boolean;
}> = ({ status, message, visible = false }) => {
  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'loading':
        return 'Daten werden geladen...';
      case 'success':
        return 'Daten erfolgreich geladen';
      case 'error':
        return 'Fehler beim Laden der Daten';
      default:
        return '';
    }
  };

  const getPriority = (): 'polite' | 'assertive' => {
    return status === 'error' ? 'assertive' : 'polite';
  };

  return (
    <LiveRegion
      message={getStatusMessage()}
      priority={getPriority()}
      visible={visible}
      clearAfterAnnounce={status !== 'loading'}
    />
  );
};

/**
 * Form validation announcer
 */
export const ValidationAnnouncer: React.FC<{
  errors?: string[];
  visible?: boolean;
}> = ({ errors = [], visible = false }) => {
  const errorMessage = errors.length > 0 
    ? `${errors.length === 1 ? 'Fehler' : `${errors.length} Fehler`}: ${errors.join(', ')}`
    : '';

  return (
    <LiveRegion
      message={errorMessage}
      priority="assertive"
      visible={visible}
      clearAfterAnnounce={false}
    />
  );
};

/**
 * Data update announcer for tables and lists
 */
export const DataUpdateAnnouncer: React.FC<{
  itemCount?: number;
  itemType?: string;
  action?: 'loaded' | 'updated' | 'deleted' | 'created';
  visible?: boolean;
}> = ({ itemCount = 0, itemType = 'Einträge', action = 'loaded', visible = false }) => {
  const getMessage = () => {
    const count = itemCount === 1 ? `1 ${itemType.slice(0, -1)}` : `${itemCount} ${itemType}`;
    
    switch (action) {
      case 'loaded':
        return `${count} geladen`;
      case 'updated':
        return `${count} aktualisiert`;
      case 'deleted':
        return `${count} gelöscht`;
      case 'created':
        return `${count} erstellt`;
      default:
        return `${count} ${action}`;
    }
  };

  return (
    <LiveRegion
      message={getMessage()}
      priority="polite"
      visible={visible}
    />
  );
};