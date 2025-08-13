// Simplified session utilities - no proactive checking, only reactive handling
import { useCallback } from 'react';
import { isTokenExpired } from '../utils/authUtils';

const useSessionExpiration = () => {
  // Simple utility to check if current session is expired
  const isCurrentSessionExpired = useCallback(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken) return true;
    if (isTokenExpired(accessToken)) {
      if (!refreshToken || isTokenExpired(refreshToken)) {
        return true;
      }
    }
    return false;
  }, []);

  // Clear session data
  const clearSession = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  return {
    isCurrentSessionExpired,
    clearSession
  };
};

export default useSessionExpiration;