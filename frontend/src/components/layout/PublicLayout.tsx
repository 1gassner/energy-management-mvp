import React from 'react';
import PublicHeader from './PublicHeader';
import Footer from './Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <>
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 bg-hechingen-primary-600 text-white px-4 py-2 rounded-lg z-50 transition-all duration-200"
      >
        Zum Hauptinhalt springen
      </a>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-hechingen-primary-50 via-white to-hechingen-accent-50">
        <PublicHeader />
        
        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PublicLayout;