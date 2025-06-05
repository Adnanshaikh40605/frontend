import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ redirectPath = '/login', children }) => {
  const { currentUser, loading, refreshToken } = useAuth();
  const location = useLocation();
  
  // Try to refresh token if no current user
  useEffect(() => {
    const checkAuth = async () => {
      // If no current user but token exists, try to refresh
      if (!currentUser && localStorage.getItem('accessToken')) {
        console.log('Token exists but no user, attempting refresh');
        await refreshToken();
      }
    };
    
    checkAuth();
  }, [currentUser, refreshToken]);
  
  // Show loading state if still checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }
  
  // Check for authentication - either currentUser or valid token
  const isAuthenticated = !!currentUser || !!localStorage.getItem('accessToken');
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the location they were trying to go to
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  // Render children or outlet
  return children ? children : <Outlet />;
};

ProtectedRoute.propTypes = {
  redirectPath: PropTypes.string,
  children: PropTypes.node
};

export default ProtectedRoute; 