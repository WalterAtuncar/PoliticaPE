import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from '../components/auth/LoginForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { RegisterForm } from '../components/auth/RegisterForm';

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        className="relative w-full max-w-md backdrop-blur-lg bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {mode === 'login' && (
          <LoginForm
            onForgotPassword={() => setMode('forgot-password')}
            onRegister={() => setMode('register')}
          />
        )}
        {mode === 'forgot-password' && (
          <ForgotPasswordForm onBack={() => setMode('login')} />
        )}
        {mode === 'register' && (
          <RegisterForm onBack={() => setMode('login')} />
        )}
      </motion.div>
    </div>
  );
};