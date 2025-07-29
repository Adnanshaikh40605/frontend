// index.js - Re-export everything from our modular API files
// This file maintains backward compatibility with existing imports

// Export from apiService.js
export { mediaAPI, ckEditorAPI, postAPI, commentAPI, categoriesAPI } from './apiService';

// Export from apiEndpoints.js
export { ENDPOINTS, MEDIA_URL, API_URL } from './apiEndpoints';

// Export utility functions if needed
export { getCookie, getHeaders, handleResponse, handleApiWithFallback } from './apiUtils'; 