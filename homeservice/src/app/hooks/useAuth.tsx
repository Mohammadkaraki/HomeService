'use client';
import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const isAuthenticated = (role?: string): boolean => {
  try {
    const context = useContext(AuthContext);
    if (!context) {
      console.error('isAuthenticated called outside AuthProvider');
      return false;
    }
    
    const { isAuthenticated, user, userType } = context;
    
    console.log('Auth check:', { 
      isAuthenticated, 
      userType, 
      userRole: user?.role,
      hasUser: !!user
    });
    
    // If no role is specified, just return isAuthenticated
    if (!role) return isAuthenticated;
    
    // Check for specific role
    if (role === 'provider' && userType === 'provider') return true;
    if (user?.role === role) return true;
    
    return false;
  } catch (error) {
    console.error('Error in isAuthenticated check:', error);
    return false;
  }
}; 