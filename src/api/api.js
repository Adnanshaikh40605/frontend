// api.js - Consolidated API service for the Blog CMS

// Get environment variables with fallback to development values
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const DEFAULT_API_URL = isDevelopment ? 'http://localhost:8000' : 'https://web-production-f03ff.up.railway.app';
const API_URL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined') 
  ? import.meta.env.VITE_API_URL 
  : DEFAULT_API_URL;
  
const MEDIA_URL = (import.meta.env.VITE_MEDIA_URL && import.meta.env.VITE_MEDIA_URL !== 'undefined') 
  ? import.meta.env.VITE_MEDIA_URL 
  : `${API_URL}/media/`;

console.log('Using API URL:', API_URL);
console.log('Using MEDIA URL:', MEDIA_URL);
console.log('Development mode:', isDevelopment ? 'Yes (will fallback to mock data if API unavailable)' : 'No');

// API Endpoints
const ENDPOINTS = {
  POSTS: `${API_URL}/api/posts/`,
  COMMENTS: `${API_URL}/api/comments/`,
  IMAGES: `${API_URL}/api/images/`,
  CKEDITOR_UPLOAD: `${API_URL}/ckeditor5/image_upload/`,
  COMMENT_COUNTS: `${API_URL}/api/comments/counts/`,
  PENDING_COUNT: `${API_URL}/api/comments/pending-count/`,
  BULK_APPROVE: `${API_URL}/api/comments/bulk_approve/`,
  BULK_REJECT: `${API_URL}/api/comments/bulk_reject/`
};

// Helper function to get cookies (for CSRF token)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Default request headers
const getHeaders = (includeContentType = true) => {
  const headers = {};
  const csrfToken = getCookie('csrftoken');
  
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Add X-Requested-With header to identify AJAX requests
  headers['X-Requested-With'] = 'XMLHttpRequest';
  
  return headers;
};

// Helper to format API responses with appropriate error handling
const handleResponse = async (response) => {
  // For DELETE operations that return 204 No Content
  if (response.status === 204) {
    return true;
  }
  
  // Check if response is OK
  if (!response.ok) {
    const errorText = await response.text();
    try {
      // Try to parse as JSON
      const errorData = JSON.parse(errorText);
      throw new Error(JSON.stringify(errorData));
    } catch (e) {
      // If not JSON, use text or status
      throw new Error(errorText || `API request failed with status: ${response.status}`);
    }
  }
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

// Mock data for development fallback
const mockPosts = [
  {
    id: 1,
    title: "Sample Blog Post 1",
    slug: "sample-blog-post-1",
    content: "<p>This is a sample blog post for development.</p>",
    excerpt: "This is a sample blog post for development.",
    read_time: 2,
    featured_image: null,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments: []
  },
  {
    id: 2,
    title: "Sample Blog Post 2",
    slug: "sample-blog-post-2",
    content: "<p>This is another sample blog post for development.</p>",
    excerpt: "This is another sample blog post for development.",
    read_time: 3,
    featured_image: null,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments: []
  }
];

// Helper for mock image uploads
const createLocalImageUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};

// Function to handle API calls with fallback to mock data
const handleApiWithFallback = async (apiCall, mockData) => {
  if (isDevelopment) {
    try {
      return await apiCall();
    } catch (error) {
      console.warn('API Error, falling back to mock data:', error.message);
      return mockData;
    }
  } else {
    return await apiCall();
  }
};

// Media API helper for working with images
export const mediaAPI = {
  getImageUrl: (path) => {
    if (!path) return null;
    
    // If the path is already a full URL, return it
    if (path.startsWith('http')) {
      return path;
    }
    
    // If path starts with /media, don't add media URL again
    if (path.startsWith('/media/')) {
      return path.startsWith('/media') && !MEDIA_URL.endsWith('/media') 
        ? `${MEDIA_URL}${path.substring(6)}` // Remove /media from path
        : path;
    }
    
    // Otherwise, add the media URL
    return `${MEDIA_URL}${path.replace(/^\//, '')}`;
  },
  
  // Get optimized image URL with size parameters (when supported by backend)
  getOptimizedImageUrl: (path, { width, height, format } = {}) => {
    if (!path) return null;
    
    const baseUrl = mediaAPI.getImageUrl(path);
    if (!baseUrl) return null;
    
    // If no optimization parameters, return base URL
    if (!width && !height && !format) {
      return baseUrl;
    }
    
    // Build query parameters for optimized image
    const params = new URLSearchParams();
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (format) params.append('fmt', format);
    
    // Add parameters to URL
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
  }
};

// CKEditor API helper
export const ckEditorAPI = {
  // Upload an image for CKEditor
  uploadImage: async (file) => {
    try {
      console.log('CKEditor image upload started for file:', file.name);
      
      // If in development mode, check if we should use the mock implementation
      if (isDevelopment) {
        try {
          // First try with the real API
          const formData = new FormData();
          formData.append('upload', file);
          
          const response = await fetch(ENDPOINTS.CKEDITOR_UPLOAD, {
            method: 'POST',
            headers: getHeaders(false), // Don't include Content-Type for file uploads
            credentials: 'include',
            body: formData
          });
          
          // Check response status first
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed with status ${response.status}: ${errorText || response.statusText}`);
          }
          
          const result = await handleResponse(response);
          
          // Standardize response structure across environments
          if (result && (result.url || result.default)) {
            return {
              url: result.url || result.default
            };
          } else if (result && result.error) {
            throw new Error(result.error.message || 'Unknown upload error');
          } else {
            throw new Error('Invalid server response format');
          }
        } catch (error) {
          console.warn('Error using real API for image upload, falling back to mock:', error.message);
          // If the real API fails, use the mock implementation
          const dataUrl = await createLocalImageUrl(file);
          return { url: dataUrl };
        }
      } else {
        // In production, always use real API
        const formData = new FormData();
        formData.append('upload', file);
        
        const response = await fetch(ENDPOINTS.CKEDITOR_UPLOAD, {
          method: 'POST',
          headers: getHeaders(false), // Don't include Content-Type for file uploads
          credentials: 'include',
          body: formData
        });
        
        // Check response status first
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed with status ${response.status}: ${errorText || response.statusText}`);
        }
        
        const result = await handleResponse(response);
        
        // Standardize response structure across environments
        if (result && (result.url || result.default)) {
          return {
            url: result.url || result.default
          };
        } else if (result && result.error) {
          throw new Error(result.error.message || 'Unknown upload error');
        } else {
          throw new Error('Invalid server response format');
        }
      }
    } catch (error) {
      console.error('API Error uploading CKEditor image:', error);
      throw error;
    }
  }
};

// Post API functions
export const postAPI = {
  // Get all posts
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${ENDPOINTS.POSTS}${queryParams ? `?${queryParams}` : ''}`;
      
      if (isDevelopment) {
        return handleApiWithFallback(
          async () => {
            const response = await fetch(url);
            return handleResponse(response);
          },
          { results: mockPosts, count: mockPosts.length }
        );
      } else {
        const response = await fetch(url);
        return handleResponse(response);
      }
    } catch (error) {
      console.error('API Error fetching posts:', error);
      throw error;
    }
  },
  
  // Get post by slug
  getBySlug: async (slug) => {
    try {
      if (!slug) {
        throw new Error('Slug is required to fetch post');
      }
      
      const url = `${ENDPOINTS.POSTS}${slug}/`;
      console.log(`Fetching post by slug: ${url}`);
      
      if (isDevelopment) {
        return handleApiWithFallback(
          async () => {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Post not found");
            return handleResponse(response);
          },
          mockPosts.find(post => post.slug === slug) || null
        );
      } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Post not found");
        return handleResponse(response);
      }
    } catch (error) {
      console.error(`API Error fetching post by slug ${slug}:`, error);
      throw error;
    }
  },
  
  // Get single post by ID
  getById: async (id) => {
    try {
      const url = `${ENDPOINTS.POSTS}${id}/`;
      
      if (isDevelopment) {
        return handleApiWithFallback(
          async () => {
            const response = await fetch(url);
            return handleResponse(response);
          },
          mockPosts.find(post => post.id === parseInt(id)) || null
        );
      } else {
        const response = await fetch(url);
        return handleResponse(response);
      }
    } catch (error) {
      console.error(`API Error fetching post ${id}:`, error);
      throw error;
    }
  },
  
  // Create new post
  create: async (postData) => {
    try {
      // Use FormData for handling file uploads
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.entries(postData).forEach(([key, value]) => {
        // If it's a file object, add it directly
        if (key === 'featured_image' && value instanceof File) {
          formData.append(key, value);
        } 
        // For boolean values
        else if (typeof value === 'boolean') {
          formData.append(key, value);
        }
        // For other non-null values
        else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      const response = await fetch(ENDPOINTS.POSTS, {
        method: 'POST',
        headers: getHeaders(false), // Don't include Content-Type for file uploads
        credentials: 'include',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error creating post:', error);
      throw error;
    }
  },
  
  // Update existing post
  update: async (id, postData) => {
    try {
      // Use FormData for handling file uploads
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.entries(postData).forEach(([key, value]) => {
        // If it's a file object, add it directly
        if (key === 'featured_image' && value instanceof File) {
          formData.append(key, value);
        } 
        // For boolean values
        else if (typeof value === 'boolean') {
          formData.append(key, value);
        }
        // For other non-null values
        else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      const response = await fetch(`${ENDPOINTS.POSTS}${id}/`, {
        method: 'PATCH',
        headers: getHeaders(false), // Don't include Content-Type for file uploads
        credentials: 'include',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error updating post ${id}:`, error);
      throw error;
    }
  },
  
  // Delete post
  delete: async (id) => {
    try {
      const response = await fetch(`${ENDPOINTS.POSTS}${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      return response.status === 204; // Returns true if successfully deleted
    } catch (error) {
      console.error(`API Error deleting post ${id}:`, error);
      throw error;
    }
  },
  
  // Upload images for a post
  uploadImage: async (id, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(`${ENDPOINTS.POSTS}${id}/upload_images/`, {
        method: 'POST',
        headers: getHeaders(false), // Don't include Content-Type for file uploads
        credentials: 'include',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error uploading image for post ${id}:`, error);
      throw error;
    }
  }
};

// Comment API functions
export const commentAPI = {
  // Cache for comment counts to avoid repeated API calls
  _countsCache: {
    data: {
      all: 0,
      pending: 0,
      approved: 0,
      trash: 0
    },
    lastFetched: 0,
    isFetching: false
  },
  
  // Get all comments (with optional post ID filter)
  getAll: async (postId = null, includeReplies = false) => {
    try {
      let url = ENDPOINTS.COMMENTS;
      const params = new URLSearchParams();
      
      if (postId) {
        params.append('post', postId);
      }
      
      if (includeReplies) {
        params.append('include_replies', 'true');
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching comments:', error);
      throw error;
    }
  },
  
  // Get filtered comments with pagination
  getFilteredComments: async (params = {}) => {
    try {
      // Convert params object to URL query string
      const queryParams = new URLSearchParams();
      
      // Add all params to query string
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      const url = `${ENDPOINTS.COMMENTS}?${queryParams.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error fetching filtered comments:', error);
      throw error;
    }
  },
  
  // Get approved comments for a post
  getApproved: async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required to get approved comments');
      }
      
      const url = `${ENDPOINTS.COMMENTS}?post=${postId}&approved=true&is_trash=false&include_replies=true`;
      
      const response = await fetch(url);
      const data = await handleResponse(response);
      
      // Ensure we return a properly structured response
      return {
        results: data.results || [],
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null
      };
    } catch (error) {
      console.error(`API Error fetching approved comments for post ${postId}:`, error);
      // Return empty results on error
      return { results: [], count: 0, next: null, previous: null };
    }
  },
  
  // Get root comments (no parent) for a post
  getRootComments: async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required to get root comments');
      }
      
      const url = `${ENDPOINTS.COMMENTS}?post=${postId}&approved=true&is_trash=false&parent_id=null`;
      
      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error fetching root comments for post ${postId}:`, error);
      throw error;
    }
  },
  
  // Get replies for a specific comment
  getReplies: async (commentId) => {
    try {
      if (!commentId) {
        throw new Error('Comment ID is required to get replies');
      }
      
      const url = `${ENDPOINTS.COMMENTS}${commentId}/replies/`;
      
      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error fetching replies for comment ${commentId}:`, error);
      throw error;
    }
  },
  
  // Create new comment
  create: async (commentData) => {
    try {
      // Use FormData for handling file uploads
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.entries(commentData).forEach(([key, value]) => {
        // For boolean values
        if (typeof value === 'boolean') {
          formData.append(key, value);
        }
        // For other non-null values
        else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Ensure parent_id is properly set if this is a reply
      if (commentData.parent) {
        formData.append('parent', commentData.parent);
      }
      
      const response = await fetch(ENDPOINTS.COMMENTS, {
        method: 'POST',
        headers: getHeaders(false), // Don't include Content-Type for file uploads
        credentials: 'include',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },
  
  // Create a reply to a comment
  createReply: async (parentId, replyData) => {
    try {
      if (!parentId) {
        throw new Error('Parent comment ID is required to create a reply');
      }
      
      // Add parent_id to the reply data
      const commentData = {
        ...replyData,
        parent: parentId
      };
      
      // Use the regular create method
      return await commentAPI.create(commentData);
    } catch (error) {
      console.error(`API Error creating reply to comment ${parentId}:`, error);
      throw error;
    }
  },
  
  // Approve a comment
  approve: async (id) => {
    try {
      const response = await fetch(`${ENDPOINTS.COMMENTS}${id}/approve/`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error approving comment ${id}:`, error);
      throw error;
    }
  },
  
  // Reject a comment
  reject: async (id) => {
    try {
      const response = await fetch(`${ENDPOINTS.COMMENTS}${id}/reject/`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error rejecting comment ${id}:`, error);
      throw error;
    }
  },
  
  // Reply to a comment
  replyToComment: async (id, replyData) => {
    try {
      // Use FormData for handling file uploads
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.entries(replyData).forEach(([key, value]) => {
        // For boolean values
        if (typeof value === 'boolean') {
          formData.append(key, value);
        }
        // For other non-null values
        else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      const response = await fetch(`${ENDPOINTS.COMMENTS}${id}/reply/`, {
        method: 'POST',
        headers: getHeaders(false), // Don't include Content-Type for file uploads
        credentials: 'include',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error replying to comment ${id}:`, error);
      throw error;
    }
  },
  
  // Bulk approve comments
  bulkApprove: async (commentIds) => {
    try {
      const formData = new FormData();
      formData.append('ids', JSON.stringify(commentIds));
      
      const response = await fetch(ENDPOINTS.BULK_APPROVE, {
        method: 'POST',
        headers: getHeaders(false), // Don't include Content-Type for file uploads
        credentials: 'include',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error bulk approving comments:', error);
      throw error;
    }
  },
  
  // Bulk reject comments
  bulkReject: async (commentIds) => {
    try {
      const formData = new FormData();
      formData.append('ids', JSON.stringify(commentIds));
      
      const response = await fetch(ENDPOINTS.BULK_REJECT, {
        method: 'POST',
        headers: getHeaders(false), // Don't include Content-Type for file uploads
        credentials: 'include',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error bulk rejecting comments:', error);
      throw error;
    }
  },
  
  // Get pending comment count
  getPendingCount: async () => {
    try {
      const response = await fetch(ENDPOINTS.PENDING_COUNT);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching pending comment count:', error);
      throw error;
    }
  },
  
  // Get comment counts by status with caching
  getCounts: async () => {
    try {
      const now = Date.now();
      const cacheExpiry = 30000; // 30 seconds cache
      
      // Return cached data if it's fresh and not empty
      if (
        commentAPI._countsCache.lastFetched > 0 && 
        now - commentAPI._countsCache.lastFetched < cacheExpiry &&
        !commentAPI._countsCache.isFetching
      ) {
        return commentAPI._countsCache.data;
      }
      
      // If already fetching, wait for it to complete
      if (commentAPI._countsCache.isFetching) {
        // Wait a bit and return current cache
        await new Promise(resolve => setTimeout(resolve, 100));
        return commentAPI._countsCache.data;
      }
      
      // Fallback data
      const mockCounts = {
        all: 0,
        pending: 0,
        approved: 0,
        trash: 0
      };
      
      // Mark as fetching
      commentAPI._countsCache.isFetching = true;
      
      if (isDevelopment) {
        try {
          // Try to get real data silently (no console errors)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
          
          const response = await fetch(ENDPOINTS.COMMENT_COUNTS, {
            signal: controller.signal
          }).catch(() => null); // Catch network errors silently
          
          clearTimeout(timeoutId);
          
          if (response && response.ok) {
            const data = await response.json();
            // Update cache
            commentAPI._countsCache.data = {
              all: data.all || 0,
              pending: data.pending || 0,
              approved: data.approved || 0,
              trash: data.trash || 0
            };
            commentAPI._countsCache.lastFetched = now;
            commentAPI._countsCache.isFetching = false;
            return commentAPI._countsCache.data;
          }
          
          // If endpoint doesn't exist, use mock data but only log once
          if (!commentAPI._countsCache.lastFetched) {
            console.warn('Comments counts endpoint not found, using mock data');
          }
          
          // Update cache with mock data
          commentAPI._countsCache.data = {...mockCounts};
          commentAPI._countsCache.lastFetched = now;
          commentAPI._countsCache.isFetching = false;
          return mockCounts;
        } catch (error) {
          // Silent error in development
          commentAPI._countsCache.data = {...mockCounts};
          commentAPI._countsCache.lastFetched = now;
          commentAPI._countsCache.isFetching = false;
          return mockCounts;
        }
      } else {
        // Production mode - try to get real data
        try {
          const response = await fetch(ENDPOINTS.COMMENT_COUNTS);
          const data = await handleResponse(response);
          
          // Update cache
          commentAPI._countsCache.data = {
            all: data.all || 0,
            pending: data.pending || 0,
            approved: data.approved || 0,
            trash: data.trash || 0
          };
          commentAPI._countsCache.lastFetched = now;
          commentAPI._countsCache.isFetching = false;
          return commentAPI._countsCache.data;
        } catch (error) {
          console.error('API Error fetching comment counts:', error);
          // Return last cached data or mock data
          commentAPI._countsCache.data = commentAPI._countsCache.lastFetched > 0 
            ? commentAPI._countsCache.data 
            : {...mockCounts};
          commentAPI._countsCache.lastFetched = now;
          commentAPI._countsCache.isFetching = false;
          return commentAPI._countsCache.data;
        }
      }
    } catch (error) {
      // Reset fetching state in case of error
      commentAPI._countsCache.isFetching = false;
      console.error('API Error in getCounts:', error);
      return {
        all: 0,
        pending: 0,
        approved: 0,
        trash: 0
      };
    }
  }
};

// Export all API services and utilities
export {
  API_URL,
  MEDIA_URL,
  ENDPOINTS,
  handleApiWithFallback
}; 