/**
 * Accessibility Testing Utilities
 * Collection of functions to help test and validate accessibility improvements
 */

export interface AccessibilityTestResult {
  passed: boolean;
  message: string;
  element?: HTMLElement;
}

/**
 * Test if an element has proper keyboard support
 */
export const testKeyboardAccessibility = (element: HTMLElement): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];
  
  // Check if interactive element is focusable
  const isInteractive = element.matches('button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]');
  if (isInteractive) {
    const tabIndex = element.getAttribute('tabindex');
    const isFocusable = tabIndex !== '-1' && !element.hasAttribute('disabled');
    
    results.push({
      passed: isFocusable,
      message: isFocusable ? 'Element is properly focusable' : 'Interactive element is not focusable',
      element
    });
  }
  
  // Check for aria-label or accessible name
  const hasAriaLabel = element.getAttribute('aria-label');
  const hasAriaLabelledBy = element.getAttribute('aria-labelledby');
  const hasTitle = element.getAttribute('title');
  const hasTextContent = element.textContent?.trim();
  
  const hasAccessibleName = hasAriaLabel || hasAriaLabelledBy || hasTitle || hasTextContent;
  
  results.push({
    passed: hasAccessibleName,
    message: hasAccessibleName ? 'Element has accessible name' : 'Element lacks accessible name',
    element
  });
  
  return results;
};

/**
 * Test dropdown/menu accessibility
 */
export const testDropdownAccessibility = (trigger: HTMLElement, menu?: HTMLElement): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];
  
  // Check trigger attributes
  const hasAriaExpanded = trigger.hasAttribute('aria-expanded');
  const hasAriaHaspopup = trigger.hasAttribute('aria-haspopup');
  
  results.push({
    passed: hasAriaExpanded,
    message: hasAriaExpanded ? 'Trigger has aria-expanded' : 'Trigger missing aria-expanded',
    element: trigger
  });
  
  results.push({
    passed: hasAriaHaspopup,
    message: hasAriaHaspopup ? 'Trigger has aria-haspopup' : 'Trigger missing aria-haspopup',
    element: trigger
  });
  
  // Check menu attributes if provided
  if (menu) {
    const hasRole = menu.getAttribute('role') === 'menu';
    const hasAriaLabelledBy = menu.hasAttribute('aria-labelledby');
    
    results.push({
      passed: hasRole,
      message: hasRole ? 'Menu has proper role' : 'Menu missing role="menu"',
      element: menu
    });
    
    results.push({
      passed: hasAriaLabelledBy,
      message: hasAriaLabelledBy ? 'Menu has aria-labelledby' : 'Menu missing aria-labelledby',
      element: menu
    });
    
    // Check menu items
    const menuItems = menu.querySelectorAll('[role="menuitem"]');
    results.push({
      passed: menuItems.length > 0,
      message: menuItems.length > 0 ? `Menu has ${menuItems.length} menu items` : 'Menu has no menu items',
      element: menu
    });
  }
  
  return results;
};

/**
 * Test table accessibility
 */
export const testTableAccessibility = (table: HTMLElement): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];
  
  // Check if it's a proper table
  const isTable = table.tagName === 'TABLE' || table.getAttribute('role') === 'table';
  results.push({
    passed: isTable,
    message: isTable ? 'Element is properly marked as table' : 'Element not properly marked as table',
    element: table
  });
  
  if (isTable) {
    // Check for caption or aria-label
    const caption = table.querySelector('caption');
    const ariaLabel = table.getAttribute('aria-label');
    const hasCaption = caption || ariaLabel;
    
    results.push({
      passed: !!hasCaption,
      message: hasCaption ? 'Table has caption or aria-label' : 'Table missing caption or aria-label',
      element: table
    });
    
    // Check for thead
    const thead = table.querySelector('thead');
    results.push({
      passed: !!thead,
      message: thead ? 'Table has thead' : 'Table missing thead',
      element: table
    });
    
    // Check for th with scope
    const headers = table.querySelectorAll('th');
    let headersWithScope = 0;
    headers.forEach(th => {
      if (th.hasAttribute('scope')) {
        headersWithScope++;
      }
    });
    
    results.push({
      passed: headersWithScope === headers.length,
      message: `${headersWithScope}/${headers.length} headers have scope attribute`,
      element: table
    });
  }
  
  return results;
};

/**
 * Test modal accessibility
 */
export const testModalAccessibility = (modal: HTMLElement): AccessibilityTestResult[] => {
  const results: AccessibilityTestResult[] = [];
  
  // Check role and aria-modal
  const hasRole = modal.getAttribute('role') === 'dialog';
  const hasAriaModal = modal.getAttribute('aria-modal') === 'true';
  
  results.push({
    passed: hasRole,
    message: hasRole ? 'Modal has role="dialog"' : 'Modal missing role="dialog"',
    element: modal
  });
  
  results.push({
    passed: hasAriaModal,
    message: hasAriaModal ? 'Modal has aria-modal="true"' : 'Modal missing aria-modal="true"',
    element: modal
  });
  
  // Check for aria-labelledby
  const hasAriaLabelledBy = modal.hasAttribute('aria-labelledby');
  results.push({
    passed: hasAriaLabelledBy,
    message: hasAriaLabelledBy ? 'Modal has aria-labelledby' : 'Modal missing aria-labelledby',
    element: modal
  });
  
  // Check for focusable elements
  const focusableElements = modal.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
  );
  
  results.push({
    passed: focusableElements.length > 0,
    message: focusableElements.length > 0 
      ? `Modal has ${focusableElements.length} focusable elements` 
      : 'Modal has no focusable elements',
    element: modal
  });
  
  return results;
};

/**
 * Run comprehensive accessibility audit on page
 */
export const runAccessibilityAudit = (): {
  passed: number;
  failed: number;
  results: AccessibilityTestResult[];
} => {
  const results: AccessibilityTestResult[] = [];
  
  // Test all buttons
  document.querySelectorAll('button').forEach(button => {
    results.push(...testKeyboardAccessibility(button as HTMLElement));
  });
  
  // Test all dropdowns
  document.querySelectorAll('[aria-haspopup]').forEach(trigger => {
    const menuId = trigger.getAttribute('aria-controls');
    const menu = menuId ? document.getElementById(menuId) : null;
    results.push(...testDropdownAccessibility(trigger as HTMLElement, menu as HTMLElement));
  });
  
  // Test all tables
  document.querySelectorAll('table, [role="table"]').forEach(table => {
    results.push(...testTableAccessibility(table as HTMLElement));
  });
  
  // Test all modals
  document.querySelectorAll('[role="dialog"]').forEach(modal => {
    results.push(...testModalAccessibility(modal as HTMLElement));
  });
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  return { passed, failed, results };
};

/**
 * Log accessibility audit results to console
 */
export const logAccessibilityAudit = () => {
  const audit = runAccessibilityAudit();
  
  console.group('🔍 Accessibility Audit Results');
  console.log(`✅ Passed: ${audit.passed}`);
  console.log(`❌ Failed: ${audit.failed}`);
  console.log(`📊 Total: ${audit.results.length}`);
  
  if (audit.failed > 0) {
    console.group('❌ Failed Tests:');
    audit.results
      .filter(r => !r.passed)
      .forEach(result => {
        console.warn(result.message, result.element);
      });
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return audit;
};

/**
 * Keyboard navigation test helper
 */
export const testKeyboardNavigation = (startElement: HTMLElement) => {
  console.group('⌨️ Keyboard Navigation Test');
  console.log('Starting from:', startElement);
  
  const focusableElements = document.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
  );
  
  console.log(`Found ${focusableElements.length} focusable elements`);
  
  let currentIndex = Array.from(focusableElements).indexOf(startElement);
  
  const navigate = (direction: 'forward' | 'backward') => {
    if (direction === 'forward') {
      currentIndex = (currentIndex + 1) % focusableElements.length;
    } else {
      currentIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    }
    
    const nextElement = focusableElements[currentIndex] as HTMLElement;
    nextElement.focus();
    console.log(`Focused: ${nextElement.tagName} - ${nextElement.getAttribute('aria-label') || nextElement.textContent?.substring(0, 50) || 'No label'}`);
    
    return nextElement;
  };
  
  // Add to window for manual testing
  (window as any).navigateForward = () => navigate('forward');
  (window as any).navigateBackward = () => navigate('backward');
  
  console.log('Use navigateForward() and navigateBackward() to test navigation');
  console.groupEnd();
};