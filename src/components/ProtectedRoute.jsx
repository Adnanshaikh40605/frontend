import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component that redirects to login if user is not authenticated
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} [props.adminOnly=false] - Whether the route requires admin privileges
 * @returns {React.ReactNode} The protected component or redirect
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state if auth is still being checked
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the location they were trying to access for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // For admin-only routes, check if user is admin/staff
  if (adminOnly && (!currentUser || !currentUser.is_staff)) {
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated (and has admin rights if required)
  return children;
};

export default ProtectedRoute; 