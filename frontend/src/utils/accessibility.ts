// Comprehensive accessibility utilities for WCAG 2.1 AA compliance
import React from 'react';

export interface AccessibilityOptions {
  announceChanges?: boolean;
  provideFocus?: boolean;
  respectPreferences?: boolean;
}

class AccessibilityManager {
  private announcer: HTMLElement | null = null;
  private focusHistory: HTMLElement[] = [];
  private keyboardNavigation = true;
  private reducedMotion = false;
  private highContrast = false;
  private fontSize = 16;

  constructor() {
    this.initializeAnnouncer();
    this.detectUserPreferences();
    this.setupGlobalKeyboardHandlers();
    this.setupFocusManagement();
  }

  // Live region announcer for screen readers
  private initializeAnnouncer(): void {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.setAttribute('class', 'sr-only');
    this.announcer.style.cssText = `
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
    document.body.appendChild(this.announcer);
  }

  // Announce messages to screen readers
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer) return;

    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;

    // Clear after announcement to allow re-announcing the same message
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 1000);
  }

  // Detect user accessibility preferences
  private detectUserPreferences(): void {
    // Reduced motion
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // High contrast
    this.highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Listen for changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      this.applyMotionPreferences();
    });

    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.highContrast = e.matches;
      this.applyContrastPreferences();
    });

    this.applyMotionPreferences();
    this.applyContrastPreferences();
  }

  private applyMotionPreferences(): void {
    document.documentElement.classList.toggle('reduce-motion', this.reducedMotion);
    
    if (this.reducedMotion) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  private applyContrastPreferences(): void {
    document.documentElement.classList.toggle('high-contrast', this.highContrast);
  }

  // Setup global keyboard navigation
  private setupGlobalKeyboardHandlers(): void {
    document.addEventListener('keydown', (e) => {
      // Skip to main content (Alt + S)
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        this.skipToMainContent();
      }

      // Open accessibility menu (Alt + A)
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        this.openAccessibilityMenu();
      }

      // Escape key handling
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }

      // Tab trapping for modals
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
    });

    // Show focus indicators when using keyboard
    document.addEventListener('keydown', () => {
      document.body.classList.add('keyboard-navigation');
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  private skipToMainContent(): void {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent && mainContent instanceof HTMLElement) {
      mainContent.focus();
      this.announce('Skipped to main content');
    }
  }

  private openAccessibilityMenu(): void {
    // Create or show accessibility menu
    let menu = document.getElementById('accessibility-menu');
    if (!menu) {
      menu = this.createAccessibilityMenu();
    }
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    if (menu.style.display === 'block') {
      (menu.querySelector('button') as HTMLElement)?.focus();
    }
  }

  private createAccessibilityMenu(): HTMLElement {
    const menu = document.createElement('div');
    menu.id = 'accessibility-menu';
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Accessibility Options');
    menu.className = 'accessibility-menu';
    
    menu.innerHTML = `
      <div class="accessibility-menu-content">
        <h2>Accessibility Options</h2>
        
        <div class="accessibility-option">
          <button id="increase-font" type="button">
            <span class="icon" aria-hidden="true">A+</span>
            Increase Font Size
          </button>
        </div>
        
        <div class="accessibility-option">
          <button id="decrease-font" type="button">
            <span class="icon" aria-hidden="true">A-</span>
            Decrease Font Size
          </button>
        </div>
        
        <div class="accessibility-option">
          <button id="toggle-contrast" type="button">
            <span class="icon" aria-hidden="true">◐</span>
            Toggle High Contrast
          </button>
        </div>
        
        <div class="accessibility-option">
          <button id="toggle-motion" type="button">
            <span class="icon" aria-hidden="true">⏸</span>
            ${this.reducedMotion ? 'Enable' : 'Disable'} Animations
          </button>
        </div>
        
        <div class="accessibility-option">
          <button id="close-menu" type="button">
            <span class="icon" aria-hidden="true">✕</span>
            Close Menu
          </button>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .accessibility-menu {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: white;
        border: 2px solid #333;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 300px;
      }
      
      .accessibility-menu-content h2 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        color: #333;
      }
      
      .accessibility-option {
        margin-bottom: 0.5rem;
      }
      
      .accessibility-option button {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ccc;
        background: white;
        text-align: left;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .accessibility-option button:hover,
      .accessibility-option button:focus {
        background: #f0f0f0;
        border-color: #007cba;
        outline: 2px solid #007cba;
      }
      
      .accessibility-option .icon {
        font-weight: bold;
        width: 1.5rem;
        text-align: center;
      }
    `;
    document.head.appendChild(style);

    // Add event listeners
    menu.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      if (!button) return;

      switch (button.id) {
        case 'increase-font':
          this.changeFontSize(2);
          break;
        case 'decrease-font':
          this.changeFontSize(-2);
          break;
        case 'toggle-contrast':
          this.toggleHighContrast();
          break;
        case 'toggle-motion':
          this.toggleReducedMotion();
          break;
        case 'close-menu':
          menu.style.display = 'none';
          break;
      }
    });

    document.body.appendChild(menu);
    return menu;
  }

  private changeFontSize(delta: number): void {
    this.fontSize = Math.max(12, Math.min(24, this.fontSize + delta));
    document.documentElement.style.fontSize = `${this.fontSize}px`;
    this.announce(`Font size ${delta > 0 ? 'increased' : 'decreased'} to ${this.fontSize} pixels`);
  }

  private toggleHighContrast(): void {
    this.highContrast = !this.highContrast;
    document.documentElement.classList.toggle('high-contrast', this.highContrast);
    this.announce(`High contrast ${this.highContrast ? 'enabled' : 'disabled'}`);
  }

  private toggleReducedMotion(): void {
    this.reducedMotion = !this.reducedMotion;
    this.applyMotionPreferences();
    this.announce(`Animations ${this.reducedMotion ? 'disabled' : 'enabled'}`);
  }

  private handleEscapeKey(): void {
    // Close any open modals, menus, etc.
    const menu = document.getElementById('accessibility-menu');
    if (menu && menu.style.display !== 'none') {
      menu.style.display = 'none';
      return;
    }

    // Close other modal elements
    const modals = document.querySelectorAll('[role="dialog"][aria-hidden="false"], .modal.open');
    modals.forEach(modal => {
      if (modal instanceof HTMLElement) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  private handleTabNavigation(e: KeyboardEvent): void {
    const activeModal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
    if (activeModal) {
      this.trapFocusInModal(e, activeModal as HTMLElement);
    }
  }

  private trapFocusInModal(e: KeyboardEvent, modal: HTMLElement): void {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  // Focus management
  private setupFocusManagement(): void {
    // Track focus history for restoration
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target && target !== document.body) {
        this.focusHistory.push(target);
        // Keep only last 10 focused elements
        if (this.focusHistory.length > 10) {
          this.focusHistory.shift();
        }
      }
    });
  }

  // Focus utilities
  focusElement(element: HTMLElement | string, options: AccessibilityOptions = {}): void {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (target && target instanceof HTMLElement) {
      // Make element focusable if it isn't already
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      
      target.focus();
      
      if (options.announceChanges) {
        const label = this.getAccessibleName(target);
        this.announce(`Focused on ${label}`);
      }
    }
  }

  restoreFocus(): void {
    if (this.focusHistory.length > 1) {
      // Get the element before the current one
      const previousElement = this.focusHistory[this.focusHistory.length - 2];
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus();
      }
    }
  }

  getAccessibleName(element: HTMLElement): string {
    // Check aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent || '';
    }

    // Check associated label
    if (element instanceof HTMLInputElement) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent || '';
    }

    // Check title
    const title = element.getAttribute('title');
    if (title) return title;

    // Fall back to text content
    return element.textContent || element.tagName.toLowerCase();
  }

  // ARIA utilities
  setARIAAttributes(element: HTMLElement, attributes: Record<string, string>): void {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key.startsWith('aria-') ? key : `aria-${key}`, value);
    });
  }

  announceRegion(regionSelector: string, message?: string): void {
    const region = document.querySelector(regionSelector);
    if (region) {
      const announcement = message || `${this.getAccessibleName(region as HTMLElement)} region updated`;
      this.announce(announcement);
    }
  }

  // Keyboard navigation helpers  
  createRovingTabIndex(container: HTMLElement, itemSelector: string): void {
    const items = container.querySelectorAll(itemSelector) as NodeListOf<HTMLElement>;
    let currentIndex = 0;

    // Set initial tab indices
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });

    container.addEventListener('keydown', (e) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        return;
      }

      e.preventDefault();

      const isVertical = e.key === 'ArrowUp' || e.key === 'ArrowDown';
      const isForward = e.key === 'ArrowDown' || e.key === 'ArrowRight';

      let newIndex = currentIndex;

      if (e.key === 'Home') {
        newIndex = 0;
      } else if (e.key === 'End') {
        newIndex = items.length - 1;
      } else if (isVertical || !isVertical) {
        newIndex = isForward ? currentIndex + 1 : currentIndex - 1;
        
        // Wrap around
        if (newIndex >= items.length) newIndex = 0;
        if (newIndex < 0) newIndex = items.length - 1;
      }

      // Update tab indices and focus
      items[currentIndex].setAttribute('tabindex', '-1');
      items[newIndex].setAttribute('tabindex', '0');
      items[newIndex].focus();
      
      currentIndex = newIndex;
    });
  }

  // Color contrast utilities
  checkContrast(foreground: string, background: string): {
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
  } {
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    
    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                  (Math.min(fgLuminance, bgLuminance) + 0.05);

    return {
      ratio,
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7
    };
  }

  private getLuminance(color: string): number {
    // Simple luminance calculation - in production use a proper color library
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Cleanup
  destroy(): void {
    if (this.announcer) {
      this.announcer.remove();
    }
    
    const menu = document.getElementById('accessibility-menu');
    if (menu) {
      menu.remove();
    }
  }
}

// Export singleton instance
export const accessibilityManager = new AccessibilityManager();

// React hook for accessibility features
export const useAccessibility = () => {
  const announce = React.useCallback((message: string, priority?: 'polite' | 'assertive') => {
    accessibilityManager.announce(message, priority);
  }, []);

  const focusElement = React.useCallback((element: HTMLElement | string, options?: AccessibilityOptions) => {
    accessibilityManager.focusElement(element, options);
  }, []);

  const restoreFocus = React.useCallback(() => {
    accessibilityManager.restoreFocus();
  }, []);

  return {
    announce,
    focusElement,
    restoreFocus,
    manager: accessibilityManager
  };
};

export default accessibilityManager;