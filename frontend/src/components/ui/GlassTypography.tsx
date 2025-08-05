import React from 'react';
import { clsx } from 'clsx';

// Typography Component Props
export interface GlassHeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  className?: string;
  gradient?: boolean;
  hechingen?: boolean;
}

export interface GlassTextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: 'p' | 'span' | 'div' | 'strong' | 'em';
}

// Glass Heading Component
export const GlassHeading: React.FC<GlassHeadingProps> = ({
  children,
  level = 1,
  size,
  weight = 'bold',
  className,
  gradient = false,
  hechingen = false
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  // Default size mapping for heading levels
  const defaultSizes = {
    1: '4xl',
    2: '3xl',
    3: '2xl',
    4: 'xl',
    5: 'lg',
    6: 'md'
  } as const;
  
  const actualSize = size || defaultSizes[level];
  
  const headingClasses = clsx(
    // Base typography styles
    'glass-heading-primary',
    'font-heading leading-tight tracking-tight',
    
    // Size variations
    actualSize === 'xs' && 'text-xs',
    actualSize === 'sm' && 'text-sm',
    actualSize === 'md' && 'text-base',
    actualSize === 'lg' && 'text-lg',
    actualSize === 'xl' && 'text-xl',
    actualSize === '2xl' && 'text-2xl',
    actualSize === '3xl' && 'text-3xl',
    actualSize === '4xl' && 'text-4xl',
    actualSize === '5xl' && 'text-5xl',
    actualSize === '6xl' && 'text-6xl',
    
    // Weight variations
    weight === 'light' && 'font-light',
    weight === 'normal' && 'font-normal',
    weight === 'medium' && 'font-medium',
    weight === 'semibold' && 'font-semibold',
    weight === 'bold' && 'font-bold',
    weight === 'extrabold' && 'font-extrabold',
    
    // Special effects
    gradient && 'bg-gradient-to-r from-hechingen-blue-400 via-hechingen-blue-500 to-hechingen-green-500 bg-clip-text text-transparent',
    hechingen && !gradient && 'text-hechingen-blue-400',
    
    className
  );

  return (
    <Tag className={headingClasses}>
      {children}
    </Tag>
  );
};

// Glass Text Component
export const GlassText: React.FC<GlassTextProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  weight = 'normal',
  className,
  as: Component = 'p'
}) => {
  const textClasses = clsx(
    // Base text styles
    'font-primary leading-relaxed',
    
    // Variant styles
    variant === 'primary' && 'glass-text-primary',
    variant === 'secondary' && 'glass-text-secondary',
    variant === 'muted' && 'glass-text-muted',
    variant === 'accent' && 'text-hechingen-blue-400',
    variant === 'success' && 'text-hechingen-green-500',
    variant === 'warning' && 'text-hechingen-gold-500',
    variant === 'error' && 'text-red-400',
    
    // Size variations
    size === 'xs' && 'text-xs',
    size === 'sm' && 'text-sm',
    size === 'md' && 'text-base',
    size === 'lg' && 'text-lg',
    size === 'xl' && 'text-xl',
    
    // Weight variations
    weight === 'light' && 'font-light',
    weight === 'normal' && 'font-normal',
    weight === 'medium' && 'font-medium',
    weight === 'semibold' && 'font-semibold',
    weight === 'bold' && 'font-bold',
    
    className
  );

  return (
    <Component className={textClasses}>
      {children}
    </Component>
  );
};

// Specialized heading components
export const GlassHeadingHechingen: React.FC<Omit<GlassHeadingProps, 'hechingen'>> = (props) => (
  <GlassHeading {...props} hechingen={true} />
);

export const GlassHeadingGradient: React.FC<Omit<GlassHeadingProps, 'gradient'>> = (props) => (
  <GlassHeading {...props} gradient={true} />
);

// Specialized text components
export const GlassTextMuted: React.FC<Omit<GlassTextProps, 'variant'>> = (props) => (
  <GlassText {...props} variant="muted" />
);

export const GlassTextAccent: React.FC<Omit<GlassTextProps, 'variant'>> = (props) => (
  <GlassText {...props} variant="accent" />
);

export const GlassTextSuccess: React.FC<Omit<GlassTextProps, 'variant'>> = (props) => (
  <GlassText {...props} variant="success" />
);

// Quote Component
export interface GlassQuoteProps {
  children: React.ReactNode;
  author?: string;
  source?: string;
  className?: string;
}

export const GlassQuote: React.FC<GlassQuoteProps> = ({
  children,
  author,
  source,
  className
}) => {
  return (
    <blockquote className={clsx(
      'glass-card-light p-6 border-l-4 border-hechingen-blue-500',
      'italic glass-text-primary text-lg',
      className
    )}>
      <div className="mb-4">
        {children}
      </div>
      {(author || source) && (
        <footer className="glass-text-muted text-sm not-italic">
          {author && <span className="font-medium">— {author}</span>}
          {source && <span className="ml-2">({source})</span>}
        </footer>
      )}
    </blockquote>
  );
};

// Code Block Component
export interface GlassCodeProps {
  children: React.ReactNode;
  language?: string;
  inline?: boolean;
  className?: string;
}

export const GlassCode: React.FC<GlassCodeProps> = ({
  children,
  inline = false,
  className
}) => {
  if (inline) {
    return (
      <code className={clsx(
        'glass-bg-light px-2 py-1 rounded font-mono text-sm',
        'text-hechingen-blue-400 border border-glass-border-subtle',
        className
      )}>
        {children}
      </code>
    );
  }

  return (
    <pre className={clsx(
      'glass-card-medium p-4 overflow-x-auto',
      'border border-glass-border-medium rounded-lg',
      className
    )}>
      <code className="font-mono text-sm glass-text-primary">
        {children}
      </code>
    </pre>
  );
};

// List Components
export interface GlassListProps {
  children: React.ReactNode;
  ordered?: boolean;
  className?: string;
}

export const GlassList: React.FC<GlassListProps> = ({
  children,
  ordered = false,
  className
}) => {
  const Tag = ordered ? 'ol' : 'ul';
  
  return (
    <Tag className={clsx(
      'glass-text-primary space-y-2',
      ordered ? 'list-decimal list-inside' : 'list-disc list-inside',
      'marker:text-hechingen-blue-400',
      className
    )}>
      {children}
    </Tag>
  );
};

export interface GlassListItemProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassListItem: React.FC<GlassListItemProps> = ({
  children,
  className
}) => {
  return (
    <li className={clsx(
      'glass-text-primary leading-relaxed',
      className
    )}>
      {children}
    </li>
  );
};

// Link Component
export interface GlassLinkProps {
  children: React.ReactNode;
  href: string;
  external?: boolean;
  variant?: 'default' | 'hechingen' | 'muted';
  className?: string;
}

export const GlassLink: React.FC<GlassLinkProps> = ({
  children,
  href,
  external = false,
  variant = 'default',
  className
}) => {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={clsx(
        'transition-all duration-200 hover:transform hover:scale-105',
        'focus:outline-none focus:ring-2 focus:ring-hechingen-blue-500/30 rounded',
        
        // Variant styles
        variant === 'default' && 'glass-text-primary hover:text-hechingen-blue-400 underline decoration-hechingen-blue-500/30 hover:decoration-hechingen-blue-500',
        variant === 'hechingen' && 'text-hechingen-blue-400 hover:text-hechingen-blue-300 underline decoration-hechingen-blue-500/50 hover:decoration-hechingen-blue-400',
        variant === 'muted' && 'glass-text-muted hover:glass-text-primary no-underline hover:underline',
        
        className
      )}
    >
      {children}
      {external && (
        <span className="inline-block ml-1 text-xs opacity-60">
          ↗
        </span>
      )}
    </a>
  );
};