/**
 * JWT-specific utilities optimized for Django Simple JWT
 * 
 * Configuration:
 * - Access Token: 60 minutes
 * - Refresh Token: 7 days
 * - Rotate Refresh Tokens: False
 * - Blacklist After Rotation: True
 */

import { parseJwt, isTokenExpired } from './authUtils';

// JWT Configuration constants (matching your Django settings)
export const JWT_CONFIG = {
  ACCESS_TOKEN_LIFETIME: 60 * 60, // 60 minutes in seconds
  REFRESH_TOKEN_LIFETIME: 7 * 24 * 60 * 60, // 7 days in seconds
  WARNING_THRESHOLD: 10 * 60, // Show warning 10 minutes before expiry
  CHECK_INTERVAL: 60 * 1000, // Check every 60 seconds
  REFRESH_BUFFER: 5 * 60, // Refresh 5 minutes before expiry
};

/**
 * Get detailed token information
 * @returns {Object} Token details including expiry times and status
 */
export const getTokenInfo = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  const info = {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenExpired: false,
    refreshTokenExpired: false,
    accessTokenExpiry: null,
    refreshTokenExpiry: null,
    timeUntilAccessExpiry: 0,
    timeUntilRefreshExpiry: 0,
    shouldRefresh: false,
    shouldWarn: false
  };

  if (accessToken) {
    const accessPayload = parseJwt(accessToken);
    if (accessPayload && accessPayload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      info.accessTokenExpiry = new Date(accessPayload.exp * 1000);
      info.timeUntilAccessExpiry = accessPayload.exp - currentTime;
      info.accessTokenExpired = accessPayload.exp < currentTime;
      info.shouldRefresh = info.timeUntilAccessExpiry <= JWT_CONFIG.REFRESH_BUFFER;
      info.shouldWarn = info.timeUntilAccessExpiry <= JWT_CONFIG.WARNING_THRESHOLD && info.timeUntilAccessExpiry > 0;
    }
  }

  if (refreshToken) {
    const refreshPayload = parseJwt(refreshToken);
    if (refreshPayload && refreshPayload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      info.refreshTokenExpiry = new Date(refreshPayload.exp * 1000);
      info.timeUntilRefreshExpiry = refreshPayload.exp - currentTime;
      info.refreshTokenExpired = refreshPayload.exp < currentTime;
    }
  }

  return info;
};

/**
 * Check if tokens need refresh
 * @returns {boolean} True if access token should be refreshed
 */
export const shouldRefreshToken = () => {
  const tokenInfo = getTokenInfo();
  return tokenInfo.shouldRefresh && !tokenInfo.refreshTokenExpired;
};

/**
 * Check if user should be warned about expiration
 * @returns {Object} Warning status and time left
 */
export const getWarningStatus = () => {
  const tokenInfo = getTokenInfo();
  return {
    shouldWarn: tokenInfo.shouldWarn,
    timeLeft: tokenInfo.timeUntilAccessExpiry
  };
};

/**
 * Check if session is completely expired
 * @returns {boolean} True if both tokens are expired or missing
 */
export const isSessionExpired = () => {
  const tokenInfo = getTokenInfo();
  return (!tokenInfo.hasAccessToken && !tokenInfo.hasRefreshToken) ||
         (tokenInfo.accessTokenExpired && tokenInfo.refreshTokenExpired);
};

/**
 * Get human-readable time remaining
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (seconds) => {
  if (!seconds || seconds <= 0) return 'Expired';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Calculate when to show session warning
 * @param {number} tokenLifetime - Token lifetime in seconds
 * @returns {number} Warning threshold in seconds
 */
export const calculateWarningThreshold = (tokenLifetime) => {
  // For 1-hour tokens, warn at 10 minutes
  // For shorter tokens, warn at 25% of lifetime
  if (tokenLifetime >= 3600) { // 1 hour or more
    return 600; // 10 minutes
  } else if (tokenLifetime >= 1800) { // 30 minutes or more
    return 300; // 5 minutes
  } else {
    return Math.max(60, Math.floor(tokenLifetime * 0.25)); // 25% or minimum 1 minute
  }
};

/**
 * Get session health status
 * @returns {Object} Session health information
 */
export const getSessionHealth = () => {
  const tokenInfo = getTokenInfo();
  
  let status = 'unknown';
  let message = 'Session status unknown';
  let color = '#6c757d';
  
  if (isSessionExpired()) {
    status = 'expired';
    message = 'Session expired';
    color = '#dc3545';
  } else if (tokenInfo.shouldWarn) {
    status = 'warning';
    message = `Session expires in ${formatTimeRemaining(tokenInfo.timeUntilAccessExpiry)}`;
    color = '#ffc107';
  } else if (tokenInfo.hasAccessToken) {
    status = 'healthy';
    message = `Session active (${formatTimeRemaining(tokenInfo.timeUntilAccessExpiry)} remaining)`;
    color = '#28a745';
  } else {
    status = 'unauthenticated';
    message = 'Not logged in';
    color = '#6c757d';
  }
  
  return {
    status,
    message,
    color,
    timeLeft: tokenInfo.timeUntilAccessExpiry,
    ...tokenInfo
  };
};

/**
 * Debug function to log token information
 */
export const debugTokens = () => {
  const tokenInfo = getTokenInfo();
  const sessionHealth = getSessionHealth();
  
  console.group('🔐 JWT Token Debug Information');
  console.log('📊 Token Info:', tokenInfo);
  console.log('🏥 Session Health:', sessionHealth);
  console.log('⚙️ JWT Config:', JWT_CONFIG);
  console.groupEnd();
  
  return { tokenInfo, sessionHealth };
};

export default {
  JWT_CONFIG,
  getTokenInfo,
  shouldRefreshToken,
  getWarningStatus,
  isSessionExpired,
  formatTimeRemaining,
  calculateWarningThreshold,
  getSessionHealth,
  debugTokens
};