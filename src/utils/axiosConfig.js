import axios from 'axios';
import { ENDPOINTS } from '../api/apiEndpoints';
import { isTokenExpired } from './authUtils';

// Create axios instance with default config
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get access token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    
    // If no token, proceed with request
    if (!accessToken) {
      return config;
    }
    
    // Check if token is expired
    if (isTokenExpired(accessToken)) {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          // Call refresh endpoint
          const response = await axios.post(ENDPOINTS.AUTH_TOKEN_REFRESH, {
            refresh: refreshToken
          });
          
          // Update access token in localStorage
          localStorage.setItem('accessToken', response.data.access);
          
          // Update Authorization header with new token
          config.headers.Authorization = `Bearer ${response.data.access}`;
        } catch (error) {
          // If refresh fails, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Dispatch a custom event for session expiration
          window.dispatchEvent(new CustomEvent('sessionExpired', {
            detail: { reason: 'Token refresh failed' }
          }));
          
          // Redirect to login if needed
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?sessionExpired=true';
          }
        }
      } else {
        // If refresh token is expired, clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login if needed
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else {
      // Token is valid, add it to headers
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          // Call refresh endpoint
          const response = await axios.post(ENDPOINTS.AUTH_TOKEN_REFRESH, {
            refresh: refreshToken
          });
          
          // Update access token in localStorage
          localStorage.setItem('accessToken', response.data.access);
          
          // Update Authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          // Retry the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Dispatch a custom event for session expiration
          window.dispatchEvent(new CustomEvent('sessionExpired', {
            detail: { reason: 'Token refresh failed in response interceptor' }
          }));
          
          // Redirect to login if needed
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?sessionExpired=true';
          }
        }
      } else {
        // If refresh token is expired, clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Dispatch a custom event for session expiration
        window.dispatchEvent(new CustomEvent('sessionExpired', {
          detail: { reason: 'Refresh token expired in response interceptor' }
        }));
        
        // Redirect to login if needed
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?sessionExpired=true';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 