import axios from 'axios';
import { ENDPOINTS } from '../api/apiEndpoints';
import { isTokenExpired } from './authUtils';

// Create axios instance with default config
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

// Process failed requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip token logic for auth endpoints
    if (config.url?.includes('/auth/')) {
      return config;
    }

    // Get access token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    
    // If token exists, add it to headers (don't check expiration here)
    if (accessToken) {
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
    
    // Only handle 401 errors and only if we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🚨 Got 401 error, checking if token refresh is needed');
      originalRequest._retry = true;
      
      // Skip if this is already a refresh request to avoid infinite loops
      if (originalRequest.url?.includes('/auth/token/refresh/')) {
        console.log('❌ Refresh token request failed, logging out');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userProfileTimestamp');
        
        window.dispatchEvent(new CustomEvent('sessionExpired', {
          detail: { reason: 'Refresh token is invalid' }
        }));
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?sessionExpired=true';
        }
        
        return Promise.reject(error);
      }
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log('🔄 Already refreshing token, queuing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Only try to refresh if we have a refresh token and it's not expired
      if (refreshToken && !isTokenExpired(refreshToken, 60)) {
        console.log('🔄 Attempting to refresh token after 401 error');
        isRefreshing = true;
        
        try {
          // Call refresh endpoint
          const response = await axios.post(ENDPOINTS.AUTH_TOKEN_REFRESH, {
            refresh: refreshToken
          });
          
          // Update access token in localStorage
          const newAccessToken = response.data.access;
          localStorage.setItem('accessToken', newAccessToken);
          console.log('✅ Token refreshed successfully after 401');
          
          // Process queued requests
          processQueue(null, newAccessToken);
          
          // Update Authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Retry the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.log('❌ Token refresh failed after 401:', refreshError);
          
          // If refresh fails, clear all tokens and cached data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userProfile');
          localStorage.removeItem('userProfileTimestamp');
          
          processQueue(refreshError, null);
          
          // Dispatch a custom event for session expiration
          window.dispatchEvent(new CustomEvent('sessionExpired', {
            detail: { reason: 'Token refresh failed after 401' }
          }));
          
          // Redirect to login if needed
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?sessionExpired=true';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        console.log('❌ No valid refresh token available, logging out');
        
        // If refresh token is expired or doesn't exist, clear everything
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userProfileTimestamp');
        
        // Dispatch a custom event for session expiration
        window.dispatchEvent(new CustomEvent('sessionExpired', {
          detail: { reason: 'No valid refresh token available' }
        }));
        
        // Redirect to login if needed
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?sessionExpired=true';
        }
        
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;