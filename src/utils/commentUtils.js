/**
 * Utility functions for handling comments in the new structure
 */

/**
 * Count total comments including replies
 * @param {Array} comments - Array of top-level comments with replies
 * @returns {number} Total count of all comments and replies
 */
export const getTotalCommentCount = (comments) => {
  if (!Array.isArray(comments)) return 0;
  
  return comments.reduce((total, comment) => {
    const replyCount = comment.replies ? comment.replies.length : 0;
    return total + 1 + replyCount; // 1 for the comment itself + replies
  }, 0);
};

/**
 * Get all comments flattened (for search/filtering purposes)
 * @param {Array} comments - Array of top-level comments with replies
 * @returns {Array} Flattened array of all comments
 */
export const getFlattenedComments = (comments) => {
  if (!Array.isArray(comments)) return [];
  
  const flattened = [];
  
  comments.forEach(comment => {
    flattened.push(comment);
    if (comment.replies && Array.isArray(comment.replies)) {
      flattened.push(...comment.replies);
    }
  });
  
  return flattened;
};

/**
 * Find a comment by ID in the nested structure
 * @param {Array} comments - Array of top-level comments with replies
 * @param {number|string} commentId - ID of the comment to find
 * @returns {Object|null} Found comment or null
 */
export const findCommentById = (comments, commentId) => {
  if (!Array.isArray(comments)) return null;
  
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }
    
    if (comment.replies && Array.isArray(comment.replies)) {
      for (const reply of comment.replies) {
        if (reply.id === commentId) {
          return reply;
        }
      }
    }
  }
  
  return null;
};

/**
 * Update a comment in the nested structure
 * @param {Array} comments - Array of top-level comments with replies
 * @param {number|string} commentId - ID of the comment to update
 * @param {Object} updates - Updates to apply to the comment
 * @returns {Array} Updated comments array
 */
export const updateCommentById = (comments, commentId, updates) => {
  if (!Array.isArray(comments)) return comments;
  
  return comments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, ...updates };
    }
    
    if (comment.replies && Array.isArray(comment.replies)) {
      const updatedReplies = comment.replies.map(reply => {
        if (reply.id === commentId) {
          return { ...reply, ...updates };
        }
        return reply;
      });
      
      return { ...comment, replies: updatedReplies };
    }
    
    return comment;
  });
};

/**
 * Add a reply to a parent comment
 * @param {Array} comments - Array of top-level comments with replies
 * @param {number|string} parentId - ID of the parent comment
 * @param {Object} reply - Reply object to add
 * @returns {Array} Updated comments array
 */
export const addReplyToComment = (comments, parentId, reply) => {
  if (!Array.isArray(comments)) return comments;
  
  return comments.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), reply],
        reply_count: (comment.reply_count || 0) + 1
      };
    }
    return comment;
  });
};

/**
 * Remove a comment or reply from the nested structure
 * @param {Array} comments - Array of top-level comments with replies
 * @param {number|string} commentId - ID of the comment to remove
 * @returns {Array} Updated comments array
 */
export const removeCommentById = (comments, commentId) => {
  if (!Array.isArray(comments)) return comments;
  
  return comments.reduce((acc, comment) => {
    // If this is the comment to remove, don't include it
    if (comment.id === commentId) {
      return acc;
    }
    
    // Check if we need to remove a reply
    if (comment.replies && Array.isArray(comment.replies)) {
      const filteredReplies = comment.replies.filter(reply => reply.id !== commentId);
      const updatedComment = {
        ...comment,
        replies: filteredReplies,
        reply_count: filteredReplies.length
      };
      acc.push(updatedComment);
    } else {
      acc.push(comment);
    }
    
    return acc;
  }, []);
};

/**
 * Sort comments by date (newest first)
 * @param {Array} comments - Array of comments to sort
 * @returns {Array} Sorted comments array
 */
export const sortCommentsByDate = (comments) => {
  if (!Array.isArray(comments)) return comments;
  
  return [...comments].sort((a, b) => {
    const dateA = new Date(a.created_at || a.date || 0);
    const dateB = new Date(b.created_at || b.date || 0);
    return dateB - dateA; // Newest first
  });
};

/**
 * Filter comments by approval status
 * @param {Array} comments - Array of comments to filter
 * @param {boolean} approved - Whether to show approved or pending comments
 * @returns {Array} Filtered comments array
 */
export const filterCommentsByApproval = (comments, approved = true) => {
  if (!Array.isArray(comments)) return comments;
  
  return comments.filter(comment => {
    const isApproved = comment.approved === true || comment.status === 'approved';
    return approved ? isApproved : !isApproved;
  }).map(comment => ({
    ...comment,
    replies: comment.replies ? comment.replies.filter(reply => {
      const replyApproved = reply.approved === true || reply.status === 'approved';
      return approved ? replyApproved : !replyApproved;
    }) : []
  }));
};

/**
 * Get comment statistics
 * @param {Array} comments - Array of top-level comments with replies
 * @returns {Object} Statistics object
 */
export const getCommentStats = (comments) => {
  if (!Array.isArray(comments)) {
    return {
      total: 0,
      topLevel: 0,
      replies: 0,
      approved: 0,
      pending: 0
    };
  }
  
  let topLevel = 0;
  let replies = 0;
  let approved = 0;
  let pending = 0;
  
  comments.forEach(comment => {
    topLevel++;
    
    if (comment.approved === true || comment.status === 'approved') {
      approved++;
    } else {
      pending++;
    }
    
    if (comment.replies && Array.isArray(comment.replies)) {
      replies += comment.replies.length;
      
      comment.replies.forEach(reply => {
        if (reply.approved === true || reply.status === 'approved') {
          approved++;
        } else {
          pending++;
        }
      });
    }
  });
  
  return {
    total: topLevel + replies,
    topLevel,
    replies,
    approved,
    pending
  };
};

export default {
  getTotalCommentCount,
  getFlattenedComments,
  findCommentById,
  updateCommentById,
  addReplyToComment,
  removeCommentById,
  sortCommentsByDate,
  filterCommentsByApproval,
  getCommentStats
};