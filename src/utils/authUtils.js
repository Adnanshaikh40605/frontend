/**
 * Utility functions for authentication
 */

/**
 * Check if the user is currently authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  // Check for access token in localStorage
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    return true;
  }
  
  // Check for refresh token in localStorage
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    return true;
  }
  
  // Check for legacy auth token
  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (authToken) {
    return true;
  }
  
  return false;
};

/**
 * Get the current authentication token
 * @returns {string|null} The token if available, null otherwise
 */
export const getAuthToken = () => {
  // Prioritize access token
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    return accessToken;
  }
  
  // Fall back to legacy auth token
  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (authToken) {
    return authToken;
  }
  
  return null;
};

/**
 * Parse JWT token and extract payload
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT token:', e);
    return null;
  }
};

/**
 * Check if the token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const payload = parseJwt(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  
  // Also clear any auth cookies if possible
  document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}; 