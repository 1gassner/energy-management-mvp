import React, { useState, useEffect } from 'react';
import { securityService } from '@/services/securityService';

interface SecureInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  sanitize?: boolean;
  showStrengthMeter?: boolean;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  validatePattern?: RegExp;
  customValidator?: (value: string) => { valid: boolean; errors: string[] };
}

const SecureInput: React.FC<SecureInputProps> = ({
  value,
  onChange,
  sanitize = true,
  showStrengthMeter = false,
  onValidationChange,
  validatePattern,
  customValidator,
  type = 'text',
  className = '',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Validate input
  useEffect(() => {
    validateInput(internalValue);
  }, [internalValue, validatePattern, customValidator]);

  const validateInput = (inputValue: string) => {
    const errors: string[] = [];
    let valid = true;

    // Pattern validation
    if (validatePattern && inputValue && !validatePattern.test(inputValue)) {
      errors.push('Eingabe entspricht nicht dem erwarteten Format');
      valid = false;
    }

    // Custom validation
    if (customValidator) {
      const customResult = customValidator(inputValue);
      if (!customResult.valid) {
        errors.push(...customResult.errors);
        valid = false;
      }
    }

    // Email validation for email type
    if (type === 'email' && inputValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue)) {
        errors.push('Ungültige E-Mail-Adresse');
        valid = false;
      }
    }

    // Length validation based on type
    if (inputValue) {
      if (type === 'email' && inputValue.length > 254) {
        errors.push('E-Mail-Adresse zu lang');
        valid = false;
      }
      if (type === 'password' && inputValue.length > 128) {
        errors.push('Passwort zu lang');
        valid = false;
      }
      if (type === 'text' && inputValue.length > 1000) {
        errors.push('Eingabe zu lang');
        valid = false;
      }
    }

    setValidationErrors(errors);
    setIsValid(valid);
    
    if (onValidationChange) {
      onValidationChange(valid, errors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Sanitize input if enabled (but not for passwords)
    if (sanitize && type !== 'password') {
      newValue = securityService.sanitizeInput(newValue);
    }

    setInternalValue(newValue);
    onChange(newValue);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: 'bg-gray-300' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    if (!['password', '123456', 'admin'].some(common => password.toLowerCase().includes(common))) score++;

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

    return { score, text, color };
  };

  const passwordStrength = type === 'password' && showStrengthMeter ? getPasswordStrength(internalValue) : null;

  return (
    <div className="w-full">
      <input
        {...props}
        type={type}
        value={internalValue}
        onChange={handleChange}
        className={`
          ${className}
          ${!isValid ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          ${isValid ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : ''}
        `}
        // Security attributes
        autoComplete={type === 'password' ? 'new-password' : props.autoComplete}
        spellCheck={type === 'password' ? false : props.spellCheck}
      />

      {/* Password Strength Meter */}
      {passwordStrength && internalValue && (
        <div className="mt-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 min-w-16">{passwordStrength.text}</span>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-2 space-y-1">
          {validationErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Secure TextArea component with similar security features
 */
interface SecureTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  sanitize?: boolean;
  maxLength?: number;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

export const SecureTextArea: React.FC<SecureTextAreaProps> = ({
  value,
  onChange,
  sanitize = true,
  maxLength = 5000,
  onValidationChange,
  className = '',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    validateInput(internalValue);
  }, [internalValue, maxLength]);

  const validateInput = (inputValue: string) => {
    const errors: string[] = [];
    let valid = true;

    if (inputValue.length > maxLength) {
      errors.push(`Text zu lang (max. ${maxLength} Zeichen)`);
      valid = false;
    }

    setValidationErrors(errors);
    setIsValid(valid);
    
    if (onValidationChange) {
      onValidationChange(valid, errors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    if (sanitize) {
      newValue = securityService.sanitizeInput(newValue);
    }

    setInternalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="w-full">
      <textarea
        {...props}
        value={internalValue}
        onChange={handleChange}
        maxLength={maxLength}
        className={`
          ${className}
          ${!isValid ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          ${isValid ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : ''}
        `}
      />

      {/* Character Count */}
      <div className="mt-1 text-right">
        <span className={`text-xs ${internalValue.length > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
          {internalValue.length} / {maxLength}
        </span>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-2 space-y-1">
          {validationErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecureInput;