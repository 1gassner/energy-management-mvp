import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Users, Home, Phone, Mail } from 'lucide-react';

const PublicHeader: React.FC = () => {
  return (
    <header className="bg-white/90 backdrop-blur-md shadow-soft border-b border-hechingen-accent-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title - Official Hechingen Branding */}
          <div className="flex items-center space-x-4">
            <Link to="/public" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-hechingen-primary-500 rounded-xl flex items-center justify-center shadow-hechingen group-hover:scale-105 transition-all duration-200">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-hechingen-primary-700 leading-tight">
                  Stadt Hechingen
                </h1>
                <span className="text-sm text-hechingen-accent-600 font-medium leading-tight">
                  CityPulse Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation for Public - Enhanced */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-hechingen-accent-700 hover:text-hechingen-primary-600 font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-hechingen-primary-50"
            >
              Energieportal
            </Link>
            <a 
              href="https://www.hechingen.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-hechingen-accent-700 hover:text-hechingen-primary-600 font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-hechingen-primary-50"
            >
              Stadt Website
            </a>
            <div className="flex items-center space-x-4 text-sm text-hechingen-accent-600">
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>07471 930-0</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>info@hechingen.de</span>
              </div>
            </div>
          </nav>

          {/* Login Actions - Enhanced */}
          <div className="flex items-center space-x-3">
            <Link 
              to="/register"
              className="hidden sm:flex items-center space-x-2 text-hechingen-accent-700 hover:text-hechingen-primary-600 font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-hechingen-primary-50"
            >
              <Users className="w-4 h-4" />
              <span>Registrieren</span>
            </Link>
            
            <Link 
              to="/login"
              className="flex items-center space-x-2 bg-hechingen-primary-500 text-white px-4 py-2 rounded-lg hover:bg-hechingen-primary-600 transition-all duration-200 font-medium shadow-hechingen hover:shadow-lg hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              <span>Verwaltung</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;