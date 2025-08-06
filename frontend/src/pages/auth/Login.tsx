import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { LoginCredentials } from '@/types';
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles, Zap } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RippleButton from '@/components/ui/RippleButton';
import { animationPresets, staggeredContainer, staggeredItem } from '@/utils/animations';
import { useInViewAnimation, useTypewriter } from '@/hooks/useAnimation';
import '../../styles/modern-animations.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  
  const { ref: headerRef, isInView: headerInView } = useInViewAnimation();
  const { displayText: welcomeText } = useTypewriter('Willkommen zurück', 100, 500);

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
    const errors: Partial<LoginCredentials> = {};
    
    if (!formData.email) {
      errors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ungültiges E-Mail-Format';
    }
    
    if (!formData.password) {
      errors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 6) {
      errors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoginAttempted(true);
    
    if (!validateForm()) {
      return;
    }

    const success = await login(formData);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name as keyof LoginCredentials]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-aurora relative overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      <motion.div 
        className="max-w-md w-full space-y-8 relative z-10"
        variants={staggeredContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          ref={headerRef}
          className="text-center"
          variants={staggeredItem}
        >
          <motion.div 
            className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.5)",
                "0 0 30px rgba(147, 51, 234, 0.5)",
                "0 0 20px rgba(59, 130, 246, 0.5)"
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
              }
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'linear',
              }}
            />
            <Zap className="text-white w-8 h-8 relative z-10" />
          </motion.div>
          
          <motion.h2 
            className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-3"
            variants={staggeredItem}
          >
            {welcomeText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              |
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-blue-100/80 text-lg"
            variants={staggeredItem}
          >
            Melden Sie sich in Ihrem CityPulse Account an
          </motion.p>
          
          <motion.div 
            className="flex justify-center mt-4"
            variants={staggeredItem}
          >
            <Sparkles className="text-yellow-300 w-6 h-6 animate-pulse" />
          </motion.div>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          className="glass-card-modern p-8 relative overflow-hidden"
          variants={staggeredItem}
          whileHover={{ y: -5 }}
        >
          {/* Success overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center z-50 rounded-2xl"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <motion.div
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto"
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8 }}
                  >
                    <LogIn className="text-green-500 w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white">Erfolgreich angemeldet!</h3>
                  <p className="text-white/80">Sie werden weitergeleitet...</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            variants={staggeredContainer}
          >
            {/* Global Error */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  variants={staggeredItem}
                >
                  <motion.p 
                    className="text-sm text-red-200 flex items-center"
                    animate={loginAttempted ? { x: [-5, 5, -5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.span
                      className="mr-2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      ⚠️
                    </motion.span>
                    {error}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <motion.div variants={staggeredItem}>
              <motion.label 
                htmlFor="email" 
                className="block text-sm font-semibold text-white/90 mb-3"
                whileHover={{ x: 5 }}
              >
                E-Mail-Adresse
              </motion.label>
              <div className="relative group">
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"
                  animate={{ 
                    color: formData.email ? 'rgb(59, 130, 246)' : 'rgb(156, 163, 175)' 
                  }}
                >
                  <Mail className="h-5 w-5" />
                </motion.div>
                <motion.input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`
                    w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 
                    rounded-xl text-white placeholder-white/50 transition-all duration-300
                    focus:bg-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    hover:bg-white/15 hover:border-white/30
                    ${validationErrors.email ? 'border-red-400 focus:ring-red-500/50' : ''}
                  `}
                  placeholder="ihre@email.com"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-blue-500/50 opacity-0 pointer-events-none"
                  animate={{
                    opacity: formData.email ? 0.3 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <AnimatePresence>
                {validationErrors.email && (
                  <motion.p 
                    className="mt-2 text-sm text-red-300 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <motion.span
                      className="mr-2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      ❌
                    </motion.span>
                    {validationErrors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={staggeredItem}>
              <motion.label 
                htmlFor="password" 
                className="block text-sm font-semibold text-white/90 mb-3"
                whileHover={{ x: 5 }}
              >
                Passwort
              </motion.label>
              <div className="relative group">
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"
                  animate={{ 
                    color: formData.password ? 'rgb(59, 130, 246)' : 'rgb(156, 163, 175)' 
                  }}
                >
                  <Lock className="h-5 w-5" />
                </motion.div>
                <motion.input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`
                    w-full pl-12 pr-14 py-4 bg-white/10 backdrop-blur-md border border-white/20 
                    rounded-xl text-white placeholder-white/50 transition-all duration-300
                    focus:bg-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    hover:bg-white/15 hover:border-white/30
                    ${validationErrors.password ? 'border-red-400 focus:ring-red-500/50' : ''}
                  `}
                  placeholder="Ihr Passwort"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.div
                        key="hide"
                        initial={{ opacity: 0, rotate: 180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff className="h-5 w-5 text-white/60 hover:text-white/80" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="show"
                        initial={{ opacity: 0, rotate: 180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="h-5 w-5 text-white/60 hover:text-white/80" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-blue-500/50 opacity-0 pointer-events-none"
                  animate={{
                    opacity: formData.password ? 0.3 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <AnimatePresence>
                {validationErrors.password && (
                  <motion.p 
                    className="mt-2 text-sm text-red-300 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <motion.span
                      className="mr-2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      ❌
                    </motion.span>
                    {validationErrors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={staggeredItem} className="pt-2">
              <RippleButton
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                variant="glass"
                size="lg"
                className="w-full text-lg font-bold tracking-wide"
                glowEffect={true}
                floating={true}
                icon={!isLoading ? <LogIn className="h-6 w-6" /> : undefined}
                iconPosition="left"
              >
                {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
              </RippleButton>
            </motion.div>
          </motion.form>

          {/* Register Link */}
          <motion.div 
            className="mt-8 text-center"
            variants={staggeredItem}
          >
            <motion.p className="text-sm text-white/70">
              Noch kein Account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-300 hover:text-blue-100 transition-colors relative group"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10"
                >
                  Hier registrieren
                </motion.span>
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-300"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            </motion.p>
          </motion.div>

          {/* Demo Credentials Info */}
          <motion.div 
            className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
            variants={staggeredItem}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <motion.h3 
              className="text-sm font-bold text-white/90 mb-4 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Sparkles className="mr-2 h-4 w-4 text-yellow-300" />
              Demo-Zugangsdaten:
            </motion.h3>
            <motion.div 
              className="space-y-2 text-xs text-white/70"
              variants={staggeredContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                { role: 'Admin', email: 'admin@citypulse.com', pass: 'admin123' },
                { role: 'Manager', email: 'manager@citypulse.com', pass: 'manager123' },
                { role: 'User', email: 'user@citypulse.com', pass: 'user123' },
                { role: 'Bürgermeister', email: 'buergermeister@citypulse.com', pass: 'citypulse123' },
                { role: 'Gebäudemanager', email: 'gebaeude.manager@citypulse.com', pass: 'citypulse123' },
                { role: 'Bürger', email: 'buerger@citypulse.com', pass: 'citypulse123' }
              ].map((cred, index) => (
                <motion.p 
                  key={cred.role}
                  variants={staggeredItem}
                  className="hover:text-white/90 transition-colors cursor-pointer"
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    setFormData({ email: cred.email, password: cred.pass });
                  }}
                >
                  <strong className="text-blue-300">{cred.role}:</strong> {cred.email} / {cred.pass}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Public Dashboard Link */}
        <motion.div 
          className="text-center"
          variants={staggeredItem}
        >
          <Link
            to="/public"
            className="text-sm text-white/60 hover:text-white/90 transition-colors group relative"
          >
            <motion.span
              className="relative z-10 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              Öffentliches Dashboard ansehen 
              <motion.span
                className="ml-1"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.span>
            <motion.div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white/60 group-hover:w-full transition-all duration-300"
            />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;