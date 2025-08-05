import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'd',
    ctrl: true,
    action: () => window.location.href = '/dashboard',
    description: 'Go to Dashboard',
    category: 'Navigation'
  },
  {
    key: 'b',
    ctrl: true,
    action: () => window.location.href = '/buildings',
    description: 'Go to Buildings',
    category: 'Navigation'
  },
  {
    key: 'a',
    ctrl: true,
    action: () => window.location.href = '/analytics',
    description: 'Go to Analytics',
    category: 'Navigation'
  },
  {
    key: '/',
    ctrl: true,
    action: () => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      searchInput?.focus();
    },
    description: 'Focus Search',
    category: 'Actions'
  },
  {
    key: 'Escape',
    action: () => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        const closeButton = modal.querySelector('[aria-label="Close"]') as HTMLElement;
        closeButton?.click();
      }
    },
    description: 'Close Modal',
    category: 'Actions'
  },
  {
    key: '?',
    shift: true,
    action: () => {
      console.log('Opening help modal...');
      // Trigger help modal
    },
    description: 'Show Help',
    category: 'Help'
  }
];

export const useKeyboardShortcuts = (
  customShortcuts: KeyboardShortcut[] = [],
  enabled: boolean = true
) => {
  const navigate = useNavigate();
  const shortcuts = useRef<KeyboardShortcut[]>([...DEFAULT_SHORTCUTS, ...customShortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Skip if user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Exception for Escape key
      if (event.key !== 'Escape') return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.current.find(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const metaMatch = shortcut.meta ? event.metaKey : true;

      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.action();
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    shortcuts.current = [...shortcuts.current, shortcut];
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    shortcuts.current = shortcuts.current.filter(s => s.key !== key);
  }, []);

  const getShortcuts = useCallback(() => {
    return shortcuts.current;
  }, []);

  return {
    registerShortcut,
    unregisterShortcut,
    getShortcuts,
    shortcuts: shortcuts.current
  };
};

// Global keyboard shortcuts provider
import React from 'react';

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useKeyboardShortcuts([], true);
  return React.createElement(React.Fragment, null, children);
};