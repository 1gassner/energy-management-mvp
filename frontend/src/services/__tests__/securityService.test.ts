import { securityService } from '../securityService';
import { LoginCredentials, RegisterData } from '@/types';

describe('SecurityService', () => {
  beforeEach(() => {
    // Reset rate limiting for each test
    (securityService as any).rateLimitStore.clear();
    (securityService as any).csrfTokens.clear();
  });

  describe('CSRF Token Management', () => {
    it('should generate unique CSRF tokens', () => {
      const token1 = securityService.generateCSRFToken();
      const token2 = securityService.generateCSRFToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(10);
    });

    it('should validate CSRF tokens correctly', () => {
      const token = securityService.generateCSRFToken();
      
      expect(securityService.validateCSRFToken(token)).toBe(true);
      expect(securityService.validateCSRFToken('invalid-token')).toBe(false);
      expect(securityService.validateCSRFToken('')).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow initial requests', () => {
      const result = securityService.checkRateLimit('test-client');
      
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4); // 5 total - 1 used
    });

    it('should block after too many attempts', () => {
      const clientId = 'test-client-blocked';
      
      // Make 5 attempts (should be allowed)
      for (let i = 0; i < 5; i++) {
        const result = securityService.checkRateLimit(clientId);
        expect(result.allowed).toBe(true);
      }
      
      // 6th attempt should be blocked
      const blockedResult = securityService.checkRateLimit(clientId);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remainingAttempts).toBe(0);
      expect(blockedResult.resetTime).toBeDefined();
    });

    it('should reset rate limit after window expires', () => {
      const clientId = 'test-client-reset';
      
      // Make attempts to trigger rate limiting
      for (let i = 0; i < 5; i++) {
        securityService.checkRateLimit(clientId);
      }
      
      // Simulate time passing by manually resetting the first attempt time
      const rateLimitStore = (securityService as any).rateLimitStore;
      const entry = rateLimitStore.get(clientId);
      entry.firstAttempt = Date.now() - (16 * 60 * 1000); // 16 minutes ago
      
      const result = securityService.checkRateLimit(clientId);
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4);
    });
  });

  describe('Input Validation', () => {
    describe('Login Credentials', () => {
      it('should validate correct login credentials', () => {
        const credentials: LoginCredentials = {
          email: 'test@example.com',
          password: 'validpassword123'
        };
        
        const result = securityService.validateLoginCredentials(credentials);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject invalid email formats', () => {
        const credentials: LoginCredentials = {
          email: 'invalid-email',
          password: 'validpassword123'
        };
        
        const result = securityService.validateLoginCredentials(credentials);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('E-Mail'))).toBe(true);
      });

      it('should reject short passwords', () => {
        const credentials: LoginCredentials = {
          email: 'test@example.com',
          password: '123'
        };
        
        const result = securityService.validateLoginCredentials(credentials);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('Passwort'))).toBe(true);
      });
    });

    describe('Registration Data', () => {
      it('should validate correct registration data', () => {
        const data: RegisterData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'StrongPassword123!',
          confirmPassword: 'StrongPassword123!'
        };
        
        const result = securityService.validateRegistrationData(data);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject weak passwords', () => {
        const data: RegisterData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak',
          confirmPassword: 'weak'
        };
        
        const result = securityService.validateRegistrationData(data);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should reject mismatched passwords', () => {
        const data: RegisterData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'StrongPassword123!',
          confirmPassword: 'DifferentPassword123!'
        };
        
        const result = securityService.validateRegistrationData(data);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('stimmen'))).toBe(true);
      });

      it('should reject common passwords', () => {
        const data: RegisterData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
          confirmPassword: 'Password123'
        };
        
        const result = securityService.validateRegistrationData(data);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('einfach'))).toBe(true);
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should remove dangerous HTML characters', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = securityService.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('"');
    });

    it('should remove javascript protocols', () => {
      const maliciousInput = 'javascript:alert("xss")';
      const sanitized = securityService.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('javascript:');
    });

    it('should preserve safe content', () => {
      const safeInput = 'This is a safe string with numbers 123 and symbols!';
      const sanitized = securityService.sanitizeInput(safeInput);
      
      expect(sanitized).toContain('safe string');
      expect(sanitized).toContain('123');
      expect(sanitized).toContain('!');
    });

    it('should handle empty and null inputs', () => {
      expect(securityService.sanitizeInput('')).toBe('');
      expect(securityService.sanitizeInput(null as any)).toBe('');
      expect(securityService.sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('Error Message Security', () => {
    it('should return generic messages in production', () => {
      const sensitiveError = new Error('Database connection failed: Connection refused to mysql://admin:password@localhost:3306');
      const secureMessage = securityService.getSecureErrorMessage(sensitiveError, true);
      
      expect(secureMessage).not.toContain('mysql');
      expect(secureMessage).not.toContain('password');
      expect(secureMessage).not.toContain('localhost:3306');
      expect(secureMessage).toContain('Verbindungsfehler');
    });

    it('should return detailed messages in development', () => {
      const error = new Error('Detailed error for debugging');
      const detailedMessage = securityService.getSecureErrorMessage(error, false);
      
      expect(detailedMessage).toBe('Detailed error for debugging');
    });

    it('should categorize different error types', () => {
      const authError = new Error('Authentication failed');
      const networkError = new Error('Network connection timeout');
      const validationError = new Error('Invalid input data');
      
      const authMessage = securityService.getSecureErrorMessage(authError, true);
      const networkMessage = securityService.getSecureErrorMessage(networkError, true);
      const validationMessage = securityService.getSecureErrorMessage(validationError, true);
      
      expect(authMessage).toContain('Anmeldung fehlgeschlagen');
      expect(networkMessage).toContain('Verbindungsfehler');
      expect(validationMessage).toContain('Eingabefehler');
    });
  });

  describe('Security Environment Checks', () => {
    it('should detect secure environments in development', () => {
      // In test environment, this should return true
      expect(securityService.isSecureEnvironment()).toBe(true);
    });
  });

  describe('Password Hashing', () => {
    it('should generate secure password hashes', async () => {
      const password = 'testpassword123';
      const hash = await securityService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).toContain(':'); // Should contain salt separator
      expect(hash.length).toBeGreaterThan(64); // Should be long enough
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      const hash1 = await securityService.hashPassword(password);
      const hash2 = await securityService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts should produce different hashes
    });
  });
});