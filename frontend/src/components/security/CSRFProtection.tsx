import React, { useEffect } from 'react';
import { securityService } from '@/services/securityService';

interface CSRFProtectionProps {
  children: React.ReactNode;
}

/**
 * CSRF Protection wrapper component that generates and manages CSRF tokens
 * Automatically adds CSRF tokens to all forms within its children
 */
const CSRFProtection: React.FC<CSRFProtectionProps> = ({ children }) => {
  
  useEffect(() => {
    // Generate initial CSRF token
    const token = securityService.generateCSRFToken();
    
    // Add CSRF token to all existing forms on mount
    const addCSRFTokenToForms = () => {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        // Skip forms that already have CSRF token
        if (form.querySelector('input[name="csrf-token"]')) {
          return;
        }
        
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrf-token';
        csrfInput.value = token;
        form.appendChild(csrfInput);
      });
    };

    // Initial setup
    addCSRFTokenToForms();
    
    // Watch for dynamically added forms
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added node is a form
            if (element.tagName === 'FORM') {
              const form = element as HTMLFormElement;
              if (!form.querySelector('input[name="csrf-token"]')) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf-token';
                csrfInput.value = token;
                form.appendChild(csrfInput);
              }
            }
            
            // Check if the added node contains forms
            const forms = element.querySelectorAll('form');
            forms.forEach(form => {
              if (!form.querySelector('input[name="csrf-token"]')) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf-token';
                csrfInput.value = token;
                form.appendChild(csrfInput);
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
};

/**
 * Hook to get current CSRF token
 */
export const useCSRFToken = (): string => {
  return securityService.generateCSRFToken();
};

/**
 * Higher-order component to add CSRF protection to forms
 */
export const withCSRFProtection = <T extends object>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T> => {
  const WithCSRFProtection = (props: T) => (
    <CSRFProtection>
      <WrappedComponent {...props} />
    </CSRFProtection>
  );
  
  WithCSRFProtection.displayName = `withCSRFProtection(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithCSRFProtection;
};

export default CSRFProtection;