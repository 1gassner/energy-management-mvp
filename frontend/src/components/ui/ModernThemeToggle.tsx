import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ModernThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ModernThemeToggle: React.FC<ModernThemeToggleProps> = ({
  className = '',
  size = 'md'
}) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);
  }, []);

  // Apply theme
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const themes = [
    { 
      key: 'light' as Theme, 
      icon: Sun, 
      label: 'Light Mode',
      gradient: 'from-yellow-400 to-orange-500',
      iconColor: 'text-yellow-600'
    },
    { 
      key: 'dark' as Theme, 
      icon: Moon, 
      label: 'Dark Mode',
      gradient: 'from-purple-500 to-blue-600',
      iconColor: 'text-purple-400'
    },
    { 
      key: 'system' as Theme, 
      icon: Monitor, 
      label: 'System',
      gradient: 'from-gray-500 to-gray-700',
      iconColor: 'text-gray-400'
    },
  ];

  const currentTheme = themes.find(t => t.key === theme) || themes[2];

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (!mounted) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse`} />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main toggle button */}
      <motion.button
        className={`
          ${sizeClasses[size]} 
          glass-premium rounded-full border border-white/20
          flex items-center justify-center
          transition-all duration-300
          hover:scale-110 hover:rotate-12
          shadow-lg hover:shadow-xl
        `}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, rotate: 12 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0.3)',
            '0 0 30px rgba(147, 51, 234, 0.4)',
            '0 0 20px rgba(59, 130, 246, 0.3)'
          ]
        }}
        transition={{
          boxShadow: {
            duration: 3,
            repeat: Infinity,
          }
        }}
      >
        {/* Background gradient */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentTheme.gradient} opacity-20`}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`relative z-10 ${currentTheme.iconColor}`}
          >
            <currentTheme.icon className={iconSizes[size]} />
          </motion.div>
        </AnimatePresence>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ 
            x: '100%', 
            opacity: 1,
            transition: { duration: 0.8, ease: 'easeInOut' }
          }}
        />
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              className="absolute top-full right-0 mt-2 z-50"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="glass-card-modern p-2 min-w-[160px] shadow-2xl">
                {themes.map((themeOption, index) => (
                  <motion.button
                    key={themeOption.key}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg
                      text-white/80 hover:text-white
                      hover:bg-white/10 transition-all duration-200
                      ${theme === themeOption.key ? 'bg-white/15 text-white' : ''}
                    `}
                    onClick={() => {
                      setTheme(themeOption.key);
                      setIsOpen(false);
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={`
                        w-6 h-6 rounded-full bg-gradient-to-r ${themeOption.gradient}
                        flex items-center justify-center
                      `}
                      animate={theme === themeOption.key ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <themeOption.icon className="w-3 h-3 text-white" />
                    </motion.div>
                    
                    <span className="text-sm font-medium">
                      {themeOption.label}
                    </span>
                    
                    {/* Check indicator */}
                    <AnimatePresence>
                      {theme === themeOption.key && (
                        <motion.div
                          className="ml-auto w-2 h-2 bg-blue-400 rounded-full"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
                
                {/* Decorative element */}
                <motion.div
                  className="mt-2 pt-2 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-xs text-white/50 text-center py-1">
                    Theme Preferences
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Tooltip */}
      <motion.div
        className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 pointer-events-none"
        animate={{ 
          opacity: isOpen ? 0 : 0,
        }}
        whileHover={{ opacity: 1 }}
      >
        {currentTheme.label}
      </motion.div>
    </div>
  );
};

export default ModernThemeToggle;