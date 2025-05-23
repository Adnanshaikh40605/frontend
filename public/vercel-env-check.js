// Environment check script is no longer needed
// This file is kept for reference only

/*
// This was causing build errors because it used ES module features without being a module
console.log('Environment Check: Vercel Environment Variables');
console.log(`API Base URL: ${window.API_BASE_URL || 'Not set'}`);
console.log(`Media URL: ${window.MEDIA_URL || 'Not set'}`);
console.log(`Env Variables from import.meta:`, import.meta.env);

// Store environment info for debugging
window.__envInfo = {
  apiBaseUrl: window.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'Not set',
  mediaUrl: window.MEDIA_URL || import.meta.env.VITE_MEDIA_URL || 'Not set',
  isDev: import.meta.env.DEV || false,
  mode: import.meta.env.MODE || 'unknown',
  timestamp: new Date().toISOString()
};

console.log('Environment Info:', window.__envInfo); 
*/ 