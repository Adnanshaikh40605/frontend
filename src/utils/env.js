/**
 * Environment variables utility
 * Provides access to environment variables in a browser-safe way
 */

// API base URL - where the backend API is hosted
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Media URL - where media files are served from
export const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000/media/';

// Debug mode toggle
export const DEBUG = import.meta.env.VITE_DEBUG === 'true';

// Mock API usage toggle 
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Environment information for debugging
export const ENV_INFO = {
  apiBaseUrl: API_BASE_URL,
  mediaUrl: MEDIA_URL,
  debug: DEBUG,
  useMockApi: USE_MOCK_API,
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV
}; 