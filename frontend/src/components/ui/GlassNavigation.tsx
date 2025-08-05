import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  active?: boolean;
  disabled?: boolean;
}

export interface GlassNavigationProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'hechingen' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
  activeItemId?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const GlassNavigation: React.FC<GlassNavigationProps> = ({
  items,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  className,
  onItemClick,
  activeItemId,
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(
    new Set(defaultCollapsed ? items.filter(item => item.children).map(item => item.id) : [])
  );

  const toggleCollapse = (itemId: string) => {
    const newCollapsed = new Set(collapsedItems);
    if (newCollapsed.has(itemId)) {
      newCollapsed.delete(itemId);
    } else {
      newCollapsed.add(itemId);
    }
    setCollapsedItems(newCollapsed);
  };

  const navClasses = clsx(
    // Base navigation styles
    'glass-nav',
    
    // Orientation
    orientation === 'horizontal' && 'flex items-center gap-1',
    orientation === 'vertical' && 'flex flex-col space-y-1',
    
    // Variant styles
    variant === 'default' && 'glass-nav-default',
    variant === 'hechingen' && 'glass-nav-hechingen',
    variant === 'minimal' && 'glass-nav-minimal',
    
    className
  );

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = activeItemId === item.id || item.active;
    const isCollapsed = collapsedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    const itemClasses = clsx(
      'glass-nav-item group',
      'flex items-center justify-between',
      'transition-all duration-200',
      
      // Size variations
      size === 'sm' && 'text-sm py-2 px-3',
      size === 'md' && 'text-base py-3 px-4',
      size === 'lg' && 'text-lg py-4 px-5',
      
      // Level indentation (for vertical nested items)
      orientation === 'vertical' && level > 0 && `ml-${level * 4}`,
      
      // State styles
      isActive && 'glass-nav-item-active',
      item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      !item.disabled && 'cursor-pointer hover:glass-nav-item-hover',
      
      // Interactive states
      hasChildren && collapsible && 'glass-nav-item-expandable'
    );

    const handleClick = () => {
      if (item.disabled) return;
      
      if (hasChildren && collapsible) {
        toggleCollapse(item.id);
      }
      
      onItemClick?.(item);
    };

    const content = (
      <div className="flex items-center gap-3 flex-1">
        {/* Icon */}
        {item.icon && (
          <div className="flex-shrink-0 glass-nav-item-icon">
            {item.icon}
          </div>
        )}
        
        {/* Label */}
        <span className="glass-nav-item-label font-medium">
          {item.label}
        </span>
        
        {/* Badge */}
        {item.badge && (
          <div className="glass-badge-success ml-auto">
            {item.badge}
          </div>
        )}
      </div>
    );

    const expandButton = hasChildren && collapsible && (
      <div className="glass-nav-item-expand">
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 transition-transform duration-200" />
        ) : (
          <ChevronDown className="w-4 h-4 transition-transform duration-200" />
        )}
      </div>
    );

    return (
      <div key={item.id} className="glass-nav-item-wrapper">
        {item.href && !hasChildren ? (
          <a
            href={item.href}
            className={itemClasses}
            onClick={handleClick}
            aria-current={isActive ? 'page' : undefined}
          >
            {content}
            {expandButton}
          </a>
        ) : (
          <div
            className={itemClasses}
            onClick={handleClick}
            role="button"
            tabIndex={item.disabled ? -1 : 0}
            aria-expanded={hasChildren ? !isCollapsed : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }}
          >
            {content}
            {expandButton}
          </div>
        )}
        
        {/* Children (for vertical navigation) */}
        {hasChildren && orientation === 'vertical' && !isCollapsed && (
          <div className="glass-nav-children mt-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={navClasses} role="navigation">
      {items.map(item => renderNavigationItem(item))}
    </nav>
  );
};

// Specialized navigation components
export const GlassNavigationHorizontal: React.FC<Omit<GlassNavigationProps, 'orientation'>> = (props) => (
  <GlassNavigation {...props} orientation="horizontal" />
);

export const GlassNavigationVertical: React.FC<Omit<GlassNavigationProps, 'orientation'>> = (props) => (
  <GlassNavigation {...props} orientation="vertical" />
);

export const GlassNavigationHechingen: React.FC<Omit<GlassNavigationProps, 'variant'>> = (props) => (
  <GlassNavigation {...props} variant="hechingen" />
);

// Breadcrumb Navigation Component
export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface GlassBreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  maxItems?: number;
  onItemClick?: (item: BreadcrumbItem) => void;
}

export const GlassBreadcrumb: React.FC<GlassBreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4 glass-text-muted" />,
  className,
  maxItems = 5,
  onItemClick
}) => {
  const displayItems = items.length > maxItems 
    ? [items[0], { id: 'ellipsis', label: '...', disabled: true } as BreadcrumbItem, ...items.slice(-2)]
    : items;

  const breadcrumbClasses = clsx(
    'glass-breadcrumb flex items-center gap-2 text-sm',
    className
  );

  return (
    <nav className={breadcrumbClasses} aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.id === 'ellipsis';

          return (
            <li key={item.id} className="flex items-center gap-2">
              {item.href && !isLast && !isEllipsis ? (
                <a
                  href={item.href}
                  className="glass-breadcrumb-item flex items-center gap-2 glass-text-secondary hover:glass-text-primary transition-colors duration-200"
                  onClick={() => onItemClick?.(item)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ) : (
                <span
                  className={clsx(
                    'glass-breadcrumb-item flex items-center gap-2',
                    isLast ? 'glass-text-primary font-medium' : 'glass-text-muted',
                    isEllipsis && 'cursor-default'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
              
              {!isLast && (
                <div className="glass-breadcrumb-separator">
                  {separator}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};