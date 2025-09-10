// apiService.js - Contains API service functions organized by resource type

import { ENDPOINTS, MEDIA_URL } from './apiEndpoints';
import { getHeaders, handleResponse, handleApiWithFallback } from './apiUtils';
import { mockPosts, mockComments, createLocalImageUrl } from './apiMocks';
import { isAuthenticated, getAuthToken } from '../utils/authUtils';
import { handleApiError, validateFileUpload, retryRequest } from '../utils/errorHandler';

// Determine if we're in development mode
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

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

  // Upload file with validation
  uploadFile: async (file, options = {}) => {
    try {
      // Validate file
      const validation = validateFileUpload(file, options);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(ENDPOINTS.MEDIA_UPLOAD, {
        method: 'POST',
        headers: getHeaders(false), // Don't set Content-Type for FormData
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error, { showNotification: true });
      throw error;
    }
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
            credentials: 'same-origin',
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
          credentials: 'same-origin',
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

  // Get single post by slug
  getBySlug: async (slug) => {
    try {
      // Use the correct backend endpoint for slug-based lookups
      const url = `${ENDPOINTS.POSTS}by-slug/${slug}/`;

      console.log('Fetching post with URL:', url);

      if (isDevelopment) {
        return handleApiWithFallback(
          async () => {
            const response = await fetch(url);
            if (!response.ok) {
              console.error(`API Error: ${response.status} ${response.statusText}`);
              throw new Error(`Failed to fetch post: ${response.statusText}`);
            }
            return handleResponse(response);
          },
          mockPosts.find(post => post.slug === slug) || null
        );
      } else {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`API Error: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch post: ${response.statusText}`);
        }
        return handleResponse(response);
      }
    } catch (error) {
      console.error(`API Error fetching post ${slug}:`, error);
      throw error;
    }
  },

  // For backward compatibility
  getById: async (id) => {
    console.warn('postAPI.getById is deprecated, use getBySlug instead');
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

  // Create a new post
  create: async (postData) => {
    try {
      // Use FormData for handling file uploads
      const formData = new FormData();

      // Add all fields to FormData
      Object.entries(postData).forEach(([key, value]) => {
        // Handle array of files (for additional_images)
        if (key === 'additional_images' && Array.isArray(value)) {
          value.forEach((file, index) => {
            formData.append(`additional_images[${index}]`, file);
          });
        }
        // Handle featured image
        else if (key === 'featured_image' && value instanceof File) {
          formData.append('featured_image', value);
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

      // Get headers with authentication token
      const headers = await getHeaders(false); // Don't include Content-Type for file uploads

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(ENDPOINTS.POSTS, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error creating post:', error);
      throw error;
    }
  },

  // Update post
  update: async (slug, postData) => {
    try {
      // Use FormData for handling file uploads
      const formData = new FormData();

      // Add all fields to FormData
      Object.entries(postData).forEach(([key, value]) => {
        // Handle array of files (for additional_images)
        if (key === 'additional_images' && Array.isArray(value)) {
          value.forEach((file, index) => {
            if (file instanceof File) {
              formData.append(`additional_images[${index}]`, file);
            }
          });
        }
        // Handle featured image
        else if (key === 'featured_image' && value instanceof File) {
          formData.append('featured_image', value);
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

      // Get headers with authentication token
      const headers = await getHeaders(false); // Don't include Content-Type for file uploads

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Try different update methods in sequence
      const updateMethods = [
        // Method 1: PUT to specific endpoint
        async () => {
          console.log('Trying PUT to specific endpoint...');
          const response = await fetch(`${ENDPOINTS.POSTS}${slug}/`, {
            method: 'PUT',
            headers: headers,
            credentials: 'same-origin',
            body: formData
          });
          return handleResponse(response);
        },

        // Method 2: PATCH to specific endpoint
        async () => {
          console.log('Trying PATCH to specific endpoint...');
          const response = await fetch(`${ENDPOINTS.POSTS}${slug}/`, {
            method: 'PATCH',
            headers: headers,
            credentials: 'same-origin',
            body: formData
          });
          return handleResponse(response);
        }
      ];

      // Try each method in sequence until one works
      let lastError = null;
      for (const method of updateMethods) {
        try {
          return await method();
        } catch (error) {
          console.log('Update method failed:', error.message);
          lastError = error;
          // Continue to the next method
        }
      }

      // If we get here, all methods failed
      throw lastError || new Error('All update methods failed');
    } catch (error) {
      console.error(`API Error updating post ${slug}:`, error);
      throw error;
    }
  },

  // Delete post
  delete: async (id) => {
    try {
      // Make sure we have proper authentication headers
      const headers = getHeaders();

      // Check authentication status
      if (!isAuthenticated()) {
        throw new Error('Authentication required. Please log in and try again.');
      }

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Check if we're in development mode for better debugging
      if (isDevelopment) {
        console.log(`Attempting to delete post with ID: ${id}`);
        console.log(`Using endpoint: ${ENDPOINTS.POSTS}${id}/delete/`);
        console.log('Headers:', headers);
        console.log('Authentication token available:', !!token);
      }

      // Use the POST to /delete/ endpoint directly instead of trying DELETE first
      // This avoids CORS issues with the DELETE method
      try {
        const response = await fetch(`${ENDPOINTS.POSTS}${id}/delete/`, {
          method: 'POST',
          headers: headers,
          credentials: 'same-origin'
        });

        // Check if the request was successful
        if (response.ok) {
          const result = await handleResponse(response);
          console.log('Delete response:', result);
          return true;
        }

        // If we get a 401, we need to handle authentication
        if (response.status === 401) {
          console.warn('Authentication required for delete operation');
          throw new Error('Authentication required. Please log in and try again.');
        }

        // If there was an error, throw it to be caught by the outer catch
        throw new Error(`Failed to delete post: ${response.status} ${response.statusText}`);
      } catch (innerError) {
        console.error(`Error in delete operation: ${innerError.message}`);
        throw innerError;
      }
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
        credentials: 'same-origin',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error uploading image for post ${id}:`, error);
      throw error;
    }
  },

  // Get related posts for a specific post
  getRelatedPosts: async (slug, limit = 4) => {
    try {
      const params = new URLSearchParams();
      if (limit) {
        params.append('limit', limit);
      }

      const url = `${ENDPOINTS.POSTS}${slug}/related/${params.toString() ? `?${params.toString()}` : ''}`;

      if (isDevelopment) {
        return handleApiWithFallback(
          async () => {
            const response = await fetch(url);
            return handleResponse(response);
          },
          { results: [], count: 0 }
        );
      } else {
        const response = await fetch(url);
        return handleResponse(response);
      }
    } catch (error) {
      console.error(`API Error fetching related posts for ${slug}:`, error);
      throw error;
    }
  }
};

// Comment API functions
export const commentAPI = {
  // Get all comments (with optional post ID filter)
  getAll: async (postId = null) => {
    try {
      let url = ENDPOINTS.COMMENTS;
      if (postId) {
        url += `?post=${postId}`;
      }
      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching comments:', error);
      throw error;
    }
  },

  // Get approved comments for a post (only top-level comments with nested replies)
  getApproved: async (postId, options = {}) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required to get approved comments');
      }

      // Build query parameters - backend now filters for parent__isnull=True automatically
      const params = new URLSearchParams();
      params.append('post', postId);
      params.append('approved', 'true');
      params.append('is_trash', 'false');

      // Add optional parameters
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);

      const url = `${ENDPOINTS.COMMENTS}?${params.toString()}`;

      console.log(`Fetching approved top-level comments for post ${postId} from: ${url}`);

      const response = await fetch(url);
      const data = await handleResponse(response);

      // The backend now returns only top-level comments with nested replies in the 'replies' field
      console.log(`Received ${data.results?.length || 0} top-level comments with nested replies`);

      return data;
    } catch (error) {
      console.error(`API Error fetching approved comments for post ${postId}:`, error);
      // Return empty results on error
      return { results: [], count: 0, next: null, previous: null };
    }
  },

  // Get replies for a specific comment
  getReplies: async (commentId, page = 1, limit = 5) => {
    try {
      if (!commentId) {
        throw new Error('Comment ID is required to get replies');
      }

      const url = `${ENDPOINTS.COMMENTS}${commentId}/paginated_replies/?page=${page}&limit=${limit}`;

      console.log(`Fetching replies for comment ${commentId} from: ${url}`);

      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error fetching replies for comment ${commentId}:`, error);
      // Return empty results on error
      return { results: [], count: 0, total_pages: 0, current_page: page };
    }
  },

  // Get all comments for a post (both approved and pending) - only top-level comments
  getAllForPost: async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required to get comments');
      }

      const url = `${ENDPOINTS.COMMENTS}all/?post=${postId}`;

      if (isDevelopment) {
        return handleApiWithFallback(
          async () => {
            const response = await fetch(url);
            const data = await handleResponse(response);

            // Backend now returns only top-level comments with nested replies
            console.log(`Received ${data.approved?.length || 0} approved and ${data.pending?.length || 0} pending top-level comments`);

            return data;
          },
          mockComments
        );
      } else {
        const response = await fetch(url);
        const data = await handleResponse(response);

        // Backend now returns only top-level comments with nested replies
        console.log(`Received ${data.approved?.length || 0} approved and ${data.pending?.length || 0} pending top-level comments`);

        return data;
      }
    } catch (error) {
      console.error(`API Error fetching all comments for post ${postId}:`, error);
      // Return empty results on error
      return { approved: [], pending: [], total: 0 };
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

      const headers = await getHeaders(false); // Get headers with token refresh if needed

      const response = await fetch(ENDPOINTS.COMMENTS, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Approve a comment
  approve: async (id) => {
    try {
      // Get headers with authentication token
      const headers = await getHeaders();

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${ENDPOINTS.COMMENTS}${id}/approve/`, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin'
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
      // Get headers with authentication token
      const headers = await getHeaders();

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${ENDPOINTS.COMMENTS}${id}/reject/`, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin'
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error rejecting comment ${id}:`, error);
      throw error;
    }
  },

  // Bulk approve comments
  bulkApprove: async (commentIds) => {
    try {
      const formData = new FormData();
      formData.append('ids', JSON.stringify(commentIds));

      // Get headers with authentication token
      const headers = await getHeaders(false); // Don't include Content-Type for file uploads

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(ENDPOINTS.BULK_APPROVE, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin',
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

      // Get headers with authentication token
      const headers = await getHeaders(false); // Don't include Content-Type for file uploads

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(ENDPOINTS.BULK_REJECT, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin',
        body: formData
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error bulk rejecting comments:', error);
      throw error;
    }
  },

  // Get filtered comments with pagination and status filtering
  getFilteredComments: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${ENDPOINTS.COMMENTS}${queryParams ? `?${queryParams}` : ''}`;

      console.log('Fetching filtered comments with URL:', url);

      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching filtered comments:', error);
      throw error;
    }
  },

  // Get ALL comments including replies for admin management
  getAdminComments: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${ENDPOINTS.COMMENTS}admin_all/${queryParams ? `?${queryParams}` : ''}`;

      console.log('Fetching admin comments with URL:', url);

      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching admin comments:', error);
      throw error;
    }
  },

  // Get counts of comments by status
  getCounts: async () => {
    try {
      console.log('Fetching comment counts from:', ENDPOINTS.COMMENT_COUNTS);
      const response = await fetch(ENDPOINTS.COMMENT_COUNTS);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching comment counts:', error);
      // Return empty results on error
      return { all: 0, pending: 0, approved: 0, trash: 0 };
    }
  },

  // Trash a comment
  trashComment: async (id) => {
    try {
      // Get headers with authentication token
      const headers = await getHeaders();

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${ENDPOINTS.COMMENTS}${id}/trash/`, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin'
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error trashing comment ${id}:`, error);
      throw error;
    }
  },

  // Restore a comment from trash
  restoreComment: async (id) => {
    try {
      // Get headers with authentication token
      const headers = await getHeaders();

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${ENDPOINTS.COMMENTS}${id}/restore/`, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin'
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error restoring comment ${id}:`, error);
      throw error;
    }
  },

  // Delete a comment permanently
  deleteComment: async (id) => {
    try {
      // Get headers with authentication token
      const headers = await getHeaders();

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${ENDPOINTS.COMMENTS}${id}/delete/`, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin'
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error deleting comment ${id}:`, error);
      throw error;
    }
  },

  // Reply to a comment
  replyToComment: async (id, replyData) => {
    try {
      // Validate content is not empty
      const content = replyData.content?.trim() || '';
      if (!content) {
        throw new Error('Reply content cannot be empty');
      }

      // Get headers with authentication token and include Content-Type
      const headers = await getHeaders(true); // Set to true to include Content-Type

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // We've fixed the backend to properly handle admin_reply as a text field
      // The replyData.admin_reply flag now tells the backend this is an admin reply
      const dataToSend = {
        content: content, // The actual reply text content
        author_name: 'Admin', // Add author name for admin replies
        approved: true, // Auto-approve admin replies
        admin_reply: true // Flag to identify this as an admin reply
      };

      console.log('Sending reply data:', dataToSend);

      const response = await fetch(`${ENDPOINTS.COMMENTS}${id}/reply/`, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin',
        body: JSON.stringify(dataToSend)
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error replying to comment ${id}:`, error);
      throw error;
    }
  },
};

// Categories API functions
export const categoriesAPI = {
  // Get all categories
  getAll: async () => {
    try {
      const url = ENDPOINTS.CATEGORIES;

      if (isDevelopment) {
        return handleApiWithFallback(
          async () => {
            const response = await fetch(url);
            return handleResponse(response);
          },
          {
            results: [
              { id: 1, name: 'Technology', slug: 'technology', description: 'Posts about technology, programming, and software development', color: '#007bff', post_count: 0 },
              { id: 2, name: 'Web Development', slug: 'web-development', description: 'Frontend and backend web development tutorials and tips', color: '#28a745', post_count: 0 },
              { id: 3, name: 'Python', slug: 'python', description: 'Python programming language tutorials and best practices', color: '#ffc107', post_count: 0 },
              { id: 4, name: 'JavaScript', slug: 'javascript', description: 'JavaScript programming, frameworks, and libraries', color: '#fd7e14', post_count: 0 },
              { id: 5, name: 'React', slug: 'react', description: 'React.js tutorials, components, and best practices', color: '#20c997', post_count: 0 },
              { id: 6, name: 'Django', slug: 'django', description: 'Django framework tutorials and development tips', color: '#6f42c1', post_count: 0 }
            ],
            count: 6
          }
        );
      } else {
        const response = await fetch(url);
        return handleResponse(response);
      }
    } catch (error) {
      console.error('API Error fetching categories:', error);
      throw error;
    }
  },

  // Create a new category
  create: async (categoryData) => {
    try {
      // Get headers with authentication token
      const headers = await getHeaders(true); // Include Content-Type for JSON

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(ENDPOINTS.CATEGORIES, {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin',
        body: JSON.stringify(categoryData)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('API Error creating category:', error);
      throw error;
    }
  },

  // Update an existing category
  update: async (id, categoryData) => {
    try {
      // Get headers with authentication token
      const headers = await getHeaders(true); // Include Content-Type for JSON

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${ENDPOINTS.CATEGORIES}${id}/`, {
        method: 'PATCH',
        headers: headers,
        credentials: 'same-origin',
        body: JSON.stringify(categoryData)
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`API Error updating category ${id}:`, error);
      throw error;
    }
  },

  // Delete a category
  delete: async (id) => {
    try {
      // Get headers with authentication token
      const headers = await getHeaders();

      // Explicitly add authentication token
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${ENDPOINTS.CATEGORIES}${id}/`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'same-origin'
      });

      return response.status === 204; // Returns true if successfully deleted
    } catch (error) {
      console.error(`API Error deleting category ${id}:`, error);
      throw error;
    }
  },

  // Get category by slug
  getBySlug: async (slug) => {
    try {
      const url = `${ENDPOINTS.CATEGORIES}${slug}/`;

      if (isDevelopment) {
        return handleApiWithFallback(
          async () => {
            const response = await fetch(url);
            return handleResponse(response);
          },
          {
            id: 1,
            name: 'Technology',
            slug: 'technology',
            description: 'Posts about technology, programming, and software development',
            color: '#007bff',
            post_count: 0,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        );
      } else {
        const response = await fetch(url);
        return handleResponse(response);
      }
    } catch (error) {
      console.error(`API Error fetching category ${slug}:`, error);
      throw error;
    }
  }
};