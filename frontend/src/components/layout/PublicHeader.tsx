import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Users } from 'lucide-react';

const PublicHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/public" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EM</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Energy Management Hechingen
              </h1>
            </Link>
          </div>

          {/* Navigation for Public */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/public" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Energieplattform
            </Link>
            <a 
              href="https://www.hechingen.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Stadt Hechingen
            </a>
          </nav>

          {/* Login Actions */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/register"
              className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Registrieren</span>
            </Link>
            
            <Link 
              to="/login"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span>Anmelden</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;