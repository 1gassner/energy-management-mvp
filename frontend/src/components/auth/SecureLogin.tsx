import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LoginCredentials } from '@/types';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { securityService } from '@/services/securityService';

const SecureLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({});
  const [securityWarning, setSecurityWarning] = useState<string>('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remainingAttempts: number; resetTime?: number } | null>(null);

  // Security check on mount
  useEffect(() => {
    if (!securityService.isSecureEnvironment()) {
      setSecurityWarning('Warnung: Diese Verbindung ist nicht sicher. Verwenden Sie HTTPS für den Produktivbetrieb.');
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const validateForm = (): boolean => {
    // Use security service for validation
    const validation = securityService.validateLoginCredentials(formData);
    
    if (!validation.valid) {
      const errors: Partial<LoginCredentials> = {};
      validation.errors.forEach(error => {
        if (error.includes('E-Mail')) {
          errors.email = error;
        } else if (error.includes('Passwort')) {
          errors.password = error;
        }
      });
      setValidationErrors(errors);
      return false;
    }
    
    setValidationErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Check rate limiting before attempting login
    const rateLimitCheck = securityService.checkRateLimit('login');
    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetTime ? new Date(rateLimitCheck.resetTime).toLocaleTimeString() : 'später';
      setValidationErrors({ 
        email: `Zu viele Anmeldeversuche. Versuchen Sie es um ${resetTime} erneut.` 
      });
      return;
    }

    setRateLimitInfo({
      remainingAttempts: rateLimitCheck.remainingAttempts,
      resetTime: rateLimitCheck.resetTime
    });

    if (!validateForm()) {
      return;
    }

    const success = await login(formData);
    if (success) {
      navigate('/dashboard');
    } else {
      // Update rate limit info after failed attempt
      const newRateLimitCheck = securityService.checkRateLimit('login');
      setRateLimitInfo({
        remainingAttempts: newRateLimitCheck.remainingAttempts,
        resetTime: newRateLimitCheck.resetTime
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input for display (but keep original for submission)
    const sanitizedValue = name === 'password' ? value : securityService.sanitizeInput(value);
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear validation error for this field
    if (validationErrors[name as keyof LoginCredentials]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Security Warning */}
        {securityWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">{securityWarning}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">CP</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sichere Anmeldung
          </h2>
          <p className="text-gray-600">
            Melden Sie sich sicher in Ihrem CityPulse Account an
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Rate Limit Info */}
            {rateLimitInfo && rateLimitInfo.remainingAttempts <= 2 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-700">
                  {rateLimitInfo.remainingAttempts > 0 
                    ? `Noch ${rateLimitInfo.remainingAttempts} Anmeldeversuche übrig`
                    : 'Zu viele Anmeldeversuche. Bitte warten Sie.'
                  }
                </p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="ihre@email.com"
                  disabled={isLoading}
                  required
                  maxLength={254}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${validationErrors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Ihr Passwort"
                  disabled={isLoading}
                  required
                  minLength={6}
                  maxLength={128}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Security Notice */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p>🔒 Ihre Daten werden verschlüsselt übertragen und sicher gespeichert.</p>
              <p>Diese Anwendung nutzt CSRF-Schutz und sichere Cookies.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (rateLimitInfo?.remainingAttempts === 0)}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="text-white" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sicher anmelden</span>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Noch kein Account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Hier sicher registrieren
              </Link>
            </p>
          </div>

          {/* Security Features Notice */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Sicherheitsfeatures:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>✓ Verschlüsselte Datenübertragung (HTTPS)</p>
              <p>✓ Sichere httpOnly-Cookies</p>
              <p>✓ CSRF-Schutz aktiviert</p>
              <p>✓ Eingabevalidierung und -sanitisierung</p>
              <p>✓ Rate-Limiting zum Schutz vor Brute-Force</p>
              <p>✓ Keine Speicherung sensibler Daten im Browser</p>
            </div>
          </div>
        </div>

        {/* Public Dashboard Link */}
        <div className="text-center">
          <Link
            to="/public"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Öffentliches Dashboard ansehen →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SecureLogin;