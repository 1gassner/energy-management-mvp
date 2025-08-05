import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/utils/accessibility';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortKey?: keyof T;
  className?: string;
  headerClassName?: string;
}

export interface AccessibleTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  caption?: string;
  className?: string;
  rowClassName?: (item: T, index: number) => string;
  onRowClick?: (item: T, index: number) => void;
  sortable?: boolean;
  defaultSortKey?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  loading?: boolean;
  ariaLabel?: string;
  keyboardNavigable?: boolean;
  selectable?: boolean;
  selectedItems?: T[];
  onSelectionChange?: (selectedItems: T[]) => void;
  getRowId?: (item: T) => string;
}

type SortDirection = 'asc' | 'desc' | null;

const AccessibleTable = <T extends Record<string, any>>({
  data,
  columns,
  caption,
  className,
  rowClassName,
  onRowClick,
  sortable = false,
  defaultSortKey,
  defaultSortDirection = 'asc',
  emptyMessage = 'Keine Daten verfügbar',
  loading = false,
  ariaLabel,
  keyboardNavigable = false,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getRowId
}: AccessibleTableProps<T>) => {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const { announce } = useAccessibility();

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  // Handle sorting
  const handleSort = (column: TableColumn<T>) => {
    if (!sortable || !column.sortable) return;

    const key = column.sortKey || column.key;
    let newDirection: SortDirection = 'asc';

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      } else {
        newDirection = 'asc';
      }
    }

    setSortKey(newDirection ? key as keyof T : null);
    setSortDirection(newDirection);

    // Announce sort change
    const sortMessage = newDirection 
      ? `Tabelle sortiert nach ${column.header}, ${newDirection === 'asc' ? 'aufsteigend' : 'absteigend'}`
      : `Sortierung nach ${column.header} entfernt`;
    announce(sortMessage);
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!keyboardNavigable || !tableRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!tableRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRowIndex(prev => Math.min(prev + 1, sortedData.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRowIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Home':
          e.preventDefault();
          setFocusedRowIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedRowIndex(sortedData.length - 1);
          break;
        case 'Enter':
        case ' ':
          if (focusedRowIndex >= 0 && onRowClick) {
            e.preventDefault();
            onRowClick(sortedData[focusedRowIndex], focusedRowIndex);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNavigable, focusedRowIndex, sortedData, onRowClick]);

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    onSelectionChange(checked ? [...sortedData] : []);
    announce(checked ? 'Alle Elemente ausgewählt' : 'Alle Elemente abgewählt');
  };

  const handleSelectItem = (item: T, checked: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelection = checked 
      ? [...selectedItems, item]
      : selectedItems.filter(selected => 
          getRowId ? getRowId(selected) !== getRowId(item) : selected !== item
        );
    
    onSelectionChange(newSelection);
  };

  const isSelected = (item: T) => {
    return getRowId 
      ? selectedItems.some(selected => getRowId(selected) === getRowId(item))
      : selectedItems.includes(item);
  };

  const allSelected = sortedData.length > 0 && sortedData.every(item => isSelected(item));
  const someSelected = selectedItems.length > 0 && !allSelected;

  // Get cell value
  const getCellValue = (item: T, column: TableColumn<T>) => {
    if (column.accessor) {
      return column.accessor(item);
    }
    return item[column.key];
  };

  // Get sort icon
  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;
    
    const key = column.sortKey || column.key;
    if (sortKey !== key) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="w-full glass-card-light rounded-2xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/20 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl glass-card-light", className)}>
      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className="w-full"
          role="table"
          aria-label={ariaLabel || caption || 'Datentabelle'}
        >
          {caption && (
            <caption className="sr-only">
              {caption}
            </caption>
          )}
          
          <thead role="rowgroup">
            <tr role="row" className="border-b border-white/10">
              {selectable && (
                <th 
                  role="columnheader" 
                  className="px-4 py-3 text-left"
                  scope="col"
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={someSelected ? (el) => el && (el.indeterminate = true) : undefined}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded focus:ring-2 focus:ring-blue-400/50"
                    aria-label="Alle Elemente auswählen"
                  />
                </th>
              )}
              
              {columns.map((column, index) => (
                <th
                  key={String(column.key)}
                  role="columnheader"
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-left text-sm font-semibold text-blue-200",
                    column.sortable && "cursor-pointer hover:bg-white/5 select-none",
                    column.headerClassName
                  )}
                  onClick={() => handleSort(column)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && column.sortable) {
                      e.preventDefault();
                      handleSort(column);
                    }
                  }}
                  tabIndex={column.sortable ? 0 : -1}
                  aria-sort={
                    column.sortable && sortKey === (column.sortKey || column.key)
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody role="rowgroup">
            {sortedData.length === 0 ? (
              <tr role="row">
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-8 text-center text-blue-200/60"
                  role="cell"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr
                  key={getRowId ? getRowId(item) : index}
                  role="row"
                  className={cn(
                    "border-b border-white/5 hover:bg-white/5 transition-colors",
                    onRowClick && "cursor-pointer",
                    keyboardNavigable && focusedRowIndex === index && "bg-blue-500/10 ring-2 ring-blue-400/50",
                    rowClassName?.(item, index)
                  )}
                  onClick={() => onRowClick?.(item, index)}
                  tabIndex={keyboardNavigable ? 0 : -1}
                  aria-rowindex={index + 1}
                  aria-selected={keyboardNavigable && focusedRowIndex === index}
                >
                  {selectable && (
                    <td role="cell" className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected(item)}
                        onChange={(e) => handleSelectItem(item, e.target.checked)}
                        className="rounded focus:ring-2 focus:ring-blue-400/50"
                        aria-label={`Element ${index + 1} auswählen`}
                      />
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      role="cell"
                      className={cn(
                        "px-4 py-3 text-sm text-blue-100",
                        column.className
                      )}
                    >
                      {getCellValue(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Table summary for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {sortedData.length === 0 
          ? emptyMessage
          : `Tabelle mit ${sortedData.length} ${sortedData.length === 1 ? 'Eintrag' : 'Einträgen'}.
             ${sortKey ? `Sortiert nach ${columns.find(c => (c.sortKey || c.key) === sortKey)?.header || sortKey}, ${sortDirection === 'asc' ? 'aufsteigend' : 'absteigend'}.` : ''}
             ${selectable ? `${selectedItems.length} von ${sortedData.length} Einträgen ausgewählt.` : ''}
             ${keyboardNavigable ? 'Verwenden Sie die Pfeiltasten zur Navigation und Enter zum Auswählen.' : ''}`
        }
      </div>
    </div>
  );
};

export default AccessibleTable;