import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  // Handle escape key, body scroll lock, and animations
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle touch gestures for closing
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;
    
    // Close sidebar on swipe left
    if (deltaX > 50) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 150);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Enhanced Backdrop with Blur */}
      <div 
        className={cn(
          "fixed inset-0 backdrop-blur-sm transition-all duration-300",
          "bg-black/50",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />
      
      {/* Enhanced Sidebar Panel - Mobile Optimized */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 flex flex-col w-80 max-w-[90vw]",
          "glass-nav glass-nav-hechingen shadow-2xl",
          "transform transition-all duration-300 ease-out",
          "border-r-2 border-hechingen-blue-500/30",
          "safe-area-inset-left",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        {/* Modern Close Button - Mobile Optimized */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-2xl",
              "glass-button-secondary shadow-lg hover:scale-110 transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-blue-400/50 touch-target",
              "active:scale-95 active:bg-white/20"
            )}
            onClick={handleClose}
            aria-label="Navigation schließen"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        
        {/* Swipe Indicator - Enhanced for mobile */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-white/60 font-medium">
          Wischen zum Schließen
        </div>
        
        {/* Enhanced Sidebar Content - Mobile Safe Area */}
        <div className="flex-1 overflow-hidden pt-16">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <Sidebar isCollapsed={false} />
          </div>
        </div>
        
        {/* Mobile Navigation Footer */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent safe-area-inset-bottom">
          <div className="flex items-center justify-between touch-target">
            <div className="text-xs text-blue-200/80 font-medium">
              ← Nach links wischen zum Schließen
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors touch-target"
                aria-label="Schließen"
              >
                <ChevronLeft className="w-4 h-4 text-blue-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;