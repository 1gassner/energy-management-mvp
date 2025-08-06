import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AnimatedCard } from './AnimatedCard';
import { RippleButton } from './RippleButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <AnimatedCard 
            variant="premium" 
            animation="slideInUp"
            className="max-w-2xl w-full text-center overflow-hidden"
          >
            <div className="relative p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10" />
              
              <div className="relative z-10">
                {/* Animated Error Icon */}
                <div className="mb-8">
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full animate-pulse opacity-20" />
                    <div className="absolute inset-2 bg-gradient-to-br from-red-400 to-orange-400 rounded-full animate-ping" />
                    <div className="absolute inset-4 bg-gradient-to-br from-red-300 to-orange-300 rounded-full flex items-center justify-center">
                      <span className="text-3xl animate-bounce">⚠️</span>
                    </div>
                  </div>
                </div>

                {/* Error Title */}
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-300 via-orange-300 to-red-300 bg-clip-text text-transparent mb-4 animate-shimmer">
                  Oops! Etwas ist schiefgelaufen
                </h1>

                {/* Error Description */}
                <p className="text-blue-200/80 text-lg mb-8 leading-relaxed">
                  Ein unerwarteter Fehler ist aufgetreten. Keine Sorge - das passiert manchmal. 
                  Versuchen Sie es erneut oder laden Sie die Seite neu.
                </p>

                {/* Error Details (Development Mode) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <AnimatedCard variant="glass" className="mb-8 p-6 text-left">
                    <h3 className="text-lg font-semibold text-red-300 mb-3">
                      🐛 Fehlerdetails (Development)
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-red-400 font-medium">Fehler:</span>
                        <code className="block mt-1 p-3 bg-black/30 rounded-lg text-sm text-red-200 overflow-x-auto">
                          {this.state.error.message}
                        </code>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <span className="text-orange-400 font-medium">Stack Trace:</span>
                          <code className="block mt-1 p-3 bg-black/30 rounded-lg text-xs text-orange-200 overflow-x-auto whitespace-pre">
                            {this.state.errorInfo.componentStack}
                          </code>
                        </div>
                      )}
                    </div>
                  </AnimatedCard>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <RippleButton
                    onClick={this.handleRetry}
                    variant="primary"
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    🔄 Erneut versuchen
                  </RippleButton>
                  
                  <RippleButton
                    onClick={this.handleReload}
                    variant="secondary"
                    size="lg"
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
                  >
                    🔃 Seite neu laden
                  </RippleButton>
                </div>

                {/* Support Information */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-blue-200/60 text-sm mb-3">
                    Falls das Problem weiterhin besteht, kontaktieren Sie den Support:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
                    <a 
                      href="mailto:support@citypulse.de" 
                      className="text-blue-300 hover:text-blue-200 transition-colors underline decoration-dotted"
                    >
                      📧 support@citypulse.de
                    </a>
                    <span className="hidden sm:inline text-blue-200/40">•</span>
                    <a 
                      href="tel:+4970719999999" 
                      className="text-blue-300 hover:text-blue-200 transition-colors underline decoration-dotted"
                    >
                      📞 +49 (0) 7071 999-9999
                    </a>
                  </div>
                </div>

                {/* Helpful Tips */}
                <AnimatedCard variant="glass" className="mt-6 p-4 text-left" delay={0.5}>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    💡 Hilfreiche Tips
                  </h4>
                  <ul className="text-blue-200/80 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      Prüfen Sie Ihre Internetverbindung
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      Leeren Sie den Browser-Cache (Strg+Shift+Del)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      Versuchen Sie es mit einem anderen Browser
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      Deaktivieren Sie Browsererweiterungen temporär
                    </li>
                  </ul>
                </AnimatedCard>
              </div>
            </div>
          </AnimatedCard>
        </div>
      );
    }

    return this.props.children;
  }
}

// Mini Error Component for smaller areas
export const MiniErrorDisplay: React.FC<{
  error: string;
  onRetry?: () => void;
  className?: string;
}> = ({ error, onRetry, className = '' }) => {
  return (
    <AnimatedCard 
      variant="glass" 
      animation="slideInUp"
      className={`p-4 text-center ${className}`}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-2xl animate-bounce">😕</span>
        <p className="text-red-300 text-sm font-medium">{error}</p>
        {onRetry && (
          <RippleButton
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="text-blue-300 hover:text-white"
          >
            🔄 Erneut versuchen
          </RippleButton>
        )}
      </div>
    </AnimatedCard>
  );
};

// Network Error Component
export const NetworkErrorDisplay: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className = '' }) => {
  return (
    <AnimatedCard 
      variant="glass" 
      animation="slideInUp"
      className={`p-6 text-center ${className}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-2xl">🌐</span>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-2">Verbindungsfehler</h3>
          <p className="text-blue-200/80 text-sm mb-4">
            Keine Verbindung zum Server. Prüfen Sie Ihre Internetverbindung.
          </p>
          {onRetry && (
            <RippleButton
              onClick={onRetry}
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              🔄 Verbindung prüfen
            </RippleButton>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
};

// Permission Error Component
export const PermissionErrorDisplay: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = 'Sie haben keine Berechtigung für diese Aktion.', className = '' }) => {
  return (
    <AnimatedCard 
      variant="glass" 
      animation="slideInUp"
      className={`p-6 text-center ${className}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-2xl">🔒</span>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-2">Zugriff verweigert</h3>
          <p className="text-blue-200/80 text-sm">
            {message}
          </p>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default EnhancedErrorBoundary;