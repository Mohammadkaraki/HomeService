"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated, userType } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until auth state is loaded
    
    // Debug output
    console.log('ProtectedRoute auth check:', { 
      isAuthenticated, 
      userType, 
      user: user ? { id: user._id, role: user.role } : null,
      allowedRoles
    });
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    // Role-based access check
    if (allowedRoles.length > 0) {
      let hasAccess = false;
      
      // Check by userType for provider role
      if (userType === 'provider' && allowedRoles.includes('provider')) {
        hasAccess = true;
      }
      // Check by user.role for regular users
      else if (user && user.role && allowedRoles.includes(user.role)) {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        console.log('User does not have required role, redirecting');
        // Redirect based on user type/role
        if (userType === 'provider') {
          router.push('/provider/dashboard');
        } else if (user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      }
    }
  }, [loading, isAuthenticated, user, userType, router, allowedRoles]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // If not authenticated or doesn't have required role, don't render
  if (!isAuthenticated) return null;
  
  // Check roles if specified
  if (allowedRoles.length > 0) {
    const hasRequiredRole = (
      (userType === 'provider' && allowedRoles.includes('provider')) ||
      (user?.role && allowedRoles.includes(user.role))
    );
    
    if (!hasRequiredRole) return null;
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute; 