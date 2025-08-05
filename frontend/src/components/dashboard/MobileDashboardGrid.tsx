import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GridItem {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  colSpan?: number;
  rowSpan?: number;
  priority?: number;
  mobileOrder?: number; // Mobile-specific ordering
}

interface MobileDashboardGridProps {
  items: GridItem[];
  columns?: number;
  mobileColumns?: number;
  gap?: number;
  className?: string;
  onItemClick?: (itemId: string) => void;
  enableSwipeGestures?: boolean;
}

// Mobile-optimized grid item wrapper with touch feedback
const MobileGridItemWrapper = memo<{
  item: GridItem;
  onItemClick?: (itemId: string) => void;
  isMobile: boolean;
}>(({ item, onItemClick, isMobile }) => {
  const { id, component: Component, props = {}, colSpan = 1, rowSpan = 1 } = item;
  const [isPressed, setIsPressed] = useState(false);
  
  const handleClick = useCallback(() => {
    onItemClick?.(id);
  }, [id, onItemClick]);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const gridClasses = useMemo(() => {
    const classes = ['dashboard-grid-item'];
    
    if (isMobile) {
      // On mobile, treat all items as single column unless specifically set
      if (colSpan > 1) classes.push(`col-span-${Math.min(colSpan, 2)}`);
    } else {
      if (colSpan > 1) classes.push(`col-span-${colSpan}`);
      if (rowSpan > 1) classes.push(`row-span-${rowSpan}`);
    }
    
    return classes.join(' ');
  }, [colSpan, rowSpan, isMobile]);

  return (
    <div 
      className={cn(
        gridClasses,
        'transition-all duration-200 ease-out',
        isMobile && 'min-h-[120px]',
        onItemClick && 'cursor-pointer touch-target',
        isPressed && isMobile && 'scale-95 shadow-lg',
        !isPressed && isMobile && 'hover:scale-[1.02] hover:shadow-xl'
      )}
      onClick={onItemClick ? handleClick : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role={onItemClick ? 'button' : undefined}
      tabIndex={onItemClick ? 0 : undefined}
      aria-label={onItemClick ? `${id} auswählen` : undefined}
    >
      <Component {...props} />
    </div>
  );
});

// Main mobile-optimized dashboard grid
const MobileDashboardGrid = memo<MobileDashboardGridProps>(({
  items,
  columns = 3,
  mobileColumns = 1,
  gap = 6,
  className,
  onItemClick,
  enableSwipeGestures = false
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sort items by mobile order or priority
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (isMobile && a.mobileOrder !== undefined && b.mobileOrder !== undefined) {
        return a.mobileOrder - b.mobileOrder;
      }
      return (b.priority || 0) - (a.priority || 0);
    });
  }, [items, isMobile]);

  // Responsive column calculation
  const actualColumns = useMemo(() => {
    if (isMobile) {
      return window.innerWidth < 480 ? 1 : mobileColumns;
    }
    return columns;
  }, [isMobile, columns, mobileColumns]);

  // Grid template columns
  const gridTemplateColumns = useMemo(() => {
    return `repeat(${actualColumns}, minmax(0, 1fr))`;
  }, [actualColumns]);

  // Mobile swipe gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (enableSwipeGestures) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  }, [enableSwipeGestures]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (enableSwipeGestures) {
      const deltaX = e.touches[0].clientX - touchStart.x;
      const deltaY = e.touches[0].clientY - touchStart.y;
      
      // Only handle horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        setScrollOffset(deltaX);
      }
    }
  }, [enableSwipeGestures, touchStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (enableSwipeGestures) {
      const deltaX = e.changedTouches[0].clientX - touchStart.x;
      
      // Handle swipe navigation
      if (Math.abs(deltaX) > 50) {
        console.log(deltaX > 0 ? 'Swipe right' : 'Swipe left');
        // Could trigger page navigation or filtering
      }
      
      setScrollOffset(0);
    }
  }, [enableSwipeGestures, touchStart]);

  // Grid container classes
  const gridClasses = useMemo(() => {
    return cn(
      'grid auto-rows-fr mobile-container',
      isMobile ? `gap-${Math.max(gap - 2, 2)}` : `gap-${gap}`,
      className
    );
  }, [gap, className, isMobile]);

  return (
    <div 
      className={gridClasses}
      style={{ 
        gridTemplateColumns,
        transform: enableSwipeGestures ? `translateX(${scrollOffset}px)` : undefined
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="grid"
      aria-label="Dashboard-Inhalte"
    >
      {sortedItems.map((item, index) => (
        <MobileGridItemWrapper
          key={item.id}
          item={item}
          onItemClick={onItemClick}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
});

// Hook for managing mobile dashboard grid state
export const useMobileDashboardGrid = (initialItems: GridItem[]) => {
  const [items, setItems] = React.useState(initialItems);
  const [loading, setLoading] = React.useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<GridItem>) => {
    setItems(current => 
      current.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(current => current.filter(item => item.id !== id));
  }, []);

  const addItem = useCallback((newItem: GridItem) => {
    setItems(current => [...current, newItem]);
  }, []);

  const reorderForMobile = useCallback((newOrder: string[]) => {
    setItems(current => {
      const itemMap = new Map(current.map(item => [item.id, item]));
      return newOrder.map((id, index) => {
        const item = itemMap.get(id);
        return item ? { ...item, mobileOrder: index } : null;
      }).filter(Boolean) as GridItem[];
    });
  }, []);

  // Auto-optimize for mobile
  const optimizeForMobile = useCallback(() => {
    if (isMobile) {
      setItems(current => 
        current.map(item => ({
          ...item,
          colSpan: Math.min(item.colSpan || 1, 2), // Limit to 2 columns max on mobile
          rowSpan: 1 // Always single row on mobile for better scrolling
        }))
      );
    }
  }, [isMobile]);

  useEffect(() => {
    optimizeForMobile();
  }, [isMobile, optimizeForMobile]);

  return {
    items,
    loading,
    setLoading,
    isMobile,
    updateItem,
    removeItem,
    addItem,
    reorderForMobile,
    optimizeForMobile
  };
};

// Performance monitoring wrapper for mobile
export const MobileDashboardGridWithPerformance = memo<MobileDashboardGridProps & {
  enablePerformanceMonitoring?: boolean;
}>(({ enablePerformanceMonitoring = false, ...props }) => {
  React.useEffect(() => {
    if (enablePerformanceMonitoring && 'performance' in window) {
      performance.mark('mobile-dashboard-grid-start');
      
      return () => {
        performance.mark('mobile-dashboard-grid-end');
        performance.measure('mobile-dashboard-grid-render', 'mobile-dashboard-grid-start', 'mobile-dashboard-grid-end');
        
        const measurements = performance.getEntriesByName('mobile-dashboard-grid-render');
        if (measurements.length > 0) {
          console.debug(`Mobile dashboard grid render time: ${measurements[0].duration.toFixed(2)}ms`);
        }
      };
    }
  }, [enablePerformanceMonitoring]);

  return <MobileDashboardGrid {...props} />;
});

// Staggered animation wrapper for mobile grid items
export const AnimatedMobileDashboardGrid = memo<MobileDashboardGridProps & {
  animationDelay?: number;
}>(({ animationDelay = 50, items, ...props }) => {
  const [visibleItems, setVisibleItems] = useState<GridItem[]>([]);

  useEffect(() => {
    // Stagger the appearance of items for smooth mobile animation
    items.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems(current => [...current, item]);
      }, index * animationDelay);
    });

    return () => setVisibleItems([]);
  }, [items, animationDelay]);

  return (
    <MobileDashboardGrid 
      {...props} 
      items={visibleItems} 
      className={cn(props.className, 'animate-in fade-in-up')}
    />
  );
});

// Display names
MobileDashboardGrid.displayName = 'MobileDashboardGrid';
MobileGridItemWrapper.displayName = 'MobileGridItemWrapper';
MobileDashboardGridWithPerformance.displayName = 'MobileDashboardGridWithPerformance';
AnimatedMobileDashboardGrid.displayName = 'AnimatedMobileDashboardGrid';

export default MobileDashboardGrid;