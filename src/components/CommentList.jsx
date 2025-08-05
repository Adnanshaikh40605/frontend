import { useState, useEffect } from 'react';
import { commentAPI } from '../api/apiService';

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        
        // If postId is provided, get comments for that post (only top-level)
        let data;
        if (postId) {
          data = await commentAPI.getApproved(postId, { 
            page: page, 
            limit: 10 
          });
        } else {
          // Otherwise get all approved comments (only top-level)
          data = await commentAPI.getFilteredComments({
            approved: true,
            page: page,
            limit: 10
          });
        }
        
        // Calculate total pages if pagination info is available
        const count = data.count || data.results?.length || 0;
        const calculatedTotalPages = Math.ceil(count / 10);
        
        console.log(`Loaded ${data.results?.length || 0} top-level comments with nested replies`);
        setComments(data.results || []);
        setTotalPages(calculatedTotalPages || 1);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError('Failed to load comments. Please try again later.');
        setLoading(false);
      }
    };

    fetchComments();
  }, [page, postId]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="comments-container">
      <h2>Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <>
          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment-item">
                <div className="comment-author">{comment.author_name || comment.author || 'Anonymous'}</div>
                <div className="comment-date">
                  {new Date(comment.created_at).toLocaleDateString()}
                </div>
                <div className="comment-content">{comment.content}</div>
                {comment.replies && comment.replies.length > 0 && (
                  <div className="comment-replies">
                    <div className="replies-count">
                      {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </div>
                    <ul className="reply-list">
                      {comment.replies.map((reply) => (
                        <li key={reply.id} className="reply-item">
                          <div className="reply-author">{reply.author_name || reply.author || 'Anonymous'}</div>
                          <div className="reply-date">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </div>
                          <div className="reply-content">{reply.content}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={handlePrevPage} 
                disabled={page === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={page === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentList; 