// API Test Utility
import { API_URL, ENDPOINTS } from '../api/apiEndpoints';

/**
 * Test function to verify API connectivity
 * This can be run in the browser console to check API endpoints
 */
export const testApiEndpoint = async (endpoint, method = 'GET', data = null) => {
  console.log(`Testing API endpoint: ${endpoint} with method: ${method}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(endpoint, options);
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('Response data:', jsonData);
      return { status: response.status, data: jsonData };
    } else {
      const textData = await response.text();
      console.log('Response text:', textData);
      return { status: response.status, text: textData };
    }
  } catch (error) {
    console.error('API test error:', error);
    return { error: error.message };
  }
};

/**
 * Test token endpoint specifically
 */
export const testTokenEndpoint = async (username, password) => {
  console.log(`Testing token endpoint with username: ${username}`);
  return testApiEndpoint(ENDPOINTS.TOKEN, 'POST', { username, password });
};

/**
 * Test all critical endpoints
 */
export const testAllEndpoints = async () => {
  const results = {};
  
  // Test base API URL
  results.baseUrl = await testApiEndpoint(`${API_URL}/api/`);
  
  // Test token endpoint (without credentials)
  results.tokenEndpoint = await testApiEndpoint(ENDPOINTS.TOKEN, 'GET');
  
  // Test posts endpoint
  results.postsEndpoint = await testApiEndpoint(ENDPOINTS.POSTS);
  
  console.log('All endpoint test results:', results);
  return results;
};

// Export a global function that can be called from the browser console
if (typeof window !== 'undefined') {
  window.testApi = {
    testEndpoint: testApiEndpoint,
    testToken: testTokenEndpoint,
    testAll: testAllEndpoints,
    endpoints: ENDPOINTS,
  };
}

export default {
  testApiEndpoint,
  testTokenEndpoint,
  testAllEndpoints
}; 