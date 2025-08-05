/**
 * Mobile Responsive Testing Helper
 * Utilities für das Testen der mobilen Responsivität
 */

export interface TouchTarget {
  element: HTMLElement;
  rect: DOMRect;
  isValid: boolean;
  size: { width: number; height: number };
}

export interface ResponsiveTestResult {
  viewport: { width: number; height: number };
  touchTargets: TouchTarget[];
  hasHorizontalScroll: boolean;
  performanceMetrics: {
    renderTime: number;
    layoutShifts: number;
    memoryUsage?: number;
  };
  accessibility: {
    focusableElements: number;
    ariaLabels: number;
    semanticStructure: boolean;
  };
}

/**
 * Überprüft alle Touch-Targets auf die Mindestgröße von 44px
 */
export function validateTouchTargets(): TouchTarget[] {
  const touchableSelectors = [
    'button',
    'a',
    'input[type="button"]',
    'input[type="submit"]',
    '[role="button"]',
    '.touch-target',
    '[onclick]'
  ];

  const results: TouchTarget[] = [];

  touchableSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      
      // Berücksichtige padding und border für die effektive Touch-Größe
      const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
      const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
      
      const effectiveWidth = rect.width + paddingX;
      const effectiveHeight = rect.height + paddingY;
      
      const isValid = effectiveWidth >= 44 && effectiveHeight >= 44;
      
      results.push({
        element,
        rect,
        isValid,
        size: { width: effectiveWidth, height: effectiveHeight }
      });
    });
  });

  return results;
}

/**
 * Überprüft auf horizontales Scrollen
 */
export function checkHorizontalScroll(): boolean {
  const body = document.body;
  const html = document.documentElement;
  
  const scrollWidth = Math.max(
    body.scrollWidth,
    body.offsetWidth,
    html.clientWidth,
    html.scrollWidth,
    html.offsetWidth
  );
  
  return scrollWidth > window.innerWidth;
}

/**
 * Misst die Performance von Charts und Dashboard-Komponenten
 */
export function measureMobilePerformance(): Promise<ResponsiveTestResult['performanceMetrics']> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let layoutShifts = 0;
    
    // Layout Shift Observer
    if ('LayoutShift' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          layoutShifts += (entry as any).value;
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      
      // Beobachte für 3 Sekunden
      setTimeout(() => {
        observer.disconnect();
        const endTime = performance.now();
        
        resolve({
          renderTime: endTime - startTime,
          layoutShifts,
          memoryUsage: (performance as any).memory?.usedJSHeapSize
        });
      }, 3000);
    } else {
      const endTime = performance.now();
      resolve({
        renderTime: endTime - startTime,
        layoutShifts: 0
      });
    }
  });
}

/**
 * Überprüft Accessibility-Features für mobile Geräte
 */
export function checkMobileAccessibility(): ResponsiveTestResult['accessibility'] {
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ).length;
  
  const elementsWithAriaLabels = document.querySelectorAll(
    '[aria-label], [aria-labelledby], [aria-describedby]'
  ).length;
  
  // Überprüfe semantische Struktur
  const hasMainLandmark = document.querySelector('main, [role="main"]') !== null;
  const hasNavigation = document.querySelector('nav, [role="navigation"]') !== null;
  const hasProperHeadings = document.querySelector('h1') !== null;
  
  const semanticStructure = hasMainLandmark && hasNavigation && hasProperHeadings;
  
  return {
    focusableElements,
    ariaLabels: elementsWithAriaLabels,
    semanticStructure
  };
}

/**
 * Führt einen kompletten Responsive-Test durch
 */
export async function runMobileResponsiveTest(): Promise<ResponsiveTestResult> {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  const touchTargets = validateTouchTargets();
  const hasHorizontalScroll = checkHorizontalScroll();
  const performanceMetrics = await measureMobilePerformance();
  const accessibility = checkMobileAccessibility();
  
  return {
    viewport,
    touchTargets,
    hasHorizontalScroll,
    performanceMetrics,
    accessibility
  };
}

/**
 * Simuliert verschiedene Viewport-Größen für Testing
 */
export const MOBILE_VIEWPORTS = {
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 12': { width: 390, height: 844 },
  'iPhone 12 Pro Max': { width: 428, height: 926 },
  'Samsung Galaxy S21': { width: 360, height: 800 },
  'iPad Mini': { width: 768, height: 1024 },
  'iPad Pro': { width: 1024, height: 1366 }
} as const;

/**
 * Testet verschiedene Viewport-Größen
 */
export async function testMultipleViewports(): Promise<Record<string, ResponsiveTestResult>> {
  const results: Record<string, ResponsiveTestResult> = {};
  
  for (const [deviceName, viewport] of Object.entries(MOBILE_VIEWPORTS)) {
    // Simuliere Viewport-Änderung (nur für Entwicklung)
    Object.defineProperty(window, 'innerWidth', { value: viewport.width, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: viewport.height, configurable: true });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    // Warte auf Layout-Updates
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Führe Tests durch
    results[deviceName] = await runMobileResponsiveTest();
  }
  
  return results;
}

/**
 * Generiert einen Bericht über die mobile Responsivität
 */
export function generateMobileTestReport(results: ResponsiveTestResult[]): string {
  let report = '# Mobile Responsive Test Report\n\n';
  
  results.forEach((result, index) => {
    const { width, height } = result.viewport;
    report += `## Test ${index + 1}: ${width}x${height}\n\n`;
    
    // Touch Targets
    const invalidTouchTargets = result.touchTargets.filter(t => !t.isValid);
    report += `### Touch Targets\n`;
    report += `- Gesamt: ${result.touchTargets.length}\n`;
    report += `- Gültig (≥44px): ${result.touchTargets.length - invalidTouchTargets.length}\n`;
    report += `- Ungültig (<44px): ${invalidTouchTargets.length}\n\n`;
    
    if (invalidTouchTargets.length > 0) {
      report += `#### Problematische Touch Targets:\n`;
      invalidTouchTargets.forEach(target => {
        report += `- Element: ${target.element.tagName}, Größe: ${target.size.width.toFixed(1)}x${target.size.height.toFixed(1)}px\n`;
      });
      report += '\n';
    }
    
    // Horizontal Scroll
    report += `### Layout\n`;
    report += `- Horizontales Scrollen: ${result.hasHorizontalScroll ? '❌ Ja' : '✅ Nein'}\n\n`;
    
    // Performance
    report += `### Performance\n`;
    report += `- Render-Zeit: ${result.performanceMetrics.renderTime.toFixed(2)}ms\n`;
    report += `- Layout Shifts: ${result.performanceMetrics.layoutShifts.toFixed(3)}\n`;
    if (result.performanceMetrics.memoryUsage) {
      report += `- Speicherverbrauch: ${(result.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
    }
    report += '\n';
    
    // Accessibility
    report += `### Accessibility\n`;
    report += `- Fokussierbare Elemente: ${result.accessibility.focusableElements}\n`;
    report += `- ARIA Labels: ${result.accessibility.ariaLabels}\n`;
    report += `- Semantische Struktur: ${result.accessibility.semanticStructure ? '✅ Ja' : '❌ Nein'}\n\n`;
    
    report += '---\n\n';
  });
  
  return report;
}

/**
 * Console-Helper für schnelle Tests während der Entwicklung
 */
export function quickMobileTest(): void {
  console.group('🔍 Mobile Responsive Quick Test');
  
  const touchTargets = validateTouchTargets();
  const invalidTargets = touchTargets.filter(t => !t.isValid);
  
  console.log(`📱 Viewport: ${window.innerWidth}x${window.innerHeight}`);
  console.log(`👆 Touch Targets: ${touchTargets.length} total, ${invalidTargets.length} invalid`);
  console.log(`📏 Horizontal Scroll: ${checkHorizontalScroll() ? '❌' : '✅'}`);
  
  if (invalidTargets.length > 0) {
    console.warn('❌ Problematische Touch Targets:');
    invalidTargets.forEach(target => {
      console.warn(`  - ${target.element.tagName}: ${target.size.width.toFixed(1)}x${target.size.height.toFixed(1)}px`, target.element);
    });
  } else {
    console.log('✅ Alle Touch Targets sind gültig');
  }
  
  console.groupEnd();
}

// Globale Verfügbarkeit für Entwicklung
if (typeof window !== 'undefined') {
  (window as any).mobileTest = {
    quick: quickMobileTest,
    full: runMobileResponsiveTest,
    touchTargets: validateTouchTargets,
    performance: measureMobilePerformance
  };
}