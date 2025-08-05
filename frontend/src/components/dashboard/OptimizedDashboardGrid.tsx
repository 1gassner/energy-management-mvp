import React, { memo, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface GridItem {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  colSpan?: number;
  rowSpan?: number;
  priority?: number; // Higher priority items load first
}

interface OptimizedDashboardGridProps {
  items: GridItem[];
  columns?: number;
  gap?: number;
  className?: string;
  onItemClick?: (itemId: string) => void;
}

// Memoized grid item wrapper
const GridItemWrapper = memo<{
  item: GridItem;
  onItemClick?: (itemId: string) => void;
}>(({ item, onItemClick }) => {
  const { id, component: Component, props = {}, colSpan = 1, rowSpan = 1 } = item;
  
  const handleClick = useCallback(() => {
    onItemClick?.(id);
  }, [id, onItemClick]);

  const gridClasses = useMemo(() => {
    const classes = [];
    if (colSpan > 1) classes.push(`col-span-${colSpan}`);
    if (rowSpan > 1) classes.push(`row-span-${rowSpan}`);
    return classes.join(' ');
  }, [colSpan, rowSpan]);

  return (
    <div 
      className={cn(
        'dashboard-grid-item',
        gridClasses,
        onItemClick && 'cursor-pointer hover:scale-[1.02] transition-transform duration-200'
      )}
      onClick={onItemClick ? handleClick : undefined}
    >
      <Component {...props} />
    </div>
  );
});

// Main optimized dashboard grid
const OptimizedDashboardGrid = memo<OptimizedDashboardGridProps>(({
  items,
  columns = 3,
  gap = 6,
  className,
  onItemClick
}) => {
  // Sort items by priority for better loading performance
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [items]);

  // Generate grid template columns based on column count
  const gridTemplateColumns = useMemo(() => {
    return `repeat(${columns}, minmax(0, 1fr))`;
  }, [columns]);

  // Grid container classes
  const gridClasses = useMemo(() => {
    return cn(
      'grid auto-rows-fr',
      `gap-${gap}`,
      className
    );
  }, [gap, className]);

  return (
    <div 
      className={gridClasses}
      style={{ gridTemplateColumns }}
    >
      {sortedItems.map((item) => (
        <GridItemWrapper
          key={item.id}
          item={item}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
});

// Hook for managing dashboard grid state
export const useDashboardGrid = (initialItems: GridItem[]) => {
  const [items, setItems] = React.useState(initialItems);
  const [loading, setLoading] = React.useState(false);

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

  const reorderItems = useCallback((newOrder: string[]) => {
    setItems(current => {
      const itemMap = new Map(current.map(item => [item.id, item]));
      return newOrder.map(id => itemMap.get(id)).filter(Boolean) as GridItem[];
    });
  }, []);

  return {
    items,
    loading,
    setLoading,
    updateItem,
    removeItem,
    addItem,
    reorderItems
  };
};

// Performance monitoring wrapper
export const DashboardGridWithPerformance = memo<OptimizedDashboardGridProps & {
  enablePerformanceMonitoring?: boolean;
}>(({ enablePerformanceMonitoring = false, ...props }) => {
  React.useEffect(() => {
    if (enablePerformanceMonitoring && 'performance' in window) {
      performance.mark('dashboard-grid-start');
      
      return () => {
        performance.mark('dashboard-grid-end');
        performance.measure('dashboard-grid-render', 'dashboard-grid-start', 'dashboard-grid-end');
        
        const measurements = performance.getEntriesByName('dashboard-grid-render');
        if (measurements.length > 0) {
          console.debug(`Dashboard grid render time: ${measurements[0].duration.toFixed(2)}ms`);
        }
      };
    }
  }, [enablePerformanceMonitoring]);

  return <OptimizedDashboardGrid {...props} />;
});

// Display names
OptimizedDashboardGrid.displayName = 'OptimizedDashboardGrid';
GridItemWrapper.displayName = 'GridItemWrapper';
DashboardGridWithPerformance.displayName = 'DashboardGridWithPerformance';

export default OptimizedDashboardGrid;