import React, { Suspense, lazy, memo, useState, useEffect } from 'react';

// Icon cache to prevent duplicate imports
const iconCache = new Map<string, React.ComponentType>();

// Dynamic icon loader
const DynamicIcon = memo(({ 
  name, 
  size = 24, 
  className = '',
  color,
  strokeWidth = 2,
  ...props 
}: {
  name: string;
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
  [key: string]: any;
}) => {
  const [IconComponent, setIconComponent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check cache first
    if (iconCache.has(name)) {
      setIconComponent(() => iconCache.get(name)!);
      return;
    }

    setLoading(true);
    setError(false);

    // Dynamic import with error handling
    import('lucide-react')
      .then((module) => {
        const Icon = (module as any)[name];
        if (Icon) {
          iconCache.set(name, Icon);
          setIconComponent(() => Icon);
        } else {
          setError(true);
          console.warn(`Icon "${name}" not found in lucide-react`);
        }
      })
      .catch((err) => {
        setError(true);
        console.error(`Failed to load icon "${name}":`, err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [name]);

  if (loading) {
    return (
      <div 
        className={`inline-block animate-pulse bg-gray-300 rounded ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (error || !IconComponent) {
    return (
      <div 
        className={`inline-flex items-center justify-center bg-gray-200 text-gray-500 text-xs rounded ${className}`}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
});

// Pre-load commonly used icons for better performance
const preloadIcons = [
  'Home', 'Settings', 'User', 'Bell', 'Search', 'Menu',
  'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight',
  'X', 'Plus', 'Minus', 'Check', 'AlertTriangle', 'Info'
];

// Preload function
export const preloadCommonIcons = async () => {
  try {
    const module = await import('lucide-react');
    preloadIcons.forEach(iconName => {
      const Icon = (module as any)[iconName];
      if (Icon) {
        iconCache.set(iconName, Icon);
      }
    });
  } catch (error) {
    console.warn('Failed to preload common icons:', error);
  }
};

// Specific optimized icon components for most commonly used icons
export const HomeIcon = memo((props: any) => <DynamicIcon name="Home" {...props} />);
export const SettingsIcon = memo((props: any) => <DynamicIcon name="Settings" {...props} />);
export const UserIcon = memo((props: any) => <DynamicIcon name="User" {...props} />);
export const BellIcon = memo((props: any) => <DynamicIcon name="Bell" {...props} />);
export const SearchIcon = memo((props: any) => <DynamicIcon name="Search" {...props} />);
export const MenuIcon = memo((props: any) => <DynamicIcon name="Menu" {...props} />);
export const ChevronDownIcon = memo((props: any) => <DynamicIcon name="ChevronDown" {...props} />);
export const ChevronUpIcon = memo((props: any) => <DynamicIcon name="ChevronUp" {...props} />);
export const ChevronLeftIcon = memo((props: any) => <DynamicIcon name="ChevronLeft" {...props} />);
export const ChevronRightIcon = memo((props: any) => <DynamicIcon name="ChevronRight" {...props} />);
export const XIcon = memo((props: any) => <DynamicIcon name="X" {...props} />);
export const PlusIcon = memo((props: any) => <DynamicIcon name="Plus" {...props} />);
export const MinusIcon = memo((props: any) => <DynamicIcon name="Minus" {...props} />);
export const CheckIcon = memo((props: any) => <DynamicIcon name="Check" {...props} />);
export const AlertTriangleIcon = memo((props: any) => <DynamicIcon name="AlertTriangle" {...props} />);
export const InfoIcon = memo((props: any) => <DynamicIcon name="Info" {...props} />);

// Energy-specific icons
export const ZapIcon = memo((props: any) => <DynamicIcon name="Zap" {...props} />);
export const BatteryIcon = memo((props: any) => <DynamicIcon name="Battery" {...props} />);
export const SunIcon = memo((props: any) => <DynamicIcon name="Sun" {...props} />);
export const WindIcon = memo((props: any) => <DynamicIcon name="Wind" {...props} />);
export const TrendingUpIcon = memo((props: any) => <DynamicIcon name="TrendingUp" {...props} />);
export const TrendingDownIcon = memo((props: any) => <DynamicIcon name="TrendingDown" {...props} />);
export const BarChart3Icon = memo((props: any) => <DynamicIcon name="BarChart3" {...props} />);
export const LineChartIcon = memo((props: any) => <DynamicIcon name="LineChart" {...props} />);
export const PieChartIcon = memo((props: any) => <DynamicIcon name="PieChart" {...props} />);

// Display names
DynamicIcon.displayName = 'DynamicIcon';
HomeIcon.displayName = 'HomeIcon';
SettingsIcon.displayName = 'SettingsIcon';
UserIcon.displayName = 'UserIcon';
BellIcon.displayName = 'BellIcon';
SearchIcon.displayName = 'SearchIcon';
MenuIcon.displayName = 'MenuIcon';

export default DynamicIcon;