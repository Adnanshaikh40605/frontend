import { useState } from 'react';
import styled from 'styled-components';
import Button from './Button';
import { commentAPI } from '../api/apiService';

const ReplyForm = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007bff;
`;

const ReplyTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  min-height: 100px;
  margin-bottom: 0.75rem;
  font-family: inherit;
  resize: vertical;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const AdminReplyForm = ({ comment, existingReply = '', onReplied }) => {
  // Extract comment ID from either a comment object or direct ID
  const commentId = comment?.id || comment;
  
  const [reply, setReply] = useState(existingReply || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReply = async () => {
    if (!reply.trim()) return;
    
    if (!commentId) {
      console.error('Invalid comment ID:', comment);
      setError('Invalid comment ID');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Format data for API call - content field with the reply text
      // admin_reply set to true to flag this as an admin reply
      const replyContent = reply.trim();
      const replyData = { 
        content: replyContent,
        admin_reply: true // Boolean flag to indicate this is an admin reply
      };
      
      console.log('Sending admin reply:', replyData);
      
      // Use the reply action endpoint
      const response = await commentAPI.replyToComment(commentId, replyData);
      
      // Make sure we got a valid response
      if (!response) {
        throw new Error('No response from server');
      }
      
      console.log('Reply response:', response);
      
      // Notify parent component about successful reply
      if (onReplied && typeof onReplied === 'function') {
        // Pass the complete response to prevent duplicate API calls
        onReplied(response);
      }
    } catch (err) {
      console.error('Failed to add reply:', err);
      setError('Failed to add reply. Please try again.');
      // If there was an error, still call onReplied to close the form
      if (onReplied && typeof onReplied === 'function') {
        onReplied();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReplyForm>
      <h4>Admin Reply</h4>
      <ReplyTextarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Write a reply to this comment..."
        disabled={loading}
      />
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <ButtonContainer>
        <Button 
          $variant="secondary" 
          onClick={() => onReplied()}
          size="small"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          $variant="primary" 
          onClick={handleReply}
          size="small"
          disabled={loading || !reply.trim()}
        >
          {loading ? 'Saving...' : existingReply ? 'Update Reply' : 'Submit Reply'}
        </Button>
      </ButtonContainer>
    </ReplyForm>
  );
};

export default AdminReplyForm; 