'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { authApi, AuthResponse } from '@/lib/apiAuth';
import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  verified?: boolean;
  university?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string, university?: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    token: null,
  });

  // Load auth from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    if (token && user) {
      setState({
        user: JSON.parse(user),
        loading: false,
        error: null,
        token,
      });
      apiClient.setToken(token);
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const response: AuthResponse = await authApi.login(email, password);
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      };
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      apiClient.setToken(response.token);
      setState({ user, loading: false, error: null, token: response.token });
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: string,
    university?: string
  ) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const response: AuthResponse = await authApi.register(
        email,
        password,
        name,
        role,
        university
      );
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      };
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      apiClient.setToken(response.token);
      setState({ user, loading: false, error: null, token: response.token });
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    apiClient.setToken(null);
    setState({ user: null, loading: false, error: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
