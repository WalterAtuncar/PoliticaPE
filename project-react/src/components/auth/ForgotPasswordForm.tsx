import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('El email es requerido');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return;
    }

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Instrucciones enviadas a tu email');
    } catch (error) {
      setError('Error al enviar las instrucciones');
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto text-center"
      >
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Email Enviado!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Hemos enviado las instrucciones para recuperar tu contraseña a{' '}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <Button onClick={onBack} variant="outline" className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al login
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Recuperar Contraseña
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ingresa tu email y te enviaremos las instrucciones
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          icon={<Mail />}
          placeholder="tu@email.com"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Enviar Instrucciones
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al login
        </button>
      </div>
    </motion.div>
  );
};