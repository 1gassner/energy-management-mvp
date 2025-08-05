import React from 'react';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stadt Hechingen Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <h3 className="text-lg font-semibold">Stadt Hechingen</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Intelligente Energieverwaltung für eine nachhaltige Zukunft unserer Stadt.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-300">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Obertorplatz 7, 72379 Hechingen</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>07471 930-0</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>info@hechingen.de</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="/dashboard" className="block text-sm text-gray-300 hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="/buildings" className="block text-sm text-gray-300 hover:text-white transition-colors">
                Gebäude Übersicht
              </a>
              <a href="/energy-flow" className="block text-sm text-gray-300 hover:text-white transition-colors">
                Energiefluss
              </a>
              <a href="/reports" className="block text-sm text-gray-300 hover:text-white transition-colors">
                Berichte
              </a>
              <a 
                href="https://www.hechingen.de" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
              >
                Stadt Website
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          {/* System Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">System</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-300">
                <span className="font-medium">CityPulse Hechingen</span>
              </div>
              <div className="text-sm text-gray-300">
                Energy Management System v1.0
              </div>
              <div className="text-sm text-gray-300">
                Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">System Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} Stadt Hechingen. Alle Rechte vorbehalten.
            </div>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Datenschutz
              </a>
              <a href="/imprint" className="text-sm text-gray-400 hover:text-white transition-colors">
                Impressum
              </a>
              <a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Nutzungsbedingungen
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;