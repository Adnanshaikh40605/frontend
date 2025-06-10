// apiEndpoints.js - Contains all API endpoint URLs

// Get environment variables with fallback to development values
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const DEFAULT_API_URL = isDevelopment ? 'http://localhost:8000' : 'https://backend-production-49ec.up.railway.app';
export const API_URL = (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== 'undefined') 
  ? import.meta.env.VITE_API_BASE_URL 
  : DEFAULT_API_URL;
  
export const MEDIA_URL = (import.meta.env.VITE_MEDIA_URL && import.meta.env.VITE_MEDIA_URL !== 'undefined') 
  ? import.meta.env.VITE_MEDIA_URL 
  : `${API_URL}/media/`;

// Log the API URL for debugging
console.log('API URL:', API_URL);

// API Endpoints
export const ENDPOINTS = {
  POSTS: `${API_URL}/api/posts/`,
  COMMENTS: `${API_URL}/api/comments/`,
  IMAGES: `${API_URL}/api/images/`,
  CKEDITOR_UPLOAD: `${API_URL}/ckeditor5/image_upload/`,
  COMMENT_COUNTS: `${API_URL}/api/comments/counts/`,
  PENDING_COUNT: `${API_URL}/api/comments/pending-count/`,
  BULK_APPROVE: `${API_URL}/api/comments/bulk_approve/`,
  BULK_REJECT: `${API_URL}/api/comments/bulk_reject/`,
  TOKEN: `${API_URL}/api/token/`,
  TOKEN_REFRESH: `${API_URL}/api/token/refresh/`,
  TOKEN_VERIFY: `${API_URL}/api/token/verify/`,
  DEBUG_TOKEN: `${API_URL}/api/debug-token/`,
  PROFILE: `${API_URL}/api/profile/`
};

export default ENDPOINTS; 