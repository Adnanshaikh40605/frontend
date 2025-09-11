/**
 * Comprehensive error handling utilities
 */

/**
 * Error types for better error categorization
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  SERVER: 'SERVER_ERROR',
  FILE_UPLOAD: 'FILE_UPLOAD_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Parse error response and extract meaningful information
 * @param {Error} error - The error object
 * @returns {Object} Parsed error information
 */
export const parseError = (error) => {
  const errorInfo = {
    type: ERROR_TYPES.UNKNOWN,
    message: 'An unexpected error occurred',
    details: null,
    status: null,
    code: null
  };

  if (!error) return errorInfo;

  // Network errors
  if (!error.response) {
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      errorInfo.type = ERROR_TYPES.NETWORK;
      errorInfo.message = 'Network connection failed. Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      errorInfo.type = ERROR_TYPES.NETWORK;
      errorInfo.message = 'Request timeout. Please try again.';
    } else {
      errorInfo.message = error.message || 'Network error occurred';
    }
    return errorInfo;
  }

  const { response } = error;
  errorInfo.status = response.status;
  errorInfo.code = response.data?.code || response.status;

  // Parse response data
  if (response.data) {
    if (typeof response.data === 'string') {
      errorInfo.message = response.data;
    } else if (response.data.message) {
      errorInfo.message = response.data.message;
    } else if (response.data.error) {
      errorInfo.message = response.data.error;
    } else if (response.data.detail) {
      errorInfo.message = response.data.detail;
    }
    
    // Handle validation errors
    if (response.data.errors || response.data.non_field_errors) {
      errorInfo.type = ERROR_TYPES.VALIDATION;
      errorInfo.details = response.data.errors || response.data.non_field_errors;
      
      // Format validation errors into a readable message
      if (Array.isArray(errorInfo.details)) {
        errorInfo.message = errorInfo.details.join(', ');
      } else if (typeof errorInfo.details === 'object') {
        const fieldErrors = Object.entries(errorInfo.details)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        errorInfo.message = fieldErrors;
      }
    }
  }

  // Categorize by status code
  switch (response.status) {
    case 400:
      errorInfo.type = ERROR_TYPES.VALIDATION;
      if (!errorInfo.message.includes(':')) {
        errorInfo.message = 'Invalid request. Please check your input.';
      }
      break;
    case 401:
      errorInfo.type = ERROR_TYPES.AUTHENTICATION;
      errorInfo.message = 'Authentication required. Please log in.';
      break;
    case 403:
      errorInfo.type = ERROR_TYPES.AUTHORIZATION;
      errorInfo.message = 'You do not have permission to perform this action.';
      break;
    case 404:
      errorInfo.message = 'The requested resource was not found.';
      break;
    case 413:
      errorInfo.type = ERROR_TYPES.FILE_UPLOAD;
      errorInfo.message = 'File too large. Please choose a smaller file.';
      break;
    case 415:
      errorInfo.type = ERROR_TYPES.FILE_UPLOAD;
      errorInfo.message = 'Unsupported file type. Please choose a different file.';
      break;
    case 422:
      errorInfo.type = ERROR_TYPES.VALIDATION;
      errorInfo.message = 'Invalid data provided. Please check your input.';
      break;
    case 429:
      errorInfo.message = 'Too many requests. Please wait a moment and try again.';
      break;
    case 500:
      errorInfo.type = ERROR_TYPES.SERVER;
      errorInfo.message = 'Server error. Please try again later.';
      break;
    case 502:
    case 503:
    case 504:
      errorInfo.type = ERROR_TYPES.SERVER;
      errorInfo.message = 'Service temporarily unavailable. Please try again later.';
      break;
    default:
      if (response.status >= 500) {
        errorInfo.type = ERROR_TYPES.SERVER;
        errorInfo.message = 'Server error occurred. Please try again later.';
      }
  }

  return errorInfo;
};

/**
 * Handle API errors with user-friendly messages
 * @param {Error} error - The error object
 * @param {Object} options - Error handling options
 * @returns {Object} Error information
 */
export const handleApiError = (error, options = {}) => {
  const {
    showNotification = true,
    logError = true,
    fallbackMessage = 'An error occurred'
  } = options;

  const errorInfo = parseError(error);

  // Handle 401 Unauthorized specifically
  if (errorInfo.type === ERROR_TYPES.AUTHENTICATION || errorInfo.status === 401) {
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
    
    return errorInfo; // Return early for 401 errors
  }

  // Log error for debugging
  if (logError) {
    console.error('API Error:', {
      original: error,
      parsed: errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  // Show user notification
  if (showNotification) {
    // You can integrate with your notification system here
    // For now, we'll use a simple alert
    if (errorInfo.type === ERROR_TYPES.VALIDATION && errorInfo.details) {
      // Show detailed validation errors
      alert(`Validation Error:\n${errorInfo.message}`);
    } else {
      alert(errorInfo.message);
    }
  }

  return errorInfo;
};

/**
 * Validate file upload
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;

  const errors = [];

  // Check if file exists
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type not supported. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file extension
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(`File extension not supported. Allowed extensions: ${allowedExtensions.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error object
 */
export const createError = (message, type = ERROR_TYPES.UNKNOWN, details = null) => {
  return {
    type,
    message,
    details,
    timestamp: new Date().toISOString()
  };
};

/**
 * Retry mechanism for failed requests
 * @param {Function} requestFn - The request function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Promise that resolves with the request result
 */
export const retryRequest = async (requestFn, options = {}) => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    retryCondition = (error) => error.response?.status >= 500
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if condition is not met
      if (!retryCondition(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      const waitTime = delay * Math.pow(backoff, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};
