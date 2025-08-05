// Performance optimization utilities
import { preloadCommonIcons } from '@/components/ui/DynamicIcon';
import { prefetchCriticalData } from './requestCache';

// Preload critical resources
export const initializePerformanceOptimizations = async () => {
  // Preload common icons
  preloadCommonIcons();
  
  // Prefetch critical API data
  await prefetchCriticalData();
  
  // Initialize service worker if available
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.debug('Service worker registered for caching');
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  }
  
  // Enable performance monitoring
  if ('performance' in window) {
    enablePerformanceMonitoring();
  }
};

// Performance monitoring
const enablePerformanceMonitoring = () => {
  // Monitor largest contentful paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.debug(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Monitor first input delay
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      console.debug(`FID: ${entry.processingStart - entry.startTime}ms`);
    });
  }).observe({ entryTypes: ['first-input'] });

  // Monitor cumulative layout shift
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      console.debug(`CLS: ${entry.value}`);
    });
  }).observe({ entryTypes: ['layout-shift'] });
};

// Bundle size analysis
export const analyzeBundlePerformance = () => {
  if ('performance' in window) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const cssResources = resources.filter(r => r.name.includes('.css'));
    
    const totalJSSize = jsResources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    
    const totalCSSSize = cssResources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    
    console.info('Bundle Analysis:', {
      jsSize: `${(totalJSSize / 1024).toFixed(2)} KB`,
      cssSize: `${(totalCSSSize / 1024).toFixed(2)} KB`,
      totalSize: `${((totalJSSize + totalCSSSize) / 1024).toFixed(2)} KB`,
      jsFiles: jsResources.length,
      cssFiles: cssResources.length
    });
    
    return {
      jsSize: totalJSSize,
      cssSize: totalCSSSize,
      totalSize: totalJSSize + totalCSSSize
    };
  }
  
  return null;
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    console.debug('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
    
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    };
  }
  
  return null;
};

// Chart loading optimization
export const optimizeChartLoading = () => {
  // Intersection Observer for charts
  const chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Chart is visible, can prefetch recharts
          import('recharts').then(() => {
            console.debug('Recharts preloaded for visible chart');
          });
          chartObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '50px' }
  );
  
  // Observe all chart containers
  document.querySelectorAll('[data-chart-container]').forEach((element) => {
    chartObserver.observe(element);
  });
  
  return chartObserver;
};

// Lazy loading optimization
export const enableLazyLoadingOptimizations = () => {
  // Optimize image loading
  document.querySelectorAll('img[data-src]').forEach((img) => {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          image.src = image.dataset.src!;
          image.removeAttribute('data-src');
          imageObserver.unobserve(image);
        }
      });
    });
    
    imageObserver.observe(img);
  });
  
  // Optimize component loading
  optimizeChartLoading();
};

// Performance timing utilities
export const measureComponentRenderTime = (componentName: string) => {
  const startMark = `${componentName}-start`;
  const endMark = `${componentName}-end`;
  const measureName = `${componentName}-render`;
  
  return {
    start: () => performance.mark(startMark),
    end: () => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      
      const measurements = performance.getEntriesByName(measureName);
      if (measurements.length > 0) {
        const duration = measurements[measurements.length - 1].duration;
        console.debug(`${componentName} render time: ${duration.toFixed(2)}ms`);
        return duration;
      }
      
      return null;
    }
  };
};

export default {
  initializePerformanceOptimizations,
  analyzeBundlePerformance,
  monitorMemoryUsage,
  enableLazyLoadingOptimizations,
  measureComponentRenderTime
};