import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/utils/accessibility';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  finalFocusRef?: React.RefObject<HTMLElement>;
}

const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  initialFocusRef,
  finalFocusRef
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const lastActiveElement = useRef<HTMLElement | null>(null);
  
  const { announce } = useAccessibility();

  // Store the element that was focused before the modal opened
  useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management and trap setup
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Get all focusable elements within the modal
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[role="button"]:not([disabled])',
        '[role="link"]:not([disabled])'
      ];
      
      const elements = modalRef.current?.querySelectorAll(focusableSelectors.join(', ')) || [];
      return Array.from(elements).filter(el => {
        const element = el as HTMLElement;
        return element.offsetParent !== null && // Element is visible
               !element.hasAttribute('aria-hidden') &&
               element.getAttribute('aria-hidden') !== 'true';
      }) as HTMLElement[];
    };

    const elements = getFocusableElements();
    setFocusableElements(elements);

    // Set initial focus
    const initialFocus = initialFocusRef?.current || 
                        elements[0] || 
                        closeButtonRef.current;
    
    if (initialFocus) {
      setTimeout(() => {
        initialFocus.focus();
        announce(`Modal geöffnet: ${title}`, 'assertive');
      }, 100);
    }

    // Cleanup function
    return () => {
      if (finalFocusRef?.current) {
        finalFocusRef.current.focus();
      } else if (lastActiveElement.current && document.contains(lastActiveElement.current)) {
        lastActiveElement.current.focus();
      }
    };
  }, [isOpen, title, initialFocusRef, finalFocusRef, announce]);

  // Keyboard event handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key handling
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab key handling for focus trap
      if (e.key === 'Tab') {
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
        
        if (e.shiftKey) {
          // Shift + Tab - go to previous element
          e.preventDefault();
          const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          focusableElements[prevIndex]?.focus();
          setCurrentFocusIndex(prevIndex);
        } else {
          // Tab - go to next element
          e.preventDefault();
          const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
          focusableElements[nextIndex]?.focus();
          setCurrentFocusIndex(nextIndex);
        }
      }

      // Arrow key navigation (alternative navigation method)
      if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        const nextIndex = currentFocusIndex >= focusableElements.length - 1 ? 0 : currentFocusIndex + 1;
        focusableElements[nextIndex]?.focus();
        setCurrentFocusIndex(nextIndex);
      }

      if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        const prevIndex = currentFocusIndex <= 0 ? focusableElements.length - 1 : currentFocusIndex - 1;
        focusableElements[prevIndex]?.focus();
        setCurrentFocusIndex(prevIndex);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusableElements, currentFocusIndex, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  // Get modal size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-full m-4';
      default: return 'max-w-lg';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full glass-card-medium rounded-2xl shadow-2xl border border-white/20 backdrop-blur-2xl',
          'bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-indigo-900/95',
          'animate-in zoom-in-95 duration-300',
          getSizeClasses(),
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 
            id="modal-title" 
            className="text-xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-emerald-300 bg-clip-text text-transparent"
          >
            {title}
          </h2>
          
          {showCloseButton && (
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className={cn(
                "p-2 rounded-xl hover:bg-white/10 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                "text-blue-200 hover:text-white"
              )}
              aria-label="Modal schließen"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div 
          id="modal-description" 
          className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          {children}
        </div>

        {/* Screen reader instructions */}
        <div className="sr-only">
          <p>Verwenden Sie Tab oder Umschalt+Tab um zwischen den Elementen zu navigieren.</p>
          <p>Drücken Sie Escape um das Modal zu schließen.</p>
          <p>Oder verwenden Sie Strg+Pfeil-Auf/Pfeil-Ab für alternative Navigation.</p>
        </div>
      </div>
    </div>
  );
};

export default AccessibleModal;