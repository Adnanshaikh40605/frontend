import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          // Set the auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile
          const response = await axios.get('/api/profile/');
          setCurrentUser(response.data);
        } catch (err) {
          console.error('Auth check failed:', err);
          // If token is invalid or expired, try refresh token
          await refreshToken();
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Function to refresh the token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      logout();
      return false;
    }
    
    try {
      const response = await axios.post('/api/token/refresh/', {
        refresh: refreshToken
      });
      
      // Update stored token
      localStorage.setItem('accessToken', response.data.access);
      
      // Update auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Fetch user profile
      const userResponse = await axios.get('/api/profile/');
      setCurrentUser(userResponse.data);
      
      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      return false;
    }
  };
  
  // Login function
  const login = async (username, password) => {
    setError(null);
    
    try {
      const response = await axios.post('/api/token/', {
        username,
        password
      });
      
      // Store tokens
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Fetch user profile
      const userResponse = await axios.get('/api/profile/');
      setCurrentUser(userResponse.data);
      
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      return false;
    }
  };
  
  // Register function
  const register = async (userData) => {
    setError(null);
    
    try {
      await axios.post('/api/register/', userData);
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data || 'Registration failed. Please try again.');
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    navigate('/login');
  };
  
  // Setup axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // If error is 401 Unauthorized and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Try to refresh the token
          const refreshed = await refreshToken();
          
          if (refreshed) {
            // Retry the original request with new token
            return axios(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
  
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 