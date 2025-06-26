import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from './Button';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { sanitize } from '../utils/sanitize';
import AdminReplyForm from './AdminReplyForm';
import CommentForm from './CommentForm';
import axios from 'axios';

const CommentContainer = styled.div`
  background-color: ${props => {
    if (props.$isTrash) return '#f8f9fa';
    return props.$approved ? '#ffffff' : '#fff8f8';
  }};
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => {
    if (props.$isTrash) return '#6c757d';
    return props.$approved ? '#28a745' : '#dc3545';
  }};
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  opacity: ${props => props.$isTrash ? 0.8 : 1};
  margin-left: ${props => props.$nestingLevel > 0 ? `${props.$nestingLevel * 20}px` : '0'};
  width: ${props => props.$nestingLevel > 0 ? `calc(100% - ${props.$nestingLevel * 20}px)` : '100%'};
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: 600;
  color: #333;
`;

const AuthorEmail = styled.span`
  color: #6c757d;
  font-size: 0.8rem;
`;

const Date = styled.span`
  color: #6c757d;
  font-size: 0.875rem;
  transition: color 0.3s ease;
`;

const Content = styled.div`
  margin: 0 0 1rem 0;
  color: #495057;
  line-height: 1.5;
  white-space: pre-line;
  transition: color 0.3s ease;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const BadgeContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  background-color: ${props => {
    if (props.$isTrash) return '#e9ecef';
    return props.$approved ? '#d4edda' : '#f8d7da';
  }};
  color: ${props => {
    if (props.$isTrash) return '#6c757d';
    return props.$approved ? '#155724' : '#721c24';
  }};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const AdminReplyContainer = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #e9f5ff;
  border-radius: 6px;
  border-left: 3px solid #007bff;
`;

const AdminReplyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const AdminLabel = styled.span`
  font-weight: 600;
  color: #007bff;
  font-size: 0.875rem;
`;

const AdminReplyContent = styled.div`
  color: #333;
  line-height: 1.5;
  white-space: pre-line;
`;

const ActionButton = styled(Button)`
  margin-top: 0.5rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
`;

const PostInfo = styled.div`
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #6c757d;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
`;

const PostTitle = styled.a`
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const InlineReplyContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eaeaea;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
`;

const RepliesContainer = styled.div`
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px solid #e9ecef;
`;

const RepliesToggle = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  font-size: 0.875rem;
  padding: 0.25rem 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  
  &:hover {
    color: #495057;
    text-decoration: underline;
  }
  
  &:focus {
    outline: none;
  }
`;

const LoadMoreButton = styled.button`
  background: none;
  border: 1px solid #ced4da;
  border-radius: 4px;
  color: #6c757d;
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NestingIndicator = styled.div`
  display: inline-block;
  margin-right: 0.5rem;
  color: #6c757d;
  font-size: 0.8rem;
`;

const Comment = ({ 
  comment, 
  onApprove, 
  onReject,
  onReply,
  onTrash,
  onRestore,
  onDelete,
  showActionButtons = false,
  showPostInfo = false,
  onCommentSubmitted,
  nestingLevel = 0,
  maxNestingLevel = 5
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showInlineReply, setShowInlineReply] = useState(false);
  const [currentComment, setCurrentComment] = useState(comment);
  const [showReplies, setShowReplies] = useState(nestingLevel < 2); // Auto-expand first two levels
  const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(
    currentComment.reply_count > (currentComment.replies?.length || 0)
  );
  
  if (!currentComment) return null;
  
  const formattedDate = formatDate(currentComment.created_at);
  const relativeTime = getRelativeTime(currentComment.created_at);
  
  // Sanitize content
  const sanitizedContent = sanitize(currentComment.content);
  const authorName = currentComment.author_name || 'Anonymous';
  const isTrash = currentComment.is_trash || false;
  
  // Handle reply submission callback
  const handleReplied = (updatedComment) => {
    if (updatedComment) {
      // If we received a direct comment object, update the current comment
      setCurrentComment(prev => ({
        ...prev,
        admin_reply: updatedComment.admin_reply || (updatedComment.comment?.admin_reply) || prev.admin_reply
      }));
    }
    setShowReplyForm(false);
    setShowInlineReply(false);
    
    // Only notify parent component if needed and if the API call wasn't already made
    // If updatedComment contains a 'comment' property, it means the API call was already made by AdminReplyForm
    if (onReply && !updatedComment?.comment) {
      onReply(updatedComment || currentComment);
    }
  };
  
  // Handle inline reply submission
  const handleInlineReplySubmitted = async (commentData) => {
    try {
      // Call the parent's onCommentSubmitted function
      if (onCommentSubmitted) {
        const newComment = await onCommentSubmitted(commentData);
        
        // Update the current comment's replies
        if (newComment) {
          setCurrentComment({
            ...currentComment,
            replies: currentComment.replies ? [...currentComment.replies, newComment] : [newComment],
            reply_count: (currentComment.reply_count || 0) + 1
          });
        }
      }
      // Close the inline reply form
      setShowReplyForm(false);
      return true;
    } catch (error) {
      console.error("Error submitting reply:", error);
      throw error;
    }
  };
  
  // Function to load more replies
  const loadMoreReplies = async () => {
    if (loadingMoreReplies || !hasMoreReplies) return;
    
    try {
      setLoadingMoreReplies(true);
      const nextPage = page + 1;
      
      // Make API call to get more replies
      const response = await axios.get(`/api/comments/${currentComment.id}/paginated_replies/?page=${nextPage}&limit=5&max_depth=2`);
      
      if (response.data && response.data.results) {
        // Update the current comment with new replies
        setCurrentComment({
          ...currentComment,
          replies: [...(currentComment.replies || []), ...response.data.results]
        });
        
        setPage(nextPage);
        setHasMoreReplies(response.data.current_page < response.data.total_pages);
      }
    } catch (error) {
      console.error("Error loading more replies:", error);
    } finally {
      setLoadingMoreReplies(false);
    }
  };
  
  return (
    <CommentContainer 
      $approved={currentComment.approved} 
      $isTrash={isTrash}
      $nestingLevel={nestingLevel}
    >
      {showPostInfo && currentComment.post && (
        <PostInfo>
          On post: <PostTitle href={`/posts/${currentComment.post_title?.slug || currentComment.post?.slug || currentComment.post?.id || ''}`}>
            {currentComment.post_title?.title || currentComment.post?.title || (currentComment.post?.id ? `Post #${currentComment.post.id}` : 'Unknown Post')}
          </PostTitle>
        </PostInfo>
      )}
      
      <CommentHeader>
        <AuthorInfo>
          <AuthorName>
            {nestingLevel > 0 && <NestingIndicator>↳</NestingIndicator>}
            {authorName}
          </AuthorName>
          {currentComment.author_email && (
            <AuthorEmail>{currentComment.author_email}</AuthorEmail>
          )}
        </AuthorInfo>
        <Date title={formattedDate}>{relativeTime || formattedDate}</Date>
      </CommentHeader>
      
      <Content dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      
      {/* Display admin reply if it exists */}
      {currentComment.admin_reply && (
        <AdminReplyContainer>
          <AdminReplyHeader>
            <AdminLabel>Admin Reply</AdminLabel>
          </AdminReplyHeader>
          <AdminReplyContent>
            {currentComment.admin_reply}
          </AdminReplyContent>
        </AdminReplyContainer>
      )}
      
      <BadgeContainer>
        {showActionButtons && (
          <StatusBadge $approved={currentComment.approved} $isTrash={isTrash}>
            {isTrash ? 'In Trash' : (currentComment.approved ? 'Approved' : 'Pending Approval')}
          </StatusBadge>
        )}
        
        {/* Action buttons for admin */}
        {showActionButtons && (
          <ButtonContainer>
            {!isTrash && !currentComment.approved && (
              <ActionButton 
                variant="success" 
                size="small" 
                onClick={() => onApprove && onApprove(currentComment.id)}
              >
                Approve
              </ActionButton>
            )}
            
            {!isTrash && currentComment.approved && (
              <ActionButton 
                variant="warning" 
                size="small" 
                onClick={() => onReject && onReject(currentComment.id)}
              >
                Unapprove
              </ActionButton>
            )}
            
            {!isTrash && (
              <ActionButton 
                variant="danger" 
                size="small" 
                onClick={() => onTrash && onTrash(currentComment.id)}
              >
                Trash
              </ActionButton>
            )}
            
            {isTrash && (
              <>
                <ActionButton 
                  variant="secondary" 
                  size="small" 
                  onClick={() => onRestore && onRestore(currentComment.id)}
                >
                  Restore
                </ActionButton>
                
                <ActionButton 
                  variant="danger" 
                  size="small" 
                  onClick={() => onDelete && onDelete(currentComment.id)}
                >
                  Delete
                </ActionButton>
              </>
            )}
            
            <ActionButton 
              variant="primary" 
              size="small" 
              onClick={() => setShowInlineReply(!showInlineReply)}
            >
              {showInlineReply ? 'Cancel' : 'Reply'}
            </ActionButton>
          </ButtonContainer>
        )}
      </BadgeContainer>
      
      {/* Admin reply form */}
      {showInlineReply && showActionButtons && (
        <InlineReplyContainer>
          <AdminReplyForm 
            comment={currentComment.id}
            existingReply={currentComment.admin_reply || ''}
            onReplied={handleReplied}
          />
        </InlineReplyContainer>
      )}
      
      {/* Replies section */}
      {currentComment.replies && currentComment.replies.length > 0 && (
        <>
          <RepliesToggle onClick={() => setShowReplies(!showReplies)}>
            {showReplies ? 'Hide' : 'Show'} {currentComment.reply_count} {currentComment.reply_count === 1 ? 'reply' : 'replies'}
          </RepliesToggle>
          
          {showReplies && (
            <RepliesContainer>
              {currentComment.replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onApprove={onApprove}
                  onReject={onReject}
                  onReply={onReply}
                  onTrash={onTrash}
                  onRestore={onRestore}
                  onDelete={onDelete}
                  showActionButtons={showActionButtons}
                  onCommentSubmitted={onCommentSubmitted}
                  nestingLevel={nestingLevel + 1}
                  maxNestingLevel={maxNestingLevel}
                />
              ))}
              
              {hasMoreReplies && (
                <LoadMoreButton 
                  onClick={loadMoreReplies} 
                  disabled={loadingMoreReplies}
                >
                  {loadingMoreReplies ? 'Loading...' : 'Load more replies'}
                </LoadMoreButton>
              )}
            </RepliesContainer>
          )}
        </>
      )}
      
      {/* Reply form for users */}
      {!showActionButtons && (
        <ActionButton 
          variant="text" 
          onClick={() => setShowReplyForm(!showReplyForm)}
          size="small"
        >
          {showReplyForm ? 'Cancel' : 'Reply'}
        </ActionButton>
      )}
      
      {/* Reply form */}
      {showReplyForm && nestingLevel < maxNestingLevel && !showActionButtons && (
        <InlineReplyContainer>
          <CommentForm
            postId={currentComment.post}
            onCommentSubmitted={handleInlineReplySubmitted}
            replyTo={currentComment}
            onCancelReply={() => setShowReplyForm(false)}
            isInline={true}
          />
        </InlineReplyContainer>
      )}
    </CommentContainer>
  );
};

export default Comment; 