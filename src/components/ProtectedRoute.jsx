import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const authContext = useAuth();
  const location = useLocation();

  // Handle case where useAuth returns undefined
  if (!authContext) {
    console.log('🔒 ProtectedRoute: AuthContext is undefined, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const { isAuthenticated, loading, currentUser } = authContext;

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin permissions if required
  if (adminOnly) {
    const isAdmin = currentUser?.is_staff || currentUser?.permissions?.is_staff || currentUser?.permissions?.is_superuser;
    
    console.log('🔒 ProtectedRoute: Admin check:', { 
      adminOnly,
      isAdmin,
      currentUser: currentUser ? {
        id: currentUser.id,
        username: currentUser.username,
        is_staff: currentUser.is_staff,
        permissions: currentUser.permissions
      } : null
    });
    
    if (!isAdmin) {
      console.log('🔒 ProtectedRoute: Admin access required, user is not admin - redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;