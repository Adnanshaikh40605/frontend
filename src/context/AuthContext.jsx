import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../api/apiEndpoints';
import { isTokenExpired } from '../utils/authUtils';
import axiosInstance from '../utils/axiosConfig';
// Removed session components - using reactive approach with axios interceptor

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
  // Removed session expired modal - axios interceptor handles redirects
  const navigate = useNavigate();



  // Listen for session expiration events from axios interceptor
  useEffect(() => {
    const handleSessionExpired = (event) => {
      console.log('Session expired:', event.detail?.reason);
      setIsAuthenticated(false);
      setCurrentUser(null);
      // The axios interceptor already handles the redirect
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    return () => window.removeEventListener('sessionExpired', handleSessionExpired);
  }, []);

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

        // Don't check token expiration here - let the API calls handle 401s
        // Just check if we have cached user profile data
        const cachedProfile = localStorage.getItem('userProfile');
        const cacheTimestamp = localStorage.getItem('userProfileTimestamp');
        const now = Date.now();
        const cacheAge = now - parseInt(cacheTimestamp || '0');
        const cacheMaxAge = 10 * 60 * 1000; // 10 minutes

        if (cachedProfile && cacheAge < cacheMaxAge) {
          console.log('📋 AuthContext: Using cached user profile');
          setCurrentUser(JSON.parse(cachedProfile));
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // Cache is stale or doesn't exist, fetch fresh data
        console.log('📡 AuthContext: Fetching user profile...');
        try {
          const response = await axiosInstance.get(ENDPOINTS.AUTH_PROFILE);
          setCurrentUser(response.data);

          // Cache the user profile
          localStorage.setItem('userProfile', JSON.stringify(response.data));
          localStorage.setItem('userProfileTimestamp', now.toString());

          setIsAuthenticated(true);
        } catch (profileErr) {
          console.error('Failed to fetch user profile:', profileErr);
          // If profile fetch fails with 401, the axios interceptor will handle token refresh
          // Don't handle logout here, let the response interceptor handle it
          if (profileErr.response?.status === 401) {
            console.log('Profile fetch failed with 401, axios interceptor will handle it');
          }
          // For other errors, still set as authenticated if we have a valid token
          setIsAuthenticated(true);
        }
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

      // Cache user profile data
      localStorage.setItem('userProfile', JSON.stringify(user));
      localStorage.setItem('userProfileTimestamp', Date.now().toString());

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
      // Clear tokens and cached data regardless of API success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userProfileTimestamp');

      // Reset state
      setCurrentUser(null);
      setIsAuthenticated(false);

      // Redirect to login
      navigate('/login');
    }
  };

  // Removed session modal handlers - axios interceptor handles redirects automatically

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

      {/* Removed session modals - axios interceptor handles redirects automatically */}
    </AuthContext.Provider>
  );
};

export default AuthContext; 