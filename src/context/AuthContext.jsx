import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../api/apiEndpoints';
import { isTokenExpired, parseJwt } from '../utils/authUtils';
import axiosInstance from '../utils/axiosConfig';

// Create the context
const AuthContext = createContext();

// Custom hook for using the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!accessToken) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Check if token is expired
        if (isTokenExpired(accessToken)) {
          // Try to refresh the token
          if (refreshToken && !isTokenExpired(refreshToken)) {
            await refreshAuthToken();
          } else {
            // If refresh token is also expired, logout
            handleLogout();
            setLoading(false);
            return;
          }
        }
        
        // Fetch user profile
        const response = await axiosInstance.get(ENDPOINTS.AUTH_PROFILE);
        
        setCurrentUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth check failed:', err);
        handleLogout();
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH_TOKEN, {
        username,
        password
      });
      
      const { access, refresh, user } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Set current user
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      setLoading(false);
      return false;
    }
  };
  
  // Refresh token function
  const refreshAuthToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axiosInstance.post(ENDPOINTS.AUTH_TOKEN_REFRESH, {
        refresh: refreshToken
      });
      
      const { access } = response.data;
      localStorage.setItem('accessToken', access);
      
      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      handleLogout();
      return false;
    }
  };
  
  // Logout function
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Blacklist the refresh token on the server
        await axiosInstance.post(ENDPOINTS.AUTH_LOGOUT, {
          refresh: refreshToken
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear tokens regardless of API success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Reset state
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // Redirect to login
      navigate('/login');
    }
  };
  
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    logout: handleLogout,
    refreshToken: refreshAuthToken
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext; 