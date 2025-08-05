import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

const DEFAULT_LINKS: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#search', label: 'Skip to search' },
  { href: '#footer', label: 'Skip to footer' }
];

interface SkipNavigationProps {
  links?: SkipLink[];
  className?: string;
}

const SkipNavigation: React.FC<SkipNavigationProps> = ({
  links = DEFAULT_LINKS,
  className
}) => {
  return (
    <div
      className={cn(
        'sr-only focus-within:not-sr-only',
        'absolute top-0 left-0 z-[100]',
        className
      )}
    >
      <ul className="flex flex-col bg-white dark:bg-gray-900 shadow-lg">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={cn(
                'block px-4 py-2 text-sm font-medium',
                'text-gray-900 dark:text-white',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'focus:bg-blue-500 focus:text-white focus:outline-none',
                'underline decoration-2 underline-offset-2'
              )}
              onClick={(e) => {
                e.preventDefault();
                const target = document.querySelector(link.href);
                if (target) {
                  (target as HTMLElement).focus();
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkipNavigation;