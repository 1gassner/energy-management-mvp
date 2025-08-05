// Performance monitoring utilities for CityPulse optimization
import React from 'react';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface WebVitals {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitals = {};
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializeWebVitalsObserver();
    this.initializeResourceObserver();
    this.initializeLongTaskObserver();
  }

  // Initialize Web Vitals observer
  private initializeWebVitalsObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        this.webVitals.LCP = lastEntry.renderTime || lastEntry.loadTime || 0;
        this.recordMetric('LCP', this.webVitals.LCP);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & { processingStart?: number };
          this.webVitals.FID = fidEntry.processingStart ? fidEntry.processingStart - entry.startTime : 0;
          this.recordMetric('FID', this.webVitals.FID);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // CLS Observer
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const layoutShiftEntry = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
          if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
            clsValue += layoutShiftEntry.value;
          }
        });
        this.webVitals.CLS = clsValue;
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

    } catch (error) {
      console.warn('Failed to initialize Web Vitals observer:', error);
    }
  }

  // Initialize resource observer
  private initializeResourceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Track large resources
          if (resourceEntry.transferSize && resourceEntry.transferSize > 100000) { // > 100KB
            this.recordMetric('large-resource', resourceEntry.transferSize, {
              name: resourceEntry.name,
              type: this.getResourceType(resourceEntry.name),
              duration: resourceEntry.duration
            });
          }

          // Track slow resources
          if (resourceEntry.duration > 1000) { // > 1s
            this.recordMetric('slow-resource', resourceEntry.duration, {
              name: resourceEntry.name,
              type: this.getResourceType(resourceEntry.name),
              size: resourceEntry.transferSize
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.warn('Failed to initialize resource observer:', error);
    }
  }

  // Initialize long task observer
  private initializeLongTaskObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('long-task', entry.duration, {
            startTime: entry.startTime,
            name: entry.name
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (error) {
      console.warn('Failed to initialize long task observer:', error);
    }
  }

  // Record a custom metric
  recordMetric(name: string, value: number, context?: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log critical performance issues
    this.checkCriticalMetrics(metric);
  }

  // Check for critical performance issues
  private checkCriticalMetrics(metric: PerformanceMetric): void {
    const criticalThresholds = {
      LCP: 2500, // ms
      FID: 100,  // ms
      CLS: 0.1,  // score
      'long-task': 50, // ms
      'slow-resource': 3000 // ms
    };

    const threshold = criticalThresholds[metric.name as keyof typeof criticalThresholds];
    if (threshold && metric.value > threshold) {
      console.warn(`Critical performance issue detected: ${metric.name} = ${metric.value}`, metric.context);
      
      // Could send to analytics service here
      this.sendToAnalytics(metric);
    }
  }

  // Get resource type from URL
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  // Mark timing points
  mark(name: string): void {
    if ('performance' in window && performance.mark) {
      performance.mark(name);
    }
  }

  // Measure between marks
  measure(name: string, startMark: string, endMark?: string): number {
    if ('performance' in window && performance.measure) {
      try {
        const measureName = `measure-${name}`;
        performance.measure(measureName, startMark, endMark);
        
        const entries = performance.getEntriesByName(measureName);
        if (entries.length > 0) {
          const duration = entries[entries.length - 1].duration;
          this.recordMetric(`measure-${name}`, duration);
          return duration;
        }
      } catch (error) {
        console.warn(`Failed to measure ${name}:`, error);
      }
    }
    return 0;
  }

  // Get current Web Vitals
  getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  // Get performance summary
  getPerformanceSummary(): {
    webVitals: WebVitals;
    criticalIssues: PerformanceMetric[];
    averageMetrics: Record<string, number>;
    totalMetrics: number;
  } {
    const criticalIssues = this.metrics.filter(m => {
      const criticalThresholds = {
        LCP: 2500,
        FID: 100,
        CLS: 0.1,
        'long-task': 50
      };
      const threshold = criticalThresholds[m.name as keyof typeof criticalThresholds];
      return threshold && m.value > threshold;
    });

    const averageMetrics: Record<string, number> = {};
    const metricGroups = this.groupMetricsByName();
    
    Object.entries(metricGroups).forEach(([name, metrics]) => {
      const average = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
      averageMetrics[name] = average;
    });

    return {
      webVitals: this.webVitals,
      criticalIssues,
      averageMetrics,
      totalMetrics: this.metrics.length
    };
  }

  // Group metrics by name
  private groupMetricsByName(): Record<string, PerformanceMetric[]> {
    return this.metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetric[]>);
  }

  // Send metrics to analytics (placeholder)
  private sendToAnalytics(metric: PerformanceMetric): void {
    // In a real implementation, this would send to your analytics service
    if (import.meta.env.PROD) {
      // Could use Google Analytics, DataDog, or custom endpoint
      console.log('Would send to analytics:', metric);
    }
  }

  // Memory usage monitoring
  getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    return null;
  }

  // Bundle size analysis
  getBundleAnalysis(): Promise<{
    totalSize: number;
    chunks: Array<{ name: string; size: number }>;
  }> {
    return new Promise((resolve) => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = entries.filter(entry => entry.name.includes('.js'));
      
      const chunks = jsResources.map(resource => ({
        name: resource.name.split('/').pop() || 'unknown',
        size: resource.transferSize || 0
      }));

      const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);

      resolve({ totalSize, chunks });
    });
  }

  // React component performance tracking
  trackComponentRender(componentName: string, renderTime: number): void {
    this.recordMetric(`component-render-${componentName}`, renderTime);
  }

  // API call performance tracking
  trackAPICall(endpoint: string, duration: number, success: boolean): void {
    this.recordMetric('api-call', duration, {
      endpoint,
      success,
      status: success ? 'success' : 'error'
    });
  }

  // Chart rendering performance
  trackChartRender(chartType: string, dataPoints: number, renderTime: number): void {
    this.recordMetric('chart-render', renderTime, {
      chartType,
      dataPoints,
      complexity: dataPoints > 1000 ? 'high' : dataPoints > 100 ? 'medium' : 'low'
    });
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.cleanup();
    }
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }

  // Export metrics for analysis
  export(): {
    metrics: PerformanceMetric[];
    webVitals: WebVitals;
    timestamp: number;
    userAgent: string;
    url: string;
  } {
    return {
      metrics: [...this.metrics],
      webVitals: { ...this.webVitals },
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = React.useRef<number>();
  
  React.useEffect(() => {
    startTime.current = performance.now();
    performanceMonitor.mark(`${componentName}-start`);
    
    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current;
        performanceMonitor.trackComponentRender(componentName, duration);
        performanceMonitor.mark(`${componentName}-end`);
        performanceMonitor.measure(componentName, `${componentName}-start`, `${componentName}-end`);
      }
    };
  }, [componentName]);
};

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const MonitoredComponent = React.forwardRef<any, P>((props, ref) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Anonymous';
    usePerformanceMonitor(name);
    
    return React.createElement(WrappedComponent, { ...props, ref });
  });
  
  MonitoredComponent.displayName = `withPerformanceMonitoring(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return MonitoredComponent;
};

export default performanceMonitor;