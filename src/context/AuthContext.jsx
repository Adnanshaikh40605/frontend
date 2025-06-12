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
  const [currentUser, setCurrentUser] = useState({
    id: 0,
    username: 'guest',
    email: '',
    first_name: 'Guest',
    last_name: 'User',
    is_staff: true, // Set to true to give access to admin features
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Fetch user profile
        const response = await axios.get(ENDPOINTS.PROFILE);
        console.log('User profile loaded:', response.data);
      } catch (err) {
        console.error('Auth check failed:', err);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function - no longer needed but kept as a stub
  const login = async (username, password) => {
    return true; // Always return success
  };
  
  // Register function - no longer needed but kept as a stub
  const register = async (userData) => {
    return true; // Always return success
  };
  
  // Logout function - no longer does anything
  const logout = () => {
    // Do nothing
  };
  
  // Refresh token - no longer needed but kept as a stub
  const refreshToken = async () => {
    return true; // Always return success
  };
  
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