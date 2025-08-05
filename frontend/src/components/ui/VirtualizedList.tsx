import React, { memo, useCallback, CSSProperties } from 'react';
import { VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight?: number | ((index: number) => number);
  height: number;
  width?: number | string;
  renderItem: (item: T, index: number, style: CSSProperties) => React.ReactNode;
  loadMoreItems?: (startIndex: number, stopIndex: number) => Promise<void>;
  isItemLoaded?: (index: number) => boolean;
  threshold?: number;
  className?: string;
  overscan?: number;
  onScroll?: (scrollOffset: number) => void;
}

const VirtualizedList = <T extends any>({
  items,
  itemHeight = 60,
  height,
  width = '100%',
  renderItem,
  loadMoreItems,
  isItemLoaded,
  threshold = 15,
  className,
  overscan = 3,
  onScroll
}: VirtualizedListProps<T>) => {
  const itemCount = items.length;
  
  const getItemSize = useCallback((index: number) => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index);
    }
    return itemHeight;
  }, [itemHeight]);

  const Row = memo(({ index, style }: { index: number; style: CSSProperties }) => {
    const item = items[index];
    if (!item) return null;
    
    return renderItem(item, index, style);
  });

  Row.displayName = 'VirtualizedRow';

  if (loadMoreItems && isItemLoaded) {
    return (
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount + 1}
        loadMoreItems={loadMoreItems}
        threshold={threshold}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            className={cn('scrollbar-thin scrollbar-thumb-gray-600', className)}
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={getItemSize}
            onItemsRendered={onItemsRendered}
            overscanCount={overscan}
            onScroll={({ scrollOffset }) => onScroll?.(scrollOffset)}
          >
            {Row}
          </List>
        )}
      </InfiniteLoader>
    );
  }

  return (
    <List
      className={cn('scrollbar-thin scrollbar-thumb-gray-600', className)}
      height={height}
      width={width}
      itemCount={itemCount}
      itemSize={getItemSize}
      overscanCount={overscan}
      onScroll={({ scrollOffset }) => onScroll?.(scrollOffset)}
    >
      {Row}
    </List>
  );
};

VirtualizedList.displayName = 'VirtualizedList';

export default memo(VirtualizedList) as typeof VirtualizedList;