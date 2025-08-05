/**
 * Real User Monitoring (RUM) Integration
 * Tracks Core Web Vitals and custom performance metrics
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

export interface PerformanceMetrics {
  cls?: number;
  fid?: number;
  fcp?: number;
  lcp?: number;
  ttfb?: number;
  [key: string]: number | undefined;
}

class RealUserMonitoring {
  private metrics: PerformanceMetrics = {};
  private customMetrics: Map<string, number> = new Map();
  private endpoint: string;
  private buffer: any[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private timer: NodeJS.Timeout | null = null;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || import.meta.env.VITE_RUM_ENDPOINT || '/api/metrics';
    this.initializeWebVitals();
    this.startFlushTimer();
  }

  private initializeWebVitals() {
    // Core Web Vitals
    getCLS(this.handleMetric('cls'));
    getFID(this.handleMetric('fid'));
    getFCP(this.handleMetric('fcp'));
    getLCP(this.handleMetric('lcp'));
    getTTFB(this.handleMetric('ttfb'));

    // Custom performance marks
    this.observePerformance();
  }

  private handleMetric = (name: string) => (metric: Metric) => {
    this.metrics[name] = metric.value;
    
    // Send immediately if it's a critical metric
    if (name === 'lcp' || name === 'cls') {
      this.reportMetric({
        name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        timestamp: Date.now()
      });
    }
  };

  private observePerformance() {
    if ('PerformanceObserver' in window) {
      // Observe long tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackCustomMetric('long-task', entry.duration);
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Observe navigation timing
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackCustomMetric('dns-lookup', navEntry.domainLookupEnd - navEntry.domainLookupStart);
            this.trackCustomMetric('tcp-connection', navEntry.connectEnd - navEntry.connectStart);
            this.trackCustomMetric('request-time', navEntry.responseStart - navEntry.requestStart);
            this.trackCustomMetric('response-time', navEntry.responseEnd - navEntry.responseStart);
            this.trackCustomMetric('dom-interactive', navEntry.domInteractive - navEntry.responseEnd);
            this.trackCustomMetric('dom-complete', navEntry.domComplete - navEntry.domInteractive);
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.warn('Navigation observer not supported');
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.initiatorType === 'fetch' || resourceEntry.initiatorType === 'xmlhttprequest') {
              this.trackApiCall(resourceEntry);
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  private trackApiCall(entry: PerformanceResourceTiming) {
    const duration = entry.responseEnd - entry.startTime;
    const path = new URL(entry.name).pathname;
    
    this.reportMetric({
      type: 'api',
      path,
      duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      timestamp: Date.now()
    });
  }

  trackCustomMetric(name: string, value: number) {
    this.customMetrics.set(name, value);
    this.reportMetric({
      type: 'custom',
      name,
      value,
      timestamp: Date.now()
    });
  }

  trackUserInteraction(action: string, target: string, value?: number) {
    this.reportMetric({
      type: 'interaction',
      action,
      target,
      value,
      timestamp: Date.now()
    });
  }

  trackError(error: Error, context?: any) {
    this.reportMetric({
      type: 'error',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  trackPageView(path: string, referrer?: string) {
    this.reportMetric({
      type: 'pageview',
      path,
      referrer,
      timestamp: Date.now(),
      metrics: { ...this.metrics }
    });
  }

  private reportMetric(data: any) {
    // Add common metadata
    const enrichedData = {
      ...data,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : undefined,
      memory: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : undefined
    };

    this.buffer.push(enrichedData);

    // Flush if buffer is getting large
    if (this.buffer.length >= 10) {
      this.flush();
    }
  }

  private startFlushTimer() {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const metrics = [...this.buffer];
    this.buffer = [];

    try {
      if (import.meta.env.PROD) {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            metrics,
            sessionId: this.getSessionId(),
            timestamp: Date.now()
          })
        });
      } else {
        console.log('RUM Metrics (dev):', metrics);
      }
    } catch (error) {
      console.error('Failed to send RUM metrics:', error);
      // Put metrics back in buffer for retry
      this.buffer.unshift(...metrics);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('rum-session-id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('rum-session-id', sessionId);
    }
    return sessionId;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getCustomMetrics(): Map<string, number> {
    return new Map(this.customMetrics);
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.flush();
  }
}

// Singleton instance
export const rum = new RealUserMonitoring();

// React hook for RUM
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useRUM = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    rum.trackPageView(location.pathname);
  }, [location]);

  return rum;
};