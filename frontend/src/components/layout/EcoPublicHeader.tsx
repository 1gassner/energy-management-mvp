import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Users, Home, Phone, Mail, Sparkles, Menu, X, ExternalLink } from 'lucide-react';
import EcoButton from '../ui/EcoButton';
import { cn } from '@/lib/utils';

const EcoPublicHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      'backdrop-blur-2xl border-b border-white/10',
      isScrolled 
        ? 'bg-slate-900/95 shadow-2xl shadow-emerald-500/10' 
        : 'bg-slate-900/80'
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Eco Logo and Title */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden eco-button secondary p-3 !rounded-2xl mr-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Navigation öffnen"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link to="/public" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-14 h-14 eco-card rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500 bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                  <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse border-2 border-slate-900" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Stadt Hechingen
                </h1>
                <p className="text-sm text-slate-400 font-medium">CityPulse Portal • Smart & Transparent</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-slate-300 hover:text-emerald-400 font-medium transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/10 hover:scale-105"
            >
              Energieportal
            </Link>
            <a 
              href="https://www.hechingen.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-blue-400 font-medium transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/10 hover:scale-105"
            >
              Stadt Website
            </a>
            
            {/* Contact Info */}
            <div className="flex items-center space-x-6 text-sm text-slate-400 ml-6 border-l border-slate-700 pl-6">
              <div className="flex items-center space-x-2 hover:text-emerald-400 transition-colors duration-300">
                <Phone className="w-4 h-4" />
                <span>07471 930-0</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-blue-400 transition-colors duration-300">
                <Mail className="w-4 h-4" />
                <span>info@hechingen.de</span>
              </div>
            </div>
          </nav>

          {/* Login Button */}
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <EcoButton
                variant="outline"
                size="md"
                icon={LogIn}
                className="hidden sm:flex"
              >
                Anmelden
              </EcoButton>
              <EcoButton
                variant="outline"
                size="sm"
                className="sm:hidden !p-3"
              >
                <LogIn className="w-4 h-4" />
              </EcoButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 eco-card border-t border-white/10 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="p-6 space-y-4">
            <Link 
              to="/" 
              className="block text-slate-300 hover:text-emerald-400 font-medium transition-all duration-300 p-3 rounded-xl hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🏠 Energieportal
            </Link>
            <a 
              href="https://www.hechingen.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between text-slate-300 hover:text-blue-400 font-medium transition-all duration-300 p-3 rounded-xl hover:bg-white/10"
            >
              <span>🌐 Stadt Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            
            <div className="border-t border-slate-700 pt-4">
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>07471 930-0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>info@hechingen.de</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default EcoPublicHeader;