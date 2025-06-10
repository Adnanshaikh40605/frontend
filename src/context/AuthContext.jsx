import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL, ENDPOINTS } from '../api/apiEndpoints';

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
          const response = await axios.get(ENDPOINTS.PROFILE);
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
      const response = await axios.post(ENDPOINTS.TOKEN_REFRESH, {
        refresh: refreshToken
      }, {
        // Add a flag to identify this as a refresh token request
        skipAuthRefresh: true
      });
      
      // Update stored token
      localStorage.setItem('accessToken', response.data.access);
      
      // Update auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Fetch user profile
      const userResponse = await axios.get(ENDPOINTS.PROFILE);
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
      console.log('Attempting login with endpoint:', ENDPOINTS.TOKEN);
      
      // Try the regular token endpoint first
      try {
        console.log('Trying token endpoint:', ENDPOINTS.TOKEN);
        const response = await axios({
          method: 'POST',
          url: ENDPOINTS.TOKEN,
          data: { username, password },
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true // Changed to true for consistency with backend CORS policy
        });
        
        console.log('Login response:', response.data);
        
        if (response.data.access) {
          // Store tokens
          localStorage.setItem('accessToken', response.data.access);
          localStorage.setItem('refreshToken', response.data.refresh);
          
          // Set auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          
          // Fetch user profile
          try {
            const userResponse = await axios.get(ENDPOINTS.PROFILE);
            setCurrentUser(userResponse.data);
          } catch (profileErr) {
            console.warn('Could not fetch profile, but login succeeded:', profileErr);
            // Create a minimal user object based on the username
            setCurrentUser({ username });
          }
          
          return true;
        }
      } catch (tokenErr) {
        console.warn('Token endpoint failed:', tokenErr);
        console.warn('Token endpoint error details:', tokenErr.response?.data || tokenErr.message);
        
        // If token endpoint fails, try debug endpoint as fallback
        console.log('Trying debug endpoint:', ENDPOINTS.DEBUG_TOKEN);
        const debugResponse = await axios({
          method: 'POST',
          url: ENDPOINTS.DEBUG_TOKEN,
          data: { username, password },
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true // Changed to true for consistency with backend CORS policy
        });
        
        if (debugResponse.data.access) {
          // Store tokens
          localStorage.setItem('accessToken', debugResponse.data.access);
          localStorage.setItem('refreshToken', debugResponse.data.refresh);
          
          // Set auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${debugResponse.data.access}`;
          
          // Fetch user profile
          try {
            const userResponse = await axios.get(ENDPOINTS.PROFILE);
            setCurrentUser(userResponse.data);
          } catch (profileErr) {
            console.warn('Could not fetch profile, but login succeeded:', profileErr);
            // Create a minimal user object based on the username
            setCurrentUser({ username });
          }
          
          return true;
        }
      }
      
      throw new Error('Both token endpoints failed');
    } catch (err) {
      console.error('Login failed:', err);
      
      // Enhanced error logging
      if (err.response) {
        // The request was made and the server responded with a status code
        console.error('Error response:', err.response.status, err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', err.message);
      }
      
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          err.message || 
                          'Login failed. Please check your credentials and ensure the backend is running.';
      
      setError(errorMessage);
      return false;
    }
  };
  
  // Register function
  const register = async (userData) => {
    setError(null);
    
    try {
      await axios.post(`${API_URL}/api/register/`, userData);
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
        
        // Skip refresh for token refresh requests to prevent infinite loop
        // Also check if we haven't already tried to refresh
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.skipAuthRefresh && 
            !originalRequest.url?.includes('/token/refresh/')) {
          
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