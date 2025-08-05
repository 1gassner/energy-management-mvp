import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { RegisterData } from '@/types';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, UserPlus, AlertTriangle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { securityService } from '@/services/securityService';

interface PasswordStrength {
  score: number;
  color: string;
  text: string;
  requirements: {
    minLength: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
    common: boolean;
  };
}

const SecureRegister: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<RegisterData>>({});
  const [securityWarning, setSecurityWarning] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    color: 'bg-gray-300',
    text: 'Keine Eingabe',
    requirements: {
      minLength: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
      common: true
    }
  });

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

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      updatePasswordStrength(formData.password);
    } else {
      setPasswordStrength({
        score: 0,
        color: 'bg-gray-300',
        text: 'Keine Eingabe',
        requirements: {
          minLength: false,
          lowercase: false,
          uppercase: false,
          number: false,
          special: false,
          common: true
        }
      });
    }
  }, [formData.password]);

  const updatePasswordStrength = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      common: !['password', '123456', 'admin', 'citypulse', 'hechingen'].some(common => 
        password.toLowerCase().includes(common)
      )
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    let color = 'bg-red-500';
    let text = 'Sehr schwach';
    
    if (score >= 5) {
      color = 'bg-green-500';
      text = 'Stark';
    } else if (score >= 4) {
      color = 'bg-yellow-500';
      text = 'Mittel';
    } else if (score >= 2) {
      color = 'bg-orange-500';
      text = 'Schwach';
    }

    setPasswordStrength({ score, color, text, requirements });
  };

  const validateForm = (): boolean => {
    // Use security service for validation
    const validation = securityService.validateRegistrationData(formData);
    
    if (!validation.valid) {
      const errors: Partial<RegisterData> = {};
      validation.errors.forEach(error => {
        if (error.includes('Name')) {
          errors.name = error;
        } else if (error.includes('E-Mail')) {
          errors.email = error;
        } else if (error.includes('Passwort') && !error.includes('stimmen')) {
          errors.password = error;
        } else if (error.includes('stimmen')) {
          errors.confirmPassword = error;
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
    
    // Check rate limiting
    const rateLimitCheck = securityService.checkRateLimit('register');
    if (!rateLimitCheck.allowed) {
      setValidationErrors({ 
        email: 'Zu viele Registrierungsversuche. Bitte warten Sie.' 
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Check password strength
    if (passwordStrength.score < 4) {
      setValidationErrors({
        password: 'Passwort ist nicht stark genug. Bitte erfüllen Sie mehr Sicherheitsanforderungen.'
      });
      return;
    }

    const success = await register(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input for display (but keep original for submission if it's a password)
    const sanitizedValue = name.includes('password') ? value : securityService.sanitizeInput(value);
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear validation error for this field
    if (validationErrors[name as keyof RegisterData]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const RequirementCheck: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
    <div className={`flex items-center space-x-2 text-sm ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-gray-300" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
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
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">CP</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sichere Registrierung
          </h2>
          <p className="text-gray-600">
            Erstellen Sie sicher Ihren CityPulse Account
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Vollständiger Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Max Mustermann"
                  disabled={isLoading}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

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
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${validationErrors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Sicheres Passwort"
                  disabled={isLoading}
                  required
                  minLength={8}
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 min-w-16">{passwordStrength.text}</span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="space-y-1 p-3 bg-gray-50 rounded-lg">
                    <RequirementCheck met={passwordStrength.requirements.minLength} text="Mindestens 8 Zeichen" />
                    <RequirementCheck met={passwordStrength.requirements.lowercase} text="Kleinbuchstabe" />
                    <RequirementCheck met={passwordStrength.requirements.uppercase} text="Großbuchstabe" />
                    <RequirementCheck met={passwordStrength.requirements.number} text="Zahl" />
                    <RequirementCheck met={passwordStrength.requirements.special} text="Sonderzeichen" />
                    <RequirementCheck met={passwordStrength.requirements.common} text="Kein einfaches Passwort" />
                  </div>
                </div>
              )}
              
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Passwort bestätigen
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Passwort wiederholen"
                  disabled={isLoading}
                  required
                  maxLength={128}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Security Notice */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p>🔒 Ihre Daten werden verschlüsselt übertragen und sicher gespeichert.</p>
              <p>Diese Anwendung nutzt moderne Sicherheitsstandards zum Schutz Ihrer Daten.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || passwordStrength.score < 4}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="text-white" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Sicher registrieren</span>
                </>
              )}
            </button>
            
            {passwordStrength.score < 4 && formData.password && (
              <p className="text-xs text-center text-gray-500">
                Verstärken Sie Ihr Passwort, um sich registrieren zu können
              </p>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Bereits einen Account?{' '}
              <Link
                to="/secure-login"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Hier sicher anmelden
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
              <p>✓ Starke Passwort-Anforderungen</p>
              <p>✓ Eingabevalidierung und -sanitisierung</p>
              <p>✓ Rate-Limiting zum Schutz vor Missbrauch</p>
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

export default SecureRegister;