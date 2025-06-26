import { useState, useEffect, useCallback, useRef } from 'react';
import { commentAPI } from '../api';

/**
 * Custom hook for managing comments for a specific blog post
 * @param {string|number} postId - The ID of the post to fetch comments for
 * @param {boolean} autoFetch - Whether to automatically fetch comments on mount
 * @returns {Object} Comment state and functions
 */
export const usePostComments = (postId, autoFetch = true) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const alreadyFetched = useRef(false);

  /**
   * Fetch approved comments for the post
   */
  const fetchComments = useCallback(async (postIdToUse = postId, pageNumber = 1, append = false) => {
    if (!postIdToUse) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching approved comments for post ${postIdToUse} (page ${pageNumber})`);
      
      // Only fetch root comments (no parent) for the initial load
      // The nested comments will be included in the response with proper nesting
      const response = await commentAPI.getApproved(postIdToUse, {
        page: pageNumber,
        parent_id: 'null', // Only get root comments
        include_replies: true // Include nested replies in the response
      });
      
      console.log('Approved comments API response:', response);
      
      // Extract the results array, with fallback to empty array
      const results = response.results || [];
      
      // For first page, replace comments; for subsequent pages, append
      if (append) {
        setComments(prev => [...prev, ...results]);
      } else {
        setComments(results);
      }
      
      // Check if there are more comments to load
      setHasMore(!!response.next);
      
      // Update current page number
      setPage(pageNumber);
      
      return results;
    } catch (err) {
      console.error(`Error fetching approved comments for post ${postIdToUse}:`, err);
      setError('Failed to load comments. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [postId]);

  /**
   * Load more comments (next page)
   */
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      await fetchComments(postId, nextPage, true);
    }
  }, [fetchComments, loading, hasMore, page, postId]);

  /**
   * Submit a new comment or reply
   */
  const submitComment = useCallback(async (commentData) => {
    if (!postId) {
      throw new Error('Post ID is required to submit a comment');
    }

    try {
      setSubmittingComment(true);
      setError(null);
      
      // Ensure the post ID is included as a string or number, not as an object
      const fullCommentData = {
        ...commentData,
        post: String(postId) // Convert to string to ensure it's not an object
      };
      
      console.log('Submitting comment:', fullCommentData);
      
      // Submit the comment
      const result = await commentAPI.create(fullCommentData);
      
      console.log('Comment submitted successfully:', result);
      
      // If it's a new top-level comment that's pre-approved, add it to the list
      if (result.approved && !result.parent) {
        setComments(currentComments => [result, ...currentComments]);
      } 
      // If it's a reply and pre-approved, we don't add it to the list
      // since it would disrupt the hierarchy - it will be loaded on refresh
      
      // Mark as submitted
      setCommentSubmitted(true);
      
      return result;
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
      throw err;
    } finally {
      setSubmittingComment(false);
    }
  }, [postId]);

  /**
   * Fetch replies for a specific comment
   */
  const fetchReplies = useCallback(async (commentId, page = 1, limit = 5) => {
    if (!commentId) return [];
    
    try {
      console.log(`Fetching replies for comment ${commentId} (page ${page})`);
      
      const response = await commentAPI.getReplies(commentId, page, limit);
      
      console.log('Replies API response:', response);
      
      return response.results || [];
    } catch (err) {
      console.error(`Error fetching replies for comment ${commentId}:`, err);
      return [];
    }
  }, []);

  /**
   * Update a comment in the comments array (e.g., after adding a reply)
   */
  const updateComment = useCallback((commentId, updatedComment) => {
    setComments(prevComments => {
      // Create a deep copy to avoid mutation
      const newComments = JSON.parse(JSON.stringify(prevComments));
      
      // Helper function to recursively find and update a comment
      const findAndUpdateComment = (comments, id, update) => {
        for (let i = 0; i < comments.length; i++) {
          if (comments[i].id === id) {
            // Found the comment, update it
            comments[i] = { ...comments[i], ...update };
            return true;
          }
          
          // Check in replies if they exist
          if (comments[i].replies && comments[i].replies.length > 0) {
            if (findAndUpdateComment(comments[i].replies, id, update)) {
              return true;
            }
          }
        }
        return false;
      };
      
      // Try to find and update the comment
      findAndUpdateComment(newComments, commentId, updatedComment);
      
      return newComments;
    });
  }, []);

  // Auto-fetch comments when postId changes
  useEffect(() => {
    if (autoFetch && postId && !alreadyFetched.current) {
      fetchComments(postId, 1, false);
      alreadyFetched.current = true;
    }
  }, [autoFetch, fetchComments, postId]);

  return {
    comments,
    loading,
    error,
    hasMore,
    commentSubmitted,
    submittingComment,
    fetchComments,
    loadMore,
    submitComment,
    setCommentSubmitted,
    fetchReplies,
    updateComment
  };
};

export default usePostComments; 