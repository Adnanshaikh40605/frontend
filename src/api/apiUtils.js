// apiUtils.js - Contains utility functions for API operations

import { getAuthToken, isAuthenticated, isTokenExpired, parseJwt } from '../utils/authUtils';
import { ENDPOINTS, API_URL } from './apiEndpoints';
import axios from 'axios';

// Configure axios defaults for CORS
axios.defaults.withCredentials = true; // Set to true to include credentials with requests

// Configure axios defaults for the base URL
axios.defaults.baseURL = API_URL;

// Log the base URL for debugging
console.log('Axios base URL:', axios.defaults.baseURL);

// Configure axios to always use absolute URLs
const originalAxiosGet = axios.get;
axios.get = function(url, config) {
  // If URL doesn't start with http or https, prepend the API_URL
  if (url && !url.startsWith('http')) {
    url = `${API_URL}${url.startsWith('/') ? url : '/' + url}`;
  }
  console.log('GET request to:', url);
  return originalAxiosGet(url, config);
};

const originalAxiosPost = axios.post;
axios.post = function(url, data, config) {
  // If URL doesn't start with http or https, prepend the API_URL
  if (url && !url.startsWith('http')) {
    url = `${API_URL}${url.startsWith('/') ? url : '/' + url}`;
  }
  console.log('POST request to:', url);
  return originalAxiosPost(url, data, config);
};

// Add axios request interceptor for CORS headers
axios.interceptors.request.use(config => {
  // Log all requests for debugging
  console.log(`Making ${config.method} request to: ${config.url}`);
  
  return config;
});

// Add axios response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Request error (no response):', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Get CSRF token from cookies
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Token refresh functionality
export const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(ENDPOINTS.TOKEN_REFRESH, 
      { refresh: refreshToken },
      { 
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false,
        skipAuthRefresh: true // Add flag to prevent refresh loop
      }
    );

    // Store the new tokens
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
      return response.data.access;
    }
    
    throw new Error('No access token in refresh response');
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Clear auth data on refresh failure
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// Default request headers with enhanced authentication
export const getHeaders = async (includeContentType = true) => {
  const headers = {};
  
  // Add CSRF token if available
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  // Add content type if requested
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Add X-Requested-With header to identify AJAX requests
  headers['X-Requested-With'] = 'XMLHttpRequest';
  
  // Get current token
  let token = getAuthToken();
  
  // Check if token exists and is expired
  if (token && isTokenExpired(token)) {
    console.log('Token is expired, attempting to refresh');
    // Try to refresh the token
    token = await refreshAuthToken();
  }
  
  // Add JWT token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Global 401 error handler
export const handle401Error = (error) => {
  if (error.response?.status === 401 || error.status === 401) {
    console.log('🚨 401 Unauthorized - redirecting to login');
    
    // Clear all authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userProfileTimestamp');
    
    // Dispatch session expired event
    window.dispatchEvent(new CustomEvent('sessionExpired', {
      detail: { reason: '401 Unauthorized - authentication required' }
    }));
    
    // Redirect to login page if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?sessionExpired=true';
    }
    
    return true; // Indicates 401 was handled
  }
  return false; // 401 was not handled
};

// Improved error handling for API responses
export const handleResponse = async (response) => {
  try {
    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      // Try to get detailed error information from the response
      let errorText = '';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } else {
          errorText = await response.text();
          // Limit error text length to avoid console flooding
          if (errorText.length > 500) {
            errorText = errorText.substring(0, 500) + '... [truncated]';
          }
        }
      } catch (parseError) {
        errorText = `Could not parse error response: ${parseError.message}`;
      }
      
      console.error(`API Error: ${response.status} ${response.statusText} for URL: ${response.url}`);
      
      if (errorText) {
        console.error(`Error response body: ${errorText}`);
      }
      
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        console.log('🚨 401 Unauthorized - redirecting to login');
        
        // Clear all authentication data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userProfileTimestamp');
        
        // Dispatch session expired event
        window.dispatchEvent(new CustomEvent('sessionExpired', {
          detail: { reason: '401 Unauthorized - authentication required' }
        }));
        
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?sessionExpired=true';
        }
      }
      
      // Throw a formatted error with status code for easier handling
      throw new Error(`API request failed with status: ${response.status} ${response.statusText}`);
    }
    
    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return null;
    }
    
    // Try to parse JSON response
    try {
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (parseError) {
      // If JSON parsing fails, try to get text content
      console.warn(`Failed to parse JSON response: ${parseError.message}`);
      const textData = await response.text();
      return { text: textData };
    }
  } catch (error) {
    // Rethrow the error to be handled by the caller
    throw error;
  }
};

// Improved API fallback handler with better error recovery
export const handleApiWithFallback = async (apiCall, fallbackData = null, maxRetries = 1) => {
  let retryCount = 0;
  let lastError = null;
  
  // Try the API call with retries
  while (retryCount <= maxRetries) {
    try {
      // If this isn't the first attempt, add a small delay
      if (retryCount > 0) {
        console.log(`Retry attempt ${retryCount} of ${maxRetries}...`);
        // Exponential backoff: 1s, 2s, 4s, etc.
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
      }
      
      // Attempt the API call
      const results = await apiCall();
      return results;
    } catch (error) {
      lastError = error;
      retryCount++;
      
      // Check if we should retry based on error type
      const shouldRetry = error.message && (
        error.message.includes('network') || 
        error.message.includes('timeout') ||
        error.message.includes('500') || 
        error.message.includes('503')
      );
      
      if (!shouldRetry || retryCount > maxRetries) {
        break;
      }
      
      console.warn(`API error, retrying (${retryCount}/${maxRetries}): ${error.message}`);
    }
  }
  
  // If we get here, all retries failed or we decided not to retry
  console.error('API Error, falling back to mock data:', lastError?.message || 'Unknown error');
  
  // Return fallback data if provided
  if (fallbackData !== null) {
    console.info('Using fallback data');
    return fallbackData;
  }
  
  // If no fallback data was provided, rethrow the last error
  throw lastError || new Error('API request failed with no specific error');
};

// Global error handler for API calls
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Check if it's a 401 error and handle it
  if (handle401Error(error)) {
    return; // 401 was handled, don't rethrow
  }
  
  // For other errors, you can add additional handling here
  // For now, just rethrow the error
  throw error;
}; 