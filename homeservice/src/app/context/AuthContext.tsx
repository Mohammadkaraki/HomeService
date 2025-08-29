"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../utils/api';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export interface AuthResponse {
  token: string;
  data: any;
}

export interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  userType: 'user' | 'provider' | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: any) => Promise<any>;
  registerProvider: (providerData: any) => Promise<any>;
  logout: () => void;
}

// Create the context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'user' | 'provider' | null>(null);

  // Check for token and load user on first render
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        // Check auth and get user info
        const authInfo = await auth.checkAuth();
        console.log('Auth info loaded:', authInfo);
        
        if (authInfo.isAuthenticated) {
          setIsAuthenticated(true);
          setUserType(authInfo.userType);
          
          if (authInfo.user) {
            setUser(authInfo.user);
          } else if (authInfo.provider) {
            setUser(authInfo.provider);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setUserType(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setIsAuthenticated(false);
        setUser(null);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      // The auth.login method from our API already handles the token storage
      const response = await auth.login(email, password);
      console.log('Login successful:', response);
      
      // Update state with user data
      setUser(response.data);
      setIsAuthenticated(true);
      
      // Determine user type from response data
      if (response.data && response.data.role === 'provider') {
        setUserType('provider');
      } else {
        setUserType('user');
      }
      
      return response;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      // Use the API's register function which returns the appropriate response
      const response = await auth.register(userData);
      console.log('Registration successful:', response);
      
      // If authentication happens automatically on registration
      if (response.data && response.data.token) {
        setIsAuthenticated(true);
        setUser(response.data.data);
        setUserType('user');
      }
      
      return response.data;
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register provider
  const registerProvider = async (providerData: any) => {
    setLoading(true);
    setError(null);
    try {
      // Use the API's registerProvider function which returns the appropriate response
      const response = await auth.registerProvider(providerData);
      console.log('Provider registration successful:', response);
      
      // If authentication happens automatically on registration
      if (response && response.token) {
        setIsAuthenticated(true);
        setUser(response.data);
        setUserType('provider');
      }
      
      return response;
    } catch (err: any) {
      console.error('Provider registration error:', err);
      setError(err.response?.data?.message || 'Provider registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      // Call the API logout which handles cookie removal
      await auth.logout();
      
      // Reset all local state
      setUser(null);
      setIsAuthenticated(false);
      setUserType(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        registerProvider,
        logout,
        isAuthenticated,
        userType
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 