import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string, rememberMe = false) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@politica.pe' && password === 'password123') {
      const user: User = {
        id: '1',
        email,
        name: 'Carlos Mendoza',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face',
      };
      
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      dispatch({ type: 'SET_USER', payload: user });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw new Error('Credenciales inválidas');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const forgotPassword = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate password reset email
  };

  const register = async (email: string, password: string, name: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'analyst',
    };
    
    dispatch({ type: 'SET_USER', payload: user });
  };

  // Check for saved user on app start
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        forgotPassword,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};