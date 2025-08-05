/**
 * Security Service - Handles CSRF protection, input validation, and security utilities
 */

import { LoginCredentials, RegisterData } from '@/types';

interface SecurityConfig {
  rateLimitAttempts: number;
  rateLimitWindow: number; // in milliseconds
  maxLoginAttempts: number;
  csrfTokenLifetime: number;
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blocked?: boolean;
  blockUntil?: number;
}

class SecurityService {
  private config: SecurityConfig = {
    rateLimitAttempts: 5,
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    maxLoginAttempts: 3,
    csrfTokenLifetime: 24 * 60 * 60 * 1000, // 24 hours
  };

  private rateLimitStore: Map<string, RateLimitEntry> = new Map();
  private csrfTokens: Map<string, { token: string; expiry: number }> = new Map();

  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  /**
   * Generate a secure CSRF token
   */
  generateCSRFToken(): string {
    const timestamp = Date.now().toString();
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    const token = btoa(`${timestamp}:${randomString}`).replace(/[+/=]/g, '');
    
    const sessionId = this.getSessionId();
    this.csrfTokens.set(sessionId, {
      token,
      expiry: Date.now() + this.config.csrfTokenLifetime
    });

    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string): boolean {
    if (!token) return false;

    const sessionId = this.getSessionId();
    const storedToken = this.csrfTokens.get(sessionId);

    if (!storedToken) return false;
    if (Date.now() > storedToken.expiry) {
      this.csrfTokens.delete(sessionId);
      return false;
    }

    return storedToken.token === token;
  }

  /**
   * Get or generate session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      const randomBytes = new Uint8Array(16);
      crypto.getRandomValues(randomBytes);
      sessionId = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Check if IP/client is rate limited
   */
  checkRateLimit(identifier: string = 'global'): { allowed: boolean; remainingAttempts: number; resetTime?: number } {
    const now = Date.now();
    const entry = this.rateLimitStore.get(identifier);

    if (!entry) {
      // First attempt
      this.rateLimitStore.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return { allowed: true, remainingAttempts: this.config.rateLimitAttempts - 1 };
    }

    // Check if blocked
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        resetTime: entry.blockUntil 
      };
    }

    // Check if window has expired
    if (now - entry.firstAttempt > this.config.rateLimitWindow) {
      // Reset window
      this.rateLimitStore.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      return { allowed: true, remainingAttempts: this.config.rateLimitAttempts - 1 };
    }

    // Increment attempts
    entry.attempts++;
    entry.lastAttempt = now;

    if (entry.attempts > this.config.rateLimitAttempts) {
      // Block for extended period
      entry.blocked = true;
      entry.blockUntil = now + (this.config.rateLimitWindow * 2);
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        resetTime: entry.blockUntil 
      };
    }

    return { 
      allowed: true, 
      remainingAttempts: this.config.rateLimitAttempts - entry.attempts 
    };
  }

  /**
   * Validate and sanitize login credentials
   */
  validateLoginCredentials(credentials: LoginCredentials): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    if (!credentials.email || typeof credentials.email !== 'string') {
      errors.push('E-Mail ist erforderlich');
    } else {
      const sanitizedEmail = this.sanitizeInput(credentials.email);
      if (sanitizedEmail !== credentials.email) {
        errors.push('E-Mail enthält ungültige Zeichen');
      }
      if (!this.isValidEmail(sanitizedEmail)) {
        errors.push('Ungültiges E-Mail-Format');
      }
    }

    // Password validation
    if (!credentials.password || typeof credentials.password !== 'string') {
      errors.push('Passwort ist erforderlich');
    } else if (credentials.password.length < 6) {
      errors.push('Passwort zu kurz');
    } else if (credentials.password.length > 128) {
      errors.push('Passwort zu lang');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate and sanitize registration data
   */
  validateRegistrationData(data: RegisterData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Name validation
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name ist erforderlich');
    } else {
      const sanitizedName = this.sanitizeInput(data.name);
      if (sanitizedName !== data.name) {
        errors.push('Name enthält ungültige Zeichen');
      }
      if (sanitizedName.trim().length < 2) {
        errors.push('Name muss mindestens 2 Zeichen lang sein');
      }
      if (sanitizedName.length > 100) {
        errors.push('Name ist zu lang');
      }
    }

    // Email validation (same as login)
    const emailValidation = this.validateLoginCredentials({ email: data.email, password: 'temp' });
    if (!emailValidation.valid) {
      errors.push(...emailValidation.errors.filter(e => e.includes('E-Mail')));
    }

    // Password strength validation
    if (!data.password || typeof data.password !== 'string') {
      errors.push('Passwort ist erforderlich');
    } else {
      const passwordStrength = this.validatePasswordStrength(data.password);
      if (!passwordStrength.valid) {
        errors.push(...passwordStrength.errors);
      }
    }

    // Confirm password
    if (data.password !== data.confirmPassword) {
      errors.push('Passwörter stimmen nicht überein');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Passwort muss mindestens 8 Zeichen lang sein');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
    }

    if (!/\d/.test(password)) {
      errors.push('Passwort muss mindestens eine Zahl enthalten');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Passwort sollte mindestens ein Sonderzeichen enthalten');
    }

    // Check for common passwords
    const commonPasswords = ['password', '123456', 'admin', 'citypulse', 'hechingen'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Passwort ist zu einfach');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>\"']/g, '') // Remove HTML/script chars
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim();
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Generate secure error messages that don't leak information
   */
  getSecureErrorMessage(error: Error | string, isProduction: boolean = import.meta.env.PROD): string {
    const errorMessage = typeof error === 'string' ? error : error.message;

    if (!isProduction) {
      return errorMessage; // Development: show detailed errors
    }

    // Production: Generic error messages
    if (errorMessage.toLowerCase().includes('login') || 
        errorMessage.toLowerCase().includes('auth') ||
        errorMessage.toLowerCase().includes('credential')) {
      return 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.';
    }

    if (errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('fetch') ||
        errorMessage.toLowerCase().includes('connection')) {
      return 'Verbindungsfehler. Bitte versuchen Sie es später erneut.';
    }

    if (errorMessage.toLowerCase().includes('validation') ||
        errorMessage.toLowerCase().includes('invalid')) {
      return 'Eingabefehler. Bitte überprüfen Sie Ihre Daten.';
    }

    return 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
  }

  /**
   * Check if current environment is secure (HTTPS in production)
   */
  isSecureEnvironment(): boolean {
    if (import.meta.env.DEV) return true; // Development is OK
    return window.location.protocol === 'https:';
  }

  /**
   * Clean up expired entries from rate limit store and CSRF tokens
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();

    // Clean rate limit entries
    for (const [identifier, entry] of this.rateLimitStore.entries()) {
      if (entry.blockUntil && now > entry.blockUntil) {
        this.rateLimitStore.delete(identifier);
      } else if (now - entry.firstAttempt > this.config.rateLimitWindow) {
        this.rateLimitStore.delete(identifier);
      }
    }

    // Clean expired CSRF tokens
    for (const [sessionId, tokenData] of this.csrfTokens.entries()) {
      if (now > tokenData.expiry) {
        this.csrfTokens.delete(sessionId);
      }
    }
  }

  /**
   * Hash password client-side (additional security layer)
   */
  async hashPassword(password: string, salt?: string): Promise<string> {
    const encoder = new TextEncoder();
    const saltValue = salt || crypto.getRandomValues(new Uint8Array(16)).toString();
    const data = encoder.encode(password + saltValue);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${hashHex}:${saltValue}`;
  }

  /**
   * Verify that the current page is served over HTTPS in production
   */
  enforceHTTPS(): void {
    if (import.meta.env.PROD && window.location.protocol !== 'https:') {
      window.location.replace(window.location.href.replace('http:', 'https:'));
    }
  }
}

export const securityService = new SecurityService();