import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { RegisterData } from '@/types';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Register: React.FC = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

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

  const validateForm = useCallback((): boolean => {
    const errors: Partial<RegisterData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name ist erforderlich';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name muss mindestens 2 Zeichen lang sein';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name ist zu lang (max. 100 Zeichen)';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Ungültiges E-Mail-Format';
    } else if (formData.email.length > 254) {
      errors.email = 'E-Mail-Adresse ist zu lang';
    }
    
    if (!formData.password) {
      errors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 8) {
      errors.password = 'Passwort muss mindestens 8 Zeichen lang sein';
    } else if (formData.password.length > 128) {
      errors.password = 'Passwort ist zu lang (max. 128 Zeichen)';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Passwort bestätigen ist erforderlich';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwörter stimmen nicht überein';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  
  // Real-time validation for touched fields
  useEffect(() => {
    if (touchedFields.size > 0) {
      validateForm();
    }
  }, [formData, touchedFields, validateForm]);

  const resetForm = useCallback(() => {
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setValidationErrors({});
    setTouchedFields(new Set());
    setSubmitSuccess(false);
    clearError();
  }, [clearError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    // Mark all fields as touched for validation display
    setTouchedFields(new Set(['name', 'email', 'password', 'confirmPassword']));
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    // Check password strength
    const passwordStrengthCheck = getPasswordStrength(formData.password);
    if (passwordStrengthCheck.strength < 4) {
      setValidationErrors(prev => ({
        ...prev,
        password: 'Passwort ist nicht stark genug. Bitte wählen Sie ein stärkeres Passwort.'
      }));
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      if (success) {
        setSubmitSuccess(true);
        // Brief delay to show success feedback before navigation
        setTimeout(() => {
          resetForm();
          navigate('/dashboard');
        }, 500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouchedFields(prev => new Set([...prev, name]));
    
    // Clear submit success state on any input change
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouchedFields(prev => new Set([...prev, name]));
  };
  
  // Helper function to determine if field should show error
  const shouldShowError = (fieldName: string) => {
    return touchedFields.has(fieldName) && validationErrors[fieldName as keyof RegisterData];
  };

  const getPasswordStrength = (password: string): { strength: number; color: string; text: string } => {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength < 3) return { strength, color: 'bg-red-500', text: 'Schwach' };
    if (strength < 5) return { strength, color: 'bg-yellow-500', text: 'Mittel' };
    return { strength, color: 'bg-green-500', text: 'Stark' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">EM</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Account erstellen
          </h2>
          <p className="text-gray-600">
            Registrieren Sie sich für Energy Management
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-sm text-green-600">Registrierung erfolgreich! Sie werden weitergeleitet...</p>
                </div>
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
                  onBlur={handleBlur}
                  className={`input-field pl-10 transition-colors ${
                    shouldShowError('name') 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : touchedFields.has('name') && !validationErrors.name
                      ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                      : ''
                  }`}
                  placeholder="Max Mustermann"
                  disabled={isLoading || isSubmitting}
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
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field pl-10 ${validationErrors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="ihre@email.com"
                  disabled={isLoading}
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
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${validationErrors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Sicheres Passwort"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isSubmitting}
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
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{passwordStrength.text}</span>
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
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Passwort wiederholen"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading || isSubmitting}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting || submitSuccess || getPasswordStrength(formData.password).strength < 4}
              className={`w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                submitSuccess ? 'bg-green-600 hover:bg-green-600' : ''
              }`}
            >
              {isLoading || isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="text-white" />
                  <span>Account wird erstellt...</span>
                </>
              ) : submitSuccess ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Erfolgreich!</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Account erstellen</span>
                </>
              )}
            </button>
            
            {/* Password Strength Warning */}
            {formData.password && getPasswordStrength(formData.password).strength < 4 && (
              <p className="text-xs text-center text-orange-600 bg-orange-50 p-2 rounded">
                Verstärken Sie Ihr Passwort, um sich registrieren zu können
              </p>
            )}
            
            {/* Form Reset Button */}
            {(formData.name || formData.email || formData.password || formData.confirmPassword) && !isSubmitting && !submitSuccess && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Formular zurücksetzen
              </button>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Bereits einen Account?{' '}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Hier anmelden
              </Link>
            </p>
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

export default Register;